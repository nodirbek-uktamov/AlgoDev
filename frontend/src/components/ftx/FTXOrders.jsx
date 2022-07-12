import React, { useState } from 'react'
import { FTXPositionsList } from './FTXPositionsList'
import { FTXOrdersList } from './FTXOrdersList'
import { Tabs } from '../common/Tabs/Tabs'
import { FTXTriggerOrdersList } from './FTXTriggerOrdersList'
import { FTXTWAPOrdersList } from './FTXTWAPOrdersList'

function FTXOrders() {
    const [tab, setTab] = useState(0)

    const tabs = [
        { title: 'Positions', render: () => <FTXPositionsList /> },
        { title: 'Orders', render: () => <FTXOrdersList /> },
        { title: 'Trigger orders', render: () => <FTXTriggerOrdersList /> },
        { title: 'Active TWAP orders', render: () => <FTXTWAPOrdersList /> },
    ]

    return (
        <Tabs className="mt-5" value={tab} onChange={setTab} tabs={tabs} />
    )
}

export default React.memo(FTXOrders)
