import React, { useState } from 'react'
import { Field, Form, Formik } from 'formik'
import { css, StyleSheet } from 'aphrodite'
import cn from 'classnames'
import { usePutRequest } from '../../hooks/request'
import Button from './Button'
import { SHOP_DETAIL } from '../../urls'
import useTrans from '../../hooks/trans'


export default function Toggle({ onColor, initialValues, shop }) {
    const [value, setValue] = useState(shop.status === 'active')
    const shopDetail = usePutRequest()
    const t = useTrans()

    function changeStatus() {
        const text = `${t('youWant')} ${value ? t('deactivate') : t('activate')} ${t('shopSingular')}?`
        if (global.confirm(text)) {
            shopDetail.request({
                url: SHOP_DETAIL.replace('{shopId}', shop.id),
                data: {
                    category: shop.category,
                    name: shop.name,
                    languages: shop.languagesString,
                    status: value ? 'inactive' : 'active',
                    token: shop.bot.token,
                    username: shop.username,
                    currency: shop.currency,
                },
            })
            setValue(!value)
        }
    }

    return (
        <Formik
            onSubmit={changeStatus}
            initialValues={{ status: '', ...initialValues }}>
            <Form>
                <div className={cn('columns is-mobile', css(styles.toggle))}>
                    <b className="column is-narrow">
                        {t('off')}
                    </b>

                    <Field
                        checked={value}
                        value={value === false ? 'active' : 'inactive'}
                        name="status"
                        onChange={changeStatus}
                        className="react-switch-checkbox"
                        id="react-switch-new"
                        type="checkbox" />

                    <label
                        style={{ background: value && onColor }}
                        className={cn('react-switch-label', css(styles.text))}
                        htmlFor="react-switch-new">
                        <Button type="submit" className="react-switch-button button" />
                    </label>

                    <b className="is-pulled-left column is-narrow">
                        {t('on')}
                    </b>
                </div>
            </Form>
        </Formik>
    )
}

const styles = StyleSheet.create({
    toggle: {
        position: 'absolute',
        top: '35px',
        right: '33px',
    },
    text: {
        marginTop: '7px',
    },
})
