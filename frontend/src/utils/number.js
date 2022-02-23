export function format(number) {
    return (typeof number === 'number') ? number.toLocaleString('fr') : number
}

export function integersOnly(value) {
    return value.replace(/[^0-9]/gim, '')
}
