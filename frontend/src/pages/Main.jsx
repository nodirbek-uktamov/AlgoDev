import React, {useCallback, useState} from 'react'
import Chart from '../components/Chart'
import TradeForm from '../components/TradeForm/TradeForm'
import {useLoad, usePutRequest} from '../hooks/request'
import {CANCEL_TRADES, TRADE} from '../urls'
import Logs from '../components/Logs'
import OrdersTabs from '../components/OrdersTabs'
import MainContextWrapper from "../contexts/MainContext";
import {OrdersTabsSection} from "../components/OrdersTabsSection";
import {Card} from "../components/common/Card";

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
            <div style={{display: 'grid', gap: '1.1rem', gridTemplateColumns: 'repeat(3, auto)', padding: '1.1rem'}}>
                <div>
                    <div style={{display: "flex", flexDirection: 'column', gap: '1.1rem' , maxWidth: '18rem', width: '18rem'}}>
                        <Card>
                            <TradeForm onUpdate={onUpdate}/>
                        </Card>

                        <Card>
                            <Logs setBotPrices={setBotPrices} trades={trades}/>
                        </Card>
                    </div>
                </div>

                <div style={{maxWidth: '47rem', minWidth: '47rem'}}>
                    <Chart cancelAllTrades={cancelAllTrades} trades={trades}/>
                </div>

                <div>
                    <OrdersTabsSection botPrices={botPrices}/>
                </div>
            </div>
        </MainContextWrapper>
    )
}
