import React, {useContext, useEffect, useState} from 'react'
import {css, StyleSheet} from 'aphrodite'
import cn from 'classnames'
import {MainContext} from "../../contexts/MainContext";

function OrdersDepth({botPrices}) {
    const {symbolSettings, symbol, wsCallbacksRef, callbacks} = useContext(MainContext)
    const {tpp, tap} = symbolSettings
    const [book, setBook] = useState(null)

    useEffect(() => {
        wsCallbacksRef.current.setBook = setBook
        // eslint-disable-next-line
    }, [])

    function isActive(price, tradeType) {
        return Object.values(botPrices).filter((i) => Number(i.price.price) === price && i.price.trade_type === tradeType).length > 0
    }

    const onClickPrice = (item) => () =>  {
        callbacks.current.setTradeFormValue('price', item[0])
        callbacks.current.setTradeFormValue('iceberg_price', item[0])
        callbacks.current.setTradeFormValue('stop_price', item[0])
        callbacks.current.setTradeFormValue('grid_start_price', item[0])
        callbacks.current.setTradeFormValue('grid_end_price', item[0])
        callbacks.current.setTradeFormValue('ladder_start_price', item[0])
        callbacks.current.setTradeFormValue('ladder_end_price', item[0])
    }

    function RenderItem({item, tradeType, color}) {
        return (
            <div className={cn('columns m-0 p-0 is-justify-content-space-between', isActive(item[0], tradeType) && css(styles.activePrice))}>
                <p
                    onClick={onClickPrice(item)}
                    style={{color}}
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
            title: `Price (${symbol.pair2})`
        },
        {
            width: '50%',
            title: `Value (${symbol.pair1})`
        },
    ]

    const asks = book ? book.asks.slice(0, 10).reverse() : []
    const bids = book ? book.bids.slice(0, 10) : []

    return (
        <div>
            <tr className="table_head">
                {columns.map((column) => (
                    <th
                        className="table_headerCell"
                        style={{width: column.width, textAlign: 'center', verticalAlign: 'bottom', fontWeight: 700}}
                        key={column.key}>
                        {column.title}
                    </th>
                ))}
            </tr>

            {book && <div className="p-4" style={{backgroundColor: '#000'}}>
                <div>
                    <div>
                        {asks.map((item) => (
                            <RenderItem color="#FF0000" tradeType="sell" item={item}/>
                        ))}
                    </div>

                    <div className="my-2 has-text-weight-bold is-size-5">
                        {((asks[9][0] + bids[0][0]) / 2).toFixed(tpp)}
                    </div>

                    <div>
                        {bids.map((item) => (
                            <RenderItem color="#6afd0a" tradeType="buy" item={item}/>
                        ))}
                    </div>
                </div>
            </div>}
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
