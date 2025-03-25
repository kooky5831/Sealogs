import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import FuelTankModel from '../../models/fuelTank'
import { CREATE_FUELTANK, UPDATE_FUELTANK } from '@/app/lib/graphQL/mutation'
import { GET_FUELTANK_BY_ID } from '@/app/lib/graphQL/query/offline/GET_FUELTANK_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncFuelTanks : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new FuelTankModel()
    const [CreateFuelTank] = useMutation(CREATE_FUELTANK, {
        onCompleted: (response) => {
            const data = response.createFuelTank
            if(typeof window !== 'undefined'){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('FuelTanks','error','','sync')
            setUploadError("FuelTanks")
        },
    })
    const [UpdateFuelTank] = useMutation(UPDATE_FUELTANK, {
        onCompleted: (response) => {
            const data = response.updateFuelTank
            if(typeof window !== 'undefined'){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('FuelTanks','error','','sync')
            setUploadError("FuelTanks")
        },
    })
    const [Get_FuelTankById] = useLazyQuery(GET_FUELTANK_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'FuelTank') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('FuelTanks_NoupdatedRecord!')
                                addSuccessResult('FuelTanks','sync')
                                setStorageItem('FuelTanks','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error :", table.name)
                            setStorageItem('FuelTanks','error','','sync')
                            setUploadError("FuelTanks")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('FuelTanks','error','','sync')
            setUploadError("FuelTanks")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await Get_FuelTankById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneFuelTank
                    const updateData = {
                        archived: record.archived,
                        capacity: record.capacity,
                        clientID: record.clientID,
                        currentLevel: record.currentLevel,
                        dipImportID: record.dipImportID,
                        dipImportRun: record.dipImportRun,
                        dipType: record.dipType,
                        fuelTankFuelUsages: record.fuelTankFuelUsages,
                        fuelTankStartStops: record.fuelTankStartStops,
                        fuelType: record.fuelType,
                        id: record.id,
                        identifier: record.identifier,
                        safeFuelCapacity: record.safeFuelCapacity,
                        title: record.title,
                    }
                    const createData = {
                        archived: record.archived,
                        capacity: record.capacity,
                        clientID: record.clientID,
                        componentMaintenanceChecks: record.componentMaintenanceChecks,
                        currentLevel: record.currentLevel,
                        dipConversions: record.dipConversions,
                        dipImportID: record.dipImportID,
                        dipImportRun: record.dipImportRun,
                        dipType: record.dipType,
                        fuelTankStartStops: record.fuelTankStartStops,
                        fuelType: record.fuelType,
                        id: record.id,
                        identifier: record.identifier,
                        safeFuelCapacity: record.safeFuelCapacity,
                        title: record.title,
                    }
                    if(checkResult) {
                        UpdateFuelTank({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateFuelTank({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("FuelTanks")
                })
            })
        )
        setStorageItem('FuelTanks','success','100','sync')
        addSuccessResult('FuelTanks','sync')
    }
    useEffect(() => {
        setStorageItem('FuelTanks','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncFuelTanks
