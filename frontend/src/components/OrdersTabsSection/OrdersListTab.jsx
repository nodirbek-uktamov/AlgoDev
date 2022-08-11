import React, { useContext, useEffect, useState } from 'react'
import { Input } from '../common/Input'
import { MainContext } from '../../contexts/MainContext'
import notificationSound from '../../static/nofitication.mp3'

export function OrdersListTab() {
    const { wsCallbacksRef, symbol } = useContext(MainContext)
    const [orders, setOrders] = useState([])
    const [amountLimit, setAmountLimit] = useState(localStorage.getItem('amountLimit') || '0')

    useEffect(() => {
        wsCallbacksRef.current.setOrdersData = onChangeData
        // eslint-disable-next-line
    }, [amountLimit])

    useEffect(() => {
        setOrders([])
    }, [symbol])

    function onChangeData(data) {
        if (data && data.data) {
            let newOrders = []

            data.data.map((item) => {
                if (item.amount * item.price < +amountLimit) return []
                newOrders = [item, ...newOrders]
                return newOrders
            })

            if (newOrders.length > 0 && +amountLimit !== 0) {
                const audio = new Audio(notificationSound)
                audio.play()
            }

            setOrders((oldOrders) => [...newOrders, ...oldOrders].slice(0, 30))
        }
    }

    function onChangeAmountLimit(event) {
        setOrders([])
        setAmountLimit(event.target.value)
        localStorage.setItem('amountLimit', event.target.value)
    }

    function RenderItem({ item }) {
        const color = item.direction === 'sell' ? '#FF0000' : '#6afd0a'

        return (
            <div className="columns p-0 m-0">
                <div style={{ color: '#808080' }} className="column p-0">
                    {new Date(item.ts).toLocaleTimeString('it-IT')}
                </div>

                <div style={{ color }} className="column p-0">
                    {item.price.toFixed(symbol.tpp || 0)}
                </div>

                <div className="column p-0" style={{ color, textAlign: 'end' }}>
                    {parseFloat(item.amount).toFixed(symbol.tap || 0)}
                </div>
            </div>
        )
    }

    const columns = [
        {
            width: '1%',
            title: 'Date',
        },
        {
            width: '1%',
            title: `Price (${symbol.pair2})`,
        },
        {
            width: '1%',
            title: `Value (${symbol.pair1})`,
        },
    ]

    return (
        <div style={{ minWidth: '15.4rem' }}>
            <div className="mb-4">
                <Input
                    label={`Amount from (${symbol.pair2})`}
                    step="0.00000001"
                    type="number"
                    value={amountLimit}
                    onChange={onChangeAmountLimit} />
            </div>

            <table>
                <tbody>
                    <tr className="table_head">
                        {columns.map((column) => (
                            <th
                                className="table_headerCell"
                                style={{ width: column.width, textAlign: 'center', verticalAlign: 'bottom', fontWeight: 700 }}
                                key={column.key}>
                                {column.title}
                            </th>
                        ))}
                    </tr>
                </tbody>
            </table>

            <div className="p-3" style={{ backgroundColor: orders.length > 0 ? '#000' : null }}>
                {orders.map((item) => (
                    <div className={item.direction === 'sell' ? 'new-trade-ask' : 'new-trade-bid'} key={item.tradeId}>
                        <RenderItem item={item} />
                    </div>
                ))}
            </div>
        </div>
    )
}
