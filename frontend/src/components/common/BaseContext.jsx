import React, { createContext, useState } from 'react'
import Message from './Message'
import Modal from './Modal'

export const Context = createContext()

export default function BaseContextWrapper({ children }) {
    const [text, setText] = useState()
    const [className, setClassName] = useState('')
    const [modalComponent, setModalComponent] = useState()

    return (
        <Context.Provider value={{ setText, setClassName, setModalComponent }}>
            {children}

            {text ? (
                <Message
                    text={text}
                    className={className}
                    closeMessage={() => setText(null)} />
            ) : null}

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
