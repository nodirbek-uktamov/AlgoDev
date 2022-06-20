export function onChangeSlider(value, setSliderValue, balance, symbol, setFieldValue, symbolSettings) {
    setSliderValue(value)

    const newAmount = (balance[symbol.pair2.toLowerCase()] || 0) * value / 100
    setFieldValue('quantity', newAmount.toFixed(symbolSettings.tap || 0))
}

export function calcPair1Amount(values, botType, symbolSettings, initialPrice) {
    let amount = values.quantity

    if (botType.key === 'iceberg') {
        amount = values.iceberg_price ? amount / values.iceberg_price : 0
    }
    else if (botType.key === "limit" && values.price) {
        amount = amount / values.price
    }
    else {
        amount = amount / initialPrice
    }

    return amount.toFixed(symbolSettings.tap || 0)
}
