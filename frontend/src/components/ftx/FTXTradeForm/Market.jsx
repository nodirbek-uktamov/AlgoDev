import React, { useContext, useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import { Select } from '../../common/Select'
import { InputField } from '../../../forms'
import { onChangeSlider } from '../../../utils/tradeForm'
import { FTXLimitOptionsRenderer } from './FTXTradeForm'
import { Slider } from '../../common/Slider'
import { Button } from '../../common/Button'
import { MainContext } from '../../../contexts/MainContext'

const BOT_TYPES_MARKET = [
    {
        title: 'Market',
        key: 'market',
    },
    {
        title: 'Twap',
        key: 'twap',
    },
    {
        title: 'StopLoss',
        key: 'stopLoss',
    },
]

export const Market = ({ values, botType, setBotType, balance, setTradeType, tab }) => {
    const { symbol, price, symbolValue } = useContext(MainContext)
    const { setFieldValue } = useFormikContext()

    const [sliderValue, setSliderValue] = useState(40)

    useEffect(() => {
        setBotType(BOT_TYPES_MARKET[0])
    }, [setBotType, tab])

    const initialPrice = price[symbolValue] ? price[symbolValue].ask : 0
    const pair1Balance = (balance.freeValue * balance.leverage) / initialPrice

    return (
        <div style={{ display: 'grid', gap: '1.1rem' }}>
            <Select
                style={{ marginTop: '1.1rem' }}
                options={BOT_TYPES_MARKET}
                selectedOption={botType}
                setSelectedOption={setBotType}
                renderSelectedOption={(o) => o.title}
                renderMenuOption={(o) => o.title}
                color="white" />

            <div className="columns mb-0">
                <div className="column pr-0">
                    {(balance.freeValue || 0).toFixed(4)} USD
                </div>

                <div className="column is-narrow">
                    {initialPrice && (pair1Balance).toFixed(symbol.tap || 0)} {symbol.pair1}
                </div>
            </div>

            <InputField type="number" name="quantity" step="0.00000001" label={`Amount (${symbol.pair1})`} />

            <Slider defaultValue={sliderValue} onValueChange={(value) => onChangeSlider(value, setSliderValue, pair1Balance, symbol, setFieldValue, symbol)} valueType="percent" />

            {botType.key && FTXLimitOptionsRenderer[botType.key].render(values, botType.key)}

            {botType.key !== 'hft' && (
                <div className="is-flex" style={{ gap: '1.1rem' }}>
                    <Button
                        color="success"
                        text="Buy / Long"
                        onClick={() => setTradeType('buy')}
                        type="submit" />

                    <Button
                        color="danger"
                        text="Sell / Short"
                        onClick={() => setTradeType('sell')}
                        type="submit"
                        className="ml-1" />
                </div>
            )}
        </div>
    )
}
