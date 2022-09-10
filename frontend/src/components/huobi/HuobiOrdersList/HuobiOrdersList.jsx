import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Table as OrdersTable } from '../../common/Table'
import { FilterPanel } from '../../FilterPanel'
import { MainContext } from '../../../contexts/MainContext'
import { useLoad, usePostRequest } from '../../../hooks/request'
import { CANCEL_ALL_ORDERS, CANCEL_ORDER, LIMIT, MARKET, OPEN_ORDERS } from '../../../urls'
import { ORDERS_FILTER_TYPE } from '../../../utils/orders-filter-type'
import './HuobiOrdersList.scss'
import { Button } from '../../common/Button'
import { useMessage } from '../../../hooks/message'

export const SIDE_TEXT_STYLE = {
    buy: 'has-text-success',
    sell: 'has-text-danger',
}

const renderColumns = (handleCancelOrder, onCloseMarket, onCloseLimit, cancelAll, filter, settings) => {
    const result = [
        {
            title: 'Status',
            key: 'orderStatus',
            hasSorting: true,
            width: '0%',
            render: (rowData) => <span>{rowData.orderStatus}</span>,
        },
        {
            title: 'Type',
            key: 'type',
            hasSorting: true,
            width: '0%',
            render: (rowData) => <p>{rowData.type}</p>,
        },
        {
            title: 'Symbol',
            key: 'symbol',
            hasSorting: true,
            width: '0%',
            render: (rowData) => <span className="is-uppercase">{rowData.symbol}</span>,
        },
        {
            title: 'Side',
            key: 'side',
            hasSorting: true,
            width: '0%',
            render: (rowData) => (
                <span
                    className={`${SIDE_TEXT_STYLE[rowData.side]} is-capitalized`}>{rowData.side}
                </span>
            ),
        },
        {
            title: 'Price',
            key: 'orderPrice',
            hasSorting: true,
            width: '0%',
            render: (rowData) => <span>{Number(rowData.orderPrice).toFixed(settings.tpp || 2)}</span>,
        },
        {
            title: 'Quantity',
            key: 'orderSize',
            hasSorting: true,
            width: '00%',
            render: (rowData) => <span>{Number(rowData.orderSize).toFixed(settings.tap || 0)}</span>,
        },
        {
            title: 'Time',
            key: 'time',
            hasSorting: true,
            width: '0%',
            render: (rowData) => <span>{rowData.time}</span>,
        },
    ]

    if (filter.value === 'filled' || filter.value === 'submitted') {
        result.push({
            key: 'close',
            renderHeaderCell: (column) => (
                <div className="is-flex is-justify-content-center">
                    {filter.value === 'submitted' && <Button scale={false} size="S" color="danger" text="Cancel all" onClick={cancelAll} />}
                </div>
            ),
            hasSorting: false,
            render: (rowData) => {
                if (filter.value === 'filled') {
                    return (
                        <div className="is-flex" style={{ gap: '0.5rem' }}>
                            <Button
                                scale={false}
                                size="S"
                                color="white"
                                text="Market"
                                onClick={() => onCloseMarket(rowData)} />

                            <Button
                                scale={false}
                                size="S"
                                color="white"
                                text="Limit"
                                onClick={() => onCloseLimit(rowData)} />
                        </div>
                    )
                }

                if (filter.value === 'submitted') {
                    return (
                        <div className="is-flex is-justify-content-center">
                            {filter.value === 'submitted' && <Button scale={false} size="S" color="danger" text="Cancel" onClick={handleCancelOrder(rowData.orderId)} />}
                        </div>
                    )
                }
                return null
            },
        })
    }

    return result
}

function HuobiOrdersList({ orders, setOrders }) {
    const { wsCallbacksRef, symbolValue, symbol } = useContext(MainContext)
    const initialOrders = useLoad({ url: OPEN_ORDERS.replace('{symbol}', symbolValue) })
    // const [takeProfitOrderIds, setTakeProfitOrderIds] = useState([])

    const [filter, setFilter] = useState({ key: 'orderStatus', value: ORDERS_FILTER_TYPE.submitted })

    const cancelAllOrders = usePostRequest({ url: CANCEL_ALL_ORDERS })
    const cancelOrder = usePostRequest()
    const closeMarket = usePostRequest({ url: MARKET })
    const closeLimit = usePostRequest({ url: LIMIT })
    const [showMessage] = useMessage()

    const onCloseMarket = async (rowData) => closeMarket.request({ data: rowData })

    const onCloseLimit = async (rowData) => closeLimit.request({ data: rowData })

    useEffect(() => {
        wsCallbacksRef.current.setOrders = setOrders
        // wsCallbacksRef.current.setTakeProfitOrderIds = setTakeProfitOrderIds
        wsCallbacksRef.current.showOrderMessage = showMessage

        wsCallbacksRef.current.updateInitialOrders = (s) => {
            setOrders([])
            initialOrders.request({ url: OPEN_ORDERS.replace('{symbol}', s) })
        }
    }, [initialOrders, setOrders, showMessage, wsCallbacksRef])

    useEffect(() => {
        if (!initialOrders.response) return

        if (initialOrders.response.orders) {
            setOrders((oldOrders) => [...initialOrders.response.orders, ...oldOrders])
        }
        // if (initialOrders.response.takeProfitOrders) {
        //     setTakeProfitOrderIds((oldIds) => [...initialOrders.response.takeProfitOrders, ...oldIds])
        // }
    }, [initialOrders.response, setOrders])

    const filteredOrders = ({ key, value }) => {
        switch (value) {
        case ORDERS_FILTER_TYPE.all:
            return orders
        default:
            return orders.filter((data) => data[key] === value)
        }
    }

    const handleFilter = (key, value) => {
        if (filter === value) return

        return () => {
            setFilter({ key, value })
        }
    }

    const handleCancelOrder = (orderId) => () => {
        cancelOrder.request({ url: CANCEL_ORDER.replace('{id}', orderId) })
    }

    const openOrdersCount = useMemo(() => orders.filter((data) => data.orderStatus === ORDERS_FILTER_TYPE.submitted).length, [orders])

    const allOrdersCount = useMemo(() => orders.length, [orders])

    const filledOrdersCount = useMemo(() => orders.filter((data) => data.orderStatus === ORDERS_FILTER_TYPE.filled).length, [orders])

    const canceledOrdersCount = useMemo(() => orders.filter((data) => data.orderStatus === ORDERS_FILTER_TYPE.canceled).length, [orders])

    function cancelAll() {
        const orderIds = filteredOrders(filter).map((i) => i.orderId)
        cancelAllOrders.request({ data: { orderIds } })
    }

    return (
        <div className="orders-list_container">
            <FilterPanel
                handleFilter={handleFilter}
                openOrdersCount={openOrdersCount}
                allOrdersCount={allOrdersCount}
                filledOrdersCount={filledOrdersCount}
                canceledOrdersCount={canceledOrdersCount}
                filter={filter} />

            <OrdersTable
                columns={renderColumns(handleCancelOrder, onCloseMarket, onCloseLimit, cancelAll, filter, symbol)}
                tableData={filteredOrders(filter)} />
        </div>
    )
}

export default React.memo(HuobiOrdersList)
