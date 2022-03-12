export const SIGNIN = '/users/sign-in'
export const SIGNUP = '/users/sign-up'
export const CONFIRM = '/users/confirm'
export const RESET_PASSWORD = '/users/reset_password'

export const TRADE = '/main/trades/'
export const TRADE_DETAIL = '/main/trades/{id}/'

export const domain = 'https://e885-213-230-80-229.ngrok.io' // http://62.113.98.2:8000
export const wsDomain = domain.replace('http', 'ws').replace('https', 'ws')

export const LOGS_WS = `${wsDomain}/logs/{id}/`
