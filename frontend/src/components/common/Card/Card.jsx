import React from 'react';
import './Card.scss';
import {classnames} from "../../../utils/string";

const CARD_COLOR = {
    black: 'card-black'
}

export function Card({dense = true, color, className, children, ...props}) {
    return <div {...props}
        className={classnames(["cardWrap", !dense && 'card-no-dense', color && CARD_COLOR[color], className])}>{children}</div>;
}