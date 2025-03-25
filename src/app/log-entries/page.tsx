'use client'
import LogBookEntry from '@/app/ui/logbook/log-entry'

import { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import { GET_LOGBOOKENTRY, VESSEL_INFO } from '@/app/lib/graphQL/query'
import { LogBookEntrySkeleton } from '@/app/ui/skeletons'
import { useSearchParams } from 'next/navigation'
import LogBook from '../ui/logbook/log-book'

export default function Page() {
    const searchParams = useSearchParams()
    const vesselID = searchParams.get('vesselID') ?? 0
    const logentryID = searchParams.get('logentryID') ?? 0
    const showLogbook = +vesselID === 0 && +logentryID === 0
    return (
        <>
            {showLogbook ? (
                <LogBook />
            ) : (
                <LogBookEntry vesselID={+vesselID} logentryID={+logentryID} />
            )}
        </>
    )
}
