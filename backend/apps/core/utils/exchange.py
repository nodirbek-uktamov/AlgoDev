import base64
import concurrent
import hashlib
import hmac
import json
import threading
import time
from datetime import datetime
from urllib.parse import urlencode

import requests
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models import Q
from django.utils import timezone
from huobi import HuobiRestClient
from huobi.rest.endpoint import Endpoint
from huobi.rest.error import HuobiRestiApiError

from core.utils.helpers import random_array
from core.utils.logs import bold, red
from users.models import User

twap_bot_order_interval = 60


def save_account_ids(user):
    if not user.spot_account_id or not user.margin_account_id:
        client = HuobiRestClient(access_key=user.api_key, secret_key=user.secret_key)
        accounts = client.accounts().data

        for account in accounts.get('data', []):
            if account.get('type') == 'spot':
                user.spot_account_id = account.get('id')

            if account.get('type') == 'margin':
                user.margin_account_id = account.get('id')

        user.save()


def generate_auth_params_ws(access_key, secret_key):
    timestamp = str(datetime.utcnow().isoformat())[0:19]
    params = {'accessKey': access_key,
              'signatureMethod': 'HmacSHA256',
              'signatureVersion': '2.1',
              'timestamp': timestamp
              }
    params_text = urlencode(params)
    method = 'GET'
    endpoint = '/ws/v2'
    base_uri = 'api.huobi.pro'

    pre_signed_text = method + '\n' + base_uri + '\n' + endpoint + '\n' + params_text
    hash_code = hmac.new(secret_key.encode(), pre_signed_text.encode(), hashlib.sha256).digest()
    signature = base64.b64encode(hash_code).decode()

    url = 'wss://' + base_uri + endpoint

    params['signature'] = signature
    params["authType"] = "api"

    return {'url': url, 'params': params}


class CustomHuobiClient(HuobiRestClient):
    open_orders = Endpoint(
        method='GET',
        path='/v1/order/openOrders',
        auth_required=True,
    )

    place = Endpoint(
        method='POST',
        path='/v1/order/orders/place',
        auth_required=True,
        params={
            'account_id': {
                'required': True,
                'name': 'account-id'
            },
            'amount': {
                'required': True,
            },
            'price': {
                'required': False,
            },
            'source': {
                'required': False,
            },
            'symbol': {
                'required': True
            },
            'client_order_id': {
                'required': False,
                'name': 'client-order-id'
            },
            'type': {
                'required': True,
                'choices': [
                    'buy-market',
                    'sell-market',
                    'buy-limit',
                    'sell-limit',
                ]
            },
        }
    )


