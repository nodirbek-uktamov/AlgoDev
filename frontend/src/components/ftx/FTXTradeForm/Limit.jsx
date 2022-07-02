import React, { useContext, useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import { Slider } from '../../common/Slider'
import { onChangeSlider } from '../../../utils/tradeForm'
import { FTXLimitOptionsRenderer } from './FTXTradeForm'
import { InputField } from '../../../forms'
import { MainContext } from '../../../contexts/MainContext'
import { Select } from '../../common/Select'
import { Button } from '../../common/Button'

const BOT_TYPES_LIMIT = [
    {
        title: 'Chase bot',
        key: 'chase_bot',
    },
    {
        title: 'Limit',
        key: 'limit',
    },
    {
        title: 'HFT',
        key: 'hft',
    },
]

export const Limit = ({ values, botType, setBotType, balance, setTradeType, loading }) => {
    const { symbol, price } = useContext(MainContext)
    const { setFieldValue } = useFormikContext()
    const [sliderValue, setSliderValue] = useState(40)

    const initialPrice = price[symbol.value.toLowerCase()] ? price[symbol.value.toLowerCase()].ask : null

    useEffect(() => {
        setBotType(BOT_TYPES_LIMIT[0])
    }, [setBotType])

    return (
        <div style={{ display: 'grid', gap: '1.1rem' }}>
            <Select
                style={{ marginTop: '1.1rem' }}
                options={BOT_TYPES_LIMIT}
                selectedOption={botType}
                setSelectedOption={setBotType}
                renderSelectedOption={(o) => o.title}
                renderMenuOption={(o) => o.title}
                color="white" />

            {/* <div className="columns mb-0"> */}
            {/*    <div className="column pr-0"> */}
            {/*        {(balance[symbol.pair2.toLowerCase()] || 0).toFixed(2)} {symbol.pair2} */}
            {/*    </div> */}

            {/*    <div className="column is-narrow"> */}
            {/*        {(balance[symbol.pair1.toLowerCase()] || 0).toFixed(symbol.tap || 0)} {symbol.pair1} */}
            {/*    </div> */}
            {/* </div> */}

            <InputField type="number" name="quantity" step="0.00000001" label={`Amount (${symbol.pair1})`} />

            <Slider defaultValue={sliderValue}
                onValueChange={(value) => onChangeSlider(value, setSliderValue, balance, symbol, setFieldValue, symbol)}
                valueType="percent" />

            {botType.key && FTXLimitOptionsRenderer[botType.key].render(values, symbol, botType.key)}

            {botType.key !== 'hft' && (
                <div className="is-flex" style={{ gap: '1.1rem' }}>
                    <Button isLoading={loading} color="success" text="Buy / Long" onClick={() => setTradeType('buy')}
                        type="submit" />

                    <Button
                        isLoading={loading}
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
