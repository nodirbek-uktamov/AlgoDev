import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Formik } from 'formik'
import { useHistory } from 'react-router-dom'
import Chart from '../components/Chart'
import { parseGzip } from '../utils/websocket'
import TradeForm from '../components/TradeForm'
import { usePostRequest } from '../hooks/request'
import { TRADE } from '../urls'
import { signOut } from '../utils/auth'


export default function Main() {
    const ws = useRef(null)
    const [bestBidAsk, setBestBidAsk] = useState({})
    const [tradeType, setTradeType] = useState('limit')
    const [price, setPrice] = useState('')
    const history = useHistory()

    const trade = usePostRequest({ url: TRADE })

    const symbol = 'trxusdt'

    useEffect(() => {
        ws.current = new WebSocket('wss://api.huobi.pro/ws')
        ws.current.onopen = () => ws.current.send(JSON.stringify({ sub: `market.${symbol}.bbo` }))

        gettingData()
        return () => ws.current.close()
        // eslint-disable-next-line
    }, [])

    const gettingData = useCallback(() => {
        if (!ws.current) return

        ws.current.onmessage = (event) => {
            parseGzip(event, (d) => {
                if (d.ping) {
                    ws.current.send(JSON.stringify({ pong: d.ping }))
                    return
                }

                if (d.tick) {
                    setBestBidAsk(d.tick)
                }
            })
        }
    }, [])

    async function onBuy(data) {
        const { success, error } = await trade.request({ data: { ...data, type: tradeType, symbol, trade_type: 'buy' } })

        if (success) {
            alert('Success')
            return
        }

        alert(error && error.data.message)
    }

    async function onSell(data) {
        const { success, error } = await trade.request({ data: { ...data, type: tradeType, symbol, trade_type: 'sell' } })

        if (success) {
            alert('Success')
            return
        }

        alert(error && error.data.message)
    }

    function tabClass(tab) {
        return tradeType === tab ? 'is-active' : null
    }

    return (
        <div className="mx-5 pb-6">
            <span className="pointer is-size-5" onClick={() => signOut(history)}>Logout</span>
            <Chart symbol={symbol} />

            <div className="columns mt-3">
                <div onClick={() => setPrice(bestBidAsk.ask)} className="column is-narrow pointer">
                    ask: <span className="has-text-danger"> {bestBidAsk.ask}</span>
                </div>

                <div onClick={() => setPrice(bestBidAsk.bid)} className="column is-narrow pointer">
                    bid: <span className="has-text-success">{bestBidAsk.bid}</span>
                </div>
            </div>

            <div className="tabs">
                <ul>
                    <li onClick={() => setTradeType('limit')} className={tabClass('limit')}>
                        <a>Limit</a>
                    </li>

                    <li onClick={() => setTradeType('market')} className={tabClass('market')}>
                        <a>Market</a>
                    </li>
                </ul>
            </div>

            <div className="columns">
                <div className="column">
                    <Formik initialValues={{ price: '', quantity: '' }} onSubmit={onBuy}>
                        <TradeForm price={price} symbol="ETH" tradeType={tradeType} />
                    </Formik>
                </div>

                <div className="column">
                    <Formik initialValues={{ price: '', quantity: '' }} onSubmit={onSell}>
                        <TradeForm price={price} symbol="ETH" sell tradeType={tradeType} />
                    </Formik>
                </div>
            </div>
        </div>
    )
}
