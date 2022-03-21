import React, { useState, useEffect } from 'react'
import cn from 'classnames'
import { useWebsocket } from '../hooks/websocket'

export default function Orders({ symbol }) {
    const { data } = useWebsocket({ sub: `market.${symbol}.trade.detail` }, [symbol])
    const [sales, setSales] = useState([])
    const [purchases, setPurchases] = useState([])

    useEffect(() => {
        if (data && data.data) {
            data.data.map((item) => {
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

    return (
        <div className="columns m-0 mt-2">
            <div className="column has-background-success-light">
                <p className="is-size-5 mb-2">Purchases</p>

                {purchases.map((item) => (
                    <RenderItem key={item.id} className="has-text-success" item={item} />
                ))}
            </div>

            <div className="column has-background-danger-light">
                <p className="is-size-5 mb-2">Sales</p>

                {sales.map((item) => (
                    <RenderItem key={item.id} className="has-text-danger" item={item} />
                ))}
            </div>
        </div>
    )
}
