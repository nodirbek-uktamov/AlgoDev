import React, { useState } from 'react'
import TradingViewWidget from 'react-tradingview-widget'
import { useLoad } from '../hooks/request'
import ReactSelect from './common/ReactSelect'
import BidAsk from './BidAsk'
import { intervals } from '../utils/intervals'

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
    // const [options] = useState(defaultOptions)
    const [interval, setInterval] = useState('60')
    const url = 'https://api.huobi.pro/v2/settings/common/symbols/'
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    const symbols = useLoad({ baseURL: url, headers, Referrer: '' })

    let symbolsList = symbols.response ? symbols.response.data || [] : []
    symbolsList = symbolsList.map((i) => ({ value: i.bcdn + i.qcdn, label: i.dn, pair1: i.bcdn, pair2: i.qcdn }))

    function onChange(val) {
        localStorage.setItem('symbol', JSON.stringify(val))
        setSymbol(val)
    }

    return (
        <div>
            <div className="is-flex is-align-items-center mb-2">
                <ReactSelect
                    className="mr-2"
                    options={symbolsList}
                    onChange={onChange}
                    defaultValue={symbol} />

                <ReactSelect options={intervals} onChange={setInterval} defaultValue={interval} />
                <BidAsk symbol={symbol.toLowerCase()} />
            </div>

            <TradingViewWidget {...defaultOptions} symbol={`HUOBI:${symbol}`} interval={interval} />
        </div>
    )
}
