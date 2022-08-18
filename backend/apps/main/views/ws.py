from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from core.exchange.ftx import generate_ftx_auth_params_ws
from core.exchange.utils import generate_huobi_auth_params_ws


class AuthParamsView(GenericAPIView):
    def get(self, request, exchange):
        data = {}

        if exchange == 'huobi':
            data = generate_huobi_auth_params_ws(request.user.huobi_api_key, request.user._huobi_secret_key)
        if exchange == 'ftx':
            data = generate_ftx_auth_params_ws(request.user.ftx_api_key, request.user._ftx_secret_key, request.user.ftx_sub_account)

        return Response(data, 201)
