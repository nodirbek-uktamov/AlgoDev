import React from 'react'
import cn from 'classnames'
import { StyleSheet, css } from 'aphrodite'
import moment from 'moment'
import { DATE_AUTO_FORMAT } from '../../utils/date'

export default function DateRange({ startDate, endDate, onDatesChange }) {
    function onChange({ target }) {
        onDatesChange({
            startDate: moment(target.name === 'startDate' ? target.value : startDate).format(DATE_AUTO_FORMAT),
            endDate: moment(target.name === 'endDate' ? target.value : endDate).format(DATE_AUTO_FORMAT),
        })
    }

    return (
        <div className={cn('columns is-mobile', css(styles.wrapper))}>
            <div className="column">
                <input
                    name="startDate"
                    type="date"
                    value={startDate}
                    className="input"
                    onChange={onChange} />
            </div>

            <i className={cn('icon ion-md-arrow-forward column', css(styles.arrow))} />

            <div className="column">
                <input
                    name="endDate"
                    type="date"
                    value={endDate}
                    className="input"
                    onChange={onChange} />
            </div>
        </div>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        width: '10rem',
    },
    arrow: {
        margin: '0.2rem 0.6rem 0.4rem 0',
        fontSize: '1.4em',
    },
})
