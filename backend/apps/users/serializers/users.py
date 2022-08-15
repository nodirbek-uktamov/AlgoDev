from django.conf import settings
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import ModelSerializer
from core.utils import hash
from core.utils.serializers import ValidatorSerializer
from users.models import User


class UserSerializer(ModelSerializer):
    def validate_ftx_secret_key(self, secret_key):
        new_secret_key = hash.decode(settings.DECODE_KEY, secret_key) if secret_key else None
        return new_secret_key

    def validate_huobi_secret_key(self, secret_key):
        new_secret_key = hash.decode(settings.DECODE_KEY, secret_key) if secret_key else None
        return new_secret_key

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['huobi_secret_key'] = "already saved" if instance.huobi_secret_key else None
        data['ftx_secret_key'] = "already saved" if instance.huobi_secret_key else None
        return data

    def update(self, instance, data):
        instance.huobi_api_key = data.get('huobi_api_key') or instance.huobi_api_key
        instance.huobi_secret_key = data.get('huobi_secret_key') or instance.huobi_secret_key
        instance.ftx_api_key = data.get('ftx_api_key') or instance.ftx_api_key
        instance.ftx_secret_key = data.get('ftx_secret_key') or instance.ftx_secret_key
        instance.ftx_sub_account = data.get('ftx_sub_account')

        if data.get('filled_audio'):
            instance.filled_audio = data.get('filled_audio')

        if data.get('new_order_audio'):
            instance.new_order_audio = data.get('new_order_audio')

        if isinstance(data.get('filled_audio_active'), bool):
            instance.filled_audio_active = data.get('filled_audio_active')

        if isinstance(data.get('new_order_audio_active'), bool):
            instance.new_order_audio_active = data.get('new_order_audio_active')

        instance.save()
        return instance

    class Meta:
        model = User
        fields = (
            'id',
            'first_name',
            'last_name',
            'email',
            'huobi_spot_account_id',
            'huobi_margin_account_id',
            'huobi_api_key',
            'huobi_secret_key',
            'ftx_api_key',
            'ftx_secret_key',
            'ftx_sub_account',

            'filled_audio',
            'filled_audio_active',
            'new_order_audio',
            'new_order_audio_active',
        )
        extra_kwargs = {
            'email': {'read_only': True},
            'huobi_secret_key': {'write_only': True},
            'ftx_secret_key': {'write_only': True},
        }


class SimpleUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name')


class ChangePasswordValidator(ValidatorSerializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_old_password(self, password):
        if not self.context['request'].user.check_password(password):
            raise ValidationError('Incorrect old password.')
        return password
