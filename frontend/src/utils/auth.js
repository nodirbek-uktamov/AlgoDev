export function auth() {
    return {
        headers: {
            Authorization: `Token ${localStorage.token}`,
        },
    }
}

export function signin({ user, token }, history) {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    history.push('/')
}

export function signOut(history) {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    history.push('/')
}

export function isAuthenticated() {
    return localStorage.getItem('user')
        && localStorage.getItem('token')
}
