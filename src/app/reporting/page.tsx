'use client'
import { useSearchParams } from 'next/navigation'
import TaskList from '../ui/reporting/list'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import Loading from '@/app/loading'
import { useEffect, useState } from 'react'

export default function Page() {
    const searchParams = useSearchParams()
    const taskID = searchParams.get('taskID') ?? 0
    const redirectTo = searchParams.get('redirectTo') ?? ''
    const showList = +taskID === 0

    const [permissions, setPermissions] = useState<any>(false)
    const [view_reports, setView_reports] = useState<any>(false)

    const init_permissions = () => {
        if (permissions) {
            if (hasPermission('VIEW_REPORTS', permissions)) {
                setView_reports(true)
            } else {
                setView_reports(false)
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

    if (!permissions || !view_reports) {
        return !permissions ? (
            <Loading />
        ) : (
            <Loading errorMessage="Oops! You do not have the permission to view this section." />
        )
    }

    return <TaskList />
}
