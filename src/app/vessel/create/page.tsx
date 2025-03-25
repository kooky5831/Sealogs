'use client'
import { onlyAdminAccess } from '@/app/helpers/userHelper'
import EditVessel from '@/app/ui/vessels/edit'
import { useEffect } from 'react'

export default function Page() {
    useEffect(() => {
        onlyAdminAccess()
    }, [])
    return <EditVessel vesselId={0} />
}
