import React, { useContext, useEffect, useState } from 'react'
import { css, StyleSheet } from 'aphrodite'
import cn from 'classnames'
import { MainContext } from '../../contexts/MainContext'
import { getHeight, updateFormPrices } from '../../utils/helpers'

function OrdersDepth({ botPrices }) {
    const { symbol, wsCallbacksRef, callbacks } = useContext(MainContext)
    const { tpp, tap } = symbol
    const [book, setBook] = useState(null)

    useEffect(() => {
        wsCallbacksRef.current.setBook = setBook
        // eslint-disable-next-line
    }, [])

    function isActive(price, tradeType) {
        return Object.values(botPrices).filter((i) => Number(i.price.price) === price && i.price.trade_type === tradeType).length > 0
    }

    function RenderItem({ item, tradeType, color }) {
        return (
            <div className={cn('columns m-0 p-0 is-justify-content-space-between', isActive(item[0], tradeType) && css(styles.activePrice))}>
                <p
                    onMouseDown={() => updateFormPrices(item[0], callbacks.current.setTradeFormValue)}
                    style={{ color }}
                    className="column is-narrow m-0 p-0 pointer">
                    {item[0].toFixed(tpp)}
                </p>

                <p className="column m-0 p-0 is-narrow">{item[1].toFixed(tap)}</p>
            </div>
        )
    }

    const columns = [
        {
            width: '50%',
            title: `Price (${symbol.pair2})`,
        },
        {
            width: '50%',
            title: `Value (${symbol.pair1})`,
        },
    ]

    const containerHeight = getHeight('depth-tab-component-container', 0) - getHeight('depth-tab-component-form', 0) - 15
    const orderbookHeight = containerHeight - getHeight('order-book-header', 0)

    const ordersCountOnEachSide = (orderbookHeight / 700) * 30
    const asks = book ? book.asks.slice(0, ordersCountOnEachSide) : []
    const bids = book ? book.bids.slice(0, ordersCountOnEachSide) : []

    console.log()

    return (
        <div style={{ height: containerHeight }}>
            <div className="is-flex" id="order-book-header">
                {columns.map((column) => (
                    <p
                        className="table_headerCell"
                        style={{ width: column.width, textAlign: 'center', verticalAlign: 'bottom', fontWeight: 700 }}
                        key={column.key}>
                        {column.title}
                    </p>
                ))}
            </div>

            {book && (
                <div className="p-4" style={{ backgroundColor: '#000', height: orderbookHeight }}>
                    <div style={{ height: 'calc(50% - 1rem)', overflow: 'hidden', display: 'flex', flexFlow: 'column-reverse wrap' }} className="mp-1">
                        {asks.map((item) => (
                            <div className="change-ask-book" style={{ width: '100%' }} key={item}>
                                <RenderItem color="#FF0000" tradeType="sell" item={item} />
                            </div>
                        ))}
                    </div>

                    <div className="my-2 has-text-weight-bold is-size-5">
                        {asks[0] && bids[0] ? ((asks[0][0] + bids[0][0]) / 2).toFixed(tpp) : '—'}
                    </div>

                    <div style={{ height: 'calc(50% - 1rem)', overflow: 'hidden', display: 'flex', flexFlow: 'column wrap' }}>
                        {bids.map((item) => (
                            <div className="change-bid-book" style={{ width: '100%' }} key={item}>
                                <RenderItem color="#02C77A" tradeType="buy" item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

const styles = StyleSheet.create({
    activePrice: {
        fontWeight: '700',
        textDecoration: 'underline',
    },
})

export default React.memo(OrdersDepth)
