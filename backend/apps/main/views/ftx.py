import requests
import decimal
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from core.exchange.ftx import ftx_request, get_markets, get_positions, get_open_orders, place_order
from core.tasks import send_log
from core.utils.logs import red
from main.serializers.ftx import ClosePositionSerializer


class SymbolsListView(GenericAPIView):
    def get(self, request):
        return Response(get_markets())


class PositionsListView(GenericAPIView):
    def get(self, request):
        return Response(get_positions(request.user))


class OpenOrdersListView(GenericAPIView):
    def get(self, request):
        response = get_open_orders(request.user)

        for i in response:
            i['orderSize'] = i['size']
            i['orderPrice'] = i['price']
            i['symbol'] = i['market']

        return Response(response)


class PositionMarketOrderView(GenericAPIView):
    def post(self, request):
        data = ClosePositionSerializer.check(request.data)
        side = 'sell' if data['side'] == 'buy' else 'buy'

        response = place_order(request.user, {
            'side': side,
            'size': float(data['size']),
            'market': data['future'],
            'type': 'market',
            'reduceOnly': True,
            'price': None
        })

        if response.get('error'):
            send_log(request.user.id, f'{data["future"]}: ERROR: {red(response["error"])}.')

        return Response({'success': response.get('success') or False})


# class PlaceFTXOrderView(GenericAPIView):
#     def post(self, request):
#         user = request.user
#         serializer = TradesSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#
#         # if
#         # data = serializer.data
#         # data['market'] = data['symbol']
#         # data['side'] = data['trade_type']
#         # data['size'] = data['quantity']
#         #
#         # response = ftx_request('/orders', 'POST', user, json=data)
#         return Response({})
