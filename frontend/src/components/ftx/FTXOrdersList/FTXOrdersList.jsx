import React, { useEffect } from 'react'
import './FTXOrdersList.scss'
import { Table } from '../../common/Table'
import { FTX_POSITIONS_LIST } from '../../../urls'
import { useLoad } from '../../../hooks/request'

const renderColumns = () => [
    {
        title: 'Symbol',
        key: 'symbol',
        hasSorting: true,
        width: '5rem',
        render: (rowData) => <span>{rowData.future}</span>,
    },
    {
        title: 'Side',
        key: 'side',
        hasSorting: true,
        width: '0',
        render: (rowData) => (
            <span style={{ color: rowData.side === 'buy' ? '#12b247' : '#E61739' }}>
                {rowData.side}
            </span>
        ),
    },
    {
        title: 'Position size',
        key: 'size',
        hasSorting: true,
        width: '6rem',
        render: (rowData) => <span>{rowData.size}</span>,
    },
    {
        title: 'Notional size',
        key: 'notional_size',
        hasSorting: true,
        width: '6rem',
        render: (rowData) => <span>{Math.abs(rowData.cost)} $</span>,
    },
    {
        title: 'Est. liquidation price',
        key: 'estimated_liquidation_price',
        hasSorting: true,
        width: '8rem',
        render: (rowData) => <span>{Number(rowData.estimatedLiquidationPrice).toFixed(1)}</span>,
    },
    {
        title: 'Mark price',
        key: 'orderStatus',
        hasSorting: true,
        width: '5rem',
        render: (rowData) => <span>{rowData.entryPrice}</span>,
    },
    {
        title: 'PNL',
        key: 'pnl',
        hasSorting: true,
        width: '5rem',
        render: (rowData) => (
            <span style={{ color: rowData.recentPnl < 0 ? '#E61739' : '#12b247' }}>
                {rowData.recentPnl}
            </span>
        ),
    },
    {
        title: 'Avg open price',
        key: 'avg_open_price',
        hasSorting: true,
        width: '5rem',
        render: (rowData) => <span>{rowData.recentAverageOpenPrice}</span>,
    },
    {
        title: 'Break-even price',
        key: 'recent_break_even_price',
        hasSorting: true,
        width: '5rem',
        render: (rowData) => <span>{rowData.recentBreakEvenPrice}</span>,
    },
]

function FTXOrdersList() {
    const positions = useLoad({ url: FTX_POSITIONS_LIST })

    useEffect(() => {
        const interval = setInterval(() => {
            positions.request()
        }, 4000)
        return () => clearInterval(interval)
    }, [positions])

    const items = ((positions.response && positions.response.result) || []).filter((i) => i.size)

    return (
        <div className="orders-list_container">
            <Table tableData={items} columns={renderColumns()} />
        </div>
    )
}

export default React.memo(FTXOrdersList)
