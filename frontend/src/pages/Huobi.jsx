import React, { useCallback, useState } from 'react'
import RGL, { WidthProvider } from 'react-grid-layout'
import Chart from '../components/Chart'
import TradeForm from '../components/huobi/TradeForm/TradeForm'
import { useLoad, usePutRequest } from '../hooks/request'
import { CANCEL_TRADES, TRADE } from '../urls'
import Logs from '../components/Logs'
import MainContextWrapper from '../contexts/MainContext'
import { Card } from '../components/common/Card'
import Tabs from '../components/Tabs'
import { getDefaultLayout } from '../utils/gridLayout'
import { DepthTab } from '../components/OrdersTabsSection/DepthTab'
import { OrdersListTab } from '../components/OrdersTabsSection/OrdersListTab'
import { TradesList } from '../components/TradesList'
import { HuobiOrdersList } from '../components/huobi/HuobiOrdersList'
import { getHeight } from '../utils/helpers'
import DraggableHeader from '../components/DraggableHeader'

const ReactGridLayout = WidthProvider(RGL)

export default function Huobi() {
    const [botPrices, setBotPrices] = useState({})
    const [containerSizes, setContainerSizes] = useState(getDefaultLayout('huobi'))

    const trades = useLoad({ url: TRADE.replace('{exchange}', 'huobi') })
    const cancelTrades = usePutRequest()

    async function cancelAllTrades() {
        const { success } = await cancelTrades.request({ url: CANCEL_TRADES.replace('{exchange}', 'huobi') })

        if (success) {
            trades.setResponse([])
        }
    }

    const onUpdate = useCallback(trades.request, [])

    function onChangeSize(val) {
        setContainerSizes(val)
        localStorage.setItem('huobi_default_layout', JSON.stringify(val))
    }

    return (
        <MainContextWrapper>
            <Tabs style={{ marginLeft: '1.1rem' }} />

            <ReactGridLayout
                className="layout"
                cols={100}
                rowHeight={15}
                layout={containerSizes}
                draggableHandle=".draggable-header"
                onResizeStop={onChangeSize}
                onDragStop={onChangeSize}>
                <div key={1} id="form-draggable-container">
                    <DraggableHeader label="Create bot form" className="draggable-header" />

                    <Card style={{ height: getHeight('form-draggable-container') }} className="no-border-top-radius">
                        <TradeForm onUpdate={onUpdate} />
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

                        <HuobiOrdersList />
                    </Card>
                </div>
            </ReactGridLayout>
        </MainContextWrapper>
    )
}
