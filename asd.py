import time
import hmac


def generate_auth_params_ws(access_key, secret_key):
    ts = int(time.time() * 1000)

    print({'op': 'login', 'args': {
        'key': access_key,
        'sign': hmac.new(
            secret_key.encode(), f'{ts}websocket_login'.encode(), 'sha256'
        ).hexdigest(),
        'time': ts,
    }})
