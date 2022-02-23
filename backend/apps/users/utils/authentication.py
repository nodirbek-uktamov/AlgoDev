from django.utils import timezone
from django.utils.translation import ugettext as _
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

from users.models import Token
from users.serializers.users import UserSerializer


class CustomTokenAuthentication(TokenAuthentication):
    def authenticate_credentials(self, key):
        token = Token.objects.select_related('user').filter(key=key, expires_at__gte=timezone.now()).first()

        if token is None:
            raise AuthenticationFailed({'detail': _('Invalid or expired token.'), 'logout': 'true'})

        if not token.user.is_active:
            raise AuthenticationFailed({'detail': _('User inactive or deleted.'), 'logout': 'true'})

        if not token.is_active:
            raise AuthenticationFailed({'detail': _('Your token is not active.'), 'logout': 'true'})

        return token.user, token


def sign_in_response(user):
    permissions = list(user.get_all_permissions())
    token = Token.objects.create(user=user)
    data = UserSerializer(user).data
    return {'token': token.key, 'user': data, 'permissions': permissions}
