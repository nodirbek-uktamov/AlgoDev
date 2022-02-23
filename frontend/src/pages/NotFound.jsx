/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react'
import { css, StyleSheet } from 'aphrodite'
import notFound from '../static/not_found.svg'

export default function NotFound() {
    return (
        <div className={css(styles.body)}>
            <img src={notFound} alt="404" className={css(styles.image)} />
            <p className={css(styles.string)}>
                Упс! Страница не найдена
            </p>
        </div>
    )
}

const styles = StyleSheet.create({
    body: {
        height: '100vh',
        textAlign: 'center',
    },
    image: {
        margin: '5rem auto',
        width: '40rem',
    },
    string: {
        fontSize: '3rem',
    },
})
