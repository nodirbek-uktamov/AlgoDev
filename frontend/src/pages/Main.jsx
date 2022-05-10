import React, {useCallback, useState} from 'react'
import Chart from '../components/Chart'
import TradeForm from '../components/TradeForm'
import {useLoad, usePutRequest} from '../hooks/request'
import {CANCEL_TRADES, TRADE} from '../urls'
import Logs from '../components/Logs'
import OrdersTabs from '../components/OrdersTabs'
import MainContextWrapper from "../contexts/MainContext";
import {OrdersTabsSection} from "../components/OrdersTabsSection";

export default function Main() {
    const [botPrices, setBotPrices] = useState({})

    const trades = useLoad({url: TRADE})
    const cancelTrades = usePutRequest()

    async function cancelAllTrades() {
        const {success} = await cancelTrades.request({url: CANCEL_TRADES})

        if (success) {
            trades.setResponse([])
        }
    }

    const onUpdate = useCallback(trades.request, [])

    return (
        <MainContextWrapper>
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '320px 1fr 567px', padding: '20px'}}>
                {/*<div className="columns mb-4 mt-2">*/}
                {/*    <div className="column"/>*/}

                {/*    <div className="column is-narrow" style={{width: 200}}>*/}
                {/*        <Button text={'Cancel all orders'} onClick={cancelAllTrades}/>*/}
                {/*    </div>*/}
                {/*</div>*/}

                <div>
                    <TradeForm onUpdate={onUpdate}/>
                    <Logs setBotPrices={setBotPrices} trades={trades}/>
                </div>

                <div>
                    <Chart trades={trades}/>
                </div>

                <div>
                    <OrdersTabsSection botPrices={botPrices}/>
                    {/*<OrdersTabs botPrices={botPrices}/>*/}
                </div>
            </div>
        </MainContextWrapper>
    )
}
