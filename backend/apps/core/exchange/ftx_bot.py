import concurrent
import json
import logging
import os
import sys
import time
from django.db.models import Q
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
                trades__isnull=False, trades__is_completed=False, trades__exchange=FTX
            ).distinct()

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

            users_count = users.count()

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
                    ]

                    Trade.objects.bulk_update(trades, update_fields)

                work_time = (timezone.now() - started_at).total_seconds()

                logger.info(f'bots work time: {work_time}')
                print('')
                print('')
                print('')

    def bot_for_user(self, args):
        user, costs, precisions = args

        try:
            orders = ftx.get_open_orders(user)

            trades = user.trades.filter(
                Q(completed_at__isnull=True) | Q(completed_at__lte=timezone.now()),
                is_completed=False,
                exchange=FTX
            ).prefetch_related('ladder_trades').order_by('grid_bot')

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

        try:
            symbol = trade.symbol.upper()
            precision = precisions[symbol]
            cost = costs[symbol]

            if trade.hft_bot:
                self.hft_bot(cost, user, trade, precision, orders, symbol)
                return trade

            if trade.limit:
                self.limit_bot(cost, user, trade, precision, orders, symbol)
                return trade

            if trade.market:
                self.market_bot(cost, user, trade, precision, orders, symbol)
                return trade

        except Exception as e:
            print(str(e))
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(exc_type, fname, exc_tb.tb_lineno)
            return trade

        return trade

    def limit_bot(self, cost, user, trade, precision, orders, symbol):
        response = ftx.place_order(user, {
            'market': symbol,
            'side': 'buy',
            'price': format_float(trade.limit_price, precision.get('price', 0)),
            'type': 'limit',
            'size': format_float(trade.quantity, precision.get('amount', 0)),
            'clientId': trade.id
        })

        if response.get('error'):
            self.handle_error(user, trade, response['error'])
            return

        trade.is_completed = True
        send_log(trade.user.id, f'{trade.id}: {bold("Successfully placed")}', {'delete': trade.id})

    def market_bot(self, cost, user, trade, precision, orders, symbol):
        response = ftx.place_order(user, {
            'market': symbol,
            'side': 'buy',
            'type': 'market',
            'size': format_float(trade.quantity, precision.get('amount', 0)),
            'clientId': trade.id,
            'price': None
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

        if len(buy_orders.keys()) + len(sell_orders.keys()) > 0:
            # print(orders)
            buy_active_orders = filter(lambda i: str(i.get('id')) in buy_orders.keys(), orders)
            sell_active_orders = filter(lambda i: str(i.get('id')) in sell_orders.keys(), orders)

            sell_order_ids = list(map(lambda a: a['id'], sell_active_orders))
            buy_order_ids = list(map(lambda a: a['id'], buy_active_orders))

            active_order_ids = [*sell_order_ids, *buy_order_ids]

            if len(active_order_ids) != total_orders_count:
                log_text = f'{trade.id}: {bold(f"{total_orders_count - len(active_order_ids)} orders completed, replacing orders")}.'

                send_log(trade.user.id, log_text)
                trade.active_order_ids = json.dumps(active_order_ids)
                trade.save()

                client_order_ids = []
                sell_orders_for_save = {}
                buy_orders_for_save = {}
                sell_orders_error = ''
                buy_orders_error = ''

                if len(sell_order_ids) < total_orders_count / 2:
                    for i in sell_orders:
                        if int(i) in sell_order_ids:
                            sell_orders_for_save[i] = sell_orders[i]

                    bid_orders_q = random_array(
                        float(trade.quantity) / 2,
                        trade.hft_orders_on_each_side,
                        precision.get('min_price')
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
                        start_from=len(sell_order_ids)
                    )

                    if buy_order_ids:
                        ftx.batch_cancel_orders(user, buy_order_ids)

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
                        if int(i) in buy_order_ids:
                            buy_orders_for_save[i] = buy_orders[i]

                    ask_orders_q = random_array(
                        float(trade.quantity) / 2,
                        trade.hft_orders_on_each_side,
                        precision.get('min_price')
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
                        start_from=len(buy_order_ids)
                    )

                    if sell_order_ids:
                        ftx.batch_cancel_orders(user, sell_order_ids)

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

                trade.hft_order_ids = json.dumps(client_order_ids)
                trade.active_order_ids = json.dumps([*buy_orders_for_save.keys(), *sell_orders_for_save.keys()])

                trade.hft_buy_orders = json.dumps(buy_orders_for_save)
                trade.hft_sell_orders = json.dumps(sell_orders_for_save)

            return

        ask_orders_q = random_array(
            float(trade.quantity) / 2,
            trade.hft_orders_on_each_side,
            precision.get('min_price')
        )

        bid_orders_q = random_array(
            float(trade.quantity) / 2,
            trade.hft_orders_on_each_side,
            precision.get('min_price')
        )

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

        trade.hft_order_ids = json.dumps(client_order_ids)
        trade.active_order_ids = json.dumps([*buy_order_ids.keys(), *sell_order_ids.keys()])

        trade.hft_buy_orders = json.dumps(buy_order_ids)
        trade.hft_sell_orders = json.dumps(sell_order_ids)

    def handle_error(self, user, trade, error):
        trade.completed_at = timezone.now() + timezone.timedelta(seconds=30)
        trade.is_completed = True
        trade.completed_at = timezone.now()

        send_log(trade.user.id, f'{trade.id}: ERROR: {red(error)}.', {'delete': trade.id})

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
                order_ids[response['result']['id']] = quantities_array[i]
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
                order_ids[response['result']['id']] = quantities_array[i]
                client_order_ids.append(client_order_id)
            else:
                error = response['error']
                return error

        return error
