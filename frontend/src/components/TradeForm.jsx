import React, { useState, Fragment } from 'react'
import { Form, useFormikContext } from 'formik'
import Input from './common/Input'
import { required } from '../utils/validators'
import Button from './common/Button'
import Checkbox from './common/Checkbox'


export default React.memo(({ setTradeType, symbol }) => {
    const { values, setFieldValue } = useFormikContext()
    const [botType, setBotType] = useState('chase_bot')

    function changeTab(tab) {
        setBotType(tab)
        setFieldValue('botType', tab)
    }

    return (
        <Form>
            <div className="tabs">
                <ul>
                    <li onClick={() => changeTab('chase_bot')} className={botType === 'chase_bot' ? 'is-active' : null}>
                        <p>Chase bot</p>
                    </li>

                    <li onClick={() => changeTab('iceberg')} className={botType === 'iceberg' ? 'is-active' : null}>
                        <p>Iceberg</p>
                    </li>

                    <li onClick={() => changeTab('mm')} className={botType === 'mm' ? 'is-active' : null}>
                        <p>MM</p>
                    </li>

                    <li onClick={() => changeTab('twap')} className={botType === 'twap' ? 'is-active' : null}>
                        <p>Twap</p>
                    </li>
                </ul>
            </div>

            <Input
                name="quantity"
                step="0.00000001"
                type="number"
                label={`Amount (${botType !== 'twap' ? symbol.pair1 : `buy: ${symbol.pair2}, sell: ${symbol.pair1}`})`}
                validate={required} />

            {botType === 'iceberg' || botType === 'mm' ? (
                <Fragment>
                    <Input
                        validate={required}
                        name="icebergs_count"
                        type="number"
                        label="Icebergs count" />

                    <Checkbox name="take_profit" label="TakeProfit" />
                </Fragment>
            ) : null}

            {botType !== 'twap' && <Checkbox name="loop" label="Is loop" />}

            {values.loop && botType !== 'twap' ? (
                <Input
                    validate={required}
                    name="time_interval"
                    type="number"
                    label="Interval" />
            ) : null}

            {botType === 'twap' ? (
                <Fragment>
                    <Input
                        validate={required}
                        name="twap_bot_duration"
                        type="number"
                        label="Duration (minutes)" />

                    <p className="is-7 mb-2 is-italic">{(values.quantity || 0) / (values.twap_bot_duration || 1)} every minute</p>
                </Fragment>
            ) : null}

            <div className="is-flex">
                <Button onClick={() => setTradeType('buy')} type="submit" className="is-success" text="Long start" />

                <Button
                    onClick={() => setTradeType('sell')}
                    type="submit"
                    className="is-danger ml-1"
                    text="Short start" />
            </div>
        </Form>
    )
})
