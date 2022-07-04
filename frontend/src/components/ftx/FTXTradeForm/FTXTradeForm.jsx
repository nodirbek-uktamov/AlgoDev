import React, { Fragment, useContext, useEffect, useState } from 'react'
import { Form, Formik } from 'formik'
import { Limit } from './Limit'
import { InputField, ToggleSwitchField } from '../../../forms'
import { usePostRequest } from '../../../hooks/request'
import { MainContext } from '../../../contexts/MainContext'
import { TRADE } from '../../../urls'
import { Tabs } from '../../common/Tabs/Tabs'
import { useMessage } from '../../../hooks/message'
import { Button } from '../../common/Button'
import { FTX } from '../../../exchanges/exchanges'
import { Market } from './Market'
import { generateLadderPrice } from '../../../utils/common'

const formValues = JSON.parse(localStorage.getItem('ftxSavedForms') || '{}')

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

    ladder_trades_count: 0,
    ladder_start_price: 0,
    ladder_end_price: 0,

    take_profit: false,
    stop: false,
}

export const FTXLimitOptionsRenderer = {
    limit: {
        render() {
            return (
                <>
                    <InputField
                        name="price"
                        step="0.00000001"
                        type="number"
                        label="Price" />
                </>
            )
        },
    },
    market: {
        render() {
            return (
                <></>
            )
        },
    },
    chase_bot: {
        render(values) {
            return (
                <>
                    <ToggleSwitchField name="loop" text="Loop" />

                    {values.loop && (
                        <InputField
                            name="time_interval"
                            type="number"
                            label="Interval" />
                    )}
                </>
            )
        },
    },
    iceberg: {
        render(values) {
            return (
                <>
                    <ToggleSwitchField name="loop" text="Loop" />

                    {values.loop && (
                        <InputField
                            name="time_interval"
                            type="number"
                            label="Interval" />
                    )}

                    <InputField
                        name="icebergs_count"
                        type="number"
                        label="Icebergs count" />

                    <InputField
                        name="iceberg_price"
                        step="0.00000001"
                        type="number"
                        label="Price"
                    />

                    {/* <ToggleSwitchField name="take_profit" text="TakeProfit" /> */}

                    {/* {values.take_profit && ( */}
                    {/*    <InputField */}
                    {/*        name="take_profit_percent" */}
                    {/*        step="0.1" */}
                    {/*        type="number" */}
                    {/*        label="Take profit percent (%)" */}
                    {/*    /> */}
                    {/* )} */}
                </>
            )
        },
    },
    mm: {
        render(values) {
            return (
                <>
                    <ToggleSwitchField name="loop" text="Loop" />

                    {values.loop && (
                        <InputField
                            name="time_interval"
                            type="number"
                            label="Interval" />
                    )}

                    <InputField
                        name="icebergs_count"
                        type="number"
                        label="Icebergs count" />

                    {/* <ToggleSwitchField name="take_profit" text="TakeProfit" /> */}

                    {/* {values.take_profit && ( */}
                    {/*    <InputField */}
                    {/*        name="take_profit_percent" */}
                    {/*        step="0.1" */}
                    {/*        type="number" */}
                    {/*        label="Take profit percent (%)" /> */}
                    {/* )} */}
                </>
            )
        },
    },
    grid: {
        render(values) {
            return (
                <>
                    <InputField
                        name="grid_trades_count"
                        type="number"
                        label="Trades count" />

                    <InputField
                        name="grid_start_price"
                        step="0.00000001"
                        type="number"
                        label="Start price" />

                    <InputField
                        name="grid_end_price"
                        step="0.00000001"
                        type="number"
                        label="End price" />
                </>
            )
        },
    },
    hft: {
        render(values) {
            return (
                <>
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
                        label="Orders on each side" />

                    <Button type="submit" className="is-primary" text="Create" />

                    <p className="is-7 my-2 is-italic">
                        {values.hft_orders_on_each_side} buy orders<br />
                        {values.hft_orders_on_each_side} sell orders<br />
                    </p>
                </>
            )
        },
    },
    ladder: {
        render(values) {
            return (
                <Fragment>
                    <InputField
                        name="ladder_trades_count"
                        type="number"
                        pattern="[0-9]"
                        label="Trades count" />

                    <InputField
                        name="ladder_start_price"
                        type="number"
                        step="0.00000001"
                        label="Start price" />

                    <InputField
                        name="ladder_end_price"
                        type="number"
                        step="0.00000001"
                        label="End price" />

                    {values.ladder_trades_count > 0 && (
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
                </Fragment>
            )
        },
    },
}

const BotDataFactory = {
    limit: {
        create(newData) {
            newData.limit = true
            newData.limit_price = newData.price
            return newData
        },
    },
    hft: {
        create(newData) {
            newData.hft_bot = true
            return newData
        },
    },
    chase_bot: {
        create(newData) {
            newData.chase_bot = true
            return newData
        },
    },
    iceberg: {
        create(newData) {
            newData.iceberg = true
            return newData
        },
    },
    mm: {
        create(newData) {
            newData.iceberg = true
            newData.market_making = true
            return newData
        },
    },
    grid: {
        create(newData) {
            newData.grid_bot = true
            return newData
        },
    },
    market: {
        create(newData) {
            newData.market = true
            return newData
        },
    },
    ladder: {
        create(newData, symbol) {
            const ladderTrades = []

            for (let i = 1; i <= newData.ladder_trades_count; i++) {
                const defaultPrice = generateLadderPrice(newData, i).toFixed(symbol.tpp)

                ladderTrades.push({
                    amount: newData[`ladder_item_amount_${i}`],
                    stop_loss: newData[`ladder_item_sl_${i}`],
                    take_profit: newData[`ladder_item_tp_${i}`],
                    price: newData[`ladder_item_price_${i}`] || defaultPrice,
                })
            }

            newData.ladderTrades = ladderTrades
            newData.ladder = true
            return newData
        },
    },
}

const renderTabs = (props) => [
    {
        title: 'Limit',
        render: () => <Limit {...props} />,
    },
    {
        title: 'Market',
        render: () => <Market {...props} />,
    },
]

export default React.memo(({ onUpdate }) => {
    const createTrade = usePostRequest({ url: TRADE })
    const { symbol, wsCallbacksRef } = useContext(MainContext)

    const [tab, setTab] = useState(0)
    const [botType, setBotType] = useState({
        title: 'Limit',
        key: 'limit',
    })

    const [balance, setBalance] = useState({})
    const [tradeType, setTradeType] = useState('buy')

    const [showMessage] = useMessage()

    useEffect(() => {
        wsCallbacksRef.current.setBalance = setBalance
    }, [wsCallbacksRef])

    async function onSubmit(data) {
        localStorage.setItem('ftxSavedForms', JSON.stringify({ ...formValues, [symbol.value]: data }))

        const newData = {
            ...data,
            symbol: symbol.value,
            trade_type: tradeType,
            twap_bot_duration: data.twap_bot_duration * 60,
            iceberg_price: data.iceberg_price || 0,
            exchange: FTX,
        }

        const extendedData = BotDataFactory[botType.key].create(newData, symbol)

        const { response, error, success } = await createTrade.request({ data: extendedData })

        if (success) {
            onUpdate()
            return
        }

        showMessage(JSON.stringify(error.data))
    }

    return (
        <Formik initialValues={{ ...tradeInitialValues, ...formValues[symbol.value] }} onSubmit={onSubmit}>
            {({ values, setFieldValue }) => (
                <Form>
                    <Tabs value={tab} onChange={setTab} setFieldValue={setFieldValue}>
                        {renderTabs({
                            values,
                            botType,
                            setBotType,
                            balance,
                            setTradeType,
                            tab,
                            loading: createTrade.loading,
                        })}
                    </Tabs>
                </Form>
            )}
        </Formik>
    )
})
