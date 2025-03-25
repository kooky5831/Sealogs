import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import Supernumerary_LogBookEntrySectionModel from '../../models/supernumerary_LogBookEntrySection'
import { CREATE_SUPERNUMERARY_LOGBOOKENTRYSECTION } from '@/app/lib/graphQL/mutation/offline/CREATE_SUPERNUMERARY_LOGBOOKENTRYSECTION'
import { UPDATE_SUPERNUMERARY_LOGBOOKENTRSECTION } from '@/app/lib/graphQL/mutation/offline/UPDATE_SUPERNUMERARY_LOGBOOKENTRSECTION'
import { GET_SUPERNUMERARY_LOGBOOKENTRYSECTION_BY_ID } from '@/app/lib/graphQL/query/offline/GET_SUPERNUMERARY_LOGBOOKENTRYSECTION_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncSupernumerary_LogBookEntrySections : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new Supernumerary_LogBookEntrySectionModel()
    const [CreateSupernumerary_LogBookEntrySection] = useMutation(CREATE_SUPERNUMERARY_LOGBOOKENTRYSECTION, {
        onCompleted: (response) => {
            const data = response.createSupernumerary_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('Supernumerary_LogBookEntrySections','error','','sync')
            setUploadError("Supernumerary_LogBookEntrySections")
        },
    })
    const [updateSupernumerary_LogBookEntrySection] = useMutation(UPDATE_SUPERNUMERARY_LOGBOOKENTRSECTION, {
        onCompleted: (response) => {
            const data = response.updateSupernumerary_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('Supernumerary_LogBookEntrySections','error','','sync')
            setUploadError("Supernumerary_LogBookEntrySections")
        },
    })
    const [getSupernumeraryLogbookEntrySectionById] = useLazyQuery(GET_SUPERNUMERARY_LOGBOOKENTRYSECTION_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'Supernumerary_LogBookEntrySection') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('Supernumerary_LogBookEntrySections_NoupdatedRecord!')
                                addSuccessResult('Supernumerary_LogBookEntrySections','sync')
                                setStorageItem('Supernumerary_LogBookEntrySections','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('Supernumerary_LogBookEntrySections','error','','sync')
                            setUploadError("Supernumerary_LogBookEntrySections")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('Supernumerary_LogBookEntrySections','error','','sync')
            setUploadError("Supernumerary_LogBookEntrySections")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await getSupernumeraryLogbookEntrySectionById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneSupernumerary_LogBookEntrySection
                    const updateData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        createdByID: record.createdByID,
                        disclaimerID: record.disclaimerID,
                        firstName: record.firstName,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        logBookEntryID: record.logBookEntryID,
                        riverFlowID: record.riverFlowID,
                        sectionSignatureID: record.sectionSignatureID,
                        sortOrder: record.sortOrder,
                        subView: record.subView,
                        supernumeraryID: record.supernumeraryID,
                        surname: record.surname,
                        tides: record.tides,
                        tripEvents: record.tripEvents,
                        uniqueID: record.uniqueID,
                        userDefinedData: record.userDefinedData,
                        weatherReports: record.weatherReports,
                    }
                    const createData = {
                        archived: record.archived,
                        clientID: record.clientID,
                        createdByID: record.createdByID,
                        disclaimerID: record.disclaimerID,
                        firstName: record.firstName,
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        id: record.id,
                        logBookComponentClass: record.logBookComponentClass,
                        logBookEntryID: record.logBookEntryID,
                        policies: record.policies,
                        radioCommunications: record.radioCommunications,
                        riverFlowID: record.riverFlowID,
                        sectionMemberComments: record.sectionMemberComments,
                        sectionSignatureID: record.sectionSignatureID,
                        sortOrder: record.sortOrder,
                        subView: record.subView,
                        supernumeraryID: record.supernumeraryID,
                        surname: record.surname,
                        tides: record.tides,
                        tripEvents: record.tripEvents,
                        userDefinedData: record.userDefinedData,
                        vehicleDrivers: record.vehicleDrivers,
                        weatherReports: record.weatherReports,
                    }
                    if(checkResult) {
                        updateSupernumerary_LogBookEntrySection({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateSupernumerary_LogBookEntrySection({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("Supernumerary_LogBookEntrySections")
                })
            })
        )
        setStorageItem('Supernumerary_LogBookEntrySections','success','100','sync')
        addSuccessResult('Supernumerary_LogBookEntrySections','sync')
    }
    useEffect(() => {
        setStorageItem('Supernumerary_LogBookEntrySections','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncSupernumerary_LogBookEntrySections
