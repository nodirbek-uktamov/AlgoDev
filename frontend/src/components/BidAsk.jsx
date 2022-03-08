import React, { useCallback, useEffect, useRef, useState } from 'react'
import TradingViewWidget from 'react-tradingview-widget'
import { useLoad } from '../hooks/request'
import SearchableSelect from './common/SearchableSelect'
import { parseGzip } from '../utils/websocket'

const defaultOptions = {
    width: 980,
    height: 610,
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


export default function Chart({ setPrice, symbol, setSymbol }) {
    const ws = useRef(null)
    const [bestBidAsk, setBestBidAsk] = useState({})
    const [options, setOptions] = useState(defaultOptions)
    const symbols = useLoad({ baseURL: 'https://api.huobi.pro', url: '/v2/settings/common/symbols/', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, Referrer: '' })

    useEffect(() => {
        ws.current = new WebSocket('wss://api.huobi.pro/ws')
        ws.current.onopen = () => ws.current.send(JSON.stringify({ sub: `market.${symbol}.bbo` }))

        gettingData()
        return () => ws.current.close()
        // eslint-disable-next-line
    }, [])

    const gettingData = useCallback(() => {
        if (!ws.current) return

        ws.current.onmessage = (event) => {
            parseGzip(event, (d) => {
                if (d.ping) {
                    ws.current.send(JSON.stringify({ pong: d.ping }))
                    return
                }

                if (d.tick) {
                    setBestBidAsk(d.tick)
                }
            })
        }
    }, [])

    function onClick() {
        setSymbol('TRXUSDT')
    }

    let symbolsList = symbols.response ? symbols.response.data || [] : []
    symbolsList = symbolsList.map((i) => ({ value: i.bcdn + i.qcdn, label: i.dn }))

    return (
        <div>
            <SearchableSelect options={symbolsList} />

            <div className="columns mt-3">
                <div onClick={() => setPrice(bestBidAsk.ask)} className="column is-narrow pointer">
                    ask: <span className="has-text-danger"> {bestBidAsk.ask}</span>
                </div>

                <div onClick={() => setPrice(bestBidAsk.bid)} className="column is-narrow pointer">
                    bid: <span className="has-text-success">{bestBidAsk.bid}</span>
                </div>
            </div>


            <p onClick={onClick}>Change to TRX USDT</p>
            <TradingViewWidget interval={1} {...options} symbol={symbol} />
        </div>
    )
}
