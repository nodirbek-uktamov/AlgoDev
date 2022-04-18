import React, { useState, Fragment } from 'react'
import ReactSelect from './common/ReactSelect'
import OrdersDepth from './OrdersDepth'
import Orders from './Orders'
import { WS_TYPES } from '../utils/websocket'

export default function OrdersTabs({ botPrices, ws, symbol, symbolSettings, wsCallbacksRef, setDepthType, depthType }) {
    const [ordersTab, setOrdersTab] = useState('list')
    const { tpp } = symbolSettings

    const depthSteps = [
        { label: (0.1 ** tpp).toFixed(tpp), value: 'step0' },
        { label: (0.1 ** (tpp - 1)).toFixed(tpp - 1 < 0 ? 0 : tpp - 1), value: 'step1' },
        { label: (0.1 ** (tpp - 2)).toFixed(tpp - 2 < 0 ? 0 : tpp - 2), value: 'step2' },
        { label: (0.1 ** (tpp - 3)).toFixed(tpp - 3 < 0 ? 0 : tpp - 3), value: 'step3' },
        { label: (0.1 ** (tpp - 3) * 5).toFixed(tpp - 3 < 0 ? 0 : tpp - 3), value: 'step4' },
        { label: (0.1 ** (tpp - 4)).toFixed(tpp - 4 < 0 ? 0 : tpp - 4), value: 'step5' },
    ]

    function onChangeDepthType({ value }) {
        ws.current.send(JSON.stringify({ unsub: WS_TYPES.book.replace('{symbol}', symbol).replace('{type}', depthType) }))
        setDepthType(value)
        ws.current.send(JSON.stringify({ sub: WS_TYPES.book.replace('{symbol}', symbol).replace('{type}', value) }))
    }

    return (
        <div>
            <div className="tabs">
                <ul>
                    <li onClick={() => setOrdersTab('list')} className={ordersTab === 'list' ? 'is-active' : null}>
                        <p>Trade list</p>
                    </li>

                    <li onClick={() => setOrdersTab('depth')} className={ordersTab === 'depth' ? 'is-active' : null}>
                        <p>Depth</p>
                    </li>
                </ul>
            </div>

            {ordersTab === 'list' && (
                <Orders
                    wsCallbacksRef={wsCallbacksRef}
                    symbolSettings={symbolSettings}
                    symbol={symbol} />
            )}

            {ordersTab === 'depth' && (
                <Fragment>
                    <ReactSelect options={depthSteps} onChange={onChangeDepthType} defaultValue={depthSteps[0].value} />
                    <OrdersDepth symbolSettings={symbolSettings} botPrices={botPrices} wsCallbacksRef={wsCallbacksRef} />
                </Fragment>
            )}
        </div>
    )
}
