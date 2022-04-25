import React, {useContext} from 'react'
import {Table as TradesTable} from "../common/Table";
import {usePutRequest} from "../../hooks/request";
import {TRADE_DETAIL} from "../../urls";
import './TradesList.scss'
import {MainContext} from "../../contexts/MainContext";

const renderColumns = (handleCancelTrade, tpp) => {
    return [
        {
            title: "ID",
            key: 'id',
            render: (rowData) => {
                return <span>{rowData.id}</span>;
            }
        },
        {
            title: "Symbol",
            key: 'symbol',
            render: (rowData) => {
                return <span className='is-uppercase'>{rowData.symbol}</span>;
            }
        },
        {
            title: "Quantity",
            key: 'quantity',
            render: ({filledAmount, quantity}) => {
                return <span
                    className='has-text-weight-bold'>
                    {Number(filledAmount).toFixed(tpp)} / {Number(quantity)}
                </span>;
            }
        },
        {
            title: "Side",
            key: 'tradeType',
            render: (rowData) => {
                return <span>{rowData.tradeType}</span>;
            }
        },
        {
            title: "Interval (seconds)",
            key: 'timeInterval',
            render: ({loop, timeInterval}) => {
                return <span>{loop ? timeInterval : 'not loop'}</span>;
            }
        },
        {
            title: "Completed loops",
            key: 'completedLoops',
            render: (rowData) => {
                return <span>{rowData.completedLoops}</span>;
            }
        },
        {
            title: "",
            key: 'tradeId',
            render: ({id: tradeId}) => {
                return <button className='trades-list_cancel-btn' onClick={handleCancelTrade(tradeId)}>&#10060;</button>
            }
        }
    ];
};

function TradesList({trades, onCancel}) {
    const cancel = usePutRequest()
    const {symbolSettings: {tpp}} = useContext(MainContext)

    const cancelTrade = (tradeId) => async () => {
        const {success} = await cancel.request({url: TRADE_DETAIL.replace('{id}', tradeId)})

        if (success) {
            onCancel()
        }
    }

    return (
        <div className="trades-list_container">
            <TradesTable columns={renderColumns(cancelTrade, tpp)} tableData={trades}/>
        </div>
    )
}

export default React.memo(TradesList)
