import React, { useContext, useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'
import map from 'lodash/map'
import { MainContext } from '../contexts/MainContext'
import { useGetRequest, useLoad } from '../hooks/request'
import { PROXY_API } from '../urls'
import { LOCAL_LOAD_INTERVAL } from '../constants'

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

function FTXChart({ openOrders, chartInterval }) {
    const { symbol, symbolValue } = useContext(MainContext)

    const timezoneDifference = new Date().getTimezoneOffset() * -60

    const [orderLines, setOrderLines] = useState({})

    const TRADING_VIEW_CHART_DIV = document.getElementById('TRADING_VIEW_CHART') || {}
    const chartRef = useRef({})
    const initialCandles = useGetRequest({ url: PROXY_API, params: { url: `https://ftx.com/api/markets/${symbolValue}/candles?resolution=${chartInterval.valueInSeconds}` } })
    const getLastCandle = useGetRequest({ url: PROXY_API, params: { url: `https://ftx.com/api/markets/${symbolValue}/candles/last?resolution=${chartInterval.valueInSeconds}` } })
    // const ordersHistory = useLoad({ url: FTX_MARKET_ORDERS_HISTORY.replace('{symbol}', symbolValue) })

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
        if (chartRef.current.chart) {
            chartRef.current.chart.resize(TRADING_VIEW_CHART_DIV.offsetWidth, TRADING_VIEW_CHART_DIV.offsetHeight)
        }
    }, [TRADING_VIEW_CHART_DIV.offsetWidth, TRADING_VIEW_CHART_DIV.offsetHeight])

    useEffect(() => {
        if (!initialCandles.response || (initialCandles.response.result || []).length === 0) return

        const { chart } = chartRef.current

        if (!chartRef.current.candlestickSeries) {
            chartRef.current.candlestickSeries = chart.addCandlestickSeries()
        }

        const { candlestickSeries } = chartRef.current

        const candles = map(initialCandles.response.result || [], (i) => {
            delete i.startTime
            return { ...i, time: Math.floor(i.time / 1000) + timezoneDifference }
        })

        candlestickSeries.setData(candles)
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
        const interval = setInterval(() => {
            getLastCandle.request().then(({ response }) => {
                if (response.success && chartRef.current.candlestickSeries) {
                    chartRef.current.candlestickSeries.update({ ...response.result, time: response.result.time / 1000 + timezoneDifference })
                }
            })
        }, window.location.hostname === 'localhost' ? LOCAL_LOAD_INTERVAL : 1000)

        initialCandles.request()

        return () => clearInterval(interval)
        // eslint-disable-next-line
    }, [chartInterval, symbolValue])

    // useEffect(() => {
    //     const interval = setInterval(ordersHistory.request, 10000)
    //     return () => clearInterval(interval)
    //     // eslint-disable-next-line
    // }, [symbolValue])

    // useEffect(() => {
    //     console.log(chartInterval.valueInSeconds)
    //     const { candlestickSeries } = chartRef.current
    //
    //     if (!candlestickSeries) return
    //
    //     const data = map(ordersHistory.response, (i) => ({
    //         time: Math.floor((new Date(i.createdAt).getTime() / 1000 + timezoneDifference) / chartInterval.valueInSeconds) * chartInterval.valueInSeconds,
    //         position: i.side === 'sell' ? 'aboveBar' : 'belowBar',
    //         color: i.side === 'sell' ? '#ef5350' : '#26a59a',
    //         shape: 'circle',
    //         size: 1,
    //         id: i.id,
    //     }))
    //
    //     console.log('data: ', data)
    //
    //     candlestickSeries.setMarkers(data)
    //
    //     // eslint-disable-next-line
    // }, [chartInterval.valueInSeconds, ordersHistory.response])

    useEffect(() => {
        const { candlestickSeries } = chartRef.current
        if (!candlestickSeries) return

        const newOrderLines = { ...orderLines }

        openOrders.map((order) => {
            if (orderLines[order.id]) {
                return
            }

            newOrderLines[order.id] = candlestickSeries.createPriceLine({
                price: order.orderPrice,
                color: order.side === 'buy' ? '#02C77A' : 'red',
                lineWidth: 2,
                // lineStyle: lightChart.LineStyle.solid,
                axisLabelVisible: true,
                title: `${String(order.size)}  `,
            })
        })

        const deletedOrderIds = Object.keys(newOrderLines).filter((newOrderItem) => !map(openOrders, (i) => i.id).includes(Number(newOrderItem)))

        deletedOrderIds.map((item) => {
            candlestickSeries.removePriceLine(newOrderLines[item])
            delete newOrderLines[item]
        })

        setOrderLines(newOrderLines)

        // eslint-disable-next-line
    }, [openOrders])

    return (
        <div id="TRADING_VIEW_CHART" style={{ width: '100%', height: '100%' }} />
    )
}

export default React.memo(FTXChart)
