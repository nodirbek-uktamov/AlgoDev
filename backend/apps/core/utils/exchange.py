from huobi import HuobiRestClient

twap_bot_order_interval = 60


def save_account_ids(user):
    try:
        if not user.huobi_spot_account_id or not user.huobi_margin_account_id:
            client = HuobiRestClient(access_key=user.huobi_api_key, secret_key=user._huobi_secret_key)
            accounts = client.accounts().data

            for account in accounts.get('data', []):
                if account.get('type') == 'spot':
                    user.huobi_spot_account_id = account.get('id')

                if account.get('type') == 'margin':
                    user.huobi_margin_account_id = account.get('id')

            user.save()
    except Exception as e:
        pass
