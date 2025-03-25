'use client'

import DepartTime from './depart-time'
import DepartLocation from './depart-location'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
    CreateTripReport_LogBookEntrySection,
    UpdateTripReport_LogBookEntrySection,
} from '@/app/lib/graphQL/mutation'
import { GET_GEO_LOCATIONS, GET_EVENT_TYPES } from '@/app/lib/graphQL/query'
import { useMutation } from '@apollo/client'
import { PopoverWrapper, SeaLogsButton } from '@/app/components/Components'
import { Button, DialogTrigger, Label, Popover } from 'react-aria-components'
import { useLazyQuery } from '@apollo/client'
import Events from './events'
import POB from './trip-log-pob'
import { getOneClient, getVesselByID } from '@/app/lib/actions'
import ExpectedDestination from './expected-location'
import ExpectedArrival from './exp-arrival-time'
import ActualArrival from './actual-arrival-time'
import TripComments from './components/trip-comments'
import VOB from './trip-log-vob'
import { classes } from '@/app/components/GlobalClasses'
import DGR from './trip-log-dgr'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import ClientModel from '@/app/offline/models/client'
import VesselModel from '@/app/offline/models/vessel'
import GeoLocationModel from '@/app/offline/models/geoLocation'
import EventTypeModel from '@/app/offline/models/eventType'
import TripReport_LogBookEntrySectionModel from '@/app/offline/models/tripReport_LogBookEntrySection'
import { generateUniqueId } from '@/app/offline/helpers/functions'

