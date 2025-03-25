import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import LikelihoodModel from '../../models/likelihood'
import { GET_LIKELIHOOD_BY_ID } from '@/app/lib/graphQL/query/offline/GET_LIKELIHOOD_BY_ID'
import { CREATE_LIKELIHOOD } from '@/app/lib/graphQL/mutation/offline/CREATE_LIKELIHOOD'
import { UPDATE_LIKELIHOOD } from '@/app/lib/graphQL/mutation/offline/UPDATE_LIKELIHOOD'
// REMEMBER: The indexedDB is the source of truth

const SyncLikelihoods : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new LikelihoodModel()
        const [CreateLikelihood] = useMutation(CREATE_LIKELIHOOD, {
        onCompleted: (response) => {
            const data = response.createLikelihood
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('Likelihoods','error','','sync')
            setUploadError("Likelihoods")
        },
    })
    const [UpdateLikelihood] = useMutation(UPDATE_LIKELIHOOD, {
        onCompleted: (response) => {
            const data = response.updateLikelihood
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('Likelihoods','error','','sync')
            setUploadError("Likelihoods")
        },
    })
    const [GetLikelihoodById] = useLazyQuery(GET_LIKELIHOOD_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'Likelihood') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('Likelihoods_NoupdatedRecord!')
                                addSuccessResult('Likelihoods','sync')
                                setStorageItem('Likelihoods','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('Likelihoods','error','','sync')
                            setUploadError("Likelihoods")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('Likelihoods','error','','sync')
            setUploadError("Likelihoods")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetLikelihoodById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneLikelihood
                    const updateData = {
                        backgroundColour: record.backgroundColour,
                        className: record.className,
                        created: record.created,
                        description: record.description,
                        fileTracking: record.fileTracking,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        name: record.name,
                        number: record.number,
                        textColour: record.textColour,
                    }
                    const createData = {
                        backgroundColour: record.backgroundColour,
                        description: record.description,
                        id: record.id,
                        name: record.name,
                        number: record.number,
                        textColour: record.textColour,
                    }
                    if(checkResult) {
                        UpdateLikelihood({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateLikelihood({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("Likelihoods")
                })
            })
        )
        setStorageItem('Likelihoods','success','100','sync')
        addSuccessResult('Likelihoods','sync')
    }
    useEffect(() => {
        setStorageItem('Likelihoods','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncLikelihoods
