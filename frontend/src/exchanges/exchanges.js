import { FTX_SYMBOLS, HUOBI_SYMBOLS } from '../urls'
import { huobiHandleMessagePublicWs, huobiPrivateWSHandleMessage } from './huobi'
import { ftxPrivateWSHandleMessage } from './ftx'

export const HUOBI = 'huobi'
export const FTX = 'ftx'

export function getSymbolsList(symbols, exchange) {
    let symbolsList = []

    if (exchange === HUOBI) {
        symbolsList = (symbols.data || []).map((i) => ({
            tpp: i.tpp,
            tap: i.tap,
            value: i.bcdn + i.qcdn,
            label: i.dn,
            pair1: i.bcdn,
            pair2: i.qcdn,
        }))
    }

    if (exchange === FTX) {
        (symbols.result || []).map((i) => {
            if (i.type === 'future') {
                symbolsList.push({
                    tpp: i.priceIncrement,
                    tap: i.sizeIncrement,
                    value: i.name,
                    label: i.name,
                    pair1: i.underlying,
                    pair2: 'USD',
                })
            }
        })
    }

    return symbolsList
}

export function getSymbolRequestOptions(exchange) {
    let options = {}

    if (exchange === HUOBI) {
        options = {
            baseURL: HUOBI_SYMBOLS,
            headers: {},
        }
    }

    if (exchange === FTX) {
        options = {
            url: FTX_SYMBOLS,
        }
    }

    return options
}

export const handlePrivateWsMessage = (exchange, ws, symbol, wsCallbacksRef, user) => (event) => {
    if (exchange === HUOBI) huobiPrivateWSHandleMessage(event, ws, symbol, wsCallbacksRef, user)
    if (exchange === FTX) ftxPrivateWSHandleMessage(event, ws, symbol, wsCallbacksRef, user)
}

export const handlePublicWsMessage = (exchange, publicWs, wsCallbacksRef, setPrice) => (event) => {
    if (exchange === HUOBI) huobiHandleMessagePublicWs(publicWs, wsCallbacksRef, setPrice, event)
    if (exchange === FTX) console.log(event)
}

export const getDefaultSymbol = (exchange) => {
    if (exchange === HUOBI) return { value: 'ETHUSDT', pair1: 'ETH', pair2: 'USDT', tap: 6, tpp: 2 }
    if (exchange === FTX) return { value: 'ETH-PERP', label: 'ETH-PERP', pair1: 'ETH', pair2: 'USD', tap: 3, tpp: 1 }
}

export const baseChangeSymbol = (value, connectHuobi, symbolValue, exchange, setSymbol) => {
    localStorage.setItem(`${exchange}_symbol`, JSON.stringify(value))
    setSymbol(value)
}
