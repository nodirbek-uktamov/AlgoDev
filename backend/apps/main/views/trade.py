import json

import requests
from rest_framework.generics import get_object_or_404, GenericAPIView
from rest_framework.response import Response
from asgiref.sync import async_to_sync
from rest_framework.views import APIView

from core.exchange.client import CustomHuobiClient
from core.exchange.ftx import get_open_orders, batch_cancel_orders
from core.exchange.utils import format_float
from main.models import Trade
from main.serializers.orders import OrderValidatorSerializer
from main.serializers.trade import TradesSerializer
from channels.layers import get_channel_layer


class TradeView(GenericAPIView):
    serializer_class = TradesSerializer

    def get(self, request, exchange):
        queryset = Trade.objects.filter(is_completed=False, user=request.user, exchange=exchange).order_by('-id')
        data = TradesSerializer(instance=queryset, many=True).data
        return Response(data)

    def post(self, request, exchange):
        serializer = TradesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)

        data = serializer.data

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'user_{request.user.id}',
            {
                'type': 'chat_message',
                'message': f"{data.get('id')}: Created"
            }
        )

        return Response(data, 201)


class TradeDetailView(APIView):
    def put(self, request, pk):
        trade = get_object_or_404(Trade, pk=pk, user=request.user)
        trade.is_completed = True
        trade.hft_orders_on_each_side = True
        trade.save()

        try:
            if trade.exchange == 'huobi':
                client = CustomHuobiClient(access_key=request.user.huobi_api_key, secret_key=request.user._huobi_secret_key)
                orders = client.open_orders().data

                active_orders = list(filter(lambda i: i.get('client-order-id') == str(trade.id), orders.get('data', [])))

                if trade.hft_bot:
                    old_order_ids = json.loads(trade.hft_order_ids)
                    active_orders = filter(lambda i: int(i.get('client-order-id')) in old_order_ids, orders.get('data', []))

                if trade.ladder:
                    old_order_ids = json.loads(trade.ladder_order_ids)
                    active_orders = filter(lambda i: str(i.get('id')) in old_order_ids, orders.get('data', []))

                if trade.grid_bot:
                    old_order_ids = json.loads(trade.active_order_ids)
                    active_orders = filter(lambda i: int(i.get('id')) in old_order_ids, orders.get('data', []))

                active_orders = list(map(lambda a: a['id'], active_orders))

                if active_orders:
                    client.batch_cancel(order_ids=active_orders)

            if trade.exchange == 'ftx':
                orders = get_open_orders(request.user)
                orders_for_cancel = []

                order = list(filter(lambda i: str(i.get('id')) == trade.order_id, orders))

                if order:
                    orders_for_cancel.append(str(order[0].get('id')))

                if trade.hft_bot:
                    old_order_ids = json.loads(trade.hft_order_ids)
                    active_orders = filter(lambda i: i.get('clientId') in old_order_ids, orders)
                    active_orders = list(map(lambda a: a['id'], active_orders))
                    orders_for_cancel = [*orders_for_cancel, *active_orders]

                if trade.ladder:
                    old_order_ids = json.loads(trade.ladder_order_ids)
                    active_orders = filter(lambda i: int(i.get('id')) in old_order_ids, orders)
                    active_orders = list(map(lambda a: a['id'], active_orders))
                    orders_for_cancel = [*orders_for_cancel, *active_orders]

                if trade.grid_bot:
                    old_order_ids = json.loads(trade.active_order_ids)
                    active_orders = filter(lambda i: int(i.get('id')) in old_order_ids, orders)
                    orders_for_cancel = [*orders_for_cancel, *active_orders]

                batch_cancel_orders(request.user, orders_for_cancel)
        except Exception as e:
            print(str(e))

        return Response({'ok': True})


class CancelTradesView(APIView):
    def put(self, request, exchange):
        trades = Trade.objects.filter(user=request.user, is_completed=False)
        trades_list = list(trades)
        trades.update(is_completed=True, hft_orders_on_each_side=0)

        channel_layer = get_channel_layer()

        if exchange == 'ftx':
            orders = get_open_orders(request.user)
            orders_for_cancel = []

            print(trades_list)

            for trade in trades_list:
                order = list(filter(lambda i: str(i.get('id')) == trade.order_id, orders))

                if order:
                    orders_for_cancel.append(str(order[0].get('id')))

                if trade.hft_bot:
                    old_order_ids = json.loads(trade.hft_order_ids)
                    active_orders = filter(lambda i: i.get('clientId') in old_order_ids, orders)
                    active_orders = list(map(lambda a: a['id'], active_orders))
                    orders_for_cancel = [*orders_for_cancel, *active_orders]

                if trade.ladder:
                    old_order_ids = json.loads(trade.ladder_order_ids)
                    active_orders = filter(lambda i: int(i.get('id')) in old_order_ids, orders)
                    active_orders = list(map(lambda a: a['id'], active_orders))
                    orders_for_cancel = [*orders_for_cancel, *active_orders]

                if trade.grid_bot:
                    old_order_ids = json.loads(trade.active_order_ids)
                    active_orders = filter(lambda i: int(i.get('id')) in old_order_ids, orders)
                    orders_for_cancel = [*orders_for_cancel, *active_orders]

            batch_cancel_orders(request.user, orders_for_cancel)

        try:
            if exchange == 'huobi':
                client = CustomHuobiClient(access_key=request.user.huobi_api_key, secret_key=request.user._huobi_secret_key)
                orders = client.open_orders().data
                orders_for_cancel = []

                for trade in trades_list:
                    order = list(filter(lambda i: i.get('client-order-id') == str(trade.id), orders.get('data', [])))

                    if order:
                        orders_for_cancel.append(str(order[0].get('id')))

                    if trade.hft_bot:
                        old_order_ids = json.loads(trade.hft_order_ids)
                        active_orders = filter(lambda i: int(i.get('client-order-id')) in old_order_ids, orders.get('data', []))
                        active_orders = list(map(lambda a: a['id'], active_orders))
                        orders_for_cancel = [*orders_for_cancel, *active_orders]

                    if trade.ladder:
                        old_order_ids = json.loads(trade.ladder_order_ids)
                        active_orders = filter(lambda i: str(i.get('id')) in old_order_ids, orders.get('data', []))
                        active_orders = list(map(lambda a: a['id'], active_orders))
                        orders_for_cancel = [*orders_for_cancel, *active_orders]

                    if trade.grid_bot:
                        old_order_ids = json.loads(trade.active_order_ids)
                        active_orders = filter(lambda i: int(i.get('id')) in old_order_ids, orders.get('data', []))
                        orders_for_cancel = [*orders_for_cancel, *active_orders]

                if orders_for_cancel:
                    client.batch_cancel(order_ids=orders_for_cancel)

            async_to_sync(channel_layer.group_send)(
                f'user_{request.user.id}',
                {
                    'type': 'chat_message',
                    'message': "Trades canceled"
                }
            )
            trades.update(is_completed=True)

        except Exception as e:
            print(str(e))

        return Response({'ok': True})


class MarketOrderView(GenericAPIView):
    serializer_class = OrderValidatorSerializer

    def post(self, request):
        data = OrderValidatorSerializer.check(request.data)
        client = CustomHuobiClient(access_key=request.user.huobi_api_key, secret_key=request.user._huobi_secret_key)

        if data['side'] == 'buy':
            tickers = requests.get('https://api.huobi.pro/market/tickers').json()
            price = 0

            for cost in tickers.get('data', []):
                if cost['symbol'] == data['symbol']:
                    price = cost['ask']

            data['order_size'] *= price

        client.place(
            account_id=request.user.huobi_spot_account_id,
            amount=format_float(data['order_size'], data['amount_precision']),
            symbol=data['symbol'],
            type=f'{data["side"]}-market',
        )

        return Response({'ok': True})


class LimitOrderView(GenericAPIView):
    serializer_class = OrderValidatorSerializer

    def post(self, request):
        data = OrderValidatorSerializer.check(request.data)
        client = CustomHuobiClient(access_key=request.user.huobi_api_key, secret_key=request.user._huobi_secret_key)

        tickers = requests.get('https://api.huobi.pro/market/tickers').json()
        price = 0

        for cost in tickers.get('data', []):
            if cost['symbol'] == data['symbol']:
                if data['side'] == 'buy':
                    price = cost['bid']

                if data['side'] == 'sell':
                    price = cost['ask']

        client.place(
            account_id=request.user.huobi_spot_account_id,
            amount=format_float(data['order_size'], data['amount_precision']),
            symbol=data['symbol'],
            type=f'{data["side"]}-limit',
            price=format_float(price, data['price_precision'])
        )
        return Response({'ok': True})
