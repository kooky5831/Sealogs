'use client'
import React, { useEffect, useState } from 'react'
import db from '../models/db'
import { initialRenderState, setStorageInitial } from '../helpers/functions'
import SyncLogBookEntries from './sync/logBookEntries'
import SyncLogBookEntrySection_Signatures from './sync/logBookEntrySection_Signatures'
import SyncMaintenanceCheck_Signatures from './sync/maintenanceCheck_Signatures'
import SyncMemberTraining_Signatures from './sync/memberTraining_Signatures'
import SyncCustomisedComponentFields from './sync/customisedComponentFields'
import SyncMaintenanceScheduleSubTasks from './sync/maintenanceScheduleSubTasks'
import SyncVessels from './sync/vessels'
import SyncCrewMembers_LogBookEntrySections from './sync/crewMembers_LogBookEntrySections'
import SyncCustomisedLogBookConfigs from './sync/customisedLogBookConfigs'
import SyncClient from './sync/client'
import SyncSeaLogsMembers from './sync/seaLogsMembers'
import SyncSectionMemberComments from './sync/sectionMemberComment'
import SyncAssetReporting_LogBookEntrySections from './sync/assetReporting_LogBookEntrySections'
import SyncCrewTraining_LogBookEntrySections from './sync/crewTraining_LogBookEntrySections'
import SyncEngineer_LogBookEntrySections from './sync/engineer_LogBookEntrySections'
import SyncEngine_LogBookEntrySections from './sync/engine_LogBookEntrySections'
import SyncFuel_LogBookEntrySections from './sync/fuel_LogBookEntrySections'
import SyncPorts_LogBookEntrySections from './sync/ports_LogBookEntrySections'
import SyncSupernumerary_LogBookEntrySections from './sync/supernumerary_LogBookEntrySections'
import SyncTripReport_LogBookEntrySections from './sync/tripReport_LogBookEntrySections'
import SyncVesselDailyCheck_LogBookEntrySections from './sync/vesselDailyCheck_LogBookEntrySections'
import SyncVoyageSummary_LogBookEntrySections from './sync/voyageSummary_LogBookEntrySections'
import SyncLogBookSignOff_LogBookEntrySections from './sync/logBookSignOff_LogBookEntrySections'
import SyncVehiclePositions from './sync/vehiclePositions'
import SyncGeoLocations from './sync/geoLocations'
import SyncCrewDuties from './sync/crewDuties'
import SyncComponentMaintenanceChecks from './sync/componentMaintenanceChecks'
import SyncWeatherForecasts from './sync/weatherForecasts'
import SyncWeatherObservations from './sync/weatherObservations'
import SyncCrewWelfare_LogBookEntrySections from './sync/crewWelfare_LogBookEntrySections'
import SyncWeatherTides from './sync/weatherTides'
import SyncFavoriteLocations from './sync/favoriteLocations'
import SyncDangerousGoodsRecords from './sync/dangerousGoodsRecords'
import SyncFuelTanks from './sync/fuelTanks'
import SyncFuelLog from './sync/fuelLog'
import SyncEngines from './sync/engines'
import SyncTripEvents from './sync/tripEvents'
import SyncMissionTimelines from './sync/missionTimelines'
import SyncMaintenanceChecks from './sync/maintenanceChecks'
import SyncMaintenanceSchedules from './sync/maintenanceSchedules'
import SyncComponentMaintenanceSchedules from './sync/componentMaintenanceSchedules'
import SyncInventories from './sync/inventories'
import SyncCGEventMissions from './sync/cgEventMissions'
import SyncEngine_Usages from './sync/engine_Usages'
import SyncEventType_VesselRescues from './sync/eventType_VesselRescues'
import SyncRiskRatings from './sync/riskRatings'
import SyncTripReport_Stops from './sync/tripReport_Stops'
import SyncTowingChecklists from './sync/towingChecklists'
import SyncTrainingLocations from './sync/trainingLocations'
import SyncTrainingSessionDues from './sync/trainingSessionDues'
import SyncTrainingSessions from './sync/trainingSessions'
import SyncTrainingTypes from './sync/trainingTypes'
import SyncRiskFactors from './sync/riskFactors'
import SyncMitigationStrategies from './sync/mitigationStrategies'
import SyncLikelihoods from './sync/likelihoods'
import SyncEventType_PersonRescues from './sync/eventType_PersonRescues'
import SyncDangerousGoodsChecklists from './sync/dangerousGoodsChecklists'
import SyncDangerousGoods from './sync/dangerousGoods'
import SyncConsequences from './sync/consequences'
import SyncBarCrossingChecklists from './sync/barCrossingChecklists'
import SyncEventType_BarCrossings from './sync/eventType_BarCrossings'
import SyncRefuellingBunkerings from './sync/refuellingBunkerings'
import SyncEventType_RestrictedVisibilities from './sync/eventType_RestrictedVisibilities'
import SyncEventType_Supernumeraries from './sync/eventType_Supernumeraries'
import SyncEventType_PassengerDropFacilities from './sync/eventType_PassengerDropFacilities'
import SyncEventType_Taskings from './sync/eventType_Taskings'
import SyncEventTypes from './sync/eventTypes'

