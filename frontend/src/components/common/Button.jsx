import { StyleSheet, css } from 'aphrodite'
import React from 'react'
import cn from 'classnames'

export default function Button({ text, onClick, loading, className, icon, type = 'button', backgroundColor, style, ...rest }) {
    return (
        <button
            onClick={onClick}
            type={type}
            className={cn('button', className, css(styles.button), { 'is-loading': loading })}
            style={{ backgroundColor, ...style }}
            {...rest}>

            {icon ? <span className={text ? css(styles.icon) : ''}><ion-icon name={icon} /></span> : null }
            {text}
        </button>
    )
}

const styles = StyleSheet.create({
    icon: {
        marginRight: '0.2rem',
    },
    button: {
        width: '100%',
    },
})
