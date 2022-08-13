import cn from 'classnames'
import React, { useEffect, useState } from 'react'
import { css, StyleSheet } from 'aphrodite'

export default function Message({ text, index, deleteKey, className, closeMessage, delay = 3 }) {
    const [hiding, setHiding] = useState(false)

    useEffect(() => {
        const hidingTimeout = setTimeout(() => setHiding(true), delay * 1000)
        const hideTimeout = setTimeout(() => closeMessage(deleteKey), (delay + 1) * 1000)

        return () => {
            clearTimeout(hidingTimeout)
            clearTimeout(hideTimeout)
        }

        // eslint-disable-next-line
    }, [delay])

    return (
        <article className={cn('message', className, css(styles.message), { [css(styles.hide)]: hiding })} style={{ top: (index + 1) * 75 }}>
            <div className="message-body" style={{ ...(className.includes('is-danger') ? { borderColor: '#E61739' } : {}) }}>
                <span>{text}</span> &nbsp; &nbsp;
                <button className="delete is-pulled-right" onClick={() => closeMessage(deleteKey)} />
            </div>
        </article>
    )
}

const styles = StyleSheet.create({
    message: {
        position: 'fixed',
        minWidth: '20rem',
        right: '100px',
        animationName: {
            from: { opacity: 0 },
            to: { opacity: 1 },
        },
        animationDuration: '1s',
        zIndex: 1000,
        background: '#1a1a1a',
    },
    hide: {
        animationName: {
            from: { opacity: 1 },
            to: { opacity: 0 },
        },
        animationDuration: '1s',
    },
})
