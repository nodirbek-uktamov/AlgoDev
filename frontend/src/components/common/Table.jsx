import { css, StyleSheet } from 'aphrodite'
import isEmpty from 'lodash/isEmpty'
import React, { Fragment } from 'react'

import Loader from './Loader'

export default function Table({
    loading = false,
    showEmptyMessage = true,
    items,
    columns,
    renderItem,
}) {
    if (loading) {
        return (
            <div className={css(styles.space)}>
                <Loader large center />
            </div>
        )
    }

    if (isEmpty(items) && showEmptyMessage) {
        return <Fragment />
    }

    return (
        <div>
            <table className="table is-striped is-fullwidth">
                <tbody>
                    {columns ? (
                        <tr>
                            {Object.entries(columns).map(([key, value]) => (
                                <th key={key}>{value}</th>
                            ))}
                        </tr>
                    ) : null}

                    {items.map(renderItem)}
                </tbody>
            </table>
        </div>
    )
}


const styles = StyleSheet.create({
    space: {
        marginTop: '2rem',
    },
})
