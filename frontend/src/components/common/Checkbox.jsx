import React from 'react'
import { Field } from 'formik'

/**
 * @deprecated
 */
export default function Checkbox({
    name,
    className,
    label,
    optional = false,
    validate,
    ...attributes
}) {
    return (
        <div className="mb-3">
            <Field type="checkbox" name={name} className={className} validate={validate} {...attributes} id={name} />
            &nbsp;&nbsp;
            {label ? (
                <label htmlFor={name}>
                    {label} &nbsp;
                    {optional ? <span className="form-hint">не обязательно</span> : null}
                </label>
            ) : null}
        </div>
    )
}
