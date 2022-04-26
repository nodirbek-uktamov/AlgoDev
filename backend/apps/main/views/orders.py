from rest_framework.response import Response
from rest_framework.views import APIView
from core.exchange.client import CustomHuobiClient
import datetime


class OrdersListView(APIView):
    def _format_order(self, orders):
        new_orders = []

        for i in orders.get('data', []):
            new_orders.append({
                'orderPrice': i.get('price'),
                'orderSize': float(i.get('field-amount') if i.get('state') == 'filled' else i.get('amount')),
                'symbol': i.get('symbol'),
                'side': i.get('type').split('-')[0],
                'type': i.get('type').split('-')[1],
                'orderId': i.get('id'),
                'orderStatus': i.get('state'),
                'time': datetime.datetime.fromtimestamp(i.get('created-at') / 1000.0).strftime("%H:%M:%S"),
            })

        return new_orders

    def get(self, request, symbol):
        try:
            client = CustomHuobiClient(access_key=request.user.api_key, secret_key=request.user._secret_key)

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
