import React from 'react';
import './Button.scss';
import {classnames} from "../../../utils/string";
import {Spinner} from "../Spinner";

const BUTTON_SIZE = {
    S: 'button_small',
    M: 'button_medium',
    L: 'button_large'
}

const BUTTON_COLOR = {
    success: 'button_success',
    danger: 'button_danger',
    gray: 'button_gray',
    darkgray: 'button_darkgray',
    white: 'button_white',
}

export function Button({
                           text = '',
                           size = 'L',
                           color = 'gray',
                           type = 'button',
                           isLoading = false,
                           disabled = false,
                           className = '',
                           scale = true,
                           ...rest
                       }) {
    return <button type={type}
                   disabled={isLoading || disabled}
                   className={classnames(['button_main', scale && 'button_main-scale', BUTTON_SIZE[size], BUTTON_COLOR[color], className])}
                   {...rest}>{isLoading ? <Spinner color={color === 'white' ? 'black' : undefined}/> : text}</button>
}