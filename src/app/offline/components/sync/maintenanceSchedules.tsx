import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import MaintenanceScheduleModel from '../../models/maintenanceSchedule'
import { GET_MAINTENANCESCHEDULE_BY_ID } from '@/app/lib/graphQL/query/offline/GET_MAINTENANCESCHEDULE_BY_ID'
import { CREATE_MAINTENANCESCHEDULE } from '@/app/lib/graphQL/mutation/offline/CREATE_MAINTENANCESCHEDULE'
import { UPDATE_MAINTENANCESCHEDULE } from '@/app/lib/graphQL/mutation/offline/UPDATE_MAINTENANCESCHEDULE'
// REMEMBER: The indexedDB is the source of truth

const SyncMaintenanceSchedules : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new MaintenanceScheduleModel()
    const [CreateMaintenanceSchedule] = useMutation(CREATE_MAINTENANCESCHEDULE, {
        onCompleted: (response) => {
            const data = response.createMaintenanceSchedule
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('MaintenanceSchedules','error','','sync')
            setUploadError("MaintenanceSchedules")
        },
    })
    const [UpdateMaintenanceSchedule] = useMutation(UPDATE_MAINTENANCESCHEDULE, {
        onCompleted: (response) => {
            const data = response.updateMaintenanceSchedule
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('MaintenanceSchedules','error','','sync')
            setUploadError("MaintenanceSchedules")
        },
    })
    const [Get_MaintenanceScheduleById] = useLazyQuery(GET_MAINTENANCESCHEDULE_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'MaintenanceSchedule') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('MaintenanceSchedules_NoupdatedRecord!')
                                addSuccessResult('MaintenanceSchedules','sync')
                                setStorageItem('MaintenanceSchedules','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('MaintenanceSchedules','error','','sync')
                            setUploadError("MaintenanceSchedules")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('MaintenanceSchedules','error','','sync')
            setUploadError("MaintenanceSchedules")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await Get_MaintenanceScheduleById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneMaintenanceSchedule
                    const updateData = {
                        archived: record.archived,
                        className: record.className,
                        clientID: record.clientID,
                        description: record.description,
                        engineUsage: record.engineUsage,
                        groupTo: record.groupTo,
                        highWarnWithin: record.highWarnWithin,
                        id: record.id,
                        inventoryID: record.inventoryID,
                        lowWarnWithin: record.lowWarnWithin,
                        maintenanceChecks: record.maintenanceChecks,
                        mediumWarnWithin: record.mediumWarnWithin,
                        occursEvery: record.occursEvery,
                        occursEveryType: record.occursEveryType,
                        proRata: record.proRata,
                        title: record.title,
                        type: record.type,
                        warnWithinType: record.warnWithinType,
                    }
                    const createData = {
                        archived: record.archived,
                        attachments: record.attachments,
                        clientID: record.clientID,
                        engineUsage: record.engineUsage,
                        groupTo: record.groupTo,
                        highWarnWithin: record.highWarnWithin,
                        id: record.id,
                        inventoryID: record.inventoryID,
                        lowWarnWithin: record.lowWarnWithin,
                        mediumWarnWithin: record.mediumWarnWithin,
                        occursEvery: record.occursEvery,
                        occursEveryType: record.occursEveryType,
                        proRata: record.proRata,
                        title: record.title,
                        type: record.type,
                        warnWithinType: record.warnWithinType,
                    }
                    if(checkResult) {
                        UpdateMaintenanceSchedule({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateMaintenanceSchedule({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("MaintenanceSchedules")
                })
            })
        )
        setStorageItem('MaintenanceSchedules','success','100','sync')
        addSuccessResult('MaintenanceSchedules','sync')
    }
    useEffect(() => {
        setStorageItem('MaintenanceSchedules','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncMaintenanceSchedules
