import React, { useContext, useState } from 'react'
import TradingViewWidget from 'react-tradingview-widget'
import { intervals } from '../utils/intervals'
import { MainContext } from '../contexts/MainContext'
import { Card } from './common/Card'
import { Select } from './common/Select'
import { FTX, HUOBI } from '../exchanges/exchanges'
import { huobiOnChangeSymbol } from '../exchanges/huobi'
import { ftxOnChangeSymbol } from '../exchanges/ftx'
import { getHeight } from '../utils/helpers'

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

function Chart() {
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
        <Card color="black" style={{ height: getHeight('chart-draggable-container'), paddingTop: 70 }}>
            <div style={{ display: 'flex', gap: '1.1rem', marginBottom: '1.1rem', position: 'absolute', top: 15 }}>
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

            <TradingViewWidget
                {...defaultOptions}
                symbol={`${exchange.toUpperCase()}:${symbolValue.replace('-', '').toUpperCase()}`}
                interval={interval && interval.value} />
        </Card>
    )
}

export default React.memo(Chart)
