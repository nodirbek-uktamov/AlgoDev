from rest_framework import serializers
from core.utils.serializers import ValidatorSerializer
from main.models import SymbolSetting, HUOBI


class OrderValidatorSerializer(ValidatorSerializer):
    order_price = serializers.FloatField()
    order_size = serializers.FloatField()
    symbol = serializers.CharField()
    side = serializers.CharField()

    def validate(self, data):
        symbol_setting = SymbolSetting.objects.get(symbol=data['symbol'], exchange=HUOBI)
        data['amount_precision'] = symbol_setting.amount_precision
        data['price_precision'] = symbol_setting.price_precision

        data['side'] = 'sell' if data['side'] == 'buy' else 'buy'
        return data


class CancelAllOrdersSerializer(ValidatorSerializer):
    order_ids = serializers.ListField(child=serializers.IntegerField())
