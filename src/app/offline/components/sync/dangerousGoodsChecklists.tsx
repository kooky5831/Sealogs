import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import DangerousGoodsChecklistModel from '../../models/dangerousGoodsChecklist'
import { GET_DANGEROUSGOODSCHECKLIST_BY_ID } from '@/app/lib/graphQL/query/offline/GET_DANGEROUSGOODSCHECKLIST_BY_ID'
import { CREATE_DANGEROUSGOODSCHECKLIST } from '@/app/lib/graphQL/mutation/offline/CREATE_DANGEROUSGOODSCHECKLIST'
import { UPDATE_DANGEROUSGOODCHECKLIST } from '@/app/lib/graphQL/mutation/offline/UPDATE_DANGEROUSGOODCHECKLIST'
// REMEMBER: The indexedDB is the source of truth

const SyncDangerousGoodsChecklists : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new DangerousGoodsChecklistModel()
        const [CreateDangerousGoodsChecklist] = useMutation(CREATE_DANGEROUSGOODSCHECKLIST, {
        onCompleted: (response) => {
            const data = response.createDangerousGoodsChecklist
            if(typeof window !== 'undefined'){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('DangerousGoodsChecklists','error','0','sync')
            setUploadError("DangerousGoodsChecklists")
        },
    })
    const [UpdateDangerousGoodsChecklist] = useMutation(UPDATE_DANGEROUSGOODCHECKLIST, {
        onCompleted: (response) => {
            const data = response.updateDangerousGoodsChecklist
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('DangerousGoodsChecklists','error','0','sync')
            setUploadError("DangerousGoodsChecklists")
        },
    })
    const [GetDangerousGoodsChecklistById] = useLazyQuery(GET_DANGEROUSGOODSCHECKLIST_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'DangerousGoodsChecklist') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('DangerousGoodsChecklists_NoupdatedRecord!')
                                addSuccessResult('DangerousGoodsChecklists','sync')
                                setStorageItem('DangerousGoodsChecklists','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('DangerousGoodsChecklists','error','0','sync')
                            setUploadError("DangerousGoodsChecklists")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('DangerousGoodsChecklists','error','0','sync')
            setUploadError("DangerousGoodsChecklists")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetDangerousGoodsChecklistById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneEventType_PersonRescue
                    const updateData = {
                        anyVehiclesSecureToVehicleDeck: record.anyVehiclesSecureToVehicleDeck,
                        bravoFlagRaised: record.bravoFlagRaised,
                        dgDeclarationReceived: record.dgDeclarationReceived,
                        fireExtinguishersAvailable: record.fireExtinguishersAvailable,
                        fireHosesRiggedAndReady: record.fireHosesRiggedAndReady,
                        id: record.id,
                        loadPlanReceived: record.loadPlanReceived,
                        memberID: record.memberID,
                        msdsAvailable: record.msdsAvailable,
                        noSmokingSignagePosted: record.noSmokingSignagePosted,
                        riskFactors: record.riskFactors,
                        safetyAnnouncement: record.safetyAnnouncement,
                        spillKitAvailable: record.spillKitAvailable,
                        tripReport_StopID: record.tripReport_StopID,
                        twoCrewLoadingVessel: record.twoCrewLoadingVessel,
                        vehicleStationaryAndSecure: record.vehicleStationaryAndSecure,
                        vesselID: record.vesselID,
                        vesselSecuredToWharf: record.vesselSecuredToWharf
                    }
                    const createData = {
                        anyVehiclesSecureToVehicleDeck: record.anyVehiclesSecureToVehicleDeck,
                        bravoFlagRaised: record.bravoFlagRaised,
                        dgDeclarationReceived: record.dgDeclarationReceived,
                        fireExtinguishersAvailable: record.fireExtinguishersAvailable,
                        fireHosesRiggedAndReady: record.fireHosesRiggedAndReady,
                        id: record.id,
                        loadPlanReceived: record.loadPlanReceived,
                        memberID: record.memberID,
                        msdsAvailable: record.msdsAvailable,
                        noSmokingSignagePosted: record.noSmokingSignagePosted,
                        riskFactors: record.riskFactors,
                        safetyAnnouncement: record.safetyAnnouncement,
                        spillKitAvailable: record.spillKitAvailable,
                        tripReport_StopID: record.tripReport_StopID,
                        twoCrewLoadingVessel: record.twoCrewLoadingVessel,
                        vehicleStationaryAndSecure: record.vehicleStationaryAndSecure,
                        vesselID: record.vesselID,
                        vesselSecuredToWharf: record.vesselSecuredToWharf,
                    }
                    if(checkResult) {
                        UpdateDangerousGoodsChecklist({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateDangerousGoodsChecklist({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("DangerousGoodsChecklists")
                })
            })
        )
        setStorageItem('DangerousGoodsChecklists','success','100','sync')
        addSuccessResult('DangerousGoodsChecklists','sync')
    }
    useEffect(() => {
        setStorageItem('DangerousGoodsChecklists','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncDangerousGoodsChecklists
