from rest_framework import serializers
from main.models import Trade


class TradesSerializer(serializers.ModelSerializer):
    completed_icebergs = serializers.IntegerField(read_only=True)
    filled_amount = serializers.SerializerMethodField(read_only=True)

    def get_filled_amount(self, obj):
        return obj.filled_amount

    def validate(self, data):
        if not data.get('loop'):
            data['time_interval'] = 0

        if not data.get('iceberg'):
            data['icebergs_count'] = 0
            data['take_profit'] = False
            data['market_making'] = False
            data['iceberg_price'] = 0

        if not data.get('take_profit'):
            data['take_profit_percent'] = 0

        if data.get('twap_bot'):
            data['loop'] = False
            data['time_interval'] = 0
            data['iceberg'] = False
            data['icebergs_count'] = 0
            data['market_making'] = False

        else:
            data['twap_bot_duration'] = 0

        if data.get('grid_bot'):
            data['loop'] = False
            data['time_interval'] = 0
            data['iceberg'] = False
            data['icebergs_count'] = 0
            data['market_making'] = False

        else:
            data['grid_trades_count'] = 0
            data['grid_start_price'] = 0
            data['grid_end_price'] = 0

        data['symbol'] = data['symbol'].lower()

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
            'twap_bot',
            'twap_bot_duration',
            'take_profit',
            'take_profit_percent',
            'iceberg_price',
            'quantity',
            'filled_amount',
            'completed_loops',
            'grid_bot',
            'grid_trades_count',
            'grid_start_price',
            'grid_end_price',
        )
