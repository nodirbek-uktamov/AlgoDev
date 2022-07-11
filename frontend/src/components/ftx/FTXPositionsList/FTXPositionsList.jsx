import React, { useCallback, useContext, useEffect } from 'react'
import './FTXPositionsList.scss'
import { Table } from '../../common/Table'
import { CLOSE_POSITION_MARKET, FTX_POSITIONS_LIST } from '../../../urls'
import { useLoad, usePostRequest } from '../../../hooks/request'
import { Button } from '../../common/Button'
import { MainContext } from '../../../contexts/MainContext'

const renderColumns = (handleClosePositionMarket, setTradeFormValue, symbol) => [
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
        render: (rowData) => (
            <span className="pointer" onClick={() => setTradeFormValue('quantity', rowData.size)}>
                {rowData.size.toFixed(symbol.tap)}
            </span>
        ),
    },
    {
        title: 'Notional size',
        key: 'notional_size',
        hasSorting: true,
        width: '6rem',
        render: (rowData) => <span>{Math.abs(rowData.cost).toFixed(2)} $</span>,
    },
    {
        title: 'Est. liquidation price',
        key: 'estimated_liquidation_price',
        hasSorting: true,
        width: '8rem',
        render: (rowData) => (
            <span>
                {rowData.estimatedLiquidationPrice ? Number(rowData.estimatedLiquidationPrice).toFixed(symbol.tpp || 2) : '0'}
            </span>
        ),
    },
    {
        title: 'Mark price',
        key: 'orderStatus',
        hasSorting: true,
        width: '5rem',
        render: (rowData) => <span>{Number(rowData.entryPrice || 0).toFixed(symbol.tpp || 2)}</span>,
    },
    {
        title: 'PNL',
        key: 'pnl',
        hasSorting: true,
        width: '5rem',
        render: (rowData) => (
            <span style={{ color: rowData.recentPnl < 0 ? '#E61739' : '#12b247' }}>
                {Number(rowData.recentPnl || 0).toFixed(2)}
            </span>
        ),
    },
    {
        title: 'Avg open price',
        key: 'avg_open_price',
        hasSorting: true,
        width: '5rem',
        render: (rowData) => <span>{Number(rowData.recentAverageOpenPrice || 0).toFixed(symbol.tpp || 2)}</span>,
    },
    {
        title: 'Break-even price',
        key: 'recent_break_even_price',
        hasSorting: true,
        width: '5rem',
        render: (rowData) => <span>{Number(rowData.recentBreakEvenPrice || 0).toFixed(symbol.tpp || 2)}</span>,
    },
    {
        title: '',
        key: 'actions',
        hasSorting: true,
        width: '5rem',
        render: (rowData) => (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '1.1rem' }}>
                <Button scale={false} size="S"
                    text="Market" color="danger"
                    onClick={() => handleClosePositionMarket(rowData)} />
            </div>
        ),
    },
]

function FTXPositionsList() {
    const positions = useLoad({ url: FTX_POSITIONS_LIST })
    const closePosition = usePostRequest({ url: CLOSE_POSITION_MARKET })
    const { callbacks, symbol } = useContext(MainContext)

    useEffect(() => {
        const interval = setInterval(() => {
            positions.request()
        }, 3000)
        return () => clearInterval(interval)
    }, [positions])

    const items = ((positions.response && positions.response.result) || []).filter((i) => i.size)

    const handleClosePositionMarket = useCallback(async (item) => {
        await closePosition.request({ data: item })
        positions.request()

        // eslint-disable-next-line
    }, [])

    return (
        <div className="orders-list_container">
            <Table tableData={items} columns={renderColumns(handleClosePositionMarket, callbacks.current.setTradeFormValue, symbol)} />
        </div>
    )
}

export default React.memo(FTXPositionsList)
