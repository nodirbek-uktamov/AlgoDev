import requests
import decimal
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from core.exchange.ftx import ftx_request, get_markets, get_positions, get_open_orders


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
