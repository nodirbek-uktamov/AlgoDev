import React from 'react'
import range from 'lodash/range'
import cn from 'classnames'
import useTrans from '../../hooks/trans'

export default function Pagination({ page = 1, count, pageSize = 15, onSelect }) {
    const current = parseInt(page, 10)
    const pagesNumber = Math.ceil(count / pageSize)
    const t = useTrans()

    if (count <= pageSize || count === undefined) {
        return null
    }

    return (
        <nav className="pagination columns is-mobile is-centered">
            {current - 1 > 0 ? (
                <span
                    onClick={() => onSelect(current - 1)}
                    className="pagination-previous is-narrow column is-mobile pointer">
                    &larr;&nbsp; {t('previous')}
                </span>
            ) : null}

            {current < pagesNumber ? (
                <span onClick={() => onSelect(current + 1)} className="pagination-next is-narrow column pointer">
                    {t('next')} &nbsp;&rarr;
                </span>
            ) : null}

            <ul className="pagination-list">
                {range(1, pagesNumber + 1).map((i) => (
                    <li key={i} onClick={() => onSelect(i)} className="pointer">
                        <span className={cn('pagination-link', { 'is-current': current === i })}>
                            {i}
                        </span>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
