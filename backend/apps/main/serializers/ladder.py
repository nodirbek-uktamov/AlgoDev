from rest_framework import serializers
from main.models import LadderTrade


class LadderTradesSerializer(serializers.ModelSerializer):
    class Meta:
        model = LadderTrade
        fields = (
            'id',
            'amount',
            'stop_loss',
            'take_profit',
            'price',
        )
