import React, {useContext, useEffect, useState} from 'react'
import {Select} from "../common/Select";
import {InputField} from "../../forms";
import {Slider} from "../common/Slider";
import {Button} from "../common/Button";
import {MainContext} from "../../contexts/MainContext";
import {LimitOptionsRenderer} from "./TradeForm";
import {calcPair1Amount, onChangeSlider} from "./utils";
import {useFormikContext} from "formik";

const BOT_TYPES_LIMIT = [
    {
        title: 'Limit',
        key: 'limit'
    },
    {
        title: 'Chase bot',
        key: 'chase_bot'
    },
    {
        title: 'Iceberg',
        key: 'iceberg'
    },
    {
        title: 'MM',
        key: 'mm'
    },
    {
        title: 'Grid',
        key: 'grid'
    },
    {
        title: 'HFT',
        key: 'hft'
    },
]

export const Limit = ({values, botType, setBotType, balance, setTradeType, tab}) => {
    const {symbol, symbolSettings, price} = useContext(MainContext)
    const {setFieldValue} = useFormikContext()
    const [sliderValue, setSliderValue] = useState(40);

    const initialPrice = price[symbol.value.toLowerCase()] ? price[symbol.value.toLowerCase()].ask : null

    useEffect(() => {
        setBotType(BOT_TYPES_LIMIT[0])
    }, []);

    return <div style={{display: 'grid', gap: '1.1rem'}}>
        <Select
            style={{marginTop: '1.1rem'}}
            options={BOT_TYPES_LIMIT}
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
                {(balance[symbol.pair1.toLowerCase()] || 0).toFixed(symbolSettings.tap || 0)} {symbol.pair1}
            </div>
        </div>

        <div className={"columns mb-0"}>
            <div className={"column is-narrow"} style={{width: '60%'}}>
                <InputField type="number" name="quantity" step="0.00000001" label={`Amount (${symbol.pair2})`}/>
            </div>

            <div className={"column is-narrow"} style={{position: 'relative', top: '80%', transform: 'translateY(-50%)'}}>
                {initialPrice ? calcPair1Amount(values, botType, symbolSettings, initialPrice) : '—'} {symbol.pair1}
            </div>
        </div>

        <Slider defaultValue={sliderValue} onValueChange={(value) => onChangeSlider(value, setSliderValue, balance, symbol, setFieldValue, symbolSettings)} valueType="percent"/>

        {botType.key && LimitOptionsRenderer[botType.key].render(values, botType.key)}

        {botType.key !== 'hft' && (
            <div className="is-flex" style={{gap: '1.1rem'}}>
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