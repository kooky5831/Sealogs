'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { UPDATE_USER } from '../../lib/graphQL/mutation'
import { MainLayout } from '@/app/components/Components'
import DepartmentDropdown from './dropdown'
import Loading from '@/app/loading'
export default function SelectDepartmentForm() {
    const searchParams = useSearchParams()
    const from = searchParams.get('from')
    const router = useRouter()
    const [useDepartment, setUseDepartment] = useState<any>(null)
    const [selectedDepartment, setSelectedDepartment] = useState(0)
    const [errorMessage, setErrorMessage] = useState('')
    const [mutationUpdateUser, { loading: mutationUpdateUserLoading }] =
        useMutation(UPDATE_USER, {
            onCompleted: (mutationUpdateUserResponse: any) => {
                console.log(
                    'mutationUpdateUserResponse',
                    mutationUpdateUserResponse,
                )
                router.push('/')
            },
            onError: (error: any) => {
                console.error('mutationUpdateUser error', error)
                setErrorMessage(error.message)
            },
        })
    async function handleSelectDepartment() {
        setErrorMessage('')
        const userId = localStorage.getItem('userId') ?? 0

        if (+userId === 0) {
            setErrorMessage(
                'Opps, there was an error with your login. Please try and login again.',
            )
            return
        }
        const variables = {
            input: {
                id: +userId,
                currentDepartmentID: selectedDepartment,
            },
        }
        console.log('handleSelectDepartment variables', variables)
        await mutationUpdateUser({
            variables,
        })
    }

    useEffect(() => {
        if (localStorage.getItem('useDepartment') === 'true') {
            setUseDepartment(true)
        } else {
            setUseDepartment(false)
        }
    }, [])

    let formContent = (
        <div className="flex h-screen flex-col items-center justify-center gap-4 dark:text-gray-500">
            <div className="bg-white dark:bg-sldarkblue-800 dark:text-white shadow rounded py-8 px-4 w-96">
                <h1 className="text-xl text-bold mb-4">Select A Department</h1>
                <div className="text-red-500 text-center py-4">
                    <small>{errorMessage}</small>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="client ">Department</label>
                    <DepartmentDropdown
                        value={selectedDepartment}
                        onChange={(e: any) => {
                            setSelectedDepartment(e.value)
                        }}
                    />
                </div>
                <div className="md:flex md:justify-between py-4 gap-2">
                    <div>
                        <button
                            onClick={handleSelectDepartment}
                            type="button"
                            className="bg-blue-500 text-white px-4 py-2 rounded w-full md:w-auto my-2"
                            disabled={mutationUpdateUserLoading}>
                            Select Department
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
    if (from !== 'login') {
        formContent = <MainLayout>{formContent}</MainLayout>
    }

    return useDepartment ? (
        formContent
    ) : (
        <>
            {useDepartment === null ? (
                <Loading />
            ) : from !== 'login' ? (
                <MainLayout>
                    <Loading message="Departments are not enabled, please enable the departments from settings to use departments." />
                </MainLayout>
            ) : (
                <Loading message="Departments are not enabled, please enable the departments from settings to use departments." />
            )}
        </>
    )
}
