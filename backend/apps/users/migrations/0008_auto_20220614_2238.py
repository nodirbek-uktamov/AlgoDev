# Generated by Django 3.0.5 on 2022-06-14 17:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_auto_20220614_2238'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='ftx_api_key',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='ftx_huobi_secret_key',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
