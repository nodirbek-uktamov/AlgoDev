import { css, StyleSheet } from 'aphrodite'
import cn from 'classnames'
import { Field, useFormikContext } from 'formik'
import React, { useEffect, useState } from 'react'
import remove from 'lodash/remove'
import { DAYS } from '../../utils/date'
import Button from './Button'
import ValidationErrorMessage from './ValidationErrorMessage'

export default function WeekDayPicker({ name, validate, label, optional = false }) {
    const [days, setDays] = useState([])
    const { setFieldValue, values } = useFormikContext()

    useEffect(() => setDays(values.days), [values.days])

    function onPickDay(day) {
        const newDays = days.indexOf(day.key) === -1 ? [...days, day.key] : remove(days, (item) => item !== day.key)
        setDays(newDays)
        setFieldValue(name, newDays)
    }

    return (
        <div className="field">
            <div className="control">
                {label ? (
                    <div>
                        {label} &nbsp;
                        {optional ? <span className="form-hint">не обязательно</span> : null}
                    </div>
                ) : null}

                <Field name={name} validate={validate}>
                    {() => DAYS.map((day) => (
                        <Button
                            text={day.shortTitle}
                            key={day.key}
                            onClick={() => onPickDay(day)}
                            className={cn(
                                css(styles.day),
                                days.indexOf(day.key) === -1 ? 'is-light' : 'is-link',
                            )} />
                    ))}
                </Field>

                <ValidationErrorMessage name={name} />
            </div>
        </div>
    )
}

const styles = StyleSheet.create({
    day: {
        width: '35px',
        marginRight: '10px',
    },
})
