from django.urls import reverse

from core.tests.base_test import BaseTestCase
from users.tests.constants import USER_TOKEN


class ConfigurationsTest(BaseTestCase):
    def test_configurations(self):
        response = self.client.get(reverse('core:configurations'))
        self.assertEqual(200, response.status_code, response.data)
