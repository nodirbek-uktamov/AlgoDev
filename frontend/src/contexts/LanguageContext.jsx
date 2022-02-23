import React, { createContext } from 'react'
import { usePersistState } from '../hooks/state'

export const LanguageContext = createContext()

export function LanguageProvider({ children }) {
    const [lang, setLang] = usePersistState('language', 'ru')

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    )
}
