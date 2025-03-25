import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import WeatherTideModel from '../../models/weatherTide'
import { GET_WEATHERTIDES_BY_ID } from '@/app/lib/graphQL/query/offline/GET_WEATHERTIDES_BY_ID'
import { CREATE_WEATHERTIDE } from '@/app/lib/graphQL/mutation/offline/CREATE_WEATHERTIDE'
import { UPDATE_WEATHERTIDE } from '@/app/lib/graphQL/mutation/offline/UPDATE_WEATHERTIDE'
// REMEMBER: The indexedDB is the source of truth

const SyncWeatherTides : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new WeatherTideModel()
    const [CreateWeatherTide] = useMutation(CREATE_WEATHERTIDE, {
        onCompleted: (response) => {
            const data = response.createWeatherTide
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('WeatherTides','error','','sync')
            setUploadError("WeatherTides")
        },
    })
    const [UpdateWeatherTide] = useMutation(UPDATE_WEATHERTIDE, {
        onCompleted: (response) => {
            const data = response.updateWeatherTide
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('WeatherTides','error','','sync')
            setUploadError("WeatherTides")
        },
    })
    const [Get_WeatherTiedsById] = useLazyQuery(GET_WEATHERTIDES_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'WeatherTide') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('WeatherTides_NoupdatedRecord!')
                                addSuccessResult('WeatherTides','sync')
                                setStorageItem('WeatherTides','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('WeatherTides','error','','sync')
                            setUploadError("WeatherTides")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('WeatherTides','error','','sync')
            setUploadError("WeatherTides")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await Get_WeatherTiedsById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneWeatherTide
                    const updateData = {
                        comment: record.comment,
                        firstHighTideHeight: record.firstHighTideHeight,
                        firstHighTideTime: record.firstHighTideTime,
                        firstLowTideHeight: record.firstLowTideHeight,
                        firstLowTideTime: record.firstLowTideTime,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        lat: record.lat,
                        logBookEntryID: record.logBookEntryID,
                        long: record.long,
                        secondHighTideHeight: record.secondHighTideHeight,
                        secondHighTideTime: record.secondHighTideTime,
                        secondLowTideHeight: record.secondLowTideHeight,
                        secondLowTideTime: record.secondLowTideTime,
                        tidalStation: record.tidalStation,
                        tidalStationDistance: record.tidalStationDistance,
                        tideDate: record.tideDate,
                    }
                    const createData = {
                        comment: record.comment,
                        firstHighTideHeight: record.firstHighTideHeight,
                        firstHighTideTime: record.firstHighTideTime,
                        firstLowTideHeight: record.firstLowTideHeight,
                        firstLowTideTime: record.firstLowTideTime,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        lat: record.lat,
                        logBookEntryID: record.logBookEntryID,
                        long: record.long,
                        secondHighTideHeight: record.secondHighTideHeight,
                        secondHighTideTime: record.secondHighTideTime,
                        secondLowTideHeight: record.secondLowTideHeight,
                        secondLowTideTime: record.secondLowTideTime,
                        tidalStation: record.tidalStation,
                        tidalStationDistance: record.tidalStationDistance,
                        tideDate: record.tideDate,
                    }
                    if(checkResult) {
                        UpdateWeatherTide({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateWeatherTide({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("WeatherTides")
                })
            })
        )
        setStorageItem('WeatherTides','success','100','sync')
        addSuccessResult('WeatherTides','sync')
    }
    useEffect(() => {
        setStorageItem('WeatherTides','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncWeatherTides
