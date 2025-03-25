import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import Fuel_LogBookEntrySectionModel from '../../models/fuel_LogBookEntrySection'
import { CREATE_FUEL_LOGBOOKENTRYSECTION } from '@/app/lib/graphQL/mutation/offline/CREATE_FUEL_LOGBOOKENTRYSECTION'
import { UPDATE_FUEL_LOGBOOKENTRYSECTION } from '@/app/lib/graphQL/mutation/offline/UPDATE_FUEL_LOGBOOKENTRYSECTION'
import { GET_FUEL_LOGBOOKENRYSECTION } from '@/app/lib/graphQL/query/offline/GET_FUEL_LOGBOOKENRYSECTION'
// REMEMBER: The indexedDB is the source of truth

const SyncFuel_LogBookEntrySections : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new Fuel_LogBookEntrySectionModel()
    const [CreateFuel_LogBookEntrySection] = useMutation(CREATE_FUEL_LOGBOOKENTRYSECTION, {
        onCompleted: (response) => {
            const data = response.createFuel_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('Fuel_LogBookEntrySections','error','','sync')
            setUploadError("Fuel_LogBookEntrySections")
        },
    })
    const [UpdateFuel_LogBookEntrySection] = useMutation(UPDATE_FUEL_LOGBOOKENTRYSECTION, {
        onCompleted: (response) => {
            const data = response.updateFuel_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('Fuel_LogBookEntrySections','error','','sync')
            setUploadError("Fuel_LogBookEntrySections")
        },
    })
    const [GetFuelLogbookentrySectionById] = useLazyQuery(GET_FUEL_LOGBOOKENRYSECTION,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'Fuel_LogBookEntrySection') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('Fuel_LogBookEntrySections_NoupdatedRecord!')
                                addSuccessResult('Fuel_LogBookEntrySections','sync')
                                setStorageItem('Fuel_LogBookEntrySections','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('Fuel_LogBookEntrySections','error','','sync')
                            setUploadError("Fuel_LogBookEntrySections")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('Fuel_LogBookEntrySections','error','','sync')
            setUploadError("Fuel_LogBookEntrySections")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetFuelLogbookentrySectionById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneFuel_LogBookEntrySection
                    const fuelTankStartStops = record.fuelTankStartStops.nodes && record.fuelTankStartStops.nodes.map((node: any) => node.id)
                    const updateData = {
                        archived: record.archived,
                        className: record.className,
                        clientID: record.clientID,
                        created: record.created,
                        createdByID: record.createdByID,
                        engineFluidRecords: record.engineFluidRecords,
                        fileTracking: record.fileTracking,
                        fuelTankStartStops: fuelTankStartStops.join(','),
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        logBookComponentClass: record.logBookComponentClass,
                        logBookEntryID: record.logBookEntryID,
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
                        clientID: record.clientID,
                        created: record.created,
                        createdByID: record.createdByID,
                        engineFluidRecords: record.engineFluidRecords,
                        fileTracking: record.fileTracking,
                        fuelTankStartStops: fuelTankStartStops.join(','),
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        logBookComponentClass: record.logBookComponentClass,
                        logBookEntryID: record.logBookEntryID,
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
                    if(checkResult) {
                        UpdateFuel_LogBookEntrySection({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateFuel_LogBookEntrySection({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("Fuel_LogBookEntrySections")
                })
            })
        )
        
        setStorageItem('Fuel_LogBookEntrySections','success','100','sync')
        addSuccessResult('Fuel_LogBookEntrySections','sync')
    }
    useEffect(() => {
        setStorageItem('Fuel_LogBookEntrySections','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncFuel_LogBookEntrySections
