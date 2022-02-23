import { gunzip, strFromU8 } from 'fflate'

export function parseGzip(event, f) {
    const fr = new FileReader()

    fr.onload = function () {
        gunzip(
            new Uint8Array(fr.result),
            (err, raw) => {
                if (err) {
                    console.error(err)
                    return {}
                }
                const data = JSON.parse(strFromU8(raw))
                f(data)
                // Use the data variable however you wish
            },
        )
    }
    fr.readAsArrayBuffer(event.data)
}
