import React from 'react'
import Table from './common/Table'
import Button from './common/Button'
import { usePutRequest } from '../hooks/request'
import { CANCEL_TRADES, TRADE_DETAIL } from '../urls'

export default function TradesList({ trades, onCancel }) {
    const cancel = usePutRequest()

    async function cancelTrade(id) {
        const { success } = await cancel.request({ url: TRADE_DETAIL.replace('{id}', id) })

        if (success) {
            onCancel()
        }
    }

    async function cancelAll() {
        const { success } = await cancel.request({ url: CANCEL_TRADES })

        if (success) {
            onCancel()
        }
    }

    return (
        <div>
            {trades.length > 0 && (
                <div style={{ width: 200, float: 'right' }}>
                    <Button text="Cancel all orders" className="is-danger my-4" onClick={cancelAll} />
                </div>
            )}

            <Table pageSize={10000} items={trades} columns={{
                id: 'ID',
                symbol: 'Symbol',
                quantity: 'Quantity',
                side: 'Side',
                interval: 'Interval (seconds)',
                actions: '',
            }} renderItem={(item) => (
                <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.symbol.toUpperCase()}</td>
                    <td>{item.quantity}</td>
                    <td>{item.tradeType}</td>
                    <td>{item.loop ? item.timeInterval : 'not loop'}</td>

                    <td className="is-narrow">
                        <Button text="Cancel" className="is-danger" onClick={() => cancelTrade(item.id)} />
                    </td>
                </tr>
            )} />
        </div>
    )
}
