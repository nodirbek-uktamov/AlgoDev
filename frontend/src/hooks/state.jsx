import { useEffect, useState } from 'react'

export function usePersistState(key, defaultValue) {
    const [state, setState] = useState(() => {
        const value = localStorage.getItem(key)
        try {
            return JSON.parse(value) || defaultValue
        } catch (e) {
            return value || defaultValue
        }
    })
    useEffect(() => {
        const value = typeof state === 'object' ? JSON.stringify(state) : state
        localStorage.setItem(key, value)
    }, [key, state])
    return [state, setState]
}
