/* eslint-disable no-restricted-syntax */
import moment from 'moment'
import { integersOnly } from './number'

/* eslint-disable consistent-return */

function empty(value) {
    return value === '' || value === null || value === undefined || value.length === 0
}

export function required(value) {
    if (empty(value)) {
        return 'This field is required'
    }
}

export function maxNumber(limit) {
    return (value) => {
        if (value > limit) {
            return `Максимальное значение ${limit}`
        }
    }
}

export function passwordConfirmValidator(password) {
    return (value) => {
        if (value !== password) {
            return 'Пароли не совпадают'
        }
    }
}

export function minTime(startTime) {
    return (endTime) => {
        const valueStartTime = new Date(`2018.01.01 ${startTime}`).getTime()
        const valueEndTime = new Date(`2018.01.01 ${endTime}`).getTime()
        if (valueStartTime > valueEndTime) {
            return 'Урок не может закончиться прежде чем начаться.'
        }
    }
}

export function usernameValidator(value) {
    if (!value) return
    const regex = /^[a-zA-Z0-9]+$/

    if (empty(value)) {
        return
    }

    if (!regex.test(value)) {
        return 'Invalid username'
    }
}
export function email(value) {
    if (!value) return
    const regx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (empty(value)) {
        return
    }

    if (!regx.test(value)) {
        return 'Invalid email'
    }
}

export function phone(value) {
    if (!value) return
    const integers = integersOnly(value)

    if (integers.length !== 12) {
        return 'Номер телефона должен состоять из 12 цифр'
    }
}

export function card(value) {
    if (!value) return
    const integers = integersOnly(value)

    if (integers.length !== 16) {
        return 'Номер пластиковой карты должен состоять из 16 цифр'
    }
}

function isNumber(value) {
    return /^-?\d*(\.\d+)?$/.test(value)
}

export function number(value) {
    if (!isNumber(value)) {
        return 'This field should be number'
    }
}

export function max(size) {
    return (value) => {
        if (isNumber(value) && parseFloat(value) > size) {
            return `This field should be less then "${size}"`
        }
    }
}

export function min(size) {
    return (value) => {
        if (isNumber(value) && parseFloat(value) < size) {
            return `This field should be greater then "${size}"`
        }
    }
}

export function maxLength(size) {
    return (value) => {
        if (value.length > size) {
            return `This field should contain less then "${size}" chars.`
        }
    }
}

export function minLength(size) {
    return (value) => {
        if ((value || '').length <= size) {
            return `Это поле должно содержать более "${size}" символов.`
        }
    }
}

export function date(v) {
    const value = v || ''
    const days = value.split('.')[0]
    const months = value.split('.')[1]
    const years = value.split('.')[2]
    const date = moment(`${years}-${months}-${days}`)
    if (!date.isValid() || years.length !== 4 || months.length !== 2 || days.length !== 2) return 'Неверная дата'
}

export function validator(...validators) {
    return (value) => {
        for (const fn of validators) {
            const message = fn(value)
            if (message) return message
        }
    }
}

export function validateForm(rules) {
    return (data) => {
        const errors = {}
        for (const key of Object.keys(rules)) {
            const message = rules[key](data[key])
            if (message) {
                errors[key] = message
            }
        }
        return errors
    }
}
