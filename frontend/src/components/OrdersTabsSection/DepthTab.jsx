import React, {useContext, useState} from 'react';
import {Select} from "../common/Select";
import {MainContext} from "../../contexts/MainContext";
import {WS_TYPES} from "../../utils/websocket";
import OrdersDepth from "./OrdersDepth";

function createDepthSteps(tpp) {
    if (!tpp) return  []
    return [
        {label: (0.1 ** tpp).toFixed(tpp), value: 'step0'},
        {label: (0.1 ** (tpp - 1)).toFixed(tpp - 1 < 0 ? 0 : tpp - 1), value: 'step1'},
        {label: (0.1 ** (tpp - 2)).toFixed(tpp - 2 < 0 ? 0 : tpp - 2), value: 'step2'},
        {label: (0.1 ** (tpp - 3)).toFixed(tpp - 3 < 0 ? 0 : tpp - 3), value: 'step3'},
        {label: (0.1 ** (tpp - 3) * 5).toFixed(tpp - 3 < 0 ? 0 : tpp - 3), value: 'step4'},
        {label: (0.1 ** (tpp - 4)).toFixed(tpp - 4 < 0 ? 0 : tpp - 4), value: 'step5'},
    ]
}

export function DepthTab({botPrices}) {
    const {symbolSettings, huobiWs, setDepthType, depthType, symbolValue} = useContext(MainContext)
    const {tpp} = symbolSettings

    const depthSteps = createDepthSteps(tpp)
    const [depthStep, setDepthStep] = useState(null);

    function onChangeDepthType({value}) {
        huobiWs.current.send(JSON.stringify({unsub: WS_TYPES.book.replace('{symbol}', symbolValue).replace('{type}', depthType)}))
        setDepthType(value)
        huobiWs.current.send(JSON.stringify({sub: WS_TYPES.book.replace('{symbol}', symbolValue).replace('{type}', value)}))
    }

    return <>
        <Select
            options={depthSteps}
            selectedOption={depthStep}
            setSelectedOption={o => {
                setDepthStep(o)
                huobiWs.current.readyState === 1 && onChangeDepthType(o.value)
            }}
            defaultValue={depthSteps[0]}
            renderMenuOption={o => o.label}
            renderSelectedOption={o => o.label}
            color='lightgray'
        />
        <OrdersDepth botPrices={botPrices}  />
    </>
}