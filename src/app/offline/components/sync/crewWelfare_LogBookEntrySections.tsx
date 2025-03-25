import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import CrewWelfare_LogBookEntrySectionModel from '../../models/crewWelfare_LogBookEntrySection'
import { CREATE_CREWWELFARE_LOGBOOKENTRYSECTIONS } from '@/app/lib/graphQL/mutation/offline/CREATE_CREWWELFARE_LOGBOOKENTRYSECTIONS'
import { UPDATE_CREWWELFARE_LOGBOOKENTRYSECTONS } from '@/app/lib/graphQL/mutation/offline/UPDATE_CREWWELFARE_LOGBOOKENTRYSECTONS'
import { GET_CREWWELFARE_LOGBOOKENTRYSECTION_BY_ID } from '@/app/lib/graphQL/query/offline/GET_CREWWELFARE_LOGBOOKENTRYSECTION_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncCrewWelfare_LogBookEntrySections : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new CrewWelfare_LogBookEntrySectionModel()
    const [CreateCrewWelfare_LogBookEntrySection] = useMutation(CREATE_CREWWELFARE_LOGBOOKENTRYSECTIONS, {
        onCompleted: (response) => {
            const data = response.createCrewWelfare_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('CrewWelfare_LogBookEntrySections','error','','sync')
            setUploadError("CrewWelfare_LogBookEntrySections")
        },
    })
    const [UpdateCrewWelfare_LogBookEntrySection] = useMutation(UPDATE_CREWWELFARE_LOGBOOKENTRYSECTONS, {
        onCompleted: (response) => {
            const data = response.updateCrewWelfare_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('CrewWelfare_LogBookEntrySections','error','','sync')
            setUploadError("CrewWelfare_LogBookEntrySections")
        },
    })
    const [GetCrewWelfareLogbookEntrySectionById] = useLazyQuery(GET_CREWWELFARE_LOGBOOKENTRYSECTION_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'CrewWelfare_LogBookEntrySection') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('CrewWelfare_LogBookEntrySections_NoupdatedRecord!')
                                addSuccessResult('CrewWelfare_LogBookEntrySections','sync')
                                setStorageItem('CrewWelfare_LogBookEntrySections','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('CrewWelfare_LogBookEntrySections','error','','sync')
                            setUploadError("CrewWelfare_LogBookEntrySections")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('CrewWelfare_LogBookEntrySections','error','','sync')
            setUploadError("CrewWelfare_LogBookEntrySections")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetCrewWelfareLogbookEntrySectionById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneCrewWelfare_LogBookEntrySection
                    const updateData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        createdByID: record.createdByID,
                        fitness: record.fitness,
                        id: record.id,
                        imSafe: record.imSafe,
                        logBookEntryID: record.logBookEntryID,
                        riverFlowID: record.riverFlowID,
                        sectionMemberComments: record.sectionMemberComments,
                        sectionSignatureID: record.sectionSignatureID,
                        subView: record.subView,
                        uniqueID: record.uniqueID,
                        userDefinedData: record.userDefinedData,
                        vehicleDrivers: record.vehicleDrivers,
                        waterQuality: record.waterQuality,
                        weatherReports: record.weatherReports,
                    }
                    const createData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        createdByID: record.createdByID,
                        fitness: record.fitness,
                        id: record.id,
                        imSafe: record.imSafe,
                        logBookComponentClass: record.logBookComponentClass,
                        logBookEntryID: record.logBookEntryID,
                        radioCommunications: record.radioCommunications,
                        riverFlowID: record.riverFlowID,
                        safetyActions: record.safetyActions,
                        sectionMemberComments: record.sectionMemberComments,
                        sectionSignatureID: record.sectionSignatureID,
                        sortOrder: record.sortOrder,
                        subView: record.subView,
                        tripEvents: record.tripEvents,
                        userDefinedData: record.userDefinedData,
                        vehicleDrivers: record.vehicleDrivers,
                        waterQuality: record.waterQuality,
                        weatherReports: record.weatherReports,
                    }
                    if(checkResult) {
                        UpdateCrewWelfare_LogBookEntrySection({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateCrewWelfare_LogBookEntrySection({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("CrewWelfare_LogBookEntrySections")
                })
            })
        )
        setStorageItem('CrewWelfare_LogBookEntrySections','success','100','sync')
        addSuccessResult('CrewWelfare_LogBookEntrySections','sync')
    }
    useEffect(() => {
        setStorageItem('CrewWelfare_LogBookEntrySections','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncCrewWelfare_LogBookEntrySections
