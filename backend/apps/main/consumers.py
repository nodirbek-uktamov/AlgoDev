import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class Consumer(WebsocketConsumer):
    def connect(self):
        kwargs = self.scope['url_route']['kwargs']
        id = kwargs['id']
        self.user_id = f'user_{id}'

        async_to_sync(self.channel_layer.group_add)(
            self.user_id,
            self.channel_name,
        )
        self.accept()

        # time.sleep(5)

        async_to_sync(self.channel_layer.group_send)(
            self.user_id,
            {
                'type': 'chat_message',
                'message': 'Connected to logs'
            }
        )

    def chat_message(self, event):
        message = event['message']

        self.send(text_data=json.dumps({
            'message': message
        }))

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.user_id,
            self.channel_name,
        )
