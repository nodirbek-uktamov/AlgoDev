# Generated by Django 3.0.5 on 2022-07-16 11:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0033_auto_20220706_1648'),
    ]

    operations = [
        migrations.AddField(
            model_name='trade',
            name='hft_orders_check_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]