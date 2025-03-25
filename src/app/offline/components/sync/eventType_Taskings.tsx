import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import EventType_TaskingModel from '../../models/eventType_Tasking'
import { GET_EVENTTYPE_TASKING } from '@/app/lib/graphQL/query/offline/GET_EVENTTYPE_TASKING'
import { CREATE_EVENTTYPE_TASKING } from '@/app/lib/graphQL/mutation/offline/CREATE_EVENTTYPE_TASKING'
import { UPDATE_EVENTTYPE_TASKING } from '@/app/lib/graphQL/mutation/offline/UPDATE_EVENTTYPE_TASKING'
// REMEMBER: The indexedDB is the source of truth

const SyncEventType_Taskings : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new EventType_TaskingModel()
        const [CreateEventType_Tasking] = useMutation(CREATE_EVENTTYPE_TASKING, {
        onCompleted: (response) => {
            const data = response.createEventType_Tasking
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('EventType_Taskings','error','','sync')
            setUploadError("EventType_Taskings")
        },
    })
    const [UpdateEventType_Tasking] = useMutation(UPDATE_EVENTTYPE_TASKING, {
        onCompleted: (response) => {
            const data = response.updateEventType_Tasking
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('EventType_Taskings','error','','sync')
            setUploadError("EventType_Taskings")
        },
    })
    const [GetEventTypeTasking] = useLazyQuery(GET_EVENTTYPE_TASKING,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'EventType_Tasking') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('EventType_Taskings_NoupdatedRecord!')
                                addSuccessResult('EventType_Taskings','sync')
                                setStorageItem('EventType_Taskings','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('EventType_Taskings','error','','sync')
                            setUploadError("EventType_Taskings")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('EventType_Taskings','error','','sync')
            setUploadError("EventType_Taskings")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetEventTypeTasking({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneEventType_Tasking
                    const updateData = {
                        cgop: record.cgop,
                        comments: record.comments,
                        completedTaskID: record.completedTaskID,
                        currentEntryID: record.currentEntryID,
                        fileTracking: record.fileTracking,
                        fuelLevel: record.fuelLevel,
                        fuelLog: record.fuelLog,
                        geoLocationID: record.geoLocationID,
                        groupID: record.groupID,
                        id: record.id,
                        lat: record.lat,
                        long: record.long,
                        openTaskID: record.openTaskID,
                        operationType: record.operationType,
                        parentTaskingID: record.parentTaskingID,
                        pausedTaskID: record.pausedTaskID,
                        personRescueID: record.personRescueID,
                        sarop: record.sarop,
                        status: record.status,
                        time: record.time,
                        title: record.title,
                        towingChecklistID: record.towingChecklistID,
                        tripEventID: record.tripEventID,
                        type: record.type,
                        vesselRescueID: record.vesselRescueID,
                    }
                    const createData = {
                        cgop: record.cgop,
                        comments: record.comments,
                        completedTaskID: record.completedTaskID,
                        created: record.created,
                        currentEntryID: record.currentEntryID,
                        fuelLevel: record.fuelLevel,
                        fuelLog: record.fuelLog,
                        geoLocationID: record.geoLocationID,
                        groupID: record.groupID,
                        id: record.id,
                        lat: record.lat,
                        long: record.long,
                        openTaskID: record.openTaskID,
                        operationType: record.operationType,
                        parentTaskingID: record.parentTaskingID,
                        pausedTaskID: record.pausedTaskID,
                        personRescueID: record.personRescueID,
                        sarop: record.sarop,
                        status: record.status,
                        time: record.time,
                        title: record.title,
                        towingChecklistID: record.towingChecklistID,
                        tripEventID: record.tripEventID,
                        type: record.type,
                        vesselRescueID: record.vesselRescueID,
                    }
                    if(checkResult) {
                        UpdateEventType_Tasking({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateEventType_Tasking({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("EventType_Taskings")
                })
            })
        )
        setStorageItem('EventType_Taskings','success','100','sync')
        addSuccessResult('EventType_Taskings','sync')
    }
    useEffect(() => {
        setStorageItem('EventType_Taskings','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncEventType_Taskings
