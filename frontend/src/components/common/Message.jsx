import cn from 'classnames'
import React, { useEffect, useState } from 'react'
import { css, StyleSheet } from 'aphrodite'

export default function Message({ text, className, closeMessage, delay = 3 }) {
    const [hiding, setHiding] = useState(false)

    useEffect(() => {
        const hidingTimeout = setTimeout(() => setHiding(true), delay * 1000)
        const hideTimeout = setTimeout(closeMessage, (delay + 1) * 1000)

        return () => {
            clearTimeout(hidingTimeout)
            clearTimeout(hideTimeout)
        }
    }, [closeMessage, delay])

    return (
        <article className={cn('message', className, css(styles.message), { [css(styles.hide)]: hiding })}>
            <div className="message-body">
                <span>{text}</span> &nbsp; &nbsp;
                <button className="delete is-pulled-right" onClick={closeMessage} />
            </div>
        </article>
    )
}

const styles = StyleSheet.create({
    message: {
        position: 'fixed',
        top: '60px',
        minWidth: '20rem',
        right: '50px',
        animationName: {
            from: { opacity: 0 },
            to: { opacity: 1 },
        },
        animationDuration: '1s',
        zIndex: 1000,
    },
    hide: {
        animationName: {
            from: { opacity: 1 },
            to: { opacity: 0 },
        },
        animationDuration: '1s',
    },
})
