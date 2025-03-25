import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import Ports_LogBookEntrySectionModel from '../../models/ports_LogBookEntrySection'
import { CREATE_PORTS_LOGBOOKENTRYSECTION } from '@/app/lib/graphQL/mutation/offline/CREATE_PORTS_LOGBOOKENTRYSECTION'
import { UPDATE_PORTS_LOGBOOKENTRYSECTION } from '@/app/lib/graphQL/mutation/offline/UPDATE_PORTS_LOGBOOKENTRYSECTION'
import { GET_PORTS_LOGBOOKENTRYSECTION_BY_ID } from '@/app/lib/graphQL/query/offline/GET_PORTS_LOGBOOKENTRYSECTION_BY_ID'
// REMEMBER: The indexedDB is the source of truth

const SyncPorts_LogBookEntrySections : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new Ports_LogBookEntrySectionModel()
    const [CreatePorts_LogBookEntrySection] = useMutation(CREATE_PORTS_LOGBOOKENTRYSECTION, {
        onCompleted: (response) => {
            const data = response.createFuel_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('Ports_LogBookEntrySections','error','','sync')
            setUploadError("Ports_LogBookEntrySections")
        },
    })
    const [UpdatePorts_LogBookEntrySection] = useMutation(UPDATE_PORTS_LOGBOOKENTRYSECTION, {
        onCompleted: (response) => {
            const data = response.updatePorts_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('Ports_LogBookEntrySections','error','','sync')
            setUploadError("Ports_LogBookEntrySections")
        },
    })
    const [getPortsLogbookEntrySectionById] = useLazyQuery(GET_PORTS_LOGBOOKENTRYSECTION_BY_ID,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'Ports_LogBookEntrySection') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('Ports_LogBookEntrySections_NoupdatedRecord!')
                                addSuccessResult('Ports_LogBookEntrySections','sync')
                                setStorageItem('Ports_LogBookEntrySections','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('Ports_LogBookEntrySections','error','','sync')
                            setUploadError("Ports_LogBookEntrySections")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('Ports_LogBookEntrySections','error','','sync')
            setUploadError("Ports_LogBookEntrySections")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all( 
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await getPortsLogbookEntrySectionById({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOnePorts_LogBookEntrySection
                    const updateData = {
                        archived: record.archived,
                        arriveTo: record.arriveTo,
                        checksCompleted: record.checksCompleted,
                        clientID: record.clientID,
                        createdByID: record.createdByID,
                        departFrom: record.departFrom,
                        fromLocationID: record.fromLocationID,
                        fuelTankFuelUsages: record.fuelTankFuelUsages,
                        id: record.id,
                        letGo: record.letGo,
                        logBookEntryID: record.logBookEntryID,
                        masterID: record.masterID,
                        otherActivities: record.otherActivities,
                        pPBTransfers: record.pPBTransfers,
                        pennantUsages: record.pennantUsages,
                        pilotTransfers: record.pilotTransfers,
                        radioCommunications: record.radioCommunications,
                        riverFlowID: record.riverFlowID,
                        sectionSignatureID: record.sectionSignatureID,
                        shipTugs: record.shipTugs,
                        sortOrder: record.sortOrder,
                        subView: record.subView,
                        supernumerary: record.supernumerary,
                        tides: record.tides,
                        tieUp: record.tieUp,
                        toLocationID: record.toLocationID,
                        towlineUsages: record.towlineUsages,
                        tripCrewMembers: record.tripCrewMembers,
                        tripEvents: record.tripEvents,
                        userDefinedData: record.userDefinedData,
                        vehicleDrivers: record.vehicleDrivers,
                        weatherReports: record.weatherReports,
                    }
                    const createData = {
                        archived: record.archived,
                        arriveTo: record.arriveTo,
                        checksCompleted: record.checksCompleted,
                        clientID: record.clientID,
                        createdByID: record.createdByID,
                        fromLocationID: record.fromLocationID,
                        fuelTankFuelUsages: record.fuelTankFuelUsages,
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        id: record.id,
                        letGo: record.letGo,
                        logBookEntryID: record.logBookEntryID,
                        masterID: record.masterID,
                        otherActivities: record.otherActivities,
                        pPBTransfers: record.pPBTransfers,
                        pennantUsages: record.pennantUsages,
                        pilotTransfers: record.pilotTransfers,
                        radioCommunications: record.radioCommunications,
                        riverFlowID: record.riverFlowID,
                        safetyKayakerMembers: record.safetyKayakerMembers,
                        sectionMemberComments: record.sectionMemberComments,
                        sectionSignatureID: record.sectionSignatureID,
                        shipTugs: record.shipTugs,
                        sortOrder: record.sortOrder,
                        subView: record.subView,
                        supernumerary: record.supernumerary,
                        tides: record.tides,
                        tieUp: record.tieUp,
                        toLocationID: record.toLocationID,
                        towlineUsages: record.towlineUsages,
                        tripCrewMembers: record.tripCrewMembers,
                        tripEvents: record.tripEvents,
                        userDefinedData: record.userDefinedData,
                        weatherReports: record.weatherReports,
                    }
                    if(checkResult) {
                        UpdatePorts_LogBookEntrySection({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreatePorts_LogBookEntrySection({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("Ports_LogBookEntrySections")
                })
            })
        )
        setStorageItem('Ports_LogBookEntrySections','success','100','sync')
        addSuccessResult('Ports_LogBookEntrySections','sync')
    }
    useEffect(() => {
        setStorageItem('Ports_LogBookEntrySections','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncPorts_LogBookEntrySections
