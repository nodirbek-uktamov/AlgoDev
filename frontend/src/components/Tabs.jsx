import React from 'react'
import {FTX, HUOBI} from "../utils/exchanges";
import {useHistory} from "react-router-dom";

export default function Tabs({...props}) {
    const path = window.location.pathname
    const history = useHistory()

    return (
        <div className="tabs mt-3" {...props}>
            <ul>
                <li className={path === '/' && "is-active"}>
                    <a onClick={() => history.push('/')}>
                        Settings
                    </a>
                </li>

                <li className={path.includes(HUOBI) && "is-active"}>
                    <a onClick={() => history.push(HUOBI)}>Huobi</a>
                </li>

                <li  className={path.includes(FTX) && "is-active"}>
                    <a onClick={() => history.push(FTX)}>FTX</a>
                </li>
            </ul>
        </div>
    )
}
