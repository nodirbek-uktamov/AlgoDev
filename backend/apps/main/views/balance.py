from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from core.exchange.utils import generate_auth_params_ws


class BalanceView(GenericAPIView):
    def get(self, request):
        data = generate_auth_params_ws(request.user.huobi_api_key, request.user._huobi_secret_key)
        return Response(data, 201)
