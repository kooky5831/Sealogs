import React, { useEffect, useState } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { CREATE_LOGBOOK_ENTRY, UPDATE_LOGBOOK_ENTRY } from '@/app/lib/graphQL/mutation'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import LogBookEntryModel from '../../models/logBookEntry'
import { GET_LOGBOOKENTRY_BY_ID } from '@/app/lib/graphQL/query/offline/GET_LOGBOOKENTRY_BY_ID'

// REMEMBER: The indexedDB is the source of truth
const SyncLogBookEntries : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new LogBookEntryModel()
    const [createLogEntry] = useMutation(CREATE_LOGBOOK_ENTRY,{
        onCompleted: (response) => {
            const data = response.createLogBookEntry
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('LogBookEntries','error','','sync')
            setUploadError("LogBookEntries")
        },
    })
    const [update_logbook_entry] = useMutation(UPDATE_LOGBOOK_ENTRY,{
        onCompleted: (response) => {
            const data = response.updateLogBookEntry
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('LogBookEntries','error','','sync')
            setUploadError("LogBookEntries")
        },
    })
    const [GetlogbookEntryById] = useLazyQuery(GET_LOGBOOKENTRY_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'LogBookEntry') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('LogBookEntrys_NoupdatedRecord!')
                                setStorageItem('LogBookEntries','success','100','sync')
                                addSuccessResult('LogBookEntries','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('LogBookEntries','error','','sync')
                            setUploadError("LogBookEntries")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('LogBookEntries','error','','sync')
            setUploadError("LogBookEntries")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetlogbookEntryById({
                    variables: {
                        id: record.id,
                    },
                })
                .then( async (res) => {
                    const checkResult = res.data.readOneLogBookEntry;
                    const logBookEntrySections = record.logBookEntrySections.nodes.length > 0 && record.logBookEntrySections.nodes.map((node:any) => node.id) 
                    const fuelLog = record.fuelLog.nodes.length > 0 && record.fuelLog.nodes.map((node:any) => node.id) 
                    const createData = {
                        archived: record.archived,
                        className: record.className,
                        clientID: record.clientID,
                        created: record.created,
                        createdByID: record.createdByID,
                        endDate: record.endDate,
                        engineStartStop: record.engineStartStop,
                        fileTracking: record.fileTracking,
                        fuelLevel: record.fuelLevel,
                        fuelLog: record.fuelLog.nodes.length > 0 ? fuelLog.join(',') : null,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        lockedDate: record.lockedDate,
                        logBookEntryLoggers: record.logBookEntryLoggers,
                        logBookEntrySections: record.logBookEntrySections.nodes.length > 0 ? logBookEntrySections.join(',') : null,
                        logBookID: record.logBookID,
                        masterID: record.masterID,
                        signOffCommentID: record.signOffCommentID,
                        signOffSignatureID: record.signOffSignatureID,
                        signOffTimestamp: record.signOffTimestamp,
                        startDate: record.startDate,
                        state: record.state,
                        uniqueID: record.uniqueID,
                        vehicleID: record.vehicleID,
                        weatherForecasts: record.weatherForecasts,
                        weatherObservations: record.weatherObservations,
                        weatherTides: record.weatherTides,
                    }
                    const updateData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        created: record.created,
                        createdByID: record.createdByID,
                        endDate: record.endDate,
                        engineStartStop: record.engineStartStop,
                        fuelLevel: record.fuelLevel,
                        fuelLog: record.fuelLog.nodes.length > 0 ? fuelLog.join(',') : null,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        lockedDate: record.lockedDate,
                        logBookEntryLoggers: record.logBookEntryLoggers,
                        logBookEntrySections: record.logBookEntrySections.nodes.length > 0 ? logBookEntrySections.join(',') : null,
                        logBookID: record.logBookID,
                        masterID: record.masterID,
                        signOffCommentID: record.signOffCommentID,
                        signOffSignatureID: record.signOffSignatureID,
                        signOffTimestamp: record.signOffTimestamp,
                        startDate: record.startDate,
                        state: record.state,
                        uniqueID: record.uniqueID,
                        vehicleID: record.vehicleID,
                        weatherForecasts: record.weatherForecasts,
                        weatherObservations: record.weatherObservations,
                        weatherTides: record.weatherTides,
                    }
                    if(checkResult) {
                        await update_logbook_entry({
                            variables: {
                                input: updateData
                            },
                        }) 
                    }  else {
                        await createLogEntry({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    setUploadError("LogBookEntries")
                })
            })
        )
        setStorageItem('LogBookEntries','success','100','sync')
        addSuccessResult('LogBookEntries','sync')
    }
    useEffect(() => {
        setStorageItem('LogBookEntries','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncLogBookEntries
