import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import TripReport_StopModel from '../../models/tripReport_Stop'
import { GET_TRIPREPORT_STOP_BY_ID } from '@/app/lib/graphQL/query/offline/GET_TRIPREPORT_STOP_BY_ID'
import { CREATE_TRIPREPORT_STOP } from '@/app/lib/graphQL/mutation/offline/CREATE_TRIPREPORT_STOP'
import { UPDAE_TRIPREPORT_STOP } from '@/app/lib/graphQL/mutation/offline/UPDAE_TRIPREPORT_STOP'
// REMEMBER: The indexedDB is the source of truth

const SyncTripReport_Stops : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new TripReport_StopModel()
    const [CreateTripReport_Stop] = useMutation(CREATE_TRIPREPORT_STOP, {
        onCompleted: (response) => {
            const data = response.createTripReport_Stop
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('TripReport_Stops','error','','sync')
            setUploadError("TripReport_Stops")
        },
    })
    const [UpdateTripReport_Stop] = useMutation(UPDAE_TRIPREPORT_STOP, {
        onCompleted: (response) => {
            const data = response.updateTripReport_Stop
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('TripReport_Stops','error','','sync')
            setUploadError("TripReport_Stops")
        },
    })
    const [GetTripReport_StopById] = useLazyQuery(GET_TRIPREPORT_STOP_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'TripReport_Stop') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('TripReport_Stops_NoupdatedRecord!')
                                addSuccessResult('TripReport_Stops','sync')
                                setStorageItem('TripReport_Stops','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('TripReport_Stops','error','','sync')
                            setUploadError("TripReport_Stops")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('TripReport_Stops','error','','sync')
            setUploadError("TripReport_Stops")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetTripReport_StopById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneTripReport_Stop
                    const updateData = {
                        arriveTime: record.arriveTime,
                        clientID: record.clientID,
                        comments: record.comments,
                        dangerousGoodsChecklistID: record.dangerousGoodsChecklistID,
                        departTime: record.departTime,
                        id: record.id,
                        lat: record.lat,
                        logBookEntrySectionID: record.logBookEntrySectionID,
                        long: record.long,
                        observedArrive: record.observedArrive,
                        observedDepart: record.observedDepart,
                        otherCargo: record.otherCargo,
                        paxDeparted: record.paxDeparted,
                        paxJoined: record.paxJoined,
                        stopLocationID: record.stopLocationID,
                        tripReportScheduleStopID: record.tripReportScheduleStopID,
                        vehiclesDeparted: record.vehiclesDeparted,
                        vehiclesDepartedATV: record.vehiclesDepartedATV,
                        vehiclesDepartedBicycle: record.vehiclesDepartedBicycle,
                        vehiclesDepartedLorry: record.vehiclesDepartedLorry,
                        vehiclesDepartedLorryTrailer: record.vehiclesDepartedLorryTrailer,
                        vehiclesDepartedMotoRoller: record.vehiclesDepartedMotoRoller,
                        vehiclesDepartedMotorbike: record.vehiclesDepartedMotorbike,
                        vehiclesDepartedNormal: record.vehiclesDepartedNormal,
                        vehiclesDepartedNormalTrailer: record.vehiclesDepartedNormalTrailer,
                        vehiclesDepartedOther: record.vehiclesDepartedOther,
                        vehiclesDepartedTractor: record.vehiclesDepartedTractor,
                        vehiclesDepartedVan: record.vehiclesDepartedVan,
                        vehiclesJoined: record.vehiclesJoined,
                        vehiclesJoinedATV: record.vehiclesJoinedATV,
                        vehiclesJoinedBicycle: record.vehiclesJoinedBicycle,
                        vehiclesJoinedLorry: record.vehiclesJoinedLorry,
                        vehiclesJoinedLorryTrailer: record.vehiclesJoinedLorryTrailer,
                        vehiclesJoinedMotoRoller: record.vehiclesJoinedMotoRoller,
                        vehiclesJoinedMotorbike: record.vehiclesJoinedMotorbike,
                        vehiclesJoinedNormal: record.vehiclesJoinedNormal,
                        vehiclesJoinedNormalTrailer: record.vehiclesJoinedNormalTrailer,
                        vehiclesJoinedOther: record.vehiclesJoinedOther,
                        vehiclesJoinedTractor: record.vehiclesJoinedTractor,
                        vehiclesJoinedVan: record.vehiclesJoinedVan,
                    }
                    const createData = {
                        arriveTime: record.arriveTime,
                        clientID: record.clientID,
                        comments: record.comments,
                        dangerousGoodsChecklistID: record.dangerousGoodsChecklistID,
                        departTime: record.departTime,
                        id: record.id,
                        lat: record.lat,
                        logBookEntrySectionID: record.logBookEntrySectionID,
                        long: record.long,
                        observedArrive: record.observedArrive,
                        observedDepart: record.observedDepart,
                        otherCargo: record.otherCargo,
                        paxDeparted: record.paxDeparted,
                        paxJoined: record.paxJoined,
                        stopLocationID: record.stopLocationID,
                        tripReportScheduleStopID: record.tripReportScheduleStopID,
                        uniqueID: record.uniqueID,
                        vehiclesDeparted: record.vehiclesDeparted,
                        vehiclesDepartedATV: record.vehiclesDepartedATV,
                        vehiclesDepartedBicycle: record.vehiclesDepartedBicycle,
                        vehiclesDepartedLorry: record.vehiclesDepartedLorry,
                        vehiclesDepartedLorryTrailer: record.vehiclesDepartedLorryTrailer,
                        vehiclesDepartedMotoRoller: record.vehiclesDepartedMotoRoller,
                        vehiclesDepartedMotorbike: record.vehiclesDepartedMotorbike,
                        vehiclesDepartedNormal: record.vehiclesDepartedNormal,
                        vehiclesDepartedNormalTrailer: record.vehiclesDepartedNormalTrailer,
                        vehiclesDepartedOther: record.vehiclesDepartedOther,
                        vehiclesDepartedTractor: record.vehiclesDepartedTractor,
                        vehiclesDepartedVan: record.vehiclesDepartedVan,
                        vehiclesJoined: record.vehiclesJoined,
                        vehiclesJoinedATV: record.vehiclesJoinedATV,
                        vehiclesJoinedBicycle: record.vehiclesJoinedBicycle,
                        vehiclesJoinedLorry: record.vehiclesJoinedLorry,
                        vehiclesJoinedLorryTrailer: record.vehiclesJoinedLorryTrailer,
                        vehiclesJoinedMotoRoller: record.vehiclesJoinedMotoRoller,
                        vehiclesJoinedMotorbike: record.vehiclesJoinedMotorbike,
                        vehiclesJoinedNormal: record.vehiclesJoinedNormal,
                        vehiclesJoinedNormalTrailer: record.vehiclesJoinedNormalTrailer,
                        vehiclesJoinedOther: record.vehiclesJoinedOther,
                        vehiclesJoinedTractor: record.vehiclesJoinedTractor,
                        vehiclesJoinedVan: record.vehiclesJoinedVan,
                    }
                    if(checkResult) {
                        UpdateTripReport_Stop({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateTripReport_Stop({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("TripReport_Stops")
                })
            })
        )
        setStorageItem('TripReport_Stops','success','100','sync')
        addSuccessResult('TripReport_Stops','sync')
    }
    useEffect(() => {
        setStorageItem('TripReport_Stops','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncTripReport_Stops
