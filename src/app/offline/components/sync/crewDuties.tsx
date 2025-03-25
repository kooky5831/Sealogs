import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import { GET_CREW_DUTY_BY_ID } from '@/app/lib/graphQL/query'
import { CREATE_CREW_DUTY,  UPDATE_CREW_DUTY } from '@/app/lib/graphQL/mutation'
import CrewDutyModel from '../../models/crewDuty'
// REMEMBER: The indexedDB is the source of truth

const SyncCrewDuties : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new CrewDutyModel()
    const [CreateCrewDuty] = useMutation(CREATE_CREW_DUTY, {
        onCompleted: (response) => {
            const data = response.createCrewDuty
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('CrewDuties','error','','sync')
            setUploadError("CrewDuties")
        },
    })
    const [UpdateCrewDuty] = useMutation(UPDATE_CREW_DUTY, {
        onCompleted: (response) => {
            const data = response.updateCrewDuty
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('CrewDuties','error','','sync')
            setUploadError("CrewDuties")
        },
    })
    const [GetCrewDuty] = useLazyQuery(GET_CREW_DUTY_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'CrewDuty') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('CrewDuties_noUpdatedRecord!')
                                addSuccessResult('CrewDuties','sync')
                                setStorageItem('CrewDuties','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('CrewDuties','error','','sync')
                            setUploadError("CrewDuties")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('CrewDuties','error','','sync')
            setUploadError("CrewDuties")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetCrewDuty({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneCrewDuty
                    const updateData = {
                        abbreviation: record.abbreviation,
                        archived: record.archived,
                        clientID: record.clientID,
                        id: record.id,
                        title: record.title,
                    }
                    const createData = {
                        abbreviation: record.abbreviation,
                        archived: record.archived,
                        className: record.className,
                        clientID: record.clientID,
                        created: record.created,
                        fileTracking: record.fileTracking,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        title: record.title,
                    }
                    if(checkResult) {
                        UpdateCrewDuty({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateCrewDuty({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("CrewDuties")
                })
            })
        )
        setStorageItem('CrewDuties','success','100','sync')
        addSuccessResult('CrewDuties','sync')
    }
    useEffect(() => {
        setStorageItem('CrewDuties','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncCrewDuties
