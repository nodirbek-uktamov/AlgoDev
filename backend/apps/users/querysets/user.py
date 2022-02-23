from datetime import timedelta

from django.contrib.auth.models import UserManager as BaseUserManager
from django.db.models import Q
from django.utils import timezone


class UsersManager(BaseUserManager):
    def unique_query(self):
        return self.filter(
            Q(verified_at__isnull=False) |
            # User has 24 hours to verify email. Otherwise new user could signup with this email.
            Q(date_joined__gte=timezone.now() - timedelta(days=1)) |
            Q(is_staff=True) |
            Q(is_active=True)
        )

    def remove_unverified(self, email):
        self.filter(email=email, verified_at__isnull=True, is_staff=False, is_active=False).delete()
