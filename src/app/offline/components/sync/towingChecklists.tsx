import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import TowingChecklistModel from '../../models/towingChecklist'
import { GET_TOWINGCHECKLIST_BY_ID } from '@/app/lib/graphQL/query/offline/GET_TOWINGCHECKLIST_BY_ID'
import { CREATE_TOWINGCHECKLIST } from '@/app/lib/graphQL/mutation/offline/CREATE_TOWINGCHECKLIST'
import { UPDATE_TOWINGCHECKLIST } from '@/app/lib/graphQL/mutation/offline/UPDATE_TOWINGCHECKLIST'
// REMEMBER: The indexedDB is the source of truth

const SyncTowingChecklists : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new TowingChecklistModel()
    const [CreateTowingChecklist] = useMutation(CREATE_TOWINGCHECKLIST, {
        onCompleted: (response) => {
            const data = response.createTowingChecklist
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('TowingChecklists','error','','sync')
            setUploadError("TowingChecklists")
        },
    })
    const [UpdateTowingChecklist] = useMutation(UPDATE_TOWINGCHECKLIST, {
        onCompleted: (response) => {
            const data = response.updateTowingChecklist
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('TowingChecklists','error','','sync')
            setUploadError("TowingChecklists")
        },
    })
    const [GetTowingCheckListById] = useLazyQuery(GET_TOWINGCHECKLIST_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'TowingChecklist') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('TowingChecklists_NoupdatedRecord!')
                                addSuccessResult('TowingChecklists','sync')
                                setStorageItem('TowingChecklists','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('TowingChecklists','error','','sync')
                            setUploadError("TowingChecklists")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('TowingChecklists','error','','sync')
            setUploadError("TowingChecklists")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetTowingCheckListById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneTowingChecklist
                    const updateData = {
                        communicationsEstablished: record.communicationsEstablished,
                        created: record.created,
                        everyoneOnBoardOk: record.everyoneOnBoardOk,
                        id: record.id,
                        investigateNatureOfIssue: record.investigateNatureOfIssue,
                        lifejacketsOn: record.lifejacketsOn,
                        memberID: record.memberID,
                        rudderToMidshipsAndTrimmed: record.rudderToMidshipsAndTrimmed,
                        secureAndSafeTowing: record.secureAndSafeTowing,
                        vesselID: record.vesselID,
                    }
                    const createData = {
                        communicationsEstablished: record.communicationsEstablished,
                        conductSAP: record.conductSAP,
                        everyoneOnBoardOk: record.everyoneOnBoardOk,
                        id: record.id,
                        investigateNatureOfIssue: record.investigateNatureOfIssue,
                        lifejacketsOn: record.lifejacketsOn,
                        memberID: record.memberID,
                        riskFactors: record.riskFactors,
                        rudderToMidshipsAndTrimmed: record.rudderToMidshipsAndTrimmed,
                        secureAndSafeTowing: record.secureAndSafeTowing,
                    }
                    if(checkResult) {
                        UpdateTowingChecklist({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateTowingChecklist({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("TowingChecklists")
                })
            })
        )
        setStorageItem('TowingChecklists','success','100','sync')
        addSuccessResult('TowingChecklists','sync')
    }
    useEffect(() => {
        setStorageItem('TowingChecklists','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncTowingChecklists
