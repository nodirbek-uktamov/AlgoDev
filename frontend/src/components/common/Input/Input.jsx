import React, {forwardRef} from 'react';
import {classnames} from "../../../utils/string";
import './Input.scss';
import {Label} from "../Label";

const LABEL_POSITION = {
    row: 'input-label-row'
}

export const Input = forwardRef(({className, label, labelPosition, renderIcon, hasError = false, ...rest}, ref) => {
    return <Label text={label} className={classnames([LABEL_POSITION[labelPosition]])}>
        <input
            ref={ref}
            className={classnames([className, 'input_main', hasError && 'input_main has-error'])}
            {...rest} />
        <span className="input_icon">{renderIcon}</span>
    </Label>;
})
