import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import TripEventModel from '../../models/tripEvent'
import { GET_TRIPEVENT_BY_ID } from '@/app/lib/graphQL/query/offline/GET_TRIPEVENT_BY_ID'
import { CREATE_TRIPEVENT } from '@/app/lib/graphQL/mutation/offline/CREATE_TRIPEVENT'
import { UPDATE_TRIPEVENT } from '@/app/lib/graphQL/mutation/offline/UPDATE_TRIPEVENT'
// REMEMBER: The indexedDB is the source of truth

const SyncTripEvents : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new TripEventModel()
    const [CreateTripEvent] = useMutation(CREATE_TRIPEVENT, {
        onCompleted: (response) => {
            const data = response.createTripEvent
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('TripEvents','error','','sync')
            setUploadError("TripEvents")
        },
    })
    const [UpdateTripEvent] = useMutation(UPDATE_TRIPEVENT, {
        onCompleted: (response) => {
            const data = response.updateTripEvent
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('TripEvents','error','','sync')
            setUploadError("TripEvents")
        },
    })
    const [GetTripEventById] = useLazyQuery(GET_TRIPEVENT_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'TripEvent') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('TripEvents_NoupdatedRecord!')
                                addSuccessResult('TripEvents','sync')
                                setStorageItem('TripEvents','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('TripEvents','error','','sync')
                            setUploadError("TripEvents")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('TripEvents','error','','sync')
            setUploadError("TripEvents")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetTripEventById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneTripEvent
                    const updateData = {
                        cause: record.cause,
                        clientID: record.clientID,
                        crewTrainingID: record.crewTrainingID,
                        eventTypeID: record.eventTypeID,
                        eventType_BarCrossingID: record.eventType_BarCrossingID,
                        eventType_PassengerDropFacilityID: record.eventType_PassengerDropFacilityID,
                        eventType_PersonRescueID: record.eventType_PersonRescueID,
                        eventType_RefuellingBunkeringID: record.eventType_RefuellingBunkeringID,
                        eventType_RestrictedVisibilityID: record.eventType_RestrictedVisibilityID,
                        eventType_TaskingID: record.eventType_TaskingID,
                        eventType_VesselRescueID: record.eventType_VesselRescueID,
                        id: record.id,
                        logBookEntrySectionID: record.logBookEntrySectionID,
                        notes: record.notes,
                        numberPax: record.numberPax,
                        seaLogsMemberID: record.seaLogsMemberID,
                        supernumeraryID: record.supernumeraryID,
                    }
                    const createData = {
                        cause: record.cause,
                        clientID: record.clientID,
                        crewTrainingID: record.crewTrainingID,
                        eventTypeID: record.eventTypeID,
                        eventType_BarCrossingID: record.eventType_BarCrossingID,
                        eventType_PassengerDropFacilityID: record.eventType_PassengerDropFacilityID,
                        eventType_PersonRescueID: record.eventType_PersonRescueID,
                        eventType_RefuellingBunkeringID: record.eventType_RefuellingBunkeringID,
                        eventType_RestrictedVisibilityID: record.eventType_RestrictedVisibilityID,
                        eventType_TaskingID: record.eventType_TaskingID,
                        eventType_VesselRescueID: record.eventType_VesselRescueID,
                        id: record.id,
                        logBookEntrySectionID: record.logBookEntrySectionID,
                        notes: record.notes,
                        numberPax: record.numberPax,
                        seaLogsMemberID: record.seaLogsMemberID,
                        supernumeraryID: record.supernumeraryID,
                    }
                    if(checkResult) {
                        UpdateTripEvent({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateTripEvent({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("TripEvents")
                })
            })
        )
        setStorageItem('TripEvents','success','100','sync')
        addSuccessResult('TripEvents','sync')
    }
    useEffect(() => {
        setStorageItem('TripEvents','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncTripEvents
