import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import ConfirmEmail from './pages/ConfirmEmail'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ResetPassword from './pages/ResetPassword'
import ResetPasswordMessage from './pages/ResetPasswordMessage'
import BaseContextWrapper from './components/common/BaseContext'
import Huobi from './pages/Huobi'
import FTX from './pages/FTX'
import ProtectedRoute from './components/common/ProtectedRoute'
import EmailConfirmationMessage from './pages/EmailConfirmationMessage'
import Main from './pages/Main'
import Demo from './pages/Demo'

export default function App() {
    return (
        <BrowserRouter>
            <BaseContextWrapper>
                <Switch>
                    <ProtectedRoute path="/" name="main" component={Main} exact />
                    <Route path="/auth" name="auth" component={Login} exact />
                    <Route path="/demo" name="auth" component={Demo} exact />
                    <Route path="/sign-up" name="auth" component={SignUp} exact />
                    <Route path="/reset-password/:key" name="auth" component={ResetPassword} exact />
                    <Route path="/confirm/:confirmationCode" component={ConfirmEmail} exact />
                    <Route path="/email-confirmation-message" component={EmailConfirmationMessage} exact />
                    <Route path="/reset-password-message" component={ResetPasswordMessage} exact />

                    <ProtectedRoute path="/huobi" name="main" component={Huobi} exact />
                    <ProtectedRoute path="/ftx" name="main" component={FTX} exact />

                    <Route path="" component={NotFound} exact />
                </Switch>
            </BaseContextWrapper>
        </BrowserRouter>
    )
}
