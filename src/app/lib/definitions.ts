export type Vessel = {
    HighestWarningSeverityClass: string
    ID: number
    LogBookID: number
    Registration: string
    Title: string
}

export type logbook = {
    ID: Number
    StartDate: String
    EndDate: String
    SignOffTimestamp: String
    FuelLevel: String
    State: String
    LockedDate: String
    Archived: Boolean
    UniqueID: String
    MasterWord: String
    VehicleID: String
    LogBookID: Number
    MasterID: Number
    CreatedByID: Number
    SignOffSignatureID: Number
    SignOffCommentID: Number
    ClientID: Number
    ClassName: String
    LastEdited: Number
    LogBookEntrySections: [LogBookEntrySections]
}

export type LogBookEntrySections = {
    ID: Number
    DailyChecksCompleted: String
    FuelStart: Number
    NauticalMiles: Number
    FuelEnd: Number
    FuelAdded: Number
    HoursRun: Number
    AggregateTitle: String
    EngineID: Number
    EngineStartStop: EngineStartStop
    EngineRunningCheck: [EngineRunningCheck]
    Depart: String
    DepartFrom: String
    Arrive: String
    ArriveTo: String
    DepartTime: String
    TripScheduleDepartTime: String
    FromFreehand: String
    FromLat: String
    FromLong: String
    ArriveTime: String
    TripScheduleArriveTime: String
    ToFreehand: String
    ToLat: String
    ToLong: String
    POB: Number
    NumberPax: Number
    PaxJoinedAdult: Number
    PaxJoinedChild: Number
    PaxJoinedYouth: Number
    PaxJoinedFOC: Number
    PaxJoinedStaff: Number
    PaxJoinedVoucher: Number
    PaxJoinedPrePaid: Number
    PaxDeparted: Number
    SafetyBriefing: Boolean
    SpeedExemption: Boolean
    ExpectedNextContact: String
    FromCreatesNewGeoLocation: Boolean
    ToCreatesNewGeoLocation: Boolean
    Voucher: String
    IncidentReports: Boolean
    HazardReports: Boolean
    PrevPaxState: String
    Comment: String
    VOB: Number
    TotalVehiclesCarried: Number
    VehiclesJoined: Number
    VehiclesDeparted: Number
    ObservedDepart: String
    ObservedArrive: String
    LogBookComponentClass: String
    SubView: String
    SortOrder: Number
    Archived: Boolean
    UniqueID: String
    HybridDepartTime: String
    HybridArriveTime: String
    From: String
    To: String
    MasterID: Number
    LeadGuideID: Number
    FromLocationID: Number
    ToLocationID: Number
    LateDepartureReasonID: Number
    SpeedExemptionCorridorID: Number
    SpeedExemptionReasonID: Number
    UnscheduledServiceID: Number
    LogBookEntryID: Number
    SectionSignatureID: Number
    CreatedByID: Number
    RiverFlowID: Number
    ClientID: Number
    ClassName: String
    LastEdited: Number
    BikesCarried: String
    EScootersCarried: String
    TripType: String
    TripReport_Stops: [String]
    DangerousGoodsRecords: [String]
    PositionLogs: [String]
    TripCrewList: [String]
    SafetyKayakers: [String]
    HazardousSubstanceRecords: [String]
    VehicleDrivers: [String]
    RadioCommunications: [String]
    TripEvents: [String]
    WeatherReports: [String]
    Tides: [String]
    SectionMemberComments: JSON
}

export type EngineStartStop = {
    ID: Number
    HoursStart: String
    HoursEnd: String
    TotalHours: Number
    TimeStart: Number
    TimeEnd: Number
    UniqueID: String
    EngineID: Number
    LogBookEntrySectionID: Number
    VehicleDutySessionID: Number
    ClientID: Number
    ClassName: String
    LastEdited: Number
}

export type EngineRunningCheck = {
    ID: Number
    EntryTime: String
    ManifoldTemp: String
    GenSetTemp: String
    CoolantTemp: String
    CoolantLevelOK: String
    FuelTemp: String
    ThrustBearingTemp: String
    ShaftBearingTemp: String
    OilLevelOK: String
    OilPressure: String
    LubeOilLevelOK: String
    LubeOilTemp: String
    LubeOilPressure: String
    LubeFilterPressure: String
    FuelPressure: String
    FuelDiffPressure: String
    FuelDayTankLevel: String
    HeaderTankLevel: String
    FuelRate: String
    Volts: String
    KWLoad: String
    OverboardPressure: String
    OverboardDischarge: String
    MaNumberenanceActions: String
    Pyros: String
    Boost: String
    WaterTemp: String
    AirTemp: String
    RPM: String
    Rack: String
    GenSetOP: String
    GenSetWT: String
    GearboxOP: String
    GearboxCLOP: String
    GearboxOT: String
    HRPOP: String
    UserDefinedData: String
    UniqueID: String
    Archived: Boolean
    VehicleDutySessionID: Number
    LogBookEntrySectionID: Number
    EngineID: Number
    SeaLogsMemberID: Number
    ClassName: String
    LastEdited: Number
}

export type CrewTrainingConfig = {
    trainingTypes: [TrainingTypes]
    trainers: [Trainers]
    trainingLocation: any
    crewMembers: any[]
}

export type TrainingTypes = {
    id: Number
    type: String
}

export type Trainers = {
    id: Number
    name: String
}
