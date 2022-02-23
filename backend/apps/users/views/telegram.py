from rest_framework.permissions import AllowAny
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from users.serializers.sign_up import TelegramSignUpSerializer
from users.utils.authentication import sign_in_response


class TelegramAuth(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = TelegramSignUpSerializer

    def get(self, request):
        serializer = self.serializer_class()
        data = serializer.verify_data(request.query_params)
        user = serializer.createOrUpdate(data)
        return Response(sign_in_response(user))
