'use client'
import LogBookEntry from '@/app/ui/logbook/log-entry'
import { useSearchParams } from 'next/navigation'

export default function Page() {
    const searchParams = useSearchParams()
    const vesselID = searchParams.get('vesselID') ?? 0
    const logentryID = searchParams.get('logentryID') ?? 0
    return (
        <>
            <LogBookEntry vesselID={+vesselID} logentryID={+logentryID} />
        </>
    )
}
