import React from 'react'
import { ErrorMessage } from 'formik'

export default function ValidationErrorMessage({ name, ...attributes }) {
    return (
        <ErrorMessage
            name={name}
            {...attributes}
            render={(msg) => <div className="has-text-danger">{msg}</div>} />
    )
}
