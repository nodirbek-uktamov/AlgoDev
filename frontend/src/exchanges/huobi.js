import {parseGzip} from "../utils/websocket";
import {baseChangeSymbol} from "./exchanges";

export function huobiPrivateWSHandleMessage(event, ws, symbol, wsCallbacksRef, user) {
    const data = JSON.parse(event.data)

    if (data.code === 200 && data.ch === 'auth') {
        ws.current.send(JSON.stringify({
            action: 'sub',
            ch: 'accounts.update#2',
        }))

        ws.current.send(JSON.stringify({
            action: 'sub',
            ch: 'orders#' + symbol,
        }))
    }

    if (data.action === 'ping') {
        ws.current.send(JSON.stringify({action: 'pong', data: {ts: data.data.ts}}))
    }

    if (data.ch && data.ch.includes("orders") && data.action === 'push' && wsCallbacksRef.current.setOrders) {
        const item = data.data
        item.side = item.type.split('-')[0]
        item.type = item.type.split('-')[1]
        item.time = new Date(item.orderCreateTime).toLocaleTimeString('it-IT')
        item.orderSize = item.orderSize || item.tradeVolume
        item.orderPrice = item.orderPrice || item.tradePrice

        wsCallbacksRef.current.setOrders(oldOrders => {
            if (oldOrders.filter(i => i.orderId === data.data.orderId).length > 0) {
                return oldOrders.map(i => {
                    if (i.orderId === data.data.orderId) return {...data.data, time: i.time}
                    return i
                })
            }

            return [data.data, ...oldOrders]
        })
    }

    if (data.action === 'push' && data.data.accountId === user.huobiSpotAccountId && wsCallbacksRef.current.setBalance) {
        wsCallbacksRef.current.setBalance((oldBalance) => {
            return ({
                ...oldBalance,
                [data.data.currency]: Number(data.data.available)
            })
        })
    }
}

export const huobiHandleMessagePublicWs = (ws, wsCallbacksRef, setPrice, event) => {
    parseGzip(event, (msg) => {
        const data = JSON.parse(msg)

        if (data.ping) {
            ws.current.send(JSON.stringify({pong: data.ping}))
        }

        if (data.tick) {
            if (data.ch.includes('bbo')) {
                if (typeof wsCallbacksRef.current.setBidAskData === 'function') {
                    wsCallbacksRef.current.setBidAskData({[data.ch.split('.')[1]]: data.tick})
                }

                setPrice(oldValue => {
                    if (oldValue[data.ch.split('.')[1]]) return oldValue
                    return {[data.ch.split('.')[1]]: data.tick}
                })
            }

            if (data.ch.includes('trade.detail') && typeof wsCallbacksRef.current.setOrdersData === 'function') {
                wsCallbacksRef.current.setOrdersData(data.tick)
            }

            if (data.ch.includes('depth') && typeof wsCallbacksRef.current.setBook === 'function') {
                wsCallbacksRef.current.setBook(data.tick)
            }
        }
    })
}

export const huobiOnChangeSymbol = (value, connectHuobi, symbolValue, exchange, setSymbol, wsCallbacksRef, privateWs, disconnectHuobi) => {
    if (!wsCallbacksRef.current) return
    if (!privateWs.current) return

    if (wsCallbacksRef.current.setOrdersData) wsCallbacksRef.current.setOrdersData('clear')

    disconnectHuobi()
    if (wsCallbacksRef.current.setOrders) wsCallbacksRef.current.setOrders([])

    baseChangeSymbol(value, connectHuobi, symbolValue, exchange, setSymbol)
    connectHuobi(value?.value?.toLowerCase())

    privateWs.current.send(JSON.stringify({
        action: 'unsub',
        ch: 'orders#' + symbolValue,
    }))

    privateWs.current.send(JSON.stringify({
        action: 'sub',
        ch: 'orders#' + value.value.toLowerCase(),
    }))

    if (wsCallbacksRef.current.updateInitialOrders) wsCallbacksRef.current.updateInitialOrders(value.value.toLowerCase())
}