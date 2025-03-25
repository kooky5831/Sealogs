import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import LogBookSignOff_LogBookEntrySectionModel from '../../models/logBookSignOff_LogBookEntrySection'
import { CREATE_LOGBOOKSIGNOFF_LOGBOOKENTRYSECTION } from '@/app/lib/graphQL/mutation/offline/CREATE_LOGBOOKSIGNOFF_LOGBOOKENTRYSECTION'
import { UPDATE_LOGBOOKSIGNOFF_LOGBOOKENTRYSECTION } from '@/app/lib/graphQL/mutation/offline/UPDATE_LOGBOOKSIGNOFF_LOGBOOKENTRYSECTION'
import { GET_LOGBOOKSIGNOFF_LOGBOOKENTRYSECTION_BY_ID } from '@/app/lib/graphQL/query/offline/GET_LOGBOOKSIGNOFF_LOGBOOKENTRYSECTION_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncLogBookSignOff_LogBookEntrySections : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new LogBookSignOff_LogBookEntrySectionModel()
    const [CreateLogBookSignOff_LogBookEntrySection] = useMutation(CREATE_LOGBOOKSIGNOFF_LOGBOOKENTRYSECTION, {
        onCompleted: (response) => {
            const data = response.createLogBookSignOff_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('LogBookSignOff_LogBookEntrySections','error','','sync')
            setUploadError("LogBookSignOff_LogBookEntrySections")
        },
    })
    const [UpdateLogBookSignOff_LogBookEntrySection] = useMutation(UPDATE_LOGBOOKSIGNOFF_LOGBOOKENTRYSECTION, {
        onCompleted: (response) => {
            const data = response.updateLogBookSignOff_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('LogBookSignOff_LogBookEntrySections','error','','sync')
            setUploadError("LogBookSignOff_LogBookEntrySections")
        },
    })
    const [GetLogbookSignOffLogbookEntrySectionById] = useLazyQuery(GET_LOGBOOKSIGNOFF_LOGBOOKENTRYSECTION_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'LogBookSignOff_LogBookEntrySection') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('LogBookSignOff_LogBookEntrySections_NoupdatedRecord!')
                                addSuccessResult('LogBookSignOff_LogBookEntrySections','sync')
                                setStorageItem('LogBookSignOff_LogBookEntrySections','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('LogBookSignOff_LogBookEntrySections','error','','sync')
                            setUploadError("LogBookSignOff_LogBookEntrySections")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('LogBookSignOff_LogBookEntrySections','error','','sync')
            setUploadError("LogBookSignOff_LogBookEntrySections")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetLogbookSignOffLogbookEntrySectionById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneLogBookSignOff_LogBookEntrySection
                    const updateData = {
                        ais: record.ais,
                        archived: record.archived,
                        batteryMaintenance: record.batteryMaintenance,
                        bilgeSystems: record.bilgeSystems,
                        clientID: record.clientID,
                        completedTime: record.completedTime,
                        createdByID: record.createdByID,
                        electronicNavigationalAids: record.electronicNavigationalAids,
                        emergencyReadiness: record.emergencyReadiness,
                        engineRoomAndMachinery: record.engineRoomAndMachinery,
                        environmentalCompliance: record.environmentalCompliance,
                        finalChecks: record.finalChecks,
                        fuelAndOil: record.fuelAndOil,
                        fuelStart: record.fuelStart,
                        galleyAppliances: record.galleyAppliances,
                        hatchesAndWatertightDoors: record.hatchesAndWatertightDoors,
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        id: record.id,
                        logBookEntryID: record.logBookEntryID,
                        power: record.power,
                        review: record.review,
                        riverFlowID: record.riverFlowID,
                        sectionSignatureID: record.sectionSignatureID,
                        signOffMemberID: record.signOffMemberID,
                        sortOrder: record.sortOrder,
                        subView: record.subView,
                        tides: record.tides,
                        tripEvents: record.tripEvents,
                        uniqueID: record.uniqueID,
                        userDefinedData: record.userDefinedData,
                        vehicleDrivers: record.vehicleDrivers,
                        ventilationAndAirConditioning: record.ventilationAndAirConditioning,
                        wasteManagement: record.wasteManagement,
                        weatherReports: record.weatherReports,
                    }
                    const createData = {
                        accommodationAndGalley: record.accommodationAndGalley,
                        ais: record.ais,
                        archived: record.archived,
                        batteryMaintenance: record.batteryMaintenance,
                        clientID: record.clientID,
                        createdByID: record.createdByID,
                        deckOperations: record.deckOperations,
                        electricalSystems: record.electricalSystems,
                        electronicNavigationalAids: record.electronicNavigationalAids,
                        emergencyReadiness: record.emergencyReadiness,
                        engineRoomAndMachinery: record.engineRoomAndMachinery,
                        environmentalCompliance: record.environmentalCompliance,
                        fileTracking: record.fileTracking,
                        finalChecks: record.finalChecks,
                        fuelAndOil: record.fuelAndOil,
                        fuelStart: record.fuelStart,
                        galleyAppliances: record.galleyAppliances,
                        hatchesAndWatertightDoors: record.hatchesAndWatertightDoors,
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        id: record.id,
                        logBookEntryID: record.logBookEntryID,
                        power: record.power,
                        radioCommunications: record.radioCommunications,
                        review: record.review,
                        riverFlowID: record.riverFlowID,
                        safetyEquipmentCheck: record.safetyEquipmentCheck,
                        sectionMemberComments: record.sectionMemberComments,
                        sectionSignatureID: record.sectionSignatureID,
                        signOffMemberID: record.signOffMemberID,
                        sortOrder: record.sortOrder,
                        subView: record.subView,
                        tides: record.tides,
                        uniqueID: record.uniqueID,
                        userDefinedData: record.userDefinedData,
                        weatherReports: record.weatherReports,
                    }
                    if(checkResult) {
                        UpdateLogBookSignOff_LogBookEntrySection({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateLogBookSignOff_LogBookEntrySection({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("LogBookSignOff_LogBookEntrySections")
                })
            })
        )
        setStorageItem('LogBookSignOff_LogBookEntrySections','success','100','sync')
        addSuccessResult('LogBookSignOff_LogBookEntrySections','sync')
    }
    useEffect(() => {
        setStorageItem('LogBookSignOff_LogBookEntrySections','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncLogBookSignOff_LogBookEntrySections
