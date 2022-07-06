import React, { useState } from 'react'
import { FTXPositionsList } from './FTXPositionsList'
import { FTXOrdersList } from './FTXOrdersList'
import { Tabs } from '../common/Tabs/Tabs'

function FTXOrders() {
    const [tab, setTab] = useState(0)

    const tabs = [
        { title: 'Positions', render: () => <FTXPositionsList /> },
        { title: 'Orders', render: () => <FTXOrdersList /> },
    ]

    return (
        <Tabs className="mt-5" value={tab} onChange={setTab} tabs={tabs} />
    )
}

export default React.memo(FTXOrders)
