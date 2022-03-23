import React, { useState, useEffect } from 'react'
import cn from 'classnames'

export default function Orders({ symbol, data }) {
    const [sales, setSales] = useState([])
    const [purchases, setPurchases] = useState([])
    const [amountLimit, setAmountLimit] = useState(localStorage.getItem('amountLimit') || '1')

    useEffect(() => {
        if (data && data.data) {
            data.data.map((item) => {
                if (item.amount < +amountLimit) return

                if (item.direction === 'sell') {
                    setSales([item, ...sales].slice(0, 10))
                }

                if (item.direction === 'buy') {
                    setPurchases([item, ...purchases].slice(0, 10))
                }
            })
        }

        // eslint-disable-next-line
    }, [data])

    useEffect(() => {
        setSales([])
        setPurchases([])
    }, [symbol])

    function RenderItem({ item, className }) {
        return (
            <div className={cn('columns m-0 p-0', className)}>
                <p style={{ width: 90 }} className="column is-narrow m-0 p-0">{item.price}</p>
                <p className="column m-0 p-0">{parseFloat(item.amount).toFixed(6)}</p>
            </div>
        )
    }

    function onChangeAmountLimit(event) {
        setPurchases([])
        setSales([])
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

            <div className="columns m-0 mt-2">
                <div className="column has-background-success-light">
                    <p className="is-size-5 mb-2">Purchases</p>

                    {purchases.map((item, index) => (
                        <RenderItem key={index} className="has-text-success" item={item} />
                    ))}
                </div>

                <div className="column has-background-danger-light">
                    <p className="is-size-5 mb-2">Sales</p>

                    {sales.map((item, index) => (
                        <RenderItem key={index} className="has-text-danger" item={item} />
                    ))}
                </div>
            </div>
        </div>
    )
}
