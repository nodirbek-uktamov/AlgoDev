import React, {useContext, useEffect, useState} from 'react'
import {MainContext} from "../contexts/MainContext";
import {useLoad} from "../hooks/request";
import {OPEN_ORDERS} from "../urls";

export default React.memo(function MyOrders() {
    const {wsCallbacksRef, symbolValue} = useContext(MainContext)
    const initialOrders = useLoad({url: OPEN_ORDERS.replace('{symbol}', symbolValue)})
    const [takeProfitOrderIds, setTakeProfitOrderIds] = useState(["3"]) // ["1", "123"] // orderId of ordersList

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
        wsCallbacksRef.current.setTakeProfitOrderIds = setTakeProfitOrderIds

        wsCallbacksRef.current.updateInitialOrders = () => {
            setOrders([])
            initialOrders.request()
        }
    }, [])

    useEffect(() => {
        if (initialOrders.response) {
            if (initialOrders.response.orders) setOrders(oldOrders => [...initialOrders.response.orders, ...oldOrders])
            if (initialOrders.response.takeProfitOrders) setTakeProfitOrderIds(oldIds => [...initialOrders.response.takeProfitOrders, ...oldIds])
        }
    }, [initialOrders.response])

    const takeProfitOrders = orders.filter(i => takeProfitOrderIds.includes(String(i.orderId)) && i.orderStatus === 'submitted')
    const openOrders = orders.filter(i => i.orderStatus === 'submitted')
    const filledOrders = orders.filter(i => i.orderStatus === 'filled')
    const canceledOrders = orders.filter(i => i.orderStatus === 'canceled')

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
