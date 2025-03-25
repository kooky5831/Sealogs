import { DownloadVessels } from '@/app/lib/graphQL/query/offline/downloadVessels'
import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import VesselModel from '@/app/offline/models/vessel'
import dayjs from 'dayjs'
import { addSuccessResult, setStorageItem, setFetchError } from '../../helpers/functions'
// REMEMBER: The indexedDB is the source of truth
const FetchVessels : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const limit = 100
    const [vesselPercentValue, setVesselPercentValue] = useState(0)
    const [vesselProgressBarLabel, setVesselProgressBarLabel] = useState(
        'Downloading vessels...',
    )
    const vesselModel = new VesselModel()
    // const [vessels, setVessels] = useState([] as any)
    const [vesselPage, setVesselPage] = useState(0)
    const [queryVessels] = useLazyQuery(DownloadVessels, {
        fetchPolicy: 'network-only',
        onCompleted: (response: any) => {
            const data = response.readVessels.nodes
            const hasNextPage = response.readVessels.pageInfo.hasNextPage
            const totalCount = response.readVessels.pageInfo.totalCount
            if (data) {
                // setVessels([...vessels, ...data])
                Promise.all([saveVessels(data)])
                if (hasNextPage) {
                    const nextPage = vesselPage + 1
                    setVesselPercentValue(
                        Math.ceil(((nextPage * limit) / totalCount) * 100),
                    )
                    setVesselPage(nextPage)
                    queryVessels({
                        variables: {
                            limit: limit,
                            offset: nextPage * limit,
                        },
                    })
                } else {
                    setVesselProgressBarLabel('Vessels downloaded')
                    setVesselPercentValue(100)
                }
            }
        },
        onError: (error: any) => {
            console.error('downloadVessels error', error)
            setVesselProgressBarLabel('Error downloading vessels')
            if(typeof window !== 'undefined') {
                setStorageItem('Vessels', 'error', `${vesselPercentValue}`,'fetch')
                setFetchError('Vessels');
            }
        },
    })
    const downloadVessels = async () => {
        await queryVessels({
            variables: {
                limit: limit,
                offset: vesselPage * limit,
            },
        })
    }
    const saveVessels = async (vessels: any) => {
        // Get vessels that are not yet saved
        let updateRecord : Array <{}> = []
        const dataToSave = await Promise.all(
            vessels.map(async (item: any) => {
                const existingData = await vesselModel.getById(item.id)
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
            await vesselModel.bulkAdd(dataToSave)
        }
        if (updateRecord.length > 0) {
            await vesselModel.multiUpdate(updateRecord)
        }
    }

    useEffect(() => {
        setVesselPage(0)
        setVesselProgressBarLabel('Downloading vessels...')
        setVesselPercentValue(0)
        downloadVessels()
    }, [flag])

    useEffect(() => {
        if(vesselPercentValue == 100) {
            setStorageItem('Vessels', 'success', '100','fetch');
            addSuccessResult('Vessels','fetch');
        } else {
            setStorageItem('Vessels', 'fetching', `${vesselPercentValue}`,'fetch');
        }
    },[vesselPercentValue])
    return (
        <div>
            {vesselPercentValue < 100 && (
                <div className="flex justify-between">
                    <div>{vesselProgressBarLabel}</div>
                    <div>{vesselPercentValue}%</div>
                </div>
            )}
        </div>
    )
})
export default FetchVessels
