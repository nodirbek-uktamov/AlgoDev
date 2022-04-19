import moment from 'moment'
import filter from 'lodash/filter'

export const DATE_FORMAT = 'DD-MM-YYYY'
export const DATE_AUTO_FORMAT = 'YYYY-MM-DD'
export const DATETIME_FORMAT = 'HH:mm DD.MM.YYYY'

export const DAYS = [
    { key: 'monday', title: 'Понедельник', shortTitle: 'Пн' },
    { key: 'tuesday', title: 'Вторник', shortTitle: 'Вт' },
    { key: 'wednesday', title: 'Среда', shortTitle: 'Ср' },
    { key: 'thursday', title: 'Четверг', shortTitle: 'Чт' },
    { key: 'friday', title: 'Пятница', shortTitle: 'Пт' },
    { key: 'saturday', title: 'Суббота', shortTitle: 'Сб' },
    { key: 'sunday', title: 'Воскресенье', shortTitle: 'Вс' },
]

export function day(dayKey) {
    return filter(DAYS, { key: dayKey })[0]
}

export function getMonth(date = new Date(), withYear = false) {
    const format = withYear ? 'MMMM YYYY' : 'MMMM'
    const month = moment(date).format(format)
    return (month)[0].toUpperCase() + (month).slice(1)
}

export function getDay(date = new Date(), withYear = false) {
    const format = withYear ? 'DD MMMM YYYY' : 'DD'
    const days = moment(date).format(format)
    return (days)[0].toUpperCase() + (days).slice(1)
}

export function getDateTime(date = new Date()) {
    return moment(date).format(DATETIME_FORMAT)
}

export function getDate(date = new Date()) {
    return moment(date).format(DATE_FORMAT)
}

export function getDateOtherFormat(date = new Date()) {
    return moment(date).format(DATE_AUTO_FORMAT)
}

export function convertTimestamp(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    const hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}
