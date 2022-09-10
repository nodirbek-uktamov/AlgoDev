import React, { useContext, useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'
import map from 'lodash/map'
import reverse from 'lodash/reverse'
import { MainContext } from '../contexts/MainContext'
import { useGetRequest } from '../hooks/request'
import { PROXY_API, HUOBI_KLINES } from '../urls'
import { LOCAL_LOAD_INTERVAL } from '../constants'
import { WS_TYPES } from '../utils/websocket'

const darkTheme = {
    chart: {
        layout: {
            backgroundColor: '#111722',
            lineColor: '#2B2B43',
            textColor: '#D9D9D9',
        },
        watermark: {
            color: 'rgba(0, 0, 0, 0)',
        },
        crosshair: {
            color: '#758696',
        },
        grid: {
            vertLines: {
                color: '#2B2B43',
            },
            horzLines: {
                color: '#363C4E',
            },
        },
    },
}

function HuobiChart({ openOrders, chartInterval }) {
    const { symbol, symbolValue, publicWs, wsCallbacksRef } = useContext(MainContext)

    const timezoneDifference = new Date().getTimezoneOffset() * -60

    const [orderLines, setOrderLines] = useState({})

    const TRADING_VIEW_CHART_DIV = document.getElementById('TRADING_VIEW_CHART') || {}
    const chartRef = useRef({})
    const initialCandles = useGetRequest({ url: PROXY_API, params: { url: HUOBI_KLINES.replace('{symbol}', symbolValue).replace('{size}', 2000).replace('{period}', chartInterval.houbiKlineValue) } })
    // const ordersHistory = useLoad({ url: FTX_MARKET_ORDERS_HISTORY.replace('{symbol}', symbolValue) })

    useEffect(() => {
        wsCallbacksRef.current.changeKlineData = changeKlineData

        // eslint-disable-next-line
    }, [])

    function changeKlineData(data) {
        if (!chartRef.current.candlestickSeries) return

        chartRef.current.candlestickSeries.update({
            time: data.id + timezoneDifference,
            open: String(data.open),
            high: String(data.high),
            low: String(data.low),
            close: String(data.close),
        })
    }

    useEffect(() => {
        if (!TRADING_VIEW_CHART_DIV.offsetWidth) return

        if (!chartRef.current.chart) {
            chartRef.current.chart = createChart(
                TRADING_VIEW_CHART_DIV, {
                    width: TRADING_VIEW_CHART_DIV.offsetWidth,
                    height: TRADING_VIEW_CHART_DIV.offsetHeight,
                    timeScale: {
                        timeVisible: true,
                        secondsVisible: true,
                    },
                },
            )
        }

        chartRef.current.chart.applyOptions(darkTheme.chart)
    }, [TRADING_VIEW_CHART_DIV])

    useEffect(() => {
        if (!publicWs.current || !publicWs.current.send) return

        if (publicWs.current.readyState === WebSocket.OPEN) {
            publicWs.current.send(JSON.stringify({ sub: WS_TYPES.candles.replace('{symbol}', symbolValue).replace('{period}', chartInterval.houbiKlineValue) }))
        }

        // eslint-disable-next-line
    }, [publicWs.current, publicWs.current.readyState])

    useEffect(() => {
        if (chartRef.current.chart) {
            chartRef.current.chart.resize(TRADING_VIEW_CHART_DIV.offsetWidth, TRADING_VIEW_CHART_DIV.offsetHeight)
        }
    }, [TRADING_VIEW_CHART_DIV.offsetWidth, TRADING_VIEW_CHART_DIV.offsetHeight])

    useEffect(() => {
        if (!initialCandles.response || (initialCandles.response.data || []).length === 0) return

        const { chart } = chartRef.current

        if (!chartRef.current.candlestickSeries) {
            chartRef.current.candlestickSeries = chart.addCandlestickSeries()
        }

        const { candlestickSeries } = chartRef.current

        const candles = map(initialCandles.response.data || [], (i) => ({
            time: i.id + timezoneDifference,
            open: String(i.open),
            high: String(i.high),
            low: String(i.low),
            close: String(i.close),
        }))

        candlestickSeries.setData(reverse(candles))
        candlestickSeries.applyOptions({
            priceFormat: {
                type: 'price',
                precision: symbol.tpp,
                minMove: (0.1 ** symbol.tpp).toFixed(symbol.tpp),
            },
        })

        // eslint-disable-next-line
    }, [initialCandles.response, symbolValue])

    useEffect(() => {
        const { candlestickSeries } = chartRef.current

        if (candlestickSeries) candlestickSeries.setData([])
        initialCandles.request()
        // eslint-disable-next-line
    }, [chartInterval, symbolValue])

    useEffect(() => {
        const { candlestickSeries } = chartRef.current
        if (!candlestickSeries) return

        const newOrderLines = { ...orderLines }
        const newOpenOrders = openOrders.filter((i) => i.orderStatus === 'submitted')

        newOpenOrders.map((order) => {
            if (orderLines[order.orderId]) {
                return
            }

            newOrderLines[order.orderId] = candlestickSeries.createPriceLine({
                price: Number(order.orderPrice),
                color: order.side === 'buy' ? '#02C77A' : 'red',
                lineWidth: 2,
                // lineStyle: lightChart.LineStyle.solid,
                axisLabelVisible: true,
                title: `${String(order.orderSize)}  `,
            })
        })

        const deletedOrderIds = Object.keys(newOrderLines).filter((newOrderItem) => !map(newOpenOrders, (i) => i.orderId).includes(Number(newOrderItem)))

        deletedOrderIds.map((item) => {
            candlestickSeries.removePriceLine(newOrderLines[item])
            delete newOrderLines[item]
        })

        setOrderLines(newOrderLines)

        // eslint-disable-next-line
    }, [openOrders, chartRef.current.candlestickSeries])

    return (
        <div id="TRADING_VIEW_CHART" style={{ width: '100%', height: '100%' }} />
    )
}

export default React.memo(HuobiChart)
