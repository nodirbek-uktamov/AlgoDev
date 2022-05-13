import { css, StyleSheet } from 'aphrodite'
import React from 'react'
import cn from 'classnames'


export default function LayoutAuth({ children, sidebar }) {
    return (
        <div className="login-wrapper columns is-gapless has-background-white">
            <div className="column is-7">
                <div className="hero form-hero is-fullheight">
                    <div className={cn('hero-body', css(styles.noPadding))}>
                        <div className={css(styles.formWrapper)}>
                            <div className={css(styles.container)}>
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cn(
                'column is-5 is-hidden-mobile hero-banner', css(styles.sidebar),
            )}>
                <div className="hero is-fullheight">
                    <div className="hero-body">
                        <div className="container has-text-centered has-text-white">
                            <div className="columns">
                                <div className="column is-10 is-offset-1">
                                    {sidebar}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: '1.25rem',
    },
    noPadding: {
        padding: '0 !important',
    },
    roundedButtons: {
        '> button': {
            borderRadius: '50%',
        },
    },
    input: {
        color: '#4a4a4a',
    },
    isPrimary: {
        backgroundColor: 'rgb(31, 38, 104) !important',
    },
    forgotPassword: {
        color: '#999',
        fontSize: '.9rem',
        ':hover': {
            color: '#0062ff',
        },
    },
    sidebar: {
        backgroundColor: '#262626;',
    },
    developmentSidebar: {
        background: '#004d40',
    },
    stagingSidebar: {
        background: '#000000',
    },
    formWrapper: {
        maxWidth: '540px',
        minWidth: '380px',
        margin: '0 auto',
    },
})
