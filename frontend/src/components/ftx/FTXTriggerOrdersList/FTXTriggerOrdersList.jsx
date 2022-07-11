import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Table } from '../../common/Table'
import { SIDE_TEXT_STYLE } from '../../huobi/HuobiOrdersList/HuobiOrdersList'
import { MainContext } from '../../../contexts/MainContext'
import { useLoad } from '../../../hooks/request'
import { FTX_OPEN_TRIGGER_ORDERS_LIST } from '../../../urls'
import { Button } from '../../common/Button'

const renderColumns = (symbol, handleCancelOrder) => [
    {
        title: 'Type',
        key: 'type',
        hasSorting: true,
        width: '15%',
        render: (rowData) => <span>{rowData.type} {rowData.orderType}</span>,
    },
    {
        title: 'Side',
        key: 'side',
        hasSorting: true,
        width: '5%',
        render: (rowData) => (
            <span className={`${SIDE_TEXT_STYLE[rowData.side]} is-capitalized`}>
                {rowData.side}
            </span>
        ),
    },
    {
        title: 'Quantity',
        key: 'orderSize',
        hasSorting: true,
        width: '15%',
        render: (rowData) => <span>{Number(rowData.size).toFixed(symbol.tap || 0)}</span>,
    },
    {
        title: 'Limit price',
        key: 'orderPrice',
        hasSorting: true,
        width: '10%',
        render: (rowData) => <span>{rowData.orderPrice ? Number(rowData.orderPrice).toFixed(symbol.tpp || 2) : 'N/A'}</span>,
    }, {
        title: 'Trigger price',
        key: 'orderPrice',
        hasSorting: true,
        width: '10%',
        render: (rowData) => <span>{rowData.triggerPrice ? Number(rowData.triggerPrice).toFixed(symbol.tpp || 2) : 'N/A'}</span>,
    },
    {
        title: 'Symbol',
        key: 'symbol',
        hasSorting: true,
        width: '15%',
        render: (rowData) => <span className="is-uppercase">{rowData.market}</span>,
    },
    // {
    //     title: 'Filled',
    //     key: 'filled',
    //     hasSorting: true,
    //     width: '10%',
    //     render: (rowData) => (
    //         <span className="is-uppercase">
    //             {Number(rowData.filledSize).toFixed(symbol.tap || 0)}
    //             &nbsp; / &nbsp;
    //             {Number(rowData.size).toFixed(symbol.tap || 0)}
    //         </span>
    //     ),
    // },
    // {
    //     title: '',
    //     key: 'actions',
    //     hasSorting: true,
    //     width: '20%',
    //     render: (rowData) => (
    //         <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '1.1rem' }}>
    //             <Button scale={false} size="S"
    //                 text="Cancel" color="danger"
    //                 onClick={() => handleCancelOrder(rowData)} />
    //         </div>
    //     ),
    // },
]

function FTXTriggerOrdersList() {
    const { symbol, wsCallbacksRef } = useContext(MainContext)
    const triggerOrders = useLoad({ url: FTX_OPEN_TRIGGER_ORDERS_LIST.replace('{symbol}', symbol.value) })

    useEffect(() => {
        const interval = setInterval(() => {
            triggerOrders.request()
        }, 20000)
        return () => clearInterval(interval)
    }, [triggerOrders])

    const handleCancelOrder = useCallback(async (item) => {

        // eslint-disable-next-line
    }, [])

    return (
        <div className="orders-list_container">
            <Table tableData={triggerOrders.response || []} columns={renderColumns(symbol, handleCancelOrder)} />
        </div>
    )
}

export default React.memo(FTXTriggerOrdersList)
