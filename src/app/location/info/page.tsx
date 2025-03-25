'use client'
import { useSearchParams } from 'next/navigation'
import GeoLocationInfo from '@/app/ui/location/info'
const GeoLocationInfoPage = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id') ?? 0
    return (
        <div>
            <GeoLocationInfo id={+id} />
        </div>
    )
}

export default GeoLocationInfoPage
