import React, { createContext, useEffect, useRef, useState } from 'react'
import { Formik } from 'formik'
import { useHistory } from 'react-router-dom'
import Chart from '../components/Chart'
import TradeForm from '../components/TradeForm'
import { useLoad, usePostRequest, usePutRequest } from '../hooks/request'
import { CANCEL_TRADES, HUOBI_SYMBOL_SETTINGS, TRADE } from '../urls'
import { signOut } from '../utils/auth'
import Button from '../components/common/Button'
import Logs from '../components/Logs'
import { Context } from '../components/common/BaseContext'
import { parseGzip, WS_TYPES } from '../utils/websocket'
import OrdersTabs from '../components/OrdersTabs'

export const MainContext = createContext({})

export default function Main() {
    const [tradeType, setTradeType] = useState('limit')
    const history = useHistory()
    const initialSymbol = localStorage.getItem('symbol')
    const [symbol, setSymbol] = useState(initialSymbol ? JSON.parse(initialSymbol) : { value: 'ETHUSDT', pair1: 'ETH', pair2: 'USDT' })
    const createTrade = usePostRequest({ url: TRADE })
    const trades = useLoad({ url: TRADE })
    const cancelTrades = usePutRequest()
    const wsCallbacksRef = useRef({})
    const ws = useRef(null)
    const [depthType, setDepthType] = useState('step0')
    const symbolPreccions = useLoad({ baseURL: HUOBI_SYMBOL_SETTINGS, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, Referrer: '' })
    const symbolSettings = symbolPreccions.response ? symbolPreccions.response.data.find((i) => i.symbol === symbol.value.toLowerCase()) : {}
    const tpp = symbolSettings.tpp || 0

    const [botPrices, setBotPrices] = useState({})

    async function onSubmit(data) {
        const newData = {
            ...data,
            symbol: symbol.value,
            trade_type: tradeType,
            twap_bot_duration: data.twap_bot_duration * 60,
            iceberg_price: data.iceberg_price || 0,
        }

        if (data.botType === 'iceberg') {
            newData.iceberg = true
        }
        if (data.botType === 'mm') {
            newData.iceberg = true
            newData.market_making = true
        }

        if (data.botType === 'twap') {
            newData.twap_bot = true
        }

        const { success, error } = await createTrade.request({ data: newData })

        if (success) {
            trades.request()
            return
        }

        alert(error && error.data.message)
    }

    const tradeInitialValues = {
        quantity: '',
        loop: true,
        time_interval: 120,
        iceberg: false,
        icebergs_count: 0,
        twap_bot: false,
        twap_bot_duration: 0,
        iceberg_price: '',
    }

    async function cancelAllTrades() {
        const { success } = await cancelTrades.request({ url: CANCEL_TRADES })

        if (success) {
            trades.setResponse([])
        }
    }

    function connect(s) {
        ws.current.send(JSON.stringify({ sub: WS_TYPES.orders.replace('{symbol}', s) }))
        ws.current.send(JSON.stringify({ sub: WS_TYPES.bidAsk.replace('{symbol}', s) }))
        ws.current.send(JSON.stringify({ sub: WS_TYPES.book.replace('{symbol}', s).replace('{type}', depthType) }))
    }

    function disconnect() {
        const s = symbol.value.toLowerCase()

        ws.current.send(JSON.stringify({ unsub: WS_TYPES.orders.replace('{symbol}', s) }))
        ws.current.send(JSON.stringify({ unsub: WS_TYPES.bidAsk.replace('{symbol}', s) }))
        ws.current.send(JSON.stringify({ unsub: WS_TYPES.book.replace('{symbol}', s).replace('{type}', depthType) }))
    }

    useEffect(() => {
        ws.current = new WebSocket('wss://api.huobi.pro/ws')
        ws.current.onopen = () => connect(symbol.value.toLowerCase())

        ws.current.onclose = onClose

        ws.current.addEventListener('message', handleMessage)

        return () => {
            ws.current.close()
        }
        // eslint-disable-next-line
    }, [])

    function onClose() {
        if (wsCallbacksRef.current.setLogs) {
            wsCallbacksRef.current.setLogs((oldLogs) => ['Huobi socket is closed. Reconnecting...', ...oldLogs])
        }

        ws.current = new WebSocket('wss://api.huobi.pro/ws')

        ws.current.onopen = () => {
            setTimeout(() => {
                connect(symbol.value.toLowerCase())
            }, 1000)
        }

        ws.current.addEventListener('message', handleMessage)
        ws.current.onclose = onClose
    }

    function handleMessage(event) {
        parseGzip(event, (msg) => {
            const data = JSON.parse(msg)

            if (data.ping) {
                ws.current.send(JSON.stringify({ pong: data.ping }))
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

    return (
        <Context.Provider value={{ }}>
            <div className="mx-5 pb-6 mt-1">
                <div className="columns mb-4 mt-2">
                    <div className="column" />

                    <div className="column is-narrow" style={{ width: 200 }}>
                        {(trades.response && trades.response.length > 0) && (
                            <Button text="Cancel all orders" className="is-danger" onClick={cancelAllTrades} />
                        )}
                    </div>

                    <div className="column is-narrow" style={{ width: 200 }}>
                        <Button
                            className="pointer is-info"
                            onClick={() => signOut(history)}
                            text="Logout" />
                    </div>
                </div>

                <div className="columns">
                    <div className="column is-narrow" style={{ width: 350 }}>
                        <Formik initialValues={tradeInitialValues} onSubmit={onSubmit}>
                            <TradeForm symbol={symbol} setTradeType={setTradeType} tradeType={tradeType} />
                        </Formik>

                        <Logs wsCallbacksRef={wsCallbacksRef} setBotPrices={setBotPrices} trades={trades} />
                    </div>

                    <div className="column is-narrow mr-4" style={{ width: 670 }}>
                        <Chart
                            tpp={tpp}
                            wsCallbacksRef={wsCallbacksRef}
                            connect={connect}
                            disconnect={disconnect}
                            trades={trades}
                            symbol={symbol.value.toLowerCase()}
                            setSymbol={setSymbol} />
                    </div>

                    <div className="column">
                        <OrdersTabs
                            symbolSettings={symbolSettings}
                            botPrices={botPrices}
                            wsCallbacksRef={wsCallbacksRef}
                            tpp={tpp}
                            symbol={symbol.value.toLowerCase()}
                            depthType={depthType}
                            setDepthType={setDepthType}
                            ws={ws} />
                    </div>
                </div>
            </div>
        </Context.Provider>
    )
}
