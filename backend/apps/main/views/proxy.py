import requests

from rest_framework.exceptions import ValidationError
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class ProxyView(GenericAPIView):
    permission_classes = (AllowAny,)
    authentication_classes = []

    def get(self, request):
        if not request.GET.get('url') or not isinstance(request.GET.get('url'), str):
            raise ValidationError({'url': 'Required string to params'})

        return Response(requests.get(request.GET.get('url')).json())
