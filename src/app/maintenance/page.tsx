'use client'
import Task from '@/app/ui/maintenance/task'
import { useSearchParams } from 'next/navigation'
import TaskList from '../ui/maintenance/list'

export default function Page() {
    const searchParams = useSearchParams()
    const taskID = searchParams.get('taskID') ?? 0
    const redirectTo = searchParams.get('redirectTo') ?? ''
    const showList = +taskID === 0
    return (
        <>
            {showList ? (
                <TaskList />
            ) : (
                <Task taskId={+taskID} redirectTo={redirectTo} />
            )}
        </>
    )
}
