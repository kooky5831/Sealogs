import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import { CREATE_ENGINE_LOOGBOOKENTRYSECTION, UPDATE_ENGINE_LOGBOOKENTRYSECTION } from '@/app/lib/graphQL/mutation'
import Engine_LogBookEntrySectionModel from '../../models/engine_LogBookEntrySection'
import { GET_ENGINE_LOGBOOKENTRYSECTION_BY_ID } from '@/app/lib/graphQL/query/offline/GET_ENGINE_LOGBOOKENTRYSECTION_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncEngine_LogBookEntrySections : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new Engine_LogBookEntrySectionModel()
    const [CreateEngine_LogBookEntrySection] = useMutation(CREATE_ENGINE_LOOGBOOKENTRYSECTION, {
        onCompleted: (response) => {
            const data = response.createEngine_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('Engine_LogBookEntrySections','error','','sync')
            setUploadError("Engine_LogBookEntrySections")
        },
    })
    const [UpdateEngine_LogBookEntrySection] = useMutation(UPDATE_ENGINE_LOGBOOKENTRYSECTION, {
        onCompleted: (response) => {
            const data = response.updateEngine_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('Engine_LogBookEntrySections','error','','sync')
            setUploadError("Engine_LogBookEntrySections")
        },
    })
    const [GetEngineLogBookEntrySectionById] = useLazyQuery(GET_ENGINE_LOGBOOKENTRYSECTION_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'Engine_LogBookEntrySection') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('Engine_LogBookEntrySections_NoupdatedRecord!')
                                addSuccessResult('Engine_LogBookEntrySections','sync')
                                setStorageItem('Engine_LogBookEntrySections','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('Engine_LogBookEntrySections','error','','sync')
                            setUploadError("Engine_LogBookEntrySections")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('Engine_LogBookEntrySections','error','','sync')
            setUploadError("Engine_LogBookEntrySections")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetEngineLogBookEntrySectionById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneEngine_LogBookEntrySection
                    const updateData = {
                        archived: record.archived,
                        className: record.className,
                        clientID: record.clientID,
                        created: record.created,
                        createdByID: record.createdByID,
                        engineFluidRecords: record.engineFluidRecords,
                        engineID: record.engineID,
                        engineRunningCheckID: record.engineRunningCheckID,
                        engineStartStopID: record.engineStartStopID,
                        fileTracking: record.fileTracking,
                        fuelAdded: record.fuelAdded,
                        fuelEnd: record.fuelEnd,
                        fuelStart: record.fuelStart,
                        fuelTankStartStops: record.fuelTankStartStops,
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        hoursRun: record.hoursRun,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        logBookComponentClass: record.logBookComponentClass,
                        logBookEntryID: record.logBookEntryID,
                        nauticalMiles: record.nauticalMiles,
                        radioCommunications: record.radioCommunications,
                        riverFlowID: record.riverFlowID,
                        sectionMemberComments: record.sectionMemberComments,
                        sectionSignatureID: record.sectionSignatureID,
                        sewageDisposalRecords: record.sewageDisposalRecords,
                        sortOrder: record.sortOrder,
                        subView: record.subView,
                        tides: record.tides,
                        tripEvents: record.tripEvents,
                        uniqueID: record.uniqueID,
                        userDefinedData: record.userDefinedData,
                        vehicleDrivers: record.vehicleDrivers,
                        weatherReports: record.weatherReports,
                    }
                    const createData = {
                        archived: record.archived,
                        className: record.className,
                        client: record.client,
                        clientID: record.clientID,
                        created: record.created,
                        createdBy: record.createdBy,
                        createdByID: record.createdByID,
                        engine: record.engine,
                        engineFluidRecords: record.engineFluidRecords,
                        engineID: record.engineID,
                        engineRunningCheck: record.engineRunningCheck,
                        engineRunningCheckID: record.engineRunningCheckID,
                        engineStartStop: record.engineStartStop,
                        engineStartStopID: record.engineStartStopID,
                        fuelAdded: record.fuelAdded,
                        fuelEnd: record.fuelEnd,
                        fuelStart: record.fuelStart,
                        fuelTankStartStops: record.fuelTankStartStops,
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        hoursRun: record.hoursRun,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        logBookComponentClass: record.logBookComponentClass,
                        logBookEntry: record.logBookEntry,
                        logBookEntryID: record.logBookEntryID,
                        nauticalMiles: record.nauticalMiles,
                        radioCommunications: record.radioCommunications,
                        riverFlow: record.riverFlow,
                        riverFlowID: record.riverFlowID,
                        sectionMemberComments: record.sectionMemberComments,
                        sectionSignature: record.sectionSignature,
                        sectionSignatureID: record.sectionSignatureID,
                        sewageDisposalRecords: record.sewageDisposalRecords,
                        sortOrder: record.sortOrder,
                        subView: record.subView,
                        tides: record.tides,
                        tripEvents: record.tripEvents,
                        uniqueID: record.uniqueID,
                        userDefinedData: record.userDefinedData,
                        vehicleDrivers: record.vehicleDrivers,
                        weatherReports: record.weatherReports,
                    }
                    if(checkResult) {
                        UpdateEngine_LogBookEntrySection({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateEngine_LogBookEntrySection({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("Engine_LogBookEntrySections")
                })
            })
        )
        setStorageItem('Engine_LogBookEntrySections','success','100','sync')
        addSuccessResult('Engine_LogBookEntrySections','sync')
    }
    useEffect(() => {
        setStorageItem('Engine_LogBookEntrySections','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncEngine_LogBookEntrySections
