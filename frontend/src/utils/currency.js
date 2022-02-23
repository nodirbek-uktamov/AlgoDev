import filter from 'lodash/filter'

export const currencies = [
    { name: 'sumCurrency', value: 'UZS' },
    { name: 'rubleCurrency', value: 'RUB' },
    { name: 'tengeCurrency', value: 'KZT' },
    { name: 'hryvniaCurrency', value: 'UAH' },
    // { name: 'belarusian_rubleCurrency', value: 'belarusian_ruble' },
    { name: 'somCurrency', value: 'KGS' },
    { name: 'somoniCurrency', value: 'TJS' },
    { name: 'manatCurrency', value: 'AZN' },
    { name: 'afghaniCurrency', value: 'AFN' },
    { name: 'usaDollarCurrency', value: 'USD' },
    { name: 'koreanWon', value: 'KRW' },
]

export function currency(items, name) {
    const filteredCurrency = filter(items, { value: name })[0] || {}
    return filteredCurrency.name || ''
}

export const monthPrice = 6.9
