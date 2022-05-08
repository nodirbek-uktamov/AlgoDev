import cn from 'classnames'
import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { css, StyleSheet } from 'aphrodite'
import isEmpty from 'lodash/isEmpty'
import {Button} from '../components/common/Button'
import Loader from '../components/common/Loader'
import ServerError from '../components/common/ServerError'
import { useLoad } from '../hooks/request'
import { CONFIRM } from '../urls'
import successImg from '../static/success.png'
import { signin } from '../utils/auth'


export default function ConfirmEmail() {
    const history = useHistory()
    const { confirmationCode } = useParams()

    const { response, loading, error } = useLoad({
        method: 'POST',
        url: CONFIRM.replace('{confirmationCode}', confirmationCode),
        data: { confirmationCode },
        headers: {},
    })

    if (loading) {
        return <Loader large center padded />
    }

    return (
        <div className="column">
            <div className="container">
                {!isEmpty(error) ? (
                    <ServerError error={error} />
                ) : (
                    <div>
                        <img className={cn('columns', css(styles.img))} src={successImg} alt="success" />

                        <Button
                            text="Войти в систему"
                            onClick={() => signin(response, history)}
                            type="submit"
                            icon="checkmark"
                            className={cn('columns', css(styles.button))} />
                    </div>
                )}
            </div>
        </div>
    )
}

const styles = StyleSheet.create({
    img: {
        width: '650px',
        margin: '0 auto',
    },
    button: {
        margin: '0 auto',
        background: 'hsl(217, 71%, 53%)',
        color: 'white',
    },
})
