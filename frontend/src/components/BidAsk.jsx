import React from 'react'
import { useWebsocket } from '../hooks/websocket'

export default function BidAsk({ setPrice, symbol }) {
    const { data } = useWebsocket({ sub: `market.${symbol}.bbo` }, [symbol])

    return (
        <div className="columns ml-0">
            <div onClick={() => setPrice(data.ask)} className="column is-narrow pointer">
                ask: <span className="has-text-danger"> {data.ask}</span>
            </div>

            <div onClick={() => setPrice(data.bid)} className="column is-narrow pointer">
                bid: <span className="has-text-success">{data.bid}</span>
            </div>
        </div>
    )
}
