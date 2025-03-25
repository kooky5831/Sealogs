import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import { CREATE_CUSTOMISED_COMPONENT_FIELD, UPDATE_CUSTOMISED_COMPONENT_FIELD} from '@/app/lib/graphQL/mutation'
import CustomisedComponentFieldModel from '../../models/customisedComponentField'
import { GET_CUSTOMISEDCOMPONENTFIELD } from '@/app/lib/graphQL/query/offline/GET_CUSTOMISEDCOMPONENTFIELD'

// REMEMBER: The indexedDB is the source of truth
// customisedComponentField
const SyncCustomisedComponentFields : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new CustomisedComponentFieldModel()
    const [CreateCustomisedComponentField] = useMutation(CREATE_CUSTOMISED_COMPONENT_FIELD, {
        onCompleted: (response) => {
            const data = response.createCustomisedComponentField
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setUploadError("CustomisedComponentFields")
            setStorageItem('CustomisedComponentFields','error','','sync')
        },
    })
    const [UpdateCustomisedComponentField] = useMutation(UPDATE_CUSTOMISED_COMPONENT_FIELD, {
        onCompleted: (response) => {
            const data = response.updateCustomisedComponentField
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('CustomisedComponentFields','error','','sync')
            setUploadError("CustomisedComponentFields")
        },
    })
    const [GetCustomisedComponentField] = useLazyQuery(GET_CUSTOMISEDCOMPONENTFIELD,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'CustomisedComponentField') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('CustomisedComponentFields_NoupdatedRecord!')
                                addSuccessResult('CustomisedComponentFields','sync')
                                setStorageItem('CustomisedComponentFields','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('CustomisedComponentFields','error','','sync')
                            setUploadError("CustomisedComponentFields")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('CustomisedComponentFields','error','','sync')
            setUploadError("CustomisedComponentFields")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetCustomisedComponentField({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneCustomisedComponentField
                    const updateData = {
                        basicComponentID: record.basicComponentID,
                        clientID: record.clientID,
                        created: record.created,
                        customisedEngineTypes: record.customisedEngineTypes,
                        customisedFieldTitle: record.customisedFieldTitle,
                        customisedFieldType: record.customisedFieldType,
                        customisedLogBookComponentID: record.customisedLogBookComponentID,
                        description: record.description,
                        fieldName: record.fieldName,
                        id: record.id,
                        isUserDefined: record.isUserDefined,
                        options: record.options,
                        parentFieldID: record.parentFieldID,
                        sortOrder: record.sortOrder,
                        status: record.status,
                        userDefinedFields: record.userDefinedFields,
                    }
                    const createData = {
                        basicComponentID: record.basicComponentID,
                        clientID: record.clientID,
                        customisedEngineTypes: record.customisedEngineTypes,
                        customisedFieldTitle: record.customisedFieldTitle,
                        customisedFieldType: record.customisedFieldType,
                        customisedLogBookComponentID: record.customisedLogBookComponentID,
                        description: record.description,
                        fieldName: record.fieldName,
                        id: record.id,
                        isUserDefined: record.isUserDefined,
                        options: record.options,
                        parentFieldID: record.parentFieldID,
                        sortOrder: record.sortOrder,
                        status: record.status,
                        userDefinedFields: record.userDefinedFields,
                    }
                    if(checkResult) {
                        UpdateCustomisedComponentField({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateCustomisedComponentField({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("CustomisedComponentFields")
                })
            })
        )
        addSuccessResult('CustomisedComponentFields','sync')
        setStorageItem('CustomisedComponentFields','success','100','sync')
    }
    useEffect(() => {
        setStorageItem('CustomisedComponentFields','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncCustomisedComponentFields
