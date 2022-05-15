import concurrent
import json
import os
import sys
import threading
import time
from os import system

import requests
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models import Q
from django.utils import timezone
from huobi import HuobiRestClient
from huobi.rest.error import HuobiRestiApiError

from core.exchange.utils import format_float
from core.utils.background import background

from core.exchange.client import CustomHuobiClient
from core.utils.helpers import random_array
from core.utils.logs import bold, red
from users.models import User

twap_bot_order_interval = 60


def save_account_ids(user):
    try:
        if not user.spot_account_id or not user.margin_account_id:
            client = HuobiRestClient(access_key=user.api_key, secret_key=user._secret_key)
            accounts = client.accounts().data

            for account in accounts.get('data', []):
                if account.get('type') == 'spot':
                    user.spot_account_id = account.get('id')

                if account.get('type') == 'margin':
                    user.margin_account_id = account.get('id')

            user.save()
    except:
        pass


class Bot:
    def run_bot(self):
        from main.models import SymbolSetting
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
                    symbol=i.get('symbol')
                )
            )

        SymbolSetting.objects.all().delete()
        SymbolSetting.objects.bulk_create(symbol_precisions)

        del symbols_settings

        while not time.sleep(3):
            users = User.objects.filter(trades__isnull=False, trades__is_completed=False).distinct()

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

            for user in users:
                self.bot_for_user(user, costs, precisions)

    def send_log(self, user_id, message, action=None):
        channel_layer = get_channel_layer()

        t = threading.Thread(target=async_to_sync(channel_layer.group_send), args=(
            f'user_{user_id}',
            {
                'type': 'chat_message',
                'message': f'({timezone.now().strftime("%H:%M:%S")})&nbsp; &nbsp;{message}',
                'action': action
            }
        ))
        t.daemon = True
        t.start()

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

        self.send_log(trade.user.id, f'{trade.id}: {trade.trade_type} order sell')

        if trade.twap_bot_completed_trades == trades_count:
            self.complete_trade(trade, client, account_id, precision)

    def send_error_log(self, error, trade, additional_text='', action=None):
        try:
            error = error.splitlines()[0].split('error: ')[1]
        except Exception:
            pass

        self.send_log(trade.user.id, f'{trade.id}: ERROR: {red(error)}. ' + additional_text, action)

    def handle_error(self, trade, e, cancel=True):
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

        else:
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

                self.send_log(
                    trade.user.id,
                    f'{trade.id}   {trade.trade_type} order put: {price}',
                    {'price': {'price': readable_price, 'trade': trade.id, 'trade_type': trade.trade_type}}
                )

        except Exception as e:
            self.handle_error(trade, e)

        trade.save()

    def take_profit_order(self, client, account_id, trade, price, precision):
        from main.models import TakeProfitOrder

        trade_type = 'sell'

        if trade.trade_type == 'sell':
            price = price * (100 - trade.take_profit_percent) / 100
            trade_type = 'buy'
        else:
            price = price * (100 + trade.take_profit_percent) / 100

        if price < 0:
            price = price * 0.01

        try:
            data = client.place(
                account_id=account_id,
                amount=format_float(float(trade.quantity) / price, precision.get('amount', 0)),
                symbol=trade.symbol,
                type=f'{trade_type}-limit',
                price=format_float(price, precision.get('price', 0)),
                client_order_id=int(round(trade.completed_at.timestamp() * 1000))
            ).data

            TakeProfitOrder.objects.create(user=trade.user, trade=trade, order_id=data.get('data'))
            return data

        except Exception as e:
            self.handle_error(trade, e)
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
                    client_order_id=int(round(timezone.now().timestamp() * 1000))
                ).data

                order_ids.append(int(order.get('data')))

            trade.active_order_ids = json.dumps(order_ids)
            trade.save()

        except Exception as e:
            self.handle_error(trade, e)
            print('grid error')

        log_text = f'{trade.id}: {bold(len(order_ids))} orders put.'
        self.send_log(trade.user.id, log_text)

    def hft_bot(self, client, trade, cost, account_id, precision, orders):
        old_order_ids = json.loads(trade.hft_order_ids)
        active_order_ids = json.loads(trade.active_order_ids)

        if len(old_order_ids) > 0:
            active_orders = filter(lambda i: int(i.get('client-order-id')) in old_order_ids, orders.get('data', []))
            active_orders = list(map(lambda a: a['id'], active_orders))

            if len(active_orders) == len(old_order_ids):
                return

            else:
                log_text = f'{trade.id}: {bold(f"{len(old_order_ids) - len(active_orders)} orders completed, replacing orders")}.'

                if len(active_orders) != len(active_order_ids):
                    trade.active_order_ids = json.dumps(active_orders)
                    trade.save()

                if active_orders:
                    client.batch_cancel(order_ids=active_orders)
                    self.send_log(trade.user.id, log_text)

                trade.hft_order_ids = '[]'
                trade.active_order_ids = '[]'

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
        order_ids = []

        try:
            # place orders:
            for i in range(trade.hft_orders_on_each_side):
                percent = ((i + 1) * float(trade.hft_orders_price_difference) + float(
                    trade.hft_default_price_difference) + 100)
                price = cost['ask'] * percent / 100
                client_order_id = int(round(timezone.now().timestamp() * 100000))

                order = client.place(
                    account_id=account_id,
                    amount=format_float(ask_orders_q[i] / price, precision.get('amount', 0)),
                    price=format_float(price, precision.get('price', 0)),
                    symbol=trade.symbol,
                    type=f'sell-limit',
                    client_order_id=client_order_id
                ).data

                order_ids.append(order.get('data'))
                client_order_ids.append(client_order_id)

            for i in range(trade.hft_orders_on_each_side):
                percent = (100 - (i + 1) * float(trade.hft_orders_price_difference) - float(
                    trade.hft_default_price_difference))
                price = cost['bid'] * percent / 100
                client_order_id = int(round(timezone.now().timestamp() * 100000))

                order = client.place(
                    account_id=account_id,
                    amount=format_float(bid_orders_q[i] / price, precision.get('amount', 0)),
                    price=format_float(price, precision.get('price', 0)),
                    symbol=trade.symbol,
                    type=f'buy-limit',
                    client_order_id=client_order_id
                ).data

                order_ids.append(int(order.get('data')))
                client_order_ids.append(client_order_id)

        except Exception as e:
            self.handle_error(trade, e, False)

            if order_ids:
                client.batch_cancel(order_ids=order_ids)

        trade.hft_order_ids = json.dumps(client_order_ids)
        trade.active_order_ids = json.dumps(order_ids)
        trade.save()

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
                    self.take_profit_order(client, account_id, trade, avg_price, precision)
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

        trade.save()
        self.send_log(trade.user.id, log_text, action)

    @background
    def bot_for_user(self, user, costs, precisions):
        try:
            client = CustomHuobiClient(access_key=user.api_key, secret_key=user._secret_key)
            orders = client.open_orders().data
            account_id = user.spot_account_id

            trades = user.trades.filter(
                Q(completed_at__isnull=True) | Q(completed_at__lte=timezone.now()),
                is_completed=False
            ).order_by('grid_bot')

            for trade in trades:
                self.run_trade(costs, trade, precisions, client, account_id, orders)

        except Exception as e:
            print(str(e))

    def stop_order(self, client, account_id, amount, precision, trade, trade_type, stop_price, operator):
        return client.place(
            account_id=account_id,
            amount=format_float(amount, precision.get('amount', 0)),
            stop_price=format_float(stop_price, precision.get('price', 0)),
            price=format_float(stop_price, precision.get('price', 0)),
            symbol=trade.symbol,
            type=f'{trade_type}-stop-limit',
            operator=operator
        ).data

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

                if trade.stop and trade.take_profit:
                    order_ids = json.loads(trade.active_order_ids)
                    active_orders = filter(lambda i: str(i.get('id')) in order_ids, orders.get('data', []))
                    active_orders = list(map(lambda a: a['id'], active_orders))

                    if len(active_orders) == 1:
                        client.batch_cancel(order_ids=active_orders)
                        trade.is_completed = True
                        trade.save()
                        log_text = f'{trade.id}: take profit or stop order is {bold(f"completed")}.'
                        self.send_log(trade.user.id, log_text, {'delete': trade.id})
                        return

                    if not active_orders:
                        stop_order = {}

                        try:
                            stop_order = self.stop_order(client, account_id, amount, precision, trade, trade_type, stop_price, stop_operator)
                        except Exception as e:
                            self.send_error_log(e, trade)

                        tp_order = self.take_profit_order(client, account_id, trade, float(trade.price), precision)

                        if tp_order.get('data') and stop_order.get('data'):
                            trade.active_order_ids = json.dumps([tp_order['data'], stop_order['data']])
                        else:
                            trade.is_completed = True

                        trade.save()

                        log_text = f'{trade.id}: order {bold(f"completed")}, stop and TP orders placed.'
                        self.send_log(trade.user.id, log_text, {'delete': trade.id})
                    return

                order_type = ''

                if trade.stop:
                    self.stop_order(client, account_id, amount, precision, trade, trade_type, stop_price, stop_operator)
                    trade.is_completed = True
                    order_type = 'stop'

                if trade.take_profit:
                    self.take_profit_order(client, account_id, trade, float(trade.price), precision)
                    trade.is_completed = True
                    order_type = 'TP'

                log_text = f'{trade.id}: order {bold(f"completed")}, {order_type} order placed.'
                self.send_log(trade.user.id, log_text, {'delete': trade.id})

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

    @background
    def run_trade(self, costs, trade, precisions, client, account_id, orders):
        cost = costs[trade.symbol]
        precision = precisions[trade.symbol]
        price = cost.get('bid')

        if trade.grid_bot:
            self.grid_bot(client, trade, cost, account_id, precision, orders)
            return

        if trade.hft_bot:
            self.hft_bot(client, trade, cost, account_id, precision, orders)
            return

        if trade.limit or trade.market:
            try:
                self.base_order(client, trade, account_id, precision, orders, price)
            except Exception as e:
                self.handle_error(trade, e)

            trade.save()

            return

        order = list(filter(lambda i: i.get('client-order-id') == str(trade.id), orders.get('data', [])))

        if order:
            if float(trade.price) != price and (not trade.iceberg or trade.market_making):
                try:
                    res = client.submit_cancel(order_id=order[0].get('id')).data
                    filled = order[0].get('filled-amount')
                    trade.filled = float(trade.filled) + float(filled)
                    trade.save()

                    self.send_log(
                        trade.user.id,
                        f'{trade.id}: Order canceled. Old price: {trade.price}',
                        {'price': {'price': 0, 'trade': trade.id}}
                    )
                except HuobiRestiApiError:
                    self.complete_trade(trade, client, account_id, precision)
                    return

                if res.get('status'):
                    self.place_order(client, trade, cost, price, account_id, precision)

            return

        if float(trade.price) > 0:
            # print('completed')
            self.complete_trade(trade, client, account_id, precision)
            return

        self.place_order(client, trade, cost, price, account_id, precision)
