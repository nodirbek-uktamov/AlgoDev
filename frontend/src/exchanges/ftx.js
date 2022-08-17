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

    if (!data || !data.data) return

    if (['orderbook', 'orderbookGrouped'].includes(data.channel) && typeof wsCallbacksRef.current.setBook === 'function') {
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

    if (data.channel === 'trades' && typeof wsCallbacksRef.current.setOrdersData === 'function') {
        const newData = data.data.map((item) => ({
            ...item,
            ts: item.time,
            price: item.price,
            direction: item.side,
            amount: item.size,
            tradeId: item.id,
        }))

        wsCallbacksRef.current.setOrdersData({ data: newData })
    }

    if (data.channel === 'orders' && wsCallbacksRef.current.setFTXOrdersList) {
        const newItem = {
            ...data.data,
            orderSize: data.data.size,
            orderPrice: data.data.price,
            symbol: data.data.market,
        }

        if (data.data.status === 'new') {
            wsCallbacksRef.current.setFTXOrdersList((oldOrders) => [newItem, ...oldOrders])
        }

        if (data.data.status === 'closed') {
            if (data.data.filledSize > 0 && typeof wsCallbacksRef.current.showOrderMessage === 'function') {
                wsCallbacksRef.current.showOrderMessage([{
                    label: `${data.data.market} Order Filled  ${parseFloat(data.data.filledSize).toFixed(symbol.tap || 0)} ${symbol.pair1}`,
                    key: data.data.id,
                    className: data.data.side === 'sell' ? 'is-danger' : 'is-success',
                }])

                if (wsCallbacksRef.current.playFilledVoice && user.filledAudioActive) wsCallbacksRef.current.playFilledVoice(data.data.side)
            }

            wsCallbacksRef.current.setFTXOrdersList((oldOrders) => oldOrders.filter((i) => i.id !== newItem.id))
        }
    }
}

export const ftxOnChangeSymbol = (value, exchange, setSymbol, oldSymbol, connectFTXWs, disconnectFTXWs) => {
    console.log(value, oldSymbol)
    baseChangeSymbol(value, exchange, setSymbol)
    disconnectFTXWs(oldSymbol)
    connectFTXWs(value.value)
}
