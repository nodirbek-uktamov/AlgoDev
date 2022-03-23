from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from core.utils.exchange import save_account_ids
from users.serializers.sign_in import SignInSerializer
from users.utils.authentication import sign_in_response


class SignInView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = SignInSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        save_account_ids(user)
        return Response(sign_in_response(user))
