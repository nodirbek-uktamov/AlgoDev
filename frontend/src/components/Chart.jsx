import React, { useCallback, useEffect, useRef, useState } from 'react'
import TradingViewWidget from 'react-tradingview-widget'
import pako from 'pako'
import { useLoad } from '../hooks/request'
import ReactSelect from './common/ReactSelect'
import BidAsk from './BidAsk'
import { intervals } from '../utils/intervals'
import TradesList from './TradesList'
import Orders from './Orders'
import { parseGzip } from '../utils/websocket'

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

export default function Chart({ symbol, setSymbol, trades }) {
    // const [options] = useState(defaultOptions)
    const [interval, setInterval] = useState('60')
    const url = 'https://api.huobi.pro/v2/settings/common/symbols/'
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    const symbols = useLoad({ baseURL: url, headers, Referrer: '' })
    const ws = useRef(null)

    let symbolsList = symbols.response ? symbols.response.data || [] : []
    symbolsList = symbolsList.map((i) => ({ value: i.bcdn + i.qcdn, label: i.dn, pair1: i.bcdn, pair2: i.qcdn }))

    const [bidAskData, setBidAskData] = useState({})
    const [ordersData, setOrdersData] = useState({})

    function onChange(val) {
        localStorage.setItem('symbol', JSON.stringify(val))
        setSymbol(val)
    }

    const types = {
        bidAsk: `market.${symbol.toLowerCase()}.bbo`,
        orders: `market.${symbol.toLowerCase()}.trade.detail`,
    }

    useEffect(() => {
        ws.current = new WebSocket('wss://api.huobi.pro/ws')

        ws.current.onopen = () => {
            ws.current.send(JSON.stringify({ sub: types.orders }))
            ws.current.send(JSON.stringify({ sub: types.bidAsk }))
        }

        gettingData()

        return () => {
            ws.current.close()
        }
        // eslint-disable-next-line
    }, [])

    const gettingData = useCallback(() => {
        if (!ws.current) return

        ws.current.onmessage = (event) => {
            const handleMessage = (msg) => {
                const data = JSON.parse(msg)

                if (data.ping) {
                    ws.current.send(JSON.stringify({ pong: data.ping }))
                    return
                }

                if (data.tick) {
                    if (data.ch === types.bidAsk) setBidAskData(data.tick)

                    if (data.ch === types.orders) {
                        setOrdersData(data.tick)
                    }
                }
            }

            const blob = event.data
            const reader = new FileReader()

            reader.onload = function (e) {
                const ploydata = new Uint8Array(e.target.result)
                const msg = pako.inflate(ploydata, { to: 'string' })
                handleMessage(msg)
            }
            reader.readAsArrayBuffer(blob, 'utf-8')
        }
        // eslint-disable-next-line
    }, [])


    return (
        <div>
            <div className="is-flex is-align-items-center mb-2">
                <ReactSelect
                    className="mr-2"
                    options={symbolsList}
                    onChange={onChange}
                    defaultValue={symbol} />

                <ReactSelect options={intervals} onChange={setInterval} defaultValue={interval} />
                <BidAsk data={bidAskData} />
            </div>

            <TradingViewWidget {...defaultOptions} symbol={`HUOBI:${symbol}`} interval={interval} />
            <TradesList onCancel={trades.request} trades={trades.response || []} />
            <Orders data={ordersData} symbol={symbol.toLowerCase()} />
        </div>
    )
}
