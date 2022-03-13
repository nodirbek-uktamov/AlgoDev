import React, { useState, useEffect } from 'react'
import { useWebsocket } from '../hooks/websocket'
import { LOGS_WS } from '../urls'

export default function Logs({ symbol }) {
    const user = JSON.parse(localStorage.getItem('user'))
    const { data } = useWebsocket({ url: LOGS_WS.replace('{id}', user.id), exchangeServer: false }, [symbol])
    const [logs, setLogs] = useState([])

    useEffect(() => {
        setLogs([data.message, ...logs])
        // eslint-disable-next-line
    }, [data])

    return (
        <div className="ml-0 card" style={{ height: 500, overflow: 'scroll' }}>
            <div className="card-content content">
                {logs.map((message) => (
                    <p>{message}</p>
                ))}
            </div>
        </div>
    )
}
