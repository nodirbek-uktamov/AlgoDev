import React, {useContext, useState} from 'react'
import TradingViewWidget from 'react-tradingview-widget'
import {useLoad} from '../hooks/request'
import {intervals} from '../utils/intervals'
import {TradesList} from '../components/TradesList'
import {MainContext} from '../contexts/MainContext'
import {HuobiOrdersList} from "./huobi/HuobiOrdersList"
import {Card} from "./common/Card"
import {Select} from "./common/Select"
import {getSymbolsList, getSymbolRequestOptions, HUOBI, FTX} from "../utils/exchanges";
import {FTXOrdersList} from "./ftx/FTXOrdersList";

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
    backgroundColor: "#abcabc",
}

function Chart({trades, cancelAllTrades}) {
    const {exchange} = useContext(MainContext)

    const symbols = useLoad(getSymbolRequestOptions(exchange))

    const {symbolValue, wsCallbacksRef, disconnectHuobi, setSymbol, connectHuobi, accountWs} = useContext(MainContext)
    const [interval, setInterval] = useState({label: "1 hour", value: 60})
    const [selectedSymbol, setSelectedSymbol] = useState({});

    const symbolsList = getSymbolsList(symbols.response || {}, exchange)

    const defaultSymbol = symbolsList.filter(s => s.value === symbolValue.toUpperCase())[0];

    const onChange = (val) => {
        if (!wsCallbacksRef.current) return;
        if (!accountWs.current) return;

        wsCallbacksRef.current.setOrdersData('clear')

        disconnectHuobi()
        wsCallbacksRef.current.setOrders([])

        localStorage.setItem('symbol', JSON.stringify(val))
        setSymbol(val)
        connectHuobi(val?.value?.toLowerCase())

        accountWs.current.send(JSON.stringify({
            action: 'unsub',
            ch: 'orders#' + symbolValue,
        }))

        accountWs.current.send(JSON.stringify({
            action: 'sub',
            ch: 'orders#' + val.value.toLowerCase(),
        }))
        wsCallbacksRef.current.updateInitialOrders(val.value.toLowerCase())

        // eslint-disable-next-line
    }

    return (
        <div>
            <Card color='black'>
                <div style={{display: 'flex', gap: '1.1rem', marginBottom: '1.1rem'}}>
                    <Select
                        enableSearch
                        searchBy={o => o.label}
                        options={symbolsList}
                        setSelectedOption={o => {
                            setSelectedSymbol(o)
                            onChange(o)
                        }}
                        defaultValue={defaultSymbol}
                        selectedOption={selectedSymbol}
                        renderSelectedOption={o => o.label}
                        renderMenuOption={o => o.label} />

                    <Select
                        defaultValue={intervals[6]}
                        renderSelectedOption={o => o.label}
                        renderMenuOption={o => o.label}
                        options={intervals}
                        selectedOption={interval}
                        setSelectedOption={setInterval}/>
                </div>

                <div style={{height: '21.5rem'}}>
                    <TradingViewWidget
                        {...defaultOptions}
                        symbol={`${exchange.toUpperCase()}:${symbolValue.toUpperCase()}`}
                        interval={interval?.value}/>
                </div>
            </Card>

            <Card dense={false}>
                <TradesList cancelAllTrades={cancelAllTrades} onCancel={trades.request} trades={trades.response || []}/>
                {exchange === HUOBI && <HuobiOrdersList />}
                {exchange === FTX && <FTXOrdersList />}
            </Card>
        </div>
    )
}

export default React.memo(Chart)