export default function TripLog({
    tripReport = false,
    logBookConfig,
    updateTripReport,
    locked,
    crewMembers,
    masterID,
    setTab,
    createdTab = false,
    setCreatedTab,
    currentTrip = false,
    setCurrentTrip,
    vessels,
    offline = false,
}: {
    tripReport: any
    logBookConfig: any
    updateTripReport: any
    locked: boolean
    crewMembers: any
    masterID: any
    setTab: any
    createdTab: any
    setCreatedTab: any
    currentTrip: any
    setCurrentTrip: any
    vessels: any
    offline?: boolean
}) {
    // const router = useRouter()
    const searchParams = useSearchParams()
    const logentryID = searchParams.get('logentryID') ?? 0
    const vesselID = searchParams.get('vesselID') ?? 0
    const [locations, setLocations] = useState<any>(false)
    const [eventTypes, setEventTypes] = useState<any>(false)
    const [openTripModal, setOpenTripModal] = useState(false)
    const [bufferTripID, setBufferTripID] = useState(0)
    const [vessel, setVessel] = useState<any>(false)
    const [selectedTab, setSelectedTab] = useState<any>(false)
    const [selectedDGR, setSelectedDGR] = useState<any>(0)
    const [openRiskAnalysis, setOpenTripStartRiskAnalysis] = useState(false)
    const [displayDangerousGoods, setDisplayDangerousGoods] = useState(false)
    const [displayDangerousGoodsSailing, setDisplayDangerousGoodsSailing] =
        useState(false)
    const [displayDangerousGoodsPvpd, setDisplayDangerousGoodsPvpd] =
        useState(false)
    const [
        displayDangerousGoodsPvpdSailing,
        setDisplayDangerousGoodsPvpdSailing,
    ] = useState<boolean | null>(null)
    // const [openEventModal, setOpenEventModal] = useState(false)
    // const [selectedRowdgr, setSelectedRowdgr] = useState<any>(false)
    const [tripReport_Stops, setTripReport_Stops] = useState<any>(false)
    const [selectedDGRPVPD, setSelectedDGRPVPD] = useState<any>(0)
    const [allPVPDDangerousGoods, setAllPVPDDangerousGoods] =
        useState<any>(false)
    const [selectedRowEvent, setSelectedRowEvent] = useState<any>(0)
    const [riskBufferEvDgr, setRiskBufferEvDgr] = useState<any>(false)
    const [allDangerousGoods, setAllDangerousGoods] = useState<any>(false)
    const [currentEventTypeEvent, setCurrentEventTypeEvent] =
        useState<any>(false)
    const [currentStopEvent, setCurrentStopEvent] = useState<any>(false)
    const [client, setClient] = useState<any>()
    if (!offline) {
        getOneClient(setClient)
    }
    const [comment, setComment] = useState<string>(
        tripReport
            ? tripReport?.find((trip: any) => trip.id === currentTrip.id)
                  ?.comment
            : '',
    )

    const [permissions, setPermissions] = useState<any>(false)
    const [edit_tripReport, setEdit_tripReport] = useState<any>(false)

    const clientModel = new ClientModel()
    const vesselModel = new VesselModel()
    const geoLocationModel = new GeoLocationModel()
    const eventTypeModel = new EventTypeModel()
    const tripReportModel = new TripReport_LogBookEntrySectionModel()
    const init_permissions = () => {
        if (permissions) {
            if (hasPermission('EDIT_LOGBOOKENTRY_TRIPREPORT', permissions)) {
                setEdit_tripReport(true)
            } else {
                setEdit_tripReport(false)
            }
        }
    }

    const offlineLoad = async () => {
        const locations = await geoLocationModel.getAll()
        setLocations(locations)
        const types = await eventTypeModel.getAll()
        setEventTypes(types)
    }
    useEffect(() => {
        setPermissions(getPermissions)
        if (!locations) {
            if (offline) {
                offlineLoad()
            } else {
                loadLocations()
                loadEventTypes()
            }
        }
    }, [])

    useEffect(() => {
        init_permissions()
    }, [permissions])

    useEffect(() => {
        if (createdTab) {
            setSelectedTab(createdTab)
        }
    }, [createdTab])

    if (!offline) {
        getVesselByID(+vesselID, setVessel)
    }

    useEffect(() => {
        if (tripReport && currentTrip) {
            const trip = tripReport.find(
                (trip: any) => trip.id === currentTrip.id,
            )
            setCurrentTrip(trip)
        }
        if (tripReport && bufferTripID > 0) {
            const trip = tripReport.find(
                (trip: any) => trip.id === bufferTripID,
            )
            setCurrentTrip(trip)
            setBufferTripID(0)
        }
    }, [tripReport])

    const [loadLocations] = useLazyQuery(GET_GEO_LOCATIONS, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            setLocations(response.readGeoLocations.nodes)
        },
        onError: (error) => {
            console.error('Error loading locations', error)
        },
    })

    const [loadEventTypes] = useLazyQuery(GET_EVENT_TYPES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            setEventTypes(response.readEventTypes.nodes)
        },
        onError: (error) => {
            console.error('Error loading activity types', error)
        },
    })

    const [createTripReport_LogBookEntrySection] = useMutation(
        CreateTripReport_LogBookEntrySection,
        {
            onCompleted: (response) => {
                const data = response.createTripReport_LogBookEntrySection
                if (tripReport) {
                    updateTripReport({
                        id: [
                            ...tripReport.map((trip: any) => trip.id),
                            data.id,
                        ],
                    })
                } else {
                    updateTripReport({
                        id: [data.id],
                    })
                }
                setCreatedTab(data.id)
                setBufferTripID(data.id)
            },
            onError: (error) => {
                console.error('Error creating trip report', error)
            },
        },
    )
    const [updateTripReport_LogBookEntrySection] = useMutation(
        UpdateTripReport_LogBookEntrySection,
        {
            onCompleted: (response) => {
                const data = response.updateTripReport_LogBookEntrySection
                if (tripReport) {
                    updateTripReport({
                        id: [
                            ...tripReport.map((trip: any) => trip.id),
                            data.id,
                        ],
                        currentTripID: currentTrip.id,
                        key: 'comment',
                        value: comment,
                    })
                } else {
                    updateTripReport({
                        id: [data.id],
                        currentTripID: currentTrip.id,
                        key: 'comment',
                        value: comment,
                    })
                }
                setBufferTripID(data.id)
            },
            onError: (error) => {
                console.error('Error creating trip report', error)
            },
        },
    )
    const handleAddTrip = async () => {
        if (!edit_tripReport) {
            toast.error('You do not have permission to add a trip')
            return
        }
        setOpenTripModal(true)
        setCurrentTrip(false)
        if (offline) {
            const data = await tripReportModel.save({
                id: generateUniqueId(),
                logBookEntryID: logentryID,
            })
            if (tripReport) {
                updateTripReport({
                    id: [...tripReport.map((trip: any) => trip.id), data.id],
                })
            } else {
                updateTripReport({
                    id: [data.id],
                })
            }
            setCreatedTab(data.id)
            setBufferTripID(data.id)
        } else {
            createTripReport_LogBookEntrySection({
                variables: {
                    input: {
                        logBookEntryID: logentryID,
                    },
                },
            })
        }
        setRiskBufferEvDgr(false)
        setOpenTripStartRiskAnalysis(false)
        setAllDangerousGoods(false)
        setCurrentStopEvent(false)
        setCurrentEventTypeEvent(false)
        setSelectedRowEvent(false)
        setDisplayDangerousGoods(false)
        setDisplayDangerousGoodsSailing(false)
        setDisplayDangerousGoodsPvpd(false)
        setDisplayDangerousGoodsPvpdSailing(null)
        setAllPVPDDangerousGoods(false)
        setSelectedDGRPVPD(false)
        setTripReport_Stops(false)
    }

    const handleEditTrip = (trip: any) => {
        setCurrentTrip(trip)
        setOpenTripModal(true)
    }

    const handleSave = async () => {
        setOpenTripModal(false)
        setCurrentTrip(false)
        if (offline) {
            // updateTripReport_LogBookEntrySection
            const data = await tripReportModel.save({
                id: currentTrip.id,
                comment: comment || null,
            })
            if (tripReport) {
                updateTripReport({
                    id: [...tripReport.map((trip: any) => trip.id), data.id],
                    currentTripID: currentTrip.id,
                    key: 'comment',
                    value: comment,
                })
            } else {
                updateTripReport({
                    id: [data.id],
                    currentTripID: currentTrip.id,
                    key: 'comment',
                    value: comment,
                })
            }
            setBufferTripID(data.id)
        } else {
            updateTripReport_LogBookEntrySection({
                variables: {
                    input: {
                        id: currentTrip.id,
                        comment: comment || null,
                    },
                },
            })
        }
    }

    const displayFieldTripLog = (fieldName: string) => {
        const dailyChecks =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'TripReport_LogBookComponent',
            )
        if (
            dailyChecks?.length > 0 &&
            dailyChecks[0]?.customisedComponentFields?.nodes.filter(
                (field: any) =>
                    field.fieldName === fieldName && field.status !== 'Off',
            ).length > 0
        ) {
            return true
        }
        return false
    }

    const displayField = (fieldName: string) => {
        const dailyChecks =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'EventType_LogBookComponent',
            )
        if (
            dailyChecks?.length > 0 &&
            dailyChecks[0]?.customisedComponentFields?.nodes.filter(
                (field: any) =>
                    field.fieldName === fieldName && field.status !== 'Off',
            ).length > 0
        ) {
            return true
        }
        return false
    }

    const convertTimeFormat = (time: string) => {
        if (time === null || time === undefined) return ''
        const [hours, minutes, seconds] = time.split(':')
        return `${hours}:${minutes}`
    }

    const handleCancel = () => {
        setOpenTripModal(false)
        setCurrentTrip(false)
    }

    const deleteTripLog = () => {
        setOpenTripModal(false)
        setCurrentTrip(false)
    }

    const refreshTripReport = () => {
        updateTripReport({
            id: tripReport.map((trip: any) => trip.id),
        })
    }

    const initOffline = async () => {
        // getOneClient
        const client = await clientModel.getById(
            localStorage.getItem('clientId') ?? 0,
        )
        setClient(client)
        // getVesselByID(+vesselID, setVessel)
        const vessel = await vesselModel.getById(vesselID)
        setVessel(vessel)
    }
    useEffect(() => {
        if (offline) {
            initOffline()
        }
    }, [offline])
    return (
        <div className="px-2 my-4 flex flex-col gap-2">
            {/*!isWriteMode && ( */}
            <p className={classes.helpText}>
                This section covers the logbook entry. This can be made up of a
                single trip or many over the course of the voyage.
            </p>
            <div className="flex flex-col">
                <div className="w-full overflow-visible">
                    {tripReport ? (
                        <>
                            {tripReport
                                .filter((trip: any) => !trip?.archived)
                                .map((trip: any, index: number) => (
                                    <div key={'triplog-' + index}>
                                        <div
                                            key={`${trip.id}-header`}
                                            onClick={() => {
                                                if (
                                                    selectedTab === trip.id &&
                                                    openTripModal
                                                ) {
                                                    refreshTripReport()
                                                    setSelectedTab(0)
                                                } else {
                                                    setSelectedTab(trip.id)
                                                    setDisplayDangerousGoods(
                                                        trip?.enableDGR ===
                                                            true,
                                                    )
                                                    setDisplayDangerousGoodsSailing(
                                                        trip?.designatedDangerousGoodsSailing ===
                                                            true,
                                                    )
                                                }
                                                if (
                                                    openTripModal &&
                                                    currentTrip.id === trip.id
                                                ) {
                                                    setOpenTripModal(false)
                                                    setCurrentTrip(false)
                                                    return
                                                }
                                                setOpenTripModal(true)
                                                setCurrentTrip(trip)
                                                setRiskBufferEvDgr(
                                                    trip?.dangerousGoodsChecklist,
                                                )
                                                setOpenTripStartRiskAnalysis(
                                                    false,
                                                )
                                                setAllDangerousGoods(false)
                                                setCurrentStopEvent(false)
                                                setCurrentEventTypeEvent(false)
                                                setSelectedRowEvent(false)
                                                setDisplayDangerousGoodsPvpd(
                                                    false,
                                                )
                                                setDisplayDangerousGoodsPvpdSailing(
                                                    null,
                                                )
                                                setAllPVPDDangerousGoods(false)
                                                setSelectedDGRPVPD(false)
                                                setTripReport_Stops(false)
                                            }}
                                            className={`flex flex-row p-4 text-left rounded-md my-4 bg-sllightblue-100 group border border-sllightblue-200 dark:border-slblue-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90 items-baseline`}>
                                            <Button
                                                className={`${locked || !edit_tripReport ? 'pointer-events-none' : ''}  group-hover:text-sllightblue-1000 dark:group-hover:text-slblue-200 text-left`}
                                                onPress={() => {
                                                    if (
                                                        selectedTab ===
                                                            trip.id &&
                                                        openTripModal
                                                    ) {
                                                        refreshTripReport()
                                                        setSelectedTab(0)
                                                    } else {
                                                        setSelectedTab(trip.id)
                                                        setDisplayDangerousGoods(
                                                            trip?.enableDGR ===
                                                                true,
                                                        )
                                                        setDisplayDangerousGoodsSailing(
                                                            trip?.designatedDangerousGoodsSailing ===
                                                                true,
                                                        )
                                                    }
                                                    if (
                                                        openTripModal &&
                                                        currentTrip.id ===
                                                            trip.id
                                                    ) {
                                                        setOpenTripModal(false)
                                                        setCurrentTrip(false)
                                                        return
                                                    }
                                                    setOpenTripModal(true)
                                                    setCurrentTrip(trip)
                                                    setRiskBufferEvDgr(
                                                        trip?.dangerousGoodsChecklist,
                                                    )
                                                    setOpenTripStartRiskAnalysis(
                                                        false,
                                                    )
                                                    setAllDangerousGoods(false)
                                                    setCurrentStopEvent(false)
                                                    setCurrentEventTypeEvent(
                                                        false,
                                                    )
                                                    setSelectedRowEvent(false)
                                                    setDisplayDangerousGoodsPvpd(
                                                        false,
                                                    )
                                                    setDisplayDangerousGoodsPvpdSailing(
                                                        null,
                                                    )
                                                    setAllPVPDDangerousGoods(
                                                        false,
                                                    )
                                                    setSelectedDGRPVPD(false)
                                                    setTripReport_Stops(false)
                                                }}>
                                                {trip?.departTime
                                                    ? convertTimeFormat(
                                                          trip?.departTime,
                                                      )
                                                    : 'No depart time'}
                                                <span>&nbsp;</span>
                                                {trip?.fromLocation?.title}
                                                {trip?.fromLocation?.title &&
                                                trip?.toLocation?.title
                                                    ? ' - '
                                                    : ''}
                                                <span>&nbsp;</span>
                                                {trip?.arrive
                                                    ? convertTimeFormat(
                                                          dayjs(
                                                              trip?.arrive,
                                                          ).format('HH:mm'),
                                                      )
                                                    : trip?.arriveTime
                                                      ? convertTimeFormat(
                                                            trip?.arriveTime,
                                                        )
                                                      : 'No arrival time'}
                                                <span>&nbsp;</span>
                                                {trip?.toLocation?.title}
                                                {!trip?.fromLocation?.title &&
                                                    !trip?.toLocation?.title &&
                                                    '-'}
                                                <span>:&nbsp;</span>
                                            </Button>
                                            <span className="text-2xs font-inter">
                                                {trip?.tripEvents?.nodes
                                                    .length > 0 ? (
                                                    <>
                                                        {trip?.tripEvents
                                                            ?.nodes[0]
                                                            ?.eventType?.title
                                                            ? trip?.tripEvents
                                                                  ?.nodes[0]
                                                                  ?.eventType
                                                                  ?.title
                                                            : trip?.tripEvents
                                                                  ?.nodes[0]
                                                                  ?.eventCategory}
                                                        {trip?.tripEvents?.nodes
                                                            .length > 1 && (
                                                            <DialogTrigger>
                                                                <Button className="text-base outline-none px-1">
                                                                    <span className="text-2xs font-inter">
                                                                        {' '}
                                                                        +
                                                                        {trip
                                                                            ?.tripEvents
                                                                            ?.nodes
                                                                            .length -
                                                                            1}{' '}
                                                                        more
                                                                    </span>
                                                                </Button>
                                                                <Popover>
                                                                    <PopoverWrapper>
                                                                        {trip?.tripEvents?.nodes.map(
                                                                            (
                                                                                event: any,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        event.id
                                                                                    }
                                                                                    className="flex items-center justify-between">
                                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                                        {event
                                                                                            ?.eventType
                                                                                            ?.title
                                                                                            ? event
                                                                                                  ?.eventType
                                                                                                  ?.title
                                                                                            : event?.eventCategory}
                                                                                    </span>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </PopoverWrapper>
                                                                </Popover>
                                                            </DialogTrigger>
                                                        )}
                                                    </>
                                                ) : (
                                                    'No events'
                                                )}
                                            </span>
                                        </div>
                                        <div
                                            key={`${trip.id}-body`}
                                            className={`${selectedTab === trip.id && currentTrip ? ' dark:bg-sldarkblue-900' : 'hidden'} text-left px-3`}>
                                            {currentTrip && (
                                                <>
                                                    <div
                                                        className={`${locked || !edit_tripReport ? 'pointer-events-none' : ''} my-4 flex flex-col md:flex-row items-start md:items-center`}>
                                                        <Label
                                                            className={
                                                                classes.label
                                                            }>
                                                            Departure time
                                                        </Label>
                                                        <DepartTime
                                                            offline={offline}
                                                            currentTrip={
                                                                currentTrip
                                                            }
                                                            tripReport={
                                                                tripReport
                                                            }
                                                            templateStyle={''}
                                                            updateTripReport={
                                                                updateTripReport
                                                            }
                                                        />
                                                    </div>
                                                    <div
                                                        className={`${locked || !edit_tripReport ? 'pointer-events-none' : ''} my-4 flex flex-col lg:flex-row items-start lg:items-center`}>
                                                        <Label
                                                            className={
                                                                classes.label
                                                            }>
                                                            Departure location
                                                        </Label>
                                                        <DepartLocation
                                                            offline={offline}
                                                            geoLocations={
                                                                locations
                                                            }
                                                            currentTrip={
                                                                currentTrip
                                                            }
                                                            tripReport={
                                                                tripReport
                                                            }
                                                            templateStyle={''}
                                                            updateTripReport={
                                                                updateTripReport
                                                            }
                                                        />
                                                    </div>
                                                    <hr className="my-4" />
                                                    <div className="my-4 text-sm font-semibold uppercase">
                                                        People on board
                                                    </div>
                                                    <div
                                                        className={`${locked || !edit_tripReport ? 'pointer-events-none' : ''} my-4`}>
                                                        <POB
                                                            offline={offline}
                                                            currentTrip={
                                                                currentTrip
                                                            }
                                                            tripReport={
                                                                tripReport
                                                            }
                                                            vessel={vessel}
                                                            crewMembers={
                                                                crewMembers
                                                            }
                                                            logBookConfig={
                                                                logBookConfig
                                                            }
                                                            setTab={setTab}
                                                            masterTerm={
                                                                client?.masterTerm
                                                            }
                                                            updateTripReport={
                                                                updateTripReport
                                                            }
                                                        />
                                                    </div>
                                                    {displayField(
                                                        'PassengerVehiclePickDrop',
                                                    ) && (
                                                        <>
                                                            <hr className="my-4" />
                                                            <div className="my-4 text-sm font-semibold uppercase">
                                                                Vehicles on
                                                                board
                                                            </div>
                                                            <div
                                                                className={`${locked || !edit_tripReport ? 'pointer-events-none' : ''} my-4`}>
                                                                <VOB
                                                                    offline={
                                                                        offline
                                                                    }
                                                                    currentTrip={
                                                                        currentTrip
                                                                    }
                                                                    tripReport={
                                                                        tripReport
                                                                    }
                                                                    vessel={
                                                                        vessel
                                                                    }
                                                                    crewMembers={
                                                                        crewMembers
                                                                    }
                                                                    logBookConfig={
                                                                        logBookConfig
                                                                    }
                                                                />
                                                            </div>
                                                            {displayFieldTripLog(
                                                                'DangerousGoods',
                                                            ) && (
                                                                <div
                                                                    className={`${locked || !edit_tripReport ? 'pointer-events-none' : ''} my-4`}>
                                                                    <DGR
                                                                        offline={
                                                                            offline
                                                                        }
                                                                        locked={
                                                                            locked ||
                                                                            !edit_tripReport
                                                                        }
                                                                        currentTrip={
                                                                            currentTrip
                                                                        }
                                                                        tripReport={
                                                                            tripReport
                                                                        }
                                                                        logBookConfig={
                                                                            logBookConfig
                                                                        }
                                                                        selectedDGR={
                                                                            selectedDGR
                                                                        }
                                                                        setSelectedDGR={
                                                                            setSelectedDGR
                                                                        }
                                                                        members={
                                                                            crewMembers
                                                                        }
                                                                        displayDangerousGoods={
                                                                            displayDangerousGoods
                                                                        }
                                                                        setDisplayDangerousGoods={
                                                                            setDisplayDangerousGoods
                                                                        }
                                                                        displayDangerousGoodsSailing={
                                                                            displayDangerousGoodsSailing
                                                                        }
                                                                        setDisplayDangerousGoodsSailing={
                                                                            setDisplayDangerousGoodsSailing
                                                                        }
                                                                        allDangerousGoods={
                                                                            allDangerousGoods
                                                                        }
                                                                        setAllDangerousGoods={
                                                                            setAllDangerousGoods
                                                                        }
                                                                    />
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                    <hr className="my-4" />
                                                    <div className="my-4">
                                                        <Events
                                                            offline={offline}
                                                            eventTypes={
                                                                eventTypes
                                                            }
                                                            currentTrip={
                                                                currentTrip
                                                            }
                                                            logBookConfig={
                                                                logBookConfig
                                                            }
                                                            updateTripReport={
                                                                updateTripReport
                                                            }
                                                            locked={locked}
                                                            geoLocations={
                                                                locations
                                                            }
                                                            tripReport={
                                                                tripReport
                                                            }
                                                            crewMembers={
                                                                crewMembers
                                                            }
                                                            masterID={masterID}
                                                            vessel={vessel}
                                                            vessels={vessels}
                                                            setSelectedRow={
                                                                setSelectedRowEvent
                                                            }
                                                            setCurrentEventType={
                                                                setCurrentEventTypeEvent
                                                            }
                                                            setCurrentStop={
                                                                setCurrentStopEvent
                                                            }
                                                            selectedRow={
                                                                selectedRowEvent
                                                            }
                                                            currentEventType={
                                                                currentEventTypeEvent
                                                            }
                                                            currentStop={
                                                                currentStopEvent
                                                            }
                                                            tripReport_Stops={
                                                                tripReport_Stops
                                                            }
                                                            setTripReport_Stops={
                                                                setTripReport_Stops
                                                            }
                                                            displayDangerousGoodsPvpd={
                                                                displayDangerousGoodsPvpd
                                                            }
                                                            setDisplayDangerousGoodsPvpd={
                                                                setDisplayDangerousGoodsPvpd
                                                            }
                                                            displayDangerousGoodsPvpdSailing={
                                                                displayDangerousGoodsPvpdSailing
                                                            }
                                                            setDisplayDangerousGoodsPvpdSailing={
                                                                setDisplayDangerousGoodsPvpdSailing
                                                            }
                                                            allPVPDDangerousGoods={
                                                                allPVPDDangerousGoods
                                                            }
                                                            setAllPVPDDangerousGoods={
                                                                setAllPVPDDangerousGoods
                                                            }
                                                            selectedDGRPVPD={
                                                                selectedDGRPVPD
                                                            }
                                                            setSelectedDGRPVPD={
                                                                setSelectedDGRPVPD
                                                            }
                                                        />
                                                    </div>
                                                    <hr className="my-4" />
                                                    <div
                                                        className={`${locked || !edit_tripReport ? 'pointer-events-none' : ''} my-4 flex flex-col lg:flex-row items-start lg:items-center`}>
                                                        <Label
                                                            className={
                                                                classes.label
                                                            }>
                                                            Arrival location
                                                        </Label>
                                                        <ExpectedDestination
                                                            offline={offline}
                                                            geoLocations={
                                                                locations
                                                            }
                                                            currentTrip={
                                                                currentTrip
                                                            }
                                                            tripReport={
                                                                tripReport
                                                            }
                                                            templateStyle={
                                                                'events'
                                                            }
                                                            updateTripReport={
                                                                updateTripReport
                                                            }
                                                        />
                                                    </div>
                                                    <div
                                                        className={`${locked || !edit_tripReport ? 'pointer-events-none' : ''} my-4`}>
                                                        <ExpectedArrival
                                                            offline={offline}
                                                            currentTrip={
                                                                currentTrip
                                                            }
                                                            tripReport={
                                                                tripReport
                                                            }
                                                            updateTripReport={
                                                                updateTripReport
                                                            }
                                                        />
                                                    </div>
                                                    <div
                                                        className={`${locked || !edit_tripReport ? 'pointer-events-none' : ''} my-4`}>
                                                        <ActualArrival
                                                            offline={offline}
                                                            currentTrip={
                                                                currentTrip
                                                            }
                                                            tripReport={
                                                                tripReport
                                                            }
                                                            updateTripReport={
                                                                updateTripReport
                                                            }
                                                        />
                                                    </div>
                                                    <div
                                                        className={`${locked || !edit_tripReport ? 'pointer-events-none' : ''} my-4`}>
                                                        <TripComments
                                                            offline={offline}
                                                            currentTrip={
                                                                currentTrip
                                                            }
                                                            tripReport={
                                                                tripReport
                                                            }
                                                            setCommentField={
                                                                setComment
                                                            }
                                                            updateTripReport={
                                                                updateTripReport
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <button
                                                            className="mr-2"
                                                            onClick={
                                                                handleCancel
                                                            }>
                                                            Cancel
                                                        </button>
                                                        {/*<DialogTrigger>
                                                            <SeaLogsButton
                                                                type="secondary"
                                                                color="slred"
                                                                icon="trash"
                                                                text="Delete"
                                                                className="!mr-0"
                                                            />
                                                            <ModalOverlay
                                                                className={({
                                                                    isEntering,
                                                                    isExiting,
                                                                }) => `
                                                                    fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur
                                                                    ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                                                                    ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                                                                `}>
                                                                <Modal
                                                                    className={({
                                                                        isEntering,
                                                                        isExiting,
                                                                    }) => `
                                                                        w-full max-w-md overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl
                                                                        ${isEntering ? 'animate-in zoom-in-95 ease-out duration-300' : ''}
                                                                        ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
                                                                    `}>
                                                                    <Dialog
                                                                        role="alertdialog"
                                                                        className="outline-none relative">
                                                                        {({
                                                                            close,
                                                                        }) => (
                                                                            <div className="flex justify-center flex-col px-6 py-6">
                                                                                <Heading
                                                                                    slot="title"
                                                                                    className="text-2xl font-light leading-6 my-2 text-gray-700">
                                                                                    Delete
                                                                                    Trip
                                                                                    Log
                                                                                    Data
                                                                                </Heading>
                                                                                <p className="mt-3 text-slate-500">
                                                                                    Are
                                                                                    you
                                                                                    sure
                                                                                    you
                                                                                    want
                                                                                    to
                                                                                    delete
                                                                                    the
                                                                                    trip
                                                                                    log
                                                                                    data
                                                                                    ?
                                                                                </p>
                                                                                <hr className="my-6" />
                                                                                <div className="flex justify-end">
                                                                                    <Button
                                                                                        className="mr-8 text-sm text-gray-600 hover:text-gray-600"
                                                                                        onPress={
                                                                                            close
                                                                                        }>
                                                                                        Cancel
                                                                                    </Button>
                                                                                    <Button
                                                                                        type="button"
                                                                                        className="group inline-flex justify-center items-center rounded-md bg-sky-700 px-4 py-2 text-sm text-white shadow-sm hover:bg-white hover:text-sky-800 ring-1 ring-sky-700"
                                                                                        onPress={() => {
                                                                                            close()
                                                                                            deleteTripLog()
                                                                                        }}>
                                                                                        <svg
                                                                                            className="-ml-0.5 mr-1.5 h-5 w-5 border rounded-full bg-sky-300 group-hover:bg-sky-700 group-hover:text-white"
                                                                                            viewBox="0 0 20 20"
                                                                                            fill="currentColor"
                                                                                            aria-hidden="true">
                                                                                            <path
                                                                                                fillRule="evenodd"
                                                                                                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                                                                clipRule="evenodd"></path>
                                                                                        </svg>
                                                                                        Delete
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </Dialog>
                                                                </Modal>
                                                            </ModalOverlay>
                                                        </DialogTrigger>*/}
                                                        <SeaLogsButton
                                                            type="primary"
                                                            icon="check"
                                                            text={'Update'}
                                                            color="sky"
                                                            action={handleSave}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </>
                    ) : (
                        <div className="flex justify-center items-center h-32">
                            <p className="">Start by adding a trip</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-end">
                <button
                    type="button"
                    className={`w-48 text-sm font-semibold text-slorange-1000 bg-slorange-300 border px-4 py-2 border-transparent rounded-md shadow-sm ring-1 ring-inset ring-slorange-1000 hover:ring-sldarkblue-1000 hover:bg-sldarkblue-1000 hover:text-white ${locked || !edit_tripReport ? 'pointer-events-none' : ''}`}
                    onClick={handleAddTrip}>
                    Add Trip
                </button>
            </div>
        </div>
    )
}
