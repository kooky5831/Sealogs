import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import { CREATE_CREW_TRAINING, UPDATE_CREWTRAINING_LOOGBOOKENTRYSECTION } from '@/app/lib/graphQL/mutation'
import CrewTraining_LogBookEntrySectionModel from '../../models/crewTraining_LogBookEntrySection'
import { GET_TRAINING_LOGBOOKENTRSECTION_BY_ID } from '@/app/lib/graphQL/query/offline/GET_TRAINING_LOGBOOKENTRSECTION_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncCrewTraining_LogBookEntrySections : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new CrewTraining_LogBookEntrySectionModel()
    const [CreateCrewTraining_LogBookEntrySection] = useMutation(CREATE_CREW_TRAINING, {
        onCompleted: (response) => {
            const data = response.createCrewTraining_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('CrewTraining_LogBookEntrySections','error','','sync')
            setUploadError("CrewTraining_LogBookEntrySections")
        },
    })
    const [updateCrewTraining_LogBookEntrySection] = useMutation(UPDATE_CREWTRAINING_LOOGBOOKENTRYSECTION, {
        onCompleted: (response) => {
            const data = response.updateCrewTraining_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('CrewTraining_LogBookEntrySections','error','','sync')
            setUploadError("AssetReporting_LogBookEntrySections")
        },
    })
    const [getTrainingLogbookEntrySectionById] = useLazyQuery(GET_TRAINING_LOGBOOKENTRSECTION_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'CrewTraining_LogBookEntrySection') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('CrewTraining_LogBookEntrySections_NoupdatedRecord!')
                                addSuccessResult('CrewTraining_LogBookEntrySections','sync')
                                setStorageItem('CrewTraining_LogBookEntrySections','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('CrewTraining_LogBookEntrySections','error','','sync')
                            setUploadError("AssetReporting_LogBookEntrySections")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('CrewTraining_LogBookEntrySections','error','','sync')
            setUploadError("AssetReporting_LogBookEntrySections")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await getTrainingLogbookEntrySectionById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneCrewTraining_LogBookEntrySection
                    const sectionMemberComments = record.sectionMemberComments.nodes && record.sectionMemberComments.nodes.map((node: any) => node.id);
                    const members = record.members.nodes && record.members.nodes.map((node: any) => node.id);
                    const updateData = {
                        archived: record.archived,
                        className: record.className,
                        clientID: record.clientID,
                        created: record.created,
                        createdByID: record.createdByID,
                        crewMemberSignatures: record.crewMemberSignatures,
                        fileTracking: record.fileTracking,
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        logBookComponentClass: record.logBookComponentClass,
                        logBookEntryID: record.logBookEntryID,
                        members: members.join(","),
                        migrated: record.migrated,
                        radioCommunications: record.radioCommunications,
                        riverFlowID: record.riverFlowID,
                        sectionMemberComments: sectionMemberComments.join(","),
                        sectionSignatureID: record.sectionSignatureID,
                        sortOrder: record.sortOrder,
                        subView: record.subView,
                        tides: record.tides,
                        trainerID: record.trainerID,
                        trainingLocation: record.trainingLocation,
                        trainingSessions: record.trainingSessions,
                        trainingSummary: record.trainingSummary,
                        trainingTime: record.trainingTime,
                        trainingType: record.trainingType,
                        trainingTypes: record.trainingTypes,
                        tripEvents: record.tripEvents,
                        uniqueID: record.uniqueID,
                        userDefinedData: record.userDefinedData,
                        vehicleDrivers: record.vehicleDrivers,
                        weatherReports: record.weatherReports,
                    }
                    const createData = {
                        archived: record.archived,
                        className: record.className,
                        clientID: record.clientID,
                        created: record.created,
                        createdByID: record.createdByID,
                        crewMemberSignatures: record.crewMemberSignatures,
                        fileTracking: record.fileTracking,
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        logBookComponentClass: record.logBookComponentClass,
                        logBookEntryID: record.logBookEntryID,
                        members:members.join(","),
                        migrated: record.migrated,
                        radioCommunications: record.radioCommunications,
                        riverFlowID: record.riverFlowID,
                        sectionMemberComments: sectionMemberComments.join(","),
                        sectionSignatureID: record.sectionSignatureID,
                        sortOrder: record.sortOrder,
                        subView: record.subView,
                        tides: record.tides,
                        trainerID: record.trainerID,
                        trainingLocation: record.trainingLocation,
                        trainingSessions: record.trainingSessions,
                        trainingSummary: record.trainingSummary,
                        trainingTime: record.trainingTime,
                        trainingType: record.trainingType,
                        trainingTypes: record.trainingTypes,
                        tripEvents: record.tripEvents,
                        uniqueID: record.uniqueID,
                        userDefinedData: record.userDefinedData,
                        vehicleDrivers: record.vehicleDrivers,
                        weatherReports: record.weatherReports,
                    }
                    if(checkResult) {
                        updateCrewTraining_LogBookEntrySection({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateCrewTraining_LogBookEntrySection({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("CrewTraining_LogBookEntrySections")
                })
            })
        )
        setStorageItem('CrewTraining_LogBookEntrySections','success','100','sync')
        addSuccessResult('CrewTraining_LogBookEntrySections','sync')
    }
    useEffect(() => {
        setStorageItem('CrewTraining_LogBookEntrySections','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncCrewTraining_LogBookEntrySections
