import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import TradingViewWidget from 'react-tradingview-widget'
import pako from 'pako'
import { Form } from 'formik'
import { useLoad } from '../hooks/request'
import ReactSelect from './common/ReactSelect'
import BidAsk from './BidAsk'
import { intervals } from '../utils/intervals'
import TradesList from './TradesList'
import { parseGzip } from '../utils/websocket'
import Orders from './Orders'
import OrdersDepth from './OrdersDepth'
import { HUOBI_SYMBOL_SETTINGS, HUOBI_SYMBOLS } from '../urls'

const defaultOptions = {
    width: '100%',
    height: 400,
    symbol: 'BYBIT:ETHUSDT',
    interval: 'D',
    timezone: 'Etc/UTC',
    theme: 'Light',
    style: '1',
    locale: 'en',
    toolbar_bg: '#f1f3f6',
    enable_publishing: false,
    hide_top_toolbar: true,
    allow_symbol_change: true,
    container_id: 'tradingview_1a5f8',
}

function Chart({ symbol, setSymbol, trades }) {
    // const [options] = useState(defaultOptions)
    const [interval, setInterval] = useState('60')
    const [ordersTab, setOrdersTab] = useState('list')
    const [depthType, setDepthType] = useState('step0')

    const symbols = useLoad({ baseURL: HUOBI_SYMBOLS, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, Referrer: '' })
    const symbolPreccions = useLoad({ baseURL: HUOBI_SYMBOL_SETTINGS, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, Referrer: '' })
    const ws = useRef(null)
    const wsCallbacksRef = useRef({})

    const symbolSettings = symbolPreccions.response ? symbolPreccions.response.data.find((i) => i.symbol === symbol) : {}

    const symbolsList = (symbols.response ? symbols.response.data || [] : []).map((i) => ({ value: i.bcdn + i.qcdn, label: i.dn, pair1: i.bcdn, pair2: i.qcdn }))

    const types = {
        bidAsk: 'market.{symbol}.bbo',
        orders: 'market.{symbol}.trade.detail',
        book: 'market.{symbol}.depth.{type}',
    }

    const onChange = useCallback((val) => {
        wsCallbacksRef.current.setOrdersData('clear')

        disconnect()

        localStorage.setItem('symbol', JSON.stringify(val))
        setSymbol(val)
        connect(val.value.toLowerCase())

        // eslint-disable-next-line
    }, [symbol])

    function connect(s) {
        ws.current.send(JSON.stringify({ sub: types.orders.replace('{symbol}', s) }))
        ws.current.send(JSON.stringify({ sub: types.bidAsk.replace('{symbol}', s) }))
        ws.current.send(JSON.stringify({ sub: types.book.replace('{symbol}', s).replace('{type}', depthType) }))
    }

    function disconnect() {
        ws.current.send(JSON.stringify({ unsub: types.orders.replace('{symbol}', symbol) }))
        ws.current.send(JSON.stringify({ unsub: types.bidAsk.replace('{symbol}', symbol) }))
        ws.current.send(JSON.stringify({ unsub: types.book.replace('{symbol}', symbol).replace('{type}', depthType) }))
    }

    useEffect(() => {
        ws.current = new WebSocket('wss://api.huobi.pro/ws')
        ws.current.onopen = () => connect(symbol.toLowerCase())

        ws.current.addEventListener('message', (event) => {
            const handleMessage = (msg) => {
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
            }

            parseGzip(event, handleMessage)
        })

        return () => {
            ws.current.close()
        }
        // eslint-disable-next-line
    }, [])

    const tpp = symbolSettings.tpp || 0

    const depthSteps = [
        { label: (0.1 ** tpp).toFixed(tpp), value: 'step0' },
        { label: (0.1 ** (tpp - 1)).toFixed(tpp - 1 < 0 ? 0 : tpp - 1), value: 'step1' },
        { label: (0.1 ** (tpp - 2)).toFixed(tpp - 2 < 0 ? 0 : tpp - 2), value: 'step2' },
        { label: (0.1 ** (tpp - 3)).toFixed(tpp - 3 < 0 ? 0 : tpp - 3), value: 'step3' },
        { label: (0.1 ** (tpp - 3) * 5).toFixed(tpp - 3 < 0 ? 0 : tpp - 3), value: 'step4' },
        { label: (0.1 ** (tpp - 4)).toFixed(tpp - 4 < 0 ? 0 : tpp - 4), value: 'step5' },
    ]

    function onChangeDepthType({ value }) {
        ws.current.send(JSON.stringify({ unsub: types.book.replace('{symbol}', symbol).replace('{type}', depthType) }))
        setDepthType(value)
        ws.current.send(JSON.stringify({ sub: types.book.replace('{symbol}', symbol).replace('{type}', value) }))
    }

    return (
        <div>
            <div className="is-flex is-align-items-center mb-2">
                <ReactSelect
                    className="mr-2"
                    options={symbolsList}
                    onChange={onChange}
                    defaultValue={symbol.toUpperCase()} />

                <ReactSelect options={intervals} onChange={setInterval} defaultValue={interval} />
                <BidAsk wsCallbacksRef={wsCallbacksRef} symbol={symbol} />
            </div>

            <TradingViewWidget {...defaultOptions} symbol={`HUOBI:${symbol.toUpperCase()}`} interval={interval} />
            <TradesList onCancel={trades.request} trades={trades.response || []} />

            <div className="tabs mt-4">
                <ul>
                    <li onClick={() => setOrdersTab('list')} className={ordersTab === 'list' ? 'is-active' : null}>
                        <p>Trade list</p>
                    </li>

                    <li onClick={() => setOrdersTab('depth')} className={ordersTab === 'depth' ? 'is-active' : null}>
                        <p>Depth</p>
                    </li>
                </ul>
            </div>

            {ordersTab === 'list' && <Orders wsCallbacksRef={wsCallbacksRef} symbol={symbol} />}

            {ordersTab === 'depth' && (
                <Fragment>
                    <ReactSelect options={depthSteps} onChange={onChangeDepthType} defaultValue={depthSteps[0].value} />
                    <OrdersDepth wsCallbacksRef={wsCallbacksRef} />
                </Fragment>
            )}
        </div>
    )
}

export default React.memo(Chart)
