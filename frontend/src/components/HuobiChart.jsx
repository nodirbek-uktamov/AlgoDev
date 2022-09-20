import React, { useContext, useEffect, useRef, useState } from 'react'
import map from 'lodash/map'
import { MainContext } from '../contexts/MainContext'
import { useGetRequest } from '../hooks/request'
import { FTX_FILLS_LIST } from '../urls'
import HuobiDatafeed from '../utils/datafeeds/huobi'
import { TVChartContainer } from './TVChartContainer'
import { WS_TYPES } from '../utils/websocket'

function HuobiChart({ openOrders, chartInterval }) {
    const { symbolValue, symbol, wsCallbacksRef, publicWs, user } = useContext(MainContext)
    const [orderLines, setOrderLines] = useState({})
    const [chartWidget, setChartWidget] = useState(null)
    const [klineData, setKlineData] = useState(null)
    const chartRef = useRef({})

    // useEffect(() => {
    //     if (!chartWidget) return
    //
    //     try {
    //         chartWidget.activeChart().removeAllShapes()
    //         const { from, to } = chartWidget.activeChart().getVisibleRange()
    //         const filledOrders = openOrders.filter((i) => i.orderStatus === 'filled')
    //         console.log(filledOrders)
    //
    //         map(filledOrders || [], (i) => {
    //             const time = new Date(i.time).getTime() / 1000
    //             if (time <= from || time > to) return
    //
    //             chartWidget.activeChart().createShape(
    //                 {
    //                     time,
    //                     // price: i.price,
    //                     channel: i.side === 'sell' ? 'high' : 'low',
    //                 },
    //                 {
    //                     shape: i.side === 'sell' ? 'arrow_down' : 'arrow_up',
    //                     overrides: {
    //                         fontsize: 10,
    //                     },
    //                 },
    //             )
    //         })
    //     } catch (e) {
    //
    //     }
    //
    //     // eslint-disable-next-line
    // }, [chartWidget, openOrders])

    useEffect(() => {
        if (!chartWidget) return

        const newOrderLines = { ...orderLines }
        const newOpenOrders = openOrders.filter((i) => i.orderStatus === 'submitted')

        newOpenOrders.map((order) => {
            if (orderLines[order.orderId]) {
                return
            }

            newOrderLines[order.orderId] = createOrderLine(
                `${order.side.toUpperCase()} LIMIT`,
                order.side === 'buy' ? '#03bb89' : '#ff595e',
                order.orderSize,
                order.orderPrice,
            )
        })

        const deletedOrderIds = Object.keys(newOrderLines).filter((newOrderItem) => !map(newOpenOrders, (i) => i.orderId).includes(Number(newOrderItem)))

        deletedOrderIds.map((item) => {
            newOrderLines[item].remove()
            delete newOrderLines[item]
        })

        setOrderLines(newOrderLines)

        // eslint-disable-next-line
    }, [openOrders, chartWidget])

    useEffect(() => {
        if (!publicWs.current || !publicWs.current.send) return

        if (publicWs.current.readyState === WebSocket.OPEN) {
            console.log(JSON.stringify({ sub: WS_TYPES.candles.replace('{symbol}', symbolValue).replace('{period}', chartInterval.houbiKlineValue) }))
            publicWs.current.send(JSON.stringify({ sub: WS_TYPES.candles.replace('{symbol}', symbolValue).replace('{period}', chartInterval.houbiKlineValue) }))
        }

        // eslint-disable-next-line
    }, [publicWs.current, publicWs.current.readyState])

    function createOrderLine(text, color, quantity, price) {
        return chartWidget.activeChart().createOrderLine()
            .setText(text)
            .setLineColor(color)
            .setQuantityBackgroundColor(color)
            .setBodyBorderColor(color)
            .setQuantityBorderColor(color)
            .setBodyBackgroundColor('#ffffff')
            .setBodyTextColor(color)
            .setLineWidth(2)
            .setQuantity(quantity)
            .setPrice(price)
    }

    const newDataFeed = {
        ...HuobiDatafeed,
        subscribeBars: (
            symbolInfo,
            resolution,
            onRealtimeCallback,
        ) => {
            chartRef.current.changeKlineData = (data) => {
                onRealtimeCallback({
                    time: data.id * 1000,
                    open: String(data.open),
                    high: String(data.high),
                    low: String(data.low),
                    close: String(data.close),
                })
            }
        },
    }

    useEffect(() => {
        wsCallbacksRef.current.changeKlineData = setKlineData

        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (chartRef.current.changeKlineData) chartRef.current.changeKlineData(klineData)
    }, [chartRef.current.changeKlineData, klineData])

    return (
        <TVChartContainer userId={user.email} datafeed={newDataFeed} symbol={symbol.label} setWidget={setChartWidget} interval={chartInterval.tradingViewKlineValue} />
    )
}

export default React.memo(HuobiChart)