class Bot:
    def bot(self):
        symbols_settings = requests.get('https://api.huobi.pro/v1/settings/common/symbols').json()
        precisions = {}

        for i in symbols_settings.get('data', []):
            precisions[i.get('symbol')] = {'amount': i.get('tap'), 'price': i.get('tpp')}

        del symbols_settings

        while not time.sleep(0.3):
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
            if users.count() > 0:
                with concurrent.futures.ThreadPoolExecutor(max_workers=users.count()) as pool:
                    pool.map(self.bot_for_user, [(user, costs, precisions) for user in users])

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

    def calc_amount(self, trade):
        amount = float(trade.quantity)

        if trade.iceberg:
            amount = amount / trade.icebergs_count

            if trade.market_making:
                if not trade.market_making_array:
                    array = random_array(float(trade.quantity), trade.icebergs_count, decimal_fields=10)
                    trade.market_making_array = json.dumps(array)
                else:
                    array = json.loads(trade.market_making_array)

                amount = array[trade.completed_icebergs]

        if trade.twap_bot:
            trades_count = int(trade.twap_bot_duration / twap_bot_order_interval) or 1
            amount = trade.quantity / trades_count

        return amount

    def format_float(self, number, decimal_fields):
        return f'{number:.{decimal_fields}f}'

    def twap_bot_place(self, client, account_id, trade, amount, precision):
        client.place(
            account_id=account_id,
            amount=self.format_float(amount, precision.get('amount', 0)),
            symbol=trade.symbol,
            type=f'{trade.trade_type}-market',
        )

        trades_count = int(trade.twap_bot_duration / twap_bot_order_interval) or 1
        trade.completed_at = timezone.now() + timezone.timedelta(seconds=trade.twap_bot_duration / trades_count)
        trade.twap_bot_completed_trades += 1

        self.send_log(trade.user.id, f'{trade.id}: {trade.trade_type} order sell')

        if trade.twap_bot_completed_trades == trades_count:
            self.complete_trade(trade, client, account_id, precision)

    def handle_error(self, trade, e):
        print(str(e))

        trade.completed_at = timezone.now() + timezone.timedelta(seconds=10)
        trade.is_completed = True

        error = str(e)

        try:
            error = error.splitlines()[0].split('error: ')[1]
        except Exception:
            pass

        action = {'delete': trade.id}

        self.send_log(trade.user.id, f'{trade.id}: ERROR: {red(error)}', action)

    def place_order(self, client, trade, cost, price, account_id, precision):
        if trade.trade_type == 'sell':
            price = cost.get('ask')

        amount = self.calc_amount(trade)

        if trade.iceberg and not trade.market_making:
            price = float(trade.iceberg_price)

        try:
            if trade.twap_bot:
                self.twap_bot_place(client, account_id, trade, amount, precision)
            else:
                client.place(
                    account_id=account_id,
                    amount=self.format_float(amount - float(trade.filled), precision.get('amount', 0)),
                    price=self.format_float(price, precision.get('price', 0)),
                    symbol=trade.symbol,
                    type=f'{trade.trade_type}-limit',
                    client_order_id=trade.id
                )
                trade.price = price
                self.send_log(trade.user.id, f'{trade.id}   {trade.trade_type} order put: {price}')

        except Exception as e:
            self.handle_error(trade, e)

        trade.save()

    def take_profit_order(self, client, account_id, trade, price, precision):
        trade_type = 'sell'

        if trade.trade_type == 'sell':
            price = price * (100 - trade.take_profit_percent) / 100
            trade_type = 'buy'
        else:
            price = price * (100 + trade.take_profit_percent) / 100

        try:
            data = client.place(
                account_id=account_id,
                amount=self.format_float(trade.quantity, precision.get('amount', 0)),
                symbol=trade.symbol,
                type=f'{trade_type}-limit',
                price=self.format_float(price, precision.get('price', 0)),
                client_order_id=int(round(trade.completed_at.timestamp() * 1000))
            ).data

            # print('data:', data)
        except Exception as e:
            self.handle_error(trade, e)

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
            amount = self.calc_amount(trade)
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

            else:
                remove_from_list = False
                trade.is_completed = False
                trade.completed_at = None

        trade.price = 0
        action = {'delete': trade.id} if remove_from_list else None

        trade.save()
        self.send_log(trade.user.id, log_text, action)

    def bot_for_user(self, args):
        user, costs, precisions = args

        client = CustomHuobiClient(access_key=user.api_key, secret_key=user.secret_key)
        orders = client.open_orders().data
        account_id = user.spot_account_id

        trades = user.trades.filter(
            Q(completed_at__isnull=True) | Q(completed_at__lte=timezone.now()),
            is_completed=False
        )

        for trade in trades:
            cost = costs[trade.symbol]
            precision = precisions[trade.symbol]
            price = cost.get('bid')
            order = list(filter(lambda i: i.get('client-order-id') == str(trade.id), orders.get('data', [])))

            if order:
                if float(trade.price) != price and (not trade.iceberg or trade.market_making):
                    try:
                        res = client.submit_cancel(order_id=order[0].get('id')).data
                        filled = order[0].get('filled-amount')
                        trade.filled = float(trade.filled) + float(filled)
                        trade.save()
                        self.send_log(trade.user.id, f'{trade.id}: Order canceled. Old price: {trade.price}')
                    except HuobiRestiApiError:
                        self.complete_trade(trade, client, account_id, precision)
                        continue

                    if res.get('status'):
                        self.place_order(client, trade, cost, price, account_id, precision)

                continue

            if float(trade.price) > 0:
                # print('completed')
                self.complete_trade(trade, client, account_id, precision)
                continue

            self.place_order(client, trade, cost, price, account_id, precision)
