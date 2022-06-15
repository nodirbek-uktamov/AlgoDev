from django.urls import path

from apps.main.consumers import LogsConsumer

websocket_urlpatterns = [
    path("api/v1/logs/<int:id>/", LogsConsumer.as_asgi())
]
