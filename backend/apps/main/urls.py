from django.urls import path

from main.views.balance import BalanceView
from main.views.orders import OrdersListView
from main.views.trade import TradeView, TradeDetailView, CancelTradesView, MarketOrderView, LimitOrderView

urlpatterns = [
    path('trades/', TradeView.as_view(), name='trade'),
    path('trades/cancel/', CancelTradesView.as_view(), name='trades-cancel'),
    path('trades/<int:pk>/', TradeDetailView.as_view(), name='trade-detail'),
    path('balance/', BalanceView.as_view(), name='balance'),
    path('orders/<str:symbol>/', OrdersListView.as_view(), name='open-orders-list'),

    path('market/', MarketOrderView.as_view(), name='market'),
    path('limit/', LimitOrderView.as_view(), name='limit'),
]
