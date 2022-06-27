from django.urls import path, include

from main.views.ws import AuthParamsView
from main.views import ftx
from main.views.orders import OrdersListView, CancelAllOrdersView, CancelOrderView
from main.views.trade import TradeView, TradeDetailView, CancelTradesView, MarketOrderView, LimitOrderView


urlpatterns = [
    path('trades/', TradeView.as_view(), name='trade'),
    path('trades/cancel/', CancelTradesView.as_view(), name='trades-cancel'),
    path('trades/<int:pk>/', TradeDetailView.as_view(), name='trade-detail'),
    path('ws-auth-params/<str:exchange>', AuthParamsView.as_view(), name='auth-params'),

    path('orders/cancel/', CancelAllOrdersView.as_view(), name='cancel-all-orders'),
    path('orders/cancel/<int:order_id>', CancelOrderView.as_view(), name='cancel-all-orders'),
    path('orders/<str:symbol>/', OrdersListView.as_view(), name='open-orders-list'),

    path('market/', MarketOrderView.as_view(), name='market'),
    path('limit/', LimitOrderView.as_view(), name='limit'),

    path('ftx/', include([
        path('symbols/', ftx.SymbolsListView.as_view(), name='symbols'),
        path('positions/', ftx.PositionsListView.as_view(), name='positions'),
        # path('place/', ftx.PlaceFTXOrderView.as_view(), name='place'),
    ])),
]

