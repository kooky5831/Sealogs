'use client'
import React, { useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { Heading } from 'react-aria-components'
import { CREATE_COMPONENT_MAINTENANCE_CHECK } from '@/app/lib/graphQL/mutation'
import { useRouter, useSearchParams } from 'next/navigation'
import dayjs from 'dayjs'

export default function NewTask({
    inventoryId = 0,
    vesselId = 0,
    redirectTo = '',
}: {
    inventoryId: number
    vesselId: number
    redirectTo: string
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect_to')

    const [createMaintenanceCheck] = useMutation(
        CREATE_COMPONENT_MAINTENANCE_CHECK,
        {
            onCompleted: (response: any) => {
                const data = response.createComponentMaintenanceCheck
                if (data) {
                    router.push(
                        '/maintenance?taskID=' +
                            data.id +
                            '&taskCreated=true&redirect_to=' +
                            redirect,
                    )
                }
            },
            onError: (error: any) => {
                console.error('createMaintenanceCheck error', error)
            },
        },
    )

    const handleCreate = async () => {
        const assignedBy = localStorage.getItem('userId')

        createMaintenanceCheck({
            variables: {
                input: {
                    name: 'New Task',
                    startDate: dayjs().format('YYYY-MM-DD'),
                    severity: 'Low',
                    status: 'Open',
                    assignedByID: assignedBy,
                    inventoryID: inventoryId > 0 ? inventoryId : null,
                    basicComponentID: vesselId > 0 ? vesselId : null,
                },
            },
        })
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            handleCreate()
        }, 500)

        return () => {
            clearTimeout(timer)
        }
    }, [])

    return (
        <div className="w-full p-0 dark:text-white">
            <div className="flex justify-between pb-4 pt-3 items-center">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    Creating New Task
                </Heading>
            </div>
        </div>
    )
}
