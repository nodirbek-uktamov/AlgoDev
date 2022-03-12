from django.urls import path

from main.consumers import Consumer

websocket_urlpatterns = [
    path("logs/<int:id>/", Consumer.as_asgi()),
]
