import React, { createContext, useState } from 'react'
import Message from './Message'
import Modal from './Modal'

export const Context = createContext()

export default function BaseContextWrapper({ children }) {
    const [texts, setTexts] = useState([])
    const [className, setClassName] = useState('')
    const [modalComponent, setModalComponent] = useState()

    return (
        <Context.Provider value={{ setTexts, setClassName, setModalComponent }}>
            {children}

            {texts.length > 0 ? texts.map((item, index) => (
                <Message
                    key={item.key}
                    text={typeof item === 'string' ? item : item.label}
                    index={index}
                    deleteKey={item.key}
                    className={typeof item === 'string' ? className : item.className}
                    closeMessage={(key) => {
                        setTexts((oldTexts) => oldTexts.filter((i) => i.key !== key))
                    }} />
            )) : null}

            {modalComponent ? (
                <Modal
                    isActive
                    onClose={() => setModalComponent(null)}>
                    {modalComponent}
                </Modal>
            ) : null}
        </Context.Provider>
    )
}
