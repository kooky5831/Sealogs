import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import VehiclePositionModel from '../../models/vehiclePosition'
import { CREATE_VESSEL_POSITION, UPDATE_VESSEL_POSITION } from '@/app/lib/graphQL/mutation'
import { GET_VEHICLEPOSITION_BY_ID } from '@/app/lib/graphQL/query/offline/GET_VEHICLEPOSITION_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncVehiclePositions : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new VehiclePositionModel()
    const [CreateVehiclePosition] = useMutation(CREATE_VESSEL_POSITION, {
        onCompleted: (response) => {
            const data = response.createVehiclePosition
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('VehiclePositions','error','','sync')
            setUploadError("VehiclePositions")
        },
    })
    const [UpdateVehiclePosition] = useMutation(UPDATE_VESSEL_POSITION, {
        onCompleted: (response) => {
            const data = response.updateVehiclePosition
            console.log('updateSuccess:',data)
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('VehiclePositions','error','','sync')
            setUploadError("VehiclePositions")
        },
    })
    const [GetVehiclePositionById] = useLazyQuery(GET_VEHICLEPOSITION_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'VehiclePosition') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('VehiclePositions!')
                                addSuccessResult('VehiclePositions','sync')
                                setStorageItem('VehiclePositions','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('VehiclePositions','error','','sync')
                            setUploadError("VehiclePositions")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('VehiclePositions','error','','sync')
            setUploadError("VehiclePositions")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetVehiclePositionById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneVehiclePosition
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
                        clientID: record.clientID,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        lat: record.lat,
                        long: record.long,
                        time: record.time,
                        vehicleID: record.vehicleID,
                    }
                    if(checkResult) {
                        UpdateVehiclePosition({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateVehiclePosition({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("VehiclePositions")
                })
            })
        )
        setStorageItem('VehiclePositions','success','100','sync')
        addSuccessResult('VehiclePositions','sync')
    }
    useEffect(() => {
        setStorageItem('VehiclePositions','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncVehiclePositions
