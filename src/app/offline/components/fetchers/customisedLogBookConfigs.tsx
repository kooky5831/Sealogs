import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import CustomisedLogBookConfigModel from '@/app/offline/models/customisedLogBookConfig'
import { DownloadCustomisedLogBookConfigs } from '@/app/lib/graphQL/query/offline/downloadCustomisedLogBookConfigs'
import { addSuccessResult, setStorageItem, setFetchError } from '../../helpers/functions'
// REMEMBER: The indexedDB is the source of truth
const FetchCustomisedLogBookConfigs : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const limit = 100 
    const [ 
        customisedLogBookConfigPercentValue,
        setCustomisedLogBookConfigPercentValue,
    ] = useState(0)
    const [
        customisedLogBookConfigProgressBarLabel,
        setCustomisedLogBookConfigProgressBarLabel,
    ] = useState('Downloading logbook configurations...')
    const customisedLogBookConfigModel = new CustomisedLogBookConfigModel()
    // const [CustomisedLogBookConfigs, setCustomisedLogBookConfigs] = useState([] as any)
    const [customisedLogBookConfigPage, setCustomisedLogBookConfigPage] =
        useState(0)
    const saveCustomisedLogBookConfigs = async (
        CustomisedLogBookConfigs: any,
    ) => {
        // Get CustomisedLogBookConfigs that are not yet saved
        let updateRecord : Array <{}> = []
        const dataToSave = await Promise.all(
            CustomisedLogBookConfigs.map(async (item: any) => {
                const existingData = await customisedLogBookConfigModel.getById(item.id)
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
            await customisedLogBookConfigModel.bulkAdd(dataToSave)
        }
        if (updateRecord.length > 0) {
            await customisedLogBookConfigModel.multiUpdate(updateRecord)
        }
    }
    const [queryCustomisedLogBookConfigs] = useLazyQuery(
        DownloadCustomisedLogBookConfigs,
        {
            fetchPolicy: 'network-only',
            onCompleted: (response: any) => {
                const data = response.readCustomisedLogBookConfigs.nodes
                const hasNextPage =
                    response.readCustomisedLogBookConfigs.pageInfo.hasNextPage
                const totalCount =
                    response.readCustomisedLogBookConfigs.pageInfo.totalCount
                if (data) {
                    // setCustomisedLogBookConfigs([...CustomisedLogBookConfigs, ...data])
                    Promise.all([saveCustomisedLogBookConfigs(data)])
                    if (hasNextPage) {
                        const nextPage = customisedLogBookConfigPage + 1
                        setCustomisedLogBookConfigPercentValue(
                            Math.ceil(((nextPage * limit) / totalCount) * 100),
                        )
                        setCustomisedLogBookConfigPage(nextPage)
                        queryCustomisedLogBookConfigs({
                            variables: {
                                limit: limit,
                                offset: nextPage * limit,
                            },
                        })
                    } else {
                        setCustomisedLogBookConfigProgressBarLabel(
                            'Logbook configurations downloaded',
                        )
                        setCustomisedLogBookConfigPercentValue(100)
                    }
                }
            },
            onError: (error: any) => {
                console.error('downloadCustomisedLogBookConfigs error', error)
                setCustomisedLogBookConfigProgressBarLabel(
                    'Error downloading logbook configurations',
                )
                if(typeof window !== 'undefined') {
                    setStorageItem('CustomisedLogBookConfigs', 'error', `${customisedLogBookConfigPercentValue}`,'fetch')
                    setFetchError('CustomisedLogBookConfigs'); 
                }
            },
        },
    )
    const downloadCustomisedLogBookConfigs = async () => {
        await queryCustomisedLogBookConfigs({
            variables: {
                limit: limit,
                offset: customisedLogBookConfigPage * limit,
            },
        })
    }

    useEffect(() => {
        setCustomisedLogBookConfigProgressBarLabel(
            'Downloading logbook configurations...',
        )
        setCustomisedLogBookConfigPage(0)
        setCustomisedLogBookConfigPercentValue(0)
        downloadCustomisedLogBookConfigs()
    }, [flag])
    useEffect(() => {
        if(customisedLogBookConfigPercentValue == 100) {
            addSuccessResult('CustomisedLogBookConfigs','fetch');
            setStorageItem('CustomisedLogBookConfigs', 'success', '100','fetch');
        } else { 
            setStorageItem('CustomisedLogBookConfigs', 'fetching', `${customisedLogBookConfigPercentValue}`,'fetch');
        }
    },[customisedLogBookConfigPercentValue])
    return (
        <div>
            {customisedLogBookConfigPercentValue < 100 && (
                <div className="flex justify-between">
                    <div>{customisedLogBookConfigProgressBarLabel}</div>
                    <div>{customisedLogBookConfigPercentValue}%</div>
                </div>
            )}
        </div>
    )
})
export default FetchCustomisedLogBookConfigs
