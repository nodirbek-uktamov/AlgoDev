import React, { useCallback, useContext } from 'react'
import './FTXOrdersList.scss'
import { Table } from '../../common/Table'
import { SIDE_TEXT_STYLE } from '../../huobi/HuobiOrdersList/HuobiOrdersList'
import { MainContext } from '../../../contexts/MainContext'
import { usePostRequest } from '../../../hooks/request'
import { FTX_CANCEL_ORDER } from '../../../urls'
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
        key: 'close',
        renderHeaderCell: (column) => (
            <div className="is-flex is-justify-content-center">
                <Button scale={false} size="S" color="danger" text="Cancel all" onClick={() => console.log('cancel all')} />
            </div>
        ),
        hasSorting: false,
        render: (rowData) => (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '1.1rem' }}>
                <Button scale={false} size="S"
                    text="Cancel" color="danger"
                    onClick={() => handleCancelOrder(rowData)} />
            </div>
        ),
    },
]

function FTXOrdersList({ orders }) {
    const { symbol } = useContext(MainContext)
    const cancelOrder = usePostRequest()
    const [showMessage] = useMessage()

    const handleCancelOrder = useCallback(async (item) => {
        const { response } = await cancelOrder.request({ url: FTX_CANCEL_ORDER.replace('{id}', item.id) })

        if (response && response.message) {
            showMessage(response.message, !response.success ? 'is-danger' : 'is-success')
        }

        // eslint-disable-next-line
    }, [])

    return (
        <div className="orders-list_container">
            <Table tableData={orders} columns={renderColumns(symbol, handleCancelOrder)} />
        </div>
    )
}

export default React.memo(FTXOrdersList)
