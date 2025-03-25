export const generateUniqueId = () => {
    return Math.floor(Date.now() / 1000)
}

export const setStorageItem = (
    name: string,
    state: string,
    progress: string,
    type: string,
) => {
    let tempResultString = ''
    if(type == "fetch" ) {
        tempResultString = localStorage.getItem('dataFetchResult') || ''
    } else {
        tempResultString = localStorage.getItem('dataSyncResult') || ''
    }
    let tempResultObject: Array<{
        name: string
        result: string
        progress: string
        type: string
    }> = tempResultString != '' ? JSON.parse(tempResultString) : []
    
    if (tempResultObject.length == 0) {
        type == 'fetch'
            ? localStorage.setItem(
                  'dataFetchResult',
                  JSON.stringify([
                      {
                          name: name,
                          result: state,
                          progress: progress,
                          type: 'fetch',
                      },
                  ]),
              )
            : localStorage.setItem(
                  'dataSyncResult',
                  JSON.stringify([
                    { 
                        name: name, 
                        result: state, 
                        progress: progress, 
                        type: 'sync' 
                    },
                  ]),
              )
    }
    if (tempResultObject.length > 0) {
        let flag = false
        tempResultObject.map(
            (item: {
                name: string
                result: string
                progress: string
                type: string
            }) => {
                if (item.name == name) {
                    item.result = state
                    item.progress = progress
                    item.type = type
                    flag = true
                }
            },
        )
        if (flag == false) {
            tempResultObject.push({
                name: name,
                result: state,
                progress: progress,
                type: type,
            })
        }
        type == 'fetch'
            ? localStorage.setItem(
                  'dataFetchResult',
                  JSON.stringify(tempResultObject),
              )
            : localStorage.setItem(
                  'dataSyncResult',
                  JSON.stringify(tempResultObject),
              )
    }
}
export const setUploadError = (name: string) => {
    const temp: string | null = localStorage.getItem('uploadError')
    let tempObject: Array<string> = temp ? JSON.parse(temp) : []
    if (tempObject.length == 0) {
        localStorage.setItem('uploadError', JSON.stringify([name]))
    } else {
        tempObject.includes(name) ? null : tempObject.push(name)
        localStorage.setItem('uploadError', JSON.stringify(tempObject))
    }
}
export const setFetchError = (name: string) => {
    const temp: string | null = localStorage.getItem('fetchError')
    let tempObject: Array<string> = temp ? JSON.parse(temp) : []
    if (tempObject.length == 0) {
        localStorage.setItem('fetchError', JSON.stringify([name]))
    } else {
        tempObject.includes(name) ? null : tempObject.push(name)
        localStorage.setItem('fetchError', JSON.stringify(tempObject))
    }
}

