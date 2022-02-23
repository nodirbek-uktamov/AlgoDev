/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import { Field } from 'formik'
import React, { useState } from 'react'
import cn from 'classnames'
import Button from './Button'
import ValidationErrorMessage from './ValidationErrorMessage'

const colors = [
    { color: '#00d1b2' },
    { color: '#3273dc' },
    { color: '#48c774' },
    { color: '#ffdd57' },
    { color: '#f14668' },
]

export default function ColorPicker({ label, validate, name }) {
    const [showDropdown, setShowDropdown] = useState(false)


    return (
        <div className="field">
            <div className="control">
                {label ? <label htmlFor={name}>{label}</label> : null}&nbsp;
            </div>

            <Field name={name} validate={validate}>
                {({ form, field }) => (
                    <div className={cn('dropdown', { 'is-active': showDropdown })}>
                        <div className="dropdown-triggger">
                            <Button
                                text="Выберите цвет"
                                icon="arrow-dropdown"
                                className="button"
                                style={{ background: field.value, color: 'white' }}
                                onClick={() => setShowDropdown(!showDropdown)} />
                        </div>

                        <div className="dropdown-menu">
                            {colors.map((item) => (
                                <Button
                                    key={item.color}
                                    onClick={() => {
                                        form.setFieldValue(name, item.color)
                                        setShowDropdown(!showDropdown)
                                    }}
                                    style={{ background: item.color }}
                                    className="button" />
                            ))}
                        </div>
                    </div>
                )}
            </Field>

            <ValidationErrorMessage name={name} />
        </div>
    )
}
