# Generated by Django 3.0.5 on 2022-08-17 15:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_auto_20220816_1302'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='alert_message_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='user',
            name='orderbook_animation_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='user',
            name='trades_list_animation_active',
            field=models.BooleanField(default=True),
        ),
    ]
