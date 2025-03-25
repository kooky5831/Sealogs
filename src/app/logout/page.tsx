'use client'

import React, { useEffect } from 'react'
import Loading from '../loading'
import { useRouter } from 'next/navigation'

const Logout = () => {
    const router = useRouter()
    useEffect(() => {
        localStorage.removeItem('sl-jwt')
        localStorage.removeItem('firstName')
        localStorage.removeItem('surname')
        localStorage.removeItem('userId')
        localStorage.removeItem('superAdmin')
        localStorage.removeItem('admin')
        localStorage.removeItem('clientId')
        localStorage.removeItem('useDepartment')
        localStorage.removeItem('clientTitle')
        localStorage.removeItem('departmentId')
        localStorage.removeItem('departmentTitle')
        localStorage.removeItem('availableClients')
        localStorage.removeItem('permissions')
        localStorage.removeItem('crew')
        router.push('/login')
    }, [router])
    return (
        <>
            <Loading message="Logging you out ..." />
        </>
    )
}

export default Logout
