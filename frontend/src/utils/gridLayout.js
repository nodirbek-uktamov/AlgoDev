export const defaultLayout = [
    {
        w: 20,
        h: 5,
        x: 0,
        y: 0,
        i: '1',
        moved: false,
        static: false,
    },
    {
        w: 19,
        h: 2,
        x: 1,
        y: 5,
        i: '2',
        moved: false,
        static: false,
    },
    {
        w: 17,
        h: 4,
        x: 64,
        y: 0,
        i: '4',
        moved: false,
        static: false,
    },
    {
        w: 19,
        h: 5,
        x: 81,
        y: 0,
        i: '5',
        moved: false,
        static: false,
    },
    {
        w: 44,
        h: 4,
        x: 20,
        y: 0,
        i: '6',
        moved: false,
        static: false,
    },
    {
        w: 60,
        h: 3,
        x: 21,
        y: 4,
        i: '7',
        moved: false,
        static: false,
    },
]

export function getDefaultLayout(exchange) {
    const savedLayout = localStorage.getItem(`${exchange}_default_layout`)
    if (savedLayout) return JSON.parse(savedLayout)

    return defaultLayout
}