const DataSync = () => {
    const [render, setRender] = useState(initialRenderState)
    const [loggedIn, setLoggedIn] = useState(false)
    const [match, setMatch] = useState(new Date().toLocaleString());
    useEffect(() => {
        setLoggedIn(!!localStorage.getItem('sl-jwt'))
        const tableCount = db.tables.length
        const intervalId = setInterval(() => {
            if (typeof window !== 'undefined') {
                const successResult: string =
                    localStorage.getItem('uploadSuccessResult') || '0'
                let tempRender = render;
                if (
                    parseInt(successResult) >= tableCount ||
                    parseInt(successResult) == 0
                ) {
                    Object.keys(tempRender).forEach(key => {
                        tempRender[key] = new Date().toLocaleTimeString();
                    })
                    setStorageInitial('sync')
                    setRender(initialRenderState)
                }
                else {
                    const temp: string | null =
                            localStorage.getItem('dataSyncResult')
                    const tempObject: Array<string> = temp
                        ? JSON.parse(temp)
                        : []
                    if (tempObject.length > 0) {
                        tempObject.map((item: any) => {
                            if(item.result != "fetching") {
                                tempRender[item.name] = new Date().toLocaleTimeString()
                            }
                        })
                        setRender(tempRender)
                    }
                }
                setMatch(new Date().toLocaleString());
            }
        }, 60000) // Update every minute 

        return () => clearInterval(intervalId)
    })
    return (
        <div className="text-small p-4 overflow-auto">
            {loggedIn && (
                <>
                    <SyncLogBookEntrySection_Signatures
                        flag={render.LogBookEntrySection_Signatures}
                    />
                    <SyncMaintenanceCheck_Signatures
                        flag={render.MaintenanceCheck_Signatures}
                    />
                    <SyncMemberTraining_Signatures
                        flag={render.MemberTraining_Signatures}
                    />
                    <SyncCustomisedComponentFields
                        flag={render.CustomisedComponentFields}
                    />
                    <SyncMaintenanceScheduleSubTasks
                        flag={render.MaintenanceScheduleSubTasks}
                    />
                    <SyncVessels flag={render.Vessels} />
                    <SyncLogBookEntries flag={render.LogBookEntries} />
                    <SyncCrewMembers_LogBookEntrySections
                        flag={render.CrewMembers_LogBookEntrySections}
                    />
                    <SyncCustomisedLogBookConfigs
                        flag={render.CustomisedLogBookConfigs}
                    />
                    <SyncClient flag={render.Client} />
                    <SyncSeaLogsMembers flag={render.SeaLogsMembers} />
                    <SyncSectionMemberComments
                        flag={render.SectionMemberComments}
                    />
                    <SyncAssetReporting_LogBookEntrySections
                        flag={render.AssetReporting_LogBookEntrySections}
                    />
                    <SyncCrewTraining_LogBookEntrySections
                        flag={render.CrewTraining_LogBookEntrySections}
                    />
                    <SyncEngineer_LogBookEntrySections
                        flag={render.Engineer_LogBookEntrySections}
                    />
                    <SyncEngine_LogBookEntrySections
                        flag={render.Engine_LogBookEntrySections}
                    />
                    <SyncFuel_LogBookEntrySections
                        flag={render.Fuel_LogBookEntrySections}
                    />
                    <SyncPorts_LogBookEntrySections
                        flag={render.Ports_LogBookEntrySections}
                    />
                    <SyncSupernumerary_LogBookEntrySections
                        flag={render.Supernumerary_LogBookEntrySections}
                    />
                    <SyncTripReport_LogBookEntrySections
                        flag={render.TripReport_LogBookEntrySections}
                    />
                    <SyncVesselDailyCheck_LogBookEntrySections
                        flag={render.VesselDailyCheck_LogBookEntrySections}
                    />
                    <SyncVoyageSummary_LogBookEntrySections
                        flag={render.VoyageSummary_LogBookEntrySections}
                    />
                    <SyncCrewWelfare_LogBookEntrySections
                        flag={render.CrewWelfare_LogBookEntrySections}
                    /> 
                    <SyncLogBookSignOff_LogBookEntrySections
                        flag={render.LogBookSignOff_LogBookEntrySections}
                    />
                    <SyncVehiclePositions flag={render.VehiclePositions} />
                    <SyncGeoLocations flag={render.GeoLocations} />
                    <SyncCrewDuties flag={render.CrewDuties} />
                    <SyncComponentMaintenanceChecks
                        flag={render.ComponentMaintenanceChecks}
                    />
                    <SyncWeatherForecasts flag={render.WeatherForecasts} />
                    <SyncWeatherObservations
                        flag={render.WeatherObservations}
                    />
                    <SyncWeatherTides flag={render.WeatherTides} />
                    <SyncFavoriteLocations flag={render.FavoriteLocations} />
                    <SyncDangerousGoodsRecords
                        flag={render.DangerousGoodsRecords}
                    />
                    <SyncFuelTanks flag={render.FuelTanks} />
                    <SyncFuelLog flag={render.FuelLog} />
                    <SyncEngines flag={render.Engines} />
                    <SyncTripEvents flag={render.TripEvents} />
                    <SyncMissionTimelines flag={render.MissionTimelines} />
                    <SyncMaintenanceChecks flag={render.MaintenanceChecks} />
                    <SyncMaintenanceSchedules
                        flag={render.MaintenanceSchedules}
                    />
                    <SyncComponentMaintenanceSchedules
                        flag={render.ComponentMaintenanceSchedules}
                    />
                    <SyncInventories flag={render.Inventories} />
                    <SyncCGEventMissions flag={render.CGEventMissions} />
                    <SyncEngine_Usages flag={render.Engine_Usages} />
                    <SyncEventType_VesselRescues
                        flag={render.EventType_VesselRescues}
                    />
                    <SyncRiskRatings flag={render.RiskRatings} />
                    <SyncTripReport_Stops flag={render.TripReport_Stops} />
                    <SyncTowingChecklists flag={render.TowingChecklists} />
                    <SyncTrainingLocations flag={render.TrainingLocations} />
                    <SyncTrainingSessionDues
                        flag={render.TrainingSessionDues}
                    />
                    <SyncTrainingSessions flag={render.TrainingSessions} />
                    <SyncTrainingTypes flag={render.TrainingTypes} />
                    <SyncRiskFactors flag={render.RiskFactors} />
                    <SyncMitigationStrategies
                        flag={render.MitigationStrategies}
                    />
                    <SyncLikelihoods flag={render.Likelihoods} />
                    <SyncEventType_PersonRescues
                        flag={render.EventType_PersonRescues}
                    />
                    <SyncDangerousGoodsChecklists
                        flag={render.DangerousGoodsChecklists}
                    />
                    <SyncDangerousGoods flag={render.DangerousGoods} />
                    <SyncConsequences flag={render.Consequences} />
                    <SyncBarCrossingChecklists
                        flag={render.BarCrossingChecklists}
                    />
                    <SyncEventType_BarCrossings
                        flag={render.EventType_BarCrossings}
                    />
                    <SyncRefuellingBunkerings
                        flag={render.RefuellingBunkerings}
                    />
                    <SyncEventType_RestrictedVisibilities
                        flag={render.EventType_RestrictedVisibilities}
                    />
                    <SyncEventType_Supernumeraries
                        flag={render.EventType_Supernumeraries}
                    />
                    <SyncEventType_PassengerDropFacilities
                        flag={render.EventType_PassengerDropFacilities}
                    />
                    <SyncEventType_Taskings flag={render.EventType_Taskings} />
                    <SyncEventTypes flag={render.EventTypes} />
                </>
            )}
        </div>
    )
}

export default DataSync
