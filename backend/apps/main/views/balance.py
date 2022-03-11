from rest_framework.response import Response
from rest_framework.views import APIView


class BalanceView(APIView):
    def get(self, request):
        print('asd')
        return Response({}, 201)
