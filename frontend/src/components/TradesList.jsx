import React, { useCallback } from 'react'
import Table from './common/Table'
import Button from './common/Button'
import { usePutRequest } from '../hooks/request'
import { TRADE_DETAIL } from '../urls'


function TradesList({ trades, onCancel, tpp }) {
    const cancel = usePutRequest()

    const cancelTrade = useCallback(async (id) => {
        const { success } = await cancel.request({ url: TRADE_DETAIL.replace('{id}', id) })

        if (success) {
            onCancel()
        }
        // eslint-disable-next-line
    }, [])

    const renderItem = useCallback((item) => (
        <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.symbol.toUpperCase()}</td>
            <td className="is-narrow">{Number(item.filledAmount).toFixed(tpp)} / {Number(item.quantity)}</td>
            <td>{item.tradeType}</td>
            <td>{item.loop ? item.timeInterval : 'not loop'}</td>

            <td className="is-narrow">
                <Button text="Cancel" className="is-danger" onClick={() => cancelTrade(item.id)} />
            </td>
        </tr>
        // eslint-disable-next-line
    ), [tpp])

    return (
        <div>
            <Table pageSize={10000} items={trades} columns={{
                id: 'ID',
                symbol: 'Symbol',
                quantity: 'Quantity',
                side: 'Side',
                interval: 'Interval (seconds)',
                actions: '',
            }} renderItem={renderItem} />
        </div>
    )
}

export default React.memo(TradesList)
