import React, { useRef } from 'react'
import TradingViewWidget from 'react-tradingview-widget'


export default React.memo(({ symbol }) => {
    const ref = useRef(null)

    return (
        <TradingViewWidget ref={ref} symbol={symbol} interval={1} />
    )
})
