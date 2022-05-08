import React, {useCallback, useContext, useEffect, useState} from 'react'
import TradingViewWidget from 'react-tradingview-widget'
import {useLoad} from '../hooks/request'
import ReactSelect from './common/ReactSelect'
import BidAsk from './BidAsk'
import {intervals} from '../utils/intervals'
import {TradesList} from '../components/TradesList'
import {HUOBI_SYMBOLS} from '../urls'
import {MainContext} from '../contexts/MainContext'
import {OrdersList} from "./OrdersList";
import {Card} from "./common/Card";
import {Button} from "./common/Button/Button";
import {Spinner} from "./common/Spinner/Spinner";
import {Input} from "./common/Input";
import {ToggleSwitch} from "./common/ToggleSwitch";
import {Select} from "./common/Select";

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

function Chart({trades}) {
    const symbols = useLoad({
        baseURL: HUOBI_SYMBOLS,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        Referrer: ''
    })

    const {symbolValue, wsCallbacksRef, disconnectHuobi, setSymbol, connectHuobi, accountWs} = useContext(MainContext)
    const [interval, setInterval] = useState({label: "1 hour", value: 60})
    const symbolsList = (symbols.response ? symbols.response.data || [] : []).map((i) => ({
        value: i.bcdn + i.qcdn,
        label: i.dn,
        pair1: i.bcdn,
        pair2: i.qcdn
    }))

    const onChange = useCallback((val) => {
        console.log(val, 'val')
        wsCallbacksRef.current.setOrdersData('clear')

        disconnectHuobi()

        localStorage.setItem('symbol', JSON.stringify(val))
        setSymbol(val)
        connectHuobi(val.value.toLowerCase())

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

    const [selectedSymbol ,setSelectedSymbol] = useState(null)

    // useEffect(() => {
    //     if (symbolsList)
    //         setSelectedSymbol(symbolsList.filter(s => s.value === symbolValue.toUpperCase())[0])
    //
    // }, [symbolsList]);


    return (
        <div>
            <div className="is-flex is-align-items-center mb-2">
                <ReactSelect
                    className="mr-2"
                    options={symbolsList}
                    onChange={onChange}
                    defaultValue={symbolValue.toUpperCase()}/>

                <Select
                    options={symbolsList}
                    setSelectedOption={setSelectedSymbol}
                    selectedOption={symbolsList.filter(s => s.value === symbolValue.toUpperCase())[0]}
                    renderSelectedOption={o => o.label}
                    renderMenuOption={o => o.label}
                />

                <Select
                    renderSelectedOption={o => o.label}
                    renderMenuOption={o => o.label}
                    options={intervals}
                    selectedOption={interval}
                    setSelectedOption={setInterval}/>

                <BidAsk wsCallbacksRef={wsCallbacksRef} symbol={symbolValue}/>
            </div>

            <TradingViewWidget {...defaultOptions} symbol={`HUOBI:${symbolValue.toUpperCase()}`}
                               interval={interval.value}/>
            <Card>
                <TradesList onCancel={trades.request} trades={trades.response || []}/>
                <OrdersList/>
            </Card>

        </div>
    )
}

export default React.memo(Chart)
