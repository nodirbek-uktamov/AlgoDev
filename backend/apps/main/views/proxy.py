import requests

from rest_framework.exceptions import ValidationError
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class ProxyView(GenericAPIView):
    permission_classes = (AllowAny,)
    authentication_classes = []

    def _check_url(self, url):
        if not url or not isinstance(url, str):
            raise ValidationError({'url': 'Required string to params'})

    def get(self, request):
        params = dict(request.GET)
        url = params.pop('url')[0]

        self._check_url(url)
        response = requests.get(url, params=params)

        return Response(response.json())

    def post(self, request):
        params = dict(request.GET)
        url = params.pop('url')[0]

        self._check_url(url)

        return Response(requests.post(url, data=request.data, params=params).json())
