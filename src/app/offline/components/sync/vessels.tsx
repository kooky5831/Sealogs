import React, { useEffect } from 'react'
import db from '../../models/db'
import { useLazyQuery, useMutation } from '@apollo/client'
import { addSuccessResult, setStorageItem, setUploadError } from '../../helpers/functions'
import {CREATE_VESSEL, UPDATE_VESSEL } from '@/app/lib/graphQL/mutation'
import { VESSEL_INFO } from '@/app/lib/graphQL/query'
import VesselModel from '../../models/vessel'


// REMEMBER: The indexedDB is the source of truth
const SyncVessels : React.FC<{ flag: string }> = React.memo(({ flag }) => {
    const model = new VesselModel()
    const [CreateVessel] = useMutation(CREATE_VESSEL, {
        onCompleted: (response) => {
            const data = response.createVessel
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('createError:', error);
            setStorageItem('Vessels','error','','sync')
            setUploadError("Vessels")
        },
    })
    const [UpdateVessel] = useMutation(UPDATE_VESSEL, {
        onCompleted: (response) => {
            const data = response.updateVessel
            if(typeof window !== 'undefined' && data){
                model.setProperty(data.id);
            }
        },
        onError: (error) => {
            console.log('updateError:', error)
            setStorageItem('Vessels','error','','sync')
            setUploadError("Vessels")
        },
    })
    const [GetVessel] = useLazyQuery(VESSEL_INFO,{
        fetchPolicy: 'cache-and-network',
    })
    const getUpdatedRecord = () => {
        try {
            db.tables.map( async table => {
                if(table.name == 'Vessel') {
                    await table.where('idbCRUD').equals('Update').toArray()
                        .then(result => {
                            if(result.length > 0) {
                                uploadRecordToServer(result)
                            } else {
                                console.log('Vessels_NoupdatedRecord!')
                                addSuccessResult('Vessels','sync')
                                setStorageItem('Vessels','success','100','sync')
                            }})
                        .catch((err) => {
                            console.log("read record Error:",table.name)
                            setStorageItem('Vessels','error','','sync')
                            setUploadError("Vessels")
                        });
                }
            })
        } catch (error) {
            console.error('Error retrieving records:', error);
            setStorageItem('Vessels','error','','sync')
            setUploadError("Vessels")
        }
    }
    const uploadRecordToServer = async (updatedRecord: Array<{}>) => {
        await Promise.all(
            updatedRecord.map( async (record : any) => {
                const id = record.id;
                await GetVessel({
                    variables: {
                        id: id,
                    },
                })
                .then((res) => {
                    const checkResult = res.data.readOneVessel
                    const updateData = {
                        bannerImageID: record.bannerImageID,
                        callSign: record.callSign,
                        clientID: record.clientID,
                        copyCrewToOtherActivites: record.copyCrewToOtherActivites,
                        currentTripServiceID: record.currentTripServiceID,
                        enableTransitMessaging: record.enableTransitMessaging,
                        icon: record.icon,
                        iconMode: record.iconMode,
                        id: record.id,
                        identifier: record.identifier,
                        isActive: record.isActive,
                        logBookID: record.logBookID,
                        maxPOB: record.maxPOB,
                        maxPax: record.maxPax,
                        metServiceForecastLocation: record.metServiceForecastLocation,
                        metServiceObsLocation: record.metServiceObsLocation,
                        mmsi: record.mmsi,
                        numberOfEngines: record.numberOfEngines,
                        numberOfShafts: record.numberOfShafts,
                        photoID: record.photoID,
                        registration: record.registration,
                        templateVisible: record.templateVisible,
                        title: record.title,
                        trainingTypes: record.trainingTypes,
                        transitID: record.transitID,
                        tripScheduleImport: record.tripScheduleImport,
                        uniqueID: record.uniqueID,
                        vesselSpecificsID: record.vesselSpecificsID,
                        vesselType: record.vesselType,
                    }
                    const createData = {
                        activities: record.activities,
                        archived: record.archived,
                        bannerImageID: record.bannerImageID,
                        callSign: record.callSign,
                        clientID: record.clientID,
                        componentMaintenanceChecks: record.componentMaintenanceChecks,
                        currentTripServiceID: record.currentTripServiceID,
                        enableTransitMessaging: record.enableTransitMessaging,
                        icon: record.icon,
                        iconMode: record.iconMode,
                        id: record.id,
                        identifier: record.identifier,
                        isActive: record.isActive,
                        lastEdited: record.lastEdited,
                        logBookID: record.logBookID,
                        maxPOB: record.maxPOB,
                        maxPax: record.maxPax,
                        metServiceObsLocation: record.metServiceObsLocation,
                        minCrew: record.minCrew,
                        mmsi: record.mmsi,
                        photoID: record.photoID,
                        registration: record.registration,
                        showOnDashboard: record.showOnDashboard,
                        templateVisible: record.templateVisible,
                        title: record.title,
                        trainingSessionsDue: record.trainingSessionsDue,
                        transitID: record.transitID,
                        vesselSpecificsID: record.vesselSpecificsID,
                        vesselType: record.vesselType,
                    }
                    if(checkResult) {
                        UpdateVessel({
                            variables: {
                                input: updateData,
                            },
                        }) 
                    }  else {
                        CreateVessel({
                            variables: {
                                input: createData,
                            },
                        })
                    }
                })
                .catch(err => {
                    console.log('checkRecordError:', err)
                    setUploadError("Vessels")
                })
            })
        )
        setStorageItem('Vessels','success','100','sync')
        addSuccessResult('Vessels','sync')
    }
    useEffect(() => {
        setStorageItem('Vessels','fetching','0','sync')
        getUpdatedRecord()
    }, [flag])

    return (
        <div>
        </div>
    )
})
export default SyncVessels
