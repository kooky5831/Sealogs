import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import MaintenanceCheckModel from '../../models/maintenanceCheck'
import { CREATE_MAINTENANCECHECK } from '@/app/lib/graphQL/mutation/offline/CREATE_MAINTENANCECHECK'
import { UPDATE_MAINTENANCECHECK } from '@/app/lib/graphQL/mutation/offline/UPDATE_MAINTENANCECHECK'
import { GET_MAINTENANCECHCEK_BY_ID } from '@/app/lib/graphQL/query/offline/GET_MAINTENANCECHCEK_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncMaintenanceChecks : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new MaintenanceCheckModel()
    const [CreateMaintenanceCheck] = useMutation(CREATE_MAINTENANCECHECK, {
        onCompleted: (response) => {
            const data = response.createMaintenanceCheck
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('MaintenanceChecks','error','','sync')
            setUploadError("MaintenanceChecks")
        },
    })
    const [UpdateMaintenanceCheck] = useMutation(UPDATE_MAINTENANCECHECK, {
        onCompleted: (response) => {
            const data = response.updateMaintenanceCheck
            if(typeof window !== 'undefined'){
                model.setProperty(data.id && data);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('MaintenanceChecks','error','','sync')
            setUploadError("MaintenanceChecks")
        },
    })
    const [GetMaintenanceCheckById] = useLazyQuery(GET_MAINTENANCECHCEK_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'MaintenanceCheck') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('MaintenanceChecks_NoupdatedRecord!')
                                addSuccessResult('MaintenanceChecks','sync')
                                setStorageItem('MaintenanceChecks','success','100','sync')  
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('MaintenanceChecks','error','','sync')
                            setUploadError("MaintenanceChecks")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('MaintenanceChecks','error','','sync')
            setUploadError("MaintenanceChecks")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetMaintenanceCheckById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneMaintenanceCheck
                    const updateData = {
                        archived: record.archived,
                        attachmentLinks: record.attachmentLinks,
                        clientID: record.clientID,
                        dutyHoursAtCheck: record.dutyHoursAtCheck,
                        equipmentUsagesAtCheck: record.equipmentUsagesAtCheck,
                        id: record.id,
                        maintenanceCheck_SignatureID: record.maintenanceCheck_SignatureID,
                        maintenanceScheduleID: record.maintenanceScheduleID,
                        name: record.name,
                        status: record.status,
                    }
                    const createData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        completed: record.completed,
                        dutyHoursAtCheck: record.dutyHoursAtCheck,
                        equipmentUsagesAtCheck: record.equipmentUsagesAtCheck,
                        expires: record.expires,
                        id: record.id,
                        maintenanceCheck_SignatureID: record.maintenanceCheck_SignatureID,
                        maintenanceScheduleID: record.maintenanceScheduleID,
                        name: record.name,
                        severity: record.severity,
                        startDate: record.startDate,
                        status: record.status,
                    }
                    if(checkResult) {
                        UpdateMaintenanceCheck({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateMaintenanceCheck({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("MaintenanceChecks")
                })
            })
        )
        setStorageItem('MaintenanceChecks','success','100','sync')
        addSuccessResult('MaintenanceChecks','sync')
    }
    useEffect(() => {
        setStorageItem('MaintenanceChecks','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncMaintenanceChecks
