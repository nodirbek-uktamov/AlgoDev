import React, {useMemo, useRef, useState} from 'react'
import {Table} from "../common/Table";
import {convertTimestamp} from "../../utils/date";
import {usePutRequest} from "../../hooks/request";
import {TRADE_DETAIL} from "../../urls";
import  './TradesList.scss'
import {FilterPanel} from "../FilterPanel";

const renderColumns = (handleCancelTrade) => {
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
            key: 'eventType',
            hasSorting: true,
            render: (rowData) => {
                return <span className='has-text-primary'>{rowData.eventType}</span>;
            }
        },
        {
            title: "Price",
            key: 'orderPrice',
            hasSorting: true,
            render: (rowData) => {
                return <span className='has-text-weight-bold'>{rowData.orderPrice}</span>;
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
            key: 'tradeTime',
            hasSorting: true,
            render: (rowData) => {
                return <span className='has-text-grey-light is-size-7'>{convertTimestamp(rowData.tradeTime)}</span>;
            }
        },
        {
            title: "",
            key: 'orderId',
            render: ({orderId}) => {
                return <button className='trades-list_cancel-btn' onClick={handleCancelTrade(orderId)}>&#10060;</button>
            }
        }
    ];
};

const mockTableData = [
    {
        tradePrice: "76.000000000000000000",
        tradeVolume: "1.013157894736842100",
        tradeId: 301,
        tradeTime: 1583854188883,
        aggressor: true,
        remainAmt: "0.000000000000000400000000000000000000",
        execAmt: "2",
        orderId: 27163536,
        type: "sell-limit",
        clientOrderId: "abc123",
        orderSource: "spot-api",
        orderPrice: "15000",
        orderSize: "0.01",
        orderStatus: "filled",
        symbol: "btcusdt",
        eventType: "trade"
    },
    {
        tradePrice: "86.000000000000000000",
        tradeVolume: "1.013157894736842100",
        tradeId: 302,
        tradeTime: 1583854188893,
        aggressor: true,
        remainAmt: "0.000000000000000400000000000000000000",
        execAmt: "2",
        orderId: 27163537,
        type: "sell-limit",
        clientOrderId: "abc123",
        orderSource: "spot-api",
        orderPrice: "16000",
        orderSize: "0.02",
        orderStatus: "closed",
        symbol: "btcusdt",
        eventType: "trade"
    }
];


function TradesList({ trades, onCancel, tpp }) {
    const cancel = usePutRequest()
    const initialData = useRef(mockTableData).current;
    const [data, setData] = useState(initialData);
    const [filter, setFilter] = useState("");

    const handleFilter = (key, value) => {
        if (filter === value) return;

        return () => {
            setFilter(value);

            if (!value) return setData(initialData);

            const filteredData = initialData.filter((data) => data[key] === value);
            setData(filteredData);
        };
    };

    const cancelTrade = (tradeId) => async () => {
        const { success } = await cancel.request({ url: TRADE_DETAIL.replace('{id}', tradeId) })

        if (success) {
            onCancel()
        }
    }

    const openTradeCount = useMemo(() => {
        return initialData.filter((data) => data.orderStatus === 'open').length;
    }, [initialData])

    const allTradesCount = useMemo(() => {
            return initialData.length;
    }, [initialData])

    return (
        <div className="trades-list_container">
            <FilterPanel handleFilter={handleFilter} openTradeCount={openTradeCount} allTradesCount={allTradesCount} />
            <Table columns={renderColumns(cancelTrade)} tableData={data} />
        </div>
    )
}

export default React.memo(TradesList)
