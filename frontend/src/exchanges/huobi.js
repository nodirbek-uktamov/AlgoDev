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