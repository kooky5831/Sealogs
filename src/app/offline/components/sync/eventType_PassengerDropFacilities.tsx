import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import EventType_PassengerDropFacilityModel from '../../models/eventType_PassengerDropFacility'
import { GET_EVENTTYPE_PASSENGERDROPFACILITIY_BY_ID } from '@/app/lib/graphQL/query/offline/GET_EVENTTYPE_PASSENGERDROPFACILITIY_BY_ID'
import { CREATE_EVENTTYPE_PASSENGERDROPFACLIITY } from '@/app/lib/graphQL/mutation/offline/CREATE_EVENTTYPE_PASSENGERDROPFACLIITY'
import { UPDATE_EVENTTYPE_PASSENGERDROPFACILITY } from '@/app/lib/graphQL/mutation/offline/UPDATE_EVENTTYPE_PASSENGERDROPFACILITY'
// REMEMBER: The indexedDB is the source of truth

const SyncEventType_PassengerDropFacilities : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new EventType_PassengerDropFacilityModel()
        const [CreateEventType_PassengerDropFacility] = useMutation(CREATE_EVENTTYPE_PASSENGERDROPFACLIITY, {
        onCompleted: (response) => {
            const data = response.createEventType_PassengerDropFacility
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('EventType_PassengerDropFacilities','error','','sync')
            setUploadError("EventType_PassengerDropFacilities")
        },
    })
    const [UpdateEventType_PassengerDropFacility] = useMutation(UPDATE_EVENTTYPE_PASSENGERDROPFACILITY, {
        onCompleted: (response) => {
            const data = response.updateEventType_PassengerDropFacility
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('EventType_PassengerDropFacilities','error','','sync')
            setUploadError("EventType_PassengerDropFacilities")
        },
    })
    const [GetEventTypePassengerDropFacilityById] = useLazyQuery(GET_EVENTTYPE_PASSENGERDROPFACILITIY_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'EventType_PassengerDropFacility') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('EventType_PassengerDropFacilities_NoupdatedRecord!')
                                addSuccessResult('EventType_PassengerDropFacilities','sync')
                                setStorageItem('EventType_PassengerDropFacilities','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('EventType_PassengerDropFacilities','error','','sync')
                            setUploadError("EventType_PassengerDropFacilities")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('EventType_PassengerDropFacilities','error','','sync')
            setUploadError("EventType_PassengerDropFacilities")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetEventTypePassengerDropFacilityById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneEventType_PassengerDropFacility
                    const updateData = {
                        date: record.date,
                        fuelLog: record.fuelLog,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        lat: record.lat,
                        long: record.long,
                        notes: record.notes,
                        title: record.title,
                        tripEventID: record.tripEventID,
                    }
                    const createData = {
                        date: record.date,
                        fuelLog: record.fuelLog,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        lat: record.lat,
                        long: record.long,
                        notes: record.notes,
                        title: record.title,
                        tripEventID: record.tripEventID,
                    }
                    if(checkResult) {
                        UpdateEventType_PassengerDropFacility({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateEventType_PassengerDropFacility({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("EventType_PassengerDropFacilities")
                })
            })
        )
        setStorageItem('EventType_PassengerDropFacilities','success','100','sync')
        addSuccessResult('EventType_PassengerDropFacilities','sync')
    }
    useEffect(() => {
        setStorageItem('EventType_PassengerDropFacilities','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncEventType_PassengerDropFacilities
