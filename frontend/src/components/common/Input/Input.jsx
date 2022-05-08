import React from 'react';
import {classnames} from "../../../utils/string";
import './Input.scss';
import {Label} from "../Label";

export function Input({className, label, renderIcon, hasError = false, ...rest}) {
    return <Label text={label}>
        <input
            className={classnames([className, 'input_main', hasError && 'input_main has-error'])}
            {...rest} />
        <span className="input_icon">{renderIcon}</span>
    </Label>;
}