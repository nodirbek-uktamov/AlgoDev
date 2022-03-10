import React, { useState } from 'react'
import TradingViewWidget from 'react-tradingview-widget'
import { useLoad } from '../hooks/request'
import ReactSelect from './common/ReactSelect'
import BidAsk from './BidAsk'
import { intervals } from '../utils/intervals'
import Orders from './Orders'

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

export default function Chart({ symbol, setSymbol }) {
    const [options, setOptions] = useState(defaultOptions)
    const [interval, setInterval] = useState(1)
    const symbols = useLoad({ baseURL: 'https://api.huobi.pro/v2/settings/common/symbols/', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, Referrer: '' })

    let symbolsList = symbols.response ? symbols.response.data || [] : []
    symbolsList = symbolsList.map((i) => ({ value: i.bcdn + i.qcdn, label: i.dn }))

    return (
        <div>
            <div className="is-flex is-align-items-center mb-2">
                <ReactSelect className="mr-2" options={symbolsList} onChange={(val) => setSymbol(val.toLowerCase())} defaultValue={symbol.toUpperCase()} />
                <ReactSelect options={intervals} onChange={setInterval} defaultValue={interval} />
                <BidAsk symbol={symbol} />
            </div>

            <TradingViewWidget {...options} symbol={`BYBIT:${symbol.toUpperCase()}`} interval={interval} />
        </div>
    )
}
