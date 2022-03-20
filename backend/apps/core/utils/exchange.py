import time
from huobi import HuobiRestClient
from huobi.rest.endpoint import Endpoint
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
from core.utils.helpers import random_array
from django.db.models import Q
from django.utils import timezone
from huobi.rest.error import HuobiRestiApiError
from users.models import User
import concurrent
import requests


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
    chase_bot_order_interval = 5

    def bot(self):
        while not time.sleep(0.3):
            users = User.objects.filter(trades__isnull=False, trades__is_completed=False).distinct()
            costs_res = requests.get('https://api.huobi.pro/market/tickers').json()
            costs = {}

            for cost in costs_res.get('data', []):
                costs[cost.get('symbol')] = cost

            if users.count() > 0:
                with concurrent.futures.ThreadPoolExecutor(max_workers=users.count()) as pool:
                    pool.map(self.bot_for_user, [(user, costs) for user in users])

    def send_log(self, user_id, message):
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f'user_{user_id}',
            {
                'type': 'chat_message',
                'message': f'{timezone.now().strftime("%H:%M:%S")} {message}'
            }
        )

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

        if trade.chase_bot:
            trades_count = int(trade.chase_bot_duration / self.chase_bot_order_interval)
            amount = trade.quantity / trades_count

        return amount

    def chase_bot_place(self, client, account_id, trade, amount):
        client.place(
            account_id=account_id,
            amount="{:.2f}".format(amount),
            symbol=trade.symbol,
            type=f'{trade.trade_type}-market',
        )

        trades_count = int(trade.chase_bot_duration / self.chase_bot_order_interval)
        trade.completed_at = timezone.now() + timezone.timedelta(seconds=trade.chase_bot_duration / trades_count)
        trade.chase_bot_completed_trades += 1

        self.send_log(trade.user.id, f'{trade.id}   {trade.trade_type} order sell')

        if trade.chase_bot_completed_trades == trades_count:
            self.complete_trade(trade)

    def place_order(self, client, trade, cost, price, account_id):
        if trade.trade_type == 'sell':
            price = cost.get('ask')

        amount = self.calc_amount(trade)

        try:
            if trade.chase_bot:
                self.chase_bot_place(client, account_id, trade, amount)
            else:
                client.place(
                    account_id=account_id,
                    amount="{:.2f}".format(amount - float(trade.filled)),
                    symbol=trade.symbol,
                    type=f'{trade.trade_type}-limit',
                    price="{:.6f}".format(price),
                    client_order_id=trade.id
                )
                trade.price = price
                self.send_log(trade.user.id, f'{trade.id}   {trade.trade_type} order put: {price}')

        except Exception as e:
            # some error with huobi
            trade.completed_at = timezone.now() + timezone.timedelta(seconds=10)
            error = str(e)

            try:
                error = error.splitlines()[0].split('error: ')[1]
                trade.is_completed = True
            except Exception:
                pass

            self.send_log(trade.user.id, f'{trade.id}: ERROR: {error}')

        trade.save()

    def complete_trade(self, trade):
        trade.is_completed = True if not trade.loop else False
        trade.price = 0
        trade.filled = 0
        trade.completed_at = timezone.now() + timezone.timedelta(seconds=trade.time_interval)

        log_text = f'{trade.id}: Order completed.'

        if trade.loop:
            log_text += f' Waiting {trade.time_interval} seconds'

        if trade.iceberg:
            trade.completed_icebergs = trade.completed_icebergs + 1

            if trade.completed_icebergs == trade.icebergs_count:
                trade.completed_icebergs = 0
                trade.market_making_array = ''

            else:
                log_text = f'{trade.id}: {trade.completed_icebergs} / {trade.icebergs_count} completed.'
                trade.is_completed = False
                trade.completed_at = None

        trade.save()
        self.send_log(trade.user.id, log_text)

    def bot_for_user(self, args):
        user, costs = args

        client = CustomHuobiClient(access_key=user.api_key, secret_key=user.secret_key)
        orders = client.open_orders().data
        account_id = user.spot_account_id

        trades = user.trades.filter(
            Q(completed_at__isnull=True) | Q(completed_at__lte=timezone.now()),
            is_completed=False
        )

        for trade in trades:
            cost = costs[trade.symbol]
            price = cost.get('bid')
            order = list(filter(lambda i: i.get('client-order-id') == str(trade.id), orders.get('data', [])))

            if order:
                if float(trade.price) != price:
                    try:
                        res = client.submit_cancel(order_id=order[0].get('id')).data
                        filled = order[0].get('filled-amount')
                        trade.filled = float(trade.filled) + float(filled)
                        trade.save()
                        self.send_log(trade.user.id, f'{trade.id}: Order canceled. Old price: {trade.price}')
                    except HuobiRestiApiError:
                        self.complete_trade(trade)
                        continue

                    if res.get('status'):
                        self.place_order(client, trade, cost, price, account_id)

                continue

            if float(trade.price) > 0:
                # print('completed')
                self.complete_trade(trade)
                continue

            self.place_order(client, trade, cost, price, account_id)
