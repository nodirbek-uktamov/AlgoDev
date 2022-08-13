import { useContext } from 'react'
import { Context } from '../components/common/BaseContext'

export function useMessage() {
    const { setTexts, setClassName } = useContext(Context)

    return [
        (newTexts, className = null) => {
            if (setTexts && typeof newTexts !== 'string') setTexts((oldTexts) => [...oldTexts, ...newTexts])
            else setTexts((oldTexts) => [...oldTexts, newTexts])
            if (setClassName) setClassName(className || 'is-dark')
        },
        () => {
            setTexts([])
            setClassName('')
        },
    ]
}
