import React from 'react'
import Select from 'react-select'
import { css, StyleSheet } from 'aphrodite'


export default function SearchableSelect({ options, onChange, defaultSymbol }) {
    if (options.length === 0) return <div />

    return (
        <Select
            className={`basic-single ${css(styles.container)}`}
            onChange={(data) => onChange(data.value.toLowerCase())}
            classNamePrefix="select"
            defaultValue={options.filter((i) => i.value === defaultSymbol.toUpperCase())}
            name="color"
            options={options} />
    )
}

const styles = StyleSheet.create({
    container: {
        width: 200,
    },
})
