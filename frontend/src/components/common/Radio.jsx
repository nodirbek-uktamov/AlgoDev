import React, { createContext, useContext } from 'react'
import { Field } from 'formik'
import { css, StyleSheet } from 'aphrodite'
import cn from 'classnames'
import ValidationErrorMessage from './ValidationErrorMessage'

const Context = createContext()

export function Radio({ label = null, value }) {
    const { name } = useContext(Context)

    return (
        <label className="radio">
            <Field type="radio" name={name} value={value} className={css(styles.input)} />
            {label || null}
        </label>
    )
}


export function RadioGroup({ name, children }) {
    return (
        <div className={cn('control', css(styles.group))}>
            <Context.Provider value={{ name }}>
                {children}
            </Context.Provider>

            <ValidationErrorMessage name={name} />
        </div>
    )
}

const styles = StyleSheet.create({
    input: {
        marginRight: '0.3rem',
    },
    group: {
        marginBottom: '1rem',
    },
})
