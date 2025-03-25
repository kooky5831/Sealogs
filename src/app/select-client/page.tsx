'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SelectClientForm from '../ui/select-client/select-client-form'

const SelectClientPage = () => {
    const router = useRouter()
    const [superAdmin, setSuperAdmin] = useState(false)
    useEffect(() => {
        const superAdmin = localStorage.getItem('superAdmin')
        setSuperAdmin(superAdmin === 'true')
        if (superAdmin !== 'true') {
            router.push('/login')
        }
    }, [])

    return <div>{superAdmin && <SelectClientForm />}</div>
}

export default SelectClientPage
