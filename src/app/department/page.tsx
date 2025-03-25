'use client'
import { SeaLogsButton } from '@/app/components/Components'
import DepartmentList from '@/app/ui/department/list'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import { Heading } from 'react-aria-components'
import { preventCrewAccess } from '../helpers/userHelper'
import Loading from '../loading'

const DepartmentPage = () => {
    const router = useRouter()
    const [useDepartment, setUseDepartment] = useState<any>(null)
    useEffect(() => {
        preventCrewAccess()
        if (localStorage.getItem('useDepartment') === 'true') {
            setUseDepartment(true)
        } else {
            setUseDepartment(false)
        }
    }, [])
    return (
        <>
            {useDepartment ? (
                <div className="w-full p-0 dark:text-white">
                    <div className="flex flex-col md:flex-row md:justify-between pb-4 items-center">
                        <Heading className="font-light font-monasans text-3xl dark:text-white">
                            Departments
                        </Heading>
                        <div className="flex flex-col md:flex-row items-center">
                            <SeaLogsButton
                                link={`/department/create`}
                                icon="check"
                                color="sky"
                                type="primary"
                                text="Add Department"
                            />
                        </div>
                    </div>
                    <DepartmentList />
                </div>
            ) : (
                <>
                    {useDepartment === null ? (
                        <Loading />
                    ) : (
                        <Loading message="Departments are not enabled, please enable the departments from settings to use departments." />
                    )}
                </>
            )}
        </>
    )
}

export default DepartmentPage
