import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import GeoLocationModel from '../../models/geoLocation'
import { CREATE_GEOLOCATION } from '@/app/lib/graphQL/mutation/offline/CREATE_GEOLOCATION'
import { UPDATE_GEOLOCATION } from '@/app/lib/graphQL/mutation/offline/UPDATE_GEOLOCATION'
import { GET_GEOLOCATION_BY_ID } from '@/app/lib/graphQL/query/offline/GET_GEOLOCATION_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncGeoLocations : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new GeoLocationModel()
    const [CreateGeoLocation] = useMutation(CREATE_GEOLOCATION, {
        onCompleted: (response) => {
            const data = response.createGeoLocation
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('GeoLocations','error','','sync')
            setUploadError("GeoLocations")
        },
    })
    const [UpdateGeoLocation] = useMutation(UPDATE_GEOLOCATION, {
        onCompleted: (response) => {
            const data = response.updateGeoLocation
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('GeoLocations','error','','sync')
            setUploadError("GeoLocations")
        },
    })
    const [GetGeoLocationById] = useLazyQuery(GET_GEOLOCATION_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'GeoLocation') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('GeoLocations_NoUpdatedRecord!')
                                addSuccessResult('GeoLocations','sync')
                                setStorageItem('GeoLocations','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('GeoLocations','error','','sync')
                            setUploadError("GeoLocations")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('GeoLocations','error','','sync')
            setUploadError("GeoLocations")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetGeoLocationById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneGeoLocation
                    const updateData = {
                        clientID: record.clientID,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        lat: record.lat,
                        long: record.long,
                        time: record.time,
                        vehicleID: record.vehicleID,
                    }
                    const createData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        id: record.id,
                        lat: record.lat,
                        long: record.long,
                        parentLocationID: record.parentLocationID,
                        parentTransitID: record.parentTransitID,
                        sortOrder: record.sortOrder,
                        title: record.title,
                        transitCode: record.transitCode,
                        transitID: record.transitID,
                        transitStopID: record.transitStopID,
                        tripScheduleStops: record.tripScheduleStops,
                        tripSchedulesFrom: record.tripSchedulesFrom,
                        tripSchedulesTo: record.tripSchedulesTo,
                    }
                    if(checkResult) {
                        UpdateGeoLocation({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateGeoLocation({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("GeoLocations")
                })
            })
        )
        setStorageItem('GeoLocations','success','100','sync')
        addSuccessResult('GeoLocations','sync')
    }
    useEffect(() => {
        setStorageItem('GeoLocations','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncGeoLocations
