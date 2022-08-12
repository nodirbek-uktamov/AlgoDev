export function getHeight(id) {
    const element = document.getElementById(id)
    return element ? element.offsetHeight : 300
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
