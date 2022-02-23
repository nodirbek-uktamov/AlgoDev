import React from 'react'
import { css, StyleSheet } from 'aphrodite'
import sendMessage from '../static/sendMessage.png'

export default function EmailConfirmationMessage() {
    return (
        <div className={css(styles.container)}>
            <img className={css(styles.img)} src={sendMessage} alt="" />

            <p className={css(styles.text)}>
                <span className="is-size-3-desktop is-size-4-mobile">Сообщение отправлено!</span><br />
                Для подтверждения вашего адреса электронной почты, мы отправили вам письмо с активационной ссылкой.
                <br /><br />
                Не забудьте проверить папку "Спам"
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
