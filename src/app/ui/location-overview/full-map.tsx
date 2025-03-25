'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
const FullMap = dynamic(() => import('@/app/components/FullMap'), {
    ssr: false,
})

import {
    GetVesselListWithTrainingAndMaintenanceStatus,
    getVesselList,
} from '@/app/lib/actions'
export default function FullMapPage(props: any) {
    const [vessels, setVessels] = useState<any>([])
    const [loading, setLoading] = useState<boolean>(true)

    const handleSetVessels = (vessels: any) => {
        const vesselListWithTrainingStatus =
            GetVesselListWithTrainingAndMaintenanceStatus(vessels)
        const activeVessels = vesselListWithTrainingStatus.filter(
            (vessel: any) => !vessel.archived,
        )
        setVessels(activeVessels)
        setLoading(false)
    }

    getVesselList(handleSetVessels)

    return (
        <>{vessels && vessels.length ? <FullMap vessels={vessels} /> : <></>}</>
    )
}
