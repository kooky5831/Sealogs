import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import { CREATE_FUELLOG,  UPDATE_FUELLOG } from '@/app/lib/graphQL/mutation'
import FuelLogModel from '../../models/fuelLog'
import { GET_FUELLOG_BY_ID } from '@/app/lib/graphQL/query/offline/GET_FUELLOG_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncFuelLog : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new FuelLogModel()
    const [CreateFuelLog] = useMutation(CREATE_FUELLOG, {
        onCompleted: (response) => {
            const data = response.createFuelLog
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('FuelLog','error','','sync')
            setUploadError("FuelLog")
        },
    })
    const [UpdateFuelLog] = useMutation(UPDATE_FUELLOG, {
        onCompleted: (response) => {
            const data = response.updateFuelLog
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('FuelLog','error','','sync')
            setUploadError("FuelLog")
        },
    })
    const [Get_FuelLogById] = useLazyQuery(GET_FUELLOG_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'FuelLog') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('FuelLog_NoupdatedRecord!')
                                addSuccessResult('FuelLog','sync')
                                setStorageItem('FuelLog','success','100','sync')            
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('FuelLog','error','','sync')
                            setUploadError("FuelLog")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('FuelLog','error','','sync')
            setUploadError("FuelLog")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                console.log('updatedRecord:', record)
                await Get_FuelLogById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneFuelLog
                    console.log('checkeResult:', checkResult)
                    const updateData = {
                        className: record.className,
                        created: record.created,
                        date: record.date,
                        eventType_PassengerDropFacilityID: record.eventType_PassengerDropFacilityID,
                        eventType_TaskingID: record.eventType_TaskingID,
                        fileTracking: record.fileTracking,
                        fuelAdded: record.fuelAdded,
                        fuelAfter: record.fuelAfter,
                        fuelBefore: record.fuelBefore,
                        fuelTankID: record.fuelTankID,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        logBookEntryID: record.logBookEntryID,
                        notes: record.notes,
                        refuellingBunkeringID: record.refuellingBunkeringID
                    }
                    const createData = {
                        eventType_PassengerDropFacilityID: record.eventType_PassengerDropFacilityID,
                        eventType_TaskingID: record.eventType_TaskingID,
                        fuelTankID: record.fuelTankID,
                        id: record.id,
                        logBookEntryID: record.logBookEntryID,
                        refuellingBunkeringID: record.refuellingBunkeringID,
                    }
                    if(checkResult) {
                        UpdateFuelLog({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateFuelLog({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("FuelLog")
                })
            })
        )
        setStorageItem('FuelLog','success','100','sync')
        addSuccessResult('FuelLog','sync')
    }
    useEffect(() => {
        setStorageItem('FuelLog','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncFuelLog
