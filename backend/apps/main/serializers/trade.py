from rest_framework import serializers
from main.models import Trade


class TradesSerializer(serializers.ModelSerializer):
    completed_icebergs = serializers.IntegerField(read_only=True)

    def validate(self, data):
        if not data.get('loop'):
            data['time_interval'] = 0

        if not data.get('iceberg'):
            data['icebergs_count'] = 0
            data['market_making'] = False

        if data.get('chase_bot'):
            data['loop'] = False
            data['time_interval'] = 0
            data['iceberg'] = False
            data['icebergs_count'] = 0
            data['market_making'] = False

        else:
            data['chase_bot_duration'] = 0

        return data

    class Meta:
        model = Trade
        fields = (
            'id',
            'symbol',
            'quantity',
            'trade_type',
            'loop',
            'time_interval',
            'iceberg',
            'icebergs_count',
            'market_making',
            'completed_icebergs',
            'chase_bot',
            'chase_bot_duration',
        )
