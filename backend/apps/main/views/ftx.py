import requests
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response


class SymbolsListView(GenericAPIView):
    def get(self, request):
        response = requests.get('https://ftx.com/api/markets').json()
        return Response(response)
