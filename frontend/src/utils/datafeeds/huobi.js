import reverse from 'lodash/reverse'
import baseAxios from '../request'
import { auth } from '../auth'
import { FTX_FILLS_LIST, HUOBI_KLINES, HUOBI_SYMBOLS, PROXY_API } from '../../urls'

async function getAllSymbols() {
    const { data } = await baseAxios({ baseURL: HUOBI_SYMBOLS })

    let allSymbols = (data && data.data) || []

    allSymbols = allSymbols.map((symbol) => ({
        ...symbol,
        symbol: symbol.dn,
        full_name: symbol.dn,
        description: symbol.dn,
        exchange: 'Huobi',
        type: 'crypto',
    }))

    return allSymbols
}

export const HUOBI_RESOLUTIONS = {
    1: '1min',
    5: '5min',
    15: '15min',
    60: '60min',
    240: '4hour',
    '1D': '1day',
    '1W': '1week',
    '1M': '1month',
}

const configurationData = {
    supported_resolutions: Object.keys(HUOBI_RESOLUTIONS),
    exchanges: [],
}

const lastBarsCache = new Map()
const data = {}

export default {
    onReady: (callback) => {
        callback(configurationData)
    },

    searchSymbols: async (
        userInput,
        exchange,
        symbolType,
        onResultReadyCallback,
    ) => {
        let symbols

        if (data.symbols) {
            symbols = data.symbols
        } else {
            symbols = await getAllSymbols()
            data.symbols = symbols
        }

        const newSymbols = symbols.filter((symbol) => symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1)
        onResultReadyCallback(newSymbols)
    },

    resolveSymbol: async (
        symbolName,
        onSymbolResolvedCallback,
        onResolveErrorCallback,
    ) => {
        let symbols

        if (data.symbols) {
            symbols = data.symbols
        } else {
            symbols = await getAllSymbols()
            data.symbols = symbols
        }

        const symbolItem = symbols.find(({ full_name }) => full_name === symbolName)

        if (!symbolItem) {
            onResolveErrorCallback('cannot resolve symbol')
            return
        }

        const symbolInfo = {
            ticker: symbolItem.full_name,
            name: symbolItem.symbol,
            description: symbolItem.description,
            type: symbolItem.type,
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: symbolItem.exchange,
            minmov: 1,
            pricescale: 10 ** symbolItem.tpp,
            has_intraday: true,
            has_no_volume: true,
            has_weekly_and_monthly: false,
            supported_resolutions: configurationData.supported_resolutions,
            volume_precision: symbolItem.tap,
            data_status: 'streaming',
        }

        onSymbolResolvedCallback(symbolInfo)
    },

    getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        const { from, to, firstDataRequest } = periodParams

        try {
            const { data } = await baseAxios({ url: HUOBI_KLINES.replace('{symbol}', symbolInfo.name.toLowerCase().replace('/', '')).replace('{size}', 2000).replace('{period}', HUOBI_RESOLUTIONS[resolution]) })

            if (data.status !== 'ok') {
                // "noData" should be set if there is no data in the requested period.
                onHistoryCallback([], {
                    noData: true,
                })
                return
            }

            let bars = [];

            (data.data || []).map((bar) => {
                const time = bar.id

                if (time >= from && time < to) {
                    bars = [...bars, { ...bar, time: time * 1000 }]
                }
            })

            bars = reverse(bars)

            if (firstDataRequest) {
                lastBarsCache.set(symbolInfo.full_name, {
                    ...bars[bars.length - 1],
                })
            }

            if (bars.length === 0) {
                onHistoryCallback([], {
                    noData: true,
                })
            }
            onHistoryCallback(bars, {
                noData: false,
            })
        } catch (error) {
            console.log('[getBars]: Get error', error)
            onErrorCallback(error)
        }
    },

    unsubscribeBars: (subscriberUID) => {

    },
}
