import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import { CreateCustomisedLogBookConfig, UPDATE_CUSTOMISED_LOGBOOK_CONFIG } from '@/app/lib/graphQL/mutation'
import CustomisedLogBookConfigModel from '../../models/customisedLogBookConfig'
import { GET_CUSTOMISEDLOGBOOKCONFIG_BY_ID } from '@/app/lib/graphQL/query/offline/GET_CUSTOMISEDLOGBOOKCONFIG_BY_ID'

// REMEMBER: The indexedDB is the source of truth
const SyncCustomisedLogBookConfigs : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new CustomisedLogBookConfigModel()
    const [createCustomisedLogBookConfig] = useMutation(CreateCustomisedLogBookConfig, {
        onCompleted: (response) => {
            const data = response.createCustomisedLogBookConfig
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('CustomisedLogBookConfigs','error','','sync')
            setUploadError("CustomisedLogBookConfigs")
        },
    })
    const [UpdateCustomisedLogBookConfig] = useMutation(UPDATE_CUSTOMISED_LOGBOOK_CONFIG, {
        onCompleted: (response) => {
            const data = response.updateCustomisedLogBookConfig
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('CustomisedLogBookConfigs','error','','sync')
            setUploadError("CustomisedLogBookConfigs")
        },
    })
    const [GetCustomisedLogBookConfigById] = useLazyQuery(GET_CUSTOMISEDLOGBOOKCONFIG_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'CustomisedLogBookConfig') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                addSuccessResult('CustomisedLogBookConfigs','sync')
                                setStorageItem('CustomisedLogBookConfigs','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('CustomisedLogBookConfigs','error','','sync')
                            setUploadError("CustomisedLogBookConfigs")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('CustomisedLogBookConfigs','error','','sync')
            setUploadError("CustomisedLogBookConfigs")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetCustomisedLogBookConfigById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneCustomisedLogBookConfig
                    const customisedLogBookComponents =  record.customisedLogBookComponents.nodes && record.customisedLogBookComponents.nodes.map((node: any) => node.id);
                    const policies =  record.policies.nodes.length > 0 && record.policies.nodes.map((node: any) => node.id);
                    const updateData = {
                        className: record.className,
                        clientID: record.clientID,
                        created: record.created,
                        customisedComponentCategories: record.customisedComponentCategories,
                        customisedLogBookComponents: customisedLogBookComponents ? customisedLogBookComponents.join(',') : null,
                        customisedLogBookID: record.customisedLogBookID,
                        fileTracking: record.fileTracking,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        policies: policies ? policies.join(',') : null,
                        signOffFuelIndicator: record.signOffFuelIndicator,
                        signOffReminder: record.signOffReminder,
                        startComponentID: record.startComponentID,
                        title: record.title,
                    }
                    const createData = {
                        className: record.className,
                        clientID: record.clientID,
                        created: record.created,
                        customisedComponentCategories: record.customisedComponentCategories,
                        customisedLogBookComponents: customisedLogBookComponents.join(','),
                        customisedLogBookID: record.customisedLogBookID,
                        fileTracking: record.fileTracking,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        policies: policies.join(','),
                        signOffFuelIndicator: record.signOffFuelIndicator,
                        signOffReminder: record.signOffReminder,
                        startComponentID: record.startComponentID,
                        title: record.title,
                    }
                    if(checkResult) {
                        UpdateCustomisedLogBookConfig({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        createCustomisedLogBookConfig({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("CustomisedLogBookConfigs")
                })
            })
        )
        setStorageItem('CustomisedLogBookConfigs','success','100','sync')
        addSuccessResult('CustomisedLogBookConfigs','sync')
    }
    useEffect(() => {
        setStorageItem('CustomisedLogBookConfigs','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncCustomisedLogBookConfigs
