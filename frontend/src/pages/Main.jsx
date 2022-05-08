import React, {useCallback, useState} from 'react'
import {useHistory} from 'react-router-dom'
import Chart from '../components/Chart'
import TradeForm from '../components/TradeForm'
import {useLoad, usePutRequest} from '../hooks/request'
import {CANCEL_TRADES, TRADE} from '../urls'
import {signOut} from '../utils/auth'
import {Button} from '../components/common/Button'
import Logs from '../components/Logs'
import OrdersTabs from '../components/OrdersTabs'
import MainContextWrapper from "../contexts/MainContext";


export default function Main() {
    const history = useHistory()
    const trades = useLoad({url: TRADE})
    const cancelTrades = usePutRequest()

    const [botPrices, setBotPrices] = useState({})

    async function cancelAllTrades() {
        const {success} = await cancelTrades.request({url: CANCEL_TRADES})

        if (success) {
            trades.setResponse([])
        }
    }

    const onUpdate = useCallback(trades.request, [])

    return (
        <MainContextWrapper>
            <div className="mx-5 pb-6 mt-1">
                <div className="columns mb-4 mt-2">
                    <div className="column"/>

                    <div className="column is-narrow" style={{width: 200}}>
                        <Button text={'Cancel all orders'} onClick={cancelAllTrades}/>
                    </div>

                    <div className="column is-narrow" style={{width: 200}}>
                        <Button
                            color={'white'}
                            text={'Log out'}
                            onClick={() => signOut(history)}
                        />
                    </div>
                </div>

                <div className="columns">
                    <div className="column is-narrow" style={{width: 320}}>
                        <TradeForm onUpdate={onUpdate}/>

                        <Logs setBotPrices={setBotPrices} trades={trades}/>
                    </div>

                    <div className="column mr-4" style={{minWidth: 670}}>
                        <Chart
                            trades={trades}/>
                    </div>

                    <div className="column is-narrow">
                        <OrdersTabs botPrices={botPrices}/>
                    </div>
                </div>
            </div>
        </MainContextWrapper>
    )
}
