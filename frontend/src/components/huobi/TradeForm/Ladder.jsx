import React, { useCallback, useContext } from 'react'
import { useFormikContext } from 'formik'
import { InputField } from '../../../forms'
import { generateLadderPrice } from '../../../utils/common'
import { MainContext } from '../../../contexts/MainContext'

export const Ladder = () => {
    const { symbol } = useContext(MainContext)
    const { values } = useFormikContext()

    const ladderPriceInput = useCallback((index, newValues) => (
        <InputField
            style={{ borderRadius: '0.8rem' }}
            name={`ladder_item_price_${index + 1}`}
            type="number"
            step="0.00000001"
            value={values[`ladder_item_price_${index + 1}`] || generateLadderPrice(newValues, index + 1).toFixed(symbol.tpp)}
            className="pl-3 pr-0" />
    ), [values, symbol])

    return Array.from(Array(Math.floor(values.ladder_trades_count || 0))).map((_, index) => (
        <div className="columns is-mobile m-0 p-0">
            <div className="column p-0 mr-1">
                {symbol.tpp && ladderPriceInput(index, values)}
            </div>

            <div className="column is-narrow p-0 mr-1">
                <InputField
                    style={{ width: '3rem', borderRadius: '0.8rem' }}
                    name={`ladder_item_amount_${index + 1}`}
                    type="number"
                    className="pl-2 pr-0"
                    pattern="[0-9]" />
            </div>

            <div className="column is-narrow p-0 mr-1">
                <InputField
                    style={{ width: '3rem', borderRadius: '0.8rem' }}
                    name={`ladder_item_sl_${index + 1}`}
                    type="number"
                    className="pl-2 pr-0"
                    pattern="[0-9]" />
            </div>

            <div className="column is-narrow p-0 mr-1">
                <InputField
                    style={{ width: '3rem', borderRadius: '0.8rem' }}
                    name={`ladder_item_tp_${index + 1}`}
                    type="number"
                    className="pl-2 pr-0"
                    pattern="[0-9]" />
            </div>
        </div>
    ))
}
