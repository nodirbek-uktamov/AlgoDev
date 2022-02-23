from rest_framework import serializers
from core.utils.serializers import BaseSerializer, ValidatorSerializer


class GetResetLinkValidator(BaseSerializer):
    email = serializers.EmailField(required=True, write_only=True)


class ResetPasswordValidator(ValidatorSerializer):
    key = serializers.CharField(required=True)
    password = serializers.CharField(required=True, min_length=8)
