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
                label="Amount (Pair 1)"
                validate={required} />

            <Checkbox name="loop" label="Is loop" />

            {values.loop ? <Input validate={required} name="time_interval" type="number" label="Interval" /> : null}

            <div className="is-flex">
                <Button onClick={() => setTradeType('buy')} type="submit" className="is-success" text="Long start" />
                <Button onClick={() => setTradeType('sell')} type="submit" className="is-danger ml-1"
                    text="Short start" />
            </div>
        </Form>
    )
})
