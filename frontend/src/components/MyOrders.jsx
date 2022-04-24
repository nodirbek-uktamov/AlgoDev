import React, {useContext, useEffect, useState} from 'react'
import {MainContext} from "../contexts/MainContext";
import {useLoad} from "../hooks/request";
import {OPEN_ORDERS} from "../urls";

export default React.memo(function MyOrders() {
    const initialOrders = useLoad({url: OPEN_ORDERS})

    const [openOrders, setOpenOrders] = useState([
    {
        "orderPrice": "0.06125",
        "orderSize": "86.37",
        "symbol": "trxusdt",
        "type": "buy-limit"
    },
    {
        "orderPrice": "0.0625",
        "orderSize": "80.43",
        "symbol": "trxusdt",
        "type": "buy-limit"
    },
    {
        "orderPrice": "0.06375",
        "orderSize": "89.15",
        "symbol": "trxusdt",
        "type": "buy-limit"
    }
])
    const {wsCallbacksRef} = useContext(MainContext)

    useEffect(() => {
        wsCallbacksRef.current.setOpenOrders = setOpenOrders
    }, [])

    useEffect(() => {
        if (initialOrders.response) setOpenOrders(oldOrders => [...initialOrders.response, ...oldOrders])
    }, [initialOrders.response])

    console.log(openOrders)

    return (
        <div style={{marginTop: 100}}>
            <p className="is-size-4">Orders:</p>

            {openOrders.map(i => (
                <div>
                    {i.orderPrice}
                </div>
            ))}
        </div>
    )
})
