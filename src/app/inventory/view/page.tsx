'use client'

import Inventory from '@/app/ui/inventory/inventory'
import { useSearchParams } from 'next/navigation'

export default function Page() {
    const searchParams = useSearchParams()
    const id = parseInt(searchParams.get('id') || '')
    const inventoryTab = searchParams.get('inventoryTab') || ''

    return <Inventory inventoryID={id} inventoryTab={inventoryTab} />
}
