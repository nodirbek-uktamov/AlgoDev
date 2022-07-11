import React, { useContext, useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import { Slider } from '../../common/Slider'
import { onChangeSlider } from '../../../utils/tradeForm'
import { FTXLimitOptionsRenderer } from './FTXTradeForm'
import { InputField } from '../../../forms'
import { MainContext } from '../../../contexts/MainContext'
import { Select } from '../../common/Select'
import { Button } from '../../common/Button'
import { Ladder } from '../../huobi/TradeForm/Ladder'

const BOT_TYPES_LIMIT = [
    {
        title: 'Limit',
        key: 'limit',
    },
    {
        title: 'Chase bot',
        key: 'chase_bot',
    },
    {
        title: 'Iceberg',
        key: 'iceberg',
    },
    {
        title: 'MM',
        key: 'mm',
    },
    {
        title: 'Grid',
        key: 'grid',
    },
    {
        title: 'HFT',
        key: 'hft',
    },
    {
        title: 'Ladder',
        key: 'ladder',
    },
]

export const Limit = ({ values, botType, setBotType, balance, setTradeType, loading }) => {
    const { symbol, price } = useContext(MainContext)
    const { setFieldValue } = useFormikContext()
    const [sliderValue, setSliderValue] = useState(40)

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

            {(balance.freeValue || 0).toFixed(4)} USD

            <InputField type="number" name="quantity" step="0.00000001" label={`Amount (${symbol.pair1})`} />

            <Slider defaultValue={sliderValue}
                onValueChange={(value) => onChangeSlider(value, setSliderValue, balance, symbol, setFieldValue, symbol)}
                valueType="percent" />

            {botType.key && FTXLimitOptionsRenderer[botType.key].render(values, symbol, botType.key)}

            {botType.key === 'ladder' && <Ladder />}

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
