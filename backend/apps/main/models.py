from django.contrib.auth.models import AbstractUser
from django.db import models


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

    class Meta(AbstractUser.Meta):
        db_table = 'main_trades'
