'use client'
import UserRoleForm from '@/app/ui/user-role/form'
import { useSearchParams } from 'next/navigation'

const EditUserRolePage = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id') ?? 0
    return <UserRoleForm roleID={+id} />
}

export default EditUserRolePage
