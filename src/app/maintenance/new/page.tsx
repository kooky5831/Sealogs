'use client'

import Skeleton from '@/app/components/Skeleton'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import Loading from '@/app/loading'
import NewTask from '@/app/ui/maintenance/new-task'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page() {
    const searchParams = useSearchParams()
    const inventoryId = searchParams.get('inventoryId') ?? 0
    const vesselId = searchParams.get('vesselId') ?? 0
    const redirectTo = searchParams.get('redirectTo') ?? ''

    const [permissions, setPermissions] = useState<any>(false)
    const [edit_task, setEdit_task] = useState<any>(false)

    const init_permissions = () => {
        if (permissions) {
            if (hasPermission('EDIT_TASK', permissions)) {
                setEdit_task(true)
            } else {
                setEdit_task(false)
            }
        }
    }

    useEffect(() => {
        setPermissions(getPermissions)
        init_permissions()
    }, [])

    useEffect(() => {
        init_permissions()
    }, [permissions])

    if (!permissions || !edit_task) {
        return !permissions ? (
            <Loading />
        ) : (
            <Loading errorMessage="Oops! You do not have the permission to view this section." />
        )
    }
    return (
        <NewTask
            inventoryId={inventoryId as number}
            vesselId={vesselId as number}
            redirectTo={redirectTo}
        />
    )
}
