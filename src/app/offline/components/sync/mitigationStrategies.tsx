import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import MitigationStrategyModel from '../../models/mitigationStrategy'
import { GET_MITIGATIONSTRATEGIES_BY_ID } from '@/app/lib/graphQL/query/offline/GET_MITIGATIONSTRATEGIES_BY_ID'
import { CREATE_MITIGATIONSTRATEGY } from '@/app/lib/graphQL/mutation/offline/CREATE_MITIGATIONSTRATEGY'
import { UPDATE_MITIGATIONSTRATEGY } from '@/app/lib/graphQL/mutation/offline/UPDATE_MITIGATIONSTRATEGY'
// REMEMBER: The indexedDB is the source of truth

const SyncMitigationStrategies : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new MitigationStrategyModel()
        const [CreateMitigationStrategy] = useMutation(CREATE_MITIGATIONSTRATEGY, {
        onCompleted: (response) => {
            const data = response.createMitigationStrategy
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('MitigationStrategies','error','','sync')
            setUploadError("MitigationStrategies")
        },
    })
    const [UpdateMitigationStrategy] = useMutation(UPDATE_MITIGATIONSTRATEGY, {
        onCompleted: (response) => {
            const data = response.updateMitigationStrategy
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('MitigationStrategies','error','','sync')
            setUploadError("MitigationStrategies")
        },
    })
    const [GetMitigationStrategiesById] = useLazyQuery(GET_MITIGATIONSTRATEGIES_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'MitigationStrategy') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('MitigationStrategies_NoupdatedRecord!')
                                addSuccessResult('MitigationStrategies','sync')
                                setStorageItem('MitigationStrategies','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('MitigationStrategies','error','','sync')
                            setUploadError("MitigationStrategies")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('MitigationStrategies','error','','sync')
            setUploadError("MitigationStrategies")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetMitigationStrategiesById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneMitigationStrategy
                    const updateData = {
                        id: record.id,
                        strategy: record.strategy,
                    }
                    const createData = {
                        id: record.id,
                        strategy: record.strategy,
                    }
                    if(checkResult) {
                        UpdateMitigationStrategy({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateMitigationStrategy({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("MitigationStrategies")
                })
            })
        )
        setStorageItem('MitigationStrategies','success','100','sync')
        addSuccessResult('MitigationStrategies','sync')
    }
    useEffect(() => {
        setStorageItem('MitigationStrategies','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncMitigationStrategies
