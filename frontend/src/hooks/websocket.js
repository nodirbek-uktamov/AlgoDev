import { useCallback, useEffect, useRef, useState } from 'react'
import { parseGzip } from '../utils/websocket'


export function useWebsocket({ sub, url, exchangeServer = true, stopInterval = 100 }, dependencies) {
    const ws = useRef(null)
    const [data, setData] = useState({})

    useEffect(() => {
        ws.current = new WebSocket(url || 'wss://api.huobi.pro/ws')

        ws.current.onopen = () => {
            if (sub) ws.current.send(JSON.stringify({ sub }))
        }

        gettingData()

        return () => {
            ws.current.close()
            setData({})
        }
        // eslint-disable-next-line
    }, dependencies)

    const gettingData = useCallback(() => {
        if (!ws.current) return
        let lastUpdate = null
        let lastEvent = null

        ws.current.onmessage = (event) => {
            if (!exchangeServer) {
                setData(JSON.parse(event.data))
            } else if (new Date() - lastUpdate > stopInterval) {
                lastUpdate = new Date()

                parseGzip(lastEvent || event, (d) => {
                    if (d.ping) {
                        ws.current.send(JSON.stringify({ pong: d.ping }))
                        return
                    }

                    if (d.tick) {
                        setData(d.tick)
                    }
                })

                lastEvent = null
            } else {
                lastEvent = event
            }
        }
    }, [exchangeServer, stopInterval])

    return { data }
}
