import React, { useState, useEffect, useRef, useCallback } from 'react'
import { LOGS_WS } from '../urls'

export default function Logs({ symbol, trades }) {
    const ws = useRef(null)

    const user = JSON.parse(localStorage.getItem('user'))
    const [logs, setLogs] = useState([])
    const [log, setLog] = useState({})

    useEffect(() => {
        ws.current = new WebSocket(LOGS_WS.replace('{id}', user.id))
        gettingData()

        return () => {
            ws.current.close()
        }
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (log.action && trades.response) {
            if (log.action.delete) trades.setResponse(trades.response.filter((i) => i.id !== log.action.delete))

            if (typeof log.action.filled_amount === 'number') {
                trades.setResponse(trades.response.map((i) => {
                    if (i.id === log.action.trade) return { ...i, filledAmount: log.action.filled_amount }
                    return i
                }))
            }

            if (typeof log.action.completed_loops === 'number') {
                trades.setResponse(trades.response.map((i) => {
                    if (i.id === log.action.trade) return { ...i, completedLoops: log.action.completed_loops }
                    return i
                }))
            }
        }

        if (log.message) setLogs([log.message, ...logs])
        // eslint-disable-next-line
    }, [log])

    const gettingData = () => {
        if (!ws.current) return

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data)

            setLog(data)
        }
        // eslint-disable-next-line
    }

    return (
        <div className="ml-0 card" style={{ height: 500, overflow: 'scroll' }}>
            <div className="card-content content">
                {logs.map((message, index) => (
                    <div dangerouslySetInnerHTML={{ __html: message }} className="mb-1" key={index} />
                ))}
            </div>
        </div>
    )
}
