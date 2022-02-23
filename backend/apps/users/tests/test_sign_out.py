from django.urls import reverse
from core.tests.base_test import BaseTestCase
from users.models import Token
from users.tests.constants import USER_TOKEN


class SignOutTest(BaseTestCase):
    fixtures = ('users_and_tokens.yaml',)

    def setUp(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + USER_TOKEN)

    def test_signout_success(self):
        response = self.client.delete(reverse('users:signout'))
        self.assertEqual(200, response.status_code, response.data)
        self.assertFalse(Token.objects.filter(key=USER_TOKEN).exists())
