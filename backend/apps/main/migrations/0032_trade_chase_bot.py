# Generated by Django 3.0.5 on 2022-07-02 10:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0031_auto_20220627_2119'),
    ]

    operations = [
        migrations.AddField(
            model_name='trade',
            name='chase_bot',
            field=models.BooleanField(default=False),
        ),
    ]
