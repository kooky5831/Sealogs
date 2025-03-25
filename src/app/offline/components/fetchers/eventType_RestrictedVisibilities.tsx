import { DownloadEventType_RestrictedVisibilities } from '@/app/lib/graphQL/query/offline/downloadEventType_RestrictedVisibilities'
import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import EventType_RestrictedVisibilityModel from '@/app/offline/models/eventType_RestrictedVisibility'
import { addSuccessResult, setStorageItem, setFetchError } from '../../helpers/functions'
import dayjs from 'dayjs'
// REMEMBER: The indexedDB is the source of truth
const FetchEventType_RestrictedVisibilities : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const limit = 100
    const [progressBarPercentValue, setProgressBarPercentValue] = useState(0)
    const title = 'restricted visibility event types'
    const [progressBarLabel, setProgressBarLabel] = useState(
        `Downloading ${title}...`,
    )
    const model = new EventType_RestrictedVisibilityModel()
    const [page, setPage] = useState(0)
    const [queryData] = useLazyQuery(DownloadEventType_RestrictedVisibilities, {
        fetchPolicy: 'network-only',
        onCompleted: (response: any) => {
            const data = response.readEventType_RestrictedVisibilities.nodes
            const hasNextPage =
                response.readEventType_RestrictedVisibilities.pageInfo
                    .hasNextPage
            const totalCount =
                response.readEventType_RestrictedVisibilities.pageInfo
                    .totalCount
            if (data) {
                Promise.all([saveData(data)])
                if (hasNextPage) {
                    const nextPage = page + 1
                    setProgressBarPercentValue(
                        Math.ceil(((nextPage * limit) / totalCount) * 100),
                    )
                    setPage(nextPage)
                    queryData({
                        variables: {
                            limit: limit,
                            offset: nextPage * limit,
                        },
                    })
                } else {
                    setProgressBarLabel(`Downloaded ${title}`)
                    setProgressBarPercentValue(100)
                }
            }
        },
        onError: (error: any) => {
            console.error('queryData error', error)
            setProgressBarLabel(`Error downloading ${title}`)
            if(typeof window !== 'undefined') {
                setStorageItem('EventType_RestrictedVisibilities', 'error', `${progressBarPercentValue}`,'fetch')
                setFetchError('EventType_RestrictedVisibilities');
            }
        },
    })
    const downloadData = async () => {
        await queryData({
            variables: {
                limit: limit,
                offset: page * limit,
            },
        })
    }
    const saveData = async (data: any) => {
        // Get data that are not yet saved
        let updateRecord : Array <{}> = []
        const dataToSave = await Promise.all(
            data.map(async (item: any) => {
                const existingData = await model.getById(item.id)
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
            await model.bulkAdd(dataToSave)
        }
        if (updateRecord.length > 0) {
            await model.multiUpdate(updateRecord)
        }
    }

    useEffect(() => {
        setProgressBarLabel(`Downloading ${title}...`)
        setPage(0)
        setProgressBarPercentValue(0)
        downloadData()
    }, [flag])
    useEffect(() => {
        if(progressBarPercentValue == 100) {
            addSuccessResult('EventType_RestrictedVisibilities','fetch');
            setStorageItem('EventType_RestrictedVisibilities', 'success', '100','fetch');
        } else { 
            setStorageItem('EventType_RestrictedVisibilities', 'fetching', `${progressBarPercentValue}`,'fetch');
        }
    },[progressBarPercentValue])
    return (
        <div>
            {progressBarPercentValue < 100 && (
                <div className="flex justify-between">
                    <div>{progressBarLabel}</div>
                    <div>{progressBarPercentValue}%</div>
                </div>
            )}
        </div>
    )
})
export default FetchEventType_RestrictedVisibilities
