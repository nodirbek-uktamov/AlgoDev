import React, { useContext, useEffect, useState } from 'react'
import { Form, Formik } from 'formik'
import { Limit } from './Limit'
import { InputField } from '../../../forms'
import { usePostRequest } from '../../../hooks/request'
import { MainContext } from '../../../contexts/MainContext'
import {FTX_PLACE_ORDER, TRADE} from '../../../urls'
import { Tabs } from '../../common/Tabs/Tabs'


const formValues = JSON.parse(localStorage.getItem('savedForms') || '{}')

const tradeInitialValues = {
    quantity: '',
    price: 0,
}

export const FTXLimitOptionsRenderer = {
    limit: {
        render(values) {
            return <>
                <InputField
                    name="price"
                    step="0.00000001"
                    type="number"
                    label="Price" />
            </>
        }
    },
}

const BotDataFactory = {
    limit: {
        create(newData) {
            return newData
        }
    },
}

const renderTabs = (props) => [
    {
        title: 'Limit',
        render: () => <Limit {...props} />
    },
    // {
    //     title: 'Market',
    //     render: () =>  <Market {...props} />
    // }
]

export default React.memo(({onUpdate}) => {
    const createTrade = usePostRequest({url: TRADE})
    const {symbol, wsCallbacksRef, symbolSettings} = useContext(MainContext)

    const [tab, setTab] = useState(0)
    const [botType, setBotType] = useState({
        title: 'Limit',
        key: 'limit'
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
            symbol: symbol.label,
            trade_type: tradeType,
            botType: botType.key
        }

        const extendedData = BotDataFactory[botType.key].create(newData, symbolSettings);

        createTrade.request({url: FTX_PLACE_ORDER, data: extendedData})
    }

    return (
        <Formik initialValues={{...tradeInitialValues, ...formValues[symbol.value]}} onSubmit={onSubmit}>
            {({values, setFieldValue}) => (
                <Form>
                    <Tabs value={tab} onChange={setTab} setFieldValue={setFieldValue}>
                        {renderTabs({values, botType, setBotType, balance, setTradeType, tab, loading: createTrade.loading})}
                    </Tabs>
                </Form>
            )}
        </Formik>
    )
})
