# Generated by Django 3.0.5 on 2022-04-24 16:13

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('main', '0013_auto_20220414_1456'),
    ]

    operations = [
        migrations.CreateModel(
            name='TakeProfitOrder',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order_id', models.CharField(max_length=255)),
                ('trade', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='take_profit_orders', to='main.Trade')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='take_profit_orders', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'db_table': 'main_take_profit_orders',
                'abstract': False,
            },
        ),
    ]
