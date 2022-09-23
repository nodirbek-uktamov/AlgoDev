from django.urls import path, include

from main.views.proxy import ProxyView
from main.views.ws import AuthParamsView
from main.views import ftx
from main.views.orders import OrdersListView, CancelAllOrdersView, CancelOrderView
from main.views.trade import TradeView, TradeDetailView, CancelTradesView, MarketOrderView, LimitOrderView


urlpatterns = [
    path('trades/cancel/<str:exchange>/', CancelTradesView.as_view(), name='trades-cancel'),
    path('trades/<int:pk>/', TradeDetailView.as_view(), name='trade-detail'),
    path('trades/<str:exchange>/', TradeView.as_view(), name='trade'),
    path('ws-auth-params/<str:exchange>/', AuthParamsView.as_view(), name='auth-params'),

    path('orders/cancel/<int:order_id>', CancelOrderView.as_view(), name='cancel-all-orders'),
    path('orders/<str:symbol>/', OrdersListView.as_view(), name='open-orders-list'),

    path('market/', MarketOrderView.as_view(), name='market'),
    path('limit/', LimitOrderView.as_view(), name='limit'),

    path('huobi/orders/cancel/', CancelAllOrdersView.as_view(), name='huobi-cancel-all-orders'),

    path('ftx/', include([
        path('symbols/', ftx.SymbolsListView.as_view(), name='symbols'),
        path('balances/', ftx.BalancesListView.as_view(), name='balances'),
        path('account/', ftx.AccountDetailView.as_view(), name='account-detail'),
        path('positions/', ftx.PositionsListView.as_view(), name='positions'),
        path('positions/market/', ftx.PositionMarketOrderView.as_view(), name='close-position'),
        path('orders/open/', ftx.OpenOrdersListView.as_view(), name='open-orders'),
        path('fills/', ftx.FTXFillsView.as_view(), name='fills'),
        path('orders/cancel/<int:id>/', ftx.CancelOrderView.as_view(), name='cancel-orders'),
        path('orders/modify/<int:id>/', ftx.ModifyOrderView.as_view(), name='modify-orders'),
        path('trigger-orders/<str:market>/', ftx.TriggerOrdersView.as_view(), name='open-trigger-orders'),
        path('twap-orders/<str:market>/', ftx.TWAPOrdersView.as_view(), name='active-twap-orders'),
        path('orders/cancel/', ftx.CancelAllOrdersView.as_view(), name='ftx-cancel-all-orders'),
        # path('place/', ftx.PlaceFTXOrderView.as_view(), name='place'),
    ])),
    path('proxy/', ProxyView.as_view(), name='proxy'),
]

