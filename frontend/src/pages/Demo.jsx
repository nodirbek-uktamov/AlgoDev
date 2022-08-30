import React from 'react'
import { css, StyleSheet } from 'aphrodite'
import { Form, Formik } from 'formik'
import { NavLink, Redirect, useHistory } from 'react-router-dom'
import cn from 'classnames'
import { Button } from '../components/common/Button'
import InputOld from '../components/common/InputOld'
import ServerError from '../components/common/ServerError'
import { usePostRequest } from '../hooks/request'
import { SIGNIN } from '../urls'
import { email, required, validator } from '../utils/validators'
import Password from '../components/common/Password'
import { isAuthenticated, signin } from '../utils/auth'
import LayoutAuth from '../components/LayoutAuth'
import { ReactComponent as Logo } from '../static/logo.svg'

export default function Demo() {
    const history = useHistory()
    const signIn = usePostRequest({ url: SIGNIN, headers: {} })

    if (isAuthenticated()) {
        return <Redirect to="/huobi" />
    }

    async function onSubmit(data) {
        const { response, success } = await signIn.request({ data })

        if (success) {
            signin(response, history)
            history.push('/')
        }
    }

    const initialValues = {
        email: 'demo@demo.com',
        password: 'demo',
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
            <div id="login-title-panel" className="mb-4">
                <Logo />
            </div>

            <Formik onSubmit={onSubmit} initialValues={initialValues}>
                <Form>
                    <ServerError error={signIn.error} />
                    <InputOld readonly name="email" validate={validator(required, email)} placeholder="Email" />
                    <Password readonly name="password" validate={required} />

                    <div className="field">
                        <div className="control">
                            <Button
                                isLoading={signIn.loading}
                                text="Login"
                                type="submit" />
                        </div>
                    </div>

                    <div className={cn('mb-3', css(styles.onlyMobile))}>
                        <NavLink to="/sign-up">Register</NavLink>
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