export const addSuccessResult = (name: string, type: string) => {
    if (type == 'fetch') {
        const fetchResult: string | null = localStorage.getItem('dataFetchResult')
        const fetchResultObject : Array<{}> = fetchResult ? JSON.parse(fetchResult) : []
        let successCount = 0;
        if (fetchResultObject.length > 0) {
            fetchResultObject.map((res: any) => {
                if(res.result == 'success') successCount++
            })
        }
        localStorage.setItem(
            'fetchSuccessResult',
            `${successCount}`,
        )
    }
    const errorItem: string | null =
        type == 'fetch'
            ? localStorage.getItem('fetchError')
            : localStorage.getItem('uploadError')
    let errorItemObject: Array<string> = errorItem ? JSON.parse(errorItem) : []
    if (errorItemObject.length > 0) {
        errorItemObject.filter((item: string) => item != name)
    }
    type == 'fetch'
        ? localStorage.setItem('fetchError', JSON.stringify(errorItemObject))
        : localStorage.setItem('uploadError', JSON.stringify(errorItemObject))
}
export const setStorageInitial = (type: string) => {
    const temp = [
        {
            name: 'LogBookEntrySection_Signatures',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'MaintenanceCheck_Signatures',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'MemberTraining_Signatures',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'CustomisedComponentFields',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'MaintenanceScheduleSubTasks',
            result: '',
            progress: '',
            type: type,
        },
        { name: 'Vessels', result: '', progress: '', type: type },
        { name: 'LogBookEntries', result: '', progress: '', type: type },
        {
            name: 'CrewMembers_LogBookEntrySections',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'CustomisedLogBookConfigs',
            result: '',
            progress: '',
            type: type,
        },
        { name: 'Client', result: '', progress: '', type: type },
        { name: 'SeaLogsMembers', result: '', progress: '', type: type },
        { name: 'SectionMemberComments', result: '', progress: '', type: type },
        {
            name: 'AssetReporting_LogBookEntrySections',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'CrewTraining_LogBookEntrySections',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'Engineer_LogBookEntrySections',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'Engine_LogBookEntrySections',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'Fuel_LogBookEntrySections',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'Ports_LogBookEntrySections',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'Supernumerary_LogBookEntrySections',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'TripReport_LogBookEntrySections',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'VesselDailyCheck_LogBookEntrySections',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'VoyageSummary_LogBookEntrySections',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'CrewWelfare_LogBookEntrySections',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'LogBookSignOff_LogBookEntrySections',
            result: '',
            progress: '',
            type: type,
        },
        { name: 'VehiclePositions', result: '', progress: '', type: type },
        { name: 'GeoLocations', result: '', progress: '', type: type },
        { name: 'CrewDuties', result: '', progress: '', type: type },
        {
            name: 'ComponentMaintenanceChecks',
            result: '',
            progress: '',
            type: type,
        },
        { name: 'WeatherForecasts', result: '', progress: '', type: type },
        { name: 'WeatherObservations', result: '', progress: '', type: type },
        { name: 'WeatherTides', result: '', progress: '', type: type },
        { name: 'FavoriteLocations', result: '', progress: '', type: type },
        { name: 'DangerousGoodsRecords', result: '', progress: '', type: type },
        { name: 'FuelTanks', result: '', progress: '', type: type },
        { name: 'FuelLog', result: '', progress: '', type: type },
        { name: 'Engines', result: '', progress: '', type: type },
        { name: 'TripEvents', result: '', progress: '', type: type },
        { name: 'MissionTimelines', result: '', progress: '', type: type },
        { name: 'MaintenanceChecks', result: '', progress: '', type: type },
        { name: 'MaintenanceSchedules', result: '', progress: '', type: type },
        {
            name: 'ComponentMaintenanceSchedules',
            result: '',
            progress: '',
            type: type,
        },
        { name: 'Inventories', result: '', progress: '', type: type },
        { name: 'CGEventMissions', result: '', progress: '', type: type },
        { name: 'Engine_Usages', result: '', progress: '', type: type },
        {
            name: 'EventType_VesselRescues',
            result: '',
            progress: '',
            type: type,
        },
        { name: 'RiskRatings', result: '', progress: '', type: type },
        { name: 'TripReport_Stops', result: '', progress: '', type: type },
        { name: 'TowingChecklists', result: '', progress: '', type: type },
        { name: 'TrainingLocations', result: '', progress: '', type: type },
        { name: 'TrainingSessionDues', result: '', progress: '', type: type },
        { name: 'TrainingSessions', result: '', progress: '', type: type },
        { name: 'TrainingTypes', result: '', progress: '', type: type },
        { name: 'RiskFactors', result: '', progress: '', type: type },
        { name: 'MitigationStrategies', result: '', progress: '', type: type },
        { name: 'Likelihoods', result: '', progress: '', type: type },
        {
            name: 'EventType_PersonRescues',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'DangerousGoodsChecklists',
            result: '',
            progress: '',
            type: type,
        },
        { name: 'DangerousGoods', result: '', progress: '', type: type },
        { name: 'Consequences', result: '', progress: '', type: type },
        { name: 'BarCrossingChecklists', result: '', progress: '', type: type },
        {
            name: 'EventType_BarCrossings',
            result: '',
            progress: '',
            type: type,
        },
        { name: 'RefuellingBunkerings', result: '', progress: '', type: type },
        {
            name: 'EventType_RestrictedVisibilities',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'EventType_Supernumeraries',
            result: '',
            progress: '',
            type: type,
        },
        {
            name: 'EventType_PassengerDropFacilities',
            result: '',
            progress: '',
            type: type,
        },
        { 
            name: 'EventType_Taskings', 
            result: '', 
            progress: '', 
            type: type 
        },
        { 
            name: 'EventTypes', 
            result: '', 
            progress: '', 
            type: type 
        },
    ]
    if (typeof window != 'undefined') {
        if (type == 'fetch') {
            localStorage.setItem('dataFetchResult', JSON.stringify(temp))
            localStorage.setItem('fetchSuccessResult', '0')
            localStorage.setItem('fetchError', '')
        } else {
            localStorage.setItem('dataSyncResult', JSON.stringify(temp))
            localStorage.setItem('uploadError', '')
        }
    }
}

