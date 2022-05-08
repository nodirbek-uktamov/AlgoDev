import { css, StyleSheet } from 'aphrodite'
import { Form, Formik } from 'formik'
import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {Button} from '../components/common/Button'
import InputOld from '../components/common/InputOld'
import ServerError from '../components/common/ServerError'
import { useMessage } from '../hooks/message'
import { RESET_PASSWORD } from '../urls'
import { required } from '../utils/validators'
import { usePutRequest } from '../hooks/request'
import { signin } from '../utils/auth'


export default function ResetPassword() {
    const resetPassword = usePutRequest({ url: RESET_PASSWORD, headers: {} })
    const [showMessage] = useMessage()
    const { key } = useParams()
    const history = useHistory()

    async function onSubmit(data) {
        if (data.password === data.confirmPassword) {
            const { response, success } = await resetPassword.request({ data: { password: data.password, key } })
            if (success) {
                showMessage('Ваш пароль быль успешно изменён', 'is-success')
                signin(response, history)
            }
        } else {
            showMessage('Введенные пароли не совпадают', 'is-danger')
        }
    }

    return (
        <Formik onSubmit={onSubmit} initialValues={{ password: '', confirmPassword: '' }}>
            <Form className={css(styles.container)}>
                <div className="columns">
                    <h1 className="title column">Изменить пароль</h1>
                </div>

                <ServerError error={resetPassword.error} />

                <InputOld
                    name="password"
                    label="Новый Пароль"
                    validate={required}
                    placeholder="********"
                    type="password" />

                <InputOld
                    name="confirmPassword"
                    type="password"
                    label="Повторите пароль"
                    placeholder="********"
                    validate={required} />

                <div className="field">
                    <p className="control">
                        <Button
                            loading={resetPassword.loading}
                            className="is-link"
                            text="Изменить и Войти"
                            type="submit" />
                    </p>
                </div>
            </Form>
        </Formik>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: '10rem auto',
        width: '30rem',
    },
})
