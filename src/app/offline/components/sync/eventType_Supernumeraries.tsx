import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import EventType_SupernumeraryModel from '../../models/eventType_Supernumerary'
import { GET_EVENTTYPE_SUPERNUMERARY } from '@/app/lib/graphQL/query/offline/GET_EVENTTYPE_SUPERNUMERARY'
import { CREATE_EVENTTYPE_SUPERNUMERARY } from '@/app/lib/graphQL/mutation/offline/CREATE_EVENTTYPE_SUPERNUMERARY'
import { UPDATE_EVENTTYPE_SUPERNUMERARY } from '@/app/lib/graphQL/mutation/offline/UPDATE_EVENTTYPE_SUPERNUMERARY'
// REMEMBER: The indexedDB is the source of truth

const SyncEventType_Supernumeraries: React.FC<{ flag: string }> = React.memo(
    ({ flag }) => {
        const model = new EventType_SupernumeraryModel()
        const [CreateEventType_Supernumerary] = useMutation(CREATE_EVENTTYPE_SUPERNUMERARY, {
        onCompleted: (response) => {
            const data = response.createEventType_Supernumerary
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('EventType_Supernumeraries','error','0','sync')
            setUploadError("EventType_Supernumeraries")
        },
    })
    const [UpdateEventType_Supernumerary] = useMutation(UPDATE_EVENTTYPE_SUPERNUMERARY, {
        onCompleted: (response) => {
            const data = response.updateEventType_Supernumerary
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('EventType_Supernumeraries','error','0','sync')
            setUploadError("EventType_Supernumeraries")
        },
    })
    const [ReadOneEventType_Supernumerary] = useLazyQuery(GET_EVENTTYPE_SUPERNUMERARY,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'EventType_Supernumerary') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('EventType_Supernumeraries_NoupdatedRecord!')
                                addSuccessResult('EventType_Supernumeraries','sync')
                                setStorageItem('EventType_Supernumeraries','success','100','sync')
                            }})
                        .catch((err) => {
                            setStorageItem('EventType_Supernumeraries','error','0','sync')
                            setUploadError("EventType_Supernumeraries")
                            console.log("read record Error:",table.name)
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('EventType_Supernumeraries','error','0','sync')
            setUploadError("EventType_Supernumeraries")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await ReadOneEventType_Supernumerary({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneEventType_Supernumerary
                    const updateData = {
                        briefingTime: record.briefingTime,
                        focGuest: record.focGuest,
                        guestList: record.guestList,
                        id: record.id,
                        isBriefed: record.isBriefed,
                        title: record.title,
                        totalGuest: record.totalGuest,
                    }
                    const createData = {
                        briefingTime: record.briefingTime,
                        created: record.created,
                        focGuest: record.focGuest,
                        guestList: record.guestList,
                        id: record.id,
                        isBriefed: record.isBriefed,
                        title: record.title,
                        totalGuest: record.totalGuest,
                    }
                    if(checkResult) {
                        UpdateEventType_Supernumerary({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateEventType_Supernumerary({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("EventType_Supernumeraries")
                })
            })
        )
        setStorageItem('EventType_Supernumeraries','success','100','sync')
        addSuccessResult('EventType_Supernumeraries','sync')
    }
    useEffect(() => {
        setStorageItem('EventType_Supernumeraries','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncEventType_Supernumeraries
