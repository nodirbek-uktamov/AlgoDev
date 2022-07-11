import React, { createContext, useEffect, useRef, useState } from 'react'
import { parseGzip, WS_TYPES } from '../utils/websocket'
import { useGetRequest, useLoad } from '../hooks/request'
import { BALANCE } from '../urls'
import { FTX,
    getDefaultSymbol,
    getSymbolRequestOptions, getSymbolsList,
    handlePrivateWsMessage,
    handlePublicWsMessage } from '../exchanges/exchanges'

export const MainContext = createContext({})

export default function MainContextWrapper({ children }) {
    const exchange = window.location.pathname.replace('/', '')

    const wsCallbacksRef = useRef({})
    const publicWs = useRef({})
    const callbacks = useRef({})
    const privateWs = useRef(null)

    const initialSymbol = localStorage.getItem(`${exchange}_symbol`)
    const user = JSON.parse(localStorage.getItem('user'))

    const [symbol, setSymbol] = useState(initialSymbol ? JSON.parse(initialSymbol) : getDefaultSymbol(exchange))
    const [depthType, setDepthType] = useState('step0')
    const [price, setPrice] = useState({})

    const symbols = useLoad(getSymbolRequestOptions(exchange))
    const symbolsList = getSymbolsList(symbols.response || {}, exchange)

    const balanceParams = useGetRequest({ url: BALANCE.replace('{exchange}', exchange) })

    const symbolValue = symbol.value.toLowerCase()

    useEffect(() => {
        connectPrivateWs()
        if (exchange !== FTX) publicWsConnect()

        return () => {
            if (publicWs.current) {
                publicWs.current.onclose = () => {}

                if (publicWs.current.close) publicWs.current.close()
            }

            if (privateWs.current) {
                privateWs.current.onclose = () => {}
                privateWs.current.close()
            }
        }
        // eslint-disable-next-line
    }, [])

    function connectHuobi(s) {
        publicWs.current.send(JSON.stringify({ sub: WS_TYPES.orders.replace('{symbol}', s) }))
        publicWs.current.send(JSON.stringify({ sub: WS_TYPES.bidAsk.replace('{symbol}', s) }))
        publicWs.current.send(JSON.stringify({ sub: WS_TYPES.book.replace('{symbol}', s).replace('{type}', depthType) }))
    }

    function disconnectHuobi() {
        const s = symbol.value.toLowerCase()

        publicWs.current.send(JSON.stringify({ unsub: WS_TYPES.orders.replace('{symbol}', s) }))
        publicWs.current.send(JSON.stringify({ unsub: WS_TYPES.bidAsk.replace('{symbol}', s) }))
        publicWs.current.send(JSON.stringify({ unsub: WS_TYPES.book.replace('{symbol}', s).replace('{type}', depthType) }))
    }

    function onClosePublicWs() {
        setTimeout(() => {
            if (wsCallbacksRef.current.setLogs) {
                wsCallbacksRef.current.setLogs((oldLogs) => [`${exchange} socket is closed. Reconnect after 1 seconds`, ...oldLogs])
            }

            publicWsConnect()
        }, 1000)
    }

    function publicWsConnect() {
        publicWs.current = new WebSocket('wss://api.huobi.pro/ws')
        publicWs.current.onopen = () => connectHuobi(symbol.value.toLowerCase())
        publicWs.current.addEventListener('message', handlePublicWsMessage(exchange, publicWs, wsCallbacksRef, setPrice))
        publicWs.current.onclose = onClosePublicWs
    }

    async function connectPrivateWs() {
        const { response, success } = await balanceParams.request()
        if (!success) return

        privateWs.current = new WebSocket(response.url)
        privateWs.current.onopen = () => privateWsConnect(response.params)

        privateWs.current.onclose = () => {
            setTimeout(() => {
                connectPrivateWs()
            }, 2000)
        }

        privateWs.current.addEventListener('message', handlePrivateWsMessage(exchange, privateWs, symbol, wsCallbacksRef, user))
    }

    function privateWsConnect(params) {
        privateWs.current.send(JSON.stringify(params))

        if (exchange === FTX) {
            connectFTXWs(symbolValue)
        }
    }

    function connectFTXWs(market) {
        // privateWs.current.send(JSON.stringify({ op: 'subscribe', channel: 'orderbook', market }))
        // privateWs.current.send(JSON.stringify({ op: 'subscribe', channel: 'trades', market }))
        privateWs.current.send(JSON.stringify({ op: 'subscribe', channel: 'orders', market }))
    }

    function disconnectFTXWs(market) {
        privateWs.current.send(JSON.stringify({ op: 'unsubscribe', channel: 'orderbook', market }))
        privateWs.current.send(JSON.stringify({ op: 'unsubscribe', channel: 'trades', market }))
        privateWs.current.send(JSON.stringify({ op: 'unsubscribe', channel: 'orders', market }))
    }

    const contextValues = {
        setSymbol,
        symbol,
        user,
        symbolValue,
        publicWs,
        disconnectHuobi,
        connectHuobi,
        wsCallbacksRef,
        depthType,
        setDepthType,
        privateWs,
        price,
        callbacks,
        exchange,
        symbolsList,
        disconnectFTXWs,
        connectFTXWs,
    }

    return (
        <MainContext.Provider value={contextValues}>
            {children}
        </MainContext.Provider>
    )
}
