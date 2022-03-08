from django.urls import path

from main.views.balance import BalanceView
from main.views.trade import TradeView

urlpatterns = [
    path('trade/', TradeView.as_view(), name='trade'),
    path('balance/', BalanceView.as_view(), name='balance'),
]
