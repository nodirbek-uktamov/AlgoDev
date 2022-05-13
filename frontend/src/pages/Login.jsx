import React from 'react'
import { css, StyleSheet } from 'aphrodite'
import { Form, Formik } from 'formik'
import { NavLink, Redirect, useHistory } from 'react-router-dom'
import cn from 'classnames'
import {Button} from '../components/common/Button'
import InputOld from '../components/common/InputOld'
import ServerError from '../components/common/ServerError'
import { usePostRequest } from '../hooks/request'
import { SIGNIN } from '../urls'
import { email, required, validator } from '../utils/validators'
import Password from '../components/common/Password'
import { isAuthenticated, signin } from '../utils/auth'
import LayoutAuth from '../components/LayoutAuth'


export default function Login() {
    const history = useHistory()
    const signIn = usePostRequest({ url: SIGNIN, headers: {} })

    if (isAuthenticated()) {
        return <Redirect to="/app" />
    }

    async function onSubmit(data) {
        const { response, success } = await signIn.request({ data })

        if (success) {
            signin(response, history)
            history.push('app')
        }
    }

    return (
        <LayoutAuth sidebar={(
            <div>
                <div className="mb-3">
                    <h2 className="is-size-5 has-text-weight-bold">Don't have an account?</h2>
                    <p>If you haven't registered, follow the link and create an account</p>
                </div>

                <NavLink to="/sign-up" className="button is-link is-outlined is-inverted">
                    Register
                </NavLink>
            </div>
        )}>
            <div id="login-title-panel" className="has-text-centered mb-4">
                <h2 className="is-size-4 has-text-weight-bold mb-4 has-text-black">Sign in</h2>
            </div>

            <Formik onSubmit={onSubmit} initialValues={{ email: '', password: '' }}>
                <Form>
                    <ServerError error={signIn.error} />
                    <InputOld name="email" validate={validator(required, email)} placeholder="Email" />
                    <Password name="password" validate={required} placeholder="Password" />

                    <div className="field">
                        <div className="control">
                            <Button
                                isLoading={signIn.loading}
                                text="Login"
                                type="submit" />
                        </div>
                    </div>

                    <div className={cn('mb-3', css(styles.onlyMobile))}>
                        <NavLink to="/sign-up">Зарегистрироваться</NavLink>
                    </div>

                    <div className="mt-5 forgot-password">
                        <div className="has-text-centered">
                            <NavLink to="/reset-link" className={css(styles.forgotPassword)}>Forgot password?</NavLink>
                        </div>
                    </div>
                </Form>
            </Formik>
        </LayoutAuth>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: '1.25rem',
    },
    img: {
        width: '10rem',
    },
    input: {
        color: '#4a4a4a',
    },
    onlyMobile: {
        textAlign: 'center',
        '@media (min-width: 769px)': {
            display: 'none',
        },
    },
    forgotPassword: {
        color: '#999',
        fontSize: '.9rem',
        ':hover': {
            color: '#0062ff',
        },
    },
})
