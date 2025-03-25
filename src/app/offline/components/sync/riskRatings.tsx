import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import RiskRatingModel from '../../models/riskRating'
import { GET_RESKRATING_BY_ID } from '@/app/lib/graphQL/query/offline/GET_RESKRATING_BY_ID'
import { CREATE_RISKRATING } from '@/app/lib/graphQL/mutation/offline/CREATE_RISKRATING'
import { UPDATE_RISKRATING } from '@/app/lib/graphQL/mutation/offline/UPDATE_RISKRATING'
// REMEMBER: The indexedDB is the source of truth

const SyncRiskRatings : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new RiskRatingModel()
    const [CreateRiskRating] = useMutation(CREATE_RISKRATING, {
        onCompleted: (response) => {
            const data = response.createRiskRating
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('RiskRatings','error','','sync')
            setUploadError("RiskRatings")
        },
    })
    const [UpdateRiskRating] = useMutation(UPDATE_RISKRATING, {
        onCompleted: (response) => {
            const data = response.updateRiskRating
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('RiskRatings','error','','sync')
            setUploadError("RiskRatings")
        },
    })
    const [Get_RiskRating] = useLazyQuery(GET_RESKRATING_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'RiskRating') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('RiskRatings_NoupdatedRecord!')
                                addSuccessResult('RiskRatings','sync')
                                setStorageItem('RiskRatings','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('RiskRatings','error','','sync')
                            setUploadError("RiskRatings")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('RiskRatings','error','','sync')
            setUploadError("RiskRatings")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await Get_RiskRating({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneRiskRating
                    const updateData = {
                        backgroundColour: record.backgroundColour,
                        created: record.created,
                        id: record.id,
                        name: record.name,
                        textColour: record.textColour,
                    }
                    const createData = {
                        backgroundColour: record.backgroundColour,
                        created: record.created,
                        id: record.id,
                        name: record.name,
                        textColour: record.textColour,
                    }
                    if(checkResult) {
                        UpdateRiskRating({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateRiskRating({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("RiskRatings")
                })
            })
        )
        setStorageItem('RiskRatings','success','100','sync')
        addSuccessResult('RiskRatings','sync')
    }
    useEffect(() => {
        setStorageItem('RiskRatings','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncRiskRatings
