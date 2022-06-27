import React, { useContext, useEffect, useState } from 'react'
import { Form, Formik } from 'formik'
import { Limit } from './Limit'
import { InputField } from '../../../forms'
import { usePostRequest } from '../../../hooks/request'
import { MainContext } from '../../../contexts/MainContext'
import { FTX_PLACE_ORDER, TRADE } from '../../../urls'
import { Tabs } from '../../common/Tabs/Tabs'
import { useMessage } from '../../../hooks/message'
import { Button } from '../../common/Button'
import { FTX } from '../../../exchanges/exchanges'

const formValues = JSON.parse(localStorage.getItem('ftxSavedForms') || '{}')

const tradeInitialValues = {
    quantity: '',
    price: 0,
    hft_orders_on_each_side: 0,
    hft_orders_price_difference: 0,
    hft_default_price_difference: 0,
}

export const FTXLimitOptionsRenderer = {
    limit: {
        render(values) {
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
}

const BotDataFactory = {
    limit: {
        create(newData) {
            return newData
        },
    },
    hft: {
        create(newData) {
            newData.hft_bot = true
            return newData
        },
    },
}

const renderTabs = (props) => [
    {
        title: 'Limit',
        render: () => <Limit {...props} />,
    },
    // {
    //     title: 'Market',
    //     render: () =>  <Market {...props} />
    // }
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
            botType: botType.key,
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
