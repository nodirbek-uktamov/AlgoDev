export function isTruthy(t) {
    return !!t;
}

export function isEmpty(el) {
    if (!el) return true;
    if (el.constructor === Object) return Object.keys(el).length === 0;
}