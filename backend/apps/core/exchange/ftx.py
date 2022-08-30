import decimal
import hmac
import time

import requests
from requests import Request, Session

FTX_REST_API = 'https://ftx.com/api'


def generate_ftx_auth_params_ws(access_key, secret_key, sub_account=None):
    ts = int(time.time() * 1000)
    args = {
        'key': access_key,
        'sign': hmac.new(secret_key.encode(), f'{ts}websocket_login'.encode(), 'sha256').hexdigest(),
        'time': ts,
    }

    if sub_account:
        args['subaccount'] = sub_account

    return {
        'url': 'wss://ftx.com/ws/',
        'params': {'op': 'login', 'args': args}
    }


def ftx_request(endpoint, method, user, json=None):
    ts = int(time.time() * 1000)
    request = Request(method, FTX_REST_API + endpoint, json=json)
    prepared = request.prepare()
    signature_payload = f'{ts}{prepared.method}{prepared.path_url}'.encode()

    if prepared.body:
        signature_payload += prepared.body

    signature = hmac.new(user._ftx_secret_key.encode(), signature_payload, 'sha256').hexdigest()

    prepared.headers['FTX-KEY'] = user.ftx_api_key
    prepared.headers['FTX-SIGN'] = signature
    prepared.headers['FTX-TS'] = str(ts)

    if user.ftx_sub_account:
        prepared.headers['FTX-SUBACCOUNT'] = user.ftx_sub_account

    session = Session()
    response = session.send(prepared)

    return response.json()


def get_markets():
    response = requests.get(FTX_REST_API + '/markets').json()

    for i in response.get('result', []):
        if i['priceIncrement'] == 1:
            i['price_increment'] = 0
            i['priceIncrement'] = 0
        else:
            i['price_increment'] = abs(decimal.Decimal(str(i['priceIncrement'])).as_tuple().exponent)
            i['priceIncrement'] = i['price_increment']

        if i['sizeIncrement'] == 1:
            i['size_increment'] = 0
            i['sizeIncrement'] = 0
        else:
            i['size_increment'] = abs(decimal.Decimal(str(i['sizeIncrement'])).as_tuple().exponent)
            i['sizeIncrement'] = i['size_increment']

    return response


def get_positions(user):
    return ftx_request('/positions?showAvgPrice=true', 'GET', user)


def get_account_information(user):
    return ftx_request('/account', 'GET', user).get('result', {})


def get_balances(user):
    return ftx_request('/wallet/balances', 'GET', user).get('result', [])


def get_open_orders(user):
    return ftx_request('/orders', 'GET', user).get('result', [])


def get_orders_history(user, market):
    return ftx_request(f'/orders/history?market={market}', 'GET', user).get('result', [])


def get_trigger_orders(user, market):
    return ftx_request(f'/conditional_orders?market={market}', 'GET', user).get('result', [])


def get_twap_orders(user, market):
    return ftx_request(f'/twap_orders?market={market}&status=running', 'GET', user).get('result', [])


def place_order(user, data):
    response = ftx_request('/orders', 'POST', user, json=data)
    return response


def place_trigger_order(user, data):
    response = ftx_request('/conditional_orders', 'POST', user, json=data)
    return response


def place_twap_order(user, data):
    response = ftx_request('/twap_orders', 'POST', user, json=data)
    return response


def batch_cancel_orders(user, order_ids):
    for id in order_ids:
        response = ftx_request(f'/orders/{id}', 'DELETE', user)


def cancel_order(user, id):
    response = ftx_request(f'/orders/{id}', 'DELETE', user)
    return response
