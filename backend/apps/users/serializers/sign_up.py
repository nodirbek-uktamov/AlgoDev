import hmac
import time
import hashlib
from random import choice
from string import ascii_letters, digits

from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework.exceptions import AuthenticationFailed

from core.utils.serializers import ValidatorSerializer
from users.models import User
from django.conf import settings
from datetime import timedelta
from django.utils import timezone


class SignUpSerializer(serializers.ModelSerializer):
    def validate_email(self, email):
        User.objects.remove_unverified(email)
        return email

    def create(self, data):
        data['email'] = data['email'].lower()
        data['username'] = data['email']  # Use email as username
        user = User.objects.create_user(**data, is_active=True)
        return user

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 'api_key', 'secret_key')
        extra_kwargs = {
            'email': {'required': True, 'validators': [UniqueValidator(
                queryset=User.objects.unique_query(),
                message="User with this email already exists."
            )]},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'password': {'write_only': True},
            'api_key': {'write_only': True},
            'secret_key': {'write_only': True},
        }


class ConfirmationValidator(ValidatorSerializer):
    confirmation_code = serializers.CharField(required=True)


class TelegramSignUpSerializer(ValidatorSerializer):
    def verify_data(self, data):
        bot_token = settings.LOGIN_BOT_TOKEN
        if bot_token is None:
            raise AuthenticationFailed({'detail': 'Telegram login bot token not provided'})

        received_hash_string = data.get('hash')
        auth_date = data.get('auth_date')

        if received_hash_string is None or auth_date is None:
            raise AuthenticationFailed({'detail': 'hash or auth_date not provided'})

        data_check_string = ['{}={}'.format(k, v)
                             for k, v in data.items() if k != 'hash']
        data_check_string = '\n'.join(sorted(data_check_string))
        secret_key = hashlib.sha256(bot_token.encode()).digest()
        built_hash = hmac.new(secret_key,
                              msg=data_check_string.encode(),
                              digestmod=hashlib.sha256).hexdigest()
        current_timestamp = int(time.time())
        auth_timestamp = int(auth_date)
        if current_timestamp - auth_timestamp > 86400:
            raise AuthenticationFailed({'detail': 'Auth date is outdated'})
        if built_hash != received_hash_string:
            raise AuthenticationFailed({'detail': 'Invalid hash supplied'})
        return {
            'uid': data.get('id'),
            'username': data.get('username', ''),
            'first_name': data.get('first_name', ''),
            'last_name': data.get('last_name', ''),
        }

    def createOrUpdate(self, data):
        try:
            user = User.objects.get(username=data['uid'])
        except User.DoesNotExist:
            user = None
        if user:
            user.first_name = data['first_name']
            user.last_name = data['last_name']
            user.save()
        else:
            user_data = {
                'username': data['uid'],
                'email': data['username'],
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'verified_at': timezone.now(),
                'expires_user_at': (timezone.now() + timedelta(days=30)),
                'invitation_token': ''.join(choice(ascii_letters + digits) for i in range(8))
            }
            user = User.objects.create_user(**user_data, is_active=True)
        return user
