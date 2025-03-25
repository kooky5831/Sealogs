import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import EventType_RestrictedVisibilityModel from '../../models/eventType_RestrictedVisibility'
import { GET_EVENTTYPE_RESTRICTEDVISIBILITIES_BY_ID } from '@/app/lib/graphQL/query/offline/GET_EVENTTYPE_RESTRICTEDVISIBILITIES_BY_ID'
import { CREATE_EVENTTYPE_RESTRICTEDVISIBILITY } from '@/app/lib/graphQL/mutation/offline/CREATE_EVENTTYPE_RESTRICTEDVISIBILITY'
import { UPDATE_EVENTTYPE_RESTRICTEDVISIBILITY } from '@/app/lib/graphQL/mutation/offline/UPDATE_EVENTTYPE_RESTRICTEDVISIBILITY'
// REMEMBER: The indexedDB is the source of truth

const SyncEventType_RestrictedVisibilities : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new EventType_RestrictedVisibilityModel()
        const [CreateEventType_RestrictedVisibility] = useMutation(CREATE_EVENTTYPE_RESTRICTEDVISIBILITY, {
        onCompleted: (response) => {
            const data = response.createEventType_RestrictedVisibility
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('EventType_RestrictedVisibilities','error','','sync')
            setUploadError("EventType_RestrictedVisibilities")
        },
    })
    const [UpdateEventType_RestrictedVisibility] = useMutation(UPDATE_EVENTTYPE_RESTRICTEDVISIBILITY, {
        onCompleted: (response) => {
            const data = response.updateEventType_RestrictedVisibility
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('EventType_RestrictedVisibilities','error','','sync')
            setUploadError("EventType_RestrictedVisibilities")
        },
    })
    const [GetEventTypeRestrictedVisibilitiesById] = useLazyQuery(GET_EVENTTYPE_RESTRICTEDVISIBILITIES_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'EventType_RestrictedVisibility') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('EventType_RestrictedVisibilities_NoupdatedRecord!')
                                addSuccessResult('EventType_RestrictedVisibilities','sync')
                                setStorageItem('EventType_RestrictedVisibilities','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('EventType_RestrictedVisibilities','error','','sync')
                            setUploadError("EventType_RestrictedVisibilities")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('EventType_RestrictedVisibilities','error','','sync')
            setUploadError("EventType_RestrictedVisibilities")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetEventTypeRestrictedVisibilitiesById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneRefuellingBunkering
                    const updateData = {
                        approxSafeSpeed: record.approxSafeSpeed,
                        crewBriefing: record.crewBriefing,
                        crossedTime: record.crossedTime,
                        crossingTime: record.crossingTime,
                        endLat: record.endLat,
                        endLocationID: record.endLocationID,
                        endLong: record.endLong,
                        estSafeSpeed: record.estSafeSpeed,
                        id: record.id,
                        lookout: record.lookout,
                        navLights: record.navLights,
                        radarWatch: record.radarWatch,
                        radioWatch: record.radioWatch,
                        report: record.report,
                        soundSignal: record.soundSignal,
                        soundSignals: record.soundSignals,
                        startLat: record.startLat,
                        startLocationID: record.startLocationID,
                        startLong: record.startLong,
                        stopAssessPlan: record.stopAssessPlan,
                        tripEventID: record.tripEventID,
                    }
                    const createData = {
                        approxSafeSpeed: record.approxSafeSpeed,
                        crewBriefing: record.crewBriefing,
                        crossedTime: record.crossedTime,
                        crossingTime: record.crossingTime,
                        endLat: record.endLat,
                        endLocationID: record.endLocationID,
                        endLong: record.endLong,
                        estSafeSpeed: record.estSafeSpeed,
                        id: record.id,
                        lookout: record.lookout,
                        navLights: record.navLights,
                        radarWatch: record.radarWatch,
                        radioWatch: record.radioWatch,
                        report: record.report,
                        soundSignal: record.soundSignal,
                        soundSignals: record.soundSignals,
                        startLat: record.startLat,
                        startLocationID: record.startLocationID,
                        startLong: record.startLong,
                        stopAssessPlan: record.stopAssessPlan,
                        tripEventID: record.tripEventID,
                    }
                    if(checkResult) {
                        UpdateEventType_RestrictedVisibility({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateEventType_RestrictedVisibility({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("EventType_RestrictedVisibilities")
                })
            })
        )
        setStorageItem('EventType_RestrictedVisibilities','success','100','sync')
        addSuccessResult('EventType_RestrictedVisibilities','sync')
    }
    useEffect(() => {
        setStorageItem('EventType_RestrictedVisibilities','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncEventType_RestrictedVisibilities
