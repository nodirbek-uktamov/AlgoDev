import React, { useCallback, useState, useEffect, createContext } from 'react'
import Chart from '../components/Chart'
import FTXTradeForm from '../components/ftx/FTXTradeForm/FTXTradeForm'
import { useLoad, usePutRequest } from '../hooks/request'
import { CANCEL_TRADES, FTX_ACCOUNT, TRADE } from '../urls'
import Logs from '../components/Logs'
import MainContextWrapper from '../contexts/MainContext'
import { OrdersTabsSection } from '../components/OrdersTabsSection'
import { Card } from '../components/common/Card'
import Tabs from '../components/Tabs'

export const FTXContext = createContext({})

export default function FTX() {
    const [botPrices, setBotPrices] = useState({})

    const trades = useLoad({ url: TRADE.replace('{exchange}', 'ftx') })
    const cancelTrades = usePutRequest()

    const account = useLoad({ url: FTX_ACCOUNT })

    useEffect(() => {
        const interval = setInterval(() => {
            account.request()
        }, 1500)
        return () => clearInterval(interval)
        // eslint-disable-next-line
    }, [])

    async function cancelAllTrades() {
        const { success } = await cancelTrades.request({ url: CANCEL_TRADES.replace('{exchange}', 'ftx') })

        if (success) {
            trades.setResponse([])
        }
    }

    const onUpdate = useCallback(trades.request, [])

    return (
        <MainContextWrapper>
            <FTXContext.Provider value={{ account: account.response || {} }}>
                <Tabs style={{ marginLeft: '1.1rem' }} />

                <div style={{ display: 'grid', gap: '1.1rem', gridTemplateColumns: 'repeat(3, auto)', padding: '1.1rem' }}>
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', maxWidth: '18rem', width: '18rem' }}>
                            <Card>
                                <FTXTradeForm onUpdate={onUpdate} />
                            </Card>

                            <Card>
                                <Logs setBotPrices={setBotPrices} trades={trades} />
                            </Card>
                        </div>
                    </div>

                    <div style={{ maxWidth: '47rem', minWidth: '47rem' }}>
                        <Chart cancelAllTrades={cancelAllTrades} trades={trades} />
                    </div>

                    <div>
                        <OrdersTabsSection botPrices={botPrices} />
                    </div>
                </div>
            </FTXContext.Provider>
        </MainContextWrapper>
    )
}
