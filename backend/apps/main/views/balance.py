from huobi.rest.error import HuobiRestiApiError
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from main.serializers.trade import TradeSerializer
from huobi import HuobiRestClient


class BalanceView(APIView):
    def get(self, request):
        print('asd')
        return Response({}, 201)
