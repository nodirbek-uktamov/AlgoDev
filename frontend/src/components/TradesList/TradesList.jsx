import React, {useContext} from 'react'
import {Table as TradesTable} from "../common/Table";
import {usePutRequest} from "../../hooks/request";
import {TRADE_DETAIL} from "../../urls";
import './TradesList.scss'
import {MainContext} from "../../contexts/MainContext";
import {Button} from "../common/Button";

const renderColumns = (handleCancelTrade, cancelAllTrades) => {
    return [
        {
            title: "ID",
            key: 'id',
            width: '5%',
            render: (rowData) => {
                return <span>{rowData.id}</span>;
            }
        },
        {
            title: "Symbol",
            key: 'symbol',
            width: '15%',
            render: (rowData) => {
                return <span className='is-uppercase'>{rowData.symbol}</span>;
            }
        },
        {
            title: "Quantity",
            key: 'quantity',
            width: '15%',
            render: ({filledAmount, quantity}) => {
                return <span
                    className='has-text-weight-bold'>
                    {Number(filledAmount).toFixed(2)} / {Number(quantity)}
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
            title: "Active orders",
            key: 'activeOrderIds',
            width: '15%',
            textAlign: 'center',
            render: (rowData) => {
                return <span>{rowData.hftBot || rowData.gridBot ? rowData.activeOrderIds.length : '—'}</span>;
            }
        },
        {
            title: "Interval (seconds)",
            key: 'timeInterval',
            width: '10%',
            textAlign: 'center',
            render: ({loop, timeInterval}) => {
                return <span>{loop ? timeInterval : 'not loop'}</span>;
            }
        },
        {
            title: "Completed loops",
            key: 'completedLoops',
            width: '10%',
            textAlign: 'center',
            render: (rowData) => {
                return <span>{rowData.completedLoops}</span>;
            }
        },
        {
            title: "",
            key: 'tradeId',
            renderHeaderCell: (_) => <Button scale={false} size='S' text='Cancel all' color='danger' onClick={cancelAllTrades}/>,
            width: '20%',
            render: ({id: tradeId}) => {
                return <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: 20}}>
                    <Button scale={false} size='S'
                            text='Cancel' color='danger'
                            onClick={handleCancelTrade(tradeId)}/>
                </div>
            }
        }
    ];
};

function TradesList({trades, onCancel, cancelAllTrades}) {
    const cancel = usePutRequest()

    const cancelTrade = (tradeId) => async () => {
        const {success} = await cancel.request({url: TRADE_DETAIL.replace('{id}', tradeId)})

        if (success) {
            onCancel()
        }
    }

    return (
        <div className="trades-list_container">
            <TradesTable isBottomRounded={false} columns={renderColumns(cancelTrade, cancelAllTrades)} tableData={trades}/>
        </div>
    )
}

export default React.memo(TradesList)
