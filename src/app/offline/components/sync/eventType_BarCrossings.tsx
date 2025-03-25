import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import EventType_BarCrossingModel from '../../models/eventType_BarCrossing'
import { GET_EVENTTYPEBARCROSSING_BY_ID } from '@/app/lib/graphQL/query/offline/GET_EVENTTYPEBARCROSSING_BY_ID'
import { CREATE_EVENTTYPEBARCROSSING } from '@/app/lib/graphQL/mutation/offline/CREATE_EVENTTYPEBARCROSSING'
import { UPDATE_EVENTTYPEARCROSSING } from '@/app/lib/graphQL/mutation/offline/UPDATE_EVENTTYPEARCROSSING'
// REMEMBER: The indexedDB is the source of truth

const SyncEventType_BarCrossings : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new EventType_BarCrossingModel()
        const [CreateEventType_BarCrossing] = useMutation(CREATE_EVENTTYPEBARCROSSING, {
        onCompleted: (response) => {
            const data = response.createBarCrossingChecklist
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('EventType_BarCrossings','error','','sync')
            setUploadError("EventType_BarCrossings")
        },
    })
    const [UpdateEventType_BarCrossing] = useMutation(UPDATE_EVENTTYPEARCROSSING, {
        onCompleted: (response) => {
            const data = response.updateEventType_BarCrossing
            if(typeof window !== 'undefined'  && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('EventType_BarCrossings','error','','sync')
            setUploadError("EventType_BarCrossings")
        },
    })
    const [GetEventTypeBarCrossigById] = useLazyQuery(GET_EVENTTYPEBARCROSSING_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'EventType_BarCrossing') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('EventType_BarCrossings_NoupdatedRecord!')
                                addSuccessResult('EventType_BarCrossings','sync')
                                setStorageItem('EventType_BarCrossings','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('EventType_BarCrossings','error','','sync')
                            setUploadError("EventType_BarCrossings")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('EventType_BarCrossings','error','','sync')
            setUploadError("EventType_BarCrossings")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetEventTypeBarCrossigById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneEventType_BarCrossing
                    const updateData = {
                        crewBriefing: record.crewBriefing,
                        id: record.id,
                        lifeJackets: record.lifeJackets,
                        lookoutPosted: record.lookoutPosted,
                        memberID: record.memberID,
                        riskFactors: record.riskFactors,
                        stability: record.stability,
                        stopAssessPlan: record.stopAssessPlan,
                        vesselID: record.vesselID,
                        waterTightness: record.waterTightness,
                        weather: record.weather,
                    }
                    const createData = {
                        barCrossingChecklistID: record.barCrossingChecklistID,
                        geoLocationCompletedID: record.geoLocationCompletedID,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        lat: record.lat,
                        latCompleted: record.latCompleted,
                        lifeJackets: record.lifeJackets,
                        long: record.long,
                        longCompleted: record.longCompleted,
                        lookoutPosted: record.lookoutPosted,
                        time: record.time,
                        timeCompleted: record.timeCompleted,
                        tripEventID: record.tripEventID,
                        waterTightness: record.waterTightness,
                        weather: record.weather,
                    }
                    if(checkResult) {
                        UpdateEventType_BarCrossing({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateEventType_BarCrossing({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("EventType_BarCrossings")
                })
            })
        )
        setStorageItem('EventType_BarCrossings','success','100','sync')
        addSuccessResult('EventType_BarCrossings','sync')
    }
    useEffect(() => {
        setStorageItem('EventType_BarCrossings','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncEventType_BarCrossings
