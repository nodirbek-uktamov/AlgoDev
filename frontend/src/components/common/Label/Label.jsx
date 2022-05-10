import React from 'react';
import {classnames} from "../../../utils/string";

export function Label({text, className, children, ...rest}) {
    return <label {...rest} className={classnames(['label_main', className])}>{text}{children}</label>
}