import json

from rest_framework.response import Response
from rest_framework.views import APIView

from core.exchange.client import CustomHuobiClient


class OrdersListView(APIView):
    def _format_order(self, orders):
        new_orders = []

        for i in orders.get('data', []):
            new_orders.append({
                'orderPrice': i.get('price'),
                'orderSize': float(i.get('amount')),
                'symbol': i.get('symbol'),
                'type': i.get('type'),
                'orderId': i.get('id'),
                'orderStatus': i.get('state')
            })

        return new_orders

    def get(self, request, symbol):
        try:
            client = CustomHuobiClient(access_key=request.user.api_key, secret_key=request.user.secret_key)

            open_orders = self._format_order(client.open_orders().data)
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
