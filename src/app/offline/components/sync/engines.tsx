import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import { CREATE_ENGINE, UPDATE_ENGINE } from '@/app/lib/graphQL/mutation'
import EngineModel from '../../models/engine'
import { GET_ENGIN_BY_ID } from '@/app/lib/graphQL/query/offline/GET_ENGIN_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncEngines : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new EngineModel()
    const [CreateEngine] = useMutation(CREATE_ENGINE, {
        onCompleted: (response) => {
            const data = response.createEngine
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('Engines','error','','sync')
            setUploadError("Engines")
        },
    })
    const [UpdateEngine] = useMutation(UPDATE_ENGINE, {
        onCompleted: (response) => {
            const data = response.updateEngine
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('Engines','error','','sync')
            setUploadError("Engines")
        },
    })
    const [Get_EnginById] = useLazyQuery(GET_ENGIN_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'Engine') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('Engines_NoupdatedRecord!')
                                addSuccessResult('Engines','sync')
                                setStorageItem('Engines','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('Engines','error','','sync')
                            setUploadError("Engines")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('Engines','error','','sync')
            setUploadError("Engines")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await Get_EnginById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneEngine
                    const updateData = {
                        clientID: record.clientID,
                        currentHours: record.currentHours,
                        driveType: record.driveType,
                        id: record.id,
                        identifier: record.identifier,
                        isPrimary: record.isPrimary,
                        kVA: record.kVA,
                        kW: record.kW,
                        make: record.make,
                        maxPower: record.maxPower,
                        title: record.title,
                        type: record.type,
                    }
                    const createData = {
                        clientID: record.clientID,
                        componentCategory: record.componentCategory,
                        currentHours: record.currentHours,
                        driveType: record.driveType,
                        id: record.id,
                        identifier: record.identifier,
                        isPrimary: record.isPrimary,
                        kVA: record.kVA,
                        kW: record.kW,
                        make: record.make,
                        maxPower: record.maxPower,
                        model: record.model,
                        title: record.title,
                        type: record.type,
                    }
                    if(checkResult) {
                        UpdateEngine({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateEngine({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("Engines")
                })
            })
        )
        setStorageItem('Engines','success','100','sync')
        addSuccessResult('Engines','sync')
    }
    useEffect(() => {
        setStorageItem('Engines','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncEngines
