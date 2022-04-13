import React, { useState, Fragment, useEffect, useRef } from 'react'
import { Form, useFormikContext } from 'formik'
import Input from './common/Input'
import { required } from '../utils/validators'
import Button from './common/Button'
import Checkbox from './common/Checkbox'
import { useGetRequest } from '../hooks/request'
import { BALANCE } from '../urls'


export default React.memo(({ setTradeType, symbol }) => {
    const balanceParams = useGetRequest({ url: BALANCE })
    const { values, setFieldValue } = useFormikContext()
    const [botType, setBotType] = useState('chase_bot')
    const ws = useRef(null)
    const [balance, setBalance] = useState({})
    const user = JSON.parse(localStorage.getItem('user'))

    useEffect(() => {
        initialConnection()
        // eslint-disable-next-line
    }, [])

    async function initialConnection() {
        const { response, success } = await balanceParams.request()
        if (!success) return

        ws.current = new WebSocket(response.url)
        ws.current.onopen = () => connect(response.params)
        ws.current.onclose = initialConnection
        ws.current.addEventListener('message', handleMessage)
    }

    function handleMessage(event) {
        const data = JSON.parse(event.data)

        if (data.code === 200 && data.ch === 'auth') {
            ws.current.send(JSON.stringify({
                action: 'sub',
                ch: 'accounts.update#2',
            }))
        }

        if (data.action === 'ping') {
            ws.current.send(JSON.stringify({ action: 'pong', data: { ts: data.data.ts } }))
        }

        if (data.action === 'push' && data.data.accountId === user.spotAccountId) {
            setBalance((oldBalance) => ({ ...oldBalance, [data.data.currency]: Number(data.data.available).toFixed(8) }))
        }
    }

    function connect(params) {
        ws.current.send(JSON.stringify({
            action: 'req',
            ch: 'auth',
            params,
        }))
    }

    function changeTab(tab) {
        setBotType(tab)
        setFieldValue('botType', tab)
    }

    return (
        <Form>
            <div className="tabs">
                <ul>
                    <li onClick={() => changeTab('chase_bot')} className={botType === 'chase_bot' ? 'is-active' : null}>
                        <p>Chase bot</p>
                    </li>

                    <li onClick={() => changeTab('iceberg')} className={botType === 'iceberg' ? 'is-active' : null}>
                        <p>Iceberg</p>
                    </li>

                    <li onClick={() => changeTab('mm')} className={botType === 'mm' ? 'is-active' : null}>
                        <p>MM</p>
                    </li>

                    <li onClick={() => changeTab('twap')} className={botType === 'twap' ? 'is-active' : null}>
                        <p>Twap</p>
                    </li>

                    <li onClick={() => changeTab('grid')} className={botType === 'grid' ? 'is-active' : null}>
                        <p>Grid</p>
                    </li>
                </ul>
            </div>

            <div className="columns">
                <div className="column">{(balance[symbol.pair2.toLowerCase()] || 0)} {symbol.pair2}</div>
                <div className="column">{(balance[symbol.pair1.toLowerCase()] || 0)} {symbol.pair1}</div>
            </div>

            <Input
                name="quantity"
                step="0.00000001"
                type="number"
                label={`Amount (${botType !== 'twap' ? symbol.pair1 : `buy: ${symbol.pair2}, sell: ${symbol.pair1}`})`}
                validate={required} />

            {botType === 'iceberg' || botType === 'mm' ? (
                <Fragment>
                    <Input
                        validate={required}
                        name="icebergs_count"
                        type="number"
                        label="Icebergs count" />

                    {botType === 'iceberg' && (
                        <Input
                            name="iceberg_price"
                            step="0.00000001"
                            type="number"
                            label="Price"
                            validate={required} />
                    )}

                    <Checkbox name="take_profit" label="TakeProfit" />

                    {values.take_profit && (
                        <Input
                            name="take_profit_percent"
                            step="0.1"
                            type="number"
                            label="Take profit percent (%)"
                            validate={required} />
                    ) }
                </Fragment>
            ) : null}

            {botType !== 'twap' && botType !== 'grid' && <Checkbox name="loop" label="Is loop" />}

            {values.loop && botType !== 'twap' && botType !== 'grid' ? (
                <Input
                    validate={required}
                    name="time_interval"
                    type="number"
                    label="Interval" />
            ) : null}

            {botType === 'twap' ? (
                <Fragment>
                    <Input
                        validate={required}
                        name="twap_bot_duration"
                        type="number"
                        label="Duration (minutes)" />

                    <p className="is-7 mb-2 is-italic">{(values.quantity || 0) / (values.twap_bot_duration || 1)} every minute</p>
                </Fragment>
            ) : null}

            {botType === 'grid' ? (
                <Fragment>
                    <Input
                        validate={required}
                        name="grid_trades_count"
                        type="number"
                        label="Trades count" />

                    <Input
                        name="grid_start_price"
                        step="0.00000001"
                        type="number"
                        label="Start price"
                        validate={required} />

                    <Input
                        name="grid_end_price"
                        step="0.00000001"
                        type="number"
                        label="End price"
                        validate={required} />
                </Fragment>
            ) : null}


            <div className="is-flex">
                <Button onClick={() => setTradeType('buy')} type="submit" className="is-success" text="Long start" />

                <Button
                    onClick={() => setTradeType('sell')}
                    type="submit"
                    className="is-danger ml-1"
                    text="Short start" />
            </div>
        </Form>
    )
})
