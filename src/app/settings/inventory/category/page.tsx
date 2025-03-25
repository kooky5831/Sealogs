'use client'
import { preventCrewAccess } from '@/app/helpers/userHelper'
import EditInventoryCategory from '@/app/ui/inventory/category-edit'
import InventoryCategoryList from '@/app/ui/inventory/category-list'
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
                <InventoryCategoryList />
            ) : (
                <EditInventoryCategory categoryID={+categoryID} />
            )}
        </>
    )
}
