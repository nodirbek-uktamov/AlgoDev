from huobi import HuobiRestClient
from huobi.rest.endpoint import Endpoint


def save_account_ids(user):
    if not user.spot_account_id or not user.margin_account_id:
        client = HuobiRestClient(access_key=user.api_key, secret_key=user.secret_key)
        accounts = client.accounts().data

        for account in accounts.get('data', []):
            if account.get('type') == 'spot':
                user.spot_account_id = account.get('id')

            if account.get('type') == 'margin':
                user.margin_account_id = account.get('id')

        user.save()


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
                'required': True,
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
