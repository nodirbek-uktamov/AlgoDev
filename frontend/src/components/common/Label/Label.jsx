import React from 'react';

export function Label({text, children}) {
    return <label className="label_main">{text}{children}</label>
}