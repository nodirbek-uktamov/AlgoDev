import React, {useMemo, useState, useContext, useEffect} from 'react'
import {Table as OrdersTable} from "../common/Table";
import {FilterPanel} from "../FilterPanel";
import {MainContext} from "../../contexts/MainContext";
import {useLoad} from "../../hooks/request";
import {OPEN_ORDERS} from "../../urls";
import {ORDERS_FILTER_TYPE} from "../../utils/orders-filter-type";
import './OrdersList.scss';

const renderColumns = (handleCancelOrder, tpp) => {
    return [
        {
            title: "Status",
            key: 'orderStatus',
            hasSorting: true,
            width: '20%',
            render: (rowData) => {
                return <span>{rowData.orderStatus}</span>;
            }
        },
        {
            title: "Type",
            key: 'type',
            hasSorting: true,
            width: '10%',
            render: (rowData) => {
                return <span className='has-text-grey-light'>{rowData.type}</span>;
            }
        },
        {
            title: "Symbol",
            key: 'symbol',
            hasSorting: true,
            width: '20%',
            render: (rowData) => {
                return <span className='is-uppercase'>{rowData.symbol}</span>;
            }
        },
        {
            title: "Side",
            key: 'side',
            hasSorting: true,
            width: '10%',
            render: (rowData) => {
                return <span
                    className={`has-text-primary ${rowData.side === 'sell' ? 'has-text-danger' : 'has-text-success'}`}>{rowData.side}</span>;
            }
        },
        {
            title: "Price",
            key: 'orderPrice',
            hasSorting: true,
            width: '10%',
            render: (rowData) => {
                return <span className='has-text-weight-bold'>{Number(rowData.orderPrice).toFixed(tpp)}</span>;
            }
        },
        {
            title: "Quantity",
            key: 'orderSize',
            hasSorting: true,
            width: '10%',
            render: (rowData) => {
                return <span className='has-text-weight-bold'>{rowData.orderSize}</span>;
            }
        },
        {
            title: "Time",
            key: 'time',
            hasSorting: true,
            render: (rowData) => {
                return <span className='has-text-grey-light is-size-7'>{rowData.time}</span>;
            }
        }
    ];
};

function OrdersList() {
    const {wsCallbacksRef, symbolValue, symbolSettings: {tpp}} = useContext(MainContext)
    const initialOrders = useLoad({url: OPEN_ORDERS.replace('{symbol}', symbolValue)})
    const [takeProfitOrderIds, setTakeProfitOrderIds] = useState([])

    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState({key: "orderStatus", value: ORDERS_FILTER_TYPE.submitted});

    useEffect(() => {
        wsCallbacksRef.current.setOrders = setOrders
        wsCallbacksRef.current.setTakeProfitOrderIds = setTakeProfitOrderIds
        wsCallbacksRef.current.updateInitialOrders = () => {
            setOrders([])
            initialOrders.request()
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
                return orders.filter((data) => data[key] === value);
        }
    }

    const handleFilter = (key, value) => {
        if (filter === value) return;

        return () => {
            setFilter({key, value});
        };
    };

    const handleCancelOrder = (orderId) => async () => {
        throw Error('Not implemented yet')
    }

    const openOrdersCount = useMemo(() => {
        return orders.filter((data) => data.orderStatus === ORDERS_FILTER_TYPE.submitted).length;
    }, [orders])

    const allOrdersCount = useMemo(() => {
        return orders.length;
    }, [orders])

    return (
        <div className="orders-list_container">
            <FilterPanel handleFilter={handleFilter} openOrdersCount={openOrdersCount} allOrdersCount={allOrdersCount}
                         filter={filter}/>
            <OrdersTable columns={renderColumns(handleCancelOrder, tpp)} tableData={filteredOrders(filter)}/>
        </div>
    )
}

export default React.memo(OrdersList);