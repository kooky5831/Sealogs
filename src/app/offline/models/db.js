import Dexie from 'dexie'

const db = new Dexie('seaLogsDB')
db.version(1).stores({
    AssetReporting_LogBookEntrySection: 'id, idbCRUD',
    BarCrossingChecklist: 'id, idbCRUD, vesselID',
    CGEventMission: 'id, idbCRUD, vesselID',
    Client: 'id, idbCRUD',
    ComponentMaintenanceCheck: 'id, idbCRUD',
    ComponentMaintenanceSchedule: 'id, idbCRUD',
    Consequence: 'id, idbCRUD',
    CrewDuty: 'id, idbCRUD',
    CrewMembers_LogBookEntrySection: 'id, idbCRUD',
    CrewTraining_LogBookEntrySection: 'id, idbCRUD',
    CrewWelfare_LogBookEntrySection: 'id, idbCRUD',
    CustomisedComponentField: 'id, idbCRUD, customisedLogBookComponentID',
    CustomisedLogBookConfig: 'id, idbCRUD, customisedLogBookID',
    DangerousGood: 'id, idbCRUD',
    DangerousGoodsChecklist: 'id, idbCRUD, vesselID',
    DangerousGoodsRecord: 'id, idbCRUD, tripReport_LogBookEntrySectionID',
    Engine: 'id, idbCRUD',
    Engine_LogBookEntrySection: 'id, idbCRUD',
    Engine_Usage: 'id, idbCRUD, maintenanceScheduleID, engineID',
    Engineer_LogBookEntrySection: 'id, idbCRUD',
    EventType_BarCrossing:
        'id, idbCRUD, tripEventID, geoLocationID, geoLocationCompletedID, barCrossingChecklistID',
    EventType_PassengerDropFacility: 'id, idbCRUD, tripEventID, geoLocationID',
    EventType_PersonRescue: 'id, idbCRUD, missionID, tripEventID',
    EventType_RestrictedVisibility:
        'id, idbCRUD, tripEventID, startLocationID, endLocationID',
    EventType_Supernumerary: 'id, idbCRUD',
    EventType_Tasking:
        'id, idbCRUD, currentEntryID, groupID, pausedTaskID, openTaskID, completedTaskID, tripEventID, geoLocationID, vesselRescueID, personRescueID, towingChecklistID, parentTaskingID',
    EventType_VesselRescue:
        'id, idbCRUD, missionID, vesselLocationID, tripEventID',
    EventType: 'id, idbCRUD',
    FavoriteLocation: 'id, idbCRUD, memberID',
    Fuel_LogBookEntrySection: 'id, idbCRUD',
    FuelLog:
        'id, idbCRUD, refuellingBunkeringID, eventType_TaskingID, eventType_PassengerDropFacilityID, logBookEntryID, fuelTankID',
    FuelTank: 'id, idbCRUD',
    GeoLocation: 'id, idbCRUD',
    Inventory: 'id, idbCRUD, vesselID',
    Likelihood: 'id, idbCRUD',
    LogBookEntry: 'id, idbCRUD, vehicleID',
    LogBookEntrySection_Signature: 'id, idbCRUD, logBookEntrySectionID',
    LogBookSignOff_LogBookEntrySection: 'id, idbCRUD',
    MaintenanceCheck: 'id, idbCRUD, maintenanceScheduleID',
    MaintenanceCheck_Signature: 'id, idbCRUD, maintenanceCheckID',
    MaintenanceSchedule: 'id, idbCRUD',
    MaintenanceScheduleSubTask: 'id, idbCRUD, componentMaintenanceScheduleID',
    MemberTraining_Signature: 'id, idbCRUD, memberID, trainingSessionID',
    MissionTimeline:
        'id, idbCRUD, missionID, vesselRescueID, personRescueID, maintenanceCheckID, subTaskID',
    MitigationStrategy: 'id, idbCRUD',
    Ports_LogBookEntrySection: 'id, idbCRUD',
    RefuellingBunkering: 'id, idbCRUD, tripEventID, geoLocationID',
    RiskFactor:
        'id, idbCRUD, vesselID, riskRatingID, consequenceID, likelihoodID, towingChecklistID, dangerousGoodsChecklistID, barCrossingChecklistID, type',
    RiskRating: 'id, idbCRUD',
    SeaLogsMember: 'id, idbCRUD',
    SectionMemberComment:
        'id, idbCRUD, logBookEntrySectionID, commentType, comment, hideComment',
    Supernumerary_LogBookEntrySection: 'id, idbCRUD, supernumeraryID',
    TowingChecklist: 'id, idbCRUD, vesselID',
    TrainingLocation: 'id, idbCRUD',
    TrainingSession:
        'id, idbCRUD, trainerID, logBookEntrySectionID, logBookEntryID, vesselID, trainingLocationID, geoLocationID',
    TrainingSessionDue:
        'id, idbCRUD, memberID, trainingTypeID, vesselID, trainingSessionID',
    TrainingType: 'id, idbCRUD',
    TripEvent: 'id, idbCRUD',
    TripReport_LogBookEntrySection: 'id, idbCRUD',
    TripReport_Stop:
        'id, idbCRUD, stopLocationID, logBookEntrySectionID, tripReportScheduleStopID, dangerousGoodsChecklistID',
    VehiclePosition: 'id, idbCRUD, vehicleID',
    Vessel: 'id, idbCRUD',
    VesselDailyCheck_LogBookEntrySection: 'id, idbCRUD',
    VoyageSummary_LogBookEntrySection: 'id, idbCRUD',
    WeatherForecast: 'id, idbCRUD, logBookEntryID',
    WeatherObservation: 'id, idbCRUD, logBookEntryID, forecastID',
    WeatherTide: 'id, idbCRUD, logBookEntryID',
})

db.open().catch(function (e) {
    console.error('[seaLogsDB] Open failed: ' + e)
})

export default db
