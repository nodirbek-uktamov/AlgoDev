export function onChangeSlider(value, setSliderValue, balance, symbol, setFieldValue) {
    setSliderValue(value)

    const newAmount = ((balance[symbol.pair2.toLowerCase()] || 0) * value) / 100
    setFieldValue('quantity', newAmount.toFixed(symbol.tap || 0))
}

export function calcPair1Amount(values, botType, symbol, initialPrice) {
    let amount = values.quantity

    if (botType.key === 'iceberg') {
        amount = values.iceberg_price ? amount / values.iceberg_price : 0
    } else if (botType.key === 'limit' && values.price) {
        amount /= values.price
    } else {
        amount /= initialPrice
    }

    return amount.toFixed(symbol.tap || 0)
}
