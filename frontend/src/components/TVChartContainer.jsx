import * as React from 'react'
import { widget } from '../charting_library'
import Datafeed from '../utils/datafeeds/ftx'

function getLanguageFromURL() {
    const regex = new RegExp('[\\?&]lang=([^&#]*)')
    const results = regex.exec(window.location.search)
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

export class TVChartContainer extends React.PureComponent {
    static defaultProps = {
        libraryPath: '/charting_library/',
        chartsStorageUrl: 'https://saveload.tradingview.com',
        chartsStorageApiVersion: '1.1',
        clientId: 'tradingview.com',
        userId: 'public_user_id',
        fullscreen: false,
        autosize: true,
        studiesOverrides: {},
    }

    tvWidget = null

    constructor(props) {
        super(props)

        this.ref = React.createRef()
    }

    componentDidMount() {
        this.init()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.symbol !== this.props.symbol) {
            // console.log(this.props.symbol)
            if (this.tvWidget && this.tvWidget.activeChart()) {
                this.tvWidget.activeChart().setSymbol(this.props.symbol)
            }
        }

        if (prevProps.interval !== this.props.interval) {
            this.removeChart()
            this.init()
        }
    }

    componentWillUnmount() {
        this.removeChart()
    }

    removeChart = () => {
        if (this.tvWidget !== null) {
            this.tvWidget.remove()
            this.tvWidget = null
        }
    }

    init = () => {
        const widgetOptions = {
            symbol: this.props.symbol,
            // BEWARE: no trailing slash is expected in feed URL
            datafeed: this.props.datafeed,
            interval: this.props.interval,
            container: this.ref.current,
            library_path: this.props.libraryPath,

            locale: getLanguageFromURL() || 'en',
            enabled_features: ['study_templates'],
            charts_storage_url: this.props.chartsStorageUrl,
            charts_storage_api_version: this.props.chartsStorageApiVersion,
            client_id: this.props.clientId,
            user_id: this.props.userId,
            fullscreen: this.props.fullscreen,
            autosize: this.props.autosize,
            studies_overrides: this.props.studiesOverrides,
            theme: 'Dark',
        }

        const tvWidget = new widget(widgetOptions)
        this.tvWidget = tvWidget

        tvWidget.onChartReady(() => {
            if (typeof this.props.setWidget === 'function') this.props.setWidget(tvWidget)
        })
    }

    render() {
        return (
            <div
                ref={this.ref}
                className={'TVChartContainer'}
            />
        )
    }
}
