'use client'
import GeoLocationForm from '@/app/ui/location/form'
import { useSearchParams } from 'next/navigation'

const GeoLocationEditPage = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id') ?? 0
    return <GeoLocationForm id={+id} />
}

export default GeoLocationEditPage
