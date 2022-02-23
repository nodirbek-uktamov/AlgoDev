from django.conf import settings
from django.db import transaction
from django.template.loader import render_to_string
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.generics import CreateAPIView, GenericAPIView, get_object_or_404
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from users.models import User, ResetPassword
from users.serializers.reset_password import GetResetLinkValidator, ResetPasswordValidator
from users.utils.authentication import sign_in_response
from users.utils.emails import send_reset_link_email


class GetResetLinkView(CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = GetResetLinkValidator

    @transaction.atomic
    def perform_create(self, serializer):
        email = serializer.validated_data.get('email').lower()
        user = User.objects.filter(email=email, is_active=True).first()

        if not user:
            raise ValidationError({'email': ['There is not user with this email.']})

        reset = ResetPassword.objects.create(user=user)
        send_reset_link_email(self.request, reset, user)


class ResetPasswordView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ResetPasswordValidator

    def put(self, request):
        data = self.serializer_class.check(request.data)
        reset = get_object_or_404(ResetPassword, key=data.get('key'))

        if reset.expires_at < timezone.now():
            raise ValidationError({'key': ['Reset password token has expired.']})

        reset.user.set_password(data.get('password'))
        reset.user.save()

        return Response(sign_in_response(reset.user))
