import React from 'react'
import { css, StyleSheet } from 'aphrodite'

export default function Progress({ value, text, max = 100, background = '#007bff' }) {
    const percent = (value * 100) / max

    return (
        <div className={css(styles.progress)}>
            <div className={css(styles.progressBar)} style={{ background, width: `${percent}%` }}>
                {text}
            </div>
        </div>
    )
}

const styles = StyleSheet.create({
    progress: {
        display: 'flex',
        height: '1rem',
        overflow: 'hidden',
        fontSize: '.75rem',
        backgroundColor: '#e9ecef',
        borderRadius: '5rem',
    },
    progressBar: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        color: '#fff',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        transition: 'width .6s ease',
    },
})
