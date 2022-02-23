from django.urls import reverse
from core.tests.base_test import BaseTestCase


class SignInTest(BaseTestCase):
    fixtures = ('users_and_tokens.yaml',)

    def test_signin_success(self):
        response = self.client.post(reverse('users:signin'), {'email': 'Angelina@Gmail.com', 'password': 'password'})
        self.assertEqual(200, response.status_code, response.data)
        self.assertIn('token', response.data, response.data)
        self.assertIn('user', response.data, response.data)
        self.assertEqual(1, response.data['user']['id'], response.data)

    def test_signin_fail(self):
        response = self.client.post(reverse('users:signin'), {'email': 'incorrect', 'password': 'incorrect'})
        self.assertEqual(400, response.status_code, response.data)
