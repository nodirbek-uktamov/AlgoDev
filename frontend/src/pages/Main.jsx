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
            <div style={{display: 'grid', gap: 20, gridTemplateColumns: '320px 1fr 567px', padding: 20}}>
                <div>
                    <div style={{display: "flex", flexDirection: 'column', gap: 20}}>
                        <Card>
                            <TradeForm onUpdate={onUpdate}/>
                        </Card>

                        <Card>
                            <Logs setBotPrices={setBotPrices} trades={trades}/>
                        </Card>
                    </div>

                </div>

                <div>
                    <Chart cancelAllTrades={cancelAllTrades} trades={trades}/>
                </div>

                <div>
                    <OrdersTabsSection botPrices={botPrices}/>
                </div>
            </div>
        </MainContextWrapper>
    )
}
