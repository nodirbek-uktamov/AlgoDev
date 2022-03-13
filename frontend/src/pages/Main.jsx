import React, { useState } from 'react'
import { Formik } from 'formik'
import { useHistory } from 'react-router-dom'
import Chart from '../components/Chart'
import TradeForm from '../components/TradeForm'
import { useLoad, usePostRequest } from '../hooks/request'
import { TRADE } from '../urls'
import { signOut } from '../utils/auth'
import Orders from '../components/Orders'
import Button from '../components/common/Button'
import TradesList from '../components/TradesList'
import Logs from '../components/Logs'


export default function Main() {
    const [tradeType, setTradeType] = useState('limit')
    const history = useHistory()
    const [symbol, setSymbol] = useState(localStorage.getItem('symbol') || 'trxusdt')
    const createTrade = usePostRequest({ url: TRADE })
    const trades = useLoad({ url: TRADE })

    async function onSubmit(data) {
        const { success, error } = await createTrade.request({ data: { ...data, symbol, trade_type: tradeType } })

        if (success) {
            trades.request()
            return
        }

        alert(error && error.data.message)
    }

    return (
        <div className="mx-5 pb-6 mt-1">
            <div style={{ width: 100 }}>
                <Button
                    className="pointer my-3 is-info"
                    onClick={() => signOut(history)}
                    text="Logout" />
            </div>

            <div className="columns">
                <div className="column is-narrow">
                    <Formik initialValues={{ quantity: '', loop: true, time_interval: 120 }} onSubmit={onSubmit}>
                        <TradeForm setTradeType={setTradeType} tradeType={tradeType} />
                    </Formik>
                </div>

                <div className="column">
                    <Chart symbol={symbol} setSymbol={setSymbol} />
                    <TradesList onCancel={trades.request} trades={trades.response || []} />
                    <Orders symbol={symbol} />
                </div>

                <div style={{ width: 300 }} className="column is-narrow">
                    <Logs />
                </div>
            </div>
        </div>
    )
}
