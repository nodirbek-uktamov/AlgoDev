import React, {useState} from 'react';
import {useField} from "formik";
import {ToggleSwitch} from "../components/common/ToggleSwitch";

export function ToggleSwitchField(props) {
    const {name, text} = props;
    const [field, _, helpers] = useField({
        type: 'checkbox',
        ...props
    });
    const [checked, setChecked] = useState(field.checked);
    const {setValue} = helpers;

    function onChange(isChecked) {
        setChecked(isChecked)
        setValue(isChecked)
    }

    return <ToggleSwitch id={name} text={text} checked={checked} onChange={onChange}/>;
}