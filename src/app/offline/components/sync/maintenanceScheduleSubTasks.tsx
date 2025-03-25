import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import MaintenanceScheduleSubTaskModel from '../../models/maintenanceScheduleSubTask'
import { CREATE_MAINTENANCESCHEDULESUBTASKS } from '@/app/lib/graphQL/mutation/offline/CREATE_MAINTENANCESCHEDULESUBTASKS'
import { UPDATE_MAINTENANCESCHEDULESUBTASKS } from '@/app/lib/graphQL/mutation/offline/UPDATE_MAINTENANCESCHEDULESUBTASKS'
import { GET_MAINTENANCE_SCHEDULESUBTASK } from '@/app/lib/graphQL/query/GET_MAINTENANCE_SCHEDULESUBTASK'
// REMEMBER: The indexedDB is the source of truth

const SyncMaintenanceScheduleSubTasks : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new MaintenanceScheduleSubTaskModel()
    const [createMaintenanceScheduleSubTask] = useMutation(CREATE_MAINTENANCESCHEDULESUBTASKS, {
        onCompleted: (response) => {
            const data = response.createMaintenanceScheduleSubTask
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('MaintenanceScheduleSubTasks','error','','sync')
            setUploadError("MaintenanceScheduleSubTasks")
        },
    })
    const [updateMaintenanceScheduleSubTask] = useMutation(UPDATE_MAINTENANCESCHEDULESUBTASKS, {
        onCompleted: (response) => {
            const data = response.updateMaintenanceScheduleSubTask
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('MaintenanceScheduleSubTasks','error','','sync')
            setUploadError("MaintenanceScheduleSubTasks")
        },
    })
    const [Get_MaintenanceScheduleSubTask] = useLazyQuery(GET_MAINTENANCE_SCHEDULESUBTASK,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'MaintenanceScheduleSubTask') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('MaintenanceScheduleSubTasks_NoupdatedRecord!')
                                addSuccessResult('MaintenanceScheduleSubTasks','sync')
                                setStorageItem('MaintenanceScheduleSubTasks','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('MaintenanceScheduleSubTasks','error','','sync')
                            setUploadError("MaintenanceScheduleSubTasks")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('MaintenanceScheduleSubTasks','error','','sync')
            setUploadError("MaintenanceScheduleSubTasks")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await Get_MaintenanceScheduleSubTask({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneMaintenanceScheduleSubTask
                    const updateData = {
                        componentMaintenanceScheduleID: record.componentMaintenanceScheduleID,
                        description: record.description,
                        id: record.id,
                        inventoryID: record.inventoryID,
                        task: record.task,
                    }
                    const createData = {
                        componentMaintenanceScheduleID: record.componentMaintenanceScheduleID,
                        description: record.description,
                        id: record.id,
                        inventoryID: record.inventoryID,
                        task: record.task
                    }
                    if(checkResult) {
                        updateMaintenanceScheduleSubTask({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        createMaintenanceScheduleSubTask({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("MaintenanceScheduleSubTasks")
                })
            })
        )
        setStorageItem('MaintenanceScheduleSubTasks','success','100','sync')
        addSuccessResult('MaintenanceScheduleSubTasks','sync')
    }
    useEffect(() => {
        setStorageItem('MaintenanceScheduleSubTasks','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncMaintenanceScheduleSubTasks
