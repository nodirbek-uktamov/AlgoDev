import { useContext } from 'react'
import { Context } from '../components/common/BaseContext'

export function useMessage() {
    const { setText, setClassName } = useContext(Context)

    return [
        (text, className = null) => {
            if (setText) setText(text)
            if (setClassName) setClassName(className || 'is-dark')
        },
        () => {
            setText(null)
            setClassName('')
        },
    ]
}
