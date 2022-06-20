import time

import requests
from rest_framework.exceptions import ValidationError
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from core.exchange.ftx import ftx_request, FTX_REST_API
from main.serializers.ftx import FTXOrderPlaceSerializer


class SymbolsListView(GenericAPIView):
    def get(self, request):
        response = requests.get(FTX_REST_API + '/markets').json()
        return Response(response)


class PositionsListView(GenericAPIView):
    def get(self, request):
        user = request.user
        response = ftx_request('/positions?showAvgPrice=true', 'GET', user._ftx_secret_key, user.ftx_api_key)
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

        response = ftx_request('/orders', 'POST', user._ftx_secret_key, user.ftx_api_key, json=data)
        return Response({'success': response.get('success') or False})
