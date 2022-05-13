import React, {useContext, useEffect, useState} from 'react'
import {Select} from "../common/Select";
import {InputField} from "../../forms";
import {Slider} from "../common/Slider";
import {Button} from "../common/Button";
import {MainContext} from "../../contexts/MainContext";
import {LimitOptionsRenderer} from "./TradeForm";

const BOT_TYPES_MARKET = [
    {
        title: 'Market',
        key: 'market'
    },
    {
        title: 'Twap',
        key: 'twap'
    },
]

export const Market = ({values, botType, setBotType, balance, setTradeType, tab}) => {
    const {symbol, symbolSettings, price} = useContext(MainContext)

    const [sliderValue, setSliderValue] = useState(40);

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

    useEffect(() => {
        setBotType(BOT_TYPES_MARKET[0])
    }, [tab]);

    return <div style={{display: 'grid', gap: 20}}>
        <Select
            style={{marginTop: 20}}
            options={BOT_TYPES_MARKET}
            selectedOption={botType}
            setSelectedOption={setBotType}
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

        <div>
            <InputField type="number" name="quantity" step="0.00000001" label={`Amount (${symbol.pair2})`}/>
        </div>

        {/*<div className="column m-0 p-0 pt-7">*/}
        {/*    {initialPrice ? calcPair1Amount(values) : '—'} {symbol.pair1}*/}
        {/*</div>*/}

        <Slider defaultValue={sliderValue} onValueChange={setSliderValue} valueType="percent"/>

        {botType.key && LimitOptionsRenderer[botType.key].render(values, botType.key)}

        {botType.key !== 'hft' && (
            <div className="is-flex" style={{gap: 20}}>
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
    </div>
}