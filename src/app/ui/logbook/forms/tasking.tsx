'use client'
import {
    AlertDialog,
    FooterWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { Heading } from 'react-aria-components'
import {
    CreateEventType_Tasking,
    UpdateEventType_Tasking,
    CREATE_GEO_LOCATION,
    UPDATE_FUELLOG,
    CREATE_FUELLOG,
    UpdateFuelTank,
} from '@/app/lib/graphQL/mutation'
import { GET_FUELTANKS, GetTripEvent } from '@/app/lib/graphQL/query'
import Select from 'react-select'
import { useLazyQuery, useMutation } from '@apollo/client'
import toast, { Toaster } from 'react-hot-toast'
import { classes } from '@/app/components/GlobalClasses'
import LocationField from '../components/location'
import VesselRescueFields from './vessel-rescue-fields'
import PersonRescueField from './person-rescue-field'
import Editor from '../../editor'
import TimeField from '../components/time'
import SlidingPanel from 'react-sliding-side-panel'
import RiskAnalysis from './risk-analysis'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useSearchParams } from 'next/navigation'
import { SealogsFuelIcon } from '@/app/lib/icons/SealogsFuelIcon'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import FuelTankModel from '@/app/offline/models/fuelTank'
import TripEventModel from '@/app/offline/models/tripEvent'
import EventType_TaskingModel from '@/app/offline/models/eventType_Tasking'
import GeoLocationModel from '@/app/offline/models/geoLocation'
import FuelLogModel from '@/app/offline/models/fuelLog'
import { generateUniqueId } from '@/app/offline/helpers/functions'

export default function Tasking({
    geoLocations,
    currentTrip = false,
    updateTripReport,
    selectedEvent = false,
    tripReport,
    closeModal,
    type,
    logBookConfig,
    previousDropEvent,
    vessel,
    members,
    locked,
    offline = false,
}: {
    geoLocations: any
    currentTrip: any
    updateTripReport: any
    selectedEvent: any
    tripReport: any
    closeModal: any
    type: any
    logBookConfig: any
    previousDropEvent: any
    vessel: any
    members: any
    locked: any
    offline?: boolean
}) {
    const searchParams = useSearchParams()
    const logentryID = searchParams.get('logentryID') ?? 0
    const [locations, setLocations] = useState<any>(false)
    const [time, setTime] = useState<any>(dayjs().format('HH:mm'))
    const [tasking, setTasking] = useState<any>(false)
    const [currentEvent, setCurrentEvent] = useState<any>(selectedEvent)
    const [parentLocation, setParentLocation] = useState<any>(false)
    const [openRiskAnalysis, setOpenRiskAnalysis] = useState<any>(false)
    const [pauseGroup, setPauseGroup] = useState<any>(false)
    const [openTaskID, setOpenTaskID] = useState<any>(false)
    const [completedTaskID, setCompletedTaskID] = useState<any>(false)
    const [towingChecklistID, setTowingChecklistID] = useState<any>(0)
    const [groupID, setGroupID] = useState<any>(false)
    const [tripEvent, setTripEvent] = useState<any>(false)
    const [currentIncident, setCurrentIncident] = useState<any>(false)
    const [content, setContent] = useState<any>('')
    const [taskingPausedValue, setTaskingPausedValue] = useState<any>(null)
    const [taskingResumedValue, setTaskingResumedValue] = useState<any>(null)
    const [taskingCompleteValue, setTaskingCompleteValue] = useState<any>(null)
    // const [members, setMembers] = useState<any>(false)
    const [logbook, setLogbook] = useState<any>(false)
    const [fuelTankList, setFuelTankList] = useState<any>(false)
    const [location, setLocation] = useState<any>({
        latitude: '',
        longitude: '',
    })
    const [currentLocation, setCurrentLocation] = useState<any>({
        latitude: '',
        longitude: '',
    })

    const [openNewLocationDialog, setOpenNewLocationDialog] =
        useState<boolean>(false)

    const [permissions, setPermissions] = useState<any>(false)
    const [editTaskingRisk, setEditTaskingRisk] = useState<any>(false)
    const fuelTankModel = new FuelTankModel()
    const tripEventModel = new TripEventModel()
    const taskingModel = new EventType_TaskingModel()
    const geoLocationModel = new GeoLocationModel()
    const fuelLogModel = new FuelLogModel()
    const init_permissions = () => {
        if (permissions) {
            if (hasPermission('EDIT_LOGBOOKENTRY_RISK_ANALYSIS', permissions)) {
                setEditTaskingRisk(true)
            } else {
                setEditTaskingRisk(false)
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

    const [queryGetFuelTanks] = useLazyQuery(GET_FUELTANKS, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readFuelTanks.nodes
            setFuelTankList(data)
        },
        onError: (error: any) => {
            console.error('getFuelTanks error', error)
        },
    })

    const getFuelTanks = async (fuelTankIds: any) => {
        if (offline) {
            const data = await fuelTankModel.getByIds(fuelTankIds)
            setFuelTankList(data)
        } else {
            await queryGetFuelTanks({
                variables: {
                    id: fuelTankIds,
                },
            })
        }
    }

    const handleSetVessel = (vessel: any) => {
        const fuelTankIds = vessel?.parentComponent_Components?.nodes
            .filter(
                (item: any) =>
                    item.basicComponent.componentCategory === 'FuelTank',
            )
            .map((item: any) => {
                return item.basicComponent.id
            })
        fuelTankIds.length > 0 && getFuelTanks(fuelTankIds)
    }

    useEffect(() => {
        if (vessel) {
            handleSetVessel(vessel)
        }
    }, [vessel])

    const handleTimeChange = (date: any) => {
        setTime(dayjs(date).format('HH:mm'))
    }
    const offlineGetPreviousDropEvent = async () => {
        const event = await tripEventModel.getById(previousDropEvent?.id)
        if (event) {
            setGroupID(event.eventType_Tasking?.groupID)
            if (event.eventType_Tasking?.lat && event.eventType_Tasking?.long) {
                setCurrentLocation({
                    latitude: event.eventType_Tasking?.lat,
                    longitude: event.eventType_Tasking?.long,
                })
            }
        }
    }
    useEffect(() => {
        if (selectedEvent) {
            setCurrentEvent(selectedEvent)
            getCurrentEvent(selectedEvent?.id)
        } else {
            if (previousDropEvent?.id > 0) {
                if (offline) {
                    offlineGetPreviousDropEvent()
                } else {
                    getPreviousDropEvent({
                        variables: {
                            id: previousDropEvent?.id,
                        },
                    })
                }
            }
        }
    }, [selectedEvent])

    useEffect(() => {
        if (currentEvent) {
            getCurrentEvent(currentEvent?.id)
        }
    }, [currentEvent])

    const handleTaskingPauseChange = (selectedTask: any) => {
        setPauseGroup(selectedTask.value)
        setTaskingPausedValue(selectedTask)
    }

    const [getPreviousDropEvent] = useLazyQuery(GetTripEvent, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const event = response.readOneTripEvent
            if (event) {
                setGroupID(event.eventType_Tasking?.groupID)
                if (
                    event.eventType_Tasking?.lat &&
                    event.eventType_Tasking?.long
                ) {
                    setCurrentLocation({
                        latitude: event.eventType_Tasking?.lat,
                        longitude: event.eventType_Tasking?.long,
                    })
                }
            }
        },
        onError: (error) => {
            console.error('Error getting previous event', error)
        },
    })

    const getCurrentEvent = async (id: any) => {
        if (offline) {
            const event = await tripEventModel.getById(id)
            if (event) {
                setTripEvent(event)
                setTasking({
                    geoLocationID: event.eventType_Tasking?.geoLocationID
                        ? event.eventType_Tasking?.geoLocationID
                        : null,
                    time: event.eventType_Tasking?.time,
                    title: event.eventType_Tasking?.title
                        ? event.eventType_Tasking?.title
                        : '',
                    fuelLevel: event.eventType_Tasking?.fuelLevel
                        ? event.eventType_Tasking?.fuelLevel
                        : '',
                    type: event.eventType_Tasking?.type
                        ? event.eventType_Tasking?.type
                        : '',
                    operationType:
                        event.eventType_Tasking?.operationType?.replaceAll(
                            '_',
                            ' ',
                        ),
                    lat: event.eventType_Tasking?.lat
                        ? event.eventType_Tasking?.lat
                        : '',
                    long: event.eventType_Tasking?.long
                        ? event.eventType_Tasking?.long
                        : '',
                    vesselRescueID: event.eventType_Tasking?.vesselRescueID
                        ? event.eventType_Tasking?.vesselRescueID
                        : 0,
                    personRescueID: event.eventType_Tasking?.personRescueID
                        ? event.eventType_Tasking?.personRescueID
                        : 0,
                    groupID: event.eventType_Tasking?.groupID
                        ? event.eventType_Tasking?.groupID
                        : null,
                    comments: event.eventType_Tasking?.comments
                        ? event.eventType_Tasking?.comments
                        : '',
                    tripEventID: event.eventType_Tasking?.id
                        ? event.eventType_Tasking?.id
                        : null,
                    pausedTaskID: event.eventType_Tasking?.pausedTaskID
                        ? event.eventType_Tasking?.pausedTaskID
                        : null,
                    openTaskID: event.eventType_Tasking?.openTaskID
                        ? event.eventType_Tasking?.openTaskID
                        : null,
                    completedTaskID: event.eventType_Tasking?.completedTaskID
                        ? event.eventType_Tasking?.completedTaskID
                        : null,
                    status: event.eventType_Tasking?.status,
                    cgop: event.eventType_Tasking?.cgop
                        ? event.eventType_Tasking?.cgop
                        : '',
                    sarop: event.eventType_Tasking?.sarop
                        ? event.eventType_Tasking?.sarop
                        : '',
                    fuelLog: event.eventType_Tasking?.fuelLog?.nodes,
                })
                setGroupID(event?.eventType_Tasking?.groupID)
                setContent(event?.eventType_Tasking?.comments)
                setTime(event.eventType_Tasking?.time)
                setCompletedTaskID(
                    event.eventType_Tasking?.completedTaskID
                        ? event.eventType_Tasking.completedTaskID
                        : null,
                )
                setOpenTaskID(
                    event.eventType_Tasking?.openTaskID
                        ? event.eventType_Tasking?.openTaskID
                        : null,
                )
                setPauseGroup(
                    event.eventType_Tasking?.pausedTaskID
                        ? event.eventType_Tasking?.pausedTaskID
                        : null,
                )
                if (
                    event.eventType_Tasking?.lat &&
                    event.eventType_Tasking?.long
                ) {
                    setCurrentLocation({
                        latitude: event.eventType_Tasking?.lat,
                        longitude: event.eventType_Tasking?.long,
                    })
                }
            }
            const resumedEvent = currentTrip?.tripEvents?.nodes.filter(
                (event: any) =>
                    event?.eventCategory === 'Tasking' &&
                    event?.id !== currentEvent?.id &&
                    event?.eventType_Tasking?.type === 'TaskingResumed',
            )
            if (resumedEvent) {
                setGroupID(resumedEvent[0]?.eventType_Tasking?.groupID)
            }
        } else {
            getTripEvent({
                variables: {
                    id: id,
                },
            })
        }
    }

    const [getTripEvent] = useLazyQuery(GetTripEvent, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const event = response.readOneTripEvent
            if (event) {
                setTripEvent(event)
                setTasking({
                    geoLocationID: event.eventType_Tasking?.geoLocationID
                        ? event.eventType_Tasking?.geoLocationID
                        : null,
                    time: event.eventType_Tasking?.time,
                    title: event.eventType_Tasking?.title
                        ? event.eventType_Tasking?.title
                        : '',
                    fuelLevel: event.eventType_Tasking?.fuelLevel
                        ? event.eventType_Tasking?.fuelLevel
                        : '',
                    type: event.eventType_Tasking?.type
                        ? event.eventType_Tasking?.type
                        : '',
                    operationType:
                        event.eventType_Tasking?.operationType?.replaceAll(
                            '_',
                            ' ',
                        ),
                    lat: event.eventType_Tasking?.lat
                        ? event.eventType_Tasking?.lat
                        : '',
                    long: event.eventType_Tasking?.long
                        ? event.eventType_Tasking?.long
                        : '',
                    vesselRescueID: event.eventType_Tasking?.vesselRescueID
                        ? event.eventType_Tasking?.vesselRescueID
                        : 0,
                    personRescueID: event.eventType_Tasking?.personRescueID
                        ? event.eventType_Tasking?.personRescueID
                        : 0,
                    groupID: event.eventType_Tasking?.groupID
                        ? event.eventType_Tasking?.groupID
                        : null,
                    comments: event.eventType_Tasking?.comments
                        ? event.eventType_Tasking?.comments
                        : '',
                    tripEventID: event.eventType_Tasking?.id
                        ? event.eventType_Tasking?.id
                        : null,
                    pausedTaskID: event.eventType_Tasking?.pausedTaskID
                        ? event.eventType_Tasking?.pausedTaskID
                        : null,
                    openTaskID: event.eventType_Tasking?.openTaskID
                        ? event.eventType_Tasking?.openTaskID
                        : null,
                    completedTaskID: event.eventType_Tasking?.completedTaskID
                        ? event.eventType_Tasking?.completedTaskID
                        : null,
                    status: event.eventType_Tasking?.status,
                    cgop: event.eventType_Tasking?.cgop
                        ? event.eventType_Tasking?.cgop
                        : '',
                    sarop: event.eventType_Tasking?.sarop
                        ? event.eventType_Tasking?.sarop
                        : '',
                    fuelLog: event.eventType_Tasking?.fuelLog?.nodes,
                })
                setGroupID(event?.eventType_Tasking?.groupID)
                setContent(event?.eventType_Tasking?.comments)
                setTime(event.eventType_Tasking?.time)
                setCompletedTaskID(
                    event.eventType_Tasking?.completedTaskID
                        ? event.eventType_Tasking.completedTaskID
                        : null,
                )
                setOpenTaskID(
                    event.eventType_Tasking?.openTaskID
                        ? event.eventType_Tasking?.openTaskID
                        : null,
                )
                setPauseGroup(
                    event.eventType_Tasking?.pausedTaskID
                        ? event.eventType_Tasking?.pausedTaskID
                        : null,
                )
                if (
                    event.eventType_Tasking?.lat &&
                    event.eventType_Tasking?.long
                ) {
                    setCurrentLocation({
                        latitude: event.eventType_Tasking?.lat,
                        longitude: event.eventType_Tasking?.long,
                    })
                }
            }
            const resumedEvent = currentTrip?.tripEvents?.nodes.filter(
                (event: any) =>
                    event?.eventCategory === 'Tasking' &&
                    event?.id !== currentEvent?.id &&
                    event?.eventType_Tasking?.type === 'TaskingResumed',
            )
            if (resumedEvent) {
                setGroupID(resumedEvent[0]?.eventType_Tasking?.groupID)
            }
        },
        onError: (error) => {
            console.error('Error getting current event', error)
        },
    })

    useEffect(() => {
        if (geoLocations) {
            setLocations([
                { label: '--- Add new location ---', value: 'newLocation' },
                ...geoLocations
                    .filter((location: any) => location.title)
                    .map((location: any) => ({
                        label: location.title,
                        value: location.id,
                        latitude: location.lat,
                        longitude: location.long,
                    })),
            ])
        }
    }, [geoLocations])

    const handleSave = async (vesselRescueID = 0, personRescueID = 0) => {
        const variables = {
            input: {
                geoLocationID: tasking?.geoLocationID,
                time: time,
                title: tasking?.title,
                fuelLevel: tasking?.fuelLevel,
                type: type,
                operationType: tasking?.operationType,
                lat: currentLocation.latitude.toString(),
                long: currentLocation.longitude.toString(),
                vesselRescueID:
                    vesselRescueID > 0
                        ? vesselRescueID
                        : tasking?.vesselRescueID,
                personRescueID:
                    personRescueID > 0
                        ? personRescueID
                        : tasking?.personRescueID,
                currentEntryID: currentTrip.id,
                tripEventID: tasking?.id,
                pausedTaskID: +pauseGroup,
                openTaskID: +openTaskID,
                completedTaskID: +completedTaskID,
                comments: content,
                groupID: +groupID,
                status: 'Open',
                cgop: tasking?.cgop ? tasking.cgop : null,
                sarop: tasking?.sarop ? tasking.sarop : null,
            },
        }
        if (pauseGroup) {
            if (offline) {
                await taskingModel.save({
                    id: +pauseGroup,
                    status: 'Paused',
                    tripEventID: currentEvent?.id,
                })
                updateTripReport(currentTrip)
                updateTripReport({
                    id: tripReport.map((trip: any) => trip.id),
                })
                closeModal()
            } else {
                updateEventType_tasking({
                    variables: {
                        input: {
                            id: +pauseGroup,
                            status: 'Paused',
                            tripEventID: currentEvent?.id,
                        },
                    },
                })
            }
        }
        if (openTaskID) {
            if (offline) {
                await taskingModel.save({
                    id: +openTaskID,
                    status: 'Open',
                    tripEventID: currentEvent?.id,
                })
                updateTripReport(currentTrip)
                updateTripReport({
                    id: tripReport.map((trip: any) => trip.id),
                })
                closeModal()
            } else {
                updateEventType_tasking({
                    variables: {
                        input: {
                            id: +openTaskID,
                            status: 'Open',
                            tripEventID: currentEvent?.id,
                        },
                    },
                })
            }
        }
        if (completedTaskID && !currentEvent) {
            if (offline) {
                await taskingModel.save({
                    id: +completedTaskID,
                    status: 'Completed',
                    tripEventID: currentEvent?.id,
                })
                updateTripReport(currentTrip)
                updateTripReport({
                    id: tripReport.map((trip: any) => trip.id),
                })
                closeModal()
            } else {
                updateEventType_tasking({
                    variables: {
                        input: {
                            id: +completedTaskID,
                            status: 'Completed',
                            tripEventID: currentEvent?.id,
                        },
                    },
                })
            }
        }
        if (currentEvent) {
            if (offline) {
                await taskingModel.save({
                    id: +selectedEvent?.eventType_TaskingID,
                    ...variables.input,
                })
                updateTripReport(currentTrip)
                updateTripReport({
                    id: tripReport.map((trip: any) => trip.id),
                })
                closeModal()
                updateFuelLogs(+selectedEvent?.eventType_TaskingID)
            } else {
                updateEventType_tasking({
                    variables: {
                        input: {
                            id: +selectedEvent?.eventType_TaskingID,
                            ...variables.input,
                        },
                    },
                })
                updateFuelLogs(+selectedEvent?.eventType_TaskingID)
            }
        } else {
            if (offline) {
                const data = await taskingModel.save({
                    id: generateUniqueId(),
                    geoLocationID: tasking?.geoLocationID,
                    time: time,
                    title: tasking?.title,
                    fuelLevel: tasking?.fuelLevel,
                    type: type,
                    operationType: tasking?.operationType,
                    lat: currentLocation.latitude.toString(),
                    long: currentLocation.longitude.toString(),
                    vesselRescueID: vesselRescueID,
                    personRescueID: personRescueID,
                    currentEntryID: currentTrip.id,
                    pausedTaskID: +pauseGroup,
                    openTaskID: +openTaskID,
                    completedTaskID: +completedTaskID,
                    comments: content,
                    groupID: +groupID,
                    status: 'Open',
                    cgop: tasking?.cgop ? tasking.cgop : getPreviousCGOP(false),
                    sarop: tasking?.sarop
                        ? tasking.sarop
                        : getPreviousSAROP(false),
                })
                updateFuelLogs(+data.id)
                updateTripReport(currentTrip)
                updateTripReport({
                    id: tripReport.map((trip: any) => trip.id),
                })
            } else {
                createEventType_Tasking({
                    variables: {
                        input: {
                            geoLocationID: tasking?.geoLocationID,
                            time: time,
                            title: tasking?.title,
                            fuelLevel: tasking?.fuelLevel,
                            type: type,
                            operationType: tasking?.operationType,
                            lat: currentLocation.latitude.toString(),
                            long: currentLocation.longitude.toString(),
                            vesselRescueID: vesselRescueID,
                            personRescueID: personRescueID,
                            currentEntryID: currentTrip.id,
                            pausedTaskID: +pauseGroup,
                            openTaskID: +openTaskID,
                            completedTaskID: +completedTaskID,
                            comments: content,
                            groupID: +groupID,
                            status: 'Open',
                            cgop: tasking?.cgop
                                ? tasking.cgop
                                : getPreviousCGOP(false),
                            sarop: tasking?.sarop
                                ? tasking.sarop
                                : getPreviousSAROP(false),
                        },
                    },
                })
            }
        }
        setCompletedTaskID(false)
        setOpenTaskID(false)
        setPauseGroup(false)
    }

    const [createEventType_Tasking] = useMutation(CreateEventType_Tasking, {
        onCompleted: (response) => {
            const data = response.createEventType_Tasking
            updateFuelLogs(+data.id)
            updateTripReport(currentTrip)
            updateTripReport({
                id: tripReport.map((trip: any) => trip.id),
            })
        },
        onError: (error) => {
            console.error('Error creating Person rescue', error)
        },
    })

    const [updateEventType_tasking] = useMutation(UpdateEventType_Tasking, {
        onCompleted: (response) => {
            const data = response.updateEventType_tasking
            updateTripReport(currentTrip)
            updateTripReport({
                id: tripReport.map((trip: any) => trip.id),
            })
            closeModal()
        },
        onError: (error) => {
            console.error('Error updating activity type tasking', error)
        },
    })

    const handleOperationTypeChange = (selectedOperation: any) => {
        if (selectedOperation.value === 'newLocation') {
            toast.loading('Getting your current location...')
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(({ coords }) => {
                    const { latitude, longitude } = coords
                    setLocation({ latitude, longitude })
                    toast.remove()
                    toast.success('Location found')
                    setOpenNewLocationDialog(true)
                })
            } else {
                toast.error('Geolocation is not supported by your browser')
                setOpenNewLocationDialog(true)
            }
        } else {
            setTasking({
                ...tasking,
                operationType: selectedOperation.value,
            })
        }
    }

    const handleLocationChange = (selectedLocation: any) => {
        if (selectedLocation.value === 'newLocation') {
            toast.loading('Getting your current location...')
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(({ coords }) => {
                    const { latitude, longitude } = coords
                    setLocation({ latitude, longitude })
                    toast.remove()
                    toast.success('Location found')
                    setOpenNewLocationDialog(true)
                })
            } else {
                toast.error('Geolocation is not supported by your browser')
                setOpenNewLocationDialog(true)
            }
        } else {
            setTasking({
                ...tasking,
                geoLocationID: selectedLocation.value,
            })
        }
    }

    const handleCreateNewLocation = async () => {
        const title = document.getElementById(
            'new-location-title',
        ) as HTMLInputElement
        const latitude = document.getElementById(
            'new-location-latitude',
        ) as HTMLInputElement
        const longitude = document.getElementById(
            'new-location-longitude',
        ) as HTMLInputElement
        if (title && latitude && longitude) {
            if (offline) {
                const data = await geoLocationModel.save({
                    id: generateUniqueId(),
                    title: title.value,
                    lat: +latitude.value,
                    long: +longitude.value,
                    parentID: parentLocation,
                })
                setLocations([
                    ...locations,
                    {
                        label: data.title,
                        value: data.id,
                        latitude: data.lat,
                        longitude: data.long,
                    },
                ])
                setTasking({
                    ...tasking,
                    geoLocationID: data.id,
                })
                setOpenNewLocationDialog(false)
            } else {
                createGeoLocation({
                    variables: {
                        input: {
                            title: title.value,
                            lat: +latitude.value,
                            long: +longitude.value,
                            parentID: parentLocation,
                        },
                    },
                })
            }
        }
    }

    const [createGeoLocation] = useMutation(CREATE_GEO_LOCATION, {
        onCompleted: (response) => {
            const data = response.createGeoLocation
            setLocations([
                ...locations,
                {
                    label: data.title,
                    value: data.id,
                    latitude: data.lat,
                    longitude: data.long,
                },
            ])
            setTasking({
                ...tasking,
                geoLocationID: data.id,
            })
            setOpenNewLocationDialog(false)
        },
        onError: (error) => {
            console.error('Error creating new location', error)
        },
    })

    const handleParentLocationChange = (selectedOperation: any) => {
        setParentLocation(selectedOperation.value)
    }

    const handleEditorChange = (newContent: any) => {
        setContent(newContent)
    }

    const handleTaskingGroupChange = (selectedGroup: any) => {
        setGroupID(selectedGroup.value)
        setOpenTaskID(selectedGroup.value)
        setTaskingResumedValue(selectedGroup)
    }

    const handleTaskingCompleteChange = (selectedGroup: any) => {
        setCompletedTaskID(selectedGroup.value)
        setTaskingCompleteValue(selectedGroup)
    }

    const operationTypes = [
        {
            label: 'Vessel Mechanical / equipment failure',
            value: 'Vessel Mechanical or equipment failure',
        },
        { label: 'Vessel adrift', value: 'Vessel adrift' },
        { label: 'Vessel aground', value: 'Vessel aground' },
        { label: 'Capsize', value: 'Capsize' },
        { label: 'Vessel requiring tow', value: 'Vessel requiring tow' },
        { label: 'Flare sighting', value: 'Flare sighting' },
        { label: 'Vessel sinking', value: 'Vessel sinking' },
        { label: 'Collision', value: 'Collision' },
        { label: 'Vessel overdue', value: 'Vessel overdue' },
        { label: 'Vessel - other', value: 'Vessel - other' },
        { label: 'Person in water', value: 'Person in water' },
        { label: 'Person lost / missing', value: 'Person lost or missing' },
        { label: 'Suicide', value: 'Suicide' },
        { label: 'Medical condition', value: 'Medical condition' },
        { label: 'Person - other', value: 'Person - other' },
    ]

    const findPreviousEvent = (selectedEvent: any) => {
        const prevEvent = previousDropEvent
            ?.filter((event: any) => event.eventType_Tasking.status === 'Open')
            .pop()
        if (type === 'TaskingOnTow' || type === 'TaskingOnScene') {
            if (selectedEvent) {
                if (selectedEvent.eventType_Tasking.vesselRescueID > 0) {
                    return previousDropEvent
                        .filter(
                            (event: any) =>
                                event.eventType_Tasking.vesselRescueID ===
                                selectedEvent.eventType_Tasking.vesselRescueID,
                        )
                        .pop()
                }
                if (selectedEvent.eventType_Tasking.personRescueID > 0) {
                    return previousDropEvent
                        .filter(
                            (event: any) =>
                                event.eventType_Tasking.personRescueID ===
                                selectedEvent.eventType_Tasking.personRescueID,
                        )
                        .pop()
                }
            }
            return prevEvent
        }
        if (type === 'TaskingComplete') {
            if (completedTaskID > 0) {
                return currentTrip?.tripEvents?.nodes.find(
                    (event: any) =>
                        event?.eventType_TaskingID == completedTaskID,
                )
            }
            if (tasking.completedTaskID > 0) {
                return currentTrip?.tripEvents?.nodes.find(
                    (event: any) =>
                        event?.eventType_TaskingID == tasking.completedTaskID,
                )
            } else {
                return prevEvent ? prevEvent : selectedEvent
            }
        }
        return selectedEvent
    }

    const findPreviousRescueID = (rescueID: any) => {
        const prevEvent = previousDropEvent
            ?.filter((event: any) => event.eventType_Tasking.status === 'Open')
            .pop()
        if (type === 'TaskingOnTow' || type === 'TaskingOnScene') {
            return prevEvent
                ? prevEvent.eventType_Tasking.vesselRescueID
                : rescueID
        }
        if (type === 'TaskingComplete') {
            if (tasking.completedTaskID > 0) {
                return tasking.vesselRescueID
            }
            if (completedTaskID > 0) {
                return +currentTrip?.tripEvents?.nodes.find(
                    (event: any) =>
                        event?.eventType_TaskingID == completedTaskID,
                )?.eventType_Tasking?.vesselRescueID
            }
            if (tasking.completedTaskID > 0) {
                return +currentTrip?.tripEvents?.nodes.find(
                    (event: any) =>
                        event?.eventType_TaskingID == tasking.completedTaskID,
                )?.eventType_Tasking?.vesselRescueID
            } else {
                return prevEvent
                    ? prevEvent.eventType_Tasking.vesselRescueID
                    : rescueID
            }
        }
        return rescueID
    }

    const findPreviousHumanRescueID = (rescueID: any) => {
        const prevEvent = previousDropEvent
            ?.filter((event: any) => event.eventType_Tasking.status === 'Open')
            .pop()
        if (type === 'TaskingOnTow' || type === 'TaskingOnScene') {
            return prevEvent
                ? prevEvent.eventType_Tasking.personRescueID
                : rescueID
        }
        if (type === 'TaskingComplete') {
            if (tasking.completedTaskID > 0) {
                return tasking.personRescueID
            }
            if (completedTaskID > 0) {
                return +currentTrip?.tripEvents?.nodes.find(
                    (event: any) =>
                        event?.eventType_TaskingID == completedTaskID,
                )?.eventType_Tasking?.personRescueID
            }
            if (tasking.completedTaskID > 0) {
                return +currentTrip?.tripEvents?.nodes.find(
                    (event: any) =>
                        event?.eventType_TaskingID == tasking.completedTaskID,
                )?.eventType_Tasking?.personRescueID
            } else {
                return prevEvent
                    ? prevEvent.eventType_Tasking.personRescueID
                    : rescueID
            }
        }
        return rescueID
    }

    const currentOperationTypeLabel = (label: any) => {
        return label ? label : '-- Select operation type --'
    }

    const currentOperationTypeValue = (value: any) => {
        return value
    }

    const getPreviousSAROP = (sarop: any) => {
        if (currentIncident === 'cgop') {
            return ''
        }
        if (currentIncident === 'sarop') {
            return sarop ? sarop : ' '
        }
        const e = previousDropEvent
            ?.filter((event: any) => event.eventType_Tasking.status === 'Open')
            .pop()
        if (type === 'TaskingComplete') {
            const completedEvent = currentTrip?.tripEvents?.nodes.find(
                (event: any) => event?.eventType_TaskingID == completedTaskID,
            )
        }
        return e?.eventType_Tasking?.sarop
            ? e.eventType_Tasking.sarop
            : sarop
              ? sarop
              : ''
    }

    const getPreviousCGOP = (cgop: any) => {
        if (currentIncident === 'sarop') {
            return ''
        }
        if (currentIncident === 'cgop') {
            return cgop ? cgop : ' '
        }
        const e = previousDropEvent
            ?.filter((event: any) => event.eventType_Tasking.status === 'Open')
            .pop()
        if (type === 'TaskingComplete') {
            const completedEvent = currentTrip?.tripEvents?.nodes.find(
                (event: any) => event?.eventType_TaskingID == completedTaskID,
            )
        }
        return e?.eventType_Tasking?.cgop
            ? e.eventType_Tasking.cgop
            : cgop
              ? cgop
              : ''
    }

    const getPreviousFuelLevel = (fuelLevel: any) => {
        if (selectedEvent?.eventType_Tasking?.fuelLevel > 0) {
            return selectedEvent?.eventType_Tasking?.fuelLevel
        }
        if (fuelLevel || tasking?.updatedFuelLevel) {
            return fuelLevel
        }
        const fuelLevels = currentTrip?.tripEvents?.nodes
            .filter((event: any) => event.eventType_Tasking.fuelLevel > 0)
            .map((event: any) => event.eventType_Tasking.fuelLevel)
        const minFuelLevel = fuelLevels?.length
            ? fuelLevels[fuelLevels.length - 1]
            : fuelLevel
        return fuelLevels?.length ? minFuelLevel : fuelLevel ? fuelLevel : ''
    }

    const getPreviousTask = (task: any) => {
        if (task) {
            return task
        }
        const prevEvent = previousDropEvent
            ?.filter((event: any) => event.eventType_Tasking.status === 'Open')
            .pop()
        if (type === 'TaskingComplete') {
            setCompletedTaskID(prevEvent?.eventType_Tasking?.id)
            setTaskingCompleteValue({
                label:
                    prevEvent?.eventType_Tasking?.time +
                    ' - ' +
                    prevEvent?.eventType_Tasking?.title,
                value: prevEvent?.eventType_Tasking?.id,
            })
        }
        return prevEvent
            ? {
                  label:
                      prevEvent?.eventType_Tasking?.time +
                      ' - ' +
                      prevEvent?.eventType_Tasking?.title,
                  value: prevEvent?.eventType_Tasking?.id,
              }
            : task
    }

    const isVesselRescue = () => {
        if (type === 'TaskingComplete' && tasking.completedTaskID > 0) {
            return (
                currentTrip?.tripEvents?.nodes.find(
                    (event: any) =>
                        event?.eventType_TaskingID == tasking.completedTaskID,
                )?.eventType_Tasking?.vesselRescueID > 0
            )
        }
        if (type === 'TaskingOnScene' || type === 'TaskingOnTow') {
            var latestEvent: any
            currentTrip?.tripEvents?.nodes.filter((event: any) => {
                if (event?.eventCategory === 'Tasking') {
                    latestEvent = event
                }
            })
            return latestEvent?.eventType_Tasking?.vesselRescueID > 0
        }
        return (
            currentTrip?.tripEvents?.nodes.find(
                (event: any) => event?.eventType_TaskingID == completedTaskID,
            )?.eventType_Tasking?.vesselRescueID > 0
        )
    }

    const isPersonRescue = () => {
        if (type === 'TaskingComplete' && tasking.completedTaskID > 0) {
            return (
                currentTrip?.tripEvents?.nodes.find(
                    (event: any) =>
                        event?.eventType_TaskingID == tasking.completedTaskID,
                )?.eventType_Tasking?.personRescueID > 0
            )
        }
        if (type === 'TaskingOnScene' || type === 'TaskingOnTow') {
            var latestEvent: any
            currentTrip?.tripEvents?.nodes.filter((event: any) => {
                if (event?.eventCategory === 'Tasking') {
                    latestEvent = event
                }
            })
            return latestEvent?.eventType_Tasking?.personRescueID > 0
        }
        return (
            currentTrip?.tripEvents?.nodes.find(
                (event: any) => event?.eventType_TaskingID == completedTaskID,
            )?.eventType_Tasking?.personRescueID > 0
        )
    }

    const displayVessesRescueFields = () => {
        if (
            (type === 'TaskingOnScene' && isVesselRescue()) ||
            (type === 'TaskingOnTow' && isVesselRescue()) ||
            (type === 'TaskingComplete' && isVesselRescue()) ||
            tasking.operationType ===
                'Vessel Mechanical or equipment failure' ||
            tasking.operationType === 'Vessel adrift' ||
            tasking.operationType === 'Vessel aground' ||
            tasking.operationType === 'Capsize' ||
            tasking.operationType === 'Vessel requiring tow' ||
            tasking.operationType === 'Flare sighting' ||
            tasking.operationType === 'Vessel sinking' ||
            tasking.operationType === 'Collision' ||
            tasking.operationType === 'Vessel overdue' ||
            tasking.operationType === 'Vessel - other'
        ) {
            return true
        }
        return false
    }

    const displayPersonRescueFields = () => {
        if (
            (type === 'TaskingOnScene' && isPersonRescue()) ||
            (type === 'TaskingOnTow' && isPersonRescue()) ||
            (type === 'TaskingComplete' && isPersonRescue()) ||
            tasking.operationType === 'Person in water' ||
            tasking.operationType === 'Person lost or missing' ||
            tasking.operationType === 'Suicide' ||
            tasking.operationType === 'Medical condition' ||
            tasking.operationType === 'Person - other'
        ) {
            return true
        }
        return false
    }

    const handleSaropChange = (e: any) => {
        if (e.target.value == 'on') {
            setCurrentIncident('sarop')
        }
    }

    const handleCgopChange = (e: any) => {
        if (e.target.value == 'on') {
            setCurrentIncident('cgop')
        }
    }

    const handleUpdateFuelTank = (tank: any, value: any) => {
        if (tank.capacity < +value) {
            toast.error(
                'Fuel level cannot be higher than tank capacity of ' +
                    tank.capacity,
            )
            return
        }
        setFuelTankList(
            fuelTankList.map((item: any) => {
                if (item.id === tank.id) {
                    return {
                        ...item,
                        currentLevel: +value,
                    }
                }
                return item
            }),
        )
        setTasking({
            ...tasking,
            fuelLog: false,
        })
    }

    const [updateFuelLog] = useMutation(UPDATE_FUELLOG, {
        onCompleted: (response) => {
            const data = response.updateFuelLog
        },
        onError: (error) => {
            console.error('Error updating fuel log', error)
        },
    })

    const [createFuelLog] = useMutation(CREATE_FUELLOG, {
        onCompleted: (response) => {
            const data = response.createFuelLog
        },
        onError: (error) => {
            console.error('Error creating fuel log', error)
        },
    })

    const [updateFuelTank] = useMutation(UpdateFuelTank, {
        onCompleted: (response) => {
            const data = response.updateFuelTank
        },
        onError: (error) => {
            console.error('Error updating fuel tank', error)
        },
    })

    const updateFuelLogs = (currentID: number = 0) => {
        if (fuelTankList) {
            Promise.all(
                fuelTankList?.map(async (fuelTank: any) => {
                    const variables = {
                        input: {
                            id: fuelTank.id,
                            currentLevel: fuelTank.currentLevel,
                        },
                    }
                    if (!currentEvent) {
                        if (offline) {
                            await fuelTankModel.save({
                                id: fuelTank.id,
                                currentLevel: fuelTank.currentLevel,
                            })
                        } else {
                            updateFuelTank({
                                variables: variables,
                            })
                        }
                    }
                    if (currentEvent) {
                        if (offline) {
                            await fuelLogModel.save({
                                id: currentEvent.eventType_Tasking.fuelLog.nodes.find(
                                    (log: any) =>
                                        log.fuelTank.id === fuelTank.id,
                                ).id,
                                fuelTankID: fuelTank.id,
                                fuelAfter: fuelTank.currentLevel,
                                date: dayjs().format('YYYY-MM-DD'),
                                eventType_TaskingID: currentID,
                            })
                        } else {
                            updateFuelLog({
                                variables: {
                                    input: {
                                        id: currentEvent.eventType_Tasking.fuelLog.nodes.find(
                                            (log: any) =>
                                                log.fuelTank.id === fuelTank.id,
                                        ).id,
                                        fuelTankID: fuelTank.id,
                                        fuelAfter: fuelTank.currentLevel,
                                        date: dayjs().format('YYYY-MM-DD'),
                                        eventType_TaskingID: currentID,
                                    },
                                },
                            })
                        }
                    } else {
                        if (offline) {
                            await fuelLogModel.save({
                                id: generateUniqueId(),
                                fuelTankID: fuelTank.id,
                                fuelAfter: fuelTank.currentLevel,
                                date: dayjs().format('YYYY-MM-DD'),
                                eventType_TaskingID: currentID,
                            })
                        } else {
                            createFuelLog({
                                variables: {
                                    input: {
                                        fuelTankID: fuelTank.id,
                                        fuelAfter: fuelTank.currentLevel,
                                        date: dayjs().format('YYYY-MM-DD'),
                                        eventType_TaskingID: currentID,
                                    },
                                },
                            })
                        }
                    }
                }),
            )
        }
    }

    return (
        <div className="w-full">
            <>
                <div className="mt-6 text-sm font-semibold uppercase">
                    {type === 'TaskingStartUnderway' &&
                        'Tasking start / underway'}
                    {type === 'TaskingOnScene' && 'Tasking on scene'}
                    {type === 'TaskingOnTow' && 'Tasking on tow'}
                    {type === 'TaskingPaused' && 'Tasking paused'}
                    {type === 'TaskingResumed' && 'Tasking resumed'}
                    {type === 'TaskingComplete' && 'Tasking complete'}
                </div>
                <p className="text-xs font-inter max-w-[40rem] leading-loose">
                    Give this tasking a title and choose an operation type.
                    <br />
                    <br />
                    Everything else below this section is{' '}
                    <strong>optional can be completed later</strong>. However,
                    all the details loaded here will be used for any tasking
                    reports required.
                    <br />
                    <br />
                    Recording fuel levels goes toward{' '}
                    <strong>
                        fuel reports for allocating to different operations
                    </strong>
                    .
                </p>
                {type === 'TaskingOnTow' && (
                    <p className="text-xs font-inter max-w-[40rem] leading-loose">
                        Utilise attached checklist to ensure towing procedure is
                        followed and any risks identified.
                    </p>
                )}
                {type === 'TaskingOnTow' && (
                    <SeaLogsButton
                        text="Towing checklist - risk analysis"
                        color="orange"
                        type="primaryWithColor"
                        action={() => setOpenRiskAnalysis(true)}
                    />
                )}
                <div className="flex flex-col">
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <label className={`${classes.label} !w-full`}>
                            Time when tasking takes place
                        </label>
                        <TimeField
                            time={time}
                            handleTimeChange={handleTimeChange}
                            timeID="time"
                            fieldName="Time"
                        />
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <label className={`${classes.label} !w-full`}>
                            Title of tasking
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={tasking?.title ? tasking.title : ''}
                            className={classes.input}
                            placeholder="Title"
                            onChange={(e) =>
                                setTasking({
                                    ...tasking,
                                    title: e.target.value,
                                })
                            }
                        />
                    </div>
                    {fuelTankList &&
                        fuelTankList.map((tank: any) => (
                            <div
                                className={`${locked ? 'pointer-events-none' : ''} my-2 flex items-end`}
                                key={tank.id}>
                                <SealogsFuelIcon className="w-6 h-6 mr-3 mb-0.5 text-gray-900" />
                                <span className="text-sm font-semibold uppercase w-52 mb-2">
                                    {tank.title}
                                </span>
                                <input
                                    type="number"
                                    className={classes.input}
                                    placeholder="Fuel end"
                                    value={
                                        tasking?.fuelLog
                                            ? tasking.fuelLog.find(
                                                  (log: any) =>
                                                      log.fuelTank.id ===
                                                      tank.id,
                                              )?.fuelAfter
                                            : tank.currentLevel
                                    }
                                    min={0}
                                    max={tank.capacity}
                                    onChange={(e: any) =>
                                        handleUpdateFuelTank(
                                            tank,
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        ))}
                    {/* <div className="my-4 flex items-end">
                        <SealogsFuelIcon className="w-6 h-6 mr-3 mb-0.5 text-gray-900" />
                        <input
                            id="fuel-level"
                            name="fuel-level"
                            type="text"
                            value={getPreviousFuelLevel(tasking?.fuelLevel)}
                            className={classes.input}
                            placeholder="Fuel level"
                            onChange={(e) =>
                                setTasking({
                                    ...tasking,
                                    fuelLevel: e.target.value,
                                    updatedFuelLevel: true,
                                })
                            }
                        />
                    </div> */}
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <label className={`${classes.label} !w-full`}>
                            Location where tasking takes place
                        </label>
                        <LocationField
                            offline={offline}
                            currentTrip={currentTrip}
                            updateTripReport={updateTripReport}
                            tripReport={tripReport}
                            setCurrentLocation={setCurrentLocation}
                            handleLocationChange={handleLocationChange}
                            currentLocation={currentLocation}
                            currentEvent={tripEvent.eventType_Tasking}
                        />
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        {type === 'TaskingPaused' && (
                            <>
                                <div className="my-4">
                                    <Select
                                        id="tasking-group-pause"
                                        options={
                                            previousDropEvent
                                                ? previousDropEvent
                                                      .filter(
                                                          (group: any) =>
                                                              group
                                                                  .eventType_Tasking
                                                                  .status ===
                                                              'Open',
                                                      )
                                                      .map((group: any) => ({
                                                          label:
                                                              group
                                                                  .eventType_Tasking
                                                                  .time +
                                                              ' - ' +
                                                              group
                                                                  .eventType_Tasking
                                                                  .title,
                                                          value: group
                                                              .eventType_Tasking
                                                              .id,
                                                      }))
                                                : []
                                        }
                                        menuPlacement="top"
                                        value={
                                            tasking.pausedTaskID > 0
                                                ? {
                                                      label:
                                                          currentTrip?.tripEvents?.nodes.find(
                                                              (event: any) =>
                                                                  event?.eventType_TaskingID ==
                                                                  tasking.pausedTaskID,
                                                          )?.eventType_Tasking
                                                              ?.time +
                                                          ' - ' +
                                                          currentTrip?.tripEvents?.nodes.find(
                                                              (event: any) =>
                                                                  event?.eventType_TaskingID ==
                                                                  tasking.pausedTaskID,
                                                          )?.eventType_Tasking
                                                              ?.title,
                                                      value: tasking.pausedTaskID,
                                                  }
                                                : taskingPausedValue
                                        }
                                        placeholder="Select Task to pause"
                                        onChange={handleTaskingPauseChange}
                                        className={classes.selectMain}
                                        classNames={{
                                            control: () =>
                                                'flex py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                            singleValue: () =>
                                                'dark:!text-white',
                                            menu: () => 'dark:bg-gray-800',
                                            option: () => classes.selectOption,
                                        }}
                                    />
                                </div>
                                <div className="my-4">
                                    {((selectedEvent && content) ||
                                        !selectedEvent) && (
                                        <Editor
                                            id="comment"
                                            placeholder="Comment"
                                            className="w-full"
                                            content={content}
                                            handleEditorChange={
                                                handleEditorChange
                                            }
                                        />
                                    )}
                                </div>
                            </>
                        )}
                        {type === 'TaskingComplete' && (
                            <div className="my-4">
                                <Select
                                    id="tasking-group-complete"
                                    options={
                                        previousDropEvent
                                            ? previousDropEvent
                                                  .filter(
                                                      (group: any) =>
                                                          group
                                                              .eventType_Tasking
                                                              .status !==
                                                          'Completed',
                                                  )
                                                  .map((group: any) => ({
                                                      label:
                                                          group
                                                              .eventType_Tasking
                                                              .time +
                                                          ' - ' +
                                                          group
                                                              .eventType_Tasking
                                                              .title,
                                                      value: group
                                                          .eventType_Tasking.id,
                                                  }))
                                            : []
                                    }
                                    menuPlacement="top"
                                    value={
                                        tasking.completedTaskID > 0
                                            ? {
                                                  label:
                                                      currentTrip?.tripEvents?.nodes.find(
                                                          (event: any) =>
                                                              event?.eventType_TaskingID ==
                                                              tasking.completedTaskID,
                                                      )?.eventType_Tasking
                                                          .time +
                                                      ' - ' +
                                                      currentTrip?.tripEvents?.nodes.find(
                                                          (event: any) =>
                                                              event?.eventType_TaskingID ==
                                                              tasking.completedTaskID,
                                                      )?.eventType_Tasking
                                                          .title,
                                                  value: tasking.completedTaskID,
                                              }
                                            : getPreviousTask(
                                                  taskingCompleteValue,
                                              )
                                    }
                                    placeholder="Select Task to Close"
                                    onChange={handleTaskingCompleteChange}
                                    className={classes.selectMain}
                                    classNames={{
                                        control: () =>
                                            'flex py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                        singleValue: () => 'dark:!text-white',
                                        menu: () => 'dark:bg-gray-800',
                                        option: () => classes.selectOption,
                                    }}
                                />
                            </div>
                        )}
                        {type === 'TaskingResumed' && (
                            <Select
                                id="tasking-group-resume"
                                options={
                                    previousDropEvent
                                        ? previousDropEvent
                                              .filter(
                                                  (group: any) =>
                                                      group.eventType_Tasking
                                                          .status === 'Paused',
                                              )
                                              .map((group: any) => ({
                                                  label:
                                                      group.eventType_Tasking
                                                          .time +
                                                      ' - ' +
                                                      group.eventType_Tasking
                                                          .title,
                                                  value: group.eventType_Tasking
                                                      .id,
                                              }))
                                        : []
                                }
                                menuPlacement="top"
                                value={
                                    tasking.openTaskID > 0
                                        ? {
                                              label:
                                                  currentTrip?.tripEvents?.nodes.find(
                                                      (event: any) =>
                                                          event?.eventType_TaskingID ==
                                                          tasking.openTaskID,
                                                  )?.eventType_Tasking.time +
                                                  ' - ' +
                                                  currentTrip?.tripEvents?.nodes.find(
                                                      (event: any) =>
                                                          event?.eventType_TaskingID ==
                                                          tasking.openTaskID,
                                                  )?.eventType_Tasking.title,
                                              value: tasking.openTaskID,
                                          }
                                        : taskingResumedValue
                                }
                                placeholder="Select Task to continue"
                                onChange={handleTaskingGroupChange}
                                className={classes.selectMain}
                                classNames={{
                                    control: () =>
                                        'flex py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                    singleValue: () => 'dark:!text-white',
                                    menu: () => 'dark:bg-gray-800',
                                    option: () => classes.selectOption,
                                }}
                            />
                        )}
                        {type !== 'TaskingPaused' &&
                            type !== 'TaskingResumed' &&
                            type !== 'TaskingComplete' &&
                            type !== 'TaskingOnTow' &&
                            type !== 'TaskingOnScene' && (
                                <>
                                    {operationTypes && (
                                        <Select
                                            id="operation-type"
                                            options={operationTypes}
                                            menuPlacement="top"
                                            placeholder="Operation type"
                                            value={{
                                                label: currentOperationTypeLabel(
                                                    tasking?.operationType,
                                                ),
                                                value: currentOperationTypeValue(
                                                    tasking?.operationType,
                                                ),
                                            }}
                                            onChange={handleOperationTypeChange}
                                            className={classes.selectMain}
                                            classNames={{
                                                control: () =>
                                                    'flex py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                                singleValue: () =>
                                                    'dark:!text-white',
                                                menu: () => 'dark:bg-gray-800',
                                                option: () =>
                                                    classes.selectOption,
                                            }}
                                        />
                                    )}
                                </>
                            )}
                    </div>
                </div>
            </>
            {type !== 'TaskingPaused' &&
            type !== 'TaskingResumed' &&
            displayVessesRescueFields() ? (
                <VesselRescueFields
                    offline={offline}
                    geoLocations={geoLocations}
                    selectedEvent={findPreviousEvent(selectedEvent)}
                    closeModal={closeModal}
                    handleSaveParent={handleSave}
                    currentRescueID={findPreviousRescueID(
                        tasking.vesselRescueID,
                    )}
                    type={type}
                    eventCurrentLocation={{
                        currentLocation: currentLocation,
                        geoLocationID: tasking.geoLocationID,
                    }}
                />
            ) : (
                <></>
            )}
            {type !== 'TaskingPaused' &&
            type !== 'TaskingResumed' &&
            displayPersonRescueFields() ? (
                <PersonRescueField
                    offline={offline}
                    geoLocations={geoLocations}
                    selectedEvent={findPreviousEvent(selectedEvent)}
                    closeModal={closeModal}
                    handleSaveParent={handleSave}
                    currentRescueID={findPreviousHumanRescueID(
                        tasking.personRescueID,
                    )}
                    type={type}
                />
            ) : (
                <></>
            )}
            {type !== 'TaskingPaused' && type !== 'TaskingResumed' && (
                <>
                    <hr className="my-2" />
                    <div className="mt-6 text-sm font-semibold uppercase">
                        Incident type / number
                    </div>
                    <p className="text-xs font-inter max-w-[40rem] leading-loose">
                        Detail if incident was tasked by Police, RCCNZ or
                        Coastguard and associated incident number if applicable
                    </p>
                    <div className="flex w-full items-start flex-col">
                        <div
                            className={`${locked ? 'pointer-events-none' : ''} my-4 w-full flex items-center justify-between`}>
                            <label
                                className="relative flex items-center pr-3 rounded-full cursor-pointer min-w-64"
                                htmlFor="task-cgop"
                                data-ripple="true"
                                data-ripple-color="dark"
                                data-ripple-dark="true">
                                <input
                                    type="checkbox"
                                    id="task-cgop"
                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-sky-400 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-sky-500 before:opacity-0 before:transition-opacity checked:border-sky-700 checked:bg-sky-700 before:bg-sky-700 hover:before:opacity-10"
                                    checked={getPreviousCGOP(tasking?.cgop)}
                                    onChange={handleCgopChange}
                                />
                                <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-1/3 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"></span>
                                <span className="ml-3 text-sm font-semibold uppercase">
                                    CoastGuard Rescue
                                </span>
                            </label>
                            <input
                                id="cgop"
                                type="text"
                                className={classes.input}
                                aria-describedby="cgop-error"
                                value={getPreviousCGOP(tasking?.cgop)}
                                onChange={(e) => {
                                    setTasking({
                                        ...tasking,
                                        cgop: e.target.value,
                                        sarop: '',
                                    }),
                                        setCurrentIncident('cgop')
                                }}
                                required
                                placeholder="CG incident number"
                            />
                        </div>
                        <div
                            className={`${locked ? 'pointer-events-none' : ''} my-4 w-full flex items-center justify-between`}>
                            <label
                                className="relative flex items-center pr-3 rounded-full cursor-pointer min-w-64"
                                htmlFor="task-sarop"
                                data-ripple="true"
                                data-ripple-color="dark"
                                data-ripple-dark="true">
                                <input
                                    type="checkbox"
                                    id="task-sarop"
                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-sky-400 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-sky-500 before:opacity-0 before:transition-opacity checked:border-sky-700 checked:bg-sky-700 before:bg-sky-700 hover:before:opacity-10"
                                    checked={getPreviousSAROP(tasking?.sarop)}
                                    onChange={handleSaropChange}
                                />
                                <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-1/3 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"></span>
                                <span className="ml-3 text-sm font-semibold uppercase">
                                    SAROP
                                </span>
                            </label>
                            <input
                                id="sarop"
                                type="text"
                                className={classes.input}
                                onChange={(e) => {
                                    setTasking({
                                        ...tasking,
                                        sarop: e.target.value,
                                        cgop: '',
                                    }),
                                        setCurrentIncident('sarop')
                                }}
                                value={getPreviousSAROP(tasking?.sarop)}
                                aria-describedby="sarop-error"
                                required
                                placeholder="Police / RCCNZ number"
                            />
                        </div>
                    </div>
                </>
            )}
            {(type === 'TaskingPaused' || type === 'TaskingResumed') && (
                <FooterWrapper noBorder>
                    <SeaLogsButton
                        text="Cancel"
                        type="text"
                        // action={() => {
                        //     setOpenTripModal(false), setCurrentTrip(false)
                        // }}
                    />
                    <SeaLogsButton
                        text={selectedEvent ? 'Update' : 'Save'}
                        type="primary"
                        color="sky"
                        icon="check"
                        action={locked ? () => {} : handleSave(0, 0)}
                    />
                </FooterWrapper>
            )}
            <AlertDialog
                openDialog={openNewLocationDialog}
                setOpenDialog={setOpenNewLocationDialog}
                actionText="Add New Location"
                handleCreate={handleCreateNewLocation}>
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2 text-gray-700 dark:text-white">
                    Add New Location
                </Heading>
                <div className="my-4 flex items-center">
                    <input
                        id="new-location-title"
                        type="text"
                        className={classes.input}
                        aria-describedby="title-error"
                        required
                        placeholder="Location Title"
                    />
                </div>
                <div className="mb-4 flex items-center">
                    <Select
                        id="parent-location"
                        options={locations}
                        onChange={handleParentLocationChange}
                        menuPlacement="top"
                        placeholder="Parent Location (Optional)"
                        className="w-full bg-gray-100 rounded dark:bg-gray-800 text-sm"
                        classNames={{
                            control: () =>
                                'flex py-1 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                            singleValue: () => 'dark:!text-white',
                            dropdownIndicator: () => '!p-0 !hidden',
                            menu: () => 'dark:bg-gray-800',
                            indicatorSeparator: () => '!hidden',
                            multiValue: () =>
                                '!bg-sky-100 inline-flex rounded p-1 m-0 !mr-1.5 border border-sky-300 !rounded-md !text-sky-900 font-normal mr-2',
                            clearIndicator: () => '!py-0',
                            valueContainer: () => '!py-0',
                        }}
                    />
                </div>
                <div className="mb-4 flex items-center">
                    <input
                        id="new-location-latitude"
                        type="text"
                        defaultValue={location.latitude}
                        className={classes.input}
                        aria-describedby="latitude-error"
                        required
                        placeholder="Latitude"
                    />
                </div>
                <div className="flex items-center">
                    <input
                        id="new-location-longitude"
                        type="text"
                        defaultValue={location.longitude}
                        className={classes.input}
                        aria-describedby="longitude-error"
                        required
                        placeholder="Longitude"
                    />
                </div>
            </AlertDialog>
            <Toaster position="top-right" />
            <SlidingPanel type={'right'} isOpen={openRiskAnalysis} size={60}>
                <div className="h-[calc(100vh_-_1rem)] pt-4">
                    <div className="bg-orange-100 h-full flex flex-col justify-between rounded-l-lg">
                        <div className="text-xl dark:text-white text-white items-center flex justify-between font-medium py-4 px-6 rounded-tl-lg bg-orange-400">
                            <div>
                                Risk analysis{' '}
                                <span className="font-thin">
                                    Towing checklist
                                </span>
                            </div>
                            <XMarkIcon
                                className="w-6 h-6"
                                onClick={() => setOpenRiskAnalysis(false)}
                            />
                        </div>
                        <div
                            className={`${locked ? 'pointer-events-none' : ''} p-4 flex-grow overflow-scroll`}>
                            <RiskAnalysis
                                offline={offline}
                                selectedEvent={findPreviousEvent(selectedEvent)}
                                onSidebarClose={() =>
                                    setOpenRiskAnalysis(false)
                                }
                                logBookConfig={logBookConfig}
                                currentTrip={currentTrip}
                                crewMembers={members}
                                towingChecklistID={towingChecklistID}
                                logentryID={0}
                                setTowingChecklistID={setTowingChecklistID}
                            />
                            <SeaLogsButton
                                text="Save"
                                type="primary"
                                color="sky"
                                icon="check"
                                action={() => setOpenRiskAnalysis(false)}
                            />
                        </div>
                    </div>
                </div>
            </SlidingPanel>
        </div>
    )
}
