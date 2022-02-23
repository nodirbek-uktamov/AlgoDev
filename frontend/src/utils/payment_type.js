import filter from 'lodash/filter'

const paymentTypes = [
    { name: '💵 Cash', value: 'cash' },
    { name: '💳 Terminal', value: 'terminal' },
    { name: 'Click', value: 'click' },
    { name: '💳 Payme', value: 'payme' },
    { name: '💳 Rave by Flutterwave', value: 'rave_by_flutterwave' },
    { name: 'Apelsin', value: 'apelsin' },
    { name: 'Stripe', value: 'stripe' },
    { name: 'Yandex.Money', value: 'yandex_money' },
    { name: 'Sberbank', value: 'sberbank' },
    { name: 'Tranzzo', value: 'tranzzo' },
    { name: 'Liqpay', value: 'liqpay' },
]

export function paymentType(name) {
    return filter(paymentTypes, { value: name })[0].name
}