export const initialRenderState: { [key: string]: string } = {
    LogBookEntrySection_Signatures: new Date().toLocaleTimeString(),
    MaintenanceCheck_Signatures: new Date().toLocaleTimeString(),
    MemberTraining_Signatures: new Date().toLocaleTimeString(),
    CustomisedComponentFields: new Date().toLocaleTimeString(),
    MaintenanceScheduleSubTasks: new Date().toLocaleTimeString(),
    Vessels: new Date().toLocaleTimeString(),
    LogBookEntries: new Date().toLocaleTimeString(),
    CrewMembers_LogBookEntrySections: new Date().toLocaleTimeString(),
    CustomisedLogBookConfigs: new Date().toLocaleTimeString(),
    Client: new Date().toLocaleTimeString(),
    SeaLogsMembers: new Date().toLocaleTimeString(),
    SectionMemberComments: new Date().toLocaleTimeString(),
    AssetReporting_LogBookEntrySections: new Date().toLocaleTimeString(),
    CrewTraining_LogBookEntrySections: new Date().toLocaleTimeString(),
    Engineer_LogBookEntrySections: new Date().toLocaleTimeString(),
    Engine_LogBookEntrySections: new Date().toLocaleTimeString(),
    Fuel_LogBookEntrySections: new Date().toLocaleTimeString(),
    Ports_LogBookEntrySections: new Date().toLocaleTimeString(),
    Supernumerary_LogBookEntrySections: new Date().toLocaleTimeString(),
    TripReport_LogBookEntrySections: new Date().toLocaleTimeString(),
    VesselDailyCheck_LogBookEntrySections: new Date().toLocaleTimeString(),
    VoyageSummary_LogBookEntrySections: new Date().toLocaleTimeString(),
    CrewWelfare_LogBookEntrySections: new Date().toLocaleTimeString(),
    LogBookSignOff_LogBookEntrySections: new Date().toLocaleTimeString(),
    VehiclePositions: new Date().toLocaleTimeString(),
    GeoLocations: new Date().toLocaleTimeString(),
    CrewDuties: new Date().toLocaleTimeString(),
    ComponentMaintenanceChecks: new Date().toLocaleTimeString(),
    WeatherForecasts: new Date().toLocaleTimeString(),
    WeatherObservations: new Date().toLocaleTimeString(),
    WeatherTides: new Date().toLocaleTimeString(),
    FavoriteLocations: new Date().toLocaleTimeString(),
    DangerousGoodsRecords: new Date().toLocaleTimeString(),
    FuelTanks: new Date().toLocaleTimeString(),
    FuelLog: new Date().toLocaleTimeString(),
    Engines: new Date().toLocaleTimeString(),
    TripEvents: new Date().toLocaleTimeString(),
    MissionTimelines: new Date().toLocaleTimeString(),
    MaintenanceChecks: new Date().toLocaleTimeString(),
    MaintenanceSchedules: new Date().toLocaleTimeString(),
    ComponentMaintenanceSchedules: new Date().toLocaleTimeString(),
    Inventories: new Date().toLocaleTimeString(),
    CGEventMissions: new Date().toLocaleTimeString(),
    Engine_Usages: new Date().toLocaleTimeString(),
    EventType_VesselRescues: new Date().toLocaleTimeString(),
    RiskRatings: new Date().toLocaleString(),
    TripReport_Stops: new Date().toLocaleString(),
    TowingChecklists: new Date().toLocaleString(),
    TrainingLocations: new Date().toLocaleString(),
    TrainingSessionDues: new Date().toLocaleString(),
    TrainingSessions: new Date().toLocaleString(),
    TrainingTypes: new Date().toLocaleString(),
    RiskFactors: new Date().toLocaleString(),
    MitigationStrategies: new Date().toLocaleString(),
    Likelihoods: new Date().toLocaleString(),
    EventType_PersonRescues: new Date().toLocaleString(),
    DangerousGoodsChecklists: new Date().toLocaleString(),
    DangerousGoods: new Date().toLocaleString(),
    Consequences: new Date().toLocaleString(),
    BarCrossingChecklists: new Date().toLocaleString(),
    EventType_BarCrossings: new Date().toLocaleString(),
    RefuellingBunkerings: new Date().toLocaleString(),
    EventType_RestrictedVisibilities: new Date().toLocaleString(),
    EventType_Supernumeraries: new Date().toLocaleString(),
    EventType_PassengerDropFacilities: new Date().toLocaleString(),
    EventType_Taskings: new Date().toLocaleString(),
    EventTypes: new Date().toLocaleString()
}

export const initialDataResult : Array <{name: string, fetch: string, sync: string}> = [
    { name:'LogBookEntrySection_Signatures', fetch: '', sync: ''},
    { name:'MaintenanceCheck_Signatures', fetch: '', sync: ''},
    { name:'MemberTraining_Signatures', fetch: '', sync: ''},
    { name:'CustomisedComponentFields', fetch: '', sync: ''},
    { name:'MaintenanceScheduleSubTasks', fetch: '', sync: ''},
    { name:'Vessels', fetch: '', sync: ''},
    { name:'LogBookEntries', fetch: '', sync: ''},
    { name:'CrewMembers_LogBookEntrySections', fetch: '', sync: ''},
    { name:'CustomisedLogBookConfigs', fetch: '', sync: ''},
    { name:'Client', fetch: '', sync: ''},
    { name:'SeaLogsMembers', fetch: '', sync: ''},
    { name:'SectionMemberComments', fetch: '', sync: ''},
    { name:'AssetReporting_LogBookEntrySections', fetch: '', sync: ''},
    { name:'CrewTraining_LogBookEntrySections', fetch: '', sync: ''},
    { name:'Engineer_LogBookEntrySections', fetch: '', sync: ''},
    { name:'Engine_LogBookEntrySections', fetch: '', sync: ''},
    { name:'Fuel_LogBookEntrySections', fetch: '', sync: ''},
    { name:'Ports_LogBookEntrySections', fetch: '', sync: ''},
    { name:'Supernumerary_LogBookEntrySections', fetch: '', sync: ''},
    { name:'TripReport_LogBookEntrySections', fetch: '', sync: ''},
    { name:'VesselDailyCheck_LogBookEntrySections', fetch: '', sync: ''},
    { name:'VoyageSummary_LogBookEntrySections', fetch: '', sync: ''},
    { name:'CrewWelfare_LogBookEntrySections', fetch: '', sync: ''},
    { name:'LogBookSignOff_LogBookEntrySections', fetch: '', sync: ''},
    { name:'VehiclePositions', fetch: '', sync: ''},
    { name:'GeoLocations', fetch: '', sync: ''},
    { name:'CrewDuties', fetch: '', sync: ''},
    { name:'ComponentMaintenanceChecks', fetch: '', sync: ''},
    { name:'WeatherForecasts', fetch: '', sync: ''},
    { name:'WeatherObservations', fetch: '', sync: ''},
    { name:'WeatherTides', fetch: '', sync: ''},
    { name:'FavoriteLocations', fetch: '', sync: ''},
    { name:'DangerousGoodsRecords', fetch: '', sync: ''},
    { name:'FuelTanks', fetch: '', sync: ''},
    { name:'FuelLog', fetch: '', sync: ''},
    { name:'Engines', fetch: '', sync: ''},
    { name:'TripEvents', fetch: '', sync: ''},
    { name:'MissionTimelines', fetch: '', sync: ''},
    { name:'MaintenanceChecks', fetch: '', sync: ''},
    { name:'MaintenanceSchedules', fetch: '', sync: ''},
    { name:'ComponentMaintenanceSchedules', fetch: '', sync: ''},
    { name:'Inventories', fetch: '', sync: ''},
    { name:'CGEventMissions', fetch: '', sync: ''},
    { name:'Engine_Usages', fetch: '', sync: ''},
    { name:'EventType_VesselRescues', fetch: '', sync: ''},
    { name:'RiskRatings', fetch: '', sync: ''},
    { name:'TripReport_Stops', fetch: '', sync: ''},
    { name:'TowingChecklists', fetch: '', sync: ''},
    { name:'TrainingLocations', fetch: '', sync: ''},
    { name:'TrainingSessionDues', fetch: '', sync: ''},
    { name:'TrainingSessions', fetch: '', sync: ''},
    { name:'TrainingTypes', fetch: '', sync: ''},
    { name:'RiskFactors', fetch: '', sync: ''},
    { name:'MitigationStrategies', fetch: '', sync: ''},
    { name:'Likelihoods', fetch: '', sync: ''},
    { name:'EventType_PersonRescues', fetch: '', sync: ''},
    { name:'DangerousGoodsChecklists', fetch: '', sync: ''},
    { name:'DangerousGoods', fetch: '', sync: ''},
    { name:'Consequences', fetch: '', sync: ''},
    { name:'BarCrossingChecklists', fetch: '', sync: ''},
    { name:'EventType_BarCrossings', fetch: '', sync: ''},
    { name:'RefuellingBunkerings', fetch: '', sync: ''},
    { name:'EventType_RestrictedVisibilities', fetch: '', sync: ''},
    { name:'EventType_Supernumeraries', fetch: '', sync: ''},
    { name:'EventType_PassengerDropFacilities', fetch: '', sync: ''},
    { name:'EventType_Taskings', fetch: '', sync: ''},
    { name:'EventTypes', fetch: '', sync: ''},
]