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
            render: (rowData) => {
                return <span>{rowData.orderStatus}</span>;
            }
        },
        {
            title: "Type",
            key: 'type',
            hasSorting: true,
            render: (rowData) => {
                return <span className='has-text-grey-light'>{rowData.type}</span>;
            }
        },
        {
            title: "Symbol",
            key: 'symbol',
            hasSorting: true,
            render: (rowData) => {
                return <span className='is-uppercase'>{rowData.symbol}</span>;
            }
        },
        {
            title: "Side",
            key: 'side',
            hasSorting: true,
            render: (rowData) => {
                return <span className='has-text-primary'>{rowData.side}</span>;
            }
        },
        {
            title: "Price",
            key: 'orderPrice',
            hasSorting: true,
            render: (rowData) => {
                return <span className='has-text-weight-bold'>{Number(rowData.orderPrice).toFixed(tpp)}</span>;
            }
        },
        {
            title: "Quantity",
            key: 'orderSize',
            hasSorting: true,
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
    const [takeProfitOrderIds, setTakeProfitOrderIds] = useState(["3"])
    // ["1", "123"] // orderId of ordersList

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [filter, setFilter] = useState(undefined);

    useEffect(() => {
        setFilteredOrders(orders);
        setFilter(undefined);
    }, [orders]);

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

    const createNewFilteredData = (key, value) => {
        switch (value) {
            case ORDERS_FILTER_TYPE.takeprofit:
                return orders.filter(data => takeProfitOrderIds.includes(String(data.orderId)) && data.orderStatus === ORDERS_FILTER_TYPE.submitted);
            default:
                return orders.filter((data) => data[key] === value);
        }
    }

    const handleFilter = (key, value) => {
        if (filter === value) return;

        return () => {
            setFilter(value);

            if (!value) return setFilteredOrders(orders);

            const filteredData = createNewFilteredData(key, value);
            setFilteredOrders(filteredData);
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
            <FilterPanel handleFilter={handleFilter} openOrdersCount={openOrdersCount} allOrdersCount={allOrdersCount}/>
            <OrdersTable columns={renderColumns(handleCancelOrder, tpp)} tableData={filteredOrders}/>
        </div>
    )
}

export default React.memo(OrdersList);