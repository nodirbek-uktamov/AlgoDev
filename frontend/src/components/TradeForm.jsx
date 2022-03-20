import React, { useState } from 'react'
import { Form, useFormikContext } from 'formik'
import Input from './common/Input'
import { required } from '../utils/validators'
import Button from './common/Button'
import Checkbox from './common/Checkbox'


export default React.memo(({ setTradeType }) => {
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
                    <li onClick={() => changeTab('chase_bot')} className={botType === 'chase_bot' && 'is-active'}>
                        <a>Chase bot</a>
                    </li>

                    <li onClick={() => changeTab('iceberg')} className={botType === 'iceberg' && 'is-active'}>
                        <a>Iceberg</a>
                    </li>

                    <li onClick={() => changeTab('mm')} className={botType === 'mm' && 'is-active'}>
                        <a>MM</a>
                    </li>

                    <li onClick={() => changeTab('twap')} className={botType === 'twap' && 'is-active'}>
                        <a>Twap</a>
                    </li>
                </ul>
            </div>

            <Input
                name="quantity"
                step="0.00000001"
                type="number"
                label={`Amount (${botType !== 'twap' ? 'Pair 1' : 'buy: pair 2, sell: pair 1'})`}
                validate={required} />

            {botType === 'iceberg' || botType === 'mm' ? (
                <Input
                    validate={required}
                    name="icebergs_count"
                    type="number"
                    label="Icebergs count" />
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
                <Input
                    validate={required}
                    name="twap_bot_duration"
                    type="number"
                    label="Duration (seconds)" />
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
