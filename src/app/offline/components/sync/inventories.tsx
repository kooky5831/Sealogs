import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import {CREATE_INVENTORY, UPDATE_INVENTORY } from '@/app/lib/graphQL/mutation'
import InventoryModel from '../../models/inventory'
import { GET_INVENTORY_BY_ID } from '@/app/lib/graphQL/query'
// REMEMBER: The indexedDB is the source of truth

const SyncInventories : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new InventoryModel()
    const [CreateInventory] = useMutation(CREATE_INVENTORY, {
        onCompleted: (response) => {
            const data = response.createInventory
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('Inventories','error','','sync')
            setUploadError("Inventories")
        },
    })
    const [UpdateInventory] = useMutation(UPDATE_INVENTORY, {
        onCompleted: (response) => {
            const data = response.updateInventory
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('Inventories','error','','sync')
            setUploadError("Inventories")
        },
    })
    const [GetOneInventory] = useLazyQuery(GET_INVENTORY_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'Inventory') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('Inventories_NoupdatedRecord!')
                                addSuccessResult('Inventories','sync')
                                setStorageItem('Inventories','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('Inventories','error','','sync')
                            setUploadError("Inventories")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('Inventories','error','','sync')
            setUploadError("Inventories")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetOneInventory({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneInventory
                    const suppliers = record.suppliers.nodes.length > 0 && record.suppliers.nodes.map((node:any)=>node.id)
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
                        suppliers: record.suppliers.nodes.length > 0 ? suppliers.join(',') : null,
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
                        suppliers: record.suppliers.nodes.length > 0 ? suppliers.join(',') : null,
                        title: record.title,
                        vesselID: record.vesselID,
                    }
                    if(checkResult) {
                        UpdateInventory({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateInventory({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("Inventories")
                })
            })
        )
        setStorageItem('Inventories','success','100','sync')
        addSuccessResult('Inventories','sync')
    }
    useEffect(() => {
        setStorageItem('Inventories','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncInventories
