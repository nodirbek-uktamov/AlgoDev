import React, { useState, useEffect, useRef, useCallback } from 'react'
import { LOGS_WS } from '../urls'

export default function Logs({ setBotPrices, trades, wsCallbacksRef }) {
    const ws = useRef(null)

    const user = JSON.parse(localStorage.getItem('user'))
    const [logs, setLogs] = useState([])

    function connect() {
        ws.current = new WebSocket(LOGS_WS.replace('{id}', user.id))
        ws.current.onmessage = handleMessage
        ws.current.onclose = onClose
    }

    useEffect(() => {
        wsCallbacksRef.current = { ...wsCallbacksRef.current, setLogs }
        connect()

        return () => {
            ws.current.close()
        }
        // eslint-disable-next-line
    }, [])

    function onClose() {
        setLogs((oldLogs) => ['Logs socket is closed. Reconnecting...', ...oldLogs])
        connect()
    }

    function handleMessage(event) {
        if (!ws.current) return

        const log = JSON.parse(event.data)

        if (log.action) {
            if (log.action.delete) {
                trades.setResponse((oldTrades) => (oldTrades || []).filter((i) => i.id !== log.action.delete))
                setBotPrices((oldPrices) => ({ ...(oldPrices || {}), [log.action.delete]: { price: 0 } }))
            } else {
                if (log.action.price) {
                    setBotPrices((oldPrices) => ({ ...(oldPrices || {}), [log.action.price.trade]: log.action }))
                }

                if (typeof log.action.filled_amount === 'number') {
                    trades.setResponse((oldTrades) => (oldTrades || []).map((i) => {
                        if (i.id === log.action.trade) return { ...i, filledAmount: log.action.filled_amount }
                        return i
                    }))
                }

                if (typeof log.action.completed_loops === 'number') {
                    trades.setResponse((oldTrades) => (oldTrades || []).map((i) => {
                        if (i.id === log.action.trade) return { ...i, completedLoops: log.action.completed_loops }
                        return i
                    }))
                }
            }
        }

        if (log.message) setLogs((oldLogs) => [log.message, ...oldLogs])
    }

    return (
        <div className="ml-0 mt-5 card" style={{ height: 500, overflowX: 'hidden', overflowY: 'auto' }}>
            <div className="card-content content">
                {logs.map((message, index) => (
                    <div dangerouslySetInnerHTML={{ __html: message }} className="mb-1" key={index} />
                ))}
            </div>
        </div>
    )
}
