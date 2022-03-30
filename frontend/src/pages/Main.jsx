import React, { createContext, useState } from 'react'
import { Formik } from 'formik'
import { useHistory } from 'react-router-dom'
import Chart from '../components/Chart'
import TradeForm from '../components/TradeForm'
import { useLoad, usePostRequest, usePutRequest } from '../hooks/request'
import { CANCEL_TRADES, TRADE } from '../urls'
import { signOut } from '../utils/auth'
import Button from '../components/common/Button'
import Logs from '../components/Logs'
import { Context } from '../components/common/BaseContext'

export const MainContext = createContext({})

export default function Main() {
    const [tradeType, setTradeType] = useState('limit')
    const history = useHistory()
    const initialSymbol = localStorage.getItem('symbol')
    const [symbol, setSymbol] = useState(initialSymbol ? JSON.parse(initialSymbol) : { value: 'ETHUSDT', pair1: 'ETH', pair2: 'USDT' })
    const createTrade = usePostRequest({ url: TRADE })
    const trades = useLoad({ url: TRADE })
    const cancelTrades = usePutRequest()

    async function onSubmit(data) {
        const newData = {
            ...data,
            symbol: symbol.value,
            trade_type: tradeType,
            twap_bot_duration: data.twap_bot_duration * 60,
            iceberg_price: data.iceberg_price || 0,
        }

        if (data.botType === 'iceberg') {
            newData.iceberg = true
        }
        if (data.botType === 'mm') {
            newData.iceberg = true
            newData.market_making = true
        }

        if (data.botType === 'twap') {
            newData.twap_bot = true
        }

        const { success, error } = await createTrade.request({ data: newData })

        if (success) {
            trades.request()
            return
        }

        alert(error && error.data.message)
    }

    const tradeInitialValues = {
        quantity: '',
        loop: true,
        time_interval: 120,
        iceberg: false,
        icebergs_count: 0,
        twap_bot: false,
        twap_bot_duration: 0,
        iceberg_price: '',
    }

    async function cancelAllTrades() {
        const { success } = await cancelTrades.request({ url: CANCEL_TRADES })

        if (success) {
            trades.setResponse([])
        }
    }

    return (
        <Context.Provider value={{ }}>
            <div className="mx-5 pb-6 mt-1">
                <div className="columns mb-4 mt-2">
                    <div className="column" />

                    <div className="column is-narrow" style={{ width: 200 }}>
                        {(trades.response && trades.response.length > 0) && (
                            <Button text="Cancel all orders" className="is-danger" onClick={cancelAllTrades} />
                        )}
                    </div>

                    <div className="column is-narrow" style={{ width: 200 }}>
                        <Button
                            className="pointer is-info"
                            onClick={() => signOut(history)}
                            text="Logout" />
                    </div>
                </div>

                <div className="columns">
                    <div className="column is-narrow">
                        <Formik initialValues={tradeInitialValues} onSubmit={onSubmit}>
                            <TradeForm symbol={symbol} setTradeType={setTradeType} tradeType={tradeType} />
                        </Formik>
                    </div>

                    <div className="column is-narrow mr-6" style={{ width: 600 }}>
                        <Chart trades={trades} symbol={symbol.value.toLowerCase()} setSymbol={setSymbol} />
                    </div>

                    <div className="column">
                        <Logs trades={trades} />
                    </div>
                </div>
            </div>
        </Context.Provider>
    )
}
