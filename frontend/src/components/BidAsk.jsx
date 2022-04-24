import React, { useState, useEffect } from 'react'

function BidAsk({ wsCallbacksRef, symbol }) {
    const [rawData, setRawData] = useState({})
    const data = rawData[symbol] || {}

    useEffect(() => {
        wsCallbacksRef.current.setBidAskData = setRawData
        // eslint-disable-next-line
    }, [])

    return (
        <div className="columns ml-0">
            <div className="column is-narrow pointer">
                ask: <span className="has-text-danger"> {data.ask || '—'}</span>
            </div>

            <div className="column is-narrow pointer">
                bid: <span className="has-text-success">{data.bid || '—'}</span>
            </div>
        </div>
    )
}

export default React.memo(BidAsk)
