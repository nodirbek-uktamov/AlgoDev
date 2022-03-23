import React, { useState, useEffect, useRef, useCallback } from 'react'
import { LOGS_WS } from '../urls'

export default function Logs({ symbol, trades }) {
    const ws = useRef(null)

    const user = JSON.parse(localStorage.getItem('user'))
    const [logs, setLogs] = useState([])

    useEffect(() => {
        ws.current = new WebSocket(LOGS_WS.replace('{id}', user.id))
        gettingData()

        return () => {
            ws.current.close()
        }
        // eslint-disable-next-line
    }, [])

    const gettingData = useCallback(() => {
        if (!ws.current) return

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data)
            setLogs([data.message, ...logs])

            if (data.action && data.action.delete && trades.response) {
                trades.setResponse(trades.response.filter((i) => i.id !== data.action.delete))
            }
        }
        // eslint-disable-next-line
    }, [])

    return (
        <div className="ml-0 card" style={{ height: 500, overflow: 'scroll' }}>
            <div className="card-content content">
                {logs.map((message, index) => (
                    <p key={index}>{message}</p>
                ))}
            </div>
        </div>
    )
}
