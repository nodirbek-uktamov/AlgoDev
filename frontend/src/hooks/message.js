import { useContext } from 'react'
import { Context } from '../components/common/BaseContext'

export function useMessage() {
    const { setText, setClassName } = useContext(Context)

    return [
        (text, className) => {
            if (setText) setText(text)
            if (setClassName) setClassName(className || 'is-dark')
        },
        () => {
            setText(null)
            setClassName('')
        },
    ]
}
