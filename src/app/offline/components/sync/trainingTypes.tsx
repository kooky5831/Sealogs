import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import { CREATE_TRAINING_TYPE, UPDATE_TRAINING_TYPE } from '@/app/lib/graphQL/mutation'
import { TRAINING_TYPE_BY_ID } from '@/app/lib/graphQL/query'
import TrainingTypeModel from '../../models/trainingType'
// REMEMBER: The indexedDB is the source of truth

const SyncTrainingTypes: React.FC<{ flag: string }> = React.memo(
    ({ flag }) => {
        const model = new TrainingTypeModel()
        const [CreateTrainingType] = useMutation(CREATE_TRAINING_TYPE, {
        onCompleted: (response) => {
            const data = response.createTrainingType
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('TrainingTypes','error','','sync')
            setUploadError("TrainingTypes")
        },
    })
    const [UpdateTrainingType] = useMutation(UPDATE_TRAINING_TYPE, {
        onCompleted: (response) => {
            const data = response.updateTrainingType
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('TrainingTypes','error','','sync')
            setUploadError("TrainingTypes")
        },
    })
    const [GetOneTrainingType] = useLazyQuery(TRAINING_TYPE_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'TrainingType') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('TrainingTypes_NoupdatedRecord!')
                                addSuccessResult('TrainingTypes','sync')
                                setStorageItem('TrainingTypes','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('TrainingTypes','error','','sync')
                            setUploadError("TrainingTypes")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('TrainingTypes','error','','sync')
            setUploadError("TrainingTypes")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetOneTrainingType({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneTrainingType
                    const updateData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        crewTraining_LogBookEntrySections: record.crewTraining_LogBookEntrySections,
                        highWarnWithin: record.highWarnWithin,
                        id: record.id,
                        mediumWarnWithin: record.mediumWarnWithin,
                        occursEvery: record.occursEvery,
                        procedure: record.procedure,
                        title: record.title,
                        trainingSessionsDue: record.trainingSessionsDue,
                        vessels: record.vessels,
                    }
                    const createData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        highWarnWithin: record.highWarnWithin,
                        id: record.id,
                        mediumWarnWithin: record.mediumWarnWithin,
                        occursEvery: record.occursEvery,
                        procedure: record.procedure,
                        trainingSessionsDue: record.trainingSessionsDue,
                        vessels: record.vessels,
                    }
                    if(checkResult) {
                        UpdateTrainingType({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateTrainingType({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("TrainingTypes")
                })
            })
        )
        setStorageItem('TrainingTypes','success','100','sync')
        addSuccessResult('TrainingTypes','sync')
    }
    useEffect(() => {
        setStorageItem('TrainingTypes','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncTrainingTypes
