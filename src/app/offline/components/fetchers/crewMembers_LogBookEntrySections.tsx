import { DownloadCrewMembers_LogBookEntrySections } from '@/app/lib/graphQL/query/offline/downloadCrewMembers_LogBookEntrySections'
import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import CrewMembers_LogBookEntrySectionModel from '@/app/offline/models/crewMembers_LogBookEntrySection'
import dayjs from 'dayjs'
import { addSuccessResult, setStorageItem, setFetchError } from '../../helpers/functions'
// REMEMBER: The indexedDB is the source of truth
const FetchCrewMembers_LogBookEntrySections : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const limit = 100
    const [
        crewMembers_LogBookEntrySectionsPercentValue,
        setCrewMembers_LogBookEntrySectionPercentValue,
    ] = useState(0)
    const [
        crewMembers_LogBookEntrySectionProgressBarLabel,
        setCrewMembers_LogBookEntrySectionProgressBarLabel,
    ] = useState('Downloading crew member sections...')
    const crewMembers_LogBookEntrySectionsModel =
        new CrewMembers_LogBookEntrySectionModel()
    // const [crewMembers_LogBookEntrySections, setCrewMembers_LogBookEntrySections] = useState([] as any)
    const [
        crewMembers_LogBookEntrySectionsPage,
        setCrewMembers_LogBookEntrySectionPage,
    ] = useState(0)
    const [queryCrewMembers_LogBookEntrySections] = useLazyQuery(
        DownloadCrewMembers_LogBookEntrySections,
        {
            fetchPolicy: 'network-only',
            onCompleted: (response: any) => {
                const data = response.readCrewMembers_LogBookEntrySections.nodes
                const hasNextPage =
                    response.readCrewMembers_LogBookEntrySections.pageInfo
                        .hasNextPage
                const totalCount =
                    response.readCrewMembers_LogBookEntrySections.pageInfo
                        .totalCount
                if (data) {
                    // setCrewMembers_LogBookEntrySections([...crewMembers_LogBookEntrySections, ...data])
                    Promise.all([saveCrewMembers_LogBookEntrySections(data)])
                    if (hasNextPage) {
                        const nextPage =
                            crewMembers_LogBookEntrySectionsPage + 1
                        setCrewMembers_LogBookEntrySectionPercentValue(
                            Math.ceil(((nextPage * limit) / totalCount) * 100),
                        )
                        setCrewMembers_LogBookEntrySectionPage(nextPage)
                        queryCrewMembers_LogBookEntrySections({
                            variables: {
                                limit: limit,
                                offset: nextPage * limit,
                            },
                        })
                    } else {
                        setCrewMembers_LogBookEntrySectionProgressBarLabel(
                            'crew member sections downloaded',
                        )
                        setCrewMembers_LogBookEntrySectionPercentValue(100)
                    }
                }
            },
            onError: (error: any) => {
                console.error(
                    'downloadCrewMembers_LogBookEntrySections error',
                    error,
                )
                setCrewMembers_LogBookEntrySectionProgressBarLabel(
                    'Error downloading crew member sections',
                )
                if(typeof window !== 'undefined') {
                    setStorageItem(
                        'CrewMembers_LogBookEntrySections', 
                        'error', 
                        `${crewMembers_LogBookEntrySectionsPercentValue}`,
                        'fetch'
                    )
                    setFetchError('CrewMembers_LogBookEntrySections'); 
                }
            },
        },
    )
    const downloadCrewMembers_LogBookEntrySections = async () => {
        await queryCrewMembers_LogBookEntrySections({
            variables: {
                limit: limit,
                offset: crewMembers_LogBookEntrySectionsPage * limit,
            },
        })
    }
    const saveCrewMembers_LogBookEntrySections = async (
        crewMembers_LogBookEntrySections: any,
    ) => {
        // Get crewMembers_LogBookEntrySections that are not yet saved
        let updateRecord : Array <{}> = []
        const dataToSave = await Promise.all(
            crewMembers_LogBookEntrySections.map(async (item: any) => {
                const existingData = await crewMembers_LogBookEntrySectionsModel.getById(item.id)
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
            await crewMembers_LogBookEntrySectionsModel.bulkAdd(dataToSave)
        }
        if (updateRecord.length > 0) {
            await crewMembers_LogBookEntrySectionsModel.multiUpdate(updateRecord)
        }
    }

    useEffect(() => {
        setCrewMembers_LogBookEntrySectionProgressBarLabel(
            'Downloading crew member sections...',
        )
        setCrewMembers_LogBookEntrySectionPage(0)
        setCrewMembers_LogBookEntrySectionPercentValue(0)
        downloadCrewMembers_LogBookEntrySections()
    }, [flag])
    useEffect(() => {
        if(crewMembers_LogBookEntrySectionsPercentValue == 100) {
            addSuccessResult('CrewMembers_LogBookEntrySections','fetch');
            setStorageItem('CrewMembers_LogBookEntrySections', 'success', '100','fetch');
        } else { 
            setStorageItem(
                'CrewMembers_LogBookEntrySections', 
                'fetching', 
                `${crewMembers_LogBookEntrySectionsPercentValue}`,
                'fetch'
            );
        }
    },[crewMembers_LogBookEntrySectionsPercentValue])
    return (
        <div>
            {crewMembers_LogBookEntrySectionsPercentValue < 100 && (
                <div className="flex justify-between">
                    <div>{crewMembers_LogBookEntrySectionProgressBarLabel}</div>
                    <div>{crewMembers_LogBookEntrySectionsPercentValue}%</div>
                </div>
            )}
        </div>
    )
})
export default FetchCrewMembers_LogBookEntrySections
