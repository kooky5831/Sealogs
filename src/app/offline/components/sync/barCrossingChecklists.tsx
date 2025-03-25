import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import BarCrossingChecklistModel from '../../models/barCrossingChecklist'
import { GET_BARCROSSINGCHECKLIST_BY_ID } from '@/app/lib/graphQL/query/offline/GET_BARCROSSINGCHECKLIST_BY_ID'
import { CREATE_BARCROSSINGCHECKLIST } from '@/app/lib/graphQL/mutation/offline/CREATE_BARCROSSINGCHECKLIST'
import { UPDATE_BARCROSSINGCHECKLIST } from '@/app/lib/graphQL/mutation/offline/UPDATE_BARCROSSINGCHECKLIST'
// REMEMBER: The indexedDB is the source of truth

const SyncBarCrossingChecklists : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new BarCrossingChecklistModel()
        const [CreateBarCrossingChecklist] = useMutation(CREATE_BARCROSSINGCHECKLIST, {
        onCompleted: (response) => {
            const data = response.createBarCrossingChecklist
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('BarCrossingChecklists','error','','sync')
            setUploadError("BarCrossingChecklists")
        },
    })
    const [UpdateBarCrossingChecklist] = useMutation(UPDATE_BARCROSSINGCHECKLIST, {
        onCompleted: (response) => {
            const data = response.updateBarCrossingChecklist
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('BarCrossingChecklists','error','','sync')
            setUploadError("BarCrossingChecklists")
        },
    })
    const [GetBarCrossingChecklistById] = useLazyQuery(GET_BARCROSSINGCHECKLIST_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'BarCrossingChecklist') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('BarCrossingChecklists_NoupdatedRecord!')
                                addSuccessResult('BarCrossingChecklists','sync')
                                setStorageItem('BarCrossingChecklists','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:", table.name)
                            setStorageItem('BarCrossingChecklists','error','','sync')
                            setUploadError("BarCrossingChecklists")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('BarCrossingChecklists','error','','sync')
            setUploadError("BarCrossingChecklists")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetBarCrossingChecklistById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneBarCrossingChecklist
                    const updateData = {
                        crewBriefing: record.crewBriefing,
                        id: record.id,
                        lifeJackets: record.lifeJackets,
                        lookoutPosted: record.lookoutPosted,
                        memberID: record.memberID,
                        riskFactors: record.riskFactors,
                        stability: record.stability,
                        stopAssessPlan: record.stopAssessPlan,
                        vesselID: record.vesselID,
                        waterTightness: record.waterTightness,
                        weather: record.weather,
                    }
                    const createData = {
                        crewBriefing: record.crewBriefing,
                        id: record.id,
                        lifeJackets: record.lifeJackets,
                        lookoutPosted: record.lookoutPosted,
                        memberID: record.memberID,
                        riskFactors: record.riskFactors,
                        stability: record.stability,
                        vesselID: record.vesselID,
                        waterTightness: record.waterTightness,
                        weather: record.weather,
                    }
                    if(checkResult) {
                        UpdateBarCrossingChecklist({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateBarCrossingChecklist({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("BarCrossingChecklists")
                })
            })
        )
        setStorageItem('BarCrossingChecklists','success','100','sync')
        addSuccessResult('BarCrossingChecklists','sync')
    }
    useEffect(() => {
        setStorageItem('BarCrossingChecklists','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncBarCrossingChecklists
