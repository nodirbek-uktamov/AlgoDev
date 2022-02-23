export function auth() {
    return {
        headers: {
            Authorization: `Token ${localStorage.token}`,
        },
    }
}

let permissions

export function checkPermission(permission) {
    if (!permissions) {
        permissions = JSON.parse(localStorage.getItem('permissions'))
    }

    return permissions.includes(permission)
}


export function clearPermissions() {
    permissions = undefined
}

export function signin({ user, token, permissions: userPermissions }, history) {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    localStorage.setItem('language', 'ru')
    localStorage.setItem('permissions', JSON.stringify(userPermissions))
    history.push('/')
}

export function signOut(history) {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('permissions')
    clearPermissions()
    history.push('/')
}

export function isAuthenticated() {
    return localStorage.getItem('user')
        && localStorage.getItem('token')
}
