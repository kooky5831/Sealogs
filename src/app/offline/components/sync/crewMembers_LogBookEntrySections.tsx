import React, { useEffect, useState } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { CreateCrewMembers_LogBookEntrySection, UpdateCrewMembers_LogBookEntrySection } from '@/app/lib/graphQL/mutation'
import { GET_CREW_BY_LOGENTRY_ID } from '@/app/lib/graphQL/query'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import CrewMembers_LogBookEntrySectionModel from '../../models/crewMembers_LogBookEntrySection'

// REMEMBER: The indexedDB is the source of truth
const SyncCrewMembers_LogBookEntrySections : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new CrewMembers_LogBookEntrySectionModel()
    const [createCrewMembers_LogBookEntrySection] = useMutation(CreateCrewMembers_LogBookEntrySection,{
        onCompleted: (response) => {
            const data = response.createCrewMembers_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('CrewMembers_LogBookEntrySections','error','','sync')
            setUploadError("CrewMembers_LogBookEntrySections")
        },
    })
    const [updateCrewMembers_LogBookEntrySection] = useMutation(UpdateCrewMembers_LogBookEntrySection,{
        onCompleted: (response) => {
            const data = response.updateCrewMembers_LogBookEntrySection
            if(typeof window !== 'undefined' &&  data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('CrewMembers_LogBookEntrySections','error','','sync')
            setUploadError("CrewMembers_LogBookEntrySections")
        },
    })
    const [GetCrewMembersLogEntrySectionByLogBookEntryID] = useLazyQuery(GET_CREW_BY_LOGENTRY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async (table, index: number) => {
                if(table.name == 'CrewMembers_LogBookEntrySection') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('CrewMembers_LogBookEntrySections_NoupdatedRecord!')
                                setStorageItem('CrewMembers_LogBookEntrySections','success','100','sync')
                                addSuccessResult('CrewMembers_LogBookEntrySections','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('CrewMembers_LogBookEntrySections','error','','sync')
                            setUploadError("CrewMembers_LogBookEntrySections")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('CrewMembers_LogBookEntrySections','error','','sync')
            setUploadError("CrewMembers_LogBookEntrySections")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                await GetCrewMembersLogEntrySectionByLogBookEntryID({
                    variables: {
                        logBookEntryID: record.logBookEntryID,
                    },
                })
                .then( async (res) => {
                    const checkResult = res.data.readOneCrewMembers_LogBookEntrySection;
                    const createData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        created: record.created,
                        createdByID: record.createdByID,
                        crewMemberID: record.crewMemberID,
                        dutyHours: record.dutyHours,
                        dutyPerformedID: record.dutyPerformedID,
                        fileTracking: record.fileTracking,
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        logBookComponentClass: record.logBookComponentClass,
                        logBookEntryID: record.logBookEntryID,
                        punchIn: record.punchIn,
                        punchOut: record.punchOut,
                        radioCommunications: record.radioCommunications,
                        riverFlowID: record.riverFlowID,
                        sectionMemberComments: record.sectionMemberComments,
                        sectionSignatureID: record.sectionSignatureID,
                        sortOrder: record.sortOrder,
                        subView: record.subView,
                        tides: record.tides,
                        tripEvents: record.tripEvents,
                        uniqueID: record.uniqueID,
                        userDefinedData: record.userDefinedData,
                        vehicleDrivers: record.vehicleDrivers,
                        weatherReports: record.weatherReports,
                        workDetails: record.workDetails
                    }
                    const updateData = {
                        archived : record.archived,
                        clientID : record.clientID,
                        created : record.created,
                        createdByID : record.createdByID,
                        crewMemberID : record.crewMemberID,
                        dutyHours : record.dutyHours,
                        dutyPerformedID : record.dutyPerformedID,
                        fileTracking : record.fileTracking,
                        hazardousSubstanceRecords : record.hazardousSubstanceRecords,
                        id : record.id,
                        lastEdited : record.lastEdited,
                        logBookComponentClass : record.logBookComponentClass,
                        logBookEntryID : record.logBookEntryID,
                        punchIn : record.punchIn,
                        punchOut : record.punchOut,
                        radioCommunications : record.radioCommunications,
                        riverFlowID : record.riverFlowID,
                        sectionMemberComments : record.sectionMemberComments,
                        sectionSignatureID : record.sectionSignatureID,
                        sortOrder : record.sortOrder,
                        subView : record.subView,
                        tides : record.tides,
                        tripEvents : record.tripEvents,
                        uniqueID : record.uniqueID,
                        userDefinedData : record.userDefinedData,
                        vehicleDrivers : record.vehicleDrivers,
                        weatherReports : record.weatherReports,
                        workDetails : record.workDetails
                    }
                    if(checkResult) {
                        await updateCrewMembers_LogBookEntrySection({
                            variables: {
                                input: updateData
                            },
                        }) 
                    }  else {
                        await createCrewMembers_LogBookEntrySection({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    setUploadError("CrewMembers_LogBookEntrySections")
                })
            })
        )
        setStorageItem('CrewMembers_LogBookEntrySections','success','100','sync')
        addSuccessResult('CrewMembers_LogBookEntrySections','sync')
    }
    useEffect(() => {
        setStorageItem('CrewMembers_LogBookEntrySections','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncCrewMembers_LogBookEntrySections
