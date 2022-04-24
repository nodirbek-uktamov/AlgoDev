import React, {useCallback, useContext, useState} from 'react'
import TradingViewWidget from 'react-tradingview-widget'
import { useLoad } from '../hooks/request'
import ReactSelect from './common/ReactSelect'
import BidAsk from './BidAsk'
import { intervals } from '../utils/intervals'
import {TradesList} from '../components/TradesList'
import { HUOBI_SYMBOLS } from '../urls'
import {MainContext} from '../contexts/MainContext'
import MyOrders from "./MyOrders";

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

function Chart({ trades }) {
    const symbols = useLoad({ baseURL: HUOBI_SYMBOLS, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, Referrer: '' })

    const { symbolValue, wsCallbacksRef, disconnectHuobi, setSymbol, connectHuobi } = useContext(MainContext)
    const [interval, setInterval] = useState('60')
    const symbolsList = (symbols.response ? symbols.response.data || [] : []).map((i) => ({ value: i.bcdn + i.qcdn, label: i.dn, pair1: i.bcdn, pair2: i.qcdn }))

    const onChange = useCallback((val) => {
        wsCallbacksRef.current.setOrdersData('clear')

        disconnectHuobi()

        localStorage.setItem('symbol', JSON.stringify(val))
        setSymbol(val)
        connectHuobi(val.value.toLowerCase())

        // eslint-disable-next-line
    }, [symbolValue])

    return (
        <div>
            <div className="is-flex is-align-items-center mb-2">
                <ReactSelect
                    className="mr-2"
                    options={symbolsList}
                    onChange={onChange}
                    defaultValue={symbolValue.toUpperCase()} />

                <ReactSelect options={intervals} onChange={setInterval} defaultValue={interval} />
                <BidAsk wsCallbacksRef={wsCallbacksRef} symbol={symbolValue} />
            </div>

            <TradingViewWidget {...defaultOptions} symbol={`HUOBI:${symbolValue.toUpperCase()}`} interval={interval} />
            <TradesList onCancel={trades.request} trades={trades.response || []} />
            <MyOrders />
        </div>
    )
}

export default React.memo(Chart)
