# Generated by Django 3.0.5 on 2022-03-20 07:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_trade_filled'),
    ]

    operations = [
        migrations.AddField(
            model_name='trade',
            name='chase_bot',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='trade',
            name='chase_bot_completed_trades',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='trade',
            name='chase_bot_duration',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='trade',
            name='completed_icebergs',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='trade',
            name='iceberg',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='trade',
            name='icebergs_count',
            field=models.IntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='trade',
            name='market_making',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='trade',
            name='market_making_array',
            field=models.TextField(default=''),
        ),
    ]
