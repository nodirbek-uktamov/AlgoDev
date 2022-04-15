export const SIGNIN = '/users/sign-in'
export const SIGNUP = '/users/sign-up'
export const CONFIRM = '/users/confirm'
export const RESET_PASSWORD = '/users/reset_password'

export const TRADE = '/main/trades/'
export const BALANCE = '/main/balance/'
export const TRADE_DETAIL = '/main/trades/{id}/'
export const CANCEL_TRADES = '/main/trades/cancel/'


export const HUOBI_DOMAIN = 'https://api.huobi.pro'
export const HUOBI_SYMBOLS = `${HUOBI_DOMAIN}/v2/settings/common/symbols/`
export const HUOBI_SYMBOL_SETTINGS = `${HUOBI_DOMAIN}/v1/settings/common/symbols`

export const domain = `http://${window.location.host}:8000` // http://62.113.98.2:8000
export const wsDomain = domain.replace('http', 'ws')

export const LOGS_WS = `${wsDomain}/logs/{id}/`
