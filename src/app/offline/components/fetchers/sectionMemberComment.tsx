import { DownloadSectionMemberComments } from '@/app/lib/graphQL/query/offline/downloadSectionMemberComments'
import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import SectionMemberCommentModel from '@/app/offline/models/sectionMemberComment'
import dayjs from 'dayjs'
import { addSuccessResult, setStorageItem, setFetchError } from '../../helpers/functions'
// REMEMBER: The indexedDB is the source of truth
const FetchSectionMemberComments : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const limit = 100
    const [
        sectionMemberCommentsPercentValue,
        setSectionMemberCommentPercentValue,
    ] = useState(0)
    const [
        sectionMemberCommentProgressBarLabel,
        setSectionMemberCommentProgressBarLabel,
    ] = useState('Downloading comment sections...')
    const sectionMemberCommentsModel = new SectionMemberCommentModel()
    // const [sectionMemberComments, setSectionMemberComments] = useState([] as any)
    const [sectionMemberCommentsPage, setSectionMemberCommentPage] = useState(0)
    const [querySectionMemberComments] = useLazyQuery(
        DownloadSectionMemberComments,
        {
            fetchPolicy: 'network-only',
            onCompleted: (response: any) => {
                const data = response.readSectionMemberComments.nodes
                const hasNextPage =
                    response.readSectionMemberComments.pageInfo.hasNextPage
                const totalCount =
                    response.readSectionMemberComments.pageInfo.totalCount
                if (data) {
                    // setSectionMemberComments([...sectionMemberComments, ...data])
                    Promise.all([saveSectionMemberComments(data)])
                    if (hasNextPage) {
                        const nextPage = sectionMemberCommentsPage + 1
                        setSectionMemberCommentPercentValue(
                            Math.ceil(((nextPage * limit) / totalCount) * 100),
                        )
                        setSectionMemberCommentPage(nextPage)
                        querySectionMemberComments({
                            variables: {
                                limit: limit,
                                offset: nextPage * limit,
                            },
                        })
                    } else {
                        setSectionMemberCommentProgressBarLabel(
                            'comment sections downloaded',
                        )
                        setSectionMemberCommentPercentValue(100)
                    }
                }
            },
            onError: (error: any) => {
                console.error('downloadSectionMemberComments error', error)
                setSectionMemberCommentProgressBarLabel(
                    'Error downloading comment sections',
                )
                if(typeof window !== 'undefined') {
                    setStorageItem('SectionMemberComments', 'error', `${sectionMemberCommentsPercentValue}`,'fetch')
                    setFetchError('SectionMemberComments');
                }
            },
        },
    )
    const downloadSectionMemberComments = async () => {
        await querySectionMemberComments({
            variables: {
                limit: limit,
                offset: sectionMemberCommentsPage * limit,
            },
        })
    }
    const saveSectionMemberComments = async (sectionMemberComments: any) => {
        // Get sectionMemberComments that are not yet saved
        let updateRecord : Array <{}> = []
        const dataToSave = await Promise.all(
            sectionMemberComments.map(async (item: any) => {
                const existingData = await sectionMemberCommentsModel.getById(item.id)
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
            await sectionMemberCommentsModel.bulkAdd(dataToSave)
        }
        if (updateRecord.length > 0) {
            await sectionMemberCommentsModel.multiUpdate(updateRecord)
        }
    }

    useEffect(() => {
        setSectionMemberCommentProgressBarLabel(
            'Downloading comment sections...',
        )
        setSectionMemberCommentPage(0)
        setSectionMemberCommentPercentValue(0)
        downloadSectionMemberComments()
    }, [flag])
    useEffect(() => {
        if(sectionMemberCommentsPercentValue == 100) {
            addSuccessResult('SectionMemberComments','fetch');
            setStorageItem('SectionMemberComments', 'success', '100','fetch');
        } else {
            setStorageItem('SectionMemberComments', 'fetching', `${sectionMemberCommentsPercentValue}`,'fetch');
        }
    },[sectionMemberCommentsPercentValue])
    return (
        <div>
            {sectionMemberCommentsPercentValue < 100 && (
                <div className="flex justify-between">
                    <div>{sectionMemberCommentProgressBarLabel}</div>
                    <div>{sectionMemberCommentsPercentValue}%</div>
                </div>
            )}
        </div>
    )
})
export default FetchSectionMemberComments
