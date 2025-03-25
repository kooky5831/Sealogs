import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import AssetReporting_LogBookEntrySectionModel from '../../models/assetReporting_LogBookEntrySection'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import { AssetReporting_LogBookEntrySection } from '@/app/lib/graphQL/query'
import { CreateAssetReporting_LogBookEntrySection, UpdateAssetReporting_LogBookEntrySection } from '@/app/lib/graphQL/mutation'
// REMEMBER: The indexedDB is the source of truth
const SyncAssetReporting_LogBookEntrySections : React.FC<{ flag: string }> = React.memo(({ flag })  => {
    const model = new AssetReporting_LogBookEntrySectionModel()
    const [createAssetReporting_LogBookEntrySection] = useMutation(CreateAssetReporting_LogBookEntrySection, {
        onCompleted: (response) => {
            const data = response.createAssetReporting_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('AssetReporting_LogBookEntrySections','error','','sync')
            setUploadError("AssetReporting_LogBookEntrySections")
        },
    })
    const [updateAssetReporting_LogBookEntrySection] = useMutation(UpdateAssetReporting_LogBookEntrySection, {
        onCompleted: (response) => {
            const data = response.updateAssetReporting_LogBookEntrySection
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('AssetReporting_LogBookEntrySections','error','','sync')
            setUploadError("AssetReporting_LogBookEntrySections")
        },
    })
    const [readOneAssetReporting_LogBookEntrySection] = useLazyQuery(AssetReporting_LogBookEntrySection,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'AssetReporting_LogBookEntrySection') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('AssetReporting_LogBookEntrySection_NoupdatedRecord!')
                                addSuccessResult('AssetReporting_LogBookEntrySections','sync')
                                setStorageItem('AssetReporting_LogBookEntrySections','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('AssetReporting_LogBookEntrySections','error','','sync')
                            setUploadError("AssetReporting_LogBookEntrySections")   
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('AssetReporting_LogBookEntrySections','error','','sync')
            setUploadError("AssetReporting_LogBookEntrySections")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        //check record existing in server
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await readOneAssetReporting_LogBookEntrySection({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneAssetReporting_LogBookEntrySection
                    const updateData = {
                        archived: record.archived,
                        arriveTo: record.arriveTo,
                        checksCompleted: record.checksCompleted,
                        className: record.className,
                        client: record.client,
                        clientID: record.clientID,
                        created: record.created,
                        createdByID: record.createByID,
                        departFrom: record.departFrom,
                        fromLocation: record.fromLocation, 
                        fromLocationID:record.fromLocationID,
                        fuelTankFuelUsages: record.fuelTankFuelUsages,
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        letGo: record.letGo,
                        logBookComponentClass: record.logBookComponentClass,
                        logBookEntryID: record.logBookEntryID,
                        master: record.master,
                        masterID: record.masterID,
                        otherActivities: record.otherActivities,
                        pennantUsages: record.pennantUsages,
                        pilotTransfers: record.pilotTransfers,
                        ppbTransfers: record.ppbTransfers,
                        radioCommunications: record.radioCommunications,
                        riverFlowID:record.riverFlowID,
                        safetyKayakerMembers: record.safetyKayakerMembers,
                        secitonMemberComments: record.sectionMemberComments,
                        sectionSignatre: record.sectionSignature,
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
                        uniqueID: record.uniqueID,
                        userDefinedData: record.userDefinedData,
                        vehicleDrivers: record.vehicleDrivers,
                        weatherReports: record.weatherReports
                    }
                    const createData = {
                        archived: record.archived,
                        arriveTo: record.arriveTo,
                        checksCompleted: record.checksCompleted,
                        className: record.className,
                        clientID: record.clientID,
                        created: record.created,
                        createdByID: record.createByID,
                        departFrom: record.departFrom,
                        fileTracking: record.fileTracking,
                        fromLocationID:record.fromLocationID,
                        fuelTankFuelUsages: record.fuelTankFuelUsages,
                        hazardousSubstanceRecords: record.hazardousSubstanceRecords,
                        id: record.id,
                        lastEdited: record.lastEdited,
                        letGo: record.letGo,
                        logBookComponentClass: record.logBookComponentClass,
                        logBookEntryID: record.logBookEntryID,
                        masterID: record.masterID,
                        otherActivities: record.otherActivities,
                        pPBTransfers: record.pPBTransfers,
                        pennantUsages: record.pennantUsages,
                        pilotTransfers: record.pilotTransfers,
                        radioCommunications: record.radioCommunications,
                        riverFlowID:record.riverFlowID,
                        safetyKayakerMembers: record.safetyKayakerMembers,
                        secitonMemberComments: record.sectionMemberComments,
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
                        uniqueID: record.uniqueID,
                        userDefinedData: record.userDefinedData,
                        vehicleDrivers: record.vehicleDrivers,
                        weatherReports: record.weatherReports
                    }
                    if(checkResult) {
                        updateAssetReporting_LogBookEntrySection({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        createAssetReporting_LogBookEntrySection({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("AssetReporting_LogBookEntrySections")
                })
            })
        )
        setStorageItem('AssetReporting_LogBookEntrySections','success','100','sync')
        addSuccessResult('AssetReporting_LogBookEntrySections','sync')
    }
    useEffect(() => {
        setStorageItem('AssetReporting_LogBookEntrySections','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncAssetReporting_LogBookEntrySections
