'use client'
import DepartmentInfo from '@/app/ui/department/info'
import { useSearchParams } from 'next/navigation'

const DepartmentInfoPage = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id') ?? 0
    return (
        <div>
            <DepartmentInfo departmentId={+id} />
        </div>
    )
}

export default DepartmentInfoPage
