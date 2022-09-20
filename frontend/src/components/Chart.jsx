import React, { useCallback, useContext, useState } from 'react'
import { intervals } from '../utils/intervals'
import { MainContext } from '../contexts/MainContext'
import { Card } from './common/Card'
import { Select } from './common/Select'
import { FTX, HUOBI } from '../exchanges/exchanges'
import { huobiOnChangeSymbol } from '../exchanges/huobi'
import { ftxOnChangeSymbol } from '../exchanges/ftx'
import { getHeight } from '../utils/helpers'
import FTXChart from './FTXChart'
import HuobiChart from './HuobiChart'
import { WS_TYPES } from '../utils/websocket'

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

function Chart({ openOrders }) {
    const {
        exchange,
        symbolValue,
        wsCallbacksRef,
        disconnectHuobi,
        setSymbol,
        connectHuobi,
        privateWs,
        symbolsList,
        connectFTXWs,
        disconnectFTXWs,
        publicWs,
    } = useContext(MainContext)

    const [chartInterval, setChartInterval] = useState({
        label: '1 hour',
        value: 60,
        valueInSeconds: 3600,
        houbiKlineValue: '60min',
        tradingViewKlineValue: '60',
    })

    const [selectedSymbol, setSelectedSymbol] = useState({})

    const defaultSymbol = symbolsList.filter((s) => s.value === symbolValue.toUpperCase())[0]

    const onChangeInterval = useCallback((newValue) => {
        setChartInterval(newValue)

        if (publicWs.current.readyState === WebSocket.OPEN) {
            publicWs.current.send(JSON.stringify({ unsub: WS_TYPES.candles.replace('{symbol}', symbolValue).replace('{period}', chartInterval.houbiKlineValue) }))
            publicWs.current.send(JSON.stringify({ sub: WS_TYPES.candles.replace('{symbol}', symbolValue).replace('{period}', newValue.houbiKlineValue) }))
        }
    }, [chartInterval.houbiKlineValue, publicWs, symbolValue])

    const onChangeSymbol = useCallback((value) => {
        setSelectedSymbol(value)

        if (publicWs.current.readyState === WebSocket.OPEN) {
            publicWs.current.send(JSON.stringify({ unsub: WS_TYPES.candles.replace('{symbol}', symbolValue).replace('{period}', chartInterval.houbiKlineValue) }))
            publicWs.current.send(JSON.stringify({ sub: WS_TYPES.candles.replace('{symbol}', value.value.toLowerCase()).replace('{period}', chartInterval.houbiKlineValue) }))
        }

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
    }, [chartInterval.houbiKlineValue, connectFTXWs, connectHuobi, disconnectFTXWs, disconnectHuobi, exchange, privateWs, publicWs, setSymbol, symbolValue, wsCallbacksRef])

    return (
        <Card color="black" style={{ height: getHeight('chart-draggable-container'), paddingBottom: '5rem' }} className="no-border-top-radius">
            <div style={{ display: 'flex', gap: '1.1rem', marginBottom: '1rem' }}>
                <Select
                    enableSearch
                    searchBy={(o) => o.label}
                    options={symbolsList}
                    setSelectedOption={onChangeSymbol}
                    defaultValue={defaultSymbol}
                    selectedOption={selectedSymbol}
                    renderSelectedOption={(o) => o.label}
                    renderMenuOption={(o) => o.label} />

                <Select
                    defaultValue={intervals[6]}
                    renderSelectedOption={(o) => o.label}
                    renderMenuOption={(o) => o.label}
                    options={intervals}
                    selectedOption={chartInterval}
                    setSelectedOption={onChangeInterval} />
            </div>

            {exchange === FTX ? <FTXChart onChangeSymbol={onChangeSymbol} symbolsList={symbolsList} onChangeInterval={onChangeInterval} openOrders={openOrders} chartInterval={chartInterval} /> : null}
            {exchange === HUOBI ? <HuobiChart onChangeSymbol={onChangeSymbol} symbolsList={symbolsList} onChangeInterval={onChangeInterval} openOrders={openOrders} chartInterval={chartInterval} /> : null}
        </Card>
    )
}

export default React.memo(Chart)
