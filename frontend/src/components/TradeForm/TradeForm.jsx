import React, {useState, useEffect, useContext, Fragment} from 'react'
import {Form, Formik} from 'formik'
import {usePostRequest} from '../../hooks/request'
import {TRADE} from '../../urls'
import {MainContext} from "../../contexts/MainContext";
import {Tabs} from "../common/Tabs/Tabs";
import {Limit} from "./Limit";
import {Market} from "./Market";
import {InputField, ToggleSwitchField} from "../../forms";
import Checkbox from "../common/Checkbox";
import {Button} from "../common/Button";
import {generateLadderPrice} from "../../utils/common";


const formValues = JSON.parse(localStorage.getItem('savedForms') || '{}')

const tradeInitialValues = {
    quantity: '',
    price: 0,
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

    ladder_trades_count: 3,
    ladder_start_price: 0.000005,
    ladder_end_price: 0.000009,

    take_profit: false,
    stop: false
}

export const LimitOptionsRenderer = {
    limit: {
        render(values) {
            return <>
                <InputField
                    name="price"
                    step="0.00000001"
                    type="number"
                    label="Price"
                />

                <ToggleSwitchField name="take_profit" text="TakeProfit"/>
                {values.take_profit && (
                    <InputField
                        name="take_profit_percent"
                        step="0.1"
                        type="number"
                        label="Take profit percent (%)"
                    />
                )}

                <ToggleSwitchField name="stop" text="StopLoss"/>

                {values.stop && (
                    <InputField
                        name="stop_percent"
                        step="0.1"
                        type="number"
                        label="stoploss percent (%)"
                    />
                )}

            </>;
        }
    },
    market: {
        render(values) {
            return <>
                <ToggleSwitchField name="take_profit" text="TakeProfit"/>

                {values.take_profit && (
                    <InputField
                        name="take_profit_percent"
                        step="0.1"
                        type="number"
                        label="Take profit percent (%)"
                    />
                )}

                <ToggleSwitchField name="stop" text="StopLoss"/>

                {values.stop && (
                    <InputField
                        name="stop_percent"
                        step="0.1"
                        type="number"
                        label="stoploss percent (%)"
                    />
                )}
            </>
        }
    },
    chase_bot: {
        render(values) {
            return <>
                <ToggleSwitchField name="loop" text="Loop"/>

                {values.loop && <InputField
                    name="time_interval"
                    type="number"
                    label="Interval"/>
                }
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

                <ToggleSwitchField name="take_profit" text="TakeProfit"/>

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

                <ToggleSwitchField name="take_profit" text="TakeProfit"/>

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
                            label={<>Initial <br /> difference</>} />
                    </div>

                    <div className="column">
                        <InputField
                            name="hft_orders_price_difference"
                            step="0.1"
                            type="number"
                            label={<>Orders <br /> difference</>} />
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
    },
    stopLoss: {
        render(values) {
            return (
                <Fragment>
                    <InputField
                        name="stop_price"
                        type="number"
                        label="Stop price"/>
                </Fragment>
            )
        }
    },
    ladder: {
        render(values, symbolSettings) {
            return (
                <Fragment>
                    <InputField
                        name="ladder_trades_count"
                        type="number"
                        pattern="[0-9]"
                        label="Trades count"/>

                    <InputField
                        name="ladder_start_price"
                        type="number"
                        label="Start price"/>

                    <InputField
                        name="ladder_end_price"
                        type="number"
                        label="End price"/>

                    {(values.ladder_trades_count) && (
                        <div className="columns is-mobile m-0 p-0">
                            <div className="column pr-2 py-0">
                                Price
                            </div>

                            <div className="column has-text-centered is-narrow p-0 mr-1">
                                Amount %
                            </div>

                            <div className="column has-text-centered p-0 mr-1">
                                SL %
                            </div>

                            <div className="column has-text-centered p-0 mr-1">
                                TP %
                            </div>
                        </div>
                    )}

                    {Array.from(Array(Math.floor(values.ladder_trades_count || 0))).map((_, index) => (
                        <div className="columns is-mobile m-0 p-0">
                            <div className="column pr-2">
                                {generateLadderPrice(values, index + 1).toFixed(symbolSettings.tpp)}
                            </div>

                            <div className="column p-0 mr-1">
                                <InputField
                                    name="asdqweq"
                                    type="number"
                                    className="p-1 pl-3"
                                    pattern="[0-9]" />
                            </div>

                            <div className="column p-0 mr-1">
                                <InputField
                                    name="asdqweq"
                                    type="number"
                                    className="p-1 pl-3"
                                    pattern="[0-9]" />
                            </div>

                            <div className="column p-0 mr-1">
                                <InputField
                                    name="asdqweq"
                                    type="number"
                                    className="p-1 pl-3"
                                    pattern="[0-9]" />
                            </div>
                        </div>
                    ))}
                </Fragment>
            )
        }
    },
}

const BotDataFactory = {
    limit: {
        create(newData) {
            newData.limit = true;
            newData.limit_price = newData.price;
            return newData
        }
    },
    market: {
        create(newData) {
            newData.market = true;
            return newData
        }
    },
    chase_bot: {
        create(newData) {
            return newData
        }
    },
    iceberg: {
        create(newData) {
            newData.iceberg = true;
            return newData;
        }
    },
    mm: {
        create(newData) {
            newData.iceberg = true;
            newData.market_making = true;
            return newData;
        }
    },
    twap: {
        create(newData) {
            newData.twap_bot = true;
            return newData;
        }
    },
    grid: {
        create(newData) {
            newData.grid_bot = true;
            return newData;
        }
    },
    hft: {
        create(newData) {
            newData.hft_bot = true;
            return newData;
        }
    },
    stopLoss: {
        create(newData) {
            newData.stop = true;
            return newData;
        }
    }
}

const renderTabs = (props) => [
    {
        title: 'Limit',
        render: () => <Limit {...props} />
    },
    {
        title: 'Market',
        render: () =>  <Market {...props} />
    }
]

export default React.memo(({onUpdate}) => {
    const createTrade = usePostRequest({url: TRADE})
    const {symbol, wsCallbacksRef, symbolSettings} = useContext(MainContext)

    const [tab, setTab] = useState(0)
    const [botType, setBotType] = useState({
        title: 'Ladder',
        key: 'ladder'
    })

    const [balance, setBalance] = useState({})
    const [tradeType, setTradeType] = useState('buy')

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

        const extendedData = BotDataFactory[botType.key].create(newData);

        const {success, error} = await createTrade.request({data: extendedData})

        if (success) {
            onUpdate()
            return
        }

        alert(error && error.data.message)
    }

    return (
        <Formik initialValues={{...tradeInitialValues, ...formValues[symbol.value]}} onSubmit={onSubmit}>
            {({values, setFieldValue}) => (
                <Form>
                    <Tabs value={tab} onChange={setTab} setFieldValue={setFieldValue}>
                        {renderTabs({values, botType, setBotType, balance, setTradeType, tab})}
                    </Tabs>
                </Form>
            )}
        </Formik>
    )
})
