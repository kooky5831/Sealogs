import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import EventType_PersonRescueModel from '../../models/eventType_PersonRescue'
import { GET_EVENTTYPE_PERONRESCUE_BY_ID } from '@/app/lib/graphQL/query/offline/GET_EVENTTYPE_PERONRESCUE_BY_ID'
import { CREATE_EVENTTYPE_PERSONRESCUE } from '@/app/lib/graphQL/mutation/offline/CREATE_EVENTTYPE_PERSONRESCUE'
import { UPDATE_EVENTTYPE_PERSONSCUE } from '@/app/lib/graphQL/mutation/offline/UPDATE_EVENTTYPE_PERSONSCUE'
// REMEMBER: The indexedDB is the source of truth

const SyncEventType_PersonRescues : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new EventType_PersonRescueModel()
        const [CreateEventType_PersonRescue] = useMutation(CREATE_EVENTTYPE_PERSONRESCUE, {
        onCompleted: (response) => {
            const data = response.createEventType_PersonRescue
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('EventType_PersonRescues','error','0','sync')
            setUploadError("EventType_PersonRescues")
        },
    })
    const [UpdateEventType_PersonRescue] = useMutation(UPDATE_EVENTTYPE_PERSONSCUE, {
        onCompleted: (response) => {
            const data = response.updateEventType_PersonRescue
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('EventType_PersonRescues','error','0','sync')
            setUploadError("EventType_PersonRescues")
        },
    })
    const [GetEventTypePersonRescueById] = useLazyQuery(GET_EVENTTYPE_PERONRESCUE_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'EventType_PersonRescue') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('EventType_PersonRescues_NoupdatedRecord!')
                                addSuccessResult('EventType_PersonRescues','sync')
                                setStorageItem('EventType_PersonRescues','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('EventType_PersonRescues','error','0','sync')
                            setUploadError("EventType_PersonRescues")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('EventType_PersonRescues','error','0','sync')
            setUploadError("EventType_PersonRescues")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetEventTypePersonRescueById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneEventType_PersonRescue
                    const updateData = {
                        age: record.age,
                        cgMembershipNumber: record.cgMembershipNumber,
                        cgMembershipType: record.cgMembershipType,
                        gender: record.gender,
                        id: record.id,
                        missionID: record.missionID,
                        missionTimeline: record.missionTimeline,
                        operationDescription: record.operationDescription,
                        operationType: record.operationType,
                        personDescription: record.personDescription,
                        personName: record.personName,
                        tripEventID: record.tripEventID,
                    }
                    const createData = {
                        age: record.age,
                        cgMembershipNumber: record.cgMembershipNumber,
                        cgMembershipType: record.cgMembershipType,
                        gender: record.gender,
                        id: record.id,
                        missionID: record.missionID,
                        missionTimeline: record.missionTimeline,
                        operationDescription: record.operationDescription,
                        operationType: record.operationType,
                        personDescription: record.personDescription,
                        personName: record.personName,
                        tripEventID: record.tripEventID,
                    }
                    if(checkResult) {
                        UpdateEventType_PersonRescue({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateEventType_PersonRescue({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("EventType_PersonRescues")
                })
            })
        )
        setStorageItem('EventType_PersonRescues','success','100','sync')
        addSuccessResult('EventType_PersonRescues','sync')
    }
    useEffect(() => {
        setStorageItem('EventType_PersonRescues','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncEventType_PersonRescues
