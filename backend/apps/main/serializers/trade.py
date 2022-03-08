from rest_framework import serializers
from core.utils.serializers import ValidatorSerializer


class TradeSerializer(serializers.ModelSerializer):
    quantity = serializers.FloatField()
    symbol = serializers.CharField()
    trade_type = serializers.CharField()
