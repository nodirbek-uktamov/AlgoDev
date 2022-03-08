import React, { useState } from 'react'
import { Formik } from 'formik'
import { useHistory } from 'react-router-dom'
import Chart from '../components/Chart'
import TradeForm from '../components/TradeForm'
import { usePostRequest } from '../hooks/request'
import { TRADE } from '../urls'
import { signOut } from '../utils/auth'
import Orders from '../components/Orders'


export default function Main() {
    const [tradeType, setTradeType] = useState('limit')
    const [price, setPrice] = useState('')
    const history = useHistory()
    const [symbol, setSymbol] = useState('ethusdt')
    const trade = usePostRequest({ url: TRADE })

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

    function onSubmit() {
        console.log('asd')
    }

    return (
        <div className="mx-5 pb-6">
            <p className="pointer is-size-5 my-3" onClick={() => signOut(history)}>Logout</p>

            <div className="columns">
                <div className="column is-narrow">
                    <Formik initialValues={{ quantity: '' }} onSubmit={onSubmit}>
                        <TradeForm tradeType={tradeType} />
                    </Formik>
                </div>

                <div className="column">
                    <Chart setPrice={setPrice} symbol={symbol} setSymbol={setSymbol} />
                    <Orders symbol={symbol} />
                </div>

                <div style={{ width: 200 }} className="column is-narrow">
                    asd
                </div>
            </div>
        </div>
    )
}
