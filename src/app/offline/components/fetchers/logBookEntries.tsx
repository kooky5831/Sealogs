import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import LogBookEntryModel from '@/app/offline/models/logBookEntry'
import { DownloadLogBookEntries } from '@/app/lib/graphQL/query/offline/downloadLogBookEntries'
import { addSuccessResult, setStorageItem, setFetchError } from '../../helpers/functions'
// REMEMBER: The indexedDB is the source of truth
const FetchLogBookEntries : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const limit = 100
    const [logBookEntryPercentValue, setLogBookEntryPercentValue] = useState(0)
    const [logBookEntryProgressBarLabel, setLogBookEntryProgressBarLabel] =
        useState('Downloading logbook entries...')
    const logBookEntryModel = new LogBookEntryModel()
    // const [logBookEntries, setLogBookEntries] = useState([] as any)
    const [logBookEntryPage, setLogBookEntryPage] = useState(0)
    const saveLogBookEntries = async (logBookEntries: any) => {
        // Get logBookEntries that are not yet saved
        let updateRecord : Array <{}> = []
        const dataToSave = await Promise.all(
            logBookEntries.map(async (item: any) => {
                const existingData = await logBookEntryModel.getById(item.id)
                let updateFlag = true;
                if(existingData && existingData.idbCRUDDate) {
                    updateFlag = dayjs(item.lastEdited).isAfter(dayjs(existingData.idbCRUDDate))
                }
                if(existingData) {
                    if(existingData.idbCRUD == "Download" && updateFlag) {
                        const record = {
                            ...item,
                            idbCRUD: 'Download',
                            idbCRUDDate: dayjs().format(
                                'YYYY-MM-DD HH:mm:ss',
                            ),
                        }
                        updateRecord.push(record);
                    } 
                    return null
                } else {
                    return {
                        ...item,
                        idbCRUD: 'Download',
                        idbCRUDDate: dayjs().format(
                            'YYYY-MM-DD HH:mm:ss',
                        ),
                    }
                }
            }),
        ).then((results) => results.filter((result) => result !== null))
        if (dataToSave.length > 0) {
            await logBookEntryModel.bulkAdd(dataToSave)
        }
        if (updateRecord.length > 0) {
            await logBookEntryModel.multiUpdate(updateRecord)
        }
    }
    const [queryLogBookEntries] = useLazyQuery(DownloadLogBookEntries, {
        fetchPolicy: 'network-only',
        onCompleted: (response: any) => {
            const data = response.readLogBookEntries.nodes
            const hasNextPage = response.readLogBookEntries.pageInfo.hasNextPage
            const totalCount = response.readLogBookEntries.pageInfo.totalCount
            if (data) {
                // setLogBookEntries([...logBookEntries, ...data])
                Promise.all([saveLogBookEntries(data)])
                if (hasNextPage) {
                    const nextPage = logBookEntryPage + 1
                    setLogBookEntryPercentValue(
                        Math.ceil(((nextPage * limit) / totalCount) * 100),
                    )
                    setLogBookEntryPage(nextPage)
                    queryLogBookEntries({
                        variables: {
                            limit: limit,
                            offset: nextPage * limit,
                        },
                    })
                } else {
                    setLogBookEntryProgressBarLabel(
                        'Logbook entries downloaded',
                    )
                    setLogBookEntryPercentValue(100)
                }
            }
        },
        onError: (error: any) => {
            console.error('downloadLogBookEntries error', error)
            setLogBookEntryProgressBarLabel('Error downloading logbook entries')
            if(typeof window !== 'undefined') {
                setStorageItem(
                    'LogBookEntries', 
                    'error', 
                    `${logBookEntryPercentValue}`,
                    'fetch'
                )
                setFetchError('LogBookEntries'); 
            }
        },
    })
    const downloadLogBookEntries = async () => {
        await queryLogBookEntries({
            variables: {
                limit: limit,
                offset: logBookEntryPage * limit,
            },
        })
    }

    useEffect(() => {
        setLogBookEntryPage(0)
        setLogBookEntryProgressBarLabel('Downloading logbook entries...')
        setLogBookEntryPercentValue(0)
        downloadLogBookEntries()
    }, [flag])
    useEffect(() => {
        if(logBookEntryPercentValue == 100) {
            addSuccessResult('LogBookEntries','fetch');
            setStorageItem('LogBookEntries', 'success', '100','fetch');
        } else { 
            setStorageItem('LogBookEntries', 'fetching', `${logBookEntryPercentValue}`,'fetch');
        }
    },[logBookEntryPercentValue])
    return (
        <div>
            {logBookEntryPercentValue < 100 && (
                <div className="flex justify-between">
                    <div>{logBookEntryProgressBarLabel}</div>
                    <div>{logBookEntryPercentValue}%</div>
                </div>
            )}
        </div>
    )
})
export default FetchLogBookEntries
