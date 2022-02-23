from random import choice
from string import ascii_letters, digits

from django.db import transaction
from django.utils import timezone
from rest_framework.generics import GenericAPIView, get_object_or_404, CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import timedelta

from users.models import User
from users.serializers.sign_up import SignUpSerializer, ConfirmationValidator
from users.utils.authentication import sign_in_response
from users.utils.emails import send_verification_email


class SignUpView(CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = SignUpSerializer

    @transaction.atomic
    def perform_create(self, serializer):
        user = serializer.save()
        # send_verification_email(self.request, user)


class ResendConfirmationEmailView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk, verified_at=None, is_active=False)
        send_verification_email(self.request, user)
        return Response(status=200)


class ConfirmView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ConfirmationValidator

    def post(self, request):
        data = ConfirmationValidator.check(request.data)
        code = data.get('confirmation_code')
        user = get_object_or_404(
            User,
            confirmation_code=code,
            verified_at=None,
            is_active=False,
        )
        user.verified_at = timezone.now()
        user.expires_user_at = (timezone.now() + timedelta(days=30))
        user.is_active = True
        user.save()

        return Response(sign_in_response(user))
