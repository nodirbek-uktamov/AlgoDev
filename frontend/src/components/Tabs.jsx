import React from 'react'
import { useHistory } from 'react-router-dom'
import { FTX, HUOBI } from '../exchanges/exchanges'
import { signOut } from '../utils/auth'
import { Button } from './common/Button'

export default function Tabs({ ...props }) {
    const path = window.location.pathname
    const history = useHistory()

    return (
        <div className="columns mt-3">
            <div className="tabs column " {...props}>
                <ul>
                    <li className={path === '/' ? 'is-active' : ''}>
                        <a onClick={() => history.push('/')}>
                            Settings
                        </a>
                    </li>

                    <li className={path.includes(HUOBI) ? 'is-active' : ''}>
                        <a onClick={() => history.push(HUOBI)}>Huobi</a>
                    </li>

                    <li className={path.includes(FTX) ? 'is-active' : ''}>
                        <a onClick={() => history.push(FTX)}>FTX</a>
                    </li>
                </ul>
            </div>

            <div className="column is-narrow">
                <Button
                    color="white"
                    text="Log out"
                    onClick={() => signOut(history)} />
            </div>
        </div>
    )
}
