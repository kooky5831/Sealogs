'use client'
import LogbookConfig from '@/app/ui/vessels/config'
import { useSearchParams } from 'next/navigation'
const VesselInfo = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('logBookID') ?? 0
    const vesselID = searchParams.get('vesselID') ?? 0
    return <LogbookConfig logBookID={+id} vesselID={+vesselID} />
}

export default VesselInfo
