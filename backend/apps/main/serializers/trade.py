from rest_framework import serializers
from main.models import Trade


class TradesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = (
            'id',
            'symbol',
            'quantity',
            'trade_type',
            'loop',
            'time_interval',
        )
