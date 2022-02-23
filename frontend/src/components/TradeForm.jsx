import React, { useEffect } from 'react'
import { Form, useFormikContext } from 'formik'
import Input from './common/Input'
import { required } from '../utils/validators'
import Button from './common/Button'


export default React.memo(({ price, tradeType, sell }) => {
    const { setFieldValue } = useFormikContext()

    useEffect(() => {
        setFieldValue('price', price)

        // eslint-disable-next-line
    }, [price])

    return (
        <Form>
            {tradeType === 'limit' ? (
                <Input
                    name="price"
                    type="number"
                    label="Price"
                    step="0.00000001"
                    validate={required} />
            ) : null}

            {tradeType === 'market' ? (
                <Input
                    name="market_price"
                    disabled
                    value="Маркет"
                    label="Цена" />
            ) : null}

            <Input
                name="quantity"
                step="0.00000001"
                type="number"
                label={`Amount (${tradeType === 'market' && !sell ? 'USDT' : 'TRX'})`}
                validate={required} />

            <Button type="submit" className={sell ? 'is-danger' : 'is-success'} text={sell ? 'Sell' : 'Buy'} />
        </Form>
    )
})
