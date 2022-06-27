import { baseChangeSymbol } from './exchanges'

function updateOrderBook(oldOrders, ordersFromExchange, bid) {
    const newOrders = []

    oldOrders.map((item) => {
        const orderDepthIndex = ordersFromExchange.findIndex((i) => i[0] === item[0])
        const orderDepth = ordersFromExchange[orderDepthIndex]

        if (orderDepthIndex > -1) ordersFromExchange.splice(orderDepthIndex, 1)

        if (orderDepth) {
            if (orderDepth[1]) newOrders.push(orderDepth)
            return
        }

        newOrders.push(item)
    })

    if (ordersFromExchange.length > 0) {
        newOrders.push(...ordersFromExchange)
    }

    if (bid) {
        return newOrders.sort((a, b) => (a[0] < b[0]) - (a[0] > b[0]))
    }

    return newOrders.sort((a, b) => (a[0] > b[0]) - (a[0] < b[0]))
}

export const ftxPrivateWSHandleMessage = (event, ws, symbol, wsCallbacksRef, user) => {
    const data = JSON.parse(event.data)

    if (data && data.data && data.channel === 'orderbook' && typeof wsCallbacksRef.current.setBook === 'function') {
        wsCallbacksRef.current.setBook((oldOrders) => {
            if (data.type === 'partial') return { asks: data.data.asks, bids: data.data.bids }

            let newBids = []
            let newAsks = []

            if (oldOrders) {
                newAsks = updateOrderBook(oldOrders.asks, data.data.asks)
                newBids = updateOrderBook(oldOrders.bids, data.data.bids, true)
            }

            return { bids: newBids, asks: newAsks }
        })
    }
}

export const ftxOnChangeSymbol = (value, connectHuobi, symbolValue, exchange, setSymbol) => {
    baseChangeSymbol(value, connectHuobi, symbolValue, exchange, setSymbol)
}
