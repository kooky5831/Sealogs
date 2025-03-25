import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import RiskFactorModel from '../../models/riskFactor'
import { GET_RESKFACTOR_BY_ID } from '@/app/lib/graphQL/query/offline/GET_RESKFACTOR_BY_ID'
import { CREATE_RISKFACTOR } from '@/app/lib/graphQL/mutation/offline/CREATE_RISKFACTOR'
import { UPDATE_RISKFACTOR } from '@/app/lib/graphQL/mutation/offline/UPDATE_RISKFACTOR'
// REMEMBER: The indexedDB is the source of truth

const SyncRiskFactors : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new RiskFactorModel()
        const [CreateRiskFactor] = useMutation(CREATE_RISKFACTOR, {
        onCompleted: (response) => {
            const data = response.createRiskFactor
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('RiskFactors','error','','sync')
            setUploadError("RiskFactors")
        },
    })
    const [UpdateRiskFactor] = useMutation(UPDATE_RISKFACTOR, {
        onCompleted: (response) => {
            const data = response.updateRiskFactor
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('RiskFactors','error','','sync')
            setUploadError("RiskFactors")
        },
    })
    const [GetRiskFactorById] = useLazyQuery(GET_RESKFACTOR_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'RiskFactor') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('RiskFactors_NoupdatedRecord!')
                                addSuccessResult('RiskFactors','sync')
                                setStorageItem('RiskFactors','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('RiskFactors','error','','sync')
                            setUploadError("RiskFactors")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('RiskFactors','error','','sync')
            setUploadError("RiskFactors")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetRiskFactorById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneRiskFactor
                    const mitigationStrategy = record.mitigationStrategy.nodes.length > 0 && record.mitigationStrategy.nodes.map((node: any) => node.id)
                    const updateData = {
                        barCrossingChecklistID: record.barCrossingChecklistID,
                        consequenceID: record.consequenceID,
                        dangerousGoodsChecklistID: record.dangerousGoodsChecklistID,
                        id: record.id,
                        impact: record.impact,
                        likelihoodID: record.likelihoodID,
                        mitigationStrategy: record.mitigationStrategy.nodes.length > 0 ? mitigationStrategy.join(',') : null,
                        probability: record.probability,
                        riskRatingID: record.riskRatingID,
                        title: record.title,
                        towingChecklistID: record.towingChecklistID,
                        type: record.type,
                        vesselID: record.vesselID,
                    }
                    const createData = {
                        barCrossingChecklistID: record.barCrossingChecklistID,
                        consequenceID: record.consequenceID,
                        dangerousGoodsChecklistID: record.dangerousGoodsChecklistID,
                        id: record.id,
                        impact: record.impact,
                        likelihoodID: record.likelihoodID,
                        mitigationStrategy: record.mitigationStrategy.nodes.length > 0 ? mitigationStrategy.join(',') : null,
                        probability: record.probability,
                        riskRatingID: record.riskRatingID,
                        title: record.title,
                        towingChecklistID: record.towingChecklistID,
                        type: record.type,
                        vesselID: record.vesselID,
                    }
                    if(checkResult) {
                        UpdateRiskFactor({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateRiskFactor({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("RiskFactors")
                })
            })
        )
        setStorageItem('RiskFactors','success','100','sync')
        addSuccessResult('RiskFactors','sync')
    }
    useEffect(() => {
        setStorageItem('RiskFactors','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncRiskFactors
