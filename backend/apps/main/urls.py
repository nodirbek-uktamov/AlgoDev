from django.urls import path

from main.views.balance import BalanceView
from main.views.trade import TradeView, TradeDetailView

urlpatterns = [
    path('trades/', TradeView.as_view(), name='trade'),
    path('trades/<int:pk>/', TradeDetailView.as_view(), name='trade-detail'),
    path('balance/', BalanceView.as_view(), name='balance'),
]
