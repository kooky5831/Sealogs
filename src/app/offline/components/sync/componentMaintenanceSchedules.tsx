import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import ComponentMaintenanceScheduleModel from '../../models/componentMaintenanceSchedule'
import { CREATE_COMPONENT_MAINTENANCE_SCHEDULE, UPDATE_COMPONENT_MAINTENANCE_SCHEDULE } from '@/app/lib/graphQL/mutation'
import { GET_COMPONENTMAINTENANCESCHEDULE_BY_ID } from '@/app/lib/graphQL/query/offline/GET_COMPONENTMAINTENANCESCHEDULE_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncComponentMaintenanceSchedules : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new ComponentMaintenanceScheduleModel()
    const [CreateComponentMaintenanceSchedule] = useMutation(CREATE_COMPONENT_MAINTENANCE_SCHEDULE, {
        onCompleted: (response) => {
            const data = response.createComponentMaintenanceSchedule
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('ComponentMaintenanceSchedules','error','','sync')
            setUploadError("ComponentMaintenanceSchedules")
        },
    })
    const [UpdateComponentMaintenanceSchedule] = useMutation(UPDATE_COMPONENT_MAINTENANCE_SCHEDULE, {
        onCompleted: (response) => {
            const data = response.updateComponentMaintenanceSchedule
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('ComponentMaintenanceSchedules','error','','sync')
            setUploadError("ComponentMaintenanceSchedules")
        },
    })
    const [Get_ComponenMaintenanceScheduleById] = useLazyQuery(GET_COMPONENTMAINTENANCESCHEDULE_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'ComponentMaintenanceSchedule') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('ComponentMaintenanceSchedules_NoupdatedRecord!')
                                addSuccessResult('ComponentMaintenanceSchedules','sync')
                                setStorageItem('ComponentMaintenanceSchedules','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:", table.name)
                            setStorageItem('ComponentMaintenanceSchedules','error','','sync')
                            setUploadError("ComponentMaintenanceSchedules")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('ComponentMaintenanceSchedules','error','','sync')
            setUploadError("ComponentMaintenanceSchedules")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await Get_ComponenMaintenanceScheduleById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneComponentMaintenanceSchedule
                    const maintenanceChecks = record.maintenanceChecks.nodes.length > 0 && record.maintenanceChecks.nodes.map((node:any) => node.id)
                    const engineUsage = record.engineUsage.nodes.length > 0 && record.engineUsage.nodes.map((node:any) => node.id)
                    const updateData = {
                        archived: record.archived,
                        className: record.className,
                        clientID: record.clientID,
                        description: record.description,
                        engineUsage: record.engineUsage.nodes.length > 0 ? engineUsage.join(',') : null,
                        groupTo: record.groupTo,
                        highWarnWithin: record.highWarnWithin,
                        id: record.id,
                        inventoryID: record.inventoryID,
                        lowWarnWithin: record.lowWarnWithin,
                        maintenanceChecks: record.maintenanceChecks.nodes.length > 0 ? maintenanceChecks.join(',') : null,
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
                        engineUsage: record.engineUsage.nodes.length > 0 ? engineUsage.join(',') : null,
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
                        UpdateComponentMaintenanceSchedule({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateComponentMaintenanceSchedule({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("ComponentMaintenanceSchedules")
                })
            })
        )
        setStorageItem('ComponentMaintenanceSchedules','success','100','sync')
        addSuccessResult('ComponentMaintenanceSchedules','sync')
    }
    useEffect(() => {
        setStorageItem('ComponentMaintenanceSchedules','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncComponentMaintenanceSchedules
