from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from core.exchange.client import CustomHuobiClient
import datetime

from main.serializers.orders import CancelAllOrdersSerializer


class OrdersListView(GenericAPIView):
    def _format_order(self, orders):
        new_orders = []

        for i in orders.get('data', []):
            type_list = i.get('type').split('-')

            new_orders.append({
                'orderPrice': i.get('price'),
                'orderSize': float(i.get('field-amount') if i.get('state') == 'filled' else i.get('amount')),
                'symbol': i.get('symbol'),
                'side': type_list[0],
                'type': type_list[-1],
                'orderId': i.get('id'),
                'orderStatus': i.get('state'),
                'time': datetime.datetime.fromtimestamp(i.get('created-at') / 1000.0).strftime("%H:%M:%S"),
            })

        return new_orders

    def get(self, request, symbol):
        try:
            client = CustomHuobiClient(access_key=request.user.huobi_api_key, secret_key=request.user._huobi_secret_key)

            open_orders = self._format_order(client.open_orders(symbol=symbol).data)
            canceled_orders = self._format_order(client.list_orders(symbol=symbol, states='canceled').data)
            filled_orders = self._format_order(client.list_orders(symbol=symbol, states='filled').data)
            take_profit_orders = list(map(lambda i: i.order_id, request.user.take_profit_orders.all()))

            return Response({
                'orders': [*open_orders, *canceled_orders, *filled_orders],
                'take_profit_orders': take_profit_orders
            })

        except Exception as e:
            print(str(e))
            return Response({'orders': [], 'take_profit_orders': []})


class CancelAllOrdersView(GenericAPIView):
    def post(self, request):
        data = CancelAllOrdersSerializer.check(request.data)
        client = CustomHuobiClient(access_key=request.user.huobi_api_key, secret_key=request.user._huobi_secret_key)

        if data.get('order_ids'):
            client.batch_cancel(order_ids=data.get('order_ids'))

            channel_layer = get_channel_layer()

            async_to_sync(channel_layer.group_send)(
                f'user_{request.user.id}',
                {
                    'type': 'chat_message',
                    'message': "Orders canceled"
                }
            )

        return Response({'ok': True})


class CancelOrderView(GenericAPIView):
    def post(self, request, order_id):
        try:
            client = CustomHuobiClient(access_key=request.user.huobi_api_key, secret_key=request.user._huobi_secret_key)
            client.submit_cancel(order_id=order_id)

            channel_layer = get_channel_layer()

            async_to_sync(channel_layer.group_send)(
                f'user_{request.user.id}',
                {
                    'type': 'chat_message',
                    'message': "Order canceled"
                }
            )

        except Exception as e:
            pass

        return Response({'ok': True})
