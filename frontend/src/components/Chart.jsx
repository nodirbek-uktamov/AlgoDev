import React, { useContext, useState } from 'react'
import TradingViewWidget from 'react-tradingview-widget'
import { intervals } from '../utils/intervals'
import { TradesList } from './TradesList'
import { MainContext } from '../contexts/MainContext'
import { HuobiOrdersList } from './huobi/HuobiOrdersList'
import { Card } from './common/Card'
import { Select } from './common/Select'
import { FTX, HUOBI } from '../exchanges/exchanges'
import FTXOrders from './ftx/FTXOrders'
import { huobiOnChangeSymbol } from '../exchanges/huobi'
import { ftxOnChangeSymbol } from '../exchanges/ftx'

const defaultOptions = {
    autosize: true,
    symbol: 'HUOBI:ETHUSDT',
    interval: 'D',
    timezone: 'Etc/UTC',
    theme: 'Dark',
    style: '1',
    locale: 'en',
    toolbar_bg: '#f1f3f6',
    enable_publishing: false,
    hide_top_toolbar: false,
    allow_symbol_change: false,
    container_id: 'tradingview_1a5f8',
    backgroundColor: '#abcabc',
}

function Chart({ trades, cancelAllTrades }) {
    const { exchange } = useContext(MainContext)

    const {
        symbolValue,
        wsCallbacksRef,
        disconnectHuobi,
        setSymbol,
        connectHuobi,
        privateWs,
        symbolsList,
        connectFTXWs,
        disconnectFTXWs,
    } = useContext(MainContext)

    const [interval, setInterval] = useState({
        label: '1 hour',
        value: 60,
    })

    const [selectedSymbol, setSelectedSymbol] = useState({})

    const defaultSymbol = symbolsList.filter((s) => s.value === symbolValue.toUpperCase())[0]

    const onChange = (value) => {
        setSelectedSymbol(value)

        if (exchange === HUOBI) {
            huobiOnChangeSymbol(
                value,
                connectHuobi,
                symbolValue,
                exchange,
                setSymbol,
                wsCallbacksRef,
                privateWs,
                disconnectHuobi,
            )
        }

        if (exchange === FTX) ftxOnChangeSymbol(value, exchange, setSymbol, symbolValue, connectFTXWs, disconnectFTXWs)
    }

    return (
        <div>
            <Card color="black">
                <div style={{ display: 'flex', gap: '1.1rem', marginBottom: '1.1rem' }}>
                    <Select
                        enableSearch
                        searchBy={(o) => o.label}
                        options={symbolsList}
                        setSelectedOption={onChange}
                        defaultValue={defaultSymbol}
                        selectedOption={selectedSymbol}
                        renderSelectedOption={(o) => o.label}
                        renderMenuOption={(o) => o.label} />

                    <Select
                        defaultValue={intervals[6]}
                        renderSelectedOption={(o) => o.label}
                        renderMenuOption={(o) => o.label}
                        options={intervals}
                        selectedOption={interval}
                        setSelectedOption={setInterval} />
                </div>

                <div style={{ height: '21.5rem' }}>
                    <TradingViewWidget
                        {...defaultOptions}
                        symbol={`${exchange.toUpperCase()}:${symbolValue.replace('-', '').toUpperCase()}`}
                        interval={interval && interval.value} />
                </div>
            </Card>

            <Card dense={false}>
                <TradesList
                    cancelAllTrades={cancelAllTrades}
                    onCancel={trades.request}
                    trades={trades.response || []} />

                {exchange === HUOBI && <HuobiOrdersList />}
                {exchange === FTX && <FTXOrders />}
            </Card>
        </div>
    )
}

export default React.memo(Chart)
