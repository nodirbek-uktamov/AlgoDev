import json
import threading

from channels.layers import get_channel_layer
from django.contrib.auth.models import AbstractUser
from django.db import models
from asgiref.sync import async_to_sync

from core.utils.exchange import twap_bot_order_interval


class Trade(models.Model):
    SELL = 'sell'
    BUY = 'buy'

    TRADE_TYPES = (
        (SELL, 'Sell'),
        (BUY, 'Buy'),
    )

    symbol = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=20, decimal_places=10)
    trade_type = models.CharField(max_length=255, choices=TRADE_TYPES)
    loop = models.BooleanField(default=False)
    time_interval = models.IntegerField(default=60)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    user = models.ForeignKey('users.User', models.CASCADE, 'trades')
    price = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    filled = models.DecimalField(max_digits=20, decimal_places=10, default=0)

    iceberg = models.BooleanField(default=False)
    icebergs_count = models.IntegerField(default=0, null=True, blank=True)
    iceberg_prices_sum = models.DecimalField(max_digits=20, decimal_places=10,
                                             default=0)  # for calculating price of take profit
    iceberg_price = models.DecimalField(max_digits=20, decimal_places=10, default=0)
    take_profit = models.BooleanField(default=False)
    take_profit_percent = models.FloatField(default=0)
    completed_icebergs = models.IntegerField(default=0)

    market_making = models.BooleanField(default=False)
    market_making_array = models.TextField(default='')

    twap_bot = models.BooleanField(default=False)
    twap_bot_duration = models.IntegerField(default=0)
    twap_bot_completed_trades = models.IntegerField(default=0)

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
            amount = self.quantity / trades_count

        return amount

    def save(self, *args, **kwargs):
        channel_layer = get_channel_layer()

        t = threading.Thread(target=async_to_sync(channel_layer.group_send), args=(
            f'user_{self.user.id}',
            {
                'type': 'chat_message',
                'message': "",
                'action': {'filled_amount': self.filled_amount, 'trade': self.id}
            }
        ))
        t.daemon = True
        t.start()

        super().save(*args, **kwargs)

    class Meta(AbstractUser.Meta):
        db_table = 'main_trades'
