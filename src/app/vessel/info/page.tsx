'use client'
import VesselsView from '@/app/ui/vessels/view'
import { useSearchParams } from 'next/navigation'
const VesselInfo = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id') ?? 0
    const vesselTab = searchParams.get('vesselTab') ?? null
    return <VesselsView vesselId={+id} tab={vesselTab} />
}

export default VesselInfo
