import React, { useState, Fragment, useEffect, useRef } from 'react'
import { Form, useFormikContext } from 'formik'
import cn from 'classnames'
import Input from './common/Input'
import { required } from '../utils/validators'
import Button from './common/Button'
import Checkbox from './common/Checkbox'
import { useGetRequest } from '../hooks/request'
import { BALANCE } from '../urls'


const botTypes = {
    chase_bot: 'Chase bot',
    iceberg: 'Iceberg',
    mm: 'MM',
    twap: 'Twap',
    grid: 'Grid',
    hft: 'HFT',
}


export default React.memo(({ setTradeType, symbol, symbolSettings }) => {
    const balanceParams = useGetRequest({ url: BALANCE })
    const { values, setFieldValue } = useFormikContext()
    const [botType, setBotType] = useState('chase_bot')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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
            setBalance((oldBalance) => ({ ...oldBalance, [data.data.currency]: Number(data.data.available) }))
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
        setIsDropdownOpen(false)
        setFieldValue('botType', tab)
    }

    return (
        <Form>
            <div className={cn('dropdown mb-3', { 'is-active': isDropdownOpen })} style={{ width: '100%' }}>
                <div className="dropdown-trigger" style={{ width: '100%' }}>
                    <Button text={botTypes[botType]} onClick={() => setIsDropdownOpen(!isDropdownOpen)} />
                </div>

                <div className="dropdown-menu" style={{ width: '100%' }}>
                    <div className="dropdown-content" style={{ width: '100%' }}>
                        <a
                            className={cn('dropdown-item', { 'is-active': botType === 'chase_bot' })}
                            onClick={() => changeTab('chase_bot')}>
                            {botTypes.chase_bot}
                        </a>

                        <a
                            className={cn('dropdown-item', { 'is-active': botType === 'iceberg' })}
                            onClick={() => changeTab('iceberg')}>
                            {botTypes.iceberg}
                        </a>

                        <a
                            className={cn('dropdown-item', { 'is-active': botType === 'mm' })}
                            onClick={() => changeTab('mm')}>
                            {botTypes.mm}
                        </a>

                        <a
                            className={cn('dropdown-item', { 'is-active': botType === 'twap' })}
                            onClick={() => changeTab('twap')}>
                            {botTypes.twap}
                        </a>

                        <a
                            className={cn('dropdown-item', { 'is-active': botType === 'grid' })}
                            onClick={() => changeTab('grid')}>
                            {botTypes.grid}
                        </a>

                        <a
                            className={cn('dropdown-item', { 'is-active': botType === 'hft' })}
                            onClick={() => changeTab('hft')}>
                            {botTypes.hft}
                        </a>
                    </div>
                </div>
            </div>

            <div className="columns mb-0">
                <div className="column pr-0">
                    {(balance[symbol.pair2.toLowerCase()] || 0).toFixed(symbolSettings.ttp)} {symbol.pair2}
                </div>

                <div className="column is-narrow">
                    {(balance[symbol.pair1.toLowerCase()] || 0).toFixed(symbolSettings.tap)} {symbol.pair1}
                </div>
            </div>

            <Input
                name="quantity"
                step="0.00000001"
                type="number"
                label={`Amount (${symbol.pair2 === 'USDT' ? symbol.pair2 : botType !== 'twap' ? symbol.pair1 : `buy: ${symbol.pair2}, sell: ${symbol.pair1}`})`}
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

            {botType !== 'twap' && botType !== 'grid' && botType !== 'hft' && <Checkbox name="loop" label="Is loop" />}

            {values.loop && botType !== 'twap' && botType !== 'grid' && botType !== 'hft' ? (
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

            {botType === 'hft' ? (
                <Fragment>
                    <div className="columns mb-0">
                        <div className="column">
                            <Input
                                name="hft_default_price_difference"
                                validate={required}
                                step="0.1"
                                type="number"
                                label="Initial difference" />
                        </div>

                        <div className="column">
                            <Input
                                name="hft_orders_price_difference"
                                step="0.1"
                                type="number"
                                label="Orders difference"
                                validate={required} />
                        </div>
                    </div>

                    <Input
                        validate={required}
                        name="hft_orders_on_each_side"
                        type="number"
                        label="Orders on each side" />

                    <Button type="submit" className="is-primary" text="Create" />

                    <p className="is-7 my-2 is-italic">
                        {values.hft_orders_on_each_side} buy orders<br />
                        {values.hft_orders_on_each_side} sell orders<br />
                    </p>

                </Fragment>
            ) : null}

            {botType !== 'hft' ? (
                <div className="is-flex">
                    <Button onClick={() => setTradeType('buy')} type="submit" className="is-success" text="Long start" />

                    <Button
                        onClick={() => setTradeType('sell')}
                        type="submit"
                        className="is-danger ml-1"
                        text="Short start" />
                </div>
            ) : null}
        </Form>
    )
})
