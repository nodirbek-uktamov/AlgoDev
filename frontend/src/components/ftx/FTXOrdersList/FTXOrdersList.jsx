import React, { useCallback, useContext, useEffect, useState } from 'react'
import './FTXOrdersList.scss'
import { Table } from '../../common/Table'
import { SIDE_TEXT_STYLE } from '../../huobi/HuobiOrdersList/HuobiOrdersList'
import { MainContext } from '../../../contexts/MainContext'
import { useLoad, usePostRequest } from '../../../hooks/request'
import { FTX_CANCEL_ORDER, FTX_OPEN_ORDERS_LIST } from '../../../urls'
import { Button } from '../../common/Button'
import { useMessage } from '../../../hooks/message'

const renderColumns = (symbol, handleCancelOrder) => [
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
        width: '20%',
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
    {
        title: '',
        key: 'actions',
        hasSorting: true,
        width: '10%',
        render: (rowData) => (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '1.1rem' }}>
                <Button scale={false} size="S"
                    text="Cancel" color="danger"
                    onClick={() => handleCancelOrder(rowData)} />
            </div>
        ),
    },
]

function FTXOrdersList() {
    const { symbol, wsCallbacksRef } = useContext(MainContext)
    const [items, setItems] = useState([])
    const initialOrders = useLoad({ url: FTX_OPEN_ORDERS_LIST })
    const cancelOrder = usePostRequest()
    const [showMessage] = useMessage()

    useEffect(() => {
        wsCallbacksRef.current.setFTXOrdersList = setItems

        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (initialOrders.response) setItems(initialOrders.response)
    }, [initialOrders.response])

    const handleCancelOrder = useCallback(async (item) => {
        const { response } = await cancelOrder.request({ url: FTX_CANCEL_ORDER.replace('{id}', item.id) })

        if (response && response.message) {
            showMessage(response.message, !response.success ? 'is-danger' : 'is-success')
        }

        // eslint-disable-next-line
    }, [])

    return (
        <div className="orders-list_container">
            <Table tableData={items} columns={renderColumns(symbol, handleCancelOrder)} />
        </div>
    )
}

export default React.memo(FTXOrdersList)
