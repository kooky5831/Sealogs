'use client'
import LogDate from './log-date'
import MasterList from './master'
import { useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { Button, Heading } from 'react-aria-components'
import Link from 'next/link'
import {
    GET_CREW_TRAINING_CONFIG,
    AssetReporting_LogBookEntrySection,
    CrewMembers_LogBookEntrySection,
    CrewTraining_LogBookEntrySection,
    Engineer_LogBookEntrySection,
    Engine_LogBookEntrySection,
    Fuel_LogBookEntrySection,
    Ports_LogBookEntrySection,
    Supernumerary_LogBookEntrySection,
    TripReport_LogBookEntrySection,
    VesselDailyCheck_LogBookEntrySection,
    VoyageSummary_LogBookEntrySection,
    CrewWelfare_LogBookEntrySection,
    LogBookSignOff_LogBookEntrySection,
    GET_LOGBOOK_CONFIG,
    GET_SECTION_MEMBER_COMMENTS,
    GET_LOGBOOK_ENTRY_BY_ID,
    GetCrewMembersFromOpenLogBook,
} from '@/app/lib/graphQL/query'
// import { CrewTrainingConfig } from '@/app/lib/definitions'
import TripLog from './trip-log'
import ComprehensiveEngineLogs from './comprehensive-engine-logs'
import Crew from '../crew/crew'
import CrewSupernumerary from '../crew/supernumerary'
import DailyChecks from '../daily-checks/checks'
import {
    getVesselByID,
    getOneClient,
    getSeaLogsMembersList,
    getLogBookEntries,
    GetLogBookEntriesMembers,
    getVesselList,
} from '@/app/lib/actions'
/* import {
    CREATE_VESSEL_POSITION,
    UPDATE_LOGBOOK_ENTRY,
    UPDATE_SECTION_MEMBER_COMMENT,
} from '@/app/lib/graphQL/mutation' */
import { SeaLogsButton } from '@/app/components/Components'
import { useRouter } from 'next/navigation'
import LogEntrySignOff from './sign-off'
import dayjs from 'dayjs'
import toast, { Toaster } from 'react-hot-toast'
import {
    getPermissions,
    hasPermission,
    isAdmin,
    isCrew,
} from '@/app/helpers/userHelper'
import { classes } from '@/app/components/GlobalClasses'
import EngineChecks from './engine-checks'
import LogBookWeather from './weather'
import OpenPreviousLogbookComments from './open-previous-comments'
import VesselModel from '@/app/offline/models/vessel'
import CrewMembers_LogBookEntrySectionModel from '@/app/offline/models/crewMembers_LogBookEntrySection'
import LogBookEntryModel from '@/app/offline/models/logBookEntry'
import CustomisedLogBookConfigModel from '@/app/offline/models/customisedLogBookConfig'
import ClientModel from '@/app/offline/models/client'
import SeaLogsMemberModel from '@/app/offline/models/seaLogsMember'
import SectionMemberCommentModel from '@/app/offline/models/sectionMemberComment'
import AssetReporting_LogBookEntrySectionModel from '@/app/offline/models/assetReporting_LogBookEntrySection'
import CrewTraining_LogBookEntrySectionModel from '@/app/offline/models/crewTraining_LogBookEntrySection'
import Engineer_LogBookEntrySectionModel from '@/app/offline/models/engineer_LogBookEntrySection'
import Engine_LogBookEntrySectionModel from '@/app/offline/models/engine_LogBookEntrySection'
import Fuel_LogBookEntrySectionModel from '@/app/offline/models/fuel_LogBookEntrySection'
import Ports_LogBookEntrySectionModel from '@/app/offline/models/ports_LogBookEntrySection'
import Supernumerary_LogBookEntrySectionModel from '@/app/offline/models/supernumerary_LogBookEntrySection'
import TripReport_LogBookEntrySectionModel from '@/app/offline/models/tripReport_LogBookEntrySection'
import VesselDailyCheck_LogBookEntrySectionModel from '@/app/offline/models/vesselDailyCheck_LogBookEntrySection'
import VoyageSummary_LogBookEntrySectionModel from '@/app/offline/models/voyageSummary_LogBookEntrySection'
import CrewWelfare_LogBookEntrySectionModel from '@/app/offline/models/crewWelfare_LogBookEntrySection'
import LogBookSignOff_LogBookEntrySectionModel from '@/app/offline/models/logBookSignOff_LogBookEntrySection'
import VehiclePositionModel from '@/app/offline/models/vehiclePosition'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import GeoLocationModel from '@/app/offline/models/geoLocation'
import { useSearchParams } from 'next/navigation'
import { formatDate } from '@/app/helpers/dateHelper'

export default function LogBookEntry({
    vesselID,
    logentryID,
}: {
    vesselID: number
    logentryID: number
}) {
    const searchParams = useSearchParams()
    const firstTab = searchParams.get('firstTab') ?? 0
    const [isLoading, setIsLoading] = useState(true)
    const [loaded, setLoaded] = useState(false)
    const [logbook, setLogbook] = useState<any>(false)
    const [logBookConfig, setLogBookConfig] = useState<any>(false)
    const [client, setClient] = useState<any>(false)
    const [vessel, setVessel] = useState<any>()
    const [crew, setCrew] = useState<any>()
    const [crewTrainingConfigData, setCrewTrainingConfigData] = useState<any>()
    const [locked, setLocked] = useState(false)
    const [tab, setTab] = useState('crew')
    const [logEntrySections, setLogEntrySections] = useState<any>()
    const [startDate, setStartDate] = useState<any>(null)
    const [endDate, setEndDate] = useState<any>(null)
    const [master, setMaster] = useState<any>()
    const [engine, setEngine] = useState<any>()
    const [fuel, setFuel] = useState<any>()
    const [ports, setPorts] = useState<any>()
    const [vesselDailyCheck, setVesselDailyCheck] = useState<any>(false)
    const [signOff, setSignOff] = useState<any>(false)
    const [crewWelfare, setCrewWelfare] = useState<any>(false)
    const [compiledDailyChecks, setCompiledDailyChecks] = useState<any>()
    const [voyageSummary, setVoyageSummary] = useState<any>()
    const [tripReport, setTripReport] = useState<any>()
    const [crewMembers, setCrewMembers] = useState<any>(false)
    const [crewMembersList, setCrewMembersList] = useState<any>([])
    const [crewTraining, setCrewTraining] = useState<any>()
    const [supernumerary, setSupernumerary] = useState<any>()
    const [engineer, setEngineer] = useState<any>()
    const [assetReporting, setAssetReporting] = useState<any>()
    const [openLogEntries, setOpenLogEntries] = useState<any>()
    const router = useRouter()
    const [masterID, setMasterID] = useState(0)
    const [imCrew, setImCrew] = useState(false)
    const [createdTab, setCreatedTab] = useState(false)
    const [prevComments, setPrevComments] = useState([] as any)
    const [currentTrip, setCurrentTrip] = useState<any>(false)
    const [vessels, setVessels] = useState<any>(false)
    const cmlbsModel = new CrewMembers_LogBookEntrySectionModel()
    const logbookModel = new LogBookEntryModel()
    const clbcModel = new CustomisedLogBookConfigModel()
    const cModel = new ClientModel()
    const slmModel = new SeaLogsMemberModel()
    const smcModel = new SectionMemberCommentModel()
    const arlbesModel = new AssetReporting_LogBookEntrySectionModel()
    const ctlbesModel = new CrewTraining_LogBookEntrySectionModel()
    const elbesModel = new Engineer_LogBookEntrySectionModel()
    const engineModel = new Engine_LogBookEntrySectionModel()
    const fuelModel = new Fuel_LogBookEntrySectionModel()
    const portModel = new Ports_LogBookEntrySectionModel()
    const supernumeraryModel = new Supernumerary_LogBookEntrySectionModel()
    const tripReportModel = new TripReport_LogBookEntrySectionModel()
    const vesselDailyCheckModel =
        new VesselDailyCheck_LogBookEntrySectionModel()
    const voyageSummaryModel = new VoyageSummary_LogBookEntrySectionModel()
    const crewWelfareModel = new CrewWelfare_LogBookEntrySectionModel()
    const signOffModel = new LogBookSignOff_LogBookEntrySectionModel()
    const vehiclePositionModel = new VehiclePositionModel()
    const geoLocationModel = new GeoLocationModel()
    const vesselModel = new VesselModel()

    // getVesselList(setVessels)

    // getVesselByID(vesselID, setVessel)

    const handleSetLogbooks = (logbooks: any) => {
        setOpenLogEntries(
            logbooks.filter((entry: any) => entry.state !== 'Locked'),
        )

        // Sort logbook entries
        const sortedLogbooks = logbooks.sort(
            (a: any, b: any) => parseInt(b.id) - parseInt(a.id),
        )
        // Get previous log entries
        const prevLogbooks = sortedLogbooks.filter(
            (logbook: any) =>
                parseInt(logbook.id) < logentryID && logbook.state == 'Locked',
        )
        if (prevLogbooks.length > 0) {
            handleSetPrevLogbooks(prevLogbooks)
        }
    }

    // getLogBookEntries(vesselID, handleSetLogbooks)
    const getLogBookEntries = async () => {
        const crew = await cmlbsModel.getAll()
        const entries = await logbookModel.getByVesselId(vesselID)
        const data = entries.map((entry: any) => {
            const crewData = crew.filter(
                (crewMember: any) => crewMember.logBookEntryID === entry.id,
            )
            return {
                ...entry,
                crew: crewData,
            }
        })
        if (data) {
            handleSetLogbooks(data)
        }
        /* const crew = response.readCrewMembers_LogBookEntrySections.nodes
        const entries = response.GetLogBookEntries.nodes
        const data = entries.map((entry: any) => {
            const crewData = crew.filter(
                (crewMember: any) => crewMember.logBookEntryID === entry.id,
            )
            return {
                ...entry,
                crew: crewData,
            }
        })
        if (data) {
            setLogBookEntries(data)
        } */
    }
    /* const [getSectionEngine_LogBookEntrySection] = useLazyQuery(
        Engine_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readEngine_LogBookEntrySections.nodes
                setEngine(data)
            },
            onError: (error: any) => {
                console.error('Engine_LogBookEntrySection error', error)
            },
        },
    ) */

    /* const [getSectionFuel_LogBookEntrySection] = useLazyQuery(
        Fuel_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readFuel_LogBookEntrySections.nodes
                setFuel(data)
            },
            onError: (error: any) => {
                console.error('Fuel_LogBookEntrySection error', error)
            },
        },
    ) */
    /* const [getSectionPorts_LogBookEntrySection] = useLazyQuery(
        Ports_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readPorts_LogBookEntrySections.nodes
                setPorts(data)
            },
            onError: (error: any) => {
                console.error('Ports_LogBookEntrySection error', error)
            },
        },
    ) */
    /* const [getSectionVesselDailyCheck_LogBookEntrySection] = useLazyQuery(
        VesselDailyCheck_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readVesselDailyCheck_LogBookEntrySections.nodes
                setVesselDailyCheck(data)
            },
            onError: (error: any) => {
                console.error(
                    'VesselDailyCheck_LogBookEntrySection error',
                    error,
                )
            },
        },
    ) */
    /* const [getLogBookSignOff_LogBookEntrySection] = useLazyQuery(
        LogBookSignOff_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readLogBookSignOff_LogBookEntrySections.nodes
                setSignOff(data)
            },
            onError: (error: any) => {
                console.error('LogBookSignOff_LogBookEntrySection error', error)
            },
        },
    ) */
    /* const [getSectionVoyageSummary_LogBookEntrySection] = useLazyQuery(
        VoyageSummary_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readVoyageSummary_LogBookEntrySections.nodes
                setVoyageSummary(data)
            },
            onError: (error: any) => {
                console.error('VoyageSummary_LogBookEntrySection error', error)
            },
        },
    ) */
    /* const [getSectionTripReport_LogBookEntrySection] = useLazyQuery(
        TripReport_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readTripReport_LogBookEntrySections.nodes
                setTripReport(data)
                refreshVesselPosition(data)
            },
            onError: (error: any) => {
                console.error('TripReport_LogBookEntrySection error', error)
            },
        },
    ) */

    const refreshVesselPosition = async (data: any) => {
        var lat = 0,
            long = 0,
            locationID = 0
        data.forEach((item: any) => {
            if (
                (item.toLat != 0 && item.toLong != 0) ||
                item.toLocationID > 0
            ) {
                lat = item.toLat
                long = item.toLong
                locationID = item.toLocationID
            }
            if (
                (item.fromLat != 0 && item.fromLong != 0) ||
                item.fromLocationID > 0
            ) {
                lat = item.fromLat
                long = item.fromLong
                locationID = item.fromLocationID
            }
        })
        if ((lat != 0 && long != 0) || (locationID && +locationID > 0)) {
            if (vessel) {
                if (
                    vessel.vehiclePositions.nodes?.[0]?.lat != lat ||
                    vessel.vehiclePositions.nodes?.[0]?.long != long ||
                    vessel.vehiclePositions.nodes?.[0]?.geolocation?.id !=
                        locationID
                ) {
                    /* createVesselPosition({
                    variables: {
                        input: {
                            vehicleID: vessel.id,
                            lat: lat ? lat : null,
                            long: long ? long : null,
                            geoLocationID: locationID ? +locationID : null,
                        },
                    },
                }) */
                    const id = generateUniqueId()
                    let geoLocation = null
                    if (locationID) {
                        geoLocation = await geoLocationModel.getById(locationID)
                    }
                    const vehicle = await vesselModel.getById(vessel.id)
                    const data = {
                        id: `${id}`,
                        vehicleID: `${vessel.id}`,
                        vehicle: vehicle,
                        lat: lat ? lat : null,
                        long: long ? long : null,
                        geoLocationID: locationID ? `${locationID}` : null,
                        geoLocation: geoLocation,
                    }
                    await vehiclePositionModel.save(data)
                }
            }
        }
        // if (locationID && +locationID > 0) {
        //     if (
        //         vessel.vehiclePositions.nodes?.[0].lat != lat ||
        //         vessel.vehiclePositions.nodes?.[0].long != long ||
        //         vessel.vehiclePositions.nodes?.[0].geolocation.id != locationID
        //     ) {
        //         createVesselPosition({
        //             variables: {
        //                 input: {
        //                     vehicleID: vessel.id,
        //                     lat: lat ? lat : null,
        //                     long: long ? long : null,
        //                     geoLocationID: locationID ? +locationID : null,
        //                 },
        //             },
        //         })
        //     }
        // }
    }

    /* const [createVesselPosition] = useMutation(CREATE_VESSEL_POSITION, {
        onCompleted: (response: any) => {
            console.log('Logbook entry updated')
        },
        onError: (error: any) => {
            console.error('Logbook entry update error', error)
        },
    }) */

    /* const [getSectionCrewMembers_LogBookEntrySection] = useLazyQuery(
        CrewMembers_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                let data = response.readCrewMembers_LogBookEntrySections.nodes
                setCrewMembers(data)
            },
            onError: (error: any) => {
                console.error('CrewMembers_LogBookEntrySection error', error)
            },
        },
    ) */

    const handleSetCrewMembers = async (crewMembers: any) => {
        const crewMemberList = crewMembers.filter(
            (item: any) =>
                !logEntrySections
                    ?.filter(
                        (item: any) =>
                            item.className ===
                            'SeaLogs\\CrewMembers_LogBookEntrySection',
                    )
                    ?.flatMap((item: any) => +item.ids)
                    ?.includes(item),
        )
        if (crewMemberList && crewMemberList.length > 0) {
            // getCrewMembersFromOpenLogBook({
            //     variables: {
            //         ids: crewMemberList,
            //     },
            // })
        }
    }

    /* const [getCrewMembersFromOpenLogBook] = useLazyQuery(
        GetCrewMembersFromOpenLogBook,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                let data = response.readCrewMembers_LogBookEntrySections.nodes
                setCrewMembersList(
                    Array.from(
                        new Set(
                            data
                                .flatMap((item: any) => item.crewMember)
                                .flatMap((item: any) => +item.id),
                        ),
                    ),
                )
            },
            onError: (error: any) => {
                console.error('CrewMembers_LogBookEntrySection error', error)
            },
        },
    ) */

    // GetLogBookEntriesMembers(handleSetCrewMembers)

    /* const [getSectionCrewTraining_LogBookEntrySection] = useLazyQuery(
        CrewTraining_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readCrewTraining_LogBookEntrySections.nodes
                setCrewTraining(data)
            },
            onError: (error: any) => {
                console.error('CrewTraining_LogBookEntrySection error', error)
            },
        },
    ) */
    /* const [getSectionSupernumerary_LogBookEntrySection] = useLazyQuery(
        Supernumerary_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readSupernumerary_LogBookEntrySections.nodes
                setSupernumerary(data)
            },
            onError: (error: any) => {
                console.error('Supernumerary_LogBookEntrySection error', error)
            },
        },
    ) */
    /* const [getSectionEngineer_LogBookEntrySection] = useLazyQuery(
        Engineer_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readEngineer_LogBookEntrySections.nodes
                setEngineer(data)
            },
            onError: (error: any) => {
                console.error('Engineer_LogBookEntrySection error', error)
            },
        },
    ) */
    /* const [getSectionAssetReporting_LogBookEntrySection] = useLazyQuery(
        AssetReporting_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readAssetReporting_LogBookEntrySections.nodes
                setAssetReporting(data)
            },
            onError: (error: any) => {
                console.error('AssetReporting_LogBookEntrySection error', error)
            },
        },
    ) */

    /* const [getSectionCrewWelfare_LogBookEntrySection] = useLazyQuery(
        CrewWelfare_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readCrewWelfare_LogBookEntrySections.nodes
                setCrewWelfare(data)
            },
            onError: (error: any) => {
                console.error('CrewWelfare_LogBookEntrySection error', error)
            },
        },
    ) */

    /* const [queryLogBookConfig] = useLazyQuery(GET_LOGBOOK_CONFIG, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneCustomisedLogBookConfig
            if (data) {
                setLogBookConfig(data)
            }
        },
        onError: (error: any) => {
            console.error('queryLogBookConfig error', error)
        },
    }) */

    const handleSetLogbook = async (logbook: any) => {
        // if (logbook.logBook.id > 0) {
        if (+logbook.logBookID > 0) {
            const data = await clbcModel.getByCustomisedLogBookId(
                logbook.logBookID,
            )
            setLogBookConfig(data)
            /* queryLogBookConfig({
                variables: {
                    id: logbook.logBook.id,
                },
            }) */
        }
        setLogbook(logbook)
        setMasterID(logbook.masterID)
        logbook.state === 'Locked' ? setLocked(true) : setLocked(false)
        const sectionTypes = Array.from(
            new Set(
                logbook.logBookEntrySections.nodes.map(
                    (sec: any) => sec.className,
                ),
            ),
        ).map((type) => ({
            className: type,
            ids: logbook.logBookEntrySections.nodes
                .filter((sec: any) => sec.className === type)
                .map((sec: any) => sec.id),
        }))
        setLogEntrySections(sectionTypes)
        sectionTypes.forEach(async (section: any) => {
            if (section.className === 'SeaLogs\\Engine_LogBookEntrySection') {
                /* getSectionEngine_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                }) */
                const data = await engineModel.getByIds(section.ids)
                setEngine(data)
            }
            if (section.className === 'SeaLogs\\Fuel_LogBookEntrySection') {
                /* getSectionFuel_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                }) */
                const data = await fuelModel.getByIds(section.ids)
                setFuel(data)
            }
            if (section.className === 'SeaLogs\\Ports_LogBookEntrySection') {
                /* getSectionPorts_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                }) */
                const data = await portModel.getByIds(section.ids)
                setPorts(data)
            }
            if (
                section.className ===
                'SeaLogs\\VesselDailyCheck_LogBookEntrySection'
            ) {
                /* getSectionVesselDailyCheck_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                }) */
                const data = await vesselDailyCheckModel.getByIds(section.ids)
                setVesselDailyCheck(data)
            }
            if (
                section.className ===
                'SeaLogs\\LogBookSignOff_LogBookEntrySection'
            ) {
                /* getLogBookSignOff_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                }) */
                const data = await signOffModel.getByIds(section.ids)
                setSignOff(data)
            }

            if (
                section.className === 'SeaLogs\\CrewWelfare_LogBookEntrySection'
            ) {
                /* getSectionCrewWelfare_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                }) */
                const data = await crewWelfareModel.getByIds(section.ids)
                setCrewWelfare(data[0])
            }
            if (
                section.className ===
                'SeaLogs\\VoyageSummary_LogBookEntrySection'
            ) {
                /* getSectionVoyageSummary_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                }) */
                const data = await voyageSummaryModel.getByIds(section.ids)
                setVoyageSummary(data)
            }
            if (
                section.className === 'SeaLogs\\TripReport_LogBookEntrySection'
            ) {
                /* getSectionTripReport_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                }) */
                const data = await tripReportModel.getByIds(section.ids)
                setTripReport(data)
                refreshVesselPosition(data)
            }
            if (
                section.className === 'SeaLogs\\CrewMembers_LogBookEntrySection'
            ) {
                /* const searchFilter: SearchFilter = {}
                searchFilter.id = { in: section.ids }
                getSectionCrewMembers_LogBookEntrySection({
                    variables: {
                        filter: searchFilter,
                    },
                }) */
                const data = await cmlbsModel.getByIds(section.ids)
                setCrewMembers(data)
            }
            if (
                section.className ===
                'SeaLogs\\CrewTraining_LogBookEntrySection'
            ) {
                /* getSectionCrewTraining_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                }) */
                const data = await ctlbesModel.getByIds(section.ids)
                setCrewTraining(data)
            }
            if (
                section.className ===
                'SeaLogs\\Supernumerary_LogBookEntrySection'
            ) {
                /* getSectionSupernumerary_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                }) */
                const data = await supernumeraryModel.getByIds(section.ids)
                setSupernumerary(data)
            }
            if (section.className === 'SeaLogs\\Engineer_LogBookEntrySection') {
                /* getSectionEngineer_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                }) */
                const data = await elbesModel.getByIds(section.ids)
                setEngineer(data)
            }
            if (
                section.className ===
                'SeaLogs\\AssetReporting_LogBookEntrySection'
            ) {
                /* getSectionAssetReporting_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                }) */
                const data = await arlbesModel.getByIds(section.ids)
                setAssetReporting(data)
            }
        })
        setLoaded(true)
    }

    // const [queryLogBookEntry] = useLazyQuery(GET_LOGBOOK_ENTRY_BY_ID, {
    //     fetchPolicy: 'cache-and-network',
    //     onCompleted: (response: any) => {
    //         const data = response.readOneLogBookEntry
    //         if (data) {
    //             handleSetLogbook(data)
    //         }
    //     },
    //     onError: (error: any) => {
    //         console.error('queryLogBookEntry error', error)
    //     },
    // })

    const getLogBookEntryByID = async (id: number) => {
        const data = await logbookModel.getById(id)
        if (data) {
            handleSetLogbook(data)
        }
        /* queryLogBookEntry({
            variables: {
                logbookEntryId: +id,
            },
        }) */
    }

    // getVesselByID(vesselID, setVessel)
    const getVesselByID = async () => {
        // Get vessel
        const vessel = await vesselModel.getById(vesselID.toString())
        if (vessel) {
            setVessel(vessel)
        }
    }

    // getOneClient(setClient)
    const getOneClient = async () => {
        const c = await cModel.getById(localStorage.getItem('clientId') ?? 0)
        setClient(c)
    }

    // getSeaLogsMembersList(setCrew)
    const getSeaLogsMembersList = async () => {
        const crew = await slmModel.getAll()
        if (crew) {
            setCrew(crew)
        }
    }

    /* const [queryPrevSectionMemberComments] = useLazyQuery(
        GET_SECTION_MEMBER_COMMENTS,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readSectionMemberComments.nodes
                if (data) {
                    // Set previous comments
                    if (logbook.state !== 'Locked') {
                        setPrevComments(data)
                    }
                }
            },
            onError: (error: any) => {
                console.error('queryPrevSectionMemberComments error', error)
            },
        },
    ) */
    const handleSetPrevLogbooks = async (prevLogbooks: any) => {
        const sectionIDs = prevLogbooks.flatMap((prevLogbook: any) => {
            const sections = prevLogbook.logBookEntrySections.nodes.filter(
                (item: any) =>
                    item.className ===
                    'SeaLogs\\LogBookSignOff_LogBookEntrySection',
            )
            if (sections && sections.length > 0) {
                return sections.map((section: any) => section.id)
            }
        })
        /* await queryPrevSectionMemberComments({
            variables: {
                filter: {
                    logBookEntrySectionID: { in: sectionIDs },
                    hideComment: { eq: false },
                    commentType: { eq: 'Section' },
                    comment: { ne: null },
                },
            },
        }) */
        const data = await smcModel.getPreviousComments(sectionIDs)
        if (data) {
            // Set previous comments
            if (logbook.state !== 'Locked') {
                setPrevComments(data)
            }
        }
    }

    const changeTab = (tab: string) => () => {
        toast.remove()
        setTab(tab)
    }

    const sortedCrew = [
        ...(logbook?.vehicle?.seaLogsMembers?.nodes.filter(
            (vcrew: any) => !vcrew.archived,
        ) ?? []),
        ...(crew?.filter(
            (crew: any) =>
                !logbook?.vehicle?.seaLogsMembers?.nodes
                    .filter((vcrew: any) => !vcrew.archived)
                    .map((vcrew: any) => vcrew.id)
                    .includes(crew.id),
        ) ?? []),
    ]
    /* const [queryCrewTraining] = useLazyQuery<CrewTrainingConfig>(
        GET_CREW_TRAINING_CONFIG,
        {
            onCompleted: (response: any) => {
                const crewTrainingConfig = response.getCrewTraining
                const crewMembers = response.getCrewMember
                let crewMemberList: { value: any; label: string }[] = []

                if (crewMembers) {
                    crewMembers.data.map((crewMember: any, index: number) => {
                        crewMemberList.push({
                            value: crewMember.ID,
                            label: `${crewMember.FirstName ?? ''} ${crewMember.SurName ?? ''}`,
                        })
                    })
                }

                setCrewTrainingConfigData({
                    trainingTypes: crewTrainingConfig.data.trainingTypes,
                    trainers: crewTrainingConfig.data.trainers,
                    trainingLocation: crewTrainingConfig.data.trainingLocation,
                    crewMembers: crewMemberList,
                })
            },
            onError: (error: any) => {
                console.error(`Exception encountered @ ${error}`)
            },
        },
    ) */

    const date_params = {
        disable: false,
        startLabel: 'Start Date',
        endLabel: 'End Date',
        startDate: new Date(logbook?.startDate) ?? new Date(),
        endDate: logbook?.endDate ?? null,
        handleStartDateChange: false,
        handleEndDateChange: false,
        showOvernightCheckbox: false,
        showEndDate: logbook?.endDate ?? false,
        checked: false,
        handleShowEndDat: false,
    }

    const handleSetStartDate = async (date: any) => {
        setStartDate(date)
        /* updateLogbookEntry({
            variables: {
                input: {
                    id: logentryID,
                    startDate: date,
                },
            },
        }) */
        const data = await logbookModel.save({
            id: logbook.id,
            startDate: dayjs(date).format('YYYY-MM-DD'),
        })
        setLogbook(data)
    }

    const handleSetEndDate = async (date: any) => {
        setEndDate(date)
        /* updateLogbookEntry({
            variables: {
                input: {
                    id: logentryID,
                    endDate: date,
                },
            },
        }) */
        const data = await logbookModel.save({
            id: logbook.id,
            endDate: dayjs(date).format('YYYY-MM-DD'),
        })
        setLogbook(data)
    }

    /* const [updateLogbookEntry] = useMutation(UPDATE_LOGBOOK_ENTRY, {
        onCompleted: (response: any) => {
            console.log('Logbook entry updated')
        },
        onError: (error: any) => {
            console.error('Logbook entry update error', error)
        },
    }) */

    const handleSetMaster = async (master: any) => {
        setMaster(master)
        setMasterID(master.value)
        /* updateReloadLogbookEntry({
            variables: {
                input: {
                    id: logentryID,
                    masterID: master.value,
                },
            },
        }) */
        const member = await slmModel.getById(master.value)
        const data = await logbookModel.save({
            id: logbook.id,
            masterID: master.value,
            master: member,
        })
        setLogbook(data)
    }

    /* const [updateReloadLogbookEntry] = useMutation(UPDATE_LOGBOOK_ENTRY, {
        onCompleted: (response: any) => {
            console.log('Logbook entry updated')
            getLogBookEntryByID(logentryID)
        },
        onError: (error: any) => {
            console.error('Logbook entry update error', error)
        },
    }) */

    const [permissions, setPermissions] = useState<any>(false)
    const [edit_logBookEntry, setEdit_logBookEntry] = useState<any>(false)

    const init_permissions = () => {
        if (permissions) {
            if (
                hasPermission(
                    process.env.EDIT_LOGBOOKENTRY || 'EDIT_LOGBOOKENTRY',
                    permissions,
                )
            ) {
                setEdit_logBookEntry(true)
            } else {
                setEdit_logBookEntry(false)
            }
        }
    }

    useEffect(() => {
        setPermissions(getPermissions)
        init_permissions()
    }, [])

    useEffect(() => {
        init_permissions()
    }, [permissions])

    const releaseLockState = async () => {
        if (!edit_logBookEntry) {
            toast.error('You do not have permission to unlock this log entry')
            return
        }
        if (openLogEntries.length > 0) {
            toast.error(
                <div>
                    Please close log entry for{' '}
                    <Link
                        href={`/log-entries?vesselID=${vesselID}&logentryID=${openLogEntries[0].id}`}>
                        <span className="underline">
                            {formatDate(openLogEntries[0].startDate)}
                        </span>
                    </Link>{' '}
                    before unlocking.
                </div>,
            )
        } else {
            setLocked(false)
            /* updateLogbookEntry({
                variables: {
                    input: {
                        id: logentryID,
                        state: 'Reopened',
                    },
                },
            }) */
            const data = await logbookModel.save({
                id: logbook.id,
                state: 'Reopened',
            })
            setLogbook(data)
        }
    }

    const updateSignOff = async (signOff: any) => {
        /* getLogBookSignOff_LogBookEntrySection({
            variables: {
                id: [signOff.id],
            },
        }) */
        const data = await signOffModel.getByIds([signOff.id])
        setSignOff(data)
    }

    const updateTripReport = async (tripReportData: any) => {
        const data = await tripReportModel.getByIds(tripReportData.id)
        setTripReport(data)
        refreshVesselPosition(data)
        /* getSectionTripReport_LogBookEntrySection({
            variables: {
                id: tripReportData.id,
            },
        }) */
        if (tripReportData.key == 'dangerousGoodsChecklistID') {
            const updatedTripReport = tripReport.map((trip: any) => {
                if (trip.id == tripReportData.currentTripID) {
                    return {
                        ...trip,
                        dangerousGoodsChecklist: {
                            id: tripReportData.value,
                        },
                    }
                }
                return trip
            })
            setTripReport(updatedTripReport)
        }
        if (tripReportData.key == 'departTime') {
            const updatedTripReport = tripReport.map((trip: any) => {
                if (trip.id == tripReportData.currentTripID) {
                    return {
                        ...trip,
                        departTime: tripReportData.value,
                    }
                }
                return trip
            })
            setTripReport(updatedTripReport)
        }
        if (tripReportData.key == 'totalVehiclesCarried') {
            const updatedTripReport = tripReport.map((trip: any) => {
                if (trip.id == tripReportData.currentTripID) {
                    return {
                        ...trip,
                        totalVehiclesCarried: tripReportData.value,
                    }
                }
                return trip
            })
            setTripReport(updatedTripReport)
        }
        if (tripReportData.key == 'arriveTime') {
            const updatedTripReport = tripReport.map((trip: any) => {
                if (trip.id == tripReportData.currentTripID) {
                    return {
                        ...trip,
                        arriveTime: tripReportData.value,
                    }
                }
                return trip
            })
            setTripReport(updatedTripReport)
        }
        if (tripReportData.key == 'arrive') {
            const updatedTripReport = tripReport.map((trip: any) => {
                if (trip.id == tripReportData.currentTripID) {
                    return {
                        ...trip,
                        arrive: tripReportData.value,
                    }
                }
                return trip
            })
            setTripReport(updatedTripReport)
        }
        if (tripReportData.key == 'pob') {
            const updatedTripReport = tripReport.map((trip: any) => {
                if (trip.id == tripReportData.currentTripID) {
                    return {
                        ...trip,
                        pob: tripReportData.value,
                    }
                }
                return trip
            })
            setTripReport(updatedTripReport)
        }
        if (tripReportData.key == 'comment') {
            const updatedTripReport = tripReport.map((trip: any) => {
                if (trip.id == tripReportData.currentTripID) {
                    return {
                        ...trip,
                        comment: tripReportData.value,
                    }
                }
                return trip
            })
            setTripReport(updatedTripReport)
        }
        if (tripReportData.key == 'fromLocationID') {
            const fromLocation = await geoLocationModel.getById(
                tripReportData.value,
            )
            const updatedTripReport = tripReport.map((trip: any) => {
                if (trip.id == tripReportData.currentTripID) {
                    return {
                        ...trip,
                        fromLocationID: tripReportData.value,
                        fromLocation: fromLocation,
                    }
                }
                return trip
            })
            setTripReport(updatedTripReport)
        }
        if (tripReportData.key == 'fromLocation') {
            const updatedTripReport = tripReport.map((trip: any) => {
                if (trip.id == tripReportData.currentTripID) {
                    return {
                        ...trip,
                        fromLat: tripReportData.latitude,
                        fromLong: tripReportData.longitude,
                        fromLocationID: 0,
                    }
                }
                return trip
            })
            setTripReport(updatedTripReport)
        }
        if (tripReportData.key == 'toLocationID') {
            const toLocation = await geoLocationModel.getById(
                tripReportData.value,
            )
            const updatedTripReport = tripReport.map((trip: any) => {
                if (trip.id == tripReportData.currentTripID) {
                    return {
                        ...trip,
                        toLocationID: tripReportData.value,
                        toLocation: toLocation,
                    }
                }
                return trip
            })
            setTripReport(updatedTripReport)
        }
        if (tripReportData.key == 'toLocation') {
            const updatedTripReport = tripReport.map((trip: any) => {
                if (trip.id == tripReportData.currentTripID) {
                    return {
                        ...trip,
                        toLat: tripReportData.latitude,
                        toLong: tripReportData.longitude,
                        toLocationID: 0,
                    }
                }
                return trip
            })
            setTripReport(updatedTripReport)
        }
    }

    const updateFuel = async (fuel: any) => {
        /* getSectionFuel_LogBookEntrySection({
            variables: {
                id: [fuel.id],
            },
        }) */
        const data = await fuelModel.getByIds([fuel.id])
        setFuel(data)
    }

    const updateCrewWelfare = async (crewWelfare: any) => {
        /* getSectionCrewWelfare_LogBookEntrySection({
            variables: {
                id: [crewWelfare.id],
            },
        }) */
        const data = await crewWelfareModel.getById(crewWelfare.id)
        setCrewWelfare(data)
    }

    /* const [updateSectionMemberComment] = useMutation(
        UPDATE_SECTION_MEMBER_COMMENT,
        {
            onCompleted: (response: any) => {},
            onError: (error: any) => {
                console.error('Section member comment update error', error)
            },
        },
    ) */
    const getLogBookEntriesMembers = async () => {
        let logbooks = await logbookModel.getAll()
        // Filter by state is Editing or Reopened and
        logbooks = logbooks.filter((logbook: any) => {
            return (
                (logbook.state == 'Editing' || logbook.state == 'Reopened') &&
                logbook.vehicleID > 0
            )
        })
        logbooks = logbooks.map((logbook: any) => {
            return {
                ...logbook,
                logBookEntrySections: {
                    nodes: logbook.logBookEntrySections.nodes.filter(
                        (section: any) =>
                            section.logBookComponentClass?.includes(
                                'CrewMembers_LogBookComponent',
                            ),
                    ),
                },
            }
        })
        // const data = response.readLogBookEntries
        if (logbooks) {
            const crewMembers = logbooks
                .flatMap((entry: any) => entry.logBookEntrySections.nodes)
                .flatMap((section: any) => section.id)
            handleSetCrewMembers(crewMembers)
        }
    }

    const getVesselList = async () => {
        const response = await vesselModel.getAll()
        setVessels(response)
    }
    useEffect(() => {
        getVesselByID()
        getVesselList()
        getLogBookEntries()
        getLogBookEntryByID(logentryID)
        getOneClient()
        getSeaLogsMembersList()
        // GetLogBookEntriesMembers(handleSetCrewMembers)
        getLogBookEntriesMembers()
    }, [])

    useEffect(() => {
        if (isLoading) {
            setImCrew(isCrew())
            setIsLoading(false)
        }
    }, [isLoading])

    //const hash = window.location.hash.substring(1)
    //const params = new URLSearchParams(hash)

    useEffect(() => {
        //const firstTab = params.get('firstTab')
        let commentTab = '' + firstTab

        if (firstTab != 0 && commentTab != 'crew') {
            setTab(commentTab)
        }
    }, [])

    const displayField = (fieldName: string) => {
        const weather =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'Weather_LogBookComponent',
            )
        if (weather?.length > 0) {
            if (weather[0]?.active) {
                return true
            }
        }
        return false
    }

    return (
        <div className="w-full pb-16">
            <div className="flex flex-col-reverse flex-wrap sm:flex-nowrap sm:flex-row gap-3 justify-between sm:items-center items-start">
                <Heading className="font-light md:text-3xl sm:text-2xl text-xl">
                    <span className="font-medium">Logbook:</span>{' '}
                    {vessel && vessel?.title}
                </Heading>
                <SeaLogsButton
                    text="Back to Vessel"
                    type="text"
                    className="hover:text-sllightblue-1000 ms-auto hidden sm:inline-flex"
                    icon="back_arrow"
                    color="slblue"
                    action={() => router.back()}
                />
            </div>
            <hr className="mb-4" />
            <div className="block sm:hidden">
                <SeaLogsButton
                    text="Back to Vessel"
                    type="text"
                    className="hover:text-sllightblue-1000 ms-auto"
                    icon="back_arrow"
                    color="slblue"
                    action={() => router.back()}
                />
            </div>

            <div
                className={`flex flex-col justify-start gap-2 ${locked ? 'pointer-events-none' : ''}`}>
                {logbook && (
                    <>
                        <LogDate
                            log_params={date_params}
                            setStartDate={handleSetStartDate}
                            setEndDate={handleSetEndDate}
                            edit_logBookEntry={edit_logBookEntry}
                        />
                        <MasterList
                            offline
                            master={logbook?.master ?? {}}
                            masterTerm={client?.masterTerm ?? 'Master'}
                            setMaster={handleSetMaster}
                            crewMembers={crewMembers}
                            edit_logBookEntry={edit_logBookEntry}
                        />
                    </>
                )}
                {locked && (
                    <div className="flex flex-col items-start gap-2 p-2 bg-slneon-100 text-slgreen-1000 rounded">
                        <div className="flex items-center gap-2">
                            <span className="">Completed </span>
                            <span className="block">
                                {logbook?.lockedDate
                                    ? formatDate(logbook?.lockedDate)
                                    : ''}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* This is commented out until we have that only admin can unlock a log entry and because we don't ahve PDF working.
            Once we do we can uncomment and make work. Dan 11 Setpember 2024 */}

            <div className="px-4 flex lg:justify-end md:justify-end flex-col lg:flex-row md:flex-row items-center gap-4">
                {/* {loaded && locked && !imCrew && isAdmin() && (
                    <Button
                        className="lg:w-48 md:w-48 w-full text-sm font-semibold text-white bg-sky-700 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                        onPress={releaseLockState}>
                        Unlock
                    </Button>
                )} */}
                <Link
                    href={`/log-entries/pdf?vesselID=${vesselID}&logentryID=${logentryID}&pdf`}>
                    <Button className="lg:w-48 md:w-48 w-full text-sm font-semibold text-white bg-slblue-800 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-slblue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sllightblue-1000">
                        PDF
                    </Button>
                </Link>
            </div>
            <div className="my-4">
                <OpenPreviousLogbookComments
                    prevComments={prevComments}
                    onDismiss={(coms: any) => {
                        setPrevComments(coms)
                    }}
                    onDismissAll={() => setPrevComments([])}
                />
            </div>
            <div className="my-4 md:flex flex-nowrap md:justify-between flex-column sm:flex-row items-between sm:items-center  w-full">
                <div className={classes.tabsHolder}>
                    <ul className={classes.tabsUl}>
                        <li className={classes.tabsUlLi} id="crew">
                            <Button
                                className={`${tab === 'crew' ? classes.active : classes.inactive}`}
                                onPress={
                                    tab === 'crew'
                                        ? changeTab('')
                                        : changeTab('crew')
                                }>
                                Crew
                            </Button>
                            {tab === 'crew' && (
                                <div className="lg:hidden">
                                    {crew && loaded && (
                                        <div className="block my-4 overflow-x-auto overflow-y-auto">
                                            <Crew
                                                offline
                                                crewSections={crewMembers}
                                                allCrew={sortedCrew}
                                                logBookEntryID={logentryID}
                                                locked={locked}
                                                logBookConfig={logBookConfig}
                                                setCrewMembers={setCrewMembers}
                                                crewWelfareCheck={crewWelfare}
                                                updateCrewWelfare={
                                                    updateCrewWelfare
                                                }
                                                vessel={vessel}
                                                masterID={masterID}
                                                logEntrySections={
                                                    logEntrySections
                                                }
                                                crewMembersList={
                                                    crewMembersList
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                        {logBookConfig && (
                            <li
                                className={`w-full md:w-auto`}
                                id="Pre-departure_checks">
                                <Button
                                    className={`${tab === 'dailyChecks' ? classes.active : classes.inactive}`}
                                    onPress={
                                        tab === 'dailyChecks'
                                            ? changeTab('')
                                            : changeTab('dailyChecks')
                                    }>
                                    Pre-departure checks
                                </Button>
                                {logBookConfig && tab === 'dailyChecks' && (
                                    <div className="lg:hidden">
                                        <DailyChecks
                                            offline
                                            vesselDailyCheck={vesselDailyCheck}
                                            logBookConfig={logBookConfig}
                                            setVesselDailyCheck={
                                                setVesselDailyCheck
                                            }
                                            locked={locked}
                                            edit_logBookEntry={
                                                edit_logBookEntry
                                            }
                                        />
                                    </div>
                                )}
                            </li>
                        )}
                        {displayField('Weather') && (
                            <li className={classes.tabsUlLi} id="Weather">
                                <Button
                                    className={`${tab === 'weather' ? classes.active : classes.inactive}`}
                                    onPress={
                                        tab === 'weather'
                                            ? changeTab('')
                                            : changeTab('weather')
                                    }>
                                    Weather
                                </Button>
                                {logBookConfig && tab === 'weather' && (
                                    <div className="lg:hidden">
                                        <LogBookWeather
                                            offline
                                            logBookConfig={logBookConfig}
                                            logbook={logbook}
                                        />
                                    </div>
                                )}
                            </li>
                        )}
                        {logBookConfig && (
                            <li className={`w-full md:w-auto`} id="Trip-Log">
                                <Button
                                    className={`${tab === 'tripLog' ? classes.active : classes.inactive}`}
                                    onPress={
                                        tab === 'tripLog'
                                            ? changeTab('')
                                            : changeTab('tripLog')
                                    }>
                                    Trip Log
                                </Button>
                                {logBookConfig && tab === 'tripLog' && (
                                    <div className="lg:hidden">
                                        <TripLog
                                            offline
                                            tripReport={tripReport}
                                            logBookConfig={logBookConfig}
                                            updateTripReport={updateTripReport}
                                            locked={
                                                locked || !edit_logBookEntry
                                            }
                                            crewMembers={crewMembers}
                                            masterID={masterID}
                                            setTab={setTab}
                                            createdTab={createdTab}
                                            setCreatedTab={setCreatedTab}
                                            currentTrip={currentTrip}
                                            setCurrentTrip={setCurrentTrip}
                                            vessels={vessels}
                                        />
                                    </div>
                                )}
                            </li>
                        )}
                        {logBookConfig && !imCrew && (
                            <li
                                className={classes.tabsUlLi}
                                id="Complete_logbook">
                                <Button
                                    className={`${tab === 'signOff' ? classes.active : classes.inactive}`}
                                    onPress={
                                        tab === 'signOff'
                                            ? changeTab('')
                                            : changeTab('signOff')
                                    }>
                                    Complete logbook
                                </Button>
                                {logBookConfig && tab === 'signOff' && (
                                    <div className="lg:hidden">
                                        <LogEntrySignOff
                                            offline
                                            logBookConfig={logBookConfig}
                                            signOff={
                                                signOff ? signOff[0] : false
                                            }
                                            updateSignOff={updateSignOff}
                                            fuel={fuel}
                                            locked={
                                                locked || !edit_logBookEntry
                                            }
                                            crewMembers={crewMembers}
                                            vessel={vessel}
                                            logBook={logbook}
                                            masterTerm={
                                                client?.masterTerm ?? 'Master'
                                            }
                                            prevComments={prevComments}
                                            onUpdatePrevComments={(
                                                coms: any,
                                            ) => {
                                                setPrevComments(coms)
                                            }}
                                            screen="Mobile"
                                        />
                                    </div>
                                )}
                            </li>
                        )}
                    </ul>
                </div>
            </div>
            {tab === 'crew' && (
                <div className="hidden lg:block">
                    {crew && loaded && (
                        <div className="block overflow-x-visible overflow-y-visible">
                            <Crew
                                offline
                                crewSections={crewMembers}
                                allCrew={sortedCrew}
                                logBookEntryID={logentryID}
                                locked={locked}
                                logBookConfig={logBookConfig}
                                setCrewMembers={setCrewMembers}
                                crewWelfareCheck={crewWelfare}
                                updateCrewWelfare={updateCrewWelfare}
                                vessel={vessel}
                                masterID={masterID}
                                logEntrySections={logEntrySections}
                                crewMembersList={crewMembersList}
                            />
                        </div>
                    )}
                </div>
            )}
            {tab === 'tripLog' && (
                <div className="hidden lg:block">
                    {loaded && logbook ? (
                        <TripLog
                            offline
                            tripReport={tripReport}
                            logBookConfig={logBookConfig}
                            updateTripReport={updateTripReport}
                            locked={locked || !edit_logBookEntry}
                            crewMembers={crewMembers}
                            masterID={masterID}
                            setTab={setTab}
                            createdTab={createdTab}
                            setCreatedTab={setCreatedTab}
                            currentTrip={currentTrip}
                            setCurrentTrip={setCurrentTrip}
                            vessels={vessels}
                        />
                    ) : (
                        <></>
                    )}
                </div>
            )}
            {tab === 'engineLog' && (
                <div>
                    <div className="hidden lg:block">
                        {/* {loaded && engine ? (
                            <>
                                {engine.map((engine: any) => (
                                    <EngineLogs
                                        logEntry={engine}
                                        locked={locked}
                                    />
                                ))}
                            </>
                        ) : (
                            <></>
                        )} */}
                        {/* TODO: create skeleton. */}
                        {loaded && logbook ? (
                            <EngineChecks
                                engine={engine}
                                engineer={engineer}
                                fuel={fuel}
                                logBookConfig={logBookConfig}
                                updateFuel={updateFuel}
                                locked={locked || !edit_logBookEntry}
                                logEntrySections={logEntrySections}
                                logBookEntryID={logentryID}
                            />
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
            )}
            {tab === 'compengineLog' && (
                <div>
                    <div className="grid grid-cols-1 items-center dark:text-white">
                        {loaded && logbook ? (
                            <ComprehensiveEngineLogs
                                logbookSection={
                                    logbook.logBookEntrySections.nodes
                                }
                            />
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
            )}
            {tab === 'supernumerary' && (
                <div className="hidden lg:block">
                    <CrewSupernumerary
                        logBookConfig={logBookConfig}
                        supernumerary={supernumerary}
                        setSupernumerary={setSupernumerary}
                        locked={locked || !edit_logBookEntry}
                    />
                </div>
            )}
            {logBookConfig && tab === 'dailyChecks' && (
                <div className="hidden lg:block">
                    <DailyChecks
                        offline
                        vesselDailyCheck={vesselDailyCheck}
                        logBookConfig={logBookConfig}
                        setVesselDailyCheck={setVesselDailyCheck}
                        locked={locked || !edit_logBookEntry}
                        edit_logBookEntry={edit_logBookEntry}
                    />
                </div>
            )}
            {logBookConfig && tab === 'weather' && (
                <div className="hidden lg:block">
                    <LogBookWeather
                        offline
                        logBookConfig={logBookConfig}
                        logbook={logbook}
                    />
                </div>
            )}
            {logBookConfig && tab === 'signOff' && (
                <div className="hidden lg:block">
                    <LogEntrySignOff
                        offline
                        logBookConfig={logBookConfig}
                        signOff={signOff ? signOff[0] : false}
                        updateSignOff={updateSignOff}
                        fuel={fuel}
                        locked={locked || !edit_logBookEntry}
                        crewMembers={crewMembers}
                        vessel={vessel}
                        logBook={logbook}
                        masterTerm={client?.masterTerm ?? 'Master'}
                        prevComments={prevComments}
                        onUpdatePrevComments={(coms: any) => {
                            setPrevComments(coms)
                        }}
                        screen="Desktop"
                    />
                </div>
            )}

            <Toaster position="top-right" />
        </div>
    )
}
