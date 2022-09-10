import React, { useState, useContext, useEffect } from 'react'
import { FTXPositionsList } from './FTXPositionsList'
import { FTXOrdersList } from './FTXOrdersList'
import { Tabs } from '../common/Tabs/Tabs'
import { FTXTriggerOrdersList } from './FTXTriggerOrdersList'
import { FTXTWAPOrdersList } from './FTXTWAPOrdersList'
import { useLoad } from '../../hooks/request'
import { FTX_OPEN_ORDERS_LIST } from '../../urls'
import { MainContext } from '../../contexts/MainContext'
import { useMessage } from '../../hooks/message'

function FTXOrders({ orders, setOrders }) {
    const { wsCallbacksRef } = useContext(MainContext)

    const [tab, setTab] = useState(0)

    const tabs = [
        { title: 'Positions', render: () => <FTXPositionsList /> },
        { title: 'Orders', render: () => <FTXOrdersList orders={orders} /> },
        { title: 'Trigger orders', render: () => <FTXTriggerOrdersList /> },
        { title: 'Active TWAP orders', render: () => <FTXTWAPOrdersList /> },
    ]

    const initialOrders = useLoad({ url: FTX_OPEN_ORDERS_LIST })
    const [showMessage] = useMessage()

    useEffect(() => {
        wsCallbacksRef.current.setFTXOrdersList = setOrders
        wsCallbacksRef.current.showOrderMessage = showMessage

        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (initialOrders.response) setOrders(initialOrders.response)
    }, [initialOrders.response, setOrders])

    return (
        <Tabs className="mt-5" value={tab} onChange={setTab} tabs={tabs} />
    )
}

export default React.memo(FTXOrders)
