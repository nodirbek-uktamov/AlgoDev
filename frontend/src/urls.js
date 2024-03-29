export const domain = window.origin.replace('3000', '8000') // https://hftcryptobot.com
export const wsDomain = domain.replace('http', 'ws')

export const SIGNIN = '/users/sign-in'
export const USER_DETAIL = '/users/user'
export const USER_SETTINGS = '/users/user_settings'
export const SIGNUP = '/users/sign-up'
export const CONFIRM = '/users/confirm'
export const RESET_PASSWORD = '/users/reset_password'

export const TRADE = '/main/trades/{exchange}/'
export const BALANCE = '/main/ws-auth-params/{exchange}/'
export const OPEN_ORDERS = '/main/orders/{symbol}/'
export const CANCEL_ALL_ORDERS = '/main/huobi/orders/cancel/'
export const CANCEL_ORDER = '/main/orders/cancel/{id}'
export const TRADE_DETAIL = '/main/trades/{id}/'
export const CANCEL_TRADES = '/main/trades/cancel/{exchange}/'
export const MARKET = '/main/market/'
export const LIMIT = '/main/limit/'

export const HUOBI_DOMAIN = 'https://api.huobi.pro'
export const HUOBI_SYMBOLS = `${HUOBI_DOMAIN}/v2/settings/common/symbols/`
export const HUOBI_KLINES = `${HUOBI_DOMAIN}/market/history/kline?symbol={symbol}&size={size}&period={period}`
export const HUOBI_SYMBOL_SETTINGS = `${HUOBI_DOMAIN}/v1/settings/common/symbols`

export const FTX_SYMBOLS = 'main/ftx/symbols/'
export const FTX_POSITIONS_LIST = 'main/ftx/positions/'
export const CLOSE_POSITION_MARKET = 'main/ftx/positions/market/'
export const FTX_OPEN_ORDERS_LIST = 'main/ftx/orders/open/'
export const FTX_OPEN_TRIGGER_ORDERS_LIST = 'main/ftx/trigger-orders/{symbol}/'
export const FTX_ACTIVE_TWAP_ORDERS_LIST = 'main/ftx/twap-orders/{symbol}/'
export const FTX_BALANCES = 'main/ftx/balances/'
export const FTX_ACCOUNT = 'main/ftx/account/'
export const FTX_CANCEL_ORDER = 'main/ftx/orders/cancel/{id}/'
export const FTX_MODIFY_ORDER = 'main/ftx/orders/modify/{id}/'
export const PROXY_API = 'main/proxy/'
export const FTX_FILLS_LIST = 'main/ftx/fills/'
export const FTX_CANCEL_ALL_ORDERS = '/main/ftx/orders/cancel/'
// export const FTX_PLACE_ORDER = 'main/ftx/place/'

export const LOGS_WS = `${wsDomain}/api/v1/logs/{id}/`
