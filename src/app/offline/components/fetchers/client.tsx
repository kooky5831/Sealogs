import { DownloadClient } from '@/app/lib/graphQL/query/offline/downloadClient'
import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import ClientModel from '@/app/offline/models/client'
import { addSuccessResult, setStorageItem, setFetchError } from '../../helpers/functions'
// REMEMBER: The indexedDB is the source of truth
const FetchClient: React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const limit = 100
    const [clientPercentValue, setClientPercentValue] = useState(0)
    const [clientProgressBarLabel, setClientProgressBarLabel] = useState(
        'Downloading client...',
    ) 
    const clientModel = new ClientModel()
    const [queryClient] = useLazyQuery(DownloadClient, {
        fetchPolicy: 'network-only',
        onCompleted: (response: any) => {
            const data = response.readOneClient
            if (data) {
                Promise.all([saveClient(data)])
                setClientProgressBarLabel('Client downloaded')
                setClientPercentValue(100)
            } 
        },
        onError: (error: any) => {
            console.error('downloadClient error', error)
            setClientProgressBarLabel('Error downloading client')
            if(typeof window !== 'undefined') {
                setStorageItem('Client', 'error', `${clientPercentValue}`,'fetch')
                setFetchError('Client');
            }
        },
    })
    const downloadClient = async () => {
        await queryClient({
            variables: {
                filter: {
                    id: { eq: +(localStorage.getItem('clientId') ?? 0) },
                },
            },
        })
    }
    const saveClient = async (client: any) => {
        // Get client that are not yet saved
        const existingClient = await clientModel.getById(client.id)
        if (!existingClient) {
            await clientModel.save(client)
        }
    }

    useEffect(() => {
        setClientProgressBarLabel('Downloading client...')
        setClientPercentValue(0)
        downloadClient()
    }, [flag]) 
    useEffect(() => {
        if(clientPercentValue == 100) {
            addSuccessResult('Client','fetch');
            setStorageItem('Client', 'success', '100','fetch');
        } else {
            setStorageItem('Client', 'fetching', `${clientPercentValue}`,'fetch');
        }
    },[clientPercentValue])
    return (
        <div>
            {clientPercentValue < 100 && (
                <div className="flex justify-between">
                    <div>{clientProgressBarLabel}</div>
                    <div>{clientPercentValue}%</div>
                </div>
            )}
        </div>
    )
})
export default FetchClient
