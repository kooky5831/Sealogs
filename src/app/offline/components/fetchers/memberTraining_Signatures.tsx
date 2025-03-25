import { DownloadMemberTraining_Signatures } from '@/app/lib/graphQL/query/offline/downloadMemberTraining_Signatures'
import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import MemberTraining_SignatureModel from '@/app/offline/models/memberTraining_Signature'
import dayjs from 'dayjs'
import {
    addSuccessResult,
    setStorageItem,
    setFetchError,
} from '../../helpers/functions'
// REMEMBER: The indexedDB is the source of truth

const FetchMemberTraining_Signatures: React.FC<{ flag: string }> = React.memo(
    ({ flag }) => {
        const limit = 100
        const [progressBarPercentValue, setProgressBarPercentValue] =
            useState(0)
        const title = 'member training signatures'
        const [progressBarLabel, setProgressBarLabel] = useState(
            `Downloading ${title}...`,
        )
        const model = new MemberTraining_SignatureModel()
        const [page, setPage] = useState(0)
        const [queryData] = useLazyQuery(DownloadMemberTraining_Signatures, {
            fetchPolicy: 'network-only',
            onCompleted: (response: any) => {
                const data = response.readMemberTraining_Signatures.nodes
                const hasNextPage =
                    response.readMemberTraining_Signatures.pageInfo.hasNextPage
                const totalCount =
                    response.readMemberTraining_Signatures.pageInfo.totalCount
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
                if (typeof window !== 'undefined') {
                    setStorageItem(
                        'MemberTraining_Signatures',
                        'error',
                        `${progressBarPercentValue}`,
                        'fetch'
                    )
                    setFetchError('MemberTraining_Signatures')
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
            setPage(0)
            setProgressBarLabel(`Downloading ${title}...`)
            setProgressBarPercentValue(0)
            downloadData()
        }, [flag])
        useEffect(() => {
            if (progressBarPercentValue == 100) {
                setStorageItem(
                    'MemberTraining_Signatures',
                    'success',
                    '100',
                    'fetch'
                )
                addSuccessResult('MemberTraining_Signatures','fetch')
            } else {
                setStorageItem(
                    'MemberTraining_Signatures',
                    'fetching',
                    `${progressBarPercentValue}`,
                    'fetch'
                )
            }
        }, [progressBarPercentValue])
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
    },
)
export default FetchMemberTraining_Signatures
