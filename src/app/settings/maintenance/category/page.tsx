'use client'
import { preventCrewAccess } from '@/app/helpers/userHelper'
import EditMaintenanceCategory from '@/app/ui/maintenance/category-edit'
import MaintenanceCategoryList from '@/app/ui/maintenance/category-list'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function Page() {
    const searchParams = useSearchParams()
    const categoryID = searchParams.get('categoryID') ?? 0
    const showList = +categoryID === 0

    useEffect(() => {
        preventCrewAccess()
    }, [])

    return (
        <>
            {showList ? (
                <MaintenanceCategoryList />
            ) : (
                <EditMaintenanceCategory categoryID={+categoryID} />
            )}
        </>
    )
}
