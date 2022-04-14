from huobi import HuobiRestClient
from huobi.rest.endpoint import Endpoint


class CustomHuobiClient(HuobiRestClient):
    open_orders = Endpoint(
        method='GET',
        path='/v1/order/openOrders',
        auth_required=True,
    )

    place = Endpoint(
        method='POST',
        path='/v1/order/orders/place',
        auth_required=True,
        params={
            'account_id': {
                'required': True,
                'name': 'account-id'
            },
            'amount': {
                'required': True,
            },
            'price': {
                'required': False,
            },
            'source': {
                'required': False,
            },
            'symbol': {
                'required': True
            },
            'client_order_id': {
                'required': False,
                'name': 'client-order-id'
            },
            'type': {
                'required': True,
                'choices': [
                    'buy-market',
                    'sell-market',
                    'buy-limit',
                    'sell-limit',
                ]
            },
        }
    )
