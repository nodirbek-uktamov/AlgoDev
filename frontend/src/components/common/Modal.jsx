import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import cn from 'classnames'

export default function Modal({ isActive, children, onClose }) {
    useEffect(() => {
        const handleKeyboard = (event) => {
            if (event.keyCode === 27) {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyboard)

        return () => {
            window.removeEventListener('keydown', handleKeyboard)
        }
    }, [onClose])

    return createPortal((
        <div className={cn('modal', { 'is-active': isActive })}>
            <div className="modal-background" onClick={onClose} />

            <div className="modal-card">
                <div className="modal-card-body">
                    {children}
                </div>
            </div>

            <button className="modal-close is-large" onClick={onClose} />
        </div>
    ), document.querySelector('#modals-root'))
}
