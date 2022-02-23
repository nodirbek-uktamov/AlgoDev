import React from 'react'
import { Route, Redirect } from 'react-router-dom'


export default function ProtectedRoute({ component: Component, ...rest }) {
    function render(props) {
        if (!localStorage.token || !localStorage.user || !localStorage.permissions) {
            return <Redirect to="/" />
        }
        return <Component {...props} />
    }

    return <Route {...rest} component={render} />
}
