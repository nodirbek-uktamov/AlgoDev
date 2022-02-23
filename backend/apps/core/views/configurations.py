from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from django.conf import settings


class ConfigurationsView(APIView):
    """ Returns common (Frontend / Backend) settings """

    permission_classes = (AllowAny,)

    def get(self, request):
        return Response({})
