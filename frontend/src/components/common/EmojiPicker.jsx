import cn from 'classnames'
import { Field, useFormikContext } from 'formik'
import React, { useEffect, useState } from 'react'
import { css, StyleSheet } from 'aphrodite'
import { NavLink } from 'react-router-dom'
import { categories } from '../../utils/emoji'
import Button from './Button'
import ValidationErrorMessage from './ValidationErrorMessage'


export default function EmojiPicker({ name, validate, onCancel, optional = false }) {
    const { setFieldValue, values } = useFormikContext()
    // eslint-disable-next-line
    const [value, setValue] = useState('')

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => setValue(values.emoji), [values.emoji])

    function setEmoji(emoji) {
        setValue(emoji)
        setFieldValue(name, emoji)
    }

    return (
        <div className="field">
            <div className="control">
                {optional ? <p className="form-hint">Не обязательно</p> : null}

                <Field name={name} validate={validate}>
                    {() => (
                        <div>
                            <div className="columns is-multiline">
                                {categories.map((category) => (
                                    <div
                                        className="column is-4-widescreen is-6-desktop is-12-tablet"
                                        key={category.name}>

                                        <div className={cn(css(styles.height), 'box')}>
                                            <h1 className="has-text-weight-bold">{category.name}</h1>

                                            {category.emojis.map((emoji) => (
                                                <span key={emoji} className={css(styles.emoji)}>
                                                    <NavLink to="#" onClick={() => {
                                                        setEmoji(emoji)
                                                        onCancel()
                                                    }}>
                                                        {emoji}
                                                    </NavLink>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => onCancel()}
                                icon="close-outline"
                                className="is-danger"
                                text="Отмена" />
                        </div>
                    )}
                </Field>

                <ValidationErrorMessage name={name} />
            </div>
        </div>
    )
}

const styles = StyleSheet.create({
    emoji: {
        padding: '3px',
    },
    height: {
        height: '100%',
    },
})
