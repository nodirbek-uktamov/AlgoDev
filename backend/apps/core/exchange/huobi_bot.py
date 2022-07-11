import concurrent
import json
import logging
import os
import re
import sys
import time
import uuid

import requests
from django.db.models import Q, Prefetch
from django.utils import timezone
from huobi.rest.error import HuobiRestiApiError

from core.exchange.client import CustomHuobiClient
from core.exchange.utils import format_float
from core.tasks import send_log
from core.utils.helpers import random_array
from core.utils.logs import bold, red
from main.models import HUOBI
from users.models import User
from core.exchange.utils import twap_bot_order_interval

logger = logging.getLogger('bot')


class HuobiBot:
    def run(self):
        from main.models import SymbolSetting, Trade

        symbols_settings = requests.get('https://api.huobi.pro/v1/common/symbols').json()
        precisions = {}
        symbol_precisions = []

        for i in symbols_settings.get('data', []):
            amount_precision = i.get('amount-precision')
            price_precision = i.get('price-precision')
            min_price = i.get('min-order-value')

            precisions[i.get('symbol')] = {'amount': amount_precision, 'price': price_precision, 'min_price': min_price}

            symbol_precisions.append(
                SymbolSetting(
                    amount_precision=amount_precision,
                    price_precision=price_precision,
                    min_price=min_price,
                    symbol=i.get('symbol'),
                    exchange=HUOBI
                )
            )

        SymbolSetting.objects.filter(exchange=HUOBI).delete()
        SymbolSetting.objects.bulk_create(symbol_precisions)

        del symbols_settings

        while not time.sleep(0.1):
            started_at = timezone.now()

            users = User.objects.filter(
                trades__isnull=False,
                trades__is_completed=False,
                trades__exchange=HUOBI
            )

            users = users.prefetch_related(
                Prefetch(
                    'trades',
                    queryset=Trade.objects.filter(
                        Q(completed_at__isnull=True) | Q(completed_at__lte=timezone.now()),
                        is_completed=False,
                        exchange=HUOBI
                    ).order_by('grid_bot')
                ),
                'trades__ladder_trades',
            ).distinct('id')

            try:
                costs_res = requests.get('https://api.huobi.pro/market/tickers').json()
            except:
                print('error with loading tickers')
                time.sleep(1)
                continue

            costs = {}

            for cost in costs_res.get('data', []):
                costs[cost.get('symbol')] = cost

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
                        "completed_loops"
                    ]

                    Trade.objects.bulk_update(trades, update_fields)

                work_time = (timezone.now() - started_at).total_seconds()

                logger.info(f'bots work time: {work_time}')

    def calc_amount(self, trade, precision, price=0):
        amount = float(trade.quantity)

        if trade.iceberg:
            amount = amount / trade.icebergs_count

            if trade.market_making:
                if not trade.market_making_array:
                    array = random_array(float(trade.quantity), trade.icebergs_count,
                                         precision.get('min_price') / price, 10)
                    trade.market_making_array = json.dumps(array)
                else:
                    array = json.loads(trade.market_making_array)

                amount = array[trade.completed_icebergs]

        if trade.twap_bot:
            trades_count = int(trade.twap_bot_duration / twap_bot_order_interval) or 1
            amount = trade.quantity / trades_count

        return float(amount)

    def twap_bot_place(self, client, account_id, trade, amount, precision):
        client.place(
            account_id=account_id,
            amount=format_float(amount, precision.get('amount', 0)),
            symbol=trade.symbol,
            type=f'{trade.trade_type}-market',
        )

        trades_count = int(trade.twap_bot_duration / twap_bot_order_interval) or 1
        trade.completed_at = timezone.now() + timezone.timedelta(seconds=trade.twap_bot_duration / trades_count)
        trade.twap_bot_completed_trades += 1

        send_log(trade.user.id, f'{trade.id}: {trade.trade_type} order sell')

        if trade.twap_bot_completed_trades == trades_count:
            self.complete_trade(trade, client, account_id, precision)

    def send_error_log(self, error, trade, additional_text='', action=None):
        try:
            error = error.splitlines()[0].split('error: ')[1]
        except Exception:
            pass

        error = re.sub(r'http\S+', '', str(error))

        send_log(trade.user.id, f'{trade.id}: ERROR: {red(error)}. ' + additional_text, action)

    def handle_error(self, trade, e, cancel=True, repeat=False):
        exc_type, exc_obj, exc_tb = sys.exc_info()
        fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        print(exc_type, fname, exc_tb.tb_lineno)

        print(str(e))

        trade.completed_at = timezone.now() + timezone.timedelta(seconds=30)
        action = None
        additional_text = ''

        if cancel:
            trade.is_completed = True
            action = {'delete': trade.id}

        elif repeat:
            additional_text = 'Will repeat after 30 seconds.'

        error = str(e)

        self.send_error_log(error, trade, additional_text, action)

    def place_order(self, client, trade, cost, price, account_id, precision):
        if trade.trade_type == 'sell':
            price = cost.get('ask')

        if trade.iceberg and not trade.market_making:
            price = float(trade.iceberg_price)

        amount = self.calc_amount(trade, precision, price)

        if not (trade.twap_bot and trade.trade_type == 'buy'):
            amount = amount / price

        try:
            if trade.twap_bot:
                self.twap_bot_place(client, account_id, trade, amount, precision)
            else:
                readable_price = format_float(price, precision.get('price', 0))

                client.place(
                    account_id=account_id,
                    amount=format_float(amount - float(trade.filled), precision.get('amount', 0)),
                    price=readable_price,
                    symbol=trade.symbol,
                    type=f'{trade.trade_type}-limit',
                    client_order_id=trade.id
                )
                trade.price = price

                send_log(
                    trade.user.id,
                    f'{trade.id}   {trade.trade_type} order put: {price}',
                    {'price': {'price': readable_price, 'trade': trade.id, 'trade_type': trade.trade_type}}
                )

        except Exception as e:
            self.handle_error(trade, e)

    def take_profit_order(self, client, account_id, trade, price, precision, take_profit_percent, quantity,
                          cancel_if_error=True):
        from main.models import TakeProfitOrder

        trade_type = 'sell'

        if trade.trade_type == 'sell':
            price = price * (100 - take_profit_percent) / 100
            trade_type = 'buy'
        else:
            price = price * (100 + take_profit_percent) / 100

        if price < 0:
            price = price * 0.01

        try:
            data = client.place(
                account_id=account_id,
                amount=format_float(float(quantity) / price, precision.get('amount', 0)),
                symbol=trade.symbol,
                type=f'{trade_type}-limit',
                price=format_float(price, precision.get('price', 0)),
                client_order_id=str(uuid.uuid1())
            ).data

            TakeProfitOrder.objects.create(user=trade.user, trade=trade, order_id=data.get('data'))
            return data

        except Exception as e:
            self.handle_error(trade, e, cancel_if_error, False)
            return {'data': 0}

    def grid_bot(self, client, trade, cost, account_id, precision, orders):
        order_ids = json.loads(trade.active_order_ids)

        if len(order_ids) > 0:
            active_orders = filter(lambda i: i.get('id') in order_ids, orders.get('data', []))
            active_orders = list(map(lambda a: a['id'], active_orders))

            if len(active_orders) != len(order_ids):
                trade.active_order_ids = json.dumps(active_orders)
                trade.save()

            if len(active_orders) == 0:
                self.complete_trade(trade, client, account_id, precision)

            return

        start_price = min(trade.grid_end_price, trade.grid_start_price)
        end_price = max(trade.grid_end_price, trade.grid_start_price)

        prices_array = random_array(
            float(trade.quantity),
            trade.grid_trades_count,
            precision.get('min_price'),
            10
        )
        order_ids = []

        try:
            for i in range(1, trade.grid_trades_count + 1):
                price = start_price + i * (end_price - start_price) / (trade.grid_trades_count + 1)
                quantity = prices_array[i - 1]

                order = client.place(
                    account_id=account_id,
                    amount=format_float(float(quantity) / float(price), precision.get('amount', 0)),
                    symbol=trade.symbol,
                    type=f'{trade.trade_type}-limit',
                    price=format_float(price, precision.get('price', 0)),
                    client_order_id=str(uuid.uuid1())
                ).data

                order_ids.append(int(order.get('data')))

            trade.active_order_ids = json.dumps(order_ids)

        except Exception as e:
            self.handle_error(trade, e)

        log_text = f'{trade.id}: {bold(len(order_ids))} orders put.'
        send_log(trade.user.id, log_text)

    def hft_place_buy_orders(self, trade, cost, quantities_array, precision, client, account_id, order_ids,
                             client_order_ids, start_from=0):
        for i in range(start_from, trade.hft_orders_on_each_side):
            percent = (100 - (i + 1) * float(trade.hft_orders_price_difference) - float(
                trade.hft_default_price_difference))

            price = cost['bid'] * percent / 100

            client_order_id = str(uuid.uuid1())
            amount = format_float(quantities_array[i] / price, precision.get('amount', 0))

            order = client.place(
                account_id=account_id,
                amount=amount,
                price=format_float(price, precision.get('price', 0)),
                symbol=trade.symbol,
                type=f'buy-limit',
                client_order_id=client_order_id
            ).data

            order_ids[order.get('data')] = quantities_array[i]
            client_order_ids.append(client_order_id)

    def hft_place_sell_orders(
            self,
            trade,
            cost,
            quantities_array,
            precision,
            client,
            account_id,
            order_ids,
            client_order_ids,
            start_from=0
    ):
        for i in range(start_from, trade.hft_orders_on_each_side):
            percent = ((i + 1) * float(trade.hft_orders_price_difference) + float(
                trade.hft_default_price_difference) + 100)
            price = cost['ask'] * percent / 100

            client_order_id = str(uuid.uuid1())
            amount = format_float(float(quantities_array[i]) / price, precision.get('amount', 0))

            order = client.place(
                account_id=account_id,
                amount=amount,
                price=format_float(price, precision.get('price', 0)),
                symbol=trade.symbol,
                type=f'sell-limit',
                client_order_id=client_order_id
            ).data

            order_ids[order.get('data')] = float(quantities_array[i])
            client_order_ids.append(client_order_id)

    def hft_bot(self, client, trade, cost, account_id, precision, orders):
        total_orders_count = trade.hft_orders_on_each_side * 2
        buy_orders = json.loads(trade.hft_buy_orders)
        sell_orders = json.loads(trade.hft_sell_orders)

        if total_orders_count == 0:
            trade.is_completed = True
            return

        if len(buy_orders.keys()) + len(sell_orders.keys()) > 0:
            buy_active_orders = filter(lambda i: str(i.get('id')) in buy_orders.keys(), orders.get('data', []))
            sell_active_orders = filter(lambda i: str(i.get('id')) in sell_orders.keys(), orders.get('data', []))

            sell_order_ids = list(map(lambda a: a['id'], sell_active_orders))
            buy_order_ids = list(map(lambda a: a['id'], buy_active_orders))

            active_order_ids = [*sell_order_ids, *buy_order_ids]

            if len(active_order_ids) < total_orders_count:
                log_text = f'{trade.id}: {bold(f"{total_orders_count - len(active_order_ids)} orders completed, replacing orders")}.'
                send_log(trade.user.id, log_text)

                trade.active_order_ids = json.dumps(active_order_ids)
                trade.save()

                client_order_ids = []
                sell_orders_for_save = {}
                buy_orders_for_save = {}

                if len(sell_order_ids) < total_orders_count / 2:
                    for i in sell_orders:
                        if int(i) in sell_order_ids:
                            sell_orders_for_save[i] = sell_orders[i]

                    bid_orders_q = random_array(
                        float(trade.quantity) / 2,
                        trade.hft_orders_on_each_side,
                        precision.get('min_price')
                    )

                    self.hft_place_sell_orders(
                        trade,
                        cost,
                        list(reversed(sell_orders.values())),
                        precision,
                        client,
                        account_id,
                        sell_orders_for_save,
                        client_order_ids,
                        start_from=len(sell_order_ids)
                    )

                    if buy_order_ids:
                        client.batch_cancel(order_ids=buy_order_ids)

                    self.hft_place_buy_orders(trade, cost, bid_orders_q, precision, client, account_id,
                                              buy_orders_for_save, client_order_ids)

                else:
                    for i in buy_orders:
                        if int(i) in buy_order_ids:
                            buy_orders_for_save[i] = buy_orders[i]

                    ask_orders_q = random_array(
                        float(trade.quantity) / 2,
                        trade.hft_orders_on_each_side,
                        precision.get('min_price')
                    )

                    self.hft_place_buy_orders(
                        trade,
                        cost,
                        list(reversed(buy_orders.values())),
                        precision,
                        client,
                        account_id,
                        buy_orders_for_save,
                        client_order_ids,
                        start_from=len(buy_order_ids)
                    )

                    if sell_order_ids:
                        client.batch_cancel(order_ids=sell_order_ids)

                    self.hft_place_sell_orders(trade, cost, ask_orders_q, precision, client, account_id,
                                               sell_orders_for_save, client_order_ids)

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

        try:
            # place orders:
            self.hft_place_sell_orders(trade, cost, ask_orders_q, precision, client, account_id, sell_order_ids,
                                       client_order_ids)
            self.hft_place_buy_orders(trade, cost, bid_orders_q, precision, client, account_id, buy_order_ids,
                                      client_order_ids)

        except Exception as e:
            self.handle_error(trade, e, False, True)

            if buy_order_ids or sell_order_ids:
                client.batch_cancel(order_ids=[*buy_order_ids.keys(), *sell_order_ids.keys()])

        trade.hft_order_ids = json.dumps(client_order_ids)
        trade.active_order_ids = json.dumps([*buy_order_ids.keys(), *sell_order_ids.keys()])

        trade.hft_buy_orders = json.dumps(buy_order_ids)
        trade.hft_sell_orders = json.dumps(sell_order_ids)

    def complete_trade(self, trade, client, account_id, precision):
        trade.is_completed = True if not trade.loop else False
        trade.filled = 0
        trade.completed_at = timezone.now() + timezone.timedelta(seconds=trade.time_interval)

        log_text = f'{trade.id}: {bold("Order completed")}.'
        remove_from_list = True

        if trade.loop:
            log_text += f' Waiting {trade.time_interval} seconds'
            remove_from_list = False

        if trade.iceberg:
            amount = self.calc_amount(trade, precision)
            trade.completed_icebergs = trade.completed_icebergs + 1
            trade.iceberg_prices_sum = float(trade.iceberg_prices_sum) + amount * float(trade.price)
            log_text = f'{trade.id}: {bold(f"{trade.completed_icebergs} / {trade.icebergs_count} completed.")}'

            if trade.completed_icebergs == trade.icebergs_count:
                avg_price = float(trade.iceberg_prices_sum) / float(trade.quantity)

                if trade.take_profit:
                    self.take_profit_order(client, account_id, trade, avg_price, precision, trade.take_profit_percent,
                                           trade.quantity)
                    trade.iceberg_prices_sum = 0

                trade.completed_icebergs = 0
                trade.market_making_array = ''

                if trade.loop:
                    log_text += f'. Waiting {trade.time_interval} seconds'
                    remove_from_list = False
                    trade.completed_loops += 1

            else:
                remove_from_list = False
                trade.is_completed = False
                trade.completed_at = None

        else:
            trade.completed_loops += 1

        trade.price = 0
        action = {'delete': trade.id} if remove_from_list else {}

        action = {
            **action, 'trade': trade.id, 'completed_loops': trade.completed_loops,
            'price': {'price': 0, 'trade': trade.id}
        }

        send_log(trade.user.id, log_text, action)

    def bot_for_user(self, args):
        user, costs, precisions = args

        try:
            print('asd')
            client = CustomHuobiClient(access_key=user.huobi_api_key, secret_key=user._huobi_secret_key)
            try:
                orders = client.open_orders().data
            except Exception as e:
                user.trades.update(is_completed=True)
                send_log(user.id, red('Api key or secret key is incorrect. Orders canceled'))
                return []

            account_id = user.huobi_spot_account_id

            trades = user.trades.all()

            trades_count = trades.count()

            if trades_count > 0:
                with concurrent.futures.ThreadPoolExecutor(max_workers=trades_count) as pool:
                    results = pool.map(
                        self.run_trade,
                        [(costs, trade, precisions, client, account_id, orders) for trade in trades]
                    )

                    return list(results)

        except Exception as e:
            print(str(e))
            return []

    def stop_order(self, client, account_id, amount, precision, trade, trade_type, price, stop_price, operator,
                   log_action=None):
        amount = format_float(amount, precision.get('amount', 0))
        stop_price = format_float(stop_price, precision.get('price', 0))

        data = client.place(
            account_id=account_id,
            amount=amount,
            stop_price=stop_price,
            price=format_float(price, precision.get('price', 0)),
            symbol=trade.symbol,
            type=f'{trade_type}-stop-limit',
            operator=operator
        ).data

        log_text = f"{trade.id}: stop order put. trigger price: {stop_price}, amount: {amount}"
        send_log(trade.user.id, log_text, log_action)

        return data

    def base_order(self, client, trade, account_id, precision, orders, price):
        amount = self.calc_amount(trade, precision, trade.limit_price)
        order_type = 'limit'

        if trade.market and not trade.price:
            order_type = 'market'
            trade.price = price

        if trade.order_id:
            order = list(filter(lambda i: i.get('client-order-id') == str(trade.id), orders.get('data', [])))

            if not order:
                amount = amount / float(trade.price)

                if trade.trade_type == 'sell':
                    trade_type = 'buy'
                    stop_price = float(trade.price) * (100 + trade.stop_percent) / 100
                    stop_operator = 'gte'

                else:
                    trade_type = 'sell'
                    stop_price = float(trade.price) * (100 - trade.stop_percent) / 100
                    stop_operator = 'lte'

                price = stop_price * 1.05 if trade_type == 'buy' else stop_price * 0.95

                if trade.stop and trade.take_profit:
                    order_ids = json.loads(trade.active_order_ids)
                    active_orders = filter(lambda i: str(i.get('id')) in order_ids, orders.get('data', []))
                    active_orders = list(map(lambda a: a['id'], active_orders))

                    if len(active_orders) == 1:
                        client.batch_cancel(order_ids=active_orders)
                        trade.is_completed = True
                        log_text = f'{trade.id}: take profit or stop order is {bold(f"completed")}.'
                        send_log(trade.user.id, log_text, {'delete': trade.id})
                        return

                    if not active_orders:
                        stop_order = {}

                        try:
                            stop_order = self.stop_order(
                                client,
                                account_id,
                                amount,
                                precision,
                                trade,
                                trade_type,
                                price,
                                stop_price,
                                stop_operator
                            )

                        except Exception as e:
                            self.send_error_log(e, trade)

                        tp_order = self.take_profit_order(client, account_id, trade, float(trade.price), precision,
                                                          trade.take_profit_percent, trade.quantity)

                        if tp_order.get('data') and stop_order.get('data'):
                            trade.active_order_ids = json.dumps([tp_order['data'], stop_order['data']])
                        else:
                            trade.is_completed = True

                        log_text = f'{trade.id}: order {bold(f"completed")}, stop and TP orders placed.'
                        send_log(trade.user.id, log_text, {'delete': trade.id})
                    return

                order_type = ''

                if trade.stop:
                    self.stop_order(client, account_id, amount, precision, trade, trade_type, price, stop_price,
                                    stop_operator)
                    trade.is_completed = True
                    order_type = 'stop'

                if trade.take_profit:
                    self.take_profit_order(client, account_id, trade, float(trade.price), precision,
                                           trade.take_profit_percent, trade.quantity)
                    order_type = 'TP'

                log_text = f'{trade.id}: order {bold(f"completed")}'
                trade.is_completed = True

                if order_type:
                    log_text += f', {order_type} order placed.'

                send_log(trade.user.id, log_text, {'delete': trade.id})

            trade.completed_at = timezone.now() + timezone.timedelta(seconds=1)
            return

        if not (order_type == 'market' and trade.trade_type == 'buy'):
            amount = amount / price

        data = client.place(
            account_id=account_id,
            amount=format_float(amount, precision.get('amount', 0)),
            price=format_float(trade.limit_price, precision.get('price', 0)),
            symbol=trade.symbol,
            type=f'{trade.trade_type}-{order_type}',
            client_order_id=trade.id,
        ).data

        trade.completed_at = timezone.now() + timezone.timedelta(seconds=1)
        trade.order_id = data['data']
        trade.price = trade.price or trade.limit_price
        send_log(trade.user.id, f'{trade.id}: order placed')

    def stop_bot(self, client, account_id, precision, trade):
        stop_operator = 'lte'
        stop_price = float(trade.stop_price)
        price = stop_price * 1.05

        if trade.trade_type == 'sell':
            stop_operator = 'gte'
            price = stop_price * 0.95

        amount = float(trade.quantity) / stop_price

        self.stop_order(
            client,
            account_id,
            amount,
            precision,
            trade,
            trade.trade_type,
            price,
            stop_price,
            stop_operator,
            {'delete': trade.id},
        )

    def ladder_bot(self, client, trade, cost, account_id, precision, orders):
        from main.models import LadderTrade

        ladder_order_ids = json.loads(trade.ladder_order_ids)
        amount = trade.quantity

        if trade.ladder_trades_count <= 0:
            trade.is_completed = True
            send_log(trade.user.id, '', {'delete': trade.id})
            return

        if ladder_order_ids:  # already put
            trade.completed_at = timezone.now() + timezone.timedelta(seconds=1)
            active_orders = list(filter(lambda i: str(i.get('id')) in ladder_order_ids, orders.get('data', [])))
            active_orders_ids = list(map(lambda a: str(a['id']), active_orders))

            completed_orders = list(set(ladder_order_ids) - set(active_orders_ids))

            if completed_orders:
                ladder_trades = trade.ladder_trades.filter(
                    order_id__in=completed_orders,
                    take_profit_order_id__isnull=True,
                    stop_loss_order_id__isnull=True
                )

                for i in ladder_trades:
                    trade.ladder_prices_sum += i.price
                    trade.ladder_completed_orders += 1
                    avg_price = trade.ladder_prices_sum / trade.ladder_completed_orders

                    if trade.trade_type == 'sell':
                        trade_type = 'buy'
                        stop_price = float(avg_price) * (100 + i.stop_loss) / 100
                        stop_operator = 'gte'

                    else:
                        trade_type = 'sell'
                        stop_price = float(avg_price) * (100 - i.stop_loss) / 100
                        stop_operator = 'lte'

                    tp_data = self.take_profit_order(
                        client,
                        account_id,
                        trade,
                        float(avg_price),
                        precision,
                        i.take_profit,
                        amount * i.amount / 100,
                        cancel_if_error=False
                    )
                    stop_order = {}

                    try:
                        stop_order = self.stop_order(
                            client,
                            account_id,
                            float(amount * i.amount) / 100 / float(avg_price),
                            precision,
                            trade,
                            trade_type,
                            stop_price * 1.05 if trade_type == 'buy' else stop_price * 0.95,
                            stop_price,
                            stop_operator
                        )

                    except Exception as e:
                        self.send_error_log(e, trade)

                    i.take_profit_order_id = tp_data.get('data', 0)
                    i.stop_loss_order_id = stop_order.get('data', 0)
                    i.save()

                trade.ladder_order_ids = json.dumps(active_orders_ids)
                trade.active_order_ids = json.dumps(active_orders_ids)

            if not active_orders_ids:
                trade.is_completed = True

                log_text = f'{trade.id}: all orders are {bold(f"completed")}.'
                send_log(trade.user.id, log_text, {'delete': trade.id})

            print('returning')
            return

        order_ids = []

        try:
            trades_for_update = []

            for ladder_trade in trade.ladder_trades.all():
                data = client.place(
                    account_id=account_id,
                    amount=format_float(amount * ladder_trade.amount / 100 / ladder_trade.price,
                                        precision.get('amount', 0)),
                    price=format_float(ladder_trade.price, precision.get('price', 0)),
                    symbol=trade.symbol,
                    type=f'{trade.trade_type}-limit',
                ).data
                ladder_trade.order_id = data.get('data')

                trades_for_update.append(ladder_trade)
                order_ids.append(data.get('data'))

            LadderTrade.objects.bulk_update(trades_for_update, ['order_id'])

        except Exception as e:
            self.handle_error(trade, e)

            if order_ids:
                client.batch_cancel(order_ids=order_ids)

        trade.active_order_ids = json.dumps(order_ids)
        trade.ladder_order_ids = json.dumps(order_ids)

    def run_trade(self, args):
        costs, trade, precisions, client, account_id, orders = args

        cost = costs[trade.symbol]
        precision = precisions[trade.symbol]
        price = cost.get('bid')

        if trade.grid_bot:
            self.grid_bot(client, trade, cost, account_id, precision, orders)
            return trade

        if trade.hft_bot:
            self.hft_bot(client, trade, cost, account_id, precision, orders)
            return trade

        if trade.ladder:
            self.ladder_bot(client, trade, cost, account_id, precision, orders)
            return trade

        if trade.limit or trade.market:
            try:
                self.base_order(client, trade, account_id, precision, orders, price)
            except Exception as e:
                self.handle_error(trade, e)

            return trade

        elif trade.stop:
            try:
                self.stop_bot(client, account_id, precision, trade)
            except Exception as e:
                self.handle_error(trade, e)

            trade.is_completed = True
            return trade

        order = list(filter(lambda i: i.get('client-order-id') == str(trade.id), orders.get('data', [])))

        if order:
            if float(trade.price) != price and (not trade.iceberg or trade.market_making):
                try:
                    res = client.submit_cancel(order_id=order[0].get('id')).data
                    filled = order[0].get('filled-amount')
                    trade.filled = float(trade.filled) + float(filled)

                    send_log(
                        trade.user.id,
                        f'{trade.id}: Order canceled. Old price: {trade.price}',
                        {'price': {'price': 0, 'trade': trade.id}}
                    )
                except HuobiRestiApiError:
                    self.complete_trade(trade, client, account_id, precision)
                    return trade

                if res.get('status'):
                    self.place_order(client, trade, cost, price, account_id, precision)

            return trade

        if float(trade.price) > 0:
            # print('completed')
            self.complete_trade(trade, client, account_id, precision)
            return trade

        self.place_order(client, trade, cost, price, account_id, precision)
        return trade
