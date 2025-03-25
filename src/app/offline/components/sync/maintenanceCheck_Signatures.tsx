import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import MaintenanceCheck_SignatureModel from '../../models/maintenanceCheck_Signature'
import { CREATE_MAINTENANCE_CHECK_SIGNATUERS } from '@/app/lib/graphQL/mutation/offline/CREATE_MAINTENANCE_CHECK_SIGNATUERS'
import { UPDATE_MAINTENANCE_CHECK_SIGNATURES } from '@/app/lib/graphQL/mutation/offline/UPDATE_MAINTENANCE_CHECK_SIGNATURES'
import { GET_MAINTENANCE_CHECK_SIGNATURE } from '@/app/lib/graphQL/query/offline/GET_MAINTENANCE_CHECK_SIGNATURE'

// REMEMBER: The indexedDB is the source of truth
const SyncMaintenanceCheck_Signatures : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new MaintenanceCheck_SignatureModel()
    const [createMaintenanceCheck_Signature] = useMutation(CREATE_MAINTENANCE_CHECK_SIGNATUERS, {
        onCompleted: (response) => {
            const data = response.createMaintenanceCheck_Signature
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('MaintenanceCheck_Signatures','error','','sync')
            setUploadError("MaintenanceCheck_Signatures")
        },
    })
    const [updateMaintenanceCheck_Signature] = useMutation(UPDATE_MAINTENANCE_CHECK_SIGNATURES, {
        onCompleted: (response) => {
            const data = response.updateMaintenanceCheck_Signature
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('MaintenanceCheck_Signatures','error','','sync')
            setUploadError("MaintenanceCheck_Signatures")
        },
    })
    const [GetMaintenanceCheck_Signature] = useLazyQuery(GET_MAINTENANCE_CHECK_SIGNATURE,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'MaintenanceCheck_Signature') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('MaintenanceCheck_Signatures_NoupdatedRecord!')
                                addSuccessResult('MaintenanceCheck_Signatures','sync')
                                setStorageItem('MaintenanceCheck_Signatures','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('MaintenanceCheck_Signatures','error','','sync')
                            setUploadError("MaintenanceCheck_Signatures")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('MaintenanceCheck_Signatures','error','','sync')
            setUploadError("MaintenanceCheck_Signatures")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetMaintenanceCheck_Signature({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneMaintenanceCheck_Signature
                    const updateData = {
                        archived: record.archived,
                        id: record.id,
                        maintenanceCheckID: record.maintenanceCheckID,
                        signatureData: record.signatureData,
                        memberID: record.memberID,
                    }
                    const createData = {
                        archived: record.archived,
                        id: record.id,
                        maintenanceCheckID: record.maintenanaceCheckID,
                        signatureData: record.signatureData,
                        memberID: record.memberID,
                    }
                    if(checkResult) {
                        updateMaintenanceCheck_Signature({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        createMaintenanceCheck_Signature({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("MaintenanceCheck_Signatures")
                })
            })
        )
        setStorageItem('MaintenanceCheck_Signatures','success','100','sync')
        addSuccessResult('MaintenanceCheck_Signatures','sync')
    }
    useEffect(() => {
        setStorageItem('MaintenanceCheck_Signatures','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncMaintenanceCheck_Signatures
