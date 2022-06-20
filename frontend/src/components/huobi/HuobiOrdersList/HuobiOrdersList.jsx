import React, {useContext, useEffect, useMemo, useState} from 'react'
import {Table as OrdersTable} from "../../common/Table";
import {FilterPanel} from "../../FilterPanel";
import {MainContext} from "../../../contexts/MainContext";
import {useLoad, usePostRequest} from "../../../hooks/request";
import {CANCEL_ALL_ORDERS, CANCEL_ORDER, LIMIT, MARKET, OPEN_ORDERS} from "../../../urls";
import {ORDERS_FILTER_TYPE} from "../../../utils/orders-filter-type";
import './HuobiOrdersList.scss';
import {Button} from "../../common/Button";

const SIDE_TEXT_STYLE = {
    buy: 'has-text-success',
    sell: 'has-text-danger'
}

const renderColumns = (handleCancelOrder, onCloseMarket, onCloseLimit, cancelAll, filter, settings) => {
    let result = [
        {
            title: "Status",
            key: 'orderStatus',
            hasSorting: true,
            width: '0%',
            render: (rowData) => {
                return <span>{rowData.orderStatus}</span>;
            }
        },
        {
            title: "Type",
            key: 'type',
            hasSorting: true,
            width: '0%',
            render: (rowData) => {
                return <p>{rowData.type}</p>;
            }
        },
        {
            title: "Symbol",
            key: 'symbol',
            hasSorting: true,
            width: '0%',
            render: (rowData) => {
                return <span className='is-uppercase'>{rowData.symbol}</span>;
            }
        },
        {
            title: "Side",
            key: 'side',
            hasSorting: true,
            width: '0%',
            render: (rowData) => {
                return <span
                    className={`${SIDE_TEXT_STYLE[rowData.side]} is-capitalized`}>{rowData.side}</span>;
            }
        },
        {
            title: "Price",
            key: 'orderPrice',
            hasSorting: true,
            width: '0%',
            render: (rowData) => {
                return <span>{Number(rowData.orderPrice).toFixed(settings.tpp || 2)}</span>;
            }
        },
        {
            title: "Quantity",
            key: 'orderSize',
            hasSorting: true,
            width: '00%',
            render: (rowData) => {
                return <span>{Number(rowData.orderSize).toFixed(settings.tap || 0)}</span>;
            }
        },
        {
            title: "Time",
            key: 'time',
            hasSorting: true,
            width: '0%',
            render: (rowData) => {
                return <span>{rowData.time}</span>;
            }
        },
    ]

    if (filter.value === 'filled' || filter.value === 'submitted') {
        result.push({
            key: 'close',
            renderHeaderCell: (column) => <div className="is-flex is-justify-content-center">
                {filter.value === 'submitted' && <Button scale={false} size='S' color='danger' text='Cancel all' onClick={cancelAll}/>}
            </div>,
            hasSorting: false,
            render: (rowData) => {
                if (filter.value === 'filled') return (
                    <div className="is-flex" style={{gap: '0.5rem'}}>
                        <Button
                            scale={false}
                            size='S'
                            color='white'
                            text='Market'
                            onClick={() => onCloseMarket(rowData)}/>

                        <Button
                            scale={false}
                            size='S'
                            color='white'
                            text='Limit'
                            onClick={() => onCloseLimit(rowData)}/>
                    </div>
                )

                else if (filter.value === 'submitted') return (
                    <div className="is-flex is-justify-content-center">
                        {filter.value === 'submitted' && <Button scale={false} size='S' color='danger' text='Cancel' onClick={handleCancelOrder(rowData.orderId)}/>}
                    </div>
                )
                else return null
            }
        })
    }

    return result
};

function HuobiOrdersList() {
    const {wsCallbacksRef, symbolValue, symbolSettings} = useContext(MainContext)
    const initialOrders = useLoad({url: OPEN_ORDERS.replace('{symbol}', symbolValue)})
    const [takeProfitOrderIds, setTakeProfitOrderIds] = useState([])

    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState({key: "orderStatus", value: ORDERS_FILTER_TYPE.submitted});

    const cancelAllOrders = usePostRequest({url: CANCEL_ALL_ORDERS})
    const cancelOrder = usePostRequest()
    const closeMarket = usePostRequest({url: MARKET});
    const closeLimit = usePostRequest({url: LIMIT});

    const onCloseMarket = async (rowData) => {
        return closeMarket.request({data: rowData})
    }

    const onCloseLimit = async (rowData) => {
        return closeLimit.request({data: rowData})
    }

    useEffect(() => {
        wsCallbacksRef.current.setOrders = setOrders
        wsCallbacksRef.current.setTakeProfitOrderIds = setTakeProfitOrderIds
        wsCallbacksRef.current.updateInitialOrders = (symbol) => {
            setOrders([])
            initialOrders.request({url: OPEN_ORDERS.replace('{symbol}', symbol)})
        }
    }, []);

    useEffect(() => {
        if (!initialOrders.response) return;

        if (initialOrders.response.orders) {
            setOrders(oldOrders => [...initialOrders.response.orders, ...oldOrders])
        }
        if (initialOrders.response.takeProfitOrders) {
            setTakeProfitOrderIds(oldIds => [...initialOrders.response.takeProfitOrders, ...oldIds])
        }
    }, [initialOrders.response]);

    const filteredOrders = ({key, value}) => {
        switch (value) {
            case ORDERS_FILTER_TYPE.all:
                return orders;
            default:
                return orders.filter((data) => {
                    return data[key] === value
                });
        }
    }

    const handleFilter = (key, value) => {
        if (filter === value) return;

        return () => {
            setFilter({key, value});
        };
    };

    const handleCancelOrder = (orderId) => () => {
        cancelOrder.request({url: CANCEL_ORDER.replace('{id}', orderId)})
    }

    const openOrdersCount = useMemo(() => {
        return orders.filter((data) => data.orderStatus === ORDERS_FILTER_TYPE.submitted).length;
    }, [orders])

    const allOrdersCount = useMemo(() => {
        return orders.length;
    }, [orders])

    const filledOrdersCount = useMemo(() => {
        return orders.filter((data) => data.orderStatus === ORDERS_FILTER_TYPE.filled).length;
    }, [orders])

    const canceledOrdersCount = useMemo(() => {
        return orders.filter((data) => data.orderStatus === ORDERS_FILTER_TYPE.canceled).length;
    }, [orders])

    function cancelAll() {
        const orderIds = filteredOrders(filter).map(i => i.orderId)
        cancelAllOrders.request({data: {orderIds}})
    }

    return (
        <div className="orders-list_container">
            <FilterPanel
                handleFilter={handleFilter}
                openOrdersCount={openOrdersCount}
                allOrdersCount={allOrdersCount}
                filledOrdersCount={filledOrdersCount}
                canceledOrdersCount={canceledOrdersCount}
                filter={filter}/>

            <OrdersTable
                columns={renderColumns(handleCancelOrder, onCloseMarket, onCloseLimit, cancelAll, filter, symbolSettings)}
                tableData={filteredOrders(filter)}/>
        </div>
    )
}

export default React.memo(HuobiOrdersList);