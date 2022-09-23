import baseAxios from '../request'
import { auth } from '../auth'
import { FTX_FILLS_LIST, FTX_SYMBOLS, PROXY_API } from '../../urls'
import { LOCAL_LOAD_CANDLE_DETAIL_INTERVAL } from '../../constants'

async function getAllSymbols() {
    const { data } = await baseAxios({ ...auth(), url: FTX_SYMBOLS })

    let allSymbols = (data && data.result) || []

    allSymbols = allSymbols.map((symbol) => ({
        ...symbol,
        symbol: symbol.name,
        full_name: symbol.name,
        description: symbol.name,
        exchange: 'FTX',
        type: symbol.type,
    }))

    return allSymbols
}

export const FTX_RESOLUTIONS = {
    1: 60,
    5: 300,
    15: 900,
    60: 900,
    240: 14400,
    '1D': 86400,
    '1W': 604800,
}

const configurationData = {
    supported_resolutions: Object.keys(FTX_RESOLUTIONS),
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
            pricescale: 10 ** symbolItem.priceIncrement,
            has_intraday: true,
            has_no_volume: true,
            has_weekly_and_monthly: false,
            supported_resolutions: configurationData.supported_resolutions,
            volume_precision: symbolItem.sizeIncrement,
            data_status: 'streaming',
        }

        onSymbolResolvedCallback(symbolInfo)
    },

    getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        const { from, to, firstDataRequest } = periodParams

        try {
            const { data } = await baseAxios({ ...auth(), url: PROXY_API, params: { url: `https://ftx.com/api/markets/${symbolInfo.name}/candles?resolution=${FTX_RESOLUTIONS[resolution]}&start_time=${from}&end_time=${to}` } })

            if (!data.success) {
                // "noData" should be set if there is no data in the requested period.
                onHistoryCallback([], {
                    noData: true,
                })
                return
            }

            let bars = [];

            (data.result || []).map((bar) => {
                if (bar.time / 1000 >= from && bar.time / 1000 < to) {
                    bars = [...bars, bar]
                }
            })

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

    subscribeBars: (
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscribeUID,
        onResetCacheNeededCallback,
    ) => {
        if (data.interval) clearInterval(data.interval)

        data.interval = setInterval(async () => {
            const { data } = await baseAxios({ ...auth(), url: PROXY_API, params: { url: `https://ftx.com/api/markets/${symbolInfo.name}/candles/last?resolution=${FTX_RESOLUTIONS[resolution]}` } })

            if (data.success) {
                onRealtimeCallback(data.result)
            }
        }, window.location.hostname === 'localhost' ? LOCAL_LOAD_CANDLE_DETAIL_INTERVAL : 1000)
    },

    unsubscribeBars: (subscriberUID) => {
        if (data.interval) clearInterval(data.interval)
    },
    getMarks: async (symbolInfo, from, to, onDataCallback, resolution) => {
        const { data } = await baseAxios({ ...auth(), url: FTX_FILLS_LIST, params: { market: symbolInfo.name, start_time: from, end_time: to } })

        const results = data.map((item) => ({
            id: item.id,
            time: Math.floor(new Date(item.time).getTime() / 1000),
            color: 'red',
            text: item.size,
            label: 'label',
        }))

        onDataCallback(results)
    },
}
