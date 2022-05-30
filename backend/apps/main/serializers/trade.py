import json

from rest_framework import serializers
from main.models import Trade, LadderTrade
from main.serializers.ladder import LadderTradesSerializer


class TradesSerializer(serializers.ModelSerializer):
    completed_icebergs = serializers.IntegerField(read_only=True)
    active_order_ids = serializers.SerializerMethodField(read_only=True)
    ladder_trades = LadderTradesSerializer(many=True, write_only=True, required=False)

    def get_active_order_ids(self, obj):
        return json.loads(obj.active_order_ids)

    def validate(self, data):
        if not data.get('loop'):
            data['time_interval'] = 0

        if not data.get('iceberg'):
            data['icebergs_count'] = 0
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

        if data.get('hft_bot'):
            data['loop'] = False
            data['time_interval'] = 0
            data['iceberg'] = False
            data['icebergs_count'] = 0
            data['market_making'] = False

        else:
            data['hft_default_price_difference'] = 0
            data['hft_orders_price_difference'] = 0
            data['hft_orders_on_each_side'] = 0

        data['symbol'] = data['symbol'].lower()

        if data.get('limit') or data.get('market'):
           data['loop'] = False

        if data.get('ladder'):
            data['loop'] = False
        else:
            data['ladder_trades'] = []
            data['ladder_trades_count'] = 0
            data['ladder_start_price'] = 0
            data['ladder_end_price'] = 0

        return data

    def create(self, data):
        ladder_trades = data.pop('ladder_trades', [])
        instance = super().create(data)

        ladder_trades_for_create = []

        for i in ladder_trades:
            ladder_trades_for_create.append(
                LadderTrade(
                    amount=i['amount'],
                    stop_loss=i['stop_loss'],
                    take_profit=i['take_profit'],
                    price=i['price'],
                    trade=instance,
                )
            )

        LadderTrade.objects.bulk_create(ladder_trades_for_create)
        return instance

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

            'hft_default_price_difference',
            'hft_orders_price_difference',
            'hft_orders_on_each_side',
            'hft_bot',
            'active_order_ids',

            'stop',
            'stop_percent',
            'stop_price',

            'limit',
            'limit_price',

            'market',

            'ladder_trades',
            'ladder',
            'ladder_trades_count',
            'ladder_start_price',
            'ladder_end_price',
        )
