import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import TrainingLocationModel from '../../models/trainingLocation'
import { GET_TRAININGLOCATION_BY_ID } from '@/app/lib/graphQL/query/offline/GET_TRAININGLOCATION_BY_ID'
import { CREATE_TRAININGLOCATION } from '@/app/lib/graphQL/mutation/offline/CREATE_TRAININGLOCATION'
import { UPDATE_TRAININGLOCATION } from '@/app/lib/graphQL/mutation/offline/UPDATE_TRAININGLOCATION'
// REMEMBER: The indexedDB is the source of truth

const SyncTrainingLocations: React.FC<{ flag: string }> = React.memo(
    ({ flag }) => {
    const model = new TrainingLocationModel()
    const [CreateTrainingLocation] = useMutation(CREATE_TRAININGLOCATION, {
        onCompleted: (response) => {
            const data = response.createTrainingLocation
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('TrainingLocations','error','','sync')
            setUploadError("TrainingLocations")
        },
    })
    const [UpdateTrainingLocation] = useMutation(UPDATE_TRAININGLOCATION, {
        onCompleted: (response) => {
            const data = response.updateTrainingLocation
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('TrainingLocations','error','','sync')
            setUploadError("TrainingLocations")
        },
    })
    const [GetTrainingLocationById] = useLazyQuery(GET_TRAININGLOCATION_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'TrainingLocation') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('TowingChecklists_NoupdatedRecord!')
                                addSuccessResult('TrainingLocations','sync')
                                setStorageItem('TrainingLocations','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('TrainingLocations','error','','sync')
                            setUploadError("TrainingLocations")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('TrainingLocations','error','','sync')
            setUploadError("TrainingLocations")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetTrainingLocationById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneTrainingLocation
                    const updateData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        id: record.id,
                        title: record.title,
                    }
                    const createData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        id: record.id,
                        title: record.title,
                    }
                    if(checkResult) {
                        UpdateTrainingLocation({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateTrainingLocation({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("TrainingLocations")
                })
            })
        )
        setStorageItem('TrainingLocations','success','100','sync')
        addSuccessResult('TrainingLocations','sync')
    }
    useEffect(() => {
        setStorageItem('TrainingLocations','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncTrainingLocations
