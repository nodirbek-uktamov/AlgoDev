import base64
import hashlib
import hmac
import json
from datetime import datetime
from urllib.parse import urlencode

import requests

base_uri = 'api.huobi.pro'


def generate_auth_params_ws(access_key, secret_key):
    timestamp = str(datetime.utcnow().isoformat())[0:19]
    params = {'accessKey': access_key,
              'signatureMethod': 'HmacSHA256',
              'signatureVersion': '2.1',
              'timestamp': timestamp
              }
    params_text = urlencode(params)
    method = 'GET'
    endpoint = '/ws/v2'

    pre_signed_text = method + '\n' + base_uri + '\n' + endpoint + '\n' + params_text
    hash_code = hmac.new(secret_key.encode(), pre_signed_text.encode(), hashlib.sha256).digest()
    signature = base64.b64encode(hash_code).decode()

    url = 'wss://' + base_uri + endpoint

    params['signature'] = signature
    params["authType"] = "api"

    return {'url': url, 'params': params}


def format_float(number, decimal_fields):
    return f'{number:.{decimal_fields}f}'
