'use client'
import { useSearchParams } from 'next/navigation'
import DocumentList from '../ui/document-locker/list'

export default function Page() {
    const searchParams = useSearchParams()
    const taskID = searchParams.get('taskID') ?? 0
    const redirectTo = searchParams.get('redirectTo') ?? ''
    const showList = +taskID === 0
    return (
        <>
        <DocumentList />
        </>
    )
}
