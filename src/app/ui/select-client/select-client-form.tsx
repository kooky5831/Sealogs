'use client'
import LoginLogo from '../login-logo'
import { ReactNode, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@apollo/client'
import { UPDATE_USER } from '../../lib/graphQL/mutation'
import SelectClientDropdown from './client-dropdown'
import { MainLayout } from '@/app/components/Components'
export default function SelectClientForm() {
    const searchParams = useSearchParams()
    const from = searchParams.get('from')
    const router = useRouter()
    const [selectedClient, setSelectedClient] = useState(0)
    const loggedUserName = `${localStorage.getItem('firstName') ?? ''} ${localStorage.getItem('surname') ?? ''}`
    const [errorMessage, setErrorMessage] = useState('')
    const [mutationUpdateUser, { loading: mutationUpdateUserLoading }] =
        useMutation(UPDATE_USER, {
            onCompleted: (mutationUpdateUserResponse: any) => {
                localStorage.setItem(
                    'useDepartment',
                    mutationUpdateUserResponse.updateSeaLogsMember.client
                        .useDepartment,
                )
                router.push('/')
            },
            onError: (error: any) => {
                console.error('mutationUpdateUser error', error)
                setErrorMessage(error.message)
            },
        })
    async function handleSelectClient() {
        setErrorMessage('')
        const userId = localStorage.getItem('userId') ?? 0

        if (+selectedClient === 0) {
            setErrorMessage('Please select a client.')
            return
        } else if (+userId === 0) {
            setErrorMessage(
                'Opps, there was an error with your login. Please try and login again.',
            )
            return
        }
        const variables = {
            input: {
                id: +userId,
                clientID: selectedClient,
            },
        }
        const json = JSON.parse(
            localStorage.getItem('availableClients') || '[]',
        )
        const client = json.find((c: any) => c.ID === selectedClient)
        localStorage.setItem('clientTitle', client.Title)
        localStorage.setItem('clientId', selectedClient.toString())
        await mutationUpdateUser({
            variables,
        })
    }

    let formContent = (
        <div className="flex h-screen flex-col items-center justify-center gap-4 dark:text-gray-500">
            <LoginLogo />
            <div className="bg-white shadow rounded py-8 px-4 w-80 md:w-auto">
                <h1 className="text-xl text-bold mb-4">
                    {from !== 'login' ? 'Switch Client' : 'Select Client'}
                </h1>
                <div className="py-4">
                    You are logged in as {loggedUserName}
                </div>
                <div className="text-red-500 text-center py-4">
                    <small>{errorMessage}</small>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="client ">Client</label>
                    <SelectClientDropdown
                        value={selectedClient}
                        onChange={(e: any) => {
                            setSelectedClient(+e.target.value)
                        }}
                    />
                </div>
                <div className="md:flex md:justify-between py-4 gap-2">
                    <div>
                        <button
                            onClick={handleSelectClient}
                            type="button"
                            className="bg-blue-500 text-white px-4 py-2 rounded w-full md:w-auto my-2"
                            disabled={mutationUpdateUserLoading}>
                            Select Client
                        </button>
                    </div>
                    <div>
                        <Link
                            href="/logout"
                            className="inline-block bg-yellow-500  text-white text-center  py-2 px-4 rounded w-full md:w-auto my-2">
                            Log in as someone else
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
    if (from !== 'login') {
        formContent = <MainLayout>{formContent}</MainLayout>
    }

    return formContent
}
