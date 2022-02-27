import React from 'react'
import TradingViewWidget from 'react-tradingview-widget'


export default React.memo(({ symbol }) => (
    <TradingViewWidget symbol={symbol} interval={1} />
))
