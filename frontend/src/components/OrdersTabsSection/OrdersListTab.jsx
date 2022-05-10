import React, {useContext, useEffect, useState} from 'react';
import {Input} from "../common/Input";
import {MainContext} from "../../contexts/MainContext";

export function OrdersListTab() {
    const {wsCallbacksRef, symbol, symbolSettings} = useContext(MainContext)
    const [orders, setOrders] = useState([])
    const [amountLimit, setAmountLimit] = useState(localStorage.getItem('amountLimit') || '1')

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
                if (item.amount < +amountLimit) return []
                newOrders = [item, ...newOrders]
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

    function RenderItem({ item }) {
        return (
            <div className="columns m-0 p-0" style={{ color: item.direction === 'sell' ? '#FA4D56' : '#00B464' }}>
                <p style={{ width: 100 }} className="column is-narrow m-0 p-0">
                    {item.price.toFixed(symbolSettings.tpp || 0)}
                </p>

                <p className="column m-0 p-0">{parseFloat(item.amount).toFixed(symbolSettings.tap || 0)}</p>
            </div>
        )
    }

    return <>
        <Input
            label="Amount from"
            labelPosition="row"
            step="0.00000001"
            type="number"
            value={amountLimit}
            onChange={onChangeAmountLimit}
        />

        <div className="p-3 mt-2" style={{ backgroundColor: orders.length > 0 ? '#141826' : null }}>
            {orders.map((item, index) => (
                <RenderItem key={index} item={item} />
            ))}
        </div>
    </>
}