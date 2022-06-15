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


def ftx_request(endpoint, secret_key, api_key):
    ts = int(time.time() * 1000)
    request = Request('GET', FTX_REST_API + endpoint)
    prepared = request.prepare()
    signature_payload = f'{ts}{prepared.method}{prepared.path_url}'.encode()
    signature = hmac.new(secret_key.encode(), signature_payload, 'sha256').hexdigest()

    prepared.headers['FTX-KEY'] = api_key
    prepared.headers['FTX-SIGN'] = signature
    prepared.headers['FTX-TS'] = str(ts)

    session = Session()
    response = session.send(prepared)

    return response.json()
