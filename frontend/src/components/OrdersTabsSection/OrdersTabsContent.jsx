import React, {useState} from 'react';
import {OrdersListTab} from "./OrdersListTab";
import {DepthTab} from "./DepthTab";

const tabs = [
    {
        title: 'Trade list',
        render: () => <OrdersListTab/>,
    },
    {
        title: 'Depth',
        render: () => <DepthTab/>,
    },
];

export function OrdersTabsContent() {
    const [tab, setTab] = useState(1)

    return <DepthTab/>
}