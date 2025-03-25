export const isCrew = () => {
    const superAdmin = localStorage.getItem('superAdmin') === 'true'
    const admin = localStorage.getItem('admin') === 'true'
    const crew = localStorage.getItem('crew') === 'true'
    return !(superAdmin || admin) && crew
}

export const isAdmin = () => {
    const superAdmin = localStorage.getItem('superAdmin') === 'true'
    const admin = localStorage.getItem('admin') === 'true'
    return superAdmin || admin
}

export const isSuperAdmin = () => {
    return localStorage.getItem('superAdmin') === 'true'
}

export const preventCrewAccess = () => {
    if (isCrew()) {
        window.location.href = '/dashboard'
    }
}

export const onlyAdminAccess = () => {
    if (!isAdmin()) {
        window.location.href = '/dashboard'
    }
}

export const hasPermission = (code: string, permissions: any) => {
    return permissions.includes('ADMIN') || permissions.includes(code)
    // If we're rendering server side, we don't have access to localStorage
    // @TODO: Can we access the user's permissions from the server?
}

export const getPermissions = (code: string) => {
    if (typeof window !== 'undefined') {
        const permissions = JSON.parse(
            localStorage.getItem('permissions') || '[]',
        )
        return permissions
    } else {
        return false
    }
}

export const isLoggedIn = () => {
    return !!localStorage.getItem('sl-jwt')
}
