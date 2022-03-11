import React from 'react'
import Select from 'react-select'
import { css, StyleSheet } from 'aphrodite'


export default function ReactSelect({ options, onChange, defaultValue, className }) {
    if (options.length === 0) return <div />

    const sortedOptions = options.sort((a, b) => {
        if (a.value < b.value) { return -1 }
        if (a.value > b.value) { return 1 }
        return 0
    })

    return (
        <Select
            className={`basic-single ${css(styles.container)} ${className}`}
            onChange={(data) => onChange(data.value)}
            classNamePrefix="select"
            defaultValue={options.filter((i) => i.value === defaultValue)}
            name="color"
            options={sortedOptions} />
    )
}

const styles = StyleSheet.create({
    container: {
        width: 200,
    },
})
