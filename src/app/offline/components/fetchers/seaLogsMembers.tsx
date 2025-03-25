import { DownloadSeaLogsMembers } from '@/app/lib/graphQL/query/offline/downloadSeaLogsMembers'
import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import SeaLogsMemberModel from '@/app/offline/models/seaLogsMember'
import dayjs from 'dayjs'
import { addSuccessResult, setStorageItem, setFetchError } from '../../helpers/functions'
// REMEMBER: The indexedDB is the source of truth

const FetchSeaLogsMembers : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const limit = 100
    const [seaLogsMemberPercentValue, setSeaLogsMemberPercentValue] =
        useState(0)
    const [seaLogsMemberProgressBarLabel, setSeaLogsMemberProgressBarLabel] =
        useState('Downloading SeaLogs members...')
    const seaLogsMemberModel = new SeaLogsMemberModel()
    // const [seaLogsMembers, setSeaLogsMembers] = useState([] as any)
    const [seaLogsMemberPage, setSeaLogsMemberPage] = useState(0)
    const [querySeaLogsMembers] = useLazyQuery(DownloadSeaLogsMembers, {
        fetchPolicy: 'network-only',
        onCompleted: (response: any) => {
            const data = response.readSeaLogsMembers.nodes
            const hasNextPage = response.readSeaLogsMembers.pageInfo.hasNextPage
            const totalCount = response.readSeaLogsMembers.pageInfo.totalCount
            if (data) {
                // setSeaLogsMembers([...seaLogsMembers, ...data])
                Promise.all([saveSeaLogsMembers(data)])
                if (hasNextPage) {
                    const nextPage = seaLogsMemberPage + 1
                    setSeaLogsMemberPercentValue(
                        Math.ceil(((nextPage * limit) / totalCount) * 100),
                    )
                    setSeaLogsMemberPage(nextPage)
                    querySeaLogsMembers({
                        variables: {
                            filter: { archived: { eq: false } },
                            limit: limit,
                            offset: nextPage * limit,
                        },
                    })
                } else {
                    setSeaLogsMemberProgressBarLabel(
                        'SeaLogs members downloaded',
                    )
                    setSeaLogsMemberPercentValue(100)
                }
            }
        },
        onError: (error: any) => {
            console.error('downloadSeaLogsMembers error', error)
            setSeaLogsMemberProgressBarLabel(
                'Error downloading SeaLogs members',
            )
            if(typeof window !== 'undefined') {
                setStorageItem('SeaLogsMembers', 'error', `${seaLogsMemberPercentValue}`,'fetch')
                setFetchError('SeaLogsMembers');
            }
        },
    })
    const downloadSeaLogsMembers = async () => {
        await querySeaLogsMembers({
            variables: {
                filter: { archived: { eq: false } },
                limit: limit,
                offset: seaLogsMemberPage * limit,
            },
        })
    }
    const saveSeaLogsMembers = async (seaLogsMembers: any) => {
        // Get seaLogsMembers that are not yet saved
        let updateRecord : Array <{}> = []
        const dataToSave = await Promise.all(
            seaLogsMembers.map(async (item: any) => {
                const existingData = await seaLogsMemberModel.getById(item.id)
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
            await seaLogsMemberModel.bulkAdd(dataToSave)
        }
        if (updateRecord.length > 0) {
            await seaLogsMemberModel.multiUpdate(updateRecord)
        }
    }

    useEffect(() => {
        setSeaLogsMemberProgressBarLabel('Downloading SeaLogs members...')
        setSeaLogsMemberPage(0)
        setSeaLogsMemberPercentValue(0)
        downloadSeaLogsMembers()
    }, [flag])
    useEffect(() => {
        if(seaLogsMemberPercentValue == 100) {
            addSuccessResult('SeaLogsMembers','fetch');
            setStorageItem('SeaLogsMembers', 'success', '100','fetch');
        } else {
            setStorageItem('SeaLogsMembers', 'fetching', `${seaLogsMemberPercentValue}`,'fetch');
        }
    },[seaLogsMemberPercentValue])
    return (
        <div>
            {seaLogsMemberPercentValue < 100 && (
                <div className="flex justify-between">
                    <div>{seaLogsMemberProgressBarLabel}</div>
                    <div>{seaLogsMemberPercentValue}%</div>
                </div>
            )}
        </div>
    )
})
export default FetchSeaLogsMembers
