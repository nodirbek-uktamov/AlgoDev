import pako from 'pako'

export function parseGzip(event, f) {
    const blob = event.data
    const reader = new FileReader()

    reader.onload = function (e) {
        const ploydata = new Uint8Array(e.target.result)
        const msg = pako.inflate(ploydata, { to: 'string' })
        f(msg)
    }
    reader.readAsArrayBuffer(blob, 'utf-8')
}


export const WS_TYPES = {
    bidAsk: 'market.{symbol}.bbo',
    orders: 'market.{symbol}.trade.detail',
    book: 'market.{symbol}.depth.{type}',
}
