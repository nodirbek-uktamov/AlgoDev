import React, { useCallback, useContext, useEffect } from 'react'
import { Table } from '../../common/Table'
import { SIDE_TEXT_STYLE } from '../../huobi/HuobiOrdersList/HuobiOrdersList'
import { MainContext } from '../../../contexts/MainContext'
import { useLoad } from '../../../hooks/request'
import { FTX_ACTIVE_TWAP_ORDERS_LIST } from '../../../urls'
import { secondsToHms } from '../../../utils/date'

const renderColumns = (symbol, handleCancelOrder) => [
    {
        title: 'Symbol',
        key: 'symbol',
        hasSorting: true,
        width: '15%',
        render: (rowData) => <span className="is-uppercase">{rowData.market}</span>,
    },
    {
        title: 'Time',
        key: 'type',
        hasSorting: true,
        width: '15%',
        render: (rowData) => <span>{new Date(rowData.createdAt).toLocaleString()}</span>,
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
        title: 'Elapsed / Total Time',
        key: 'elapsed/totalTime',
        hasSorting: true,
        width: '10%',
        render: (rowData) => (
            <span>
                {secondsToHms((new Date() - new Date(rowData.createdAt)) / 1000)}  /  {secondsToHms(rowData.durationSeconds)}
            </span>
        ),
    },
    {
        title: 'Filled size',
        key: 'filledSize',
        hasSorting: true,
        width: '15%',
        render: (rowData) => <span>{Number(rowData.filledSize).toFixed(symbol.tap || 0)} / {Number(rowData.size).toFixed(symbol.tap || 0)}</span>,
    },
    {
        title: 'Avg fill price',
        key: 'orderPrice',
        hasSorting: true,
        width: '10%',
        render: (rowData) => <span>{rowData.avgFillPrice ? Number(rowData.avgFillPrice).toFixed(symbol.tpp || 2) : 'N/A'}</span>,
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

function FTXTWAPOrdersList() {
    const { symbol } = useContext(MainContext)
    const twapOrders = useLoad({ url: FTX_ACTIVE_TWAP_ORDERS_LIST.replace('{symbol}', symbol.value) })

    useEffect(() => {
        const interval = setInterval(() => {
            twapOrders.request()
        }, 5000)
        return () => clearInterval(interval)
    }, [twapOrders])

    const handleCancelOrder = useCallback(async (item) => {

        // eslint-disable-next-line
    }, [])

    return (
        <div className="orders-list_container">
            <Table tableData={twapOrders.response || []} columns={renderColumns(symbol, handleCancelOrder)} />
        </div>
    )
}

export default React.memo(FTXTWAPOrdersList)
