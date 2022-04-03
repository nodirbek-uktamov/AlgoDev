import React, { useState, useEffect } from 'react'
import cn from 'classnames'

export default function Orders({ symbol, wsCallbacksRef }) {
    const [orders, setOrders] = useState([])
    const [amountLimit, setAmountLimit] = useState(localStorage.getItem('amountLimit') || '1')

    const onChangeData = (data) => {
        if (data && data.data) {
            data.data.map((item) => {
                if (item.amount < +amountLimit) return

                setOrders((oldPurchases) => [item, ...oldPurchases].slice(0, 30))
            })
        }
    }

    useEffect(() => {
        wsCallbacksRef.current = { ...wsCallbacksRef.current, setOrdersData: onChangeData }
        // eslint-disable-next-line
    }, [amountLimit])

    useEffect(() => {
        setOrders([])
    }, [symbol])

    function RenderItem({ item }) {
        return (
            <div className="columns m-0 p-0" style={{ color: item.direction === 'sell' ? '#FA4D56' : '#00B464' }}>
                <p style={{ width: 90 }} className="column is-narrow m-0 p-0">{item.price}</p>
                <p className="column m-0 p-0">{parseFloat(item.amount).toFixed(6)}</p>
            </div>
        )
    }

    function onChangeAmountLimit(event) {
        setOrders([])
        setAmountLimit(event.target.value)
        localStorage.setItem('amountLimit', event.target.value)
    }

    return (
        <div>
            <p className="mt-2">Amount from</p>

            <input
                className="input mt-2"
                style={{ width: 200 }}
                step="0.00000001"
                type="number"
                value={amountLimit}
                onChange={onChangeAmountLimit} />

            <div className="p-3 mt-2" style={{ backgroundColor: orders.length > 0 ? '#141826' : null }}>
                {orders.map((item, index) => (
                    <RenderItem key={index} item={item} />
                ))}
            </div>
        </div>
    )
}
