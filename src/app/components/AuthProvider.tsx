'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { JwtPayload, jwtDecode } from 'jwt-decode'
import { isEmpty } from 'lodash'
import { UserbackProvider } from '@userback/react'

const AuthProvider = ({ children }: any) => {
    const router = useRouter()
    const pathname = usePathname()
    useEffect(() => {
        const exemptedPaths = ['/lost-password', '/reset-password', '/redirect']
        if (!exemptedPaths.includes(pathname)) {
            const token = localStorage.getItem('sl-jwt') ?? ''
            if (isEmpty(token)) {
                router.push('/login')
            } else {
                const decoded = jwtDecode<JwtPayload>(token)
                const { exp } = decoded
                if (Date.now() >= exp! * 1000 * 7 * 24) {
                    // Expired token
                    router.push('/login')
                }
            }
        }
    }, [router, pathname])
    return (
        <UserbackProvider token="P-otInIwsjplJMgK8EfvZiYsT3R">
            <>{children}</>
        </UserbackProvider>
    )
}

export default AuthProvider
