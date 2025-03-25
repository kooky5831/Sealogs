import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import { CREATE_ENGINEER_LOGBOOKENTRYSECTION, UPDATE_ENGINEER_LOGBOOKENTRYSECTION } from '@/app/lib/graphQL/mutation'
import Engineer_LogBookEntrySectionModel from '../../models/engineer_LogBookEntrySection'
import { GET_ENGINEER_LOGBOOKENTRYSECTION_BY_ID } from '@/app/lib/graphQL/query/offline/GET_ENGINEER_LOGBOOKENTRYSECTION_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncEngineer_LogBookEntrySections : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new Engineer_LogBookEntrySectionModel()
    const [CreateEngineer_LogBookEntrySection] = useMutation(CREATE_ENGINEER_LOGBOOKENTRYSECTION, {
        onCompleted: (response) => {
            const data = response.createEngineer_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('Engineer_LogBookEntrySections','error','','sync')
            setUploadError("Engineer_LogBookEntrySections")
        },
    })
    const [UpdateEngineer_LogBookEntrySection] = useMutation(UPDATE_ENGINEER_LOGBOOKENTRYSECTION, {
        onCompleted: (response) => {
            const data = response.updateEngineer_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('Engineer_LogBookEntrySections','error','','sync')
            setUploadError("Engineer_LogBookEntrySections")
        },
    })
    const [GetEngineerLogBookEntrySectionById] = useLazyQuery(GET_ENGINEER_LOGBOOKENTRYSECTION_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'Engineer_LogBookEntrySection') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('Engineer_LogBookEntrySections_NoupdatedRecord!')
                                addSuccessResult('Engineer_LogBookEntrySections','sync')
                                setStorageItem('Engineer_LogBookEntrySections','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('Engineer_LogBookEntrySections','error','','sync')
                            setUploadError("Engineer_LogBookEntrySections")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('Engineer_LogBookEntrySections','error','','sync')
            setUploadError("Engineer_LogBookEntrySections")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetEngineerLogBookEntrySectionById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneEngineer_LogBookEntrySection
                    const updateData = {
                        archived: record.archived,
                        className: record.className,
                        clientID: record.clientID,
                        created: record.created,
                        createdByID: record.createdByID,
                        date: record.date,
                        fileTracking: record.fileTracking,
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        logBookComponentClass: record.logBookComponentClass,
                        logBookEntryID: record.logBookEntryID,
                        radioCommunications: record.radioCommunications,
                        riverFlowID: record.riverFlowID,
                        sMURecords: record.sMURecords,
                        sectionMemberComments: record.sectionMemberComments,
                        sectionSignatureID: record.sectionSignatureID,
                        sortOrder: record.sortOrder,
                        subView: record.subView,
                        tides: record.tides,
                        tripEvents: record.tripEvents,
                        uniqueID: record.uniqueID,
                        userDefinedData: record.userDefinedData,
                        vehicleDrivers: record.vehicleDrivers,
                        vehicleDutySessions: record.vehicleDutySessions,
                        weatherReports: record.weatherReports,
                    }
                    const createData = {
                        archived: record.archived,
                        className: record.className,
                        clientID: record.clientID,
                        created: record.created,
                        createdByID: record.createdByID,
                        date: record.date,
                        fileTracking: record.fileTracking,
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        logBookComponentClass: record.logBookComponentClass,
                        logBookEntryID: record.logBookEntryID,
                        radioCommunications: record.radioCommunications,
                        riverFlowID: record.riverFlowID,
                        sMURecords: record.sMURecords,
                        sectionMemberComments: record.sectionMemberComments,
                        sectionSignatureID: record.sectionSignatureID,
                        sortOrder: record.sortOrder,
                        subView: record.subView,
                        tides: record.tides,
                        tripEvents: record.tripEvents,
                        uniqueID: record.uniqueID,
                        userDefinedData: record.userDefinedData,
                        vehicleDrivers: record.vehicleDrivers,
                        vehicleDutySessions: record.vehicleDutySessions,
                        weatherReports: record.weatherReports,
                    }
                    if(checkResult) {
                        UpdateEngineer_LogBookEntrySection({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateEngineer_LogBookEntrySection({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("Engineer_LogBookEntrySections")
                })
            })
        )
        setStorageItem('Engineer_LogBookEntrySections','success','100','sync')
        addSuccessResult('Engineer_LogBookEntrySections','sync')
    }
    useEffect(() => {
        setStorageItem('Engineer_LogBookEntrySections','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncEngineer_LogBookEntrySections
