import React, { useRef, useEffect } from 'react'
import ChartJS from 'chart.js'
import 'chartjs-plugin-datalabels'
import Loader from './Loader'

export default function Chart({ loading, type, data, options, height = '50px' }) {
    const ref = useRef(null)

    useEffect(() => {
        if (ref.current) {
            // eslint-disable-next-line no-new
            new ChartJS(ref.current, {
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    ...options,
                },
                type,
                data,
            })
        }
    }, [data, type, options])

    if (loading) {
        return <Loader center large />
    }

    return (
        <div style={{ height }}>
            <canvas ref={ref} />
        </div>
    )
}
