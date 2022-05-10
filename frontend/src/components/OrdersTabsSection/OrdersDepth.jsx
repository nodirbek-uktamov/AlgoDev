import React, {useContext, useEffect, useState} from 'react'
import { css, StyleSheet } from 'aphrodite'
import cn from 'classnames'
import {MainContext} from "../../contexts/MainContext";

function OrdersDepth({ botPrices }) {
    const {symbolSettings, wsCallbacksRef} = useContext(MainContext)
    const { tpp, tap } = symbolSettings
    const [book, setBook] = useState(null)

    useEffect(() => {
        wsCallbacksRef.current.setBook = setBook
        // eslint-disable-next-line
    }, [])

    function isActive(price, tradeType) {
        return Object.values(botPrices).filter((i) => Number(i.price.price) === price && i.price.trade_type === tradeType).length > 0
    }

    function RenderItem({ item, tradeType }) {
        return (
            <div className={cn('columns m-0 p-0', isActive(item[0], tradeType) && css(styles.activePrice))}>
                <p style={{ width: 90 }} className="column is-narrow m-0 p-0">{item[0].toFixed(tpp)}</p>
                <p className="column m-0 p-0">{item[1].toFixed(tap)}</p>
            </div>
        )
    }

    return book ? (
        <div className="mt-3 p-4" style={{ backgroundColor: '#141826' }}>
            <div>
                <div style={{ color: '#FA4D56' }}>
                    {book.asks.slice(0, 10).reverse().map((item) => (
                        <RenderItem tradeType="sell" item={item} />
                    ))}
                </div>

                <div className="mt-2" style={{ color: '#00B464' }}>
                    {book.bids.slice(0, 10).map((item) => (
                        <RenderItem tradeType="buy" item={item} />
                    ))}
                </div>
            </div>
        </div>
    ) : null
}

const styles = StyleSheet.create({
    activePrice: {
        fontWeight: '700',
        textDecoration: 'underline',
    },
})

export default React.memo(OrdersDepth)
