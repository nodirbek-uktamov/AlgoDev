from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from asgiref.sync import async_to_sync
from main.models import Trade
from main.serializers.trade import TradesSerializer
from channels.layers import get_channel_layer


class TradeView(APIView):
    def get(self, request):
        queryset = Trade.objects.filter(is_completed=False, user=request.user).order_by('-id')
        data = TradesSerializer(instance=queryset, many=True).data
        return Response(data)

    def post(self, request):
        serializer = TradesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)

        data = serializer.data

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'user_{request.user.id}',
            {
                'type': 'chat_message',
                'message': f"{data.get('id')}: Created"
            }
        )

        return Response(data, 201)


class TradeDetailView(APIView):
    def put(self, request, pk):
        trade = get_object_or_404(Trade, pk=pk, user=request.user)
        trade.is_completed = True
        trade.save()
        return Response({'ok': True})
