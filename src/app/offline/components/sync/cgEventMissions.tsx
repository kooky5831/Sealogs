import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import CGEventMissionModel from '../../models/cgEventMission'
import { GET_CGEVENTMISSION_BY_ID } from '@/app/lib/graphQL/query/GET_CGEVENTMISSION_BY_ID'
import { CREATE_CGEVENTMISSION } from '@/app/lib/graphQL/mutation/offline/CREATE_CGEVENTMISSION'
import { UPDATE_CGEVENTMISSION } from '@/app/lib/graphQL/mutation/offline/UPDATE_CGEVENTMISSION'
// REMEMBER: The indexedDB is the source of truth

const SyncCGEventMissions : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new CGEventMissionModel()
    const [CreateCGEventMission] = useMutation(CREATE_CGEVENTMISSION, {
        onCompleted: (response) => {
            const data = response.createCGEventMission
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('CGEventMissions','error','','sync')
            setUploadError("CGEventMissions")
        },
    })
    const [UpdateCGEventMission] = useMutation(UPDATE_CGEVENTMISSION, {
        onCompleted: (response) => {
            const data = response.updateCGEventMission
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('CGEventMissions','error','','sync')
            setUploadError("CGEventMissions")
        },
    })
    const [GetCGEventMission] = useLazyQuery(GET_CGEVENTMISSION_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'CGEventMission') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('CGEventMissions_NoupdatedRecord!')
                                addSuccessResult('CGEventMissions','sync')
                                setStorageItem('CGEventMissions','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:", table.name)
                            setStorageItem('CGEventMissions','error','','sync')
                            setUploadError("CGEventMissions")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('CGEventMissions','error','','sync')
            setUploadError("CGEventMissions")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetCGEventMission({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneCGEventMission
                    const updateData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        comments: record.comments,
                        componentCategory: record.componentCategory,
                        content: record.content,
                        costingDetails: record.costingDetails,
                        description: record.description,
                        formID: record.formID,
                        formLabel: record.formLabel,
                        formType: record.formType,
                        id: record.id,
                        identifier: record.identifier,
                        inventoryImportID: record.inventoryImportID,
                        item: record.item,
                        location: record.location,
                        productCode: record.productCode,
                        quantity: record.quantity,
                        showForm: record.showForm,
                        suppliers: record.suppliers,
                        title: record.title,
                        vesselID: record.vesselID,
                    }
                    const createData = {
                        archived: record.archived,
                        categories: record.categories,
                        clientID: record.clientID,
                        comments: record.comments,
                        content: record.content,
                        created: record.created,
                        description: record.description,
                        formID: record.formID,
                        formLabel: record.formLabel,
                        formType: record.formType,
                        id: record.id,
                        identifier: record.identifier,
                        inventoryImportID: record.inventoryImportID,
                        item: record.item,
                        location: record.location,
                        parentComponent_Components: record.parentComponent_Components,
                        productCode: record.productCode,
                        quantity: record.quantity,
                        showForm: record.showForm,
                        suppliers: record.suppliers,
                        title: record.title,
                        vesselID: record.vesselID,
                    }
                    if(checkResult) {
                        UpdateCGEventMission({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateCGEventMission({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("CGEventMissions")
                })
            })
        )
        setStorageItem('CGEventMissions','success','100','sync')
        addSuccessResult('CGEventMissions','sync')
    }
    useEffect(() => {
        setStorageItem('CGEventMissions','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncCGEventMissions
