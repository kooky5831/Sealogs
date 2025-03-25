import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import ConsequenceModel from '../../models/consequence'
import { GET_CONSEQUENCE_BY_ID } from '@/app/lib/graphQL/query/offline/GET_CONSEQUENCE_BY_ID'
import { CRATE_CONSEQUENCE } from '@/app/lib/graphQL/mutation/offline/CRATE_CONSEQUENCE'
import { UPDATE_CONSEQUENCE } from '@/app/lib/graphQL/mutation/offline/UPDATE_CONSEQUENCE'
// REMEMBER: The indexedDB is the source of truth

const SyncConsequences : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new ConsequenceModel()
        const [CreateConsequence] = useMutation(CRATE_CONSEQUENCE, {
        onCompleted: (response) => {
            const data = response.createConsequence
            if(typeof window !== 'undefined'){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('Consequences','error','','sync')
            setUploadError("Consequences")
        },
    })
    const [UpdateConsequence] = useMutation(UPDATE_CONSEQUENCE, {
        onCompleted: (response) => {
            const data = response.updateConsequence
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('Consequences','error','','sync')
            setUploadError("Consequences")
        },
    })
    const [GetConseqenceById] = useLazyQuery(GET_CONSEQUENCE_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'Consequence') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('Consequences_NoupdatedRecord!')
                                addSuccessResult('Consequences','sync')
                                setStorageItem('Consequences','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:", table.name)
                            setStorageItem('Consequences','error','','sync')
                            setUploadError("Consequences")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('Consequences','error','','sync')
            setUploadError("Consequences")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetConseqenceById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneConsequence
                    const updateData = {
                        backgroundColour: record.backgroundColour,
                        environment: record.environment,
                        financialCost: record.financialCost,
                        humanInjury: record.humanInjury,
                        id: record.id,
                        name: record.name,
                        number: record.number,
                        textColour: record.textColour,
                        workIncomeReputation: record.workIncomeReputation,
                    }
                    const createData = {
                        backgroundColour: record.backgroundColour,
                        environment: record.environment,
                        financialCost: record.financialCost,
                        humanInjury: record.humanInjury,
                        id: record.id,
                        name: record.name,
                        number: record.number,
                        textColour: record.textColour,
                        workIncomeReputation: record.workIncomeReputation,
                    }
                    if(checkResult) {
                        UpdateConsequence({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateConsequence({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("Consequences")
                })
            })
        )
        setStorageItem('Consequences','success','100','sync')
        addSuccessResult('Consequences','sync')
    }
    useEffect(() => {
        setStorageItem('Consequences','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncConsequences
