import React from 'react'
import { Form, useFormikContext } from 'formik'
import Input from './common/Input'
import { required } from '../utils/validators'
import Button from './common/Button'
import Checkbox from './common/Checkbox'


export default React.memo(({ setTradeType }) => {
    const { values } = useFormikContext()

    return (
        <Form>
            <Input
                name="quantity"
                step="0.00000001"
                type="number"
                label={`Amount (${!values.chase_bot ? 'Pair 1' : 'buy: pair 1, sell: pair 2'})`}
                validate={required} />

            {!values.chase_bot && <Checkbox name="loop" label="Is loop" />}

            {values.loop && !values.chase_bot ? (
                <Input
                    validate={required}
                    name="time_interval"
                    type="number"
                    label="Interval" />
            ) : null}

            {!values.chase_bot && <Checkbox name="iceberg" label="Iceberg" />}

            {values.iceberg && !values.chase_bot ? (
                <Input
                    validate={required}
                    name="icebergs_count"
                    type="number"
                    label="Icebergs count" />
            ) : null}

            <Checkbox name="chase_bot" label="Chase Bot" />

            {values.chase_bot ? (
                <Input
                    validate={required}
                    name="chase_bot_duration"
                    type="number"
                    label="Chase bot duration (seconds)" />
            ) : null}

            {values.iceberg && !values.chase_bot ? <Checkbox name="market_making" label="MarketMaking" /> : null}

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
