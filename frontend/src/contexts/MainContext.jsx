import React, {createContext, useEffect, useRef, useState} from "react";
import {parseGzip, WS_TYPES} from "../utils/websocket";
import {useGetRequest, useLoad} from "../hooks/request";
import {BALANCE, HUOBI_SYMBOL_SETTINGS} from "../urls";
import {FTX, handleAccountWsMessage, HUOBI} from "../exchanges/exchanges";

export const MainContext = createContext({})

export default function MainContextWrapper({children}) {
    const wsCallbacksRef = useRef({})
    const huobiWs = useRef({})
    const callbacks = useRef({})

    const initialSymbol = localStorage.getItem('symbol')
    const user = JSON.parse(localStorage.getItem('user'))
    const defaultSymbol = {value: 'ETHUSDT', pair1: 'ETH', pair2: 'USDT'}

    const [symbol, setSymbol] = useState(initialSymbol ? JSON.parse(initialSymbol) : defaultSymbol)
    const [depthType, setDepthType] = useState('step0')
    const [price, setPrice] = useState({})

    const [symbolSettings, setSymbolSettings] = useState({})

    const symbolPreccions = useLoad({
        baseURL: HUOBI_SYMBOL_SETTINGS,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        Referrer: ''
    })

    const exchange = window.location.pathname.replace('/', '')

    const balanceParams = useGetRequest({url: BALANCE.replace('{exchange}',exchange)})

    const symbolValue = symbol.value.toLowerCase()

    useEffect(() => {
        if (symbolPreccions.response) {
            let data = symbolPreccions.response.data.find((i) => i.symbol === symbol.value.toLowerCase());
            setSymbolSettings(data || {})
        }

    }, [symbolPreccions.response, symbol])

    useEffect(() => {
        connectAccountWs()

        huobiWs.current = new WebSocket('wss://api.huobi.pro/ws')
        huobiWs.current.onopen = () => connectHuobi(symbol.value.toLowerCase())
        huobiWs.current.onclose = onClose
        huobiWs.current.addEventListener('message', handleMessageMarketData)

        return () => {
            huobiWs.current.onclose = () => {}
            accountWs.current.onclose = () => {}

            huobiWs.current.close()
            accountWs.current.close()
        }
        // eslint-disable-next-line
    }, [])

    function connectHuobi(s) {
        huobiWs.current.send(JSON.stringify({sub: WS_TYPES.orders.replace('{symbol}', s)}))
        huobiWs.current.send(JSON.stringify({sub: WS_TYPES.bidAsk.replace('{symbol}', s)}))
        huobiWs.current.send(JSON.stringify({sub: WS_TYPES.book.replace('{symbol}', s).replace('{type}', depthType)}))
    }

    function disconnectHuobi() {
        const s = symbol.value.toLowerCase()

        huobiWs.current.send(JSON.stringify({unsub: WS_TYPES.orders.replace('{symbol}', s)}))
        huobiWs.current.send(JSON.stringify({unsub: WS_TYPES.bidAsk.replace('{symbol}', s)}))
        huobiWs.current.send(JSON.stringify({unsub: WS_TYPES.book.replace('{symbol}', s).replace('{type}', depthType)}))
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
                huobiWs.current.send(JSON.stringify({pong: data.ping}))
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

    const accountWs = useRef(null)

    async function connectAccountWs() {
        const {response, success} = await balanceParams.request()
        if (!success) return

        accountWs.current = new WebSocket(response.url)
        accountWs.current.onopen = () => connect(response.params)
        accountWs.current.onclose = connectAccountWs
        accountWs.current.addEventListener('message', handleAccountWsMessage(accountWs, symbol, wsCallbacksRef, user))
    }

    function connect(params) {
        if (exchange === HUOBI) {
            accountWs.current.send(JSON.stringify(params))
        }

        // if (exchange === FTX) {
        //     accountWs.current.send(JSON.stringify({'op': 'subscribe', 'channel': 'orders'}))
        // }
    }

    const contextValues = {
        setSymbol,
        symbol,
        symbolSettings,
        user,
        symbolValue,
        huobiWs,
        disconnectHuobi,
        connectHuobi,
        wsCallbacksRef,
        depthType,
        setDepthType,
        accountWs,
        price,
        callbacks,
        exchange
    }

    return (
        <MainContext.Provider value={contextValues}>
            {children}
        </MainContext.Provider>
    )
}
