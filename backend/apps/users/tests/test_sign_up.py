from django.test import override_settings
from django.urls import reverse
from core.tests.base_test import BaseTestCase
from users.models import User
from django.utils import translation


@override_settings(EMAIL_BACKEND='core.utils.email.TestEmailBackend')
class SignUpTest(BaseTestCase):
    fixtures = ('users_and_tokens.yaml', )

    def test_signup_fail(self):
        translation.activate('ru')
        response = self.client.post(reverse('users:signup'), {})
        self.assertEqual(400, response.status_code, response.data)
        self.assertEqual('Это поле обязательно.', response.data['email'][0], response.data)
        self.assertEqual('Это поле обязательно.', response.data['password'][0], response.data)
        self.assertEqual('Это поле обязательно.', response.data['first_name'][0], response.data)
        self.assertEqual('Это поле обязательно.', response.data['last_name'][0], response.data)

        # Unique email validation
        response = self.client.post(reverse('users:signup'), {'email': 'angelina@gmail.com'})
        self.assertEqual(400, response.status_code, response.data)
        self.assertEqual('User with this email already exists.', str(response.data['email'][0]), response.data)

    def test_confirm_fail(self):
        response = self.client.post(reverse('users:confirm'), {'confirmation_code': 'fake-uuid-code'})
        self.assertEqual(404, response.status_code, response.data)

    def test_confirm_success(self):
        user = self._signup()
        user = User.objects.get(pk=user['id'])
        response = self.client.post(reverse('users:confirm'), {'confirmation_code': user.confirmation_code})
        self.assertEqual(200, response.status_code, response.data)
        self.assertIn('token', response.data, response.data)
        self.assertIn('user', response.data, response.data)

    def resend_confirmation_email(self):
        user = self._signup()
        response = self.client.post(reverse('users:resend-confirmation', kwargs={'pk': user['id']}))
        self.assertEqual(200, response.status_code, response.data)

    def _signup(self):
        response = self.client.post(reverse('users:signup'), {
            'username': 'hathaway',
            'email': 'anne@not-existing-email-address.com',
            'first_name': 'Anne',
            'last_name': 'Hathaway',
            'password': 'password',
        })
        self.assertEqual(201, response.status_code, response.data)
        self.assertIn('id', response.data, response.data)
        return response.data
