import React, {useState, useEffect, useRef, useContext} from 'react'
import {LOGS_WS} from '../urls'
import {MainContext} from "../contexts/MainContext";
import {Card} from "./common/Card";

export default function Logs({setBotPrices, trades}) {

    const {wsCallbacksRef} = useContext(MainContext)
    const ws = useRef(null)

    const user = JSON.parse(localStorage.getItem('user'))
    const [logs, setLogs] = useState([])

    function connect() {
        ws.current = new WebSocket(LOGS_WS.replace('{id}', user.id))
        ws.current.onmessage = handleMessage
        ws.current.onclose = onClose
    }

    useEffect(() => {
        wsCallbacksRef.current.setLogs = setLogs
        connect()

        return () => {
            ws.current.close()
        }
        // eslint-disable-next-line
    }, [])

    function onClose() {
        setLogs((oldLogs) => ['Logs socket is closed. Reconnecting...', ...oldLogs])

        setTimeout(() => {
            connect()
        }, 2000)
    }

    function handleMessage(event) {
        if (!ws.current) return

        const log = JSON.parse(event.data)

        if (log.action) {
            if (log.action.delete) {
                trades.setResponse((oldTrades) => (oldTrades || []).filter((i) => i.id !== log.action.delete))
                setBotPrices((oldPrices) => ({...(oldPrices || {}), [log.action.delete]: {price: 0}}))
            } else if (log.action.take_profit_order) wsCallbacksRef.current.setTakeProfitOrderIds(oldIds => [log.action.take_profit_order, ...oldIds])
            else {
                if (log.action.price) {
                    setBotPrices((oldPrices) => ({...(oldPrices || {}), [log.action.price.trade]: log.action}))
                }

                if (typeof log.action.filled_amount === 'number') {
                    trades.setResponse((oldTrades) => (oldTrades || []).map((i) => {
                        if (i.id === log.action.trade) return {...i, filledAmount: log.action.filled_amount}
                        return i
                    }))
                }

                if (typeof log.action.active_order_ids === 'object') {
                    trades.setResponse((oldTrades) => (oldTrades || []).map((i) => {
                        if (i.id === log.action.trade) return {...i, activeOrderIds: log.action.active_order_ids}
                        return i
                    }))
                }

                if (typeof log.action.completed_loops === 'number') {
                    trades.setResponse((oldTrades) => (oldTrades || []).map((i) => {
                        if (i.id === log.action.trade) return {...i, completedLoops: log.action.completed_loops}
                        return i
                    }))
                }
            }
        }

        if (log.message) setLogs((oldLogs) => [log.message, ...oldLogs])
    }

    return (

            <div style={{height: 426, overflowX: 'hidden', overflowY: 'visible', backgroundColor: 'inherit'}}>
                {logs.map((message, index) => {
                    return <p key={index}>{message}</p>
                })}
            </div>

    )
}
