import React, {useContext, useEffect, useState} from 'react'
import {MainContext} from "../contexts/MainContext";
import {useLoad} from "../hooks/request";
import {OPEN_ORDERS} from "../urls";

export default React.memo(function MyOrders() {
    const {wsCallbacksRef, symbolValue} = useContext(MainContext)
    const initialOrders = useLoad({url: OPEN_ORDERS.replace('{symbol}', symbolValue)})
    const [takeProfitOrders, setTakeProfitOrders] = useState([]) // ["1", "123"] // orderId of ordersList

    const [orders, setOrders] = useState([
    {
        "orderId": "1",
        "orderPrice": "0.06125",
        "orderSize": "86.37",
        "symbol": "trxusdt",
        "type": "buy-limit",
        "orderStatus": 'canceled',
    },
    {
        "orderId": "2",
        "orderPrice": "0.0625",
        "orderSize": "80.43",
        "symbol": "trxusdt",
        "type": "buy-limit",
        "orderStatus": 'filled',
    },
    {
        "orderId": "3",
        "orderPrice": "0.06375",
        "orderSize": "89.15",
        "symbol": "trxusdt",
        "type": "buy-limit",
        "orderStatus": 'submitted',
    }
])

    useEffect(() => {
        wsCallbacksRef.current.setOrders = setOrders

        wsCallbacksRef.current.updateInitialOrders = () => {
            setOrders([])
            initialOrders.request()
        }
    }, [])

    useEffect(() => {
        if (initialOrders.response) {
            if (initialOrders.response.orders) setOrders(oldOrders => [...initialOrders.response.orders, ...oldOrders])
            if (initialOrders.response.takeProfitOrders) setTakeProfitOrders(oldIds => [initialOrders.response.takeProfitOrders, ...oldIds])
        }
    }, [initialOrders.response])

    return (
        <div style={{marginTop: 100}}>
            <p className="is-size-4">Orders:</p>

            {orders.map(i => (
                <div>
                    {i.orderPrice}
                </div>
            ))}
        </div>
    )
})
