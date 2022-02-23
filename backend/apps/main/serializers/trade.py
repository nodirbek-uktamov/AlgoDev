from rest_framework import serializers
from core.utils.serializers import ValidatorSerializer


class TradeSerializer(ValidatorSerializer):
    type = serializers.CharField()
    price = serializers.FloatField(required=False)
    quantity = serializers.FloatField()
    symbol = serializers.CharField()
    trade_type = serializers.CharField()
