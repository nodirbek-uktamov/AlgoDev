import React, {useState, Fragment, useEffect, useRef, useContext} from 'react'
import { Form, Formik } from 'formik'
import cn from 'classnames'
import Input from './common/Input'
import { required } from '../utils/validators'
import Button from './common/Button'
import Checkbox from './common/Checkbox'
import {usePostRequest} from '../hooks/request'
import { TRADE} from '../urls'
import {MainContext} from "../contexts/MainContext";


const botTypes = {
    chase_bot: 'Chase bot',
    iceberg: 'Iceberg',
    mm: 'MM',
    twap: 'Twap',
    grid: 'Grid',
    hft: 'HFT',
}

const formValues = JSON.parse(localStorage.getItem('savedForms') || '{}')

const tradeInitialValues = {
    quantity: '',
    loop: true,
    time_interval: 120,
    iceberg: false,
    icebergs_count: 0,
    twap_bot: false,
    twap_bot_duration: 0,
    iceberg_price: '',
    hft_orders_on_each_side: 0,
    hft_orders_price_difference: 0,
    hft_default_price_difference: 0,
}

export default React.memo(({onUpdate}) => {
    const createTrade = usePostRequest({ url: TRADE })
    const { symbol, symbolSettings, wsCallbacksRef, price } = useContext(MainContext)

    const [botType, setBotType] = useState('chase_bot')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [balance, setBalance] = useState({})

    const [tradeType, setTradeType] = useState('buy')

    function changeTab(tab) {
        setBotType(tab)
        setIsDropdownOpen(false)
    }

    useEffect(() => {
        wsCallbacksRef.current.setBalance = setBalance
    }, [])

    async function onSubmit(data) {
        localStorage.setItem('savedForms', JSON.stringify({ ...formValues, [symbol.value]: data }))

        const newData = {
            ...data,
            symbol: symbol.value,
            trade_type: tradeType,
            twap_bot_duration: data.twap_bot_duration * 60,
            iceberg_price: data.iceberg_price || 0,
        }

        if (botType === 'iceberg') {
            newData.iceberg = true
        }

        if (botType === 'mm') {
            newData.iceberg = true
            newData.market_making = true
        }

        if (botType === 'twap') {
            newData.twap_bot = true
        }

        if (botType === 'grid') {
            newData.grid_bot = true
        }

        if (botType === 'hft') {
            newData.hft_bot = true
        }

        const { success, error } = await createTrade.request({ data: newData })

        if (success) {
            onUpdate()
            return
        }

        alert(error && error.data.message)
    }

    const initialPrice = price[symbol.value.toLowerCase()] ? price[symbol.value.toLowerCase()].ask : null

    function calcPair1Amount(values) {
        let amount = values.quantity

        if (botType === 'iceberg') {
            amount = values.iceberg_price ? amount / values.iceberg_price : 0
        }

        else {
            amount = amount / initialPrice
        }

        return amount.toFixed(symbolSettings.tap || 0)
    }

    return (
        <Formik initialValues={{...tradeInitialValues, ...formValues[symbol.value]}} onSubmit={onSubmit}>
            {({values}) => (
                <Form>
                    <div className={cn('dropdown mb-3', {'is-active': isDropdownOpen})} style={{width: '100%'}}>
                        <div className="dropdown-trigger" style={{width: '100%'}}>
                            <Button text={botTypes[botType]} onClick={() => setIsDropdownOpen(!isDropdownOpen)}/>
                        </div>

                        <div className="dropdown-menu" style={{width: '100%'}}>
                            <div className="dropdown-content" style={{width: '100%'}}>
                                <a
                                    className={cn('dropdown-item', {'is-active': botType === 'chase_bot'})}
                                    onClick={() => changeTab('chase_bot')}>
                                    {botTypes.chase_bot}
                                </a>

                                <a
                                    className={cn('dropdown-item', {'is-active': botType === 'iceberg'})}
                                    onClick={() => changeTab('iceberg')}>
                                    {botTypes.iceberg}
                                </a>

                                <a
                                    className={cn('dropdown-item', {'is-active': botType === 'mm'})}
                                    onClick={() => changeTab('mm')}>
                                    {botTypes.mm}
                                </a>

                                <a
                                    className={cn('dropdown-item', {'is-active': botType === 'twap'})}
                                    onClick={() => changeTab('twap')}>
                                    {botTypes.twap}
                                </a>

                                <a
                                    className={cn('dropdown-item', {'is-active': botType === 'grid'})}
                                    onClick={() => changeTab('grid')}>
                                    {botTypes.grid}
                                </a>

                                <a
                                    className={cn('dropdown-item', {'is-active': botType === 'hft'})}
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

                    <div className="columns m-0 p-0 mb-2">
                        <div className="column m-0 p-0">
                            <Input
                                name="quantity"
                                step="0.00000001"
                                type="number"
                                label={`Amount (${symbol.pair2})`}
                                validate={required}/>
                        </div>

                        <div className="column m-0 p-0 pt-7">
                            {initialPrice ? calcPair1Amount(values) : '—'} {symbol.pair1}
                        </div>
                    </div>

                    {botType === 'iceberg' || botType === 'mm' ? (
                        <Fragment>
                            <Input
                                validate={required}
                                name="icebergs_count"
                                type="number"
                                label="Icebergs count"/>

                            {botType === 'iceberg' && (
                                <Input
                                    name="iceberg_price"
                                    step="0.00000001"
                                    type="number"
                                    label="Price"
                                    validate={required}/>
                            )}

                            <Checkbox name="take_profit" label="TakeProfit"/>

                            {values.take_profit && (
                                <Input
                                    name="take_profit_percent"
                                    step="0.1"
                                    type="number"
                                    label="Take profit percent (%)"
                                    validate={required}/>
                            )}
                        </Fragment>
                    ) : null}

                    {botType !== 'twap' && botType !== 'grid' && botType !== 'hft' &&
                        <Checkbox name="loop" label="Is loop"/>}

                    {values.loop && botType !== 'twap' && botType !== 'grid' && botType !== 'hft' ? (
                        <Input
                            validate={required}
                            name="time_interval"
                            type="number"
                            label="Interval"/>
                    ) : null}

                    {botType === 'twap' ? (
                        <Fragment>
                            <Input
                                validate={required}
                                name="twap_bot_duration"
                                type="number"
                                label="Duration (minutes)"/>

                            <p className="is-7 mb-2 is-italic">{(values.quantity || 0) / (values.twap_bot_duration || 1)} every
                                minute</p>
                        </Fragment>
                    ) : null}

                    {botType === 'grid' ? (
                        <Fragment>
                            <Input
                                validate={required}
                                name="grid_trades_count"
                                type="number"
                                label="Trades count"/>

                            <Input
                                name="grid_start_price"
                                step="0.00000001"
                                type="number"
                                label="Start price"
                                validate={required}/>

                            <Input
                                name="grid_end_price"
                                step="0.00000001"
                                type="number"
                                label="End price"
                                validate={required}/>
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
                                        label="Initial difference"/>
                                </div>

                                <div className="column">
                                    <Input
                                        name="hft_orders_price_difference"
                                        step="0.1"
                                        type="number"
                                        label="Orders difference"
                                        validate={required}/>
                                </div>
                            </div>

                            <Input
                                validate={required}
                                name="hft_orders_on_each_side"
                                type="number"
                                label="Orders on each side"/>

                            <Button type="submit" className="is-primary" text="Create"/>

                            <p className="is-7 my-2 is-italic">
                                {values.hft_orders_on_each_side} buy orders<br/>
                                {values.hft_orders_on_each_side} sell orders<br/>
                            </p>

                        </Fragment>
                    ) : null}

                    {botType !== 'hft' ? (
                        <div className="is-flex">
                            <Button onClick={() => setTradeType('buy')} type="submit" className="is-success"
                                    text="Long start"/>

                            <Button
                                onClick={() => setTradeType('sell')}
                                type="submit"
                                className="is-danger ml-1"
                                text="Short start"/>
                        </div>
                    ) : null}
                </Form>
            )}
        </Formik>
    )
})
