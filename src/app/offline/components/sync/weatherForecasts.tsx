import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import WeatherForecastModel from '../../models/weatherForecast'
import { GET_WEATHERFORECAST } from '@/app/lib/graphQL/query/offline/GET_WEATHERFORECAST'
import { CREATE_WEATHERFORECAST } from '@/app/lib/graphQL/mutation/offline/CREATE_WEATHERFORECAST'
import { UPDATE_WEATHERFORECAST } from '@/app/lib/graphQL/mutation/offline/UPDATE_WEATHERFORECAST'
// REMEMBER: The indexedDB is the source of truth

const SyncWeatherForecasts : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new WeatherForecastModel()
    const [CreateWeatherForecast] = useMutation(CREATE_WEATHERFORECAST, {
        onCompleted: (response) => {
            const data = response.createWeatherForecast
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('WeatherForecasts','error','0','sync')
            setUploadError("WeatherForecasts")
        },
    })
    const [UpdateWeatherForecast] = useMutation(UPDATE_WEATHERFORECAST, {
        onCompleted: (response) => {
            const data = response.updateWeatherForecast
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('WeatherForecasts','error','0','sync')
            setUploadError("WeatherForecasts")
        },
    })
    const [Get_WeatherForecast] = useLazyQuery(GET_WEATHERFORECAST,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'WeatherForecast') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('WeatherForecasts_noUpdatedRecord!')
                                addSuccessResult('WeatherForecasts','sync')
                                setStorageItem('WeatherForecasts','success','100','sync')
                            }})
                        .catch((err) => { 
                            console.log("read record Error:",table.name)
                            setStorageItem('WeatherForecasts','error','0','sync')
                            setUploadError("WeatherForecasts")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('WeatherForecasts','error','0','sync')
            setUploadError("WeatherForecasts")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await Get_WeatherForecast({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneWeatherForecast
                    const updateData = {
                        cloudCover: record.cloudCover,
                        created: record.created,
                        day: record.day,
                        geoLocation: record.geoLocation,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        lat: record.lat,
                        logBookEntryID: record.logBookEntryID,
                        long: record.long,
                        precipitation: record.precipitation,
                        swell: record.swell,
                        time: record.time,
                        visibility: record.visibility,
                        windDirection: record.windDirection,
                        windSpeed: record.windSpeed,
                    }
                    const createData = {
                        cloudCover: record.cloudCover,
                        comment: record.comment,
                        day: record.day,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        lat: record.lat,
                        logBookEntryID: record.logBookEntryID,
                        long: record.long,
                        precipitation: record.precipitation,
                        swell: record.swell,
                        time: record.time,
                        visibility: record.visibility,
                        windDirection: record.windDirection,
                        windSpeed: record.windSpeed,
                    }
                    if(checkResult) {
                        UpdateWeatherForecast({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateWeatherForecast({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("WeatherForecasts")
                })
            })
        )
        setStorageItem('WeatherForecasts','success','100','sync')
        addSuccessResult('WeatherForecasts','sync')
    }
    useEffect(() => {
        setStorageItem('WeatherForecasts','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncWeatherForecasts
