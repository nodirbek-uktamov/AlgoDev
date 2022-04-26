from rest_framework.response import Response
from rest_framework.views import APIView
from core.exchange.utils import generate_auth_params_ws


class BalanceView(APIView):
    def get(self, request):
        data = generate_auth_params_ws(request.user.api_key, request.user._secret_key)
        return Response(data, 201)
