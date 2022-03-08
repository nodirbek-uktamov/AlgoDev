import React from 'react'
import { Form } from 'formik'
import Input from './common/Input'
import { required } from '../utils/validators'
import Button from './common/Button'


export default React.memo(({ tradeType }) => {
    console.log('asd')
    return (
        <Form>
            <Input
                name="quantity"
                step="0.00000001"
                type="number"
                label="Amount (TRX)"
                validate={required} />

            <div className="is-flex">
                <Button type="submit" className="is-danger mr-1" text="Short start" />
                <Button type="submit" className="is-success" text="Long start" />
            </div>
        </Form>
    )
})
