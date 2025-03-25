import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import TrainingSessionDueModel from '../../models/trainingSessionDue'
import { CREATE_TRAINING_SESSION_DUE, UPDATE_TRAINING_SESSION_DUE } from '@/app/lib/graphQL/mutation'
import { READ_ONE_TRAINING_SESSION_DUE } from '@/app/lib/graphQL/query'
// REMEMBER: The indexedDB is the source of truth

const SyncTrainingSessionDues : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new TrainingSessionDueModel()
    const [CreateTrainingSessionDue] = useMutation(CREATE_TRAINING_SESSION_DUE, {
        onCompleted: (response) => {
            const data = response.createTrainingSessionDue
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('TrainingSessionDues','error','','sync')
            setUploadError("TrainingSessionDues")
        },
    })
    const [UpdateTrainingSessionDue] = useMutation(UPDATE_TRAINING_SESSION_DUE, {
        onCompleted: (response) => {
            const data = response.updateTrainingSessionDue
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('TrainingSessionDues','error','','sync')
            setUploadError("TrainingSessionDues")
        },
    })
    const [ReadOneTrainingSessionDue] = useLazyQuery(READ_ONE_TRAINING_SESSION_DUE,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'TrainingSessionDue') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('TrainingSessionDues_NoupdatedRecord!')
                                addSuccessResult('TrainingSessionDues','sync')
                                setStorageItem('TrainingSessionDues','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('TrainingSessionDues','error','','sync')
                            setUploadError("TrainingSessionDues")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('TrainingSessionDues','error','','sync')
            setUploadError("TrainingSessionDues")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await ReadOneTrainingSessionDue({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneTrainingSessionDue
                    const updateData = {
                        clientID: record.clientID,
                        dueDate: record.dueDate,
                        id: record.id,
                        lastTrainingDate: record.lastTrainingDate,
                        memberID: record.memberID,
                        trainingSessionID: record.trainingSessionID,
                        trainingTypeID: record.trainingTypeID,
                        vesselID: record.vesselID,
                    }
                    const createData = {
                        clientID: record.clientID,
                        dueDate: record.dueDate,
                        id: record.id,
                        lastTrainingDate: record.lastTrainingDate,
                        memberID: record.memberID,
                        trainingSessionID: record.trainingSessionID,
                        trainingTypeID: record.trainingTypeID,
                        vesselID: record.vesselID,
                    }
                    if(checkResult) {
                        UpdateTrainingSessionDue({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateTrainingSessionDue({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("TrainingSessionDues")
                })
            })
        )   
        setStorageItem('TrainingSessionDues','success','100','sync')
        addSuccessResult('TrainingSessionDues','sync')
    }
    useEffect(() => {
        setStorageItem('TrainingSessionDues','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncTrainingSessionDues
