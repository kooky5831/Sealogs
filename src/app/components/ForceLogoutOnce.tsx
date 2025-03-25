import { useEffect } from 'react'

const forceLogoutOnce = (key: string, fn: () => void) => {
    useEffect(() => {
        const storedValue = localStorage.getItem(key)
        if (storedValue === null) {
            fn()
            localStorage.setItem(key, 'true')
        }
    }, [key, fn])
}

export default forceLogoutOnce
