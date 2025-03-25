'use client'
import { useEffect } from 'react'
import SelectDepartmentForm from '../ui/department/select-form'
import { preventCrewAccess } from '../helpers/userHelper'

const SelectDepartmentPage = () => {
    useEffect(() => {
        preventCrewAccess()
    }, [])

    return (
        <div>
            <SelectDepartmentForm />
        </div>
    )
}

export default SelectDepartmentPage
