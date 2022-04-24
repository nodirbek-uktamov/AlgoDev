import React, {useContext, useEffect, useState} from 'react'
import {MainContext} from "../contexts/MainContext";

export default React.memo(function MyOrders() {
    const [openOrders, setOpenOrders] = useState([
    {
        "orderSource": "spot-api",
        "accountId": 45712554,
        "orderPrice": "0.06125",
        "orderSize": "86.37",
        "orderCreateTime": 1650785441095,
        "symbol": "trxusdt",
        "eventType": "creation",
        "clientOrderId": "1650785441727",
        "orderStatus": "submitted",
        "orderId": 525989068023121,
        "type": "buy-limit"
    },
    {
        "orderSource": "spot-api",
        "accountId": 45712554,
        "orderPrice": "0.0625",
        "orderSize": "80.43",
        "orderCreateTime": 1650785441431,
        "symbol": "trxusdt",
        "eventType": "creation",
        "clientOrderId": "1650785442061",
        "orderStatus": "submitted",
        "orderId": 525989119237707,
        "type": "buy-limit"
    },
    {
        "orderSource": "spot-api",
        "accountId": 45712554,
        "orderPrice": "0.06375",
        "orderSize": "89.15",
        "orderCreateTime": 1650785441767,
        "symbol": "trxusdt",
        "eventType": "creation",
        "clientOrderId": "1650785442397",
        "orderStatus": "submitted",
        "orderId": 525989127856030,
        "type": "buy-limit"
    }
])
    const {wsCallbacksRef} = useContext(MainContext)

    useEffect(() => {
        wsCallbacksRef.current.setOpenOrders = setOpenOrders
    }, [])

    console.log(openOrders)

    return (
        <div>

        </div>
    )
})
