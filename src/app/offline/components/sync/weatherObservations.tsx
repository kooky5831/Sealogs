import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import WeatherObservationModel from '../../models/weatherObservation'
import { GET_WEATHEROBSERVATION } from '@/app/lib/graphQL/query/offline/GET_WEATHEROBSERVATION'
import { CREATE_WEATHEROBSERVATION } from '@/app/lib/graphQL/mutation/offline/CREATE_WEATHEROBSERVATION'
import { UPDATE_WEATHEROBSERVATION } from '@/app/lib/graphQL/mutation/offline/UPDATE_WEATHEROBSERVATION'
// REMEMBER: The indexedDB is the source of truth

const SyncWeatherObservations : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new WeatherObservationModel()
    const [CreateWeatherObservation] = useMutation(CREATE_WEATHEROBSERVATION, {
        onCompleted: (response) => {
            const data = response.createWeatherObservation
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('WeatherObservations','error','','sync')
            setUploadError("WeatherObservations")
        },
    })
    const [UpdateWeatherObservation] = useMutation(UPDATE_WEATHEROBSERVATION, {
        onCompleted: (response) => {
            const data = response.updateWeatherObservation
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('WeatherObservations','error','','sync')
            setUploadError("WeatherObservations")
        },
    })
    const [ReadOneWeatherObservation] = useLazyQuery(GET_WEATHEROBSERVATION,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'WeatherObservation') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('WeatherObservations_noUpdatedRecord!')
                                addSuccessResult('WeatherObservations','sync')
                                setStorageItem('WeatherObservations','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('WeatherObservations','error','','sync')
                            setUploadError("WeatherObservations")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('WeatherObservations','error','','sync')
            setUploadError("WeatherObservations")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await ReadOneWeatherObservation({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneWeatherObservation
                    const updateData = {
                        cloudCover: record.cloudCover,
                        comment: record.comment,
                        forecastID: record.forecastID,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        lat: record.lat,
                        logBookEntryID: record.logBookEntryID,
                        long: record.long,
                        precipitation: record.precipitation,
                        pressure: record.pressure,
                        swell: record.swell,
                        time: record.time,
                        visibility: record.visibility,
                        windDirection: record.windDirection,
                        windSpeed: record.windSpeed
                    }
                    const createData = {
                        cloudCover: record.cloudCover,
                        comment: record.comment,
                        forecastID: record.forecastID,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        lat: record.lat,
                        logBookEntryID: record.logBookEntryID,
                        long: record.long,
                        precipitation: record.precipitation,
                        pressure: record.pressure,
                        swell: record.swell,
                        time: record.time,
                        visibility: record.visibility,
                        windDirection: record.windDirection,
                        windSpeed: record.windSpeed,
                    }
                    if(checkResult) {
                        UpdateWeatherObservation({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateWeatherObservation({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("WeatherObservations")
                })
            })
        )
        setStorageItem('WeatherObservations','success','100','sync')
        addSuccessResult('WeatherObservations','sync')
    }
    useEffect(() => {
        setStorageItem('WeatherObservations','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncWeatherObservations
