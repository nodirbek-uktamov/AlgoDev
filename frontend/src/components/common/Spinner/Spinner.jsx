import React from 'react';
import {classnames} from "../../../utils/string";
import './Spinner.scss';

export function Spinner({size = 14, width = 3, color = 'white' , className = ''}) {
    return (
        <svg
            className={classnames(["spinner_main", className])}
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10"/>
        </svg>
    );
}
