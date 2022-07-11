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
    const { symbol, price } = useContext(MainContext)
    const { setFieldValue } = useFormikContext()

    const [sliderValue, setSliderValue] = useState(40)

    const initialPrice = price[symbol.value.toLowerCase()] ? price[symbol.value.toLowerCase()].ask : null

    useEffect(() => {
        setBotType(BOT_TYPES_MARKET[0])
    }, [setBotType, tab])

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

            {(balance.freeValue || 0).toFixed(4)} USD

            {/* <div className="columns mb-0"> */}
            {/*    <div className="column is-narrow" style={{ width: '60%' }}> */}
            <InputField type="number" name="quantity" step="0.00000001" label={`Amount (${symbol.pair1})`} />
            {/*    </div> */}

            {/*    <div className="column is-narrow" style={{ position: 'relative', top: '80%', transform: 'translateY(-50%)' }}> */}
            {/*        {initialPrice ? calcPair1Amount(values, botType, symbol, initialPrice) : '—'} {symbol.pair1} */}
            {/*    </div> */}
            {/* </div> */}

            <Slider defaultValue={sliderValue} onValueChange={(value) => onChangeSlider(value, setSliderValue, balance, symbol, setFieldValue, symbol)} valueType="percent" />

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
