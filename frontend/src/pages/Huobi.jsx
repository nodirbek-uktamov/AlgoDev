import React, { useCallback, useState } from 'react'
import RGL, { WidthProvider } from 'react-grid-layout'
import { useHistory } from 'react-router-dom'
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
import { Button } from '../components/common/Button'
import { signOut } from '../utils/auth'
import { TradesList } from '../components/TradesList'
import { HuobiOrdersList } from '../components/huobi/HuobiOrdersList'
import { getHeight } from '../utils/helpers'

const ReactGridLayout = WidthProvider(RGL)

export default function Huobi() {
    const [botPrices, setBotPrices] = useState({})
    const [containerSizes, setContainerSizes] = useState(getDefaultLayout('huobi'))
    const history = useHistory()

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
                onResizeStop={onChangeSize}
                onDragStop={onChangeSize}>

                <div key={1} id="form-draggable-container">
                    <Card style={{ height: getHeight('form-draggable-container') }}>
                        <TradeForm onUpdate={onUpdate} />
                    </Card>
                </div>

                <div key={2} id="logs-draggable-container">
                    <div>
                        <Logs setBotPrices={setBotPrices} trades={trades} />
                    </div>
                </div>

                <div key={4} id="depth-draggable-container">
                    <Card style={{ height: getHeight('depth-draggable-container') }}>
                        <DepthTab botPrices={botPrices} />
                    </Card>
                </div>

                <div key={5} id="orders-list-draggable-container">
                    <Card style={{ height: getHeight('orders-list-draggable-container') }}>
                        <OrdersListTab />
                    </Card>
                </div>

                <div key={6} id="chart-draggable-container">
                    <Chart containerSizes={containerSizes} />
                </div>

                <div key={7} id="trades-draggable-container">
                    <Card dense={false} style={{ height: getHeight('trades-draggable-container') }}>
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
