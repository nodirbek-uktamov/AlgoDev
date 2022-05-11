import React, {useState, Fragment, useEffect, useRef, useContext} from 'react'
import {Form, Formik} from 'formik'
import cn from 'classnames'
import InputOld from './common/InputOld'
import {required} from '../utils/validators'
import {Button} from './common/Button';
import Checkbox from './common/Checkbox'
import {usePostRequest} from '../hooks/request'
import {TRADE} from '../urls'
import {MainContext} from "../contexts/MainContext";
import {InputField, ToggleSwitchField} from "../forms";
import {Slider} from "./common/Slider";
import {Card} from "./common/Card";
import {Select} from "./common/Select";
import {Tabs} from "./common/Tabs/Tabs";

const BOT_TYPES = [
    {
        title: 'Chase bot',
        key: 'chase_bot'
    },
    {
        title: 'Iceberg',
        key: 'iceberg'
    },
    {
        title: 'MM',
        key: 'mm'
    },
    {
        title: 'Twap',
        key: 'twap'
    },
    {
        title: 'Grid',
        key: 'grid'
    },
    {
        title: 'HFT',
        key: 'hft'
    },
]

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

const BotDataCreator = {
    chase_bot: {
        create: (newData) => {
            return newData
        }
    },
    iceberg: {
        create: (newData) => {
            newData.iceberg = true;
            return newData;
        }
    },
    mm: {
        create: (newData) => {
            newData.iceberg = true;
            newData.market_making = true;
            return newData;
        }
    },
    twap: {
        create: (newData) => {
            newData.twap_bot = true;
            return newData;
        }
    },
    grid: {
        create: (newData) => {
            newData.grid_bot = true;
            return newData;
        }
    },
    hft: {
        create: (newData) => {
            newData.hft_bot = true;
            return newData;
        }
    }
}

const LimitOptionsRenderer = {
    chase_bot: {
        render(values) {
            return <>
                <ToggleSwitchField name="loop" text="Loop"/>

                {values.loop && <InputField
                    name="time_interval"
                    type="number"
                    label="Interval"/>}
            </>;
        }
    },
    iceberg: {
        render(values) {
            return <>
                <ToggleSwitchField name="loop" text="Loop"/>

                {values.loop && <InputField
                    name="time_interval"
                    type="number"
                    label="Interval"/>}

                <InputField
                    name="icebergs_count"
                    type="number"
                    label="Icebergs count"/>

                <InputField
                    name="iceberg_price"
                    step="0.00000001"
                    type="number"
                    label="Price"
                />

                <Checkbox name="take_profit" label="TakeProfit"/>

                {values.take_profit && (
                    <InputField
                        name="take_profit_percent"
                        step="0.1"
                        type="number"
                        label="Take profit percent (%)"
                    />
                )}
            </>;
        }
    },
    mm: {
        render(values) {
            return <>
                <ToggleSwitchField name="loop" text="Loop"/>

                {values.loop && <InputField
                    name="time_interval"
                    type="number"
                    label="Interval"/>}

                <InputField
                    name="icebergs_count"
                    type="number"
                    label="Icebergs count"/>

                <Checkbox name="take_profit" label="TakeProfit"/>

                {values.take_profit && (
                    <InputField
                        name="take_profit_percent"
                        step="0.1"
                        type="number"
                        label="Take profit percent (%)"
                    />
                )}
            </>;
        }
    },
    twap: {
        render(values) {
            return <>

                <InputField
                    name="twap_bot_duration"
                    type="number"
                    label="Duration (minutes)"/>

                <p className="is-7 mb-2 is-italic">{(values.quantity || 0) / (values.twap_bot_duration || 1)} every
                    minute</p>
            </>;
        }
    },
    grid: {
        render(values) {
            return <>
                <InputField
                    name="grid_trades_count"
                    type="number"
                    label="Trades count"/>

                <InputField
                    name="grid_start_price"
                    step="0.00000001"
                    type="number"
                    label="Start price"
                />

                <InputField
                    name="grid_end_price"
                    step="0.00000001"
                    type="number"
                    label="End price"
                />
            </>;
        }
    },
    hft: {
        render(values) {
            return <>
                <div className="columns mb-0">
                    <div className="column">
                        <InputField
                            name="hft_default_price_difference"
                            step="0.1"
                            type="number"
                            label="Initial difference"/>
                    </div>

                    <div className="column">
                        <InputField
                            name="hft_orders_price_difference"
                            step="0.1"
                            type="number"
                            label="Orders difference"
                        />
                    </div>
                </div>

                <InputField
                    name="hft_orders_on_each_side"
                    type="number"
                    label="Orders on each side"/>

                <Button type="submit" className="is-primary" text="Create"/>

                <p className="is-7 my-2 is-italic">
                    {values.hft_orders_on_each_side} buy orders<br/>
                    {values.hft_orders_on_each_side} sell orders<br/>
                </p>

            </>;
        }
    }
}

