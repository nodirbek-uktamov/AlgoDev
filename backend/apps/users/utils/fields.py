from datetime import timedelta

from django.utils import timezone


def expires_default():
    return timezone.now() + timedelta(days=30)


def expires_hour():
    return timezone.now() + timedelta(hours=1)
