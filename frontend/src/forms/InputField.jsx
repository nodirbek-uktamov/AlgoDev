import React from 'react';
import {useField} from "formik";
import {Input} from "../components/common/Input";
import {ErrorMessage} from "./ErrorMessage";

export function InputField({renderErrorMsg = (err) => err, ...props}) {
    const [field, meta] = useField(props);
    const errorMessage = meta.touched && meta.error;

    return <div>
        <Input label={props.label} hasError={Boolean(errorMessage)} {...field} {...props} />
        <ErrorMessage>{renderErrorMsg(errorMessage)}</ErrorMessage>
    </div>
}