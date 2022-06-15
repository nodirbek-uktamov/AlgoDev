import requests
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from core.exchange.ftx import ftx_request, FTX_REST_API


class SymbolsListView(GenericAPIView):
    def get(self, request):
        response = requests.get(FTX_REST_API + '/markets').json()
        return Response(response)


class PositionsListView(GenericAPIView):
    def get(self, request):
        user = request.user
        response = ftx_request('/positions?showAvgPrice=true', user._ftx_secret_key, user.ftx_api_key)
        return Response(response)
