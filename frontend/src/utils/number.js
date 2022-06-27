export function format(number) {
    return (typeof number === 'number') ? number.toLocaleString('fr') : number
}

export function integersOnly(value) {
    return value.replace(/[^0-9]/gim, '')
}

export function getDecimalsCount(num) {
    if (Number.isInteger(num)) {
        return 0;
    }

    const decimalStr = num.toString().split('.')[1];
    console.log(num)
    return decimalStr.length;
}
