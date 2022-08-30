export function getHeight(id, addValue = -50) {
    const element = document.getElementById(id)

    // -50 is header height
    return element ? element.offsetHeight + addValue : 300
}

export const updateFormPrices = (price, setTradeFormValue) => {
    setTradeFormValue('price', price)
    setTradeFormValue('iceberg_price', price)
    setTradeFormValue('stop_price', price)
    setTradeFormValue('grid_start_price', price)
    setTradeFormValue('grid_end_price', price)
    setTradeFormValue('ladder_start_price', price)
    setTradeFormValue('ladder_end_price', price)
}
