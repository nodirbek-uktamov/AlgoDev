import React, {useContext, useEffect, useState} from 'react';
import {Input} from "../common/Input";
import {MainContext} from "../../contexts/MainContext";

export function OrdersListTab() {
    const {wsCallbacksRef, symbol, symbolSettings} = useContext(MainContext)
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
                newOrders = [{...item, amount: item.amount * item.price}, ...newOrders]
                return newOrders
            })

            setOrders((oldOrders) => [...newOrders, ...oldOrders].slice(0, 30))
        }
    }

    function onChangeAmountLimit(event) {
        setOrders([])
        setAmountLimit(event.target.value)
        localStorage.setItem('amountLimit', event.target.value)
    }

    function RenderItem({item}) {
        const color = item.direction === 'sell' ? '#FA4D56' : '#00B464'

        return (
            <div className="columns p-0 m-0">
                <div style={{color: '#808080'}} className="column p-0">
                    {new Date(item.ts).toLocaleTimeString()}
                </div>

                <div style={{color}} className="column p-0">
                    {item.price.toFixed(symbolSettings.tpp || 0)}
                </div>

                <div className="column p-0" style={{color, textAlign: 'end'}}>
                    {parseFloat(item.amount).toFixed(symbolSettings.tap || 0)}
                </div>
            </div>
        )
    }

    const columns = [
        {
            width: '1%',
            title: "Date"
        },
        {
            width: '1%',
            title: `Price (${symbol.pair2})`
        },
        {
            width: '1%',
            title: `Value (${symbol.pair2})`
        },
    ]

    return <div style={{minWidth: '15.4rem'}}>
        <div className="mb-4">
            <Input
                label={`Amount from (${symbol.pair2})`}
                step="0.00000001"
                type="number"
                value={amountLimit}
                onChange={onChangeAmountLimit}/>
        </div>

        <tr className="table_head">
            {columns.map((column) => (
                <th
                    className="table_headerCell"
                    style={{width: column.width, textAlign: 'center', verticalAlign: 'bottom', fontWeight: 700}}
                    key={column.key}>
                    {column.title}
                </th>
            ))}
        </tr>

        <div className="p-3" style={{backgroundColor: orders.length > 0 ? '#141826' : null}}>
            {orders.map((item, index) => (
                <RenderItem key={index} item={item}/>
            ))}
        </div>
    </div>
}