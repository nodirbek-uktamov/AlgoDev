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
        type = data.get('type')
        trade_type = data.get('trade_type')
        client = HuobiRestClient(secret_key=request.user.secret_key, access_key=request.user.api_key)
        accounts = client.accounts().data
        print(accounts)

        price = data.get('price')

        if type == 'market':
            price = None

        try:
            client.place(account_id=45712554, price=price, amount=data.get('quantity'), symbol=data.get('symbol'), type=f'{trade_type}-{type}')
        except HuobiRestiApiError as e:
            error = str(e)
            error = error.split('POST:')[0].split('-error:')[1]
            raise ValidationError({'message': error})

        return Response({}, 201)
