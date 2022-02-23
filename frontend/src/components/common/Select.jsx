import React, { useEffect, useState } from 'react'
import { Field, useFormikContext } from 'formik'
import cn from 'classnames'
import isEmpty from 'lodash/isEmpty'
import ValidationErrorMessage from './ValidationErrorMessage'

export default function Select({
    info,
    name,
    className,
    label,
    validate,
    options = [],
    optionValue = 'id',
    optionLabel = 'name', // key name of function
    loading = false,
    empty = false,
    optional = false,
    help,
    ...attributes
}) {
    const { setFieldValue, values, errors, touched } = useFormikContext()
    const value = values[name]
    const error = errors[name]
    const touch = touched[name]
    const [showInfoButton, setShowInfoButton] = useState(false)


    useEffect(() => {
        // Cast type to string if it is number.
        // Because isEmpty function returns true if you pass any number
        const strValue = typeof value === 'number' ? String(value) : value
        if (!empty && isEmpty(strValue) && !isEmpty(options)) {
            setFieldValue(name, options[0][optionValue])
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options])
    return (
        <div className="field">
            <div className="control">
                {label ? (
                    <div>
                        <label htmlFor={name}>
                            {label} &nbsp;
                            {optional ? <span className="form-hint">не обязательно</span> : null}
                        </label>

                        {info ? (
                            <div onMouseLeave={() => setShowInfoButton(false)}
                                onClick={(event) => event.stopPropagation()}
                                className={cn(
                                    'dropdown',
                                    { 'is-active': showInfoButton },
                                    className,
                                )}>
                                <div className="dropdown-trigger">
                                    <span className="icon is-small">
                                        <ion-icon onClick={() => setShowInfoButton(!showInfoButton)}
                                            name="alert-circle-outline" aria-hidden="true" />
                                    </span>
                                </div>

                                <div className="dropdown-menu">
                                    <div className="dropdown-content">
                                        <div className="dropdown-item">
                                            {info}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : null}


                <div className={cn('select is-fullwidth', { 'is-loading': loading })}>
                    <Field
                        name={name}
                        id={name}
                        component="select"
                        validate={validate}
                        {...attributes}>

                        {empty ? <option value="" /> : null}

                        {options.map((item) => (
                            <option value={item[optionValue]} key={item[optionValue]}>
                                {typeof optionLabel === 'function' ? optionLabel(item) : item[optionLabel]}
                            </option>
                        ))}
                    </Field>
                </div>

                <ValidationErrorMessage name={name} />
            </div>

            {help && (!error || !touch) ? (
                <p className="form-hint">{help}</p>
            ) : null}
        </div>
    )
}
