import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models

from core.models import BaseModel
from users.querysets.user import UsersManager
from users.utils import tokens
from users.utils.fields import expires_default, expires_hour
from core.utils import hash


class User(AbstractUser):
    email = models.EmailField(unique=True)  # override default email field
    confirmation_code = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    expires_user_at = models.DateField(null=True, blank=True)
    objects = UsersManager()

    huobi_api_key = models.CharField(max_length=255, null=True, blank=True)
    huobi_secret_key = models.CharField(max_length=255, null=True, blank=True)
    huobi_spot_account_id = models.IntegerField(null=True, blank=True)
    huobi_margin_account_id = models.IntegerField(null=True, blank=True)

    ftx_api_key = models.CharField(max_length=255, null=True, blank=True)
    ftx_secret_key = models.CharField(max_length=255, null=True, blank=True)
    ftx_sub_account = models.CharField(max_length=255, null=True, blank=True)

    decode_key = models.CharField(null=True, blank=True, max_length=255)

    @property
    def _huobi_secret_key(self):
        secret_key = hash.encode(settings.DECODE_KEY, self.huobi_secret_key)
        return secret_key

    @property
    def _ftx_secret_key(self):
        secret_key = hash.encode(settings.DECODE_KEY, self.ftx_secret_key)
        return secret_key

    class Meta(AbstractUser.Meta):
        db_table = 'user_users'
        app_label = 'users'


class Token(BaseModel):
    key = models.CharField(max_length=40, unique=True)
    is_active = models.BooleanField(default=True)
    user = models.ForeignKey(User, models.CASCADE, related_name='tokens')
    expires_at = models.DateTimeField(default=expires_default)  # token expires in 30 days

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = tokens.generate()
        return super(Token, self).save(*args, **kwargs)

    def __str__(self):
        return self.key

    class Meta:
        db_table = 'user_tokens'


class ResetPassword(BaseModel):
    key = models.CharField(max_length=40, unique=True)
    user = models.ForeignKey(User, models.CASCADE)
    expires_at = models.DateTimeField(default=expires_hour)

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = tokens.generate()
        return super(ResetPassword, self).save(*args, **kwargs)

    def __str__(self):
        return self.key

    class Meta:
        db_table = 'user_reset_password'
