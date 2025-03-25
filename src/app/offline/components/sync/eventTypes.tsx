import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import EventTypeModel from '../../models/eventType'
import { GET_EVENTTYPE_BY_ID } from '@/app/lib/graphQL/query/offline/GET_EVENTTYPE_BY_ID'
import { CREATE_EVENTTYPE } from '@/app/lib/graphQL/mutation/offline/CERATE_EVENTTYPE'
import { UPDATE_EVENTTYPE } from '@/app/lib/graphQL/mutation/offline/UPDATE_EVENTTYPE'
// REMEMBER: The indexedDB is the source of truth

const SyncEventTypes: React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new EventTypeModel()
        const [CreateEventType] = useMutation(CREATE_EVENTTYPE, {
        onCompleted: (response) => {
            const data = response.createEventType
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('EventTypes','error','0','sync')
            setUploadError("EventTypes")
        },
    })
    const [UpdateEventType] = useMutation(UPDATE_EVENTTYPE, {
        onCompleted: (response) => {
            const data = response.updateEventType
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('EventTypes','error','0','sync')
            setUploadError("EventTypes")
        },
    })
    const [GetEventTypeById] = useLazyQuery(GET_EVENTTYPE_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'EventType') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('EventTypes_NoupdatedRecord!')
                                addSuccessResult('EventTypes','sync')
                                setStorageItem('EventTypes','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('EventTypes','error','0','sync')
                            setUploadError("EventTypes")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('EventTypes','error','0','sync')
            setUploadError("EventTypes")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetEventTypeById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneEventType
                    const updateData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        id: record.id,
                        title: record.title,
                    }
                    const createData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        id: record.id,
                        title: record.title,
                    }
                    if(checkResult) {
                        UpdateEventType({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateEventType({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("EventTypes")
                })
            })
        )
        setStorageItem('EventTypes','success','100','sync')
        addSuccessResult('EventTypes','sync')
    }
    useEffect(() => {
        setStorageItem('EventTypes','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncEventTypes
