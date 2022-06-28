import React, { useContext, useEffect, useState } from 'react'
import './FTXOrdersList.scss'
import { Table } from '../../common/Table'
import { SIDE_TEXT_STYLE } from '../../huobi/HuobiOrdersList/HuobiOrdersList'
import { MainContext } from '../../../contexts/MainContext'
import { useLoad } from '../../../hooks/request'
import { FTX_OPEN_ORDERS_LIST } from '../../../urls'

const renderColumns = (symbol) => [
    {
        title: 'Side',
        key: 'side',
        hasSorting: true,
        width: '0%',
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
        width: '10%',
        render: (rowData) => <span>{Number(rowData.orderSize).toFixed(symbol.tap || 0)}</span>,
    },
    {
        title: 'Price',
        key: 'orderPrice',
        hasSorting: true,
        width: '10%',
        render: (rowData) => <span>{Number(rowData.orderPrice).toFixed(symbol.tpp || 2)}</span>,
    },
    {
        title: 'Symbol',
        key: 'symbol',
        hasSorting: true,
        width: '10%',
        render: (rowData) => <span className="is-uppercase">{rowData.symbol}</span>,
    },
    {
        title: 'Filled',
        key: 'filled',
        hasSorting: true,
        width: '10%',
        render: (rowData) => (
            <span className="is-uppercase">
                {Number(rowData.filledSize).toFixed(symbol.tap || 0)}
                &nbsp; / &nbsp;
                {Number(rowData.size).toFixed(symbol.tap || 0)}
            </span>
        ),
    },
]

function FTXOrdersList() {
    const { symbol, wsCallbacksRef } = useContext(MainContext)
    const [items, setItems] = useState([])
    const initialOrders = useLoad({ url: FTX_OPEN_ORDERS_LIST })

    useEffect(() => {
        wsCallbacksRef.current.setFTXOrdersList = setItems

        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (initialOrders.response) setItems(initialOrders.response)
    }, [initialOrders.response])

    return (
        <div className="orders-list_container">
            <Table tableData={items} columns={renderColumns(symbol)} />
        </div>
    )
}

export default React.memo(FTXOrdersList)
