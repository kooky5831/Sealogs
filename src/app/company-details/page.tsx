'use client'
import { useEffect } from 'react'
import CompanyDetailsForm from '../ui/company-details/form'
import { preventCrewAccess } from '../helpers/userHelper'

const CompanyDetailsPage = () => {
    useEffect(() => {
        preventCrewAccess()
    }, [])

    return (
        <div>
            <CompanyDetailsForm />
        </div>
    )
}

export default CompanyDetailsPage
