import React, { useContext, useEffect, useState } from 'react'
import map from 'lodash/map'
import { MainContext } from '../contexts/MainContext'
import { TVChartContainer } from './TVChartContainer'
import FTXDatafeed from '../utils/datafeeds/ftx'
import { FTX_CANCEL_ORDER, FTX_MODIFY_ORDER } from '../urls'
import { usePostRequest } from '../hooks/request'

function FTXChart({ openOrders, chartInterval, onChangeInterval, onChangeSymbol, symbolsList }) {
    const { symbolValue, user } = useContext(MainContext)
    const [orderLines, setOrderLines] = useState({})
    const [chartWidget, setChartWidget] = useState(null)
    const cancelOrder = usePostRequest()
    const modifyOrder = usePostRequest()

    // const ordersHistory = useGetRequest({ url: FTX_FILLS_LIST })

    // useEffect(() => {
    //     if (!chartWidget) return
    //
    //     try {
    //         chartWidget.activeChart().removeAllShapes()
    //         const {
    //             from,
    //             to,
    //         } = chartWidget.activeChart().getVisibleRange()
    //
    //         map(ordersHistory.response || [], (i) => {
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
    // }, [chartInterval.valueInSeconds, ordersHistory.response, chartWidget])

    // useEffect(() => {
    //     if (!chartWidget) return
    //
    //     ordersHistory.request({ params: { market: symbolValue } })
    //
    //     const interval = setInterval(() => {
    //         if (!chartWidget) return
    //         const {
    //             from,
    //             to,
    //         } = chartWidget.activeChart().getVisibleRange()
    //
    //         ordersHistory.request({
    //             params: {
    //                 market: symbolValue,
    //                 start_time: from,
    //                 end_time: to,
    //             },
    //         })
    //     }, 5000)
    //
    //     return () => clearInterval(interval)
    //
    //     // eslint-disable-next-line
    // }, [chartWidget, symbolValue, chartInterval])

    useEffect(() => {
        if (!chartWidget) return

        const newOrderLines = { ...orderLines }

        openOrders.map((order) => {
            if (orderLines[order.id]) {
                return
            }

            newOrderLines[order.id] = createOrderLine(
                `${order.side.toUpperCase()} LIMIT`,
                order.side === 'buy' ? '#03bb89' : '#ff595e',
                order.size,
                order.orderPrice,
                order.id,
            )
        })

        const deletedOrderIds = Object.keys(newOrderLines).filter((newOrderItem) => !map(openOrders, (i) => i.id).includes(Number(newOrderItem)))

        deletedOrderIds.map((item) => {
            newOrderLines[item].remove()
            delete newOrderLines[item]
        })

        setOrderLines(newOrderLines)

        // eslint-disable-next-line
    }, [openOrders, chartWidget])

    function createOrderLine(text, color, quantity, price, orderId) {
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
            .onCancel(() => {
                cancelOrder.request({ url: FTX_CANCEL_ORDER.replace('{id}', orderId) })
            })
            .onMove(function () {
                const newData = {
                    // eslint-disable-next-line react/no-this-in-sfc
                    price: this.getPrice(),
                    size: quantity,
                }

                modifyOrder.request({ url: FTX_MODIFY_ORDER.replace('{id}', orderId), data: newData })
            })
    }

    return (
        <TVChartContainer
            onChangeInterval={onChangeInterval}
            onChangeSymbol={onChangeSymbol}
            symbolsList={symbolsList}
            userId={`ftx${user.email}${user.id}`} // DON'T CHANGE, DATA OF SAVED CHARTS WILL LOST
            datafeed={FTXDatafeed}
            symbol={symbolValue.toUpperCase()}
            setWidget={setChartWidget}
            interval={chartInterval.tradingViewKlineValue} />
    )
}

export default React.memo(FTXChart)
