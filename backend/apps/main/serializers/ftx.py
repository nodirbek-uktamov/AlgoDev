from rest_framework import serializers
from core.utils.serializers import ValidatorSerializer
from main.models import Trade


class ClosePositionSerializer(ValidatorSerializer):
    size = serializers.DecimalField(max_digits=30, decimal_places=15)
    side = serializers.ChoiceField(choices=Trade.TRADE_TYPES)
    future = serializers.CharField()
