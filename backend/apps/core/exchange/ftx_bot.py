import concurrent
# from query_counter.decorators import queries_counter
import json
import logging
import os
import sys
import time
from pprint import pprint

from django.db.models import Q, Prefetch
from django.utils import timezone
import uuid

from core.exchange.utils import format_float
from core.exchange import ftx
from core.tasks import send_log
from core.utils.helpers import random_array
from core.utils.logs import bold, red
from main.models import FTX, Trade
from users.models import User

logger = logging.getLogger('bot')


class FTXBot:
    # @queries_counter
    def run(self):
        from main.models import SymbolSetting

        symbols = ftx.get_markets()
        # print(symbols.get('result', []))
        precisions = {}
        symbol_precisions = []

        for i in symbols.get('result', []):
            amount_precision = i.get('size_increment')
            price_precision = i.get('price_increment')
            min_price = i.get('minProvideSize')

            precisions[i.get('name')] = {'amount': amount_precision, 'price': price_precision, 'min_price': min_price}

            symbol_precisions.append(
                SymbolSetting(
                    amount_precision=amount_precision,
                    price_precision=price_precision,
                    min_price=min_price,
                    symbol=i.get('name'),
                    exchange=FTX
                )
            )

        SymbolSetting.objects.filter(exchange=FTX).delete()
        SymbolSetting.objects.bulk_create(symbol_precisions)

        while not time.sleep(0.1):
            started_at = timezone.now()

            users = User.objects.filter(
                trades__isnull=False,
                trades__is_completed=False,
                trades__exchange=FTX
            )

            users = users.prefetch_related(
                Prefetch(
                    'trades',
                    queryset=Trade.objects.filter(
                        Q(completed_at__isnull=True) | Q(completed_at__lte=timezone.now()),
                        is_completed=False,
                        is_canceled=False,
                        exchange=FTX
                    ).order_by('grid_bot')
                ),
                'trades__ladder_trades'
            ).distinct('id')

            try:
                costs_res = ftx.get_markets()
            except:
                print('error with loading tickers')
                time.sleep(1)
                continue

            costs = {}

            for cost in costs_res.get('result', []):
                costs[cost['name']] = cost

            del costs_res

            users_count = len(users)

            if users_count > 0:
                with concurrent.futures.ThreadPoolExecutor(max_workers=users_count) as pool:
                    results = pool.map(self.bot_for_user, [(user, costs, precisions) for user in users])
                    trades = []

                    for user_trades in results:
                        for trade in (user_trades or []):
                            trades.append(trade)

                    update_fields = [
                        "price",
                        "is_completed",
                        "active_order_ids",
                        "completed_at",
                        "order_id",
                        "filled",
                        "market_making_array",
                        "hft_order_ids",
                        "completed_icebergs",
                        "iceberg_prices_sum",
                        "hft_buy_orders",
                        "hft_sell_orders",
                        "ladder_order_ids",
                        "ladder_completed_orders",
                        "ladder_prices_sum",
                        "completed_loops",
                        "hft_orders_check_time",
                    ]

                    Trade.objects.bulk_update(trades, update_fields)

    def bot_for_user(self, args):
        user, costs, precisions = args

        try:
            orders = ftx.get_open_orders(user)

            trades = user.trades.all()

            trades_count = trades.count()

            if trades_count > 0:
                with concurrent.futures.ThreadPoolExecutor(max_workers=trades_count) as pool:
                    results = pool.map(
                        self.run_trade,
                        [(costs, user, trade, precisions, orders) for trade in trades]
                    )

                    return list(results)

            return []

        except Exception as e:
            print(str(e))
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(exc_type, fname, exc_tb.tb_lineno)
            return []

    def run_trade(self, args):
        costs, user, trade, precisions, orders = args

        symbol = trade.symbol.upper()
        precision = precisions[symbol]
        cost = costs[symbol]

        price = cost.get('bid')

        if trade.trade_type == 'sell':
            price = cost.get('ask')

        try:
            if trade.hft_bot:
                self.hft_bot(cost, user, trade, precision, orders, symbol)
                return trade

            if trade.ladder:
                self.ladder_bot(cost, user, trade, precision, orders, symbol)
                return trade

            # for skip running bots, if they were canceled
            if trade.is_canceled:
                return

            if trade.limit:
                self.limit_bot(cost, user, trade, precision, orders, symbol)
                return trade

            if trade.market:
                self.market_bot(cost, user, trade, precision, orders, symbol)
                return trade

            if trade.iceberg:
                self.iceberg_bot(price, user, trade, precision, orders, symbol)
                return trade

            if trade.grid_bot:
                self.grid_bot(price, user, trade, precision, orders, symbol)
                return trade

            if trade.twap_bot:
                self.twap_bot(price, user, trade, precision, orders, symbol)
                return trade

            if trade.stop:
                self.stop_bot(price, user, trade, precision, orders, symbol)
                return trade

            if trade.chase_bot:
                order = list(filter(lambda i: i.get('clientId') == trade.order_id, orders))

                if order:
                    order = order[0]

                    if float(trade.price) != price:
                        cancel_response = ftx.cancel_order(user, order['id'])

                        if cancel_response.get('success'):
                            trade.filled = float(trade.filled) + float(order.get('filledSize') or 0)
                            self.chase_bot(price, user, trade, precision, orders, symbol)

                    return trade

                if float(trade.price) > 0:
                    self.complete_trade(trade, user)
                    return trade

                self.chase_bot(price, user, trade, precision, orders, symbol)
                return trade

        except Exception as e:
            print(str(e))
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(exc_type, fname, exc_tb.tb_lineno)
            return trade

        return trade

    def complete_trade(self, trade, user):
        trade.is_completed = True if not trade.loop else False
        trade.filled = 0
        trade.completed_at = timezone.now() + timezone.timedelta(seconds=trade.time_interval)
        trade.price = 0
        trade.completed_loops += 1

        log_text = f'{trade.id}: {bold("Order completed")}.'

        remove_from_list = True

        if trade.loop:
            log_text += f' Waiting {trade.time_interval} seconds'
            remove_from_list = False

        action = {'delete': trade.id} if remove_from_list else {}

        action = {
            **action, 'trade': trade.id, 'completed_loops': trade.completed_loops,
            'price': {'price': 0, 'trade': trade.id}
        }

        send_log(user.id, log_text, action)

    def limit_bot(self, cost, user, trade, precision, orders, symbol):
        response = ftx.place_order(user, {
            'market': symbol,
            'side': trade.trade_type,
            'price': format_float(trade.limit_price, precision.get('price', 0)),
            'type': 'limit',
            'size': format_float(trade.quantity, precision.get('amount', 0)),
            'clientId': trade.id,
            'postOnly': trade.post_only,
            'reduceOnly': trade.reduce_only
        })

        if response.get('error'):
            self.handle_error(user, trade, response['error'])
            return

        trade.is_completed = True
        trade.order_id = response.get('result', {}).get('id', 0)
        send_log(trade.user.id, f'{trade.id}: {bold("Successfully placed")}', {'delete': trade.id})

    def stop_bot(self, cost, user, trade, precision, orders, symbol):
        response = ftx.place_trigger_order(user, {
            "market": symbol,
            "side": trade.trade_type,
            "triggerPrice": format_float(trade.stop_price, precision.get('price', 0)),
            "size": format_float(trade.quantity, precision.get('amount', 0)),
            "type": "stop",
        })

        if response.get('error'):
            self.handle_error(user, trade, response['error'])
            return

        trade.is_completed = True
        send_log(trade.user.id, f'{trade.id}: {bold("Stop loss successfully placed")}', {'delete': trade.id})

    def twap_bot(self, cost, user, trade, precision, orders, symbol):
        response = ftx.place_twap_order(user, {
            "market": symbol,
            "side": trade.trade_type,
            "size": float(trade.quantity),
            "durationSeconds": trade.twap_bot_duration,
            "randomizeSize": True
        })

        if response.get('error'):
            self.handle_error(user, trade, response['error'])
            return

        trade.is_completed = True
        send_log(trade.user.id, f'{trade.id}: {bold("TWAP bot successfully placed")}', {'delete': trade.id})

    def ladder_bot(self, cost, user, trade, precision, orders, symbol):
        from main.models import LadderTrade

        ladder_order_ids = json.loads(trade.ladder_order_ids)
        amount = trade.quantity

        if trade.ladder_trades_count <= 0 or trade.is_canceled:
            trade.is_completed = True
            send_log(trade.user.id, '', {'delete': trade.id})
            return

        if ladder_order_ids:  # already put
            trade.completed_at = timezone.now() + timezone.timedelta(seconds=1)
            active_orders = list(filter(lambda i: i.get('id') in ladder_order_ids, orders))
            active_orders_ids = list(map(lambda a: a['id'], active_orders))

            completed_orders = list(set(ladder_order_ids) - set(active_orders_ids))

            orders_history = ftx.get_orders_history(user, symbol)
            canceled_orders = list(map(lambda i: i['id'],
                                       filter(lambda i: i['status'] == 'closed' and i['id'] in completed_orders,
                                              orders_history)))

            if completed_orders:
                completed_orders = list(set(completed_orders) - set(canceled_orders))

                ladder_trades = trade.ladder_trades.filter(
                    order_id__in=completed_orders,
                    take_profit_order_id__isnull=True,
                    stop_loss_order_id__isnull=True
                )

                for i in ladder_trades:
                    amount_of_orders = amount * i.amount / 100

                    trade.ladder_prices_sum += i.price
                    trade.ladder_completed_orders += 1
                    avg_price = trade.ladder_prices_sum / trade.ladder_completed_orders

                    tp_params = self.get_tp_order_params(float(avg_price), trade.trade_type, i.take_profit)

                    tp_response = ftx.place_trigger_order(user, {
                        "market": symbol,
                        "side": tp_params['trade_type'],
                        "triggerPrice": format_float(tp_params['price'], precision.get('price', 0)),
                        "size": format_float(amount_of_orders, precision.get('amount', 0)),
                        "type": "takeProfit",
                    })

                    sl_params = self.get_sl_order_params(float(avg_price), trade.trade_type, i.stop_loss)

                    sl_response = ftx.place_trigger_order(user, {
                        "market": symbol,
                        "side": sl_params['trade_type'],
                        "triggerPrice": format_float(sl_params['price'], precision.get('price', 0)),
                        "size": format_float(amount_of_orders, precision.get('amount', 0)),
                        "type": "stop",
                    })

                    if tp_response.get('error'):
                        self.send_error_log(trade, 'TP: ' + tp_response['error'])

                    if sl_response.get('error'):
                        self.send_error_log(trade, 'SL: ' + sl_response['error'])

                    i.take_profit_order_id = tp_response.get('result', {}).get('id', 0)
                    i.stop_loss_order_id = sl_response.get('result', {}).get('id', 0)
                    i.save()

                trade.ladder_order_ids = json.dumps(active_orders_ids)
                trade.active_order_ids = json.dumps(active_orders_ids)

            if canceled_orders:
                log_text = f'{trade.id}: {len(canceled_orders)} orders {bold(f"canceled")}.'
                send_log(trade.user.id, log_text)

            if not active_orders_ids:
                trade.is_completed = True

                log_text = f'{trade.id}: all orders are {bold(f"completed")}.'
                send_log(trade.user.id, log_text, {'delete': trade.id})

            return

        order_ids = []

        trades_for_update = []

        for ladder_trade in trade.ladder_trades.all():
            quantity = amount * ladder_trade.amount / 100

            response = ftx.place_order(user, {
                'market': symbol,
                'side': trade.trade_type,
                'price': format_float(ladder_trade.price, precision.get('price', 0)),
                'type': 'limit',
                'size': format_float(quantity, precision.get('amount', 0)),
            })

            if response.get('error'):
                self.handle_error(user, trade, response['error'])
                ftx.batch_cancel_orders(user, order_ids)
                return

            order_ids.append(response['result']['id'])
            ladder_trade.order_id = response['result']['id']

            trades_for_update.append(ladder_trade)

        LadderTrade.objects.bulk_update(trades_for_update, ['order_id'])

        trade.active_order_ids = json.dumps(order_ids)
        trade.ladder_order_ids = json.dumps(order_ids)

        log_text = f'{trade.id}: {bold(len(order_ids))} orders put.'
        send_log(trade.user.id, log_text)

    def grid_bot(self, cost, user, trade, precision, orders, symbol):
        start_price = min(trade.grid_end_price, trade.grid_start_price)
        end_price = max(trade.grid_end_price, trade.grid_start_price)

        quantities_array = random_array(
            float(trade.quantity),
            trade.grid_trades_count,
            precision.get('min_price'),
            precision.get('amount', 0)
        )

        order_ids = []

        for i in range(1, trade.grid_trades_count + 1):
            price = start_price + i * (end_price - start_price) / (trade.grid_trades_count + 1)
            quantity = quantities_array[i - 1]
            clientId = str(uuid.uuid1())

            response = ftx.place_order(user, {
                'market': symbol,
                'side': trade.trade_type,
                'price': format_float(price, precision.get('price', 0)),
                'type': 'limit',
                'size': format_float(quantity, precision.get('amount', 0)),
                'clientId': clientId
            })

            if response.get('error'):
                self.handle_error(user, trade, response['error'])
                ftx.batch_cancel_orders(user, order_ids)
                return
            else:
                order_ids.append(response['result']['id'])

        trade.active_order_ids = json.dumps(order_ids)
        trade.is_completed = True

        log_text = f'{trade.id}: {bold(len(order_ids))} orders put.'
        send_log(trade.user.id, log_text, {'delete': trade.id})

    def iceberg_bot(self, price, user, trade, precision, orders, symbol):
        if trade.price:
            order = list(filter(lambda i: i.get('clientId') == trade.order_id, orders))

            if order:
                print('returning')
                return

            trade.price = 0
            trade.completed_icebergs += 1
            trade.order_id = ''
            log_text = f'{trade.id}: {bold(f"{trade.completed_icebergs} / {trade.icebergs_count} completed")}'

            action = {
                'trade': trade.id,
                'completed_loops': trade.completed_loops,
                'filled_amount': trade.filled_amount,
                'price': {'price': 0, 'trade': trade.id}
            }

            if trade.completed_icebergs == trade.icebergs_count:
                if trade.loop:
                    log_text += f'. Waiting {trade.time_interval} seconds'
                    trade.completed_at = timezone.now() + timezone.timedelta(seconds=trade.time_interval)
                    trade.completed_loops += 1
                    trade.completed_icebergs = 0
                    trade.market_making_array = ''
                else:
                    action['delete'] = trade.id
                    trade.is_completed = True

                send_log(trade.user.id, log_text, action)
                return

            send_log(trade.user.id, log_text, action=action)

        client_order_id = str(uuid.uuid1())

        amount = float(trade.quantity) / trade.icebergs_count

        if not trade.market_making:
            price = trade.iceberg_price
        else:
            amount = self.get_mm_amount(trade, precision)

        response = ftx.place_order(user, {
            'market': symbol,
            'side': trade.trade_type,
            'price': format_float(price, precision.get('price', 0)),
            'type': 'limit',
            'size': format_float(amount, precision.get('amount', 0)),
            'clientId': client_order_id
        })

        if response.get('error'):
            self.handle_error(user, trade, response['error'])
            return

        trade.order_id = client_order_id
        trade.price = response.get('result', {}).get('price', 0)
        send_log(trade.user.id, f'{trade.id}: Order placed')

    def chase_bot(self, price, user, trade, precision, orders, symbol):
        readable_price = format_float(price, precision.get('price', 0))
        client_order_id = str(uuid.uuid1())

        response = ftx.place_order(user, {
            'market': symbol,
            'side': trade.trade_type,
            'price': readable_price,
            'type': 'limit',
            'size': format_float(float(trade.quantity) - float(trade.filled), precision.get('amount', 0)),
            'clientId': client_order_id
        })

        if response.get('error'):
            self.handle_error(user, trade, response['error'])
        else:
            send_log(
                user.id,
                f'{trade.id}   {trade.trade_type} order put: {price}',
                {'price': {'price': readable_price, 'trade': trade.id, 'trade_type': trade.trade_type}}
            )

            trade.price = price
            trade.order_id = client_order_id

    def market_bot(self, cost, user, trade, precision, orders, symbol):
        response = ftx.place_order(user, {
            'market': symbol,
            'side': trade.trade_type,
            'type': 'market',
            'size': format_float(trade.quantity, precision.get('amount', 0)),
            'clientId': trade.id,
            'price': None,
            'reduceOnly': trade.reduce_only
        })

        if response.get('error'):
            print(response)
            self.handle_error(user, trade, response['error'])
            return

        trade.is_completed = True
        send_log(trade.user.id, f'{trade.id}: {bold("Successfully placed")}', {'delete': trade.id})

    def hft_bot(self, cost, user, trade, precision, orders, symbol):
        total_orders_count = trade.hft_orders_on_each_side * 2
        buy_orders = json.loads(trade.hft_buy_orders)
        sell_orders = json.loads(trade.hft_sell_orders)

        buy_active_orders = filter(lambda i: str(i.get('id')) in buy_orders.keys(), orders)
        sell_active_orders = filter(lambda i: str(i.get('id')) in sell_orders.keys(), orders)

        active_sell_order_ids = list(map(lambda a: a['id'], sell_active_orders))
        active_buy_order_ids = list(map(lambda a: a['id'], buy_active_orders))
        active_order_ids = [*active_sell_order_ids, *active_buy_order_ids]

        if total_orders_count <= 0 or trade.is_completed:
            trade.is_completed = True
            ftx.batch_cancel_orders(user, active_order_ids)
            return

        if len(buy_orders.keys()) + len(sell_orders.keys()) > 0:
            if len(active_order_ids) < total_orders_count:
                log_text = f'{trade.id}: {bold(f"{total_orders_count - len(active_order_ids)} orders completed, replacing orders")}.'

                send_log(trade.user.id, log_text)
                trade.active_order_ids = json.dumps(active_order_ids)
                trade.send_data_to_frontend()

                client_order_ids = []
                sell_orders_for_save = {}
                buy_orders_for_save = {}
                sell_orders_error = ''
                buy_orders_error = ''

                if len(active_sell_order_ids) < total_orders_count / 2:
                    for i in sell_orders:
                        if int(i) in active_sell_order_ids:
                            sell_orders_for_save[int(i)] = sell_orders[i]

                    bid_orders_q = random_array(
                        float(trade.quantity) / 2,
                        trade.hft_orders_on_each_side,
                        precision.get('min_price'),
                        precision.get('amount', 0)
                    )

                    sell_orders_error = self.hft_place_sell_orders(
                        cost,
                        client_order_ids,
                        sell_orders_for_save,
                        user,
                        trade,
                        precision,
                        list(reversed(sell_orders.values())),
                        symbol,
                        start_from=len(active_sell_order_ids)
                    )

                    if active_buy_order_ids:
                        ftx.batch_cancel_orders(user, active_buy_order_ids)

                    if not sell_orders_error:
                        buy_orders_error = self.hft_place_buy_orders(
                            cost,
                            client_order_ids,
                            buy_orders_for_save,
                            user,
                            trade,
                            precision,
                            bid_orders_q,
                            symbol
                        )

                else:
                    for i in buy_orders:
                        if int(i) in active_buy_order_ids:
                            buy_orders_for_save[int(i)] = buy_orders[i]

                    ask_orders_q = random_array(
                        float(trade.quantity) / 2,
                        trade.hft_orders_on_each_side,
                        precision.get('min_price'),
                        precision.get('amount', 0)
                    )

                    buy_orders_error = self.hft_place_buy_orders(
                        cost,
                        client_order_ids,
                        buy_orders_for_save,
                        user,
                        trade,
                        precision,
                        list(reversed(buy_orders.values())),
                        symbol,
                        start_from=len(active_buy_order_ids)
                    )

                    if active_sell_order_ids:
                        ftx.batch_cancel_orders(user, active_sell_order_ids)

                    if not buy_orders_error:
                        sell_orders_error = self.hft_place_sell_orders(
                            cost,
                            client_order_ids,
                            sell_orders_for_save,
                            user,
                            trade,
                            precision,
                            ask_orders_q,
                            symbol
                        )

                if buy_orders_error or sell_orders_error:
                    self.handle_hft_error(
                        user,
                        trade,
                        [*sell_orders_for_save.keys(), *buy_orders_for_save.keys()],
                        sell_orders_error or buy_orders_error
                    )

                    return

                active_order_ids = [*buy_orders_for_save.keys(), *sell_orders_for_save.keys()]

                trade.hft_order_ids = json.dumps(client_order_ids)
                trade.active_order_ids = json.dumps(active_order_ids)
                trade.hft_buy_orders = json.dumps(buy_orders_for_save)
                trade.hft_sell_orders = json.dumps(sell_orders_for_save)

                trade.send_data_to_frontend()

                if trade.is_completed:
                    ftx.batch_cancel_orders(user, active_order_ids)

            if not trade.hft_orders_check_time or timezone.now() > trade.hft_orders_check_time:
                active_orders_for_cancel = list(
                    filter(
                        lambda i:
                        int(i.get('id')) not in active_order_ids and
                        i.get('market') == trade.symbol.upper() and
                        i.get('clientId') != None,
                        orders
                    )
                )
                active_orders_for_cancel = list(map(lambda a: a['id'], active_orders_for_cancel))

                ftx.batch_cancel_orders(user, active_orders_for_cancel)
                trade.hft_orders_check_time = timezone.now() + timezone.timedelta(seconds=2)

                if active_orders_for_cancel:
                    logger.info(f'{str(timezone.now())}.  {trade.id} canceled orders: {active_orders_for_cancel}')

            return

        ask_orders_q = random_array(
            float(trade.quantity) / 2,
            trade.hft_orders_on_each_side,
            precision.get('min_price'),
            precision.get('amount', 0)
        )

        bid_orders_q = random_array(
            float(trade.quantity) / 2,
            trade.hft_orders_on_each_side,
            precision.get('min_price'),
            precision.get('amount', 0)
        )

        print(bid_orders_q, ask_orders_q)

        client_order_ids = []
        sell_order_ids = {}
        buy_order_ids = {}

        print('placing orders')
        buy_orders_error = ''

        sell_orders_error = self.hft_place_sell_orders(
            cost,
            client_order_ids,
            sell_order_ids,
            user,
            trade,
            precision,
            ask_orders_q,
            symbol
        )

        if not sell_orders_error:
            buy_orders_error = self.hft_place_buy_orders(
                cost,
                client_order_ids,
                buy_order_ids,
                user,
                trade,
                precision,
                bid_orders_q,
                symbol
            )

        if buy_orders_error or sell_orders_error:
            self.handle_hft_error(
                user,
                trade,
                [*buy_order_ids.keys(), *sell_order_ids.keys()],
                sell_orders_error or buy_orders_error
            )

            return

        active_order_ids = [*buy_order_ids.keys(), *sell_order_ids.keys()]

        trade.hft_order_ids = json.dumps(client_order_ids)
        trade.active_order_ids = json.dumps(active_order_ids)

        trade.hft_buy_orders = json.dumps(buy_order_ids)
        trade.hft_sell_orders = json.dumps(sell_order_ids)
        trade.send_data_to_frontend()

    def send_error_log(self, trade, error, action=None):
        send_log(trade.user.id, f'{trade.id}: ERROR: {red(error)}.', action)

    def handle_error(self, user, trade, error):
        trade.completed_at = timezone.now() + timezone.timedelta(seconds=30)
        trade.is_completed = True
        trade.completed_at = timezone.now()

        self.send_error_log(trade, error, {'delete': trade.id})

    def handle_hft_error(self, user, trade, trades_to_cancel, errors):
        ftx.batch_cancel_orders(user, trades_to_cancel)
        trade.completed_at = timezone.now() + timezone.timedelta(seconds=30)
        send_log(trade.user.id, f'{trade.id}: ERROR: {red(errors)}. Will repeat after 30 seconds.')

        trade.hft_order_ids = '[]'
        trade.active_order_ids = '[]'
        trade.hft_buy_orders = '{}'
        trade.hft_sell_orders = '{}'

    def hft_place_buy_orders(
            self,
            cost,
            client_order_ids,
            order_ids,
            user,
            trade,
            precision,
            quantities_array,
            symbol,
            start_from=0
    ):
        error = ''

        for i in range(start_from, trade.hft_orders_on_each_side):
            percent = 100 - (i + 1) * float(trade.hft_orders_price_difference) - float(
                trade.hft_default_price_difference)

            price = cost['bid'] * percent / 100

            client_order_id = str(uuid.uuid1())
            amount = format_float(quantities_array[i], precision.get('amount', 0))

            response = ftx.place_order(user, {
                'market': symbol,
                'side': 'buy',
                'price': format_float(price, precision.get('price', 0)),
                'type': 'limit',
                'size': amount,
                'clientId': client_order_id
            })

            if response.get('success'):
                order_ids[int(response['result']['id'])] = quantities_array[i]
                client_order_ids.append(client_order_id)
            else:
                error = response['error']
                return error

        return error

    def hft_place_sell_orders(
            self,
            cost,
            client_order_ids,
            order_ids,
            user,
            trade,
            precision,
            quantities_array,
            symbol,
            start_from=0
    ):
        error = ''

        for i in range(start_from, trade.hft_orders_on_each_side):
            percent = (i + 1) * float(trade.hft_orders_price_difference) + float(
                trade.hft_default_price_difference) + 100

            price = cost['ask'] * percent / 100

            client_order_id = str(uuid.uuid1())
            amount = format_float(float(quantities_array[i]), precision.get('amount', 0))

            response = ftx.place_order(user, {
                'market': symbol,
                'side': 'sell',
                'price': format_float(price, precision.get('price', 0)),
                'type': 'limit',
                'size': amount,
                'clientId': client_order_id
            })

            if response.get('success'):
                order_ids[int(response['result']['id'])] = quantities_array[i]
                client_order_ids.append(client_order_id)
            else:
                error = response['error']
                return error

        return error

    def get_mm_amount(self, trade, precision):
        if not trade.market_making_array:
            array = random_array(float(trade.quantity), trade.icebergs_count, precision.get('min_price'),
                                 precision.get('amount'))
            trade.market_making_array = json.dumps(array)
        else:
            array = json.loads(trade.market_making_array)

        return array[trade.completed_icebergs]

    def get_tp_order_params(self, price, trade_type, tp_percent):
        if trade_type == 'sell':
            tp_price = price * (100 - tp_percent) / 100
            trade_type = 'buy'
        else:
            tp_price = price * (100 + tp_percent) / 100
            trade_type = 'sell'

        return {'price': tp_price, 'trade_type': trade_type}

    def get_sl_order_params(self, price, trade_type, stop_loss_percent):
        if trade_type == 'sell':
            trade_type = 'buy'
            stop_price = price * (100 + stop_loss_percent) / 100
        else:
            trade_type = 'sell'
            stop_price = price * (100 - stop_loss_percent) / 100

        return {'price': stop_price, 'trade_type': trade_type}
