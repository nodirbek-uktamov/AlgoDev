import time
import hmac
from requests import Request, Session

FTX_REST_API = 'https://ftx.com/api'


def generate_ftx_auth_params_ws(access_key, secret_key):
    ts = int(time.time() * 1000)

    return {
        'url': 'wss://ftx.com/ws/',
        'params': {'op': 'login', 'args': {
            'key': access_key,
            'sign': hmac.new(
                secret_key.encode(), f'{ts}websocket_login'.encode(), 'sha256'
            ).hexdigest(),
            'time': ts,
        }}
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
