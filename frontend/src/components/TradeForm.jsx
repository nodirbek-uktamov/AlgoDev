import React, { useState, Fragment, useEffect, useRef } from 'react'
import { Form, useFormikContext } from 'formik'
import Input from './common/Input'
import { required } from '../utils/validators'
import Button from './common/Button'
import Checkbox from './common/Checkbox'
import { useLoad } from '../hooks/request'
import { BALANCE } from '../urls'


export default React.memo(({ setTradeType, symbol }) => {
    const balanceParams = useLoad({ url: BALANCE })
    const { values, setFieldValue } = useFormikContext()
    const [botType, setBotType] = useState('chase_bot')
    const ws = useRef(null)
    const [balance, setBalance] = useState({})
    const user = JSON.parse(localStorage.getItem('user'))

    useEffect(() => {
        if (balanceParams.response && !ws.current) {
            ws.current = new WebSocket(balanceParams.response.url)
            ws.current.onopen = () => connect(balanceParams.response.params)

            ws.current.addEventListener('message', (event) => {
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
            })

            return () => {
                ws.current.close()
            }
        }

        // eslint-disable-next-line
    }, [balanceParams.response])

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
                </ul>
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

            {botType !== 'twap' && <Checkbox name="loop" label="Is loop" />}

            {values.loop && botType !== 'twap' ? (
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

            <div className="columns">
                <div className="column">{(balance[symbol.pair2.toLowerCase()] || 0)} {symbol.pair2}</div>
                <div className="column">{(balance[symbol.pair1.toLowerCase()] || 0)} {symbol.pair1}</div>
            </div>

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
