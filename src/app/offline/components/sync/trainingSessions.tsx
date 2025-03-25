import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import { CREATE_TRAINING_SESSION, UPDATE_TRAINING_SESSION } from '@/app/lib/graphQL/mutation'
import { TRAINING_SESSION_BY_ID } from '@/app/lib/graphQL/query'
import TrainingSessionModel from '../../models/trainingSession'
// REMEMBER: The indexedDB is the source of truth

const SyncTrainingSessions: React.FC<{ flag: string }> = React.memo(
    ({ flag }) => {
        const model = new TrainingSessionModel()
    const [CreateTrainingSession] = useMutation(CREATE_TRAINING_SESSION, {
        onCompleted: (response) => {
            const data = response.createTrainingSession
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('TrainingSessions','error','','sync')
            setUploadError("TrainingSessions")
        },
    })
    const [UpdateTrainingSession] = useMutation(UPDATE_TRAINING_SESSION, {
        onCompleted: (response) => {
            const data = response.updateTrainingSession
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('TrainingSessions','error','','sync')
            setUploadError("TrainingSessions")
        },
    })
    const [GetTrainingSession] = useLazyQuery(TRAINING_SESSION_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'TrainingSession') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('TrainingSessions_NoupdatedRecord!')
                                addSuccessResult('TrainingSessions','sync')
                                setStorageItem('TrainingSessions','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('TrainingSessions','error','','sync')
                            setUploadError("TrainingSessions")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('TrainingSessions','error','','sync')
            setUploadError("TrainingSessions")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetTrainingSession({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneTrainingSession
                    const updateData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        date: record.date,
                        finishTime: record.finishTime,
                        fuelLevel: record.fuelLevel,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        lat: record.lat,
                        logBookEntryID: record.logBookEntryID,
                        logBookEntrySectionID: record.logBookEntrySectionID,
                        long: record.long,
                        members: record.members,
                        signatures: record.signatures,
                        startTime: record.startTime,
                        trainerID: record.trainerID,
                        trainingLocationID: record.trainingLocationID,
                        trainingLocationType: record.trainingLocationType,
                        trainingSummary: record.trainingSummary,
                        trainingTypes: record.trainingTypes,
                        vesselID: record.vesselID,
                    }
                    const createData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        date: record.date,
                        geoLocationID: record.geoLocationID,
                        id: record.id,
                        logBookEntryID: record.logBookEntryID,
                        logBookEntrySectionID: record.logBookEntrySectionID,
                        members: record.members,
                        startTime: record.startTime,
                        trainerID: record.trainerID,
                        trainingLocationID: record.trainingLocationID,
                        trainingLocationType: record.trainingLocationType,
                        trainingSummary: record.trainingSummary,
                        trainingTypes: record.trainingTypes,
                        uniqueID: record.uniqueID,
                        vesselID: record.vesselID,
                    }
                    if(checkResult) {
                        UpdateTrainingSession({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateTrainingSession({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("TrainingSessions")
                })
            })
        )
        setStorageItem('TrainingSessions','success','100','sync')
        addSuccessResult('TrainingSessions','sync')
    }
    useEffect(() => {
        setStorageItem('TrainingSessions','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncTrainingSessions
