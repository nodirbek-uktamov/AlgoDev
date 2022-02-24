import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import ConfirmEmail from './pages/ConfirmEmail'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ResetPassword from './pages/ResetPassword'
import ResetPasswordMessage from './pages/ResetPasswordMessage'
import BaseContextWrapper from './components/common/BaseContext'
import Main from './pages/Main'
import ProtectedRoute from './components/common/ProtectedRoute'
import EmailConfirmationMessage from './pages/EmailConfirmationMessage'


export default function App() {
    return (
        <BrowserRouter>
            <BaseContextWrapper>
                <Switch>
                    <Route path="/" name="auth" component={Login} exact />
                    <Route path="/sign-up" name="auth" component={SignUp} exact />
                    <Route path="/reset-password/:key" name="auth" component={ResetPassword} exact />
                    <Route path="/confirm/:confirmationCode" component={ConfirmEmail} exact />
                    <Route path="/email-confirmation-message" component={EmailConfirmationMessage} exact />
                    <Route path="/reset-password-message" component={ResetPasswordMessage} exact />

                    <ProtectedRoute path="/app" name="main" component={Main} exact />

                    <Route path="" component={NotFound} exact />
                </Switch>
            </BaseContextWrapper>
        </BrowserRouter>
    )
}
