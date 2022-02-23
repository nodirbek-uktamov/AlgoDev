/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react'
import cn from 'classnames'
import { NavLink } from 'react-router-dom'

export default function Dropdown({ trigger, children, right }) {
    const [active, setActive] = useState(false)

    return (
        <div onMouseLeave={() => setActive(false)}
            className={cn('dropdown', { 'is-active': active, 'is-right': right })}>
            <div className="dropdown-trigger" onClick={() => setActive(!active)}>
                {trigger}
            </div>

            {active ? (
                <div className="dropdown-menu">
                    <div className="dropdown-content">{children}</div>
                </div>
            ) : null}
        </div>
    )
}


export function DropdownItem({ text, icon, active, to, onClick, ...props }) {
    const Component = to ? NavLink : 'a'

    return (
        <Component {...props} to={to} className={cn('dropdown-item', { 'is-active': active })} onClick={onClick}>
            {icon ? <span className={cn('icon', icon)} /> : null}
            {text}
        </Component>
    )
}
