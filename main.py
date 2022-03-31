
# Get all Accounts of the Current User


def on_open(ws):
    data = {
        "action": "req",
        "ch": "auth",
        "params": params
    }

    ws.send(json.dumps(data))


def on_error(error):
    print(error)


def on_message(ws, message):
    data = json.loads(message)
    print(data)

    if data.get('action') == 'ping':
        ws.send(json.dumps({'action': 'pong', 'data': {'ts': data.get('data', {}).get('ts')}}))

    if data.get('code') == 200 and data.get('ch') == 'auth':
        ws.send(json.dumps({
            "action": "sub",
            "ch": "accounts.update"
        }))


ws = websocket.WebSocketApp(
    url,
    on_open=on_open,
    on_message=on_message,
    on_error=on_error,
)

ws.run_forever()
