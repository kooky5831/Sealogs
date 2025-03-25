'use client'
import React, { useEffect, useState } from 'react'
import db from '@/app/offline/models/db'
import { initialRenderState, setStorageInitial } from '../helpers/functions'
import FetchVessels from './fetchers/vessels'
import FetchLogBookEntries from './fetchers/logBookEntries'
import FetchCrewMembers_LogBookEntrySections from './fetchers/crewMembers_LogBookEntrySections'
import FetchCustomisedLogBookConfigs from './fetchers/customisedLogBookConfigs'
import FetchClient from './fetchers/client'
import FetchSeaLogsMembers from './fetchers/seaLogsMembers'
import FetchSectionMemberComments from './fetchers/sectionMemberComment'
import FetchAssetReporting_LogBookEntrySections from './fetchers/assetReporting_LogBookEntrySections'
import FetchCrewTraining_LogBookEntrySections from './fetchers/crewTraining_LogBookEntrySections'
import FetchEngineer_LogBookEntrySections from './fetchers/engineer_LogBookEntrySections'
import FetchEngine_LogBookEntrySections from './fetchers/engine_LogBookEntrySections'
import FetchFuel_LogBookEntrySections from './fetchers/fuel_LogBookEntrySections'
import FetchPorts_LogBookEntrySections from './fetchers/ports_LogBookEntrySections'
import FetchSupernumerary_LogBookEntrySections from './fetchers/supernumerary_LogBookEntrySections'
import FetchTripReport_LogBookEntrySections from './fetchers/tripReport_LogBookEntrySections'
import FetchVesselDailyCheck_LogBookEntrySections from './fetchers/vesselDailyCheck_LogBookEntrySections'
import FetchVoyageSummary_LogBookEntrySections from './fetchers/voyageSummary_LogBookEntrySections'
import FetchCrewWelfare_LogBookEntrySections from './fetchers/crewWelfare_LogBookEntrySections'
import FetchLogBookSignOff_LogBookEntrySections from './fetchers/logBookSignOff_LogBookEntrySections'
import FetchVehiclePositions from './fetchers/vehiclePositions'
import FetchGeoLocations from './fetchers/geoLocations'
import FetchCrewDuties from './fetchers/crewDuties'
import FetchComponentMaintenanceChecks from './fetchers/componentMaintenanceChecks'
import FetchWeatherForecasts from './fetchers/weatherForecasts'
import FetchWeatherObservations from './fetchers/weatherObservations'
import FetchWeatherTides from './fetchers/weatherTides'
import FetchFavoriteLocations from './fetchers/favoriteLocations'
import FetchCustomisedComponentFields from './fetchers/customisedComponentFields'
import FetchDangerousGoodsRecords from './fetchers/dangerousGoodsRecords'
import FetchFuelTanks from './fetchers/fuelTanks'
import FetchFuelLog from './fetchers/fuelLog'
import FetchEngines from './fetchers/engines'
import FetchLogBookEntrySection_Signatures from './fetchers/logBookEntrySection_Signatures'
import FetchTripEvents from './fetchers/tripEvents'
import FetchMissionTimelines from './fetchers/missionTimelines'
import FetchMaintenanceChecks from './fetchers/maintenanceChecks'
import FetchMaintenanceScheduleSubTasks from './fetchers/maintenanceScheduleSubTasks'
import FetchMaintenanceSchedules from './fetchers/maintenanceSchedules'
import FetchMaintenanceCheck_Signatures from './fetchers/maintenanceCheck_Signatures'
import FetchComponentMaintenanceSchedules from './fetchers/componentMaintenanceSchedules'
import FetchInventories from './fetchers/inventories'
import FetchCGEventMissions from './fetchers/cgEventMissions'
import FetchEngine_Usages from './fetchers/engine_Usages'
import FetchEventType_VesselRescues from './fetchers/eventType_VesselRescues'
import FetchEventType_PersonRescues from './fetchers/eventType_PersonRescues'
import FetchBarCrossingChecklists from './fetchers/barCrossingChecklists'
import FetchRiskFactors from './fetchers/riskFactors'
import FetchMitigationStrategies from './fetchers/mitigationStrategies'
import FetchRiskRatings from './fetchers/riskRatings'
import FetchConsequences from './fetchers/consequences'
import FetchLikelihoods from './fetchers/likelihoods'
import FetchTowingChecklists from './fetchers/towingChecklists'
import FetchDangerousGoods from './fetchers/dangerousGoods'
import FetchDangerousGoodsChecklists from './fetchers/dangerousGoodsChecklists'
import FetchTripReport_Stops from './fetchers/tripReport_Stops'
import FetchEventType_BarCrossings from './fetchers/eventType_BarCrossings'
import FetchRefuellingBunkerings from './fetchers/refuellingBunkerings'
import FetchEventType_RestrictedVisibilities from './fetchers/eventType_RestrictedVisibilities'
import FetchEventType_PassengerDropFacilities from './fetchers/eventType_PassengerDropFacilities'
import FetchEventType_Taskings from './fetchers/eventType_Taskings'
import FetchTrainingSessions from './fetchers/trainingSessions'
import FetchTrainingLocations from './fetchers/trainingLocations'
import FetchMemberTraining_Signatures from './fetchers/memberTraining_Signatures'
import FetchEventType_Supernumeraries from './fetchers/eventType_Supernumeraries'
import FetchEventTypes from './fetchers/eventTypes'
import FetchTrainingTypes from './fetchers/trainingTypes'
import FetchTrainingSessionDues from './fetchers/trainingSessionDues'

