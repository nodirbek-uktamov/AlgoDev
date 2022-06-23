import time

import requests
import decimal
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from core.exchange.ftx import ftx_request, FTX_REST_API
from main.serializers.ftx import FTXOrderPlaceSerializer


class SymbolsListView(GenericAPIView):
    def get(self, request):
        response = requests.get(FTX_REST_API + '/markets').json()

        for i in response.get('result', []):
            i['priceIncrement'] = abs(decimal.Decimal(str(i['priceIncrement'])).as_tuple().exponent)
            i['sizeIncrement'] = abs(decimal.Decimal(str(i['sizeIncrement'])).as_tuple().exponent)

            if i['name'] == 'ETH-PERP':
                print(i)

        return Response(response)


class PositionsListView(GenericAPIView):
    def get(self, request):
        user = request.user
        response = ftx_request('/positions?showAvgPrice=true', 'GET', user)
        return Response(response)


class PlaceFTXOrderView(GenericAPIView):
    def post(self, request):
        user = request.user
        serializer = FTXOrderPlaceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.data
        data['market'] = data['symbol']
        data['side'] = data['trade_type']
        data['size'] = data['quantity']

        response = ftx_request('/orders', 'POST', user, json=data)
        return Response({'success': response.get('success') or False})
