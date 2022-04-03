import React, { useEffect, useState } from 'react'
import { css, StyleSheet } from 'aphrodite'

function OrdersDepth({ wsCallbacksRef, tpp, botPrices }) {
    const [book, setBook] = useState(null)

    useEffect(() => {
        wsCallbacksRef.current = { ...wsCallbacksRef.current, setBook }
        // eslint-disable-next-line
    }, [])

    function isActive(price) {
        return Object.values(botPrices).filter((i) => Number(i.price) === price).length > 0
    }

    console.log(botPrices)

    return book ? (
        <div className="mt-3 p-4" style={{ backgroundColor: '#141826' }}>
            <div>
                {book.asks.slice(0, 10).reverse().map((i) => (
                    <div
                        key={i[0]}
                        className={isActive(i[0]) ? css(styles.activePrice) : null}
                        style={{ color: '#FA4D56' }}>{i[0].toFixed(tpp)}
                    </div>
                ))}

                <div className="mt-2">
                    {book.bids.slice(0, 10).map((i) => (
                        <div
                            key={i[0]}
                            className={isActive(i[0]) ? css(styles.activePrice) : null}
                            style={{ color: '#00B464' }}>
                            {i[0].toFixed(tpp)}
                        </div>
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
