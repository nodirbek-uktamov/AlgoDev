export const domain = window.origin.replace('3000', '8000') // https://hftcryptobot.com
export const wsDomain = domain.replace('http', 'ws')

export const SIGNIN = '/users/sign-in'
export const USER_DETAIL = '/users/user'
export const USER_SETTINGS = '/users/user_settings'
export const SIGNUP = '/users/sign-up'
export const CONFIRM = '/users/confirm'
export const RESET_PASSWORD = '/users/reset_password'

export const TRADE = '/main/trades/'
export const BALANCE = '/main/ws-auth-params/{exchange}'
export const OPEN_ORDERS = '/main/orders/{symbol}/'
export const CANCEL_ALL_ORDERS = '/main/orders/cancel/'
export const CANCEL_ORDER = '/main/orders/cancel/{id}'
export const TRADE_DETAIL = '/main/trades/{id}/'
export const CANCEL_TRADES = '/main/trades/cancel/'
export const MARKET = '/main/market/'
export const LIMIT = '/main/limit/'

export const HUOBI_DOMAIN = 'https://api.huobi.pro'
export const HUOBI_SYMBOLS = `${HUOBI_DOMAIN}/v2/settings/common/symbols/`
export const HUOBI_SYMBOL_SETTINGS = `${HUOBI_DOMAIN}/v1/settings/common/symbols`

export const FTX_SYMBOLS = 'main/ftx/symbols/'
export const FTX_POSITIONS_LIST = 'main/ftx/positions/'
// export const FTX_PLACE_ORDER = 'main/ftx/place/'

export const LOGS_WS = `${wsDomain}/api/v1/logs/{id}/`
