from django.urls import path

from apps.main.consumers import Consumer

websocket_urlpatterns = [
    path("api/v1/logs/<int:id>/", Consumer.as_asgi()),
]
