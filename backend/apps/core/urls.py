from django.urls import path

from core.views.configurations import ConfigurationsView
from core.views.playground import DummyDataView

urlpatterns = [
    path('configurations', ConfigurationsView.as_view(), name='configurations'),
    path('dummy_data', DummyDataView.as_view(), name='dummy-data'),
]
