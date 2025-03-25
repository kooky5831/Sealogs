import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import MissionTimelineModel from '../../models/missionTimeline'
import { GET_MISSIONTIMELINE_BY_ID } from '@/app/lib/graphQL/query/offline/GET_MISSIONTIMELINE_BY_ID'
import { CREATE_MISSIONTIMELINE } from '@/app/lib/graphQL/mutation/offline/CREATE_MISSIONTIMELINE'
import { UPDATE_MISSIONTIMELINE } from '@/app/lib/graphQL/mutation/offline/UPDATE_MISSIONTIMELINE'
// REMEMBER: The indexedDB is the source of truth

const SyncMissionTimelines : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new MissionTimelineModel()
    const [CreateMissionTimeline] = useMutation(CREATE_MISSIONTIMELINE, {
        onCompleted: (response) => {
            const data = response.createMissionTimeline
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('MissionTimelines','error','','sync')
            setUploadError("MissionTimelines")
        },
    })
    const [UpdateMissionTimeline] = useMutation(UPDATE_MISSIONTIMELINE, {
        onCompleted: (response) => {
            const data = response.updateMissionTimeline
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('MissionTimelines','error','','sync')
            setUploadError("MissionTimelines")
        },
    })
    const [GetMissionTimelineById] = useLazyQuery(GET_MISSIONTIMELINE_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'MissionTimeline') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('MissionTimelines_NoupdatedRecord!')
                                addSuccessResult('MissionTimelines','sync')
                                setStorageItem('MissionTimelines','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('MissionTimelines','error','','sync')
                            setUploadError("MissionTimelines")
                        });
                }
            })
        } catch (error) {
            setStorageItem('MissionTimelines','error','','sync')
            console.error('Error retrieving records:', error);
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetMissionTimelineById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneMissionTimeline
                    const updateData = {
                        authorID: record.authorID,
                        commentType: record.commentType,
                        id: record.id,
                        maintenanceCheckID: record.maintenanceCheckID,
                        missionID: record.missionID,
                        personRescueID: record.personRescueID,
                        subTaskID: record.subTaskID,
                        time: record.time,
                        vesselRescueID: record.vesselRescueID,
                    }
                    const createData = {
                        authorID: record.authorID,
                        commentType: record.commentType,
                        id: record.id,
                        maintenanceCheckID: record.maintenanceCheckID,
                        missionID: record.missionID,
                        personRescueID: record.personRescueID,
                        subTaskID: record.subTaskID,
                        time: record.time,
                        vesselRescueID: record.vesselRescueID,
                    }
                    if(checkResult) {
                        UpdateMissionTimeline({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateMissionTimeline({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("MissionTimelines")
                })
            })
        )
        setStorageItem('MissionTimelines','success','100','sync')
        addSuccessResult('MissionTimelines','sync')
    }
    useEffect(() => {
        setStorageItem('MissionTimelines','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncMissionTimelines
