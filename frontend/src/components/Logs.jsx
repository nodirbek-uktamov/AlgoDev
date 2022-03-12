import React, { useState, useEffect } from 'react'
import { useWebsocket } from '../hooks/websocket'
import { LOGS_WS } from '../urls'

export default function Logs({ symbol }) {
    const { data } = useWebsocket({ url: LOGS_WS.replace('{id}', 2), exchangeServer: false }, [symbol])
    const [logs, setLogs] = useState([])

    useEffect(() => {
        setLogs([...logs, data.message])
        // eslint-disable-next-line
    }, [data])

    return (
        <div className="ml-0">
            {logs.map((message) => (
                <p>{message}</p>
            ))}
        </div>
    )
}
