import json
import threading

from channels.layers import get_channel_layer
from django.contrib.auth.models import AbstractUser
from django.db import models
from asgiref.sync import async_to_sync

from core.utils.exchange import twap_bot_order_interval

HUOBI = 'huobi'
FTX = 'ftx'

EXCHANGES = (
    (HUOBI, 'Huobi'),
    (FTX, 'FTX'),
)


class Trade(models.Model):
    SELL = 'sell'
    BUY = 'buy'

    TRADE_TYPES = (
        (SELL, 'Sell'),
        (BUY, 'Buy'),
    )

    exchange = models.CharField(max_length=255, choices=EXCHANGES)

    symbol = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=30, decimal_places=15)
    trade_type = models.CharField(max_length=255, choices=TRADE_TYPES)
    loop = models.BooleanField(default=False)
    completed_loops = models.IntegerField(default=0)
    time_interval = models.IntegerField(default=60)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    user = models.ForeignKey('users.User', models.CASCADE, 'trades')
    price = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    filled = models.DecimalField(max_digits=20, decimal_places=10, default=0)

    iceberg = models.BooleanField(default=False)
    icebergs_count = models.IntegerField(default=0, null=True, blank=True)
    iceberg_prices_sum = models.DecimalField(
        max_digits=20,
        decimal_places=10,
        default=0
)  # for calculating price of take profit
    iceberg_price = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    take_profit = models.BooleanField(default=False)
    take_profit_percent = models.FloatField(default=0)
    completed_icebergs = models.IntegerField(default=0)

    ladder = models.BooleanField(default=False)
    ladder_trades_count = models.IntegerField(default=0, null=True, blank=True)
    ladder_start_price = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    ladder_end_price = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    ladder_order_ids = models.TextField(default='[]')
    ladder_prices_sum = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    ladder_completed_orders = models.IntegerField(default=0)

    market_making = models.BooleanField(default=False)
    market_making_array = models.TextField(default='')

    chase_bot = models.BooleanField(default=False)

    twap_bot = models.BooleanField(default=False)
    twap_bot_duration = models.IntegerField(default=0)
    twap_bot_completed_trades = models.IntegerField(default=0)

    grid_bot = models.BooleanField(default=False)
    grid_trades_count = models.IntegerField(default=0)
    grid_start_price = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    grid_end_price = models.DecimalField(max_digits=20, decimal_places=10, default=0)

    hft_bot = models.BooleanField(default=False)
    hft_default_price_difference = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    hft_orders_price_difference = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    hft_orders_on_each_side = models.IntegerField(default=0)
    hft_order_ids = models.TextField(default='[]')

    hft_orders_check_time = models.DateTimeField(null=True, blank=True)

    hft_buy_orders = models.TextField(default='{}')
    hft_sell_orders = models.TextField(default='{}')

    stop = models.BooleanField(default=False)
    stop_percent = models.FloatField(default=0)

    stop_price = models.DecimalField(max_digits=20, decimal_places=10, default=0)

    limit = models.BooleanField(default=False)
    limit_price = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    market = models.BooleanField(default=False)

    order_id = models.CharField(max_length=255, null=True, blank=True)

    active_order_ids = models.TextField(default='[]')

    reduce_only = models.BooleanField(default=False)
    post_only = models.BooleanField(default=False)

    is_canceled = models.BooleanField(default=False)

    @property
    def filled_amount(self):
        amount = 0

        if self.iceberg:
            amount = float(self.quantity)
            amount = amount / self.icebergs_count * self.completed_icebergs

            if self.market_making:
                array = json.loads(self.market_making_array or '[]')
                amount = sum(array[:self.completed_icebergs])

        if self.twap_bot:
            trades_count = int(self.twap_bot_duration / twap_bot_order_interval) or 1
            amount = (self.quantity / trades_count) * self.twap_bot_completed_trades

        return float(amount)

    def send_data_to_frontend(self):
        channel_layer = get_channel_layer()

        t = threading.Thread(target=async_to_sync(channel_layer.group_send), args=(
            f'user_{self.user.id}',
            {
                'type': 'chat_message',
                'message': "",
                'action': {
                    'filled_amount': self.filled_amount, 'trade': self.id,
                    'active_order_ids': json.loads(self.active_order_ids)
                }
            }
        ))
        t.daemon = True
        t.start()

    class Meta(AbstractUser.Meta):
        db_table = 'main_trades'
        verbose_name_plural = 'Trades'
        verbose_name = 'Trade'


class TakeProfitOrder(models.Model):
    user = models.ForeignKey('users.User', models.CASCADE, 'take_profit_orders')
    trade = models.ForeignKey(Trade, models.CASCADE, 'take_profit_orders')
    order_id = models.CharField(max_length=255)

    def save(self, *args, **kwargs):
        channel_layer = get_channel_layer()

        t = threading.Thread(target=async_to_sync(channel_layer.group_send), args=(
            f'user_{self.user.id}',
            {
                'type': 'chat_message',
                'message': "",
                'action': {'take_profit_order': self.order_id}
            }
        ))
        t.daemon = True
        t.start()

        super().save(*args, **kwargs)

    class Meta(AbstractUser.Meta):
        db_table = 'main_take_profit_orders'


class SymbolSetting(models.Model):
    amount_precision = models.IntegerField()
    price_precision = models.IntegerField()
    min_price = models.DecimalField(max_digits=30, decimal_places=15)
    symbol = models.CharField(max_length=255)

    exchange = models.CharField(max_length=255, choices=EXCHANGES)


class LadderTrade(models.Model):
    amount = models.IntegerField()  # in amount_percent
    stop_loss = models.IntegerField()  # in stop_loss_percent
    take_profit = models.IntegerField()  # in take_profit_percent

    price = models.DecimalField(max_digits=30, decimal_places=15)

    order_id = models.CharField(max_length=255, null=True, blank=True)
    stop_loss_order_id = models.CharField(max_length=255, null=True, blank=True)
    take_profit_order_id = models.CharField(max_length=255, null=True, blank=True)

    is_limit_completed = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)

    trade = models.ForeignKey(Trade, models.CASCADE, 'ladder_trades')
