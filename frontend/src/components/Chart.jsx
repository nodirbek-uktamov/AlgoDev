import React, {useCallback, useContext, useState} from 'react'
import TradingViewWidget from 'react-tradingview-widget'
import {useLoad} from '../hooks/request'
import {intervals} from '../utils/intervals'
import {TradesList} from '../components/TradesList'
import {HUOBI_SYMBOLS} from '../urls'
import {MainContext} from '../contexts/MainContext'
import {OrdersList} from "./OrdersList";
import {Card} from "./common/Card";
import {Select} from "./common/Select";

const defaultOptions = {
    autosize: true,
    symbol: 'BYBIT:ETHUSDT',
    interval: 'D',
    timezone: 'Etc/UTC',
    theme: 'Dark',
    style: '1',
    locale: 'en',
    toolbar_bg: '#f1f3f6',
    enable_publishing: false,
    hide_top_toolbar: true,
    allow_symbol_change: true,
    container_id: 'tradingview_1a5f8',
}

function Chart({trades, cancelAllTrades}) {
    const symbols = useLoad({
        baseURL: HUOBI_SYMBOLS,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        Referrer: ''
    })

    const {symbolValue, wsCallbacksRef, disconnectHuobi, setSymbol, connectHuobi, accountWs} = useContext(MainContext)
    const [interval, setInterval] = useState({})
    const [selectedSymbol, setSelectedSymbol] = useState({});

    const symbolsList = (symbols.response ? symbols.response.data || [] : []).map((i) => ({
        value: i.bcdn + i.qcdn,
        label: i.dn,
        pair1: i.bcdn,
        pair2: i.qcdn
    }));

    const defaultSymbol = symbolsList.filter(s => s.value === symbolValue.toUpperCase())[0];

    const onChange = useCallback((val) => {
        if (!wsCallbacksRef.current) return;
        if (!accountWs.current) return;

        wsCallbacksRef.current.setOrdersData('clear')

        disconnectHuobi()

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
        wsCallbacksRef.current.updateInitialOrders()

        // eslint-disable-next-line
    }, [symbolValue])

    return (
        <div>
            <Card color='black'>
                <div style={{display: 'flex', gap: 20, marginBottom: 20}}>
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
                        renderMenuOption={o => o.label}
                    />

                    <Select
                        defaultValue={{label: "1 hour", value: 60}}
                        renderSelectedOption={o => o.label}
                        renderMenuOption={o => o.label}
                        options={intervals}
                        selectedOption={interval}
                        setSelectedOption={setInterval}/>
                </div>

                <div style={{height: 387}}>
                    <TradingViewWidget
                        {...defaultOptions}
                        symbol={`HUOBI:${symbolValue.toUpperCase()}`}
                        interval={interval?.value}/>
                </div>
            </Card>

            <Card dense={false}>
                <TradesList cancelAllTrades={cancelAllTrades} onCancel={trades.request} trades={trades.response || []}/>
                <OrdersList/>
            </Card>

        </div>
    )
}

export default React.memo(Chart)
