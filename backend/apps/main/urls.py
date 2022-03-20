from django.urls import path

from main.views.balance import BalanceView
from main.views.trade import TradeView, TradeDetailView, CancelTradesView

urlpatterns = [
    path('trades/', TradeView.as_view(), name='trade'),
    path('trades/cancel/', CancelTradesView.as_view(), name='trades-cancel'),
    path('trades/<int:pk>/', TradeDetailView.as_view(), name='trade-detail'),
    path('balance/', BalanceView.as_view(), name='balance'),
]
