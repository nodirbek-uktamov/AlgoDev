from huobi.rest.error import HuobiRestiApiError
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from main.serializers.trade import TradeSerializer
from huobi import HuobiRestClient


class TradeView(APIView):
    def post(self, request):
        request.data['price'] = request.data['price'] or 0
        data = TradeSerializer.check(data=request.data)
        return Response({}, 201)
