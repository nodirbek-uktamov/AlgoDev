import React from 'react'
import { css, StyleSheet } from 'aphrodite'
import sendMessage from '../static/sendMessage.png'

export default function ResetPasswordMessage() {
    return (
        <div className={css(styles.container)}>
            <img className={css(styles.img)} src={sendMessage} alt="" />
            <p className={css(styles.text)}>
                <span className="is-size-3-desktop is-size-4-mobile">Сообщение отправлено!</span><br />
                Мы отправили на вашу почту ссыльку для измененя пароля перейдите по ней и измените пароль
            </p>
        </div>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: '3rem auto 0rem',
        maxWidth: '50rem',
    },
    img: {
        width: '100%',
        margin: '0 auto',
    },
    text: {
        margin: '0 auto',
        padding: '3rem 2rem',
        '@media (min-width: 769px)': {
            padding: '3rem 7rem',
        },
    },
})
