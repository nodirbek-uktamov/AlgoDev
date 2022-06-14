import time
import hmac
from requests import Request


def generate_auth_params_ws(access_key, secret_key):
    ts = int(time.time() * 1000)
    request = Request('GET', 'wss://ftx.com/ws/')
    prepared = request.prepare()
    signature_payload = f'{ts}{prepared.method}{prepared.path_url}'.encode()
    signature = hmac.new('YOUR_API_SECRET'.encode(), signature_payload, 'sha256').hexdigest()

    prepared.headers['FTX-KEY'] = 'YOUR_API_KEY'
    prepared.headers['FTX-SIGN'] = signature
    prepared.headers['FTX-TS'] = str(ts)
