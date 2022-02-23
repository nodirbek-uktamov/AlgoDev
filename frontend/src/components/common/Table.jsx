import { css, StyleSheet } from 'aphrodite'
import cn from 'classnames'
import queryString from 'query-string'
import isEmpty from 'lodash/isEmpty'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { useQueryParams } from '../../hooks/queryString'

import Loader from './Loader'
import Pagination from './Pagination'

export default function Table({
    loading = false,
    emptyMessage = 'Пусто',
    showEmptyMessage = true,
    totalCount,
    pageSize = 15,
    items,
    columns,
    renderItem,
    onPageChange,
    activePage,
    emptyMessageColor = null,
}) {
    const history = useHistory()
    const params = useQueryParams()

    if (loading) {
        return (
            <div className={css(styles.space)}>
                <Loader large center />
            </div>
        )
    }

    if (isEmpty(items) && showEmptyMessage) {
        const className = cn(
            emptyMessageColor || 'has-text-grey',
            'is-size-5 has-text-centered',
            css(styles.space),
        )
        return (
            <div
                className={className}>
                {emptyMessage}
            </div>
        )
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

            <Pagination
                page={activePage || params.page}
                onSelect={(page) => {
                    if (typeof onPageChange === 'function') {
                        onPageChange(page)
                        return
                    }
                    history.push(`?${queryString.stringify({ ...params, page })}`)
                }}
                count={totalCount}
                pageSize={pageSize} />
        </div>
    )
}


const styles = StyleSheet.create({
    space: {
        marginTop: '2rem',
    },
})
