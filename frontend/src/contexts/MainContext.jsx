import React, {createContext, useEffect, useRef, useState} from "react";
import {parseGzip, WS_TYPES} from "../utils/websocket";
import {useGetRequest, useLoad} from "../hooks/request";
import {BALANCE, HUOBI_SYMBOL_SETTINGS} from "../urls";

export const MainContext = createContext({})

export default function MainContextWrapper({children}) {
    const wsCallbacksRef = useRef({})
    const huobiWs = useRef({})

    const initialSymbol = localStorage.getItem('symbol')
    const user = JSON.parse(localStorage.getItem('user'))
    const defaultSymbol = { value: 'ETHUSDT', pair1: 'ETH', pair2: 'USDT' }

    const [symbol, setSymbol] = useState(initialSymbol ? JSON.parse(initialSymbol) : defaultSymbol)
    const [depthType, setDepthType] = useState('step0')

    const symbolPreccions = useLoad({ baseURL: HUOBI_SYMBOL_SETTINGS, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, Referrer: '' })
    const symbolSettings = symbolPreccions.response ? symbolPreccions.response.data.find((i) => i.symbol === symbol.value.toLowerCase()) : {}
    const balanceParams = useGetRequest({ url: BALANCE })

    useEffect(() => {
        connectAccountWs()

        huobiWs.current = new WebSocket('wss://api.huobi.pro/ws')
        huobiWs.current.onopen = () => connectHuobi(symbol.value.toLowerCase())
        huobiWs.current.onclose = onClose
        huobiWs.current.addEventListener('message', handleMessageMarketData)

        return () => {
            huobiWs.current.close()
        }
        // eslint-disable-next-line
    }, [])

    function connectHuobi(s) {
        huobiWs.current.send(JSON.stringify({ sub: WS_TYPES.orders.replace('{symbol}', s) }))
        huobiWs.current.send(JSON.stringify({ sub: WS_TYPES.bidAsk.replace('{symbol}', s) }))
        huobiWs.current.send(JSON.stringify({ sub: WS_TYPES.book.replace('{symbol}', s).replace('{type}', depthType) }))
    }

    function disconnectHuobi() {
        const s = symbol.value.toLowerCase()

        huobiWs.current.send(JSON.stringify({ unsub: WS_TYPES.orders.replace('{symbol}', s) }))
        huobiWs.current.send(JSON.stringify({ unsub: WS_TYPES.bidAsk.replace('{symbol}', s) }))
        huobiWs.current.send(JSON.stringify({ unsub: WS_TYPES.book.replace('{symbol}', s).replace('{type}', depthType) }))
    }

    function onClose() {
        setTimeout(() => {
            if (wsCallbacksRef.current.setLogs) {
                wsCallbacksRef.current.setLogs((oldLogs) => ['Huobi socket is closed. Reconnect after 1 seconds', ...oldLogs])
            }

            huobiWs.current = new WebSocket('wss://api.huobi.pro/ws')

            huobiWs.current.onopen = () => {
                connectHuobi(symbol.value.toLowerCase())
            }

            huobiWs.current.addEventListener('message', handleMessageMarketData)
            huobiWs.current.onclose = onClose
        }, 1000)
    }

    function handleMessageMarketData(event) {
        parseGzip(event, (msg) => {
            const data = JSON.parse(msg)

            if (data.ping) {
                huobiWs.current.send(JSON.stringify({ pong: data.ping }))
            }

            if (data.tick) {
                if (data.ch.includes('bbo') && typeof wsCallbacksRef.current.setBidAskData === 'function') {
                    wsCallbacksRef.current.setBidAskData({ [data.ch.split('.')[1]]: data.tick })
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


    const accountWs = useRef(null)

    async function connectAccountWs() {
        const { response, success } = await balanceParams.request()
        if (!success) return

        accountWs.current = new WebSocket(response.url)
        accountWs.current.onopen = () => connect(response.params)
        accountWs.current.onclose = connectAccountWs
        accountWs.current.addEventListener('message', handleMessageAccount)
    }

    function handleMessageAccount(event) {
        const data = JSON.parse(event.data)

        if (data.code === 200 && data.ch === 'auth') {
            accountWs.current.send(JSON.stringify({
                action: 'sub',
                ch: 'accounts.update#2',
            }))

            accountWs.current.send(JSON.stringify({
                action: 'sub',
                ch: 'orders#trxusdt',
            }))
        }

        if (data.action === 'ping') {
            accountWs.current.send(JSON.stringify({ action: 'pong', data: { ts: data.data.ts } }))
        }

        if (data.ch && data.ch.includes("orders") && data.action === 'push') {
            if (data.data.orderStatus === 'submitted') {
                wsCallbacksRef.current.setOpenOrders(oldOrders => [...oldOrders, data.data])
            }

            else if (data.data.orderStatus === 'canceled' || data.data.orderStatus === 'filled') {
                wsCallbacksRef.current.setOpenOrders(oldOrders => oldOrders.filter(i => i.orderId !== data.data.orderId))
            }

            // else if (data.data.orderStatus === 'filled') console.log('filled: ', data)
            // else console.log(data)
        }

        if (data.action === 'push' && data.data.accountId === user.spotAccountId) {
            wsCallbacksRef.current.setBalance((oldBalance) => ({ ...oldBalance, [data.data.currency]: Number(data.data.available) }))
        }
    }

    function connect(params) {
        accountWs.current.send(JSON.stringify({
            action: 'req',
            ch: 'auth',
            params,
        }))
    }

    const contextValues = {
        setSymbol,
        symbol,
        symbolSettings,
        user,
        symbolValue: symbol.value.toLowerCase(),
        huobiWs,
        disconnectHuobi,
        connectHuobi,
        wsCallbacksRef,
        depthType,
        setDepthType,
    }

    return (
        <MainContext.Provider value={contextValues}>
            {children}
        </MainContext.Provider>
    )
}
