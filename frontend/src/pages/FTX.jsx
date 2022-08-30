import React, { createContext, useCallback, useEffect, useState } from 'react'
import RGL, { WidthProvider } from 'react-grid-layout'
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
import { getDefaultLayout } from '../utils/gridLayout'
import { getHeight } from '../utils/helpers'
import DraggableHeader from '../components/DraggableHeader'

const ReactGridLayout = WidthProvider(RGL)

export const FTXContext = createContext({})

export default function FTX() {
    const [containerSizes, setContainerSizes] = useState(getDefaultLayout('ftx'))

    const [botPrices, setBotPrices] = useState({})

    const trades = useLoad({ url: TRADE.replace('{exchange}', 'ftx') })
    const cancelTrades = usePutRequest()

    const account = useLoad({ url: FTX_ACCOUNT })

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
                    rowHeight={15}
                    layout={containerSizes}
                    draggableHandle=".draggable-header"
                    onResizeStop={onChangeSize}
                    onDragStop={onChangeSize}>
                    <div key={1} id="form-draggable-container" className="form-draggable-container">
                        <DraggableHeader label="Create bot form" className="draggable-header" />

                        <Card style={{ height: getHeight('form-draggable-container') }} className="no-border-top-radius">
                            <FTXTradeForm onUpdate={onUpdate} />
                        </Card>
                    </div>

                    <div key={2} id="logs-draggable-container">
                        <DraggableHeader label="Logs" className="draggable-header" />
                        <Logs setBotPrices={setBotPrices} trades={trades} />
                    </div>

                    <div key={4} id="depth-draggable-container">
                        <DraggableHeader label="Orderbook" className="draggable-header" />

                        <Card style={{ height: getHeight('depth-draggable-container') }} className="no-border-top-radius">
                            <DepthTab botPrices={botPrices} />
                        </Card>
                    </div>

                    <div key={5} id="orders-list-draggable-container">
                        <DraggableHeader label="Trades" className="draggable-header" />

                        <Card style={{ height: getHeight('orders-list-draggable-container'), padding: 15 }} className="no-border-top-radius">
                            <div style={{ overflow: 'hidden', height: getHeight('orders-list-draggable-container') - 30 }}>
                                <OrdersListTab />
                            </div>
                        </Card>
                    </div>

                    <div key={6} id="chart-draggable-container">
                        <DraggableHeader label="Chart" className="draggable-header" />

                        <Chart containerSizes={containerSizes} />
                    </div>

                    <div key={7} id="trades-draggable-container">
                        <DraggableHeader label="Orders" className="draggable-header" />

                        <Card dense={false} style={{ height: getHeight('trades-draggable-container') }} className="no-border-top-radius">
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