const tabs = [
    {
        title: 'Limit',
        render: () => <span>Limit</span>
    },
    {
        title: 'Market',
        render: () => <span>Market</span>
    }
]

export default React.memo(({onUpdate}) => {
    const createTrade = usePostRequest({url: TRADE})
    const {symbol, symbolSettings, wsCallbacksRef, price} = useContext(MainContext)

    const [botType, setBotType] = useState({})
    const [balance, setBalance] = useState({})
    const [tradeType, setTradeType] = useState('buy')
    const [sliderValue, setSliderValue] = useState(40);
    const [tab, setTab] = useState(0)

    useEffect(() => {
        wsCallbacksRef.current.setBalance = setBalance
    }, [])

    async function onSubmit(data) {
        localStorage.setItem('savedForms', JSON.stringify({...formValues, [symbol.value]: data}))

        const newData = {
            ...data,
            symbol: symbol.value,
            trade_type: tradeType,
            twap_bot_duration: data.twap_bot_duration * 60,
            iceberg_price: data.iceberg_price || 0,
        }

        const extendedData = BotDataCreator[botType.key].create(newData);

        const {success, error} = await createTrade.request({data: extendedData})

        if (success) {
            onUpdate()
            return
        }

        alert(error && error.data.message)
    }

    const initialPrice = price[symbol.value.toLowerCase()] ? price[symbol.value.toLowerCase()].ask : null

    function calcPair1Amount(values) {
        let amount = values.quantity

        if (botType.key === 'iceberg') {
            amount = values.iceberg_price ? amount / values.iceberg_price : 0
        } else {
            amount = amount / initialPrice
        }

        return amount.toFixed(symbolSettings.tap || 0)
    }

    return (
        <Formik initialValues={{...tradeInitialValues, ...formValues[symbol.value]}} onSubmit={onSubmit}>
            {({values}) => (
                <Form>
                    <Tabs value={tab} onChange={setTab}>
                        {tabs}
                    </Tabs>

                    <Select
                        options={BOT_TYPES}
                        selectedOption={botType}
                        setSelectedOption={setBotType}
                        defaultValue={BOT_TYPES[0]}
                        renderSelectedOption={o => o.title}
                        renderMenuOption={o => o.title}
                        color='white'/>

                    <div className="columns mb-0">
                        <div className="column pr-0">
                            {(balance[symbol.pair2.toLowerCase()] || 0).toFixed(2)} {symbol.pair2}
                        </div>

                        <div className="column is-narrow">
                            {(balance[symbol.pair1.toLowerCase()] || 0).toFixed(symbolSettings.tap)} {symbol.pair1}
                        </div>
                    </div>

                    <InputField type="number" name="quantity" step="0.00000001" label={`Amount (${symbol.pair2})`}/>

                    <div className="column m-0 p-0 pt-7">
                        {initialPrice ? calcPair1Amount(values) : '—'} {symbol.pair1}
                    </div>

                    <Slider defaultValue={sliderValue} onValueChange={setSliderValue} valueType="percent"/>

                    {botType.key && LimitOptionsRenderer[botType.key].render(values, botType.key)}

                    {botType.key !== 'hft' && (
                        <div className="is-flex">
                            <Button color={'success'} text={'Buy / Long'} onClick={() => setTradeType('buy')}
                                    type="submit"
                            />

                            <Button
                                color={'danger'}
                                text={'Sell / Short'}
                                onClick={() => setTradeType('sell')}
                                type="submit"
                                className="ml-1"
                            />
                        </div>
                    )}
                </Form>
            )}
        </Formik>
    )
})
