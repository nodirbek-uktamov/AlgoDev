import React, { createContext, useCallback, useEffect, useState } from 'react'
import RGL, { WidthProvider } from 'react-grid-layout'
import { useHistory } from 'react-router-dom'
import Chart from '../components/Chart'
import FTXTradeForm from '../components/ftx/FTXTradeForm/FTXTradeForm'
import { useLoad, usePutRequest } from '../hooks/request'
import { CANCEL_TRADES, FTX_ACCOUNT, TRADE } from '../urls'
import Logs from '../components/Logs'
import MainContextWrapper from '../contexts/MainContext'
import { Card } from '../components/common/Card'
import Tabs from '../components/Tabs'
import { LOCAL_LOAD_INTERVAL } from '../constants'
import { TradesList } from '../components/TradesList'
import FTXOrders from '../components/ftx/FTXOrders'
import { DepthTab } from '../components/OrdersTabsSection/DepthTab'
import { OrdersListTab } from '../components/OrdersTabsSection/OrdersListTab'
import { Button } from '../components/common/Button'
import { signOut } from '../utils/auth'
import { getDefaultLayout } from '../utils/gridLayout'

const ReactGridLayout = WidthProvider(RGL)

export const FTXContext = createContext({})

export default function FTX() {
    const [containerSizes, setContainerSizes] = useState(getDefaultLayout('ftx'))

    const [botPrices, setBotPrices] = useState({})

    const trades = useLoad({ url: TRADE.replace('{exchange}', 'ftx') })
    const cancelTrades = usePutRequest()

    const account = useLoad({ url: FTX_ACCOUNT })
    const history = useHistory()

    useEffect(() => {
        const interval = setInterval(() => {
            account.request()
        }, window.location.hostname === 'localhost' ? LOCAL_LOAD_INTERVAL : 1500)
        return () => clearInterval(interval)
        // eslint-disable-next-line
    }, [])

    const cancelAllTrades = useCallback(async () => {
        const { success } = await cancelTrades.request({ url: CANCEL_TRADES.replace('{exchange}', 'ftx') })

        if (success) {
            trades.setResponse([])
        }

        // eslint-disable-next-line
    }, [])

    const onUpdate = useCallback(trades.request, [])

    function onChangeSize(val) {
        setContainerSizes(val)
        localStorage.setItem('ftx_default_layout', JSON.stringify(val))
    }

    return (
        <MainContextWrapper>
            <FTXContext.Provider value={{ account: account.response || {} }}>
                <Tabs style={{ marginLeft: '1.1rem' }} />

                <ReactGridLayout
                    className="layout"
                    cols={100}
                    layout={containerSizes}
                    onResizeStop={onChangeSize}
                    onDragStop={onChangeSize}>
                    <div key={1}>
                        <Card>
                            <FTXTradeForm onUpdate={onUpdate} />
                        </Card>
                    </div>

                    <div key={2} id="logs-draggable-container">
                        <div>
                            <Logs setBotPrices={setBotPrices} trades={trades} />
                        </div>
                    </div>

                    <div key={4}>
                        <Card>
                            <DepthTab botPrices={botPrices} />
                        </Card>
                    </div>

                    <div key={5}>
                        <div style={{ height: '100%', gap: '1.1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Card>
                                <OrdersListTab />
                            </Card>

                            <Button
                                color="white"
                                text="Log out"
                                onClick={() => signOut(history)} />
                        </div>
                    </div>

                    <div key={6} id="chart-draggable-container">
                        <Chart containerSizes={containerSizes} />
                    </div>

                    <div key={7}>
                        <Card dense={false}>
                            <TradesList
                                cancelAllTrades={cancelAllTrades}
                                onCancel={trades.request}
                                trades={trades.response || []} />

                            <FTXOrders />
                        </Card>
                    </div>
                </ReactGridLayout>
            </FTXContext.Provider>
        </MainContextWrapper>
    )
}
