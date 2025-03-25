import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import { CREATE_SECTION_MEMBER_COMMENT, UPDATE_SECTION_MEMBER_COMMENT } from '@/app/lib/graphQL/mutation'
import SectionMemberCommentModel from '../../models/sectionMemberComment'
import { GET_SECTIONMEMBERCOMMENT } from '@/app/lib/graphQL/query/offline/GET_SECTIONMEMBERCOMMENT'

// REMEMBER: The indexedDB is the source of truth
const SyncSectionMemberComments : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new SectionMemberCommentModel()
    const [CreateSectionMemberComment] = useMutation(CREATE_SECTION_MEMBER_COMMENT, {
        onCompleted: (response) => {
            const data = response.createSectionMemberComment
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('SectionMemberComments','error','','sync')
            setUploadError("SectionMemberComments")
        },
    })
    const [UpdateSectionMemberComment] = useMutation(UPDATE_SECTION_MEMBER_COMMENT, {
        onCompleted: (response) => {
            const data = response.updateSectionMemberComment
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('SectionMemberComments','error','','sync')
            setUploadError("SectionMemberComments")
        },
    })
    const [Get_SectionMemberComment] = useLazyQuery(GET_SECTIONMEMBERCOMMENT,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'SectionMemberComment') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('SectionMemberComments_NoupdatedRecord!')
                                addSuccessResult('SectionMemberComments','sync')
                                setStorageItem('SectionMemberComments','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('SectionMemberComments','error','','sync')
                            setUploadError("SectionMemberComments")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('SectionMemberComments','error','','sync')
            setUploadError("SectionMemberComments")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await Get_SectionMemberComment({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneSectionMemberComment
                    const createData = {
                        className: record.className,
                        clientID: record.clientID,
                        comment: record.comment,
                        commentType: record.commentType,
                        created: record.created,
                        detail: record.detail,
                        fieldCommentNotifications: record.fieldCommentNotifications,
                        fieldName: record.fieldName,
                        fileTracking: record.fileTracking,
                        hideComment: record.hideComment,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        logBookEntryID: record.logBookEntryID,
                        logBookEntrySectionID: record.logBookEntrySectionID,
                        maintenanceCheckID: record.maintenanceCheckID,
                        seaLogsMemberID: record.seaLogsMemberID,
                        uniqueID: record.uniqueID,
                        workOrderNumber: record.workOrderNumber
                    }
                    const updateData = {
                        className: record.className,
                        clientID: record.clientID,
                        comment: record.comment,
                        commentType: record.commentType,
                        created: record.created,
                        detail: record.detail,
                        fieldCommentNotifications: record.fieldCommentNotifications,
                        fieldName: record.fieldName,
                        fileTracking: record.fileTracking,
                        hideComment: record.hideComment,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        logBookEntryID: record.logBookEntryID,
                        logBookEntrySectionID: record.logBookEntrySectionID,
                        maintenanceCheckID: record.maintenanceCheckID,
                        seaLogsMemberID: record.seaLogsMemberID,
                        uniqueID: record.uniqueID,
                        workOrderNumber: record.workOrderNumber,
                    }
                    if(checkResult) {
                        UpdateSectionMemberComment({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateSectionMemberComment({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("SectionMemberComments")
                })
            })
        )
        setStorageItem('SectionMemberComments','success','100','sync')
        addSuccessResult('SectionMemberComments','sync')
    }
    useEffect(() => {
        setStorageItem('SectionMemberComments','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncSectionMemberComments
