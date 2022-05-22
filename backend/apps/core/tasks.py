from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone
from config.celery import app


@app.task
def send_log(user_id, message, action=None):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f'user_{user_id}',
        {
            'type': 'chat_message',
            'message': f'({timezone.now().strftime("%H:%M:%S")})&nbsp; &nbsp;{message}',
            'action': action
        }
    )
