import React, { useContext } from 'react'
import { Context } from '../components/common/BaseContext'

export function useModal(component) {
    const { setModalComponent } = useContext(Context)

    function showModal(props) {
        const content = React.isValidElement(component) ? component : component(props)
        setModalComponent(content)
    }

    function hideModal() {
        setModalComponent(null)
    }

    return [showModal, hideModal]
}
