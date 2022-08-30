import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Select } from '../common/Select'
import { MainContext } from '../../contexts/MainContext'
import { WS_TYPES } from '../../utils/websocket'
import OrdersDepth from './OrdersDepth'
import { Input } from '../common/Input'
import { FTX, HUOBI } from '../../exchanges/exchanges'

function createDepthSteps(exchange, tpp) {
    if (typeof tpp !== 'number') return []

    if (exchange === FTX) {
        const baseStep = 10 ** (-1 * tpp)

        return [
            { label: baseStep.toFixed(tpp), value: null },
            { label: (baseStep * 2).toFixed(tpp), value: '2' },
            { label: (baseStep * 5).toFixed(tpp), value: '5' },
            { label: (baseStep * 10).toFixed(tpp), value: '10' },
            { label: (baseStep * 25).toFixed(tpp), value: '25' },
            { label: (baseStep * 50).toFixed(tpp), value: '50' },
            { label: (baseStep * 100).toFixed(tpp), value: '100' },
            { label: (baseStep * 250).toFixed(tpp), value: '250' },
            { label: (baseStep * 500).toFixed(tpp), value: '500' },
            { label: (baseStep * 1000).toFixed(tpp), value: '1000' },
        ]
    }

    if (exchange === HUOBI) {
        return [
            { label: (0.1 ** tpp).toFixed(tpp), value: 'step0' },
            { label: (0.1 ** (tpp - 1)).toFixed(tpp - 1 < 0 ? 0 : tpp - 1), value: 'step1' },
            { label: (0.1 ** (tpp - 2)).toFixed(tpp - 2 < 0 ? 0 : tpp - 2), value: 'step2' },
            { label: (0.1 ** (tpp - 3)).toFixed(tpp - 3 < 0 ? 0 : tpp - 3), value: 'step3' },
            { label: (0.1 ** (tpp - 3) * 5).toFixed(tpp - 3 < 0 ? 0 : tpp - 3), value: 'step4' },
            { label: (0.1 ** (tpp - 4)).toFixed(tpp - 4 < 0 ? 0 : tpp - 4), value: 'step5' },
        ]
    }
}

export function DepthTab({ botPrices }) {
    const { publicWs, wsCallbacksRef, privateWs, setDepthType, depthType, symbolValue, symbol, exchange } = useContext(MainContext)
    const { tpp } = symbol

    const depthSteps = useCallback(createDepthSteps(exchange, tpp), [symbol])
    const [depthStep, setDepthStep] = useState(null)
    const [amountLimit, setAmountLimit] = useState(localStorage.getItem('orderbookAmountLimit') || '0')

    function onChangeDepthType(value) {
        setDepthStep(value)
        setDepthType(value.value)

        if (depthStep.value === value.value) {
            return
        }

        if (exchange === HUOBI) {
            if (publicWs.current.readyState !== 1) return
            publicWs.current.send(JSON.stringify({ unsub: WS_TYPES.book.replace('{symbol}', symbolValue).replace('{type}', depthType) }))
            publicWs.current.send(JSON.stringify({ sub: WS_TYPES.book.replace('{symbol}', symbolValue).replace('{type}', value.value) }))
        }

        if (exchange === FTX) {
            if (privateWs.current.readyState !== 1) return

            if (!depthType) {
                privateWs.current.send(JSON.stringify({ op: 'unsubscribe', channel: 'orderbook', market: symbolValue }))
            } else {
                privateWs.current.send(JSON.stringify({ op: 'unsubscribe', channel: 'orderbookGrouped', market: symbolValue, grouping: depthStep.label }))
            }

            if (value.value) {
                privateWs.current.send(JSON.stringify({ op: 'subscribe', channel: 'orderbookGrouped', market: symbolValue, grouping: value.label }))
            } else {
                privateWs.current.send(JSON.stringify({ op: 'subscribe', channel: 'orderbook', market: symbolValue }))
            }
        }

        wsCallbacksRef.current.setBook(null)
    }

    useEffect(() => {
        if (symbol) {
            setDepthStep(depthSteps[0])
        }

        // eslint-disable-next-line
    }, [symbol])

    function onChangeAmountLimit(event) {
        setAmountLimit(event.target.value)
        localStorage.setItem('orderbookAmountLimit', event.target.value)
    }

    return (
        <div id="depth-tab-component-container" style={{ minWidth: '14.9rem', height: '100%' }}>
            <div id="depth-tab-component-form" className="mb-4">

                <div className="mb-4">
                    <Input
                        label={`Amount from (${symbol.pair1})`}
                        step="0.00000001"
                        type="number"
                        value={amountLimit}
                        onChange={onChangeAmountLimit} />
                </div>

                <Select
                    options={depthSteps}
                    selectedOption={depthStep}
                    setSelectedOption={onChangeDepthType}
                    defaultValue={depthSteps[0]}
                    renderMenuOption={(o) => o.label}
                    renderSelectedOption={(o) => o.label}
                    color="lightgray" />
            </div>

            <OrdersDepth amountLimit={amountLimit} botPrices={botPrices} />
        </div>
    )
}
