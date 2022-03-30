import React, { useEffect, useState } from 'react'
import { OrderBook } from '@lab49/react-order-book'

export default function OrdersDepth({ wsCallbacksRef }) {
    const [book, setBook] = useState(null)

    useEffect(() => {
        wsCallbacksRef.current = { ...wsCallbacksRef.current, setBook }
        // eslint-disable-next-line
    }, [])


    return (
        <div className="mt-3">
            <style

                dangerouslySetInnerHTML={{
                    __html: `
            .MakeItNiceAgain {
              background-color: #151825;
              color: rgba(255, 255, 255, 0.6);
              display: inline-block;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              font-size: 13px;
              font-variant-numeric: tabular-nums;
              padding: 50px 0;
            }

            .MakeItNiceAgain__side-header {
              font-weight: 700;
              margin: 0 0 5px 0;
              text-align: right;
            }

            .MakeItNiceAgain__list {
              list-style-type: none;
              margin: 0;
              padding: 0;
            }

            .MakeItNiceAgain__list-item {
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              cursor: pointer;
              display: flex;
              justify-content: flex-end;
            }

            .MakeItNiceAgain__list-item:before {
              content: '';
              flex: 1 1;
              padding: 3px 5px;
            }

            .MakeItNiceAgain__side--bids .MakeItNiceAgain__list-item {
              flex-direction: row-reverse;
            }

            .MakeItNiceAgain__side--bids .MakeItNiceAgain__list-item:last-child {
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .MakeItNiceAgain__side--bids .MakeItNiceAgain__size {
              text-align: right;
            }

            .MakeItNiceAgain__list-item:hover {
              background: #262935;
            }

            .MakeItNiceAgain__price {
              border-left: 1px solid rgba(255, 255, 255, 0.1);
              border-right: 1px solid rgba(255, 255, 255, 0.1);
              color: #b7bdc1;
              display: inline-block;
              flex: 0 0 50px;
              margin: 0;
              padding: 3px 5px;
              text-align: center;
            }

            .MakeItNiceAgain__size {
              flex: 1 1;
              margin: 0;
              padding: 3px 5px;
              position: relative;
            }

            .MakeItNiceAgain__size:before {
              background-color: var(--row-color);
              content: '';
              height: 100%;
              left: 0;
              opacity: 0.08;
              position: absolute;
              top: 0;
              width: 100%;
            }
          `,
                }}
            />

            {book ? (
                <OrderBook
                    book={{
                        bids: book.bids,
                        asks: book.asks,
                    }}
                    fullOpacity
                    interpolateColor={(color) => color}
                    listLength={10}
                    stylePrefix="MakeItNiceAgain"
                    showSpread={false} />
            ) : null}
        </div>
    )
}
