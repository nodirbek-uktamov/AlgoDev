export function getHeight(id) {
    const element = document.getElementById(id)
    return element ? element.offsetHeight : 300
}
