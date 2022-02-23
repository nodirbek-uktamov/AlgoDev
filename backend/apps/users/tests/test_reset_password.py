from django.test import override_settings
from django.urls import reverse

from core.tests.base_test import BaseTestCase
from users.models import ResetPassword, User


@override_settings(EMAIL_BACKEND='core.utils.email.TestEmailBackend')
class ResetPasswordTest(BaseTestCase):
    fixtures = ('users_and_tokens.yaml',)

    def test_reset_password(self):
        # Request reset link
        response = self.client.post(reverse('users:reset-link'), {'email': 'Angelina@Gmail.com'})
        self.assertEqual(201, response.status_code, response.data)

        # Set new passwoed
        reset = ResetPassword.objects.filter(user_id=1).first()
        response = self.client.put(reverse('users:reset-password'), {'key': reset.key, 'password': 'new_password'})
        self.assertEqual(200, response.status_code, response.data)
