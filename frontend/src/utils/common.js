export function isTruthy(t) {
    return !!t;
}

export function isEmpty(el) {
    if (!el) return true;
    if (el.constructor === Object) return Object.keys(el).length === 0;
}

export function generateLadderPrice(values, index) {
    const endPrice = values.ladder_end_price
    const startPrice = values.ladder_start_price

    const price = startPrice + index * (endPrice - startPrice) / (values.ladder_trades_count + 1)

    return Number(price)
}
