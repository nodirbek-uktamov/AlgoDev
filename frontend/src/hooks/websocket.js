import { useCallback, useEffect, useRef, useState } from 'react'
import { parseGzip } from '../utils/websocket'


export function useRequest({ sub, dependencies = [] }) {
    const ws = useRef(null)
    const [data, setData] = useState({})

    useEffect(() => {
        ws.current = new WebSocket('wss://api.huobi.pro/ws')
        ws.current.onopen = () => ws.current.send(JSON.stringify({ sub }))

        gettingData()
        return () => ws.current.close()
        // eslint-disable-next-line
    }, dependencies)

    const gettingData = useCallback(() => {
        if (!ws.current) return

        ws.current.onmessage = (event) => {
            parseGzip(event, (d) => {
                if (d.ping) {
                    ws.current.send(JSON.stringify({ pong: d.ping }))
                    return
                }

                if (d.tick) {
                    setData(d.tick)
                }
            })
        }
    }, [])

    return { data }
}
