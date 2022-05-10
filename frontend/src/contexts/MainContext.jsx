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


    const balanceParams = useGetRequest({url: BALANCE})

    const symbolValue = symbol.value.toLowerCase()


    useEffect(() => {

        if (symbolPreccions.response) {
            let data = symbolPreccions.response.data.find((i) => i.symbol === symbol.value.toLowerCase());
            setSymbolSettings(data)
        }

    }, [symbolPreccions.response])

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
                if (data.ch.includes('bbo') && typeof wsCallbacksRef.current.setBidAskData === 'function') {
                    wsCallbacksRef.current.setBidAskData({[data.ch.split('.')[1]]: data.tick})

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
                ch: 'orders#' + symbolValue,
            }))
        }

        if (data.action === 'ping') {
            accountWs.current.send(JSON.stringify({action: 'pong', data: {ts: data.data.ts}}))
        }

        if (data.ch && data.ch.includes("orders") && data.action === 'push') {
            const item = data.data
            item.side = item.type.split('-')[0]
            item.type = item.type.split('-')[1]
            item.time = new Date(item.orderCreateTime).toLocaleTimeString()
            item.orderSize = item.orderSize || item.tradeVolume
            item.orderPrice = item.orderPrice || item.tradePrice
            console.log(item)

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

        if (data.action === 'push' && data.data.accountId === user.spotAccountId) {
            wsCallbacksRef.current.setBalance((oldBalance) => ({
                ...oldBalance,
                [data.data.currency]: Number(data.data.available)
            }))
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
        symbolValue,
        huobiWs,
        disconnectHuobi,
        connectHuobi,
        wsCallbacksRef,
        depthType,
        setDepthType,
        accountWs,
        price
    }

    return (
        <MainContext.Provider value={contextValues}>
            {children}
        </MainContext.Provider>
    )
}
