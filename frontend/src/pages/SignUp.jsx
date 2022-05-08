import { css, StyleSheet } from 'aphrodite'
import { Form, Formik } from 'formik'
import React from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import {Button} from '../components/common/Button'
import InputOld from '../components/common/InputOld'
import ServerError from '../components/common/ServerError'
import { usePostRequest } from '../hooks/request'
import { SIGNUP } from '../urls'
import { email, required, validator } from '../utils/validators'
import Password from '../components/common/Password'
import LayoutAuth from '../components/LayoutAuth'

export default function SignUp() {
    const signUp = usePostRequest({ url: SIGNUP, headers: {} })
    const history = useHistory()

    async function onSubmit(data) {
        const { success } = await signUp.request({ data })

        if (success) {
            history.push('/')
        }
    }

    return (
        <LayoutAuth sidebar={(
            <div>
                <div className="mb-4">
                    <h2 className="is-size-5 has-text-weight-bold">Already have an account?</h2>
                    <p>Are you already registered? Sign in and enjoy</p>
                </div>

                <NavLink to="" className="button is-link is-outlined is-inverted">
                    Sign in
                </NavLink>
            </div>
        )}>
            <div className="has-text-centered mb-4">
                <h2 className="is-size-4 has-text-weight-bold">Register</h2>
            </div>

            <Formik onSubmit={onSubmit}
                initialValues={{
                    password: '',
                    firstName: '',
                    lastName: '',
                    email: '',
                    apiKey: '',
                    secretKey: '',
                }}>
                <Form className={css(styles.container)}>
                    <ServerError error={signUp.error} />

                    <div className="field is-horizontal">
                        <div className="field-body">
                            <InputOld name="firstName" label="First name" validate={required} placeholder="Ivan" />
                            <InputOld name="lastName" label="Last name" validate={required} placeholder="Ivanov" />
                        </div>
                    </div>

                    <InputOld
                        name="email"
                        label="Email"
                        validate={validator(required, email)}
                        placeholder="mail@gmail.com" />

                    <Password name="password" validate={required} placeholder="********" label="Password" />

                    <InputOld
                        name="apiKey"
                        label="Api key"
                        validate={validator(required)}
                        placeholder="*********************************" />

                    <InputOld
                        name="secretKey"
                        label="Secret key"
                        validate={validator(required)}
                        placeholder="*********************************" />

                    <div className="field">
                        <p className="control">
                            <Button
                                loading={signUp.loading}
                                className="is-primary is-blue is-medium is-fullwidth"
                                text="Зарегистрироваться"
                                type="submit" />
                        </p>
                    </div>

                    <div className={css(styles.onlyMobile)}>
                        Уже есть аккаунт?
                        <NavLink to="" className={css(styles.isRegistered)}> Войти</NavLink>
                    </div>
                </Form>
            </Formik>
        </LayoutAuth>
    )
}

const styles = StyleSheet.create({
    img: {
        width: '10rem',
    },
    onlyMobile: {
        fontSize: '.9rem',
        textAlign: 'center',
        '@media (min-width: 769px)': {
            display: 'none',
        },
    },
    isRegistered: {
        color: '#999',
        ':hover': {
            color: '#0062ff',
        },
    },
})
