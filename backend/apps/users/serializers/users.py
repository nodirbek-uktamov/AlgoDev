from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import ModelSerializer

from core.utils.files import delete_file
from core.utils.serializers import ValidatorSerializer
from users.models import User


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'spot_account_id', 'margin_account_id')
        extra_kwargs = {
            'email': {'read_only': True},
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
