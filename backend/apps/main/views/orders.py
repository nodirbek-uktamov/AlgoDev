import json

from rest_framework.response import Response
from rest_framework.views import APIView

from core.exchange.client import CustomHuobiClient


class OpenOrdersListView(APIView):
    def get(self, request):
        client = CustomHuobiClient(access_key=request.user.api_key, secret_key=request.user.secret_key)
        orders = client.open_orders().data
        results = []

        for i in orders.get('data', []):
            results.append({
                'orderPrice': i.get('price'),
                'orderSize': float(i.get('amount')),
                'symbol': i.get('symbol'),
                'type': i.get('type'),
                'orderId': i.get('id')
            })

        return Response(results)
