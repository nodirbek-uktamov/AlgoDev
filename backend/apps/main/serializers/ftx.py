from rest_framework import serializers


class FTXOrderPlaceSerializer(serializers.Serializer):
    quantity = serializers.DecimalField(max_digits=20, decimal_places=10)
    price = serializers.DecimalField(max_digits=20, decimal_places=10)
    symbol = serializers.CharField()
    trade_type = serializers.CharField()
    bot_type = serializers.CharField()
