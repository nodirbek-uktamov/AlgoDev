# Generated by Django 3.0.5 on 2022-06-10 15:22
import sys

from django.conf import settings
from django.db import migrations
from core.utils import hash
from users.models import User


# def regenerate_huobi_secret_keys(*args, **kwargs):
#     new_decode_key = settings.DECODE_KEY
#
#     if not new_decode_key:
#         print('\n\nRunning migrations stopped. SET DECODE_KEY variable on settings_dev.py. If you want to generate new one, run: "python manage.py generate_decode_key"')
#         sys.exit()
#
#     for user in User.objects.all():
#         try:
#             secret_key = hash.encode(user.decode_key, user.secret_key)
#             user.secret_key = hash.decode(new_decode_key, secret_key)
#             user.decode_key = ''
#             user.save()
#
#         except Exception as e:
#             pass


class Migration(migrations.Migration):
    dependencies = [
        ('main', '0027_auto_20220530_2112'),
    ]

    operations = [
        # migrations.RunPython(regenerate_huobi_secret_keys)
    ]
