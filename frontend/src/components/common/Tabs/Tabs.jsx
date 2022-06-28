import React, { useContext, useEffect } from 'react'
import { Button } from '../Button'
import { classnames } from '../../../utils/string'
import './Tabs.scss'
import { MainContext } from '../../../contexts/MainContext'

export function Tabs({ tabs, value = 0, onChange, children, className, setFieldValue, ...rest }) {
    const { callbacks } = useContext(MainContext)
    const tabList = tabs || children || []
    const renderContent = tabList[value] ? tabList[value].render : null

    useEffect(() => {
        if (setFieldValue) {
            callbacks.current.setTradeFormValue = setFieldValue
        }
    }, [callbacks, setFieldValue])

    if (tabs && tabs.length === 1) {
        return <>{renderContent()}</>
    }

    return (
        <div className={classnames(['tabsWrap', className])} {...rest}>
            <ul className="tabs-list">
                {tabList.map(({ title }, idx) => (
                    <li className="tabs-list-item" key={`tab_${idx}`}>
                        <Button
                            text={title}
                            color={value === idx ? 'white' : 'darkgray'}
                            size="M"
                            onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                onChange(idx)
                            }} />
                    </li>
                ))}
            </ul>
            <div>
                {renderContent()}
            </div>
        </div>
    )
}
