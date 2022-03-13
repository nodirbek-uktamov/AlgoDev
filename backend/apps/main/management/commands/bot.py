import time
import requests
from asgiref.sync import async_to_sync
from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone
from core.utils.exchange import CustomHuobiClient
from users.models import User
from huobi.rest.error import HuobiRestiApiError
from channels.layers import get_channel_layer
import concurrent


class Command(BaseCommand):
    help = 'Loads all fixtures'

    def send_log(self, user_id, message):
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f'user_{user_id}',
            {
                'type': 'chat_message',
                'message': f'{timezone.now().strftime("%H:%M:%S")} {message}'
            }
        )

    def place_order(self, client, trade, cost, price, account_id):
        if trade.trade_type == 'sell':
            price = cost.get('ask')

        try:
            client.place(
                account_id=account_id,
                amount=float(trade.quantity) - float(trade.filled),
                symbol=trade.symbol,
                type=f'{trade.trade_type}-limit',
                price="{:.6f}".format(price),
                client_order_id=trade.id
            )
            trade.price = price
            trade.save()
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

            trade.save()

            self.send_log(trade.user.id, f'{trade.id}: ERROR: {error}')

    def complete_trade(self, trade):
        trade.completed_at = timezone.now() + timezone.timedelta(seconds=trade.time_interval)
        trade.is_completed = True if not trade.loop else False
        trade.price = 0
        trade.filled = 0
        trade.save()
        text = f'{trade.id}: Order completed.'

        if trade.loop:
            text += f' Waiting {trade.time_interval} seconds'

        self.send_log(trade.user.id, text)

    def handle(self, *args, **options):
        n = 0

        while not time.sleep(0.1):
            users = User.objects.filter(trades__isnull=False).distinct()

            print(users)
            n += 1
            print(n)
            costs_res = requests.get('https://api.huobi.pro/market/tickers').json()
            costs = {}

            for cost in costs_res.get('data', []):
                costs[cost.get('symbol')] = cost

            if users.count() > 0:
                with concurrent.futures.ThreadPoolExecutor(max_workers=users.count()) as pool:
                    pool.map(self.bot_for_user, [(user, costs) for user in users])

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
