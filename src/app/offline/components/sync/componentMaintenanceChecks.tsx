import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import { CREATE_COMPONENT_MAINTENANCE_CHECK, UPDATE_COMPONENT_MAINTENANCE_CHECK } from '@/app/lib/graphQL/mutation'
import ComponentMaintenanceCheckModel from '../../models/componentMaintenanceCheck'
import { GET_COMPONENTMAINTENANCECHECK_BY_ID } from '@/app/lib/graphQL/query/offline/GET_COMPONENTMAINTENANCECHECK_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncComponentMaintenanceChecks : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new ComponentMaintenanceCheckModel()
    const [CreateComponentMaintenanceCheck] = useMutation(CREATE_COMPONENT_MAINTENANCE_CHECK, {
        onCompleted: (response) => {
            const data = response.createComponentMaintenanceCheck
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('ComponentMaintenanceChecks','error','','sync')
            setUploadError("ComponentMaintenanceChecks")
        },
    })
    const [UpdateComponentMaintenanceCheck] = useMutation(UPDATE_COMPONENT_MAINTENANCE_CHECK, {
        onCompleted: (response) => {
            const data = response.updateComponentMaintenanceCheck
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('ComponentMaintenanceChecks','error','','sync')
            setUploadError("ComponentMaintenanceChecks")
        },
    })
    const [GetComponentMaintenanceCheckById] = useLazyQuery(GET_COMPONENTMAINTENANCECHECK_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'ComponentMaintenanceCheck') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('ComponentMaintenanceChecks_noUpdatedRecord!')
                                addSuccessResult('ComponentMaintenanceChecks','sync')
                                setStorageItem('ComponentMaintenanceChecks','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:", table.name)
                            setStorageItem('ComponentMaintenanceChecks','error','','sync')
                            setUploadError("ComponentMaintenanceChecks")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('ComponentMaintenanceChecks','error','','sync')
            setUploadError("ComponentMaintenanceChecks")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetComponentMaintenanceCheckById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneComponentMaintenanceCheck
                    const documents = record.documents.nodes.length > 0 && record.documents.nodes.map((node: any) => node.id)
                    const assignees = record.assignees.nodes.length > 0 && record.assignees.nodes.map((node: any) => node.id)
                    const updateData = {
                        actual: record.actual,
                        archived: record.archived,
                        assignedByID: record.assignedByID,
                        assignedToID: record.assignedToID,
                        assignees: record.assignees.nodes.length > 0 ? assignees.join(',') : null,
                        attachmentLinks: record.attachmentLinks,
                        basicComponentID: record.basicComponentID,
                        className: record.className,
                        clientID: record.clientID,
                        comments: record.comments,
                        completed: record.completed,
                        completedByID: record.completedByID,
                        created: record.created,
                        dateCompleted: record.dateCompleted,
                        difference: record.difference,
                        documents: record.documents.nodes.length > 0 ? documents.join(',') : null,
                        dutyHoursAtCheck: record.dutyHoursAtCheck,
                        equipmentUsagesAtCheck: record.equipmentUsagesAtCheck,
                        expires: record.expires,
                        fileTracking: record.fileTracking,
                        groupItemTo: record.groupItemTo,
                        id: record.id,
                        inventoryID: record.inventoryID,
                        lastEdited: record.lastEdited,
                        maintenanceCategoryID: record.maintenanceCategoryID,
                        maintenanceCheckSubTasks: record.maintenanceCheckSubTasks,
                        maintenanceCheck_SignatureID: record.maintenanceCheck_SignatureID,
                        maintenanceScheduleID: record.maintenanceScheduleID,
                        name: record.name,
                        projected: record.projected,
                        records: record.records,
                        recurringID: record.recurringID,
                        severity: record.severity,
                        startDate: record.startDate,
                        status: record.status,
                        workOrderNumber: record.workOrderNumber,
                    }
                    const createData = {
                        actual: record.actual,
                        archived: record.archived,
                        assignedByID: record.assignedByID,
                        assignedToID: record.assignedToID,
                        assignees: record.assignees.nodes.length > 0 ? assignees.join(',') : null,
                        attachmentLinks: record.attachmentLinks,
                        basicComponentID: record.basicComponentID,
                        className: record.className,
                        clientID: record.clientID,
                        comments: record.comments,
                        completed: record.completed,
                        completedByID: record.completedByID,
                        created: record.created,
                        dateCompleted: record.dateCompleted,
                        difference: record.difference,
                        documents: record.documents.nodes.length > 0 ? documents.join(',') : null,
                        dutyHoursAtCheck: record.dutyHoursAtCheck,
                        equipmentUsagesAtCheck: record.equipmentUsagesAtCheck,
                        expires: record.expires,
                        fileTracking: record.fileTracking,
                        groupItemTo: record.groupItemTo,
                        id: record.id,
                        inventoryID: record.inventoryID,
                        lastEdited: record.lastEdited,
                        maintenanceCategoryID: record.maintenanceCategoryID,
                        maintenanceCheckSubTasks: record.maintenanceCheckSubTasks,
                        maintenanceCheck_SignatureID: record.maintenanceCheck_SignatureID,
                        maintenanceScheduleID: record.maintenanceScheduleID,
                        name: record.name,
                        projected: record.projected,
                        records: record.records,
                        recurringID: record.recurringID,
                        severity: record.severity,
                        startDate: record.startDate,
                        status: record.status,
                        workOrderNumber: record.workOrderNumber,
                    }
                    if(checkResult) {
                        UpdateComponentMaintenanceCheck({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateComponentMaintenanceCheck({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('ComponentMaintenanceChecks:', err)
                    setUploadError("CrewDuties")
                })
            })
        )
        setStorageItem('ComponentMaintenanceChecks','success','100','sync')
        addSuccessResult('ComponentMaintenanceChecks','sync')
    }
    useEffect(() => {
        setStorageItem('ComponentMaintenanceChecks','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncComponentMaintenanceChecks
