'use client'
import DepartmentForm from '@/app/ui/department/form'
import { useSearchParams } from 'next/navigation'

const CreateDepartmentPage = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id') ?? 0
    return (
        <div>
            <DepartmentForm departmentId={+id} />
        </div>
    )
}

export default CreateDepartmentPage
