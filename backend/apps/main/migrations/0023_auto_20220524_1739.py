# Generated by Django 3.0.5 on 2022-05-24 12:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0022_trade_stop_price'),
    ]

    operations = [
        migrations.AddField(
            model_name='trade',
            name='hft_buy_orders',
            field=models.TextField(default='{}'),
        ),
        migrations.AddField(
            model_name='trade',
            name='hft_sell_orders',
            field=models.TextField(default='{}'),
        ),
    ]
