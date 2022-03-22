import React, { useState, useEffect } from 'react'
import { useWebsocket } from '../hooks/websocket'
import { LOGS_WS } from '../urls'

export default function Logs({ symbol, trades }) {
    const user = JSON.parse(localStorage.getItem('user'))
    const requestParams = { url: LOGS_WS.replace('{id}', user.id), stopInterval: 0, exchangeServer: false }
    const { data } = useWebsocket(requestParams, [symbol])
    const [logs, setLogs] = useState([])

    useEffect(() => {
        setLogs([data.message, ...logs])

        if (data.action && data.action.delete && trades.response) {
            trades.setResponse(trades.response.filter((i) => i.id !== data.action.delete))
        }
        // eslint-disable-next-line
    }, [data])

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
