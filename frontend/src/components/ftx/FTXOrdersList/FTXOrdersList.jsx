import React, {useEffect} from 'react'
import './FTXOrdersList.scss';
import {Table} from "../../common/Table";
import {FTX_POSITIONS_LIST} from "../../../urls";
import {useLoad} from "../../../hooks/request";

// {
//     "future": "ETH-PERP",
//     "size": 0.001,
//     "side": "buy",
//     "netSize": 0.001,
//     "longOrderSize": 0,
//     "shortOrderSize": 0,
//     "cost": 1.092,
//     "entryPrice": 1092,
//     "unrealizedPnl": 0,
//     "realizedPnl": 0.03732231,
//     "initialMarginRequirement": 0.1,
//     "maintenanceMarginRequirement": 0.03,
//     "openSize": 0.001,
//     "collateralUsed": 0.1092,
//     "estimatedLiquidationPrice": 0,
//     "recentAverageOpenPrice": 1054.7,
//     "recentPnl": 0.0373,
//     "recentBreakEvenPrice": 1054.7,
//     "cumulativeBuySize": 0.001,
//     "cumulativeSellSize": 0
// }
const renderColumns = () => {
    return [
        {
            title: "Symbol",
            key: 'symbol',
            hasSorting: true,
            width: '5rem',
            render: (rowData) => {
                return <span>{rowData.future}</span>;
            }
        },
        {
            title: "Side",
            key: 'side',
            hasSorting: true,
            width: '0',
            render: (rowData) => {
                return <span>{rowData.side}</span>;
            }
        },
        {
            title: "Position size",
            key: 'size',
            hasSorting: true,
            width: '6rem',
            render: (rowData) => {
                return <span>{rowData.size}</span>;
            }
        },
        {
            title: "Notional size",
            key: 'notional_size',
            hasSorting: true,
            width: '6rem',
            render: (rowData) => {
                return <span>{Math.abs(rowData.cost)} $</span>;
            }
        },
        {
            title: "Est. liquidation price",
            key: 'estimated_liquidation_price',
            hasSorting: true,
            width: '8rem',
            render: (rowData) => {
                return <span>{Number(rowData.estimatedLiquidationPrice).toFixed(1)}</span>;
            }
        },
        {
            title: "Mark price",
            key: 'orderStatus',
            hasSorting: true,
            width: '5rem',
            render: (rowData) => {
                return <span>{rowData.entryPrice}</span>;
            }
        },
        {
            title: "PNL",
            key: 'pnl',
            hasSorting: true,
            width: '5rem',
            render: (rowData) => {
                return <span>{rowData.recentPnl}</span>;
            }
        },
        {
            title: "Avg open price",
            key: 'avg_open_price',
            hasSorting: true,
            width: '5rem',
            render: (rowData) => {
                return <span>{rowData.recentAverageOpenPrice}</span>;
            }
        },
        {
            title: "Break-even price",
            key: 'avg_open_price',
            hasSorting: true,
            width: '5rem',
            render: (rowData) => {
                return <span>{rowData.recentBreakEvenPrice}</span>;
            }
        },
    ]
};


function FTXOrdersList() {
    const positions = useLoad({url: FTX_POSITIONS_LIST})

    useEffect(() => {
        const interval = setInterval(() => {
            positions.request()
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    const items = (positions.response ? positions.response.result : []).filter(i => i.size)

    return (
        <div className="orders-list_container">
            <Table tableData={items} columns={renderColumns()}/>
        </div>
    )
}

export default React.memo(FTXOrdersList);
