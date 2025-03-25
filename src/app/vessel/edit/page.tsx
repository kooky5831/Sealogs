'use client'
import { preventCrewAccess } from '@/app/helpers/userHelper'
import EditVessel from '@/app/ui/vessels/edit'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
export default function Page() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id') ?? 0

    useEffect(() => {
        preventCrewAccess()
    }, [])
    return <EditVessel vesselId={+id} />
}
