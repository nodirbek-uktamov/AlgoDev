import React from 'react';
import './Card.scss';

export function Card({children}) {
    return <div className="cardWrap">{children}</div>;
}