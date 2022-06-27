import requests
import decimal
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from core.exchange.ftx import ftx_request, get_markets, get_positions


class SymbolsListView(GenericAPIView):
    def get(self, request):
        return Response(get_markets())


class PositionsListView(GenericAPIView):
    def get(self, request):
        return Response(get_positions(request.user))


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
