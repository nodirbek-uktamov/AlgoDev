import cn from 'classnames'
import React, { useState } from 'react'
import { css, StyleSheet } from 'aphrodite'
import Input from './Input'

export default function Password({ name, validate, placeholder, label }) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="field">
            <div className="control has-icons-right">
                <Input
                    name={name}
                    validate={validate}
                    label={label}
                    placeholder={placeholder}
                    type={showPassword ? 'text' : 'password'} />

                <span className={cn('icon is-right', css(styles.showPassword), { [css(styles.hasLabel)]: label })}>
                    <ion-icon name={showPassword ? 'eye-off' : 'eye'} onClick={() => setShowPassword(!showPassword)} />
                </span>
            </div>
        </div>
    )
}

const styles = StyleSheet.create({
    showPassword: {
        pointerEvents: 'auto',
        color: 'black',
    },
    hasLabel: {
        marginTop: '25px',
    },
})
