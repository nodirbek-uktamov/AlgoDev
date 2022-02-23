from django.urls import path
from main.views.trade import TradeView

urlpatterns = [
    path('trade/', TradeView.as_view(), name='trade'),
]
