import { Form, Formik } from 'formik'
import React from 'react'
import { required } from '../utils/validators'
import Button from './common/Button'
import Input from './common/Input'
import useTrans from '../hooks/trans'

export default function ChangePassword({ updatePassword }) {
    const t = useTrans()

    return (
        <Formik initialValues={{
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        }} onSubmit={updatePassword}>
            <Form>
                <Input
                    name="oldPassword"
                    type="password"
                    label={t('oldPassword')}
                    placeholder={t('enterOldPassword')}
                    validate={required} />

                <Input
                    name="newPassword"
                    type="password"
                    label={t('newPassword')}
                    placeholder={t('enterNewPassword')}
                    validate={required} />

                <Input
                    name="confirmPassword"
                    type="password"
                    label={t('newPasswordConfirm')}
                    placeholder={t('enterNewPasswordConfirm')}
                    validate={required} />

                <Button
                    text={t('save')}
                    type="submit"
                    icon="checkmark"
                    className="is-success" /> &nbsp;
            </Form>
        </Formik>
    )
}
