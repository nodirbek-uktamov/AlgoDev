import {FTX_SYMBOLS, HUOBI_SYMBOLS} from "../urls";
import {huobiPrivateWSHandleMessage} from "./huobi";

export const HUOBI = 'huobi'
export const FTX = 'ftx'

export function getSymbolsList(symbols, exchange) {
    let symbolsList = []

    if (exchange === HUOBI) {
        symbolsList = (symbols.data || []).map((i) => ({
            value: i.bcdn + i.qcdn,
            label: i.dn,
            pair1: i.bcdn,
            pair2: i.qcdn
        }));
    }

    if (exchange === FTX) {
        (symbols.result || []).map((i) => {
            if (i.type === 'future') {
                symbolsList.push({
                    value: i.name.replace('-', ''),
                    label: i.name,
                    pair1: i.underlying,
                    pair2: "USD"
                })
            }
        });
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
            url: FTX_SYMBOLS
        }
    }

    return options
}

export const handleAccountWsMessage = (exchange, ws, symbol, wsCallbacksRef, user) => (event) => {
    if (exchange === HUOBI) huobiPrivateWSHandleMessage(event, ws, symbol, wsCallbacksRef, user)
    if (exchange === FTX) console.log(event)
}
