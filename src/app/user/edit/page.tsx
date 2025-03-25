'use client'
import UserForm from '@/app/ui/user/form'
import { useLazyQuery } from '@apollo/client'
import { useSearchParams } from 'next/navigation'

import { useEffect, useState } from 'react'

const EditUser = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id') ?? 0
    return <UserForm userId={+id} />
}

export default EditUser
