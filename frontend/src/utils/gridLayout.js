export const defaultLayout = [
    {
        w: 18,
        h: 26,
        minH: 26,
        minW: 18,
        x: 0,
        y: 0,
        i: '1',
    },
    {
        w: 18,
        h: 20,
        x: 0,
        y: 5,
        minH: 10,
        minW: 18,
        i: '2',
    },
    {
        w: 17,
        h: 33,
        x: 64,
        y: 0,
        i: '4',
        minH: 30,
    },
    {
        w: 19,
        h: 45,
        x: 81,
        y: 0,
        i: '5',
    },
    {
        w: 46,
        h: 26,
        x: 18,
        y: 0,
        i: '6',
    },
    {
        w: 46,
        h: 16,
        x: 18,
        y: 0,
        minH: 16,
        i: '7',
    },
]

export function getDefaultLayout(exchange) {
    // const savedLayout = localStorage.getItem(`${exchange}_default_layout`)
    // if (savedLayout) return JSON.parse(savedLayout)

    return defaultLayout
}
