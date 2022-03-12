import time
import requests
from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone
from core.utils.exchange import CustomHuobiClient
from users.models import User
from huobi.rest.error import HuobiRestiApiError


class Command(BaseCommand):
    help = 'Loads all fixtures'

    def place_order(self, client, trade, cost, price, account_id):
        if trade.trade_type == 'sell':
            price = cost.get('ask')

        try:
            client.place(
                account_id=account_id,
                amount=float(trade.quantity),
                symbol=trade.symbol,
                type=f'{trade.trade_type}-limit',
                price="{:.6f}".format(price),
                client_order_id=trade.id
            )
            print('placed: ', timezone.now())
            trade.price = price
            trade.save()

        except Exception as e:
            # some error with huobi
            trade.completed_at = timezone.now() + timezone.timedelta(seconds=10)
            trade.save()
            print(str(e))

    def complete_trade(self, trade):
        trade.completed_at = timezone.now() + timezone.timedelta(seconds=trade.time_interval)
        trade.is_completed = True if not trade.loop else False
        trade.price = 0
        trade.save()

    def handle(self, *args, **options):
        users = User.objects.filter(trades__isnull=False).distinct()
        n = 0

        while not time.sleep(0.1):
            n += 1
            costs_res = requests.get('https://api.huobi.pro/market/tickers').json()
            costs = {}

            for cost in costs_res.get('data', []):
                costs[cost.get('symbol')] = cost

            for user in users:
                client = CustomHuobiClient(access_key=user.api_key, secret_key=user.secret_key)
                orders = client.open_orders().data
                account_id = user.spot_account_id

                trades = user.trades.filter(
                    Q(completed_at__isnull=True) | Q(completed_at__lte=timezone.now()),
                    is_completed=False
                )

                for trade in trades:
                    print(trade.id)
                    cost = costs[trade.symbol]
                    price = cost.get('bid')
                    order = list(filter(lambda i: i.get('client-order-id') == str(trade.id), orders.get('data', [])))

                    if order:
                        if float(trade.price) != price:
                            try:
                                res = client.submit_cancel(order_id=order[0].get('id')).data
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