// REMEMBER: The indexedDB is the source of truth
const DataFetcher = () => {
    const [render, setRender] = useState(initialRenderState)
    const [loggedIn, setLoggedIn] = useState(false)
    const [match, setMatch] = useState(new Date().toLocaleString());
    useEffect(() => {
        const intervalID = setInterval(() => {
            setLoggedIn(!!localStorage.getItem('sl-jwt'))
            let tempRender = render
            if(typeof window !== 'undefined') {
                const successResult: string =
                    localStorage.getItem('fetchSuccessResult') || '0'
                    const tableCount = db.tables.length
                if(parseInt(successResult) == 0 || parseInt(successResult) > tableCount) {
                    Object.keys(tempRender).forEach(key => {
                        tempRender[key] = new Date().toLocaleTimeString();
                    })
                    setStorageInitial('fetch')
                    setRender(tempRender);
                } else {
                    const temp: string | null =
                            localStorage.getItem('dataFetchResult')
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
            }
            setMatch(new Date().toLocaleString())
        }, 60000)
        return () => clearInterval(intervalID)
    })
    return (
        <div className="text-small p-4 overflow-auto">
            {loggedIn && (
                <>
                    <FetchLogBookEntrySection_Signatures
                        flag={render.LogBookEntrySection_Signatures}
                    />
                    <FetchMaintenanceCheck_Signatures
                        flag={render.MaintenanceCheck_Signatures}
                    />
                    <FetchMemberTraining_Signatures
                        flag={render.MemberTraining_Signatures}
                    />
                    <FetchCustomisedComponentFields
                        flag={render.CustomisedComponentFields}
                    />
                    <FetchMaintenanceScheduleSubTasks
                        flag={render.MaintenanceScheduleSubTasks}
                    />
                    <FetchVessels flag={render.Vessels} />
                    <FetchLogBookEntries flag={render.LogBookEntries} />
                    <FetchCrewMembers_LogBookEntrySections
                        flag={render.CrewMembers_LogBookEntrySections}
                    />
                    <FetchCustomisedLogBookConfigs
                        flag={render.CustomisedLogBookConfigs}
                    />
                    <FetchClient flag={render.Client} />
                    <FetchSeaLogsMembers flag={render.SeaLogsMembers} />
                    <FetchSectionMemberComments
                        flag={render.SectionMemberComments}
                    />
                    <FetchAssetReporting_LogBookEntrySections
                        flag={render.AssetReporting_LogBookEntrySections}
                    />
                    <FetchCrewTraining_LogBookEntrySections
                        flag={render.CrewTraining_LogBookEntrySections}
                    />
                    <FetchEngineer_LogBookEntrySections
                        flag={render.Engineer_LogBookEntrySections}
                    />
                    <FetchEngine_LogBookEntrySections
                        flag={render.Engine_LogBookEntrySections}
                    />
                    <FetchFuel_LogBookEntrySections
                        flag={render.Fuel_LogBookEntrySections}
                    />
                    <FetchPorts_LogBookEntrySections
                        flag={render.Ports_LogBookEntrySections}
                    />
                    <FetchSupernumerary_LogBookEntrySections
                        flag={render.Supernumerary_LogBookEntrySections}
                    />
                    <FetchTripReport_LogBookEntrySections
                        flag={render.TripReport_LogBookEntrySections}
                    />
                    <FetchVesselDailyCheck_LogBookEntrySections
                        flag={render.VesselDailyCheck_LogBookEntrySections}
                    />
                    <FetchVoyageSummary_LogBookEntrySections
                        flag={render.VoyageSummary_LogBookEntrySections}
                    />
                    <FetchCrewWelfare_LogBookEntrySections
                        flag={render.CrewWelfare_LogBookEntrySections}
                    />
                    <FetchLogBookSignOff_LogBookEntrySections
                        flag={render.LogBookSignOff_LogBookEntrySections}
                    />
                    <FetchVehiclePositions flag={render.VehiclePositions} />
                    <FetchGeoLocations flag={render.GeoLocations} />
                    <FetchCrewDuties flag={render.CrewDuties} />
                    <FetchComponentMaintenanceChecks
                        flag={render.ComponentMaintenanceChecks}
                    />
                    <FetchWeatherForecasts flag={render.WeatherForecasts} />
                    <FetchWeatherObservations
                        flag={render.WeatherObservations}
                    />
                    <FetchWeatherTides flag={render.WeatherTides} />
                    <FetchFavoriteLocations flag={render.FavoriteLocations} />
                    <FetchDangerousGoodsRecords
                        flag={render.DangerousGoodsRecords}
                    />
                    <FetchFuelTanks flag={render.FuelTanks} />
                    <FetchFuelLog flag={render.FuelLog} />
                    <FetchEngines flag={render.Engines} />
                    <FetchTripEvents flag={render.TripEvents} />
                    <FetchMissionTimelines flag={render.MissionTimelines} />
                    <FetchMaintenanceChecks flag={render.MaintenanceChecks} />
                    <FetchMaintenanceSchedules
                        flag={render.MaintenanceSchedules}
                    />
                    <FetchComponentMaintenanceSchedules
                        flag={render.ComponentMaintenanceSchedules}
                    />
                    <FetchInventories flag={render.Inventories} />
                    <FetchCGEventMissions flag={render.CGEventMissions} />
                    <FetchEngine_Usages flag={render.Engine_Usages} />
                    <FetchEventType_VesselRescues
                        flag={render.EventType_VesselRescues}
                    />
                    <FetchRiskRatings flag={render.RiskRatings} />
                    <FetchTripReport_Stops flag={render.TripReport_Stops} />
                    <FetchTowingChecklists flag={render.TowingChecklists} />
                    <FetchTrainingLocations flag={render.TrainingLocations} />
                    <FetchTrainingSessionDues
                        flag={render.TrainingSessionDues}
                    />
                    <FetchTrainingSessions flag={render.TrainingSessions} />
                    <FetchTrainingTypes flag={render.TrainingTypes} />
                    <FetchRiskFactors flag={render.RiskFactors} />
                    <FetchMitigationStrategies
                        flag={render.MitigationStrategies}
                    />
                    <FetchLikelihoods flag={render.Likelihoods} />
                    <FetchEventType_PersonRescues
                        flag={render.EventType_PersonRescues}
                    />
                    <FetchDangerousGoodsChecklists
                        flag={render.DangerousGoodsChecklists}
                    />
                    <FetchDangerousGoods flag={render.DangerousGoods} />
                    <FetchConsequences flag={render.Consequences} />
                    <FetchBarCrossingChecklists
                        flag={render.BarCrossingChecklists}
                    />
                    <FetchEventType_BarCrossings
                        flag={render.EventType_BarCrossings}
                    />
                    <FetchRefuellingBunkerings
                        flag={render.RefuellingBunkerings}
                    />
                    <FetchEventType_RestrictedVisibilities
                        flag={render.EventType_RestrictedVisibilities}
                    />
                    <FetchEventType_Supernumeraries
                        flag={render.EventType_Supernumeraries}
                    />
                    <FetchEventType_PassengerDropFacilities
                        flag={render.EventType_PassengerDropFacilities}
                    />
                    <FetchEventType_Taskings flag={render.EventType_Taskings} />
                    <FetchEventTypes flag={render.EventTypes} />
                </>
            )}
        </div>
    )
}
export default DataFetcher
