'use client'

import {
    AlertDialog,
    FooterWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import {
    LocalizationProvider,
    StaticDateTimePicker,
    StaticTimePicker,
} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import {
    Button,
    Dialog,
    DialogTrigger,
    Heading,
    Modal,
    ModalOverlay,
} from 'react-aria-components'
import {
    CreateEventType_VesselRescue,
    UpdateEventType_VesselRescue,
    CreateCGEventMission,
    UpdateCGEventMission,
    CreateTripEvent,
    UpdateTripEvent,
    CreateMissionTimeline,
    UpdateMissionTimeline,
} from '@/app/lib/graphQL/mutation'
import { GetTripEvent } from '@/app/lib/graphQL/query'
import Select from 'react-select'
import { getSeaLogsMembersList } from '@/app/lib/actions'
import Editor from '../../editor'
import { useLazyQuery, useMutation } from '@apollo/client'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import toast, { Toaster } from 'react-hot-toast'
import { classes } from '@/app/components/GlobalClasses'
import { formatDateTime } from '@/app/helpers/dateHelper'
import SeaLogsMemberModel from '@/app/offline/models/seaLogsMember'
import TripEventModel from '@/app/offline/models/tripEvent'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import EventType_VesselRescueModel from '@/app/offline/models/eventType_VesselRescue'
import CGEventMissionModel from '@/app/offline/models/cgEventMission'
import MissionTimelineModel from '@/app/offline/models/missionTimeline'

export default function VesselRescue({
    geoLocations,
    currentTrip = false,
    updateTripReport,
    selectedEvent = false,
    tripReport,
    closeModal,
    locked,
    offline = false,
}: {
    geoLocations: any
    currentTrip: any
    updateTripReport: any
    selectedEvent: any
    tripReport: any
    closeModal: any
    locked: any
    offline?: boolean
}) {
    const [locations, setLocations] = useState<any>(false)
    const [time, setTime] = useState<any>()
    const [openCommentsDialog, setOpenCommentsDialog] = useState(false)
    const [commentTime, setCommentTime] = useState<any>()
    const [members, setMembers] = useState<any>(false)
    const [content, setContent] = useState<any>()
    const [rescueData, setRescueData] = useState<any>(false)
    const [missionData, setMissionData] = useState<any>(false)
    const [commentData, setCommentData] = useState<any>(false)
    const [timeline, setTimeline] = useState<any>(false)
    const [currentEvent, setCurrentEvent] = useState<any>(selectedEvent)
    const memberModel = new SeaLogsMemberModel()
    const tripEventModel = new TripEventModel()
    const vesselRescueModel = new EventType_VesselRescueModel()
    const cgEventMissionModel = new CGEventMissionModel()
    const missionTimelineModel = new MissionTimelineModel()
    const handleTimeChange = (date: any) => {
        setTime(dayjs(date).format('HH:mm'))
    }

    useEffect(() => {
        setRescueData(false)
        if (selectedEvent) {
            setCurrentEvent(selectedEvent)
            getCurrentEvent(selectedEvent?.id)
        }
    }, [selectedEvent])

    useEffect(() => {
        setRescueData(false)
        if (currentEvent) {
            getCurrentEvent(currentEvent?.id)
        }
    }, [currentEvent])

    const getCurrentEvent = async (id: any) => {
        if (offline) {
            const event = await tripEventModel.getById(id)
            if (event) {
                setRescueData({
                    vesselName: event.eventType_VesselRescue?.vesselName,
                    callSign: event.eventType_VesselRescue?.callSign,
                    pob: event.eventType_VesselRescue?.pob,
                    latitude: event.eventType_VesselRescue?.latitude,
                    longitude: event.eventType_VesselRescue?.longitude,
                    locationDescription:
                        event.eventType_VesselRescue?.locationDescription,
                    vesselLength: event.eventType_VesselRescue?.vesselLength,
                    vesselType: event.eventType_VesselRescue?.vesselType,
                    makeAndModel: event.eventType_VesselRescue?.makeAndModel,
                    color: event.eventType_VesselRescue?.color,
                    ownerName: event.eventType_VesselRescue?.ownerName,
                    phone: event.eventType_VesselRescue?.phone,
                    email: event.eventType_VesselRescue?.email,
                    address: event.eventType_VesselRescue?.address,
                    ownerOnBoard: event.eventType_VesselRescue?.ownerOnBoard,
                    cgMembership: event.eventType_VesselRescue?.cgMembership,
                    locationID: event.eventType_VesselRescue?.vesselLocationID,
                    missionID: event.eventType_VesselRescue?.mission?.id,
                    operationType: event.eventType_VesselRescue?.operationType
                        ? operationType.filter((operation: any) =>
                              event.eventType_VesselRescue?.operationType
                                  .split(',')
                                  .includes(operation.value),
                          )
                        : [],
                    operationDescription:
                        event.eventType_VesselRescue?.operationDescription,
                    vesselTypeDescription:
                        event.eventType_VesselRescue?.vesselTypeDescription,
                })
                setTime(event.eventType_VesselRescue?.mission?.completedAt)
                setMissionData({
                    missionType:
                        event.eventType_VesselRescue?.mission?.missionType?.replaceAll(
                            '_',
                            ' ',
                        ),
                    description:
                        event.eventType_VesselRescue?.mission?.description,
                    operationOutcome:
                        event.eventType_VesselRescue?.mission?.operationOutcome?.replaceAll(
                            '_',
                            ' ',
                        ),
                    currentLocationID:
                        event.eventType_VesselRescue?.mission?.currentLocation
                            ?.id,
                    operationDescription:
                        event.eventType_VesselRescue?.mission
                            ?.operationDescription,
                })
                setTimeline(
                    event.eventType_VesselRescue?.mission?.missionTimeline
                        ?.nodes,
                )
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
                setRescueData({
                    vesselName: event.eventType_VesselRescue?.vesselName,
                    callSign: event.eventType_VesselRescue?.callSign,
                    pob: event.eventType_VesselRescue?.pob,
                    latitude: event.eventType_VesselRescue?.latitude,
                    longitude: event.eventType_VesselRescue?.longitude,
                    locationDescription:
                        event.eventType_VesselRescue?.locationDescription,
                    vesselLength: event.eventType_VesselRescue?.vesselLength,
                    vesselType: event.eventType_VesselRescue?.vesselType,
                    makeAndModel: event.eventType_VesselRescue?.makeAndModel,
                    color: event.eventType_VesselRescue?.color,
                    ownerName: event.eventType_VesselRescue?.ownerName,
                    phone: event.eventType_VesselRescue?.phone,
                    email: event.eventType_VesselRescue?.email,
                    address: event.eventType_VesselRescue?.address,
                    ownerOnBoard: event.eventType_VesselRescue?.ownerOnBoard,
                    cgMembership: event.eventType_VesselRescue?.cgMembership,
                    locationID: event.eventType_VesselRescue?.vesselLocationID,
                    missionID: event.eventType_VesselRescue?.mission?.id,
                    operationType: event.eventType_VesselRescue?.operationType
                        ? operationType.filter((operation: any) =>
                              event.eventType_VesselRescue?.operationType
                                  .split(',')
                                  .includes(operation.value),
                          )
                        : [],
                    operationDescription:
                        event.eventType_VesselRescue?.operationDescription,
                    vesselTypeDescription:
                        event.eventType_VesselRescue?.vesselTypeDescription,
                })
                setTime(event.eventType_VesselRescue?.mission?.completedAt)
                setMissionData({
                    missionType:
                        event.eventType_VesselRescue?.mission?.missionType?.replaceAll(
                            '_',
                            ' ',
                        ),
                    description:
                        event.eventType_VesselRescue?.mission?.description,
                    operationOutcome:
                        event.eventType_VesselRescue?.mission?.operationOutcome?.replaceAll(
                            '_',
                            ' ',
                        ),
                    currentLocationID:
                        event.eventType_VesselRescue?.mission?.currentLocation
                            ?.id,
                    operationDescription:
                        event.eventType_VesselRescue?.mission
                            ?.operationDescription,
                })
                setTimeline(
                    event.eventType_VesselRescue?.mission?.missionTimeline
                        ?.nodes,
                )
            }
        },
        onError: (error) => {
            console.error('Error getting current event', error)
        },
    })

    const handleSetMemberList = (members: any) => {
        setMembers(
            members
                ?.filter(
                    (member: any) =>
                        member.archived == false && member.firstName != '',
                )
                ?.map((member: any) => ({
                    label: member.firstName + ' ' + member.surname,
                    value: member.id,
                })),
        )
    }

    if (!offline) {
        getSeaLogsMembersList(handleSetMemberList)
    }
    const offlineGetMembers = async () => {
        const members = await memberModel.getAll()
        handleSetMemberList(members)
    }
    useEffect(() => {
        if (offline) {
            offlineGetMembers()
        }
    }, [offline])
    const handleCommentTimeChange = (date: any) => {
        setCommentTime(dayjs(date).format('DD/MM/YYYY HH:mm'))
    }

    useEffect(() => {
        if (geoLocations) {
            setLocations(
                geoLocations.map((location: any) => ({
                    label: location.title,
                    value: location.id,
                    latitude: location.lat,
                    longitude: location.long,
                })),
            )
        }
    }, [geoLocations])

    const vesselTypes = [
        //   { label: 'Commercial', value: 'Commercial' },
        { label: 'Power', value: 'Power' },
        { label: 'Sail', value: 'Sail' },
        { label: 'Paddle crafts', value: 'Paddle crafts' },
        { label: 'PWC', value: 'PWC' },
        { label: 'Other', value: 'Other' },
    ]

    const missions = [
        { label: 'To locate', value: 'To locate' },
        { label: 'To assist', value: 'To assist' },
        { label: 'To save', value: 'To save' },
        { label: 'To rescue', value: 'To rescue' },
        { label: 'To remove', value: 'To remove' },
    ]

    const operationOutcomes = [
        { label: 'Assisted by others', value: 'Assisted by others' },
        { label: 'Assisted on scene', value: 'Assisted on scene' },
        { label: 'Medical treatment', value: 'Medical treatment' },
        { label: 'Safe and well', value: 'Safe and well' },
        { label: 'Not located', value: 'Not located' },
        { label: 'Not recoverable', value: 'Not recoverable' },
        { label: 'Fatality', value: 'Fatality' },
        { label: 'Other', value: 'Other' },
    ]

    const commentTypes = [
        { label: 'General', value: 'General' },
        { label: 'Underway', value: 'Underway' },
        { label: 'On Scene', value: 'On Scene' },
    ]

    const operationType = [
        {
            label: 'Mechanical / equipment failure',
            value: 'Mechanical / equipment failure',
        },
        { label: 'Vessel adrift', value: 'Vessel adrift' },
        { label: 'Vessel aground', value: 'Vessel aground' },
        { label: 'Capsize', value: 'Capsize' },
        { label: 'Vessel requiring tow', value: 'Vessel requiring tow' },
        { label: 'Flare sighting', value: 'Flare sighting' },
        { label: 'Vessel sinking', value: 'Vessel sinking' },
        { label: 'Collision', value: 'Collision' },
        { label: 'Vessel overdue', value: 'Vessel overdue' },
        { label: 'Other', value: 'Other' },
    ]

    const handleSaveComments = async () => {
        if (rescueData?.missionID === undefined) {
            toast.error(
                'Please save the event first in order to create timeline!',
            )
            setOpenCommentsDialog(false)
            return
        }
        const variables = {
            input: {
                commentType: commentData?.commentType,
                description: content ? content : '',
                time: commentTime
                    ? commentTime
                    : dayjs().format('DD/MM/YYYY HH:mm'),
                authorID: commentData?.authorID,
                missionID: rescueData?.missionID,
            },
        }
        if (commentData?.id > 0) {
            if (offline) {
                await missionTimelineModel.save({
                    id: commentData?.id,
                    ...variables.input,
                })
                toast.success('Mission timeline updated')
                setOpenCommentsDialog(false)
                getCurrentEvent(selectedEvent?.id)
            } else {
                updateMissionTimeline({
                    variables: {
                        input: {
                            id: commentData?.id,
                            ...variables.input,
                        },
                    },
                })
            }
        } else {
            if (offline) {
                await missionTimelineModel.save({
                    id: generateUniqueId(),
                    ...variables.input,
                })
                toast.success('Mission timeline created')
                setOpenCommentsDialog(false)
                getCurrentEvent(selectedEvent?.id)
            } else {
                createMissionTimeline({
                    variables: {
                        input: {
                            ...variables.input,
                        },
                    },
                })
            }
        }
    }

    const [createMissionTimeline] = useMutation(CreateMissionTimeline, {
        onCompleted: (response) => {
            toast.success('Mission timeline created')
            setOpenCommentsDialog(false)
            getCurrentEvent(selectedEvent?.id)
        },
        onError: (error) => {
            console.error('Error creating mission timeline', error)
        },
    })

    const [updateMissionTimeline] = useMutation(UpdateMissionTimeline, {
        onCompleted: (response) => {
            toast.success('Mission timeline updated')
            setOpenCommentsDialog(false)
            getCurrentEvent(selectedEvent?.id)
        },
        onError: (error) => {
            console.error('Error updating mission timeline', error)
        },
    })

    const handleEditorChange = (newContent: any) => {
        setContent(newContent)
    }

    const handleSave = async () => {
        const variables = {
            input: {
                vesselName: rescueData.vesselName,
                callSign: rescueData.callSign,
                pob: +rescueData.pob,
                latitude: rescueData.latitude,
                longitude: rescueData.longitude,
                locationDescription: rescueData.locationDescription,
                vesselLength: +rescueData.vesselLength,
                vesselType: rescueData.vesselType,
                makeAndModel: rescueData.makeAndModel,
                color: rescueData.color,
                ownerName: rescueData.ownerName,
                phone: rescueData.phone,
                email: rescueData.email,
                address: rescueData.address,
                ownerOnBoard: rescueData.ownerOnBoard,
                cgMembershipType: 'cgnz',
                cgMembership: rescueData.cgMembership,
                missionID: rescueData.missionID,
                vesselLocationID: rescueData.locationID,
                operationType: rescueData.operationType
                    ?.map((type: any) => type.value)
                    .join(','),
                operationDescription: rescueData.operationDescription,
                vesselTypeDescription: rescueData.vesselTypeDescription,
            },
        }

        const mission = {
            input: {
                missionType: 'VesselRescue',
                description: missionData.description,
                operationDescription: missionData.operationDescription,
                operationOutcome: missionData.operationOutcome,
                completedAt: time,
                currentLocationID: missionData.currentLocationID,
                eventID: 0,
                eventType: 'VesselRescue',
                missionTimeline: [],
            },
        }

        if (currentEvent) {
            if (offline) {
                await tripEventModel.save({
                    id: +currentEvent.id,
                    eventCategory: 'VesselRescue',
                    logBookEntrySectionID: currentTrip.id,
                })
                toast.success('Trip event updated')
                getCurrentEvent(currentEvent?.id)
            } else {
                updateTripEvent({
                    variables: {
                        input: {
                            id: +currentEvent.id,
                            eventCategory: 'VesselRescue',
                            logBookEntrySectionID: currentTrip.id,
                        },
                    },
                })
            }
            if (offline) {
                const data = await vesselRescueModel.save({
                    id: +selectedEvent?.eventType_VesselRescueID,
                    ...variables.input,
                })
                const missionDataToSave = {
                    missionType: missionData.missionType,
                    description: missionData.description,
                    operationDescription: missionData.operationDescription,
                    operationOutcome: missionData.operationOutcome,
                    completedAt: time,
                    currentLocationID: missionData.currentLocationID,
                    eventID: +data?.id,
                    eventType: 'VesselRescue',
                }
                const id =
                    +rescueData.missionID > 0
                        ? rescueData.missionID
                        : generateUniqueId()
                await cgEventMissionModel.save({
                    id,
                    ...missionDataToSave,
                })
                getCurrentEvent(currentEvent?.id)
                updateTripReport(currentTrip)
                if (+rescueData.missionID > 0) {
                    updateTripReport({
                        id: tripReport.map((trip: any) => trip.id),
                    })
                } else {
                    updateTripReport({
                        id: [
                            ...tripReport.map((trip: any) => trip.id),
                            currentTrip.id,
                        ],
                    })
                }
            } else {
                updateEventType_VesselRescue({
                    variables: {
                        input: {
                            id: +selectedEvent?.eventType_VesselRescueID,
                            ...variables.input,
                        },
                    },
                })
            }
        } else {
            if (offline) {
                const tripEventData = await tripEventModel.save({
                    id: generateUniqueId(),
                    eventCategory: 'VesselRescue',
                    logBookEntrySectionID: currentTrip.id,
                })
                toast.success('Trip event created')
                setCurrentEvent(tripEventData)
                const vesselRescueData = await vesselRescueModel.save({
                    id: generateUniqueId(),
                    vesselName: rescueData.vesselName,
                    callSign: rescueData.callSign,
                    pob: +rescueData.pob,
                    latitude: rescueData.latitude,
                    longitude: rescueData.longitude,
                    locationDescription: rescueData.locationDescription,
                    vesselLength: +rescueData.vesselLength,
                    vesselType: rescueData.vesselType,
                    makeAndModel: rescueData.makeAndModel,
                    color: rescueData.color,
                    ownerName: rescueData.ownerName,
                    phone: rescueData.phone,
                    email: rescueData.email,
                    address: rescueData.address,
                    ownerOnBoard: rescueData.ownerOnBoard,
                    cgMembershipType: 'cgnz',
                    cgMembership: rescueData.cgMembership,
                    missionID: rescueData.missionID,
                    vesselLocationID: rescueData.locationID,
                    tripEventID: tripEventData.id,
                    operationType: rescueData.operationType
                        ?.map((type: any) => type.value)
                        .join(','),
                    operationDescription: rescueData.operationDescription,
                    vesselTypeDescription: rescueData.vesselTypeDescription,
                })
                await cgEventMissionModel.save({
                    id: generateUniqueId(),
                    missionType: missionData.missionType,
                    description: missionData.description,
                    operationDescription: missionData.operationDescription,
                    operationOutcome: missionData.operationOutcome,
                    completedAt: time,
                    currentLocationID: missionData.currentLocationID,
                    eventID: +vesselRescueData?.id,
                    eventType: 'VesselRescue',
                })
                await getCurrentEvent(currentEvent?.id)
                updateTripReport(currentTrip)
                updateTripReport({
                    id: [
                        ...tripReport.map((trip: any) => trip.id),
                        currentTrip.id,
                    ],
                })
                await tripEventModel.save({
                    id: currentEvent?.id,
                    eventType_VesselRescueID: vesselRescueData.id,
                })
                toast.success('Trip event updated')
                await getCurrentEvent(currentEvent?.id)
                closeModal()
            } else {
                createTripEvent({
                    variables: {
                        input: {
                            eventCategory: 'VesselRescue',
                            logBookEntrySectionID: currentTrip.id,
                        },
                    },
                })
            }
        }
    }

    const [createTripEvent] = useMutation(CreateTripEvent, {
        onCompleted: (response) => {
            toast.success('Trip event created')
            const data = response.createTripEvent
            setCurrentEvent(data)
            createEventType_VesselRescue({
                variables: {
                    input: {
                        vesselName: rescueData.vesselName,
                        callSign: rescueData.callSign,
                        pob: +rescueData.pob,
                        latitude: rescueData.latitude,
                        longitude: rescueData.longitude,
                        locationDescription: rescueData.locationDescription,
                        vesselLength: +rescueData.vesselLength,
                        vesselType: rescueData.vesselType,
                        makeAndModel: rescueData.makeAndModel,
                        color: rescueData.color,
                        ownerName: rescueData.ownerName,
                        phone: rescueData.phone,
                        email: rescueData.email,
                        address: rescueData.address,
                        ownerOnBoard: rescueData.ownerOnBoard,
                        cgMembershipType: 'cgnz',
                        cgMembership: rescueData.cgMembership,
                        missionID: rescueData.missionID,
                        vesselLocationID: rescueData.locationID,
                        tripEventID: data.id,
                        operationType: rescueData.operationType
                            ?.map((type: any) => type.value)
                            .join(','),
                        operationDescription: rescueData.operationDescription,
                        vesselTypeDescription: rescueData.vesselTypeDescription,
                    },
                },
            })
        },
        onError: (error) => {
            console.error('Error creating trip event', error)
        },
    })

    const [createEventType_VesselRescue] = useMutation(
        CreateEventType_VesselRescue,
        {
            onCompleted: (response) => {
                const data = response.createEventType_VesselRescue
                createCGEventMission({
                    variables: {
                        input: {
                            missionType: missionData.missionType,
                            description: missionData.description,
                            operationDescription:
                                missionData.operationDescription,
                            operationOutcome: missionData.operationOutcome,
                            completedAt: time,
                            currentLocationID: missionData.currentLocationID,
                            eventID: +data?.id,
                            eventType: 'VesselRescue',
                        },
                    },
                })
                updateTripEvent({
                    variables: {
                        input: {
                            id: currentEvent?.id,
                            eventType_VesselRescueID: data.id,
                        },
                    },
                })
                closeModal()
            },
            onError: (error) => {
                console.error('Error creating vessel rescue', error)
            },
        },
    )

    const [updateEventType_VesselRescue] = useMutation(
        UpdateEventType_VesselRescue,
        {
            onCompleted: (response) => {
                const data = response.updateEventType_VesselRescue
                if (rescueData.missionID > 0) {
                    updateCGEventMission({
                        variables: {
                            input: {
                                id: rescueData.missionID,
                                missionType: missionData.missionType,
                                description: missionData.description,
                                operationDescription:
                                    missionData.operationDescription,
                                operationOutcome: missionData.operationOutcome,
                                completedAt: time,
                                currentLocationID:
                                    missionData.currentLocationID,
                                eventID: +data?.id,
                                eventType: 'VesselRescue',
                            },
                        },
                    })
                } else {
                    createCGEventMission({
                        variables: {
                            input: {
                                missionType: missionData.missionType,
                                description: missionData.description,
                                operationDescription:
                                    missionData.operationDescription,
                                operationOutcome: missionData.operationOutcome,
                                completedAt: time,
                                currentLocationID:
                                    missionData.currentLocationID,
                                eventID: +data?.id,
                                eventType: 'VesselRescue',
                            },
                        },
                    })
                }
            },
            onError: (error) => {
                console.error('Error updating vessel rescue', error)
            },
        },
    )

    const [updateTripEvent] = useMutation(UpdateTripEvent, {
        onCompleted: (response) => {
            toast.success('Trip event updated')
            getCurrentEvent(currentEvent?.id)
        },
        onError: (error) => {
            console.error('Error updating trip event', error)
        },
    })

    const [createCGEventMission] = useMutation(CreateCGEventMission, {
        onCompleted: (response) => {
            getCurrentEvent(currentEvent?.id)
            updateTripReport(currentTrip)
            updateTripReport({
                id: [...tripReport.map((trip: any) => trip.id), currentTrip.id],
            })
        },
        onError: (error) => {
            console.error('Error creating CG Event Mission', error)
        },
    })

    const [updateCGEventMission] = useMutation(UpdateCGEventMission, {
        onCompleted: (response) => {
            getCurrentEvent(currentEvent?.id)
            updateTripReport(currentTrip)
            updateTripReport({
                id: tripReport.map((trip: any) => trip.id),
            })
        },
        onError: (error) => {
            console.error('Error updating CG Event Mission', error)
        },
    })

    return (
        <div className="px-0 md:px-4 pt-4">
            <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                <div className="my-4 text-xl col-span-3 md:col-span-1">
                    Target vessel and details
                    <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                        Record vessel name and callsign and include number of
                        people on board
                    </p>
                </div>
                <div className="col-span-3 md:col-span-2">
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        {operationType && (
                            <Select
                                id="operation-type"
                                options={operationType}
                                isMulti
                                isClearable
                                menuPlacement="top"
                                placeholder="Operation Type"
                                value={rescueData?.operationType}
                                onChange={(value: any) => {
                                    setRescueData({
                                        ...rescueData,
                                        operationType: value,
                                    })
                                }}
                                className={classes.selectMain}
                                classNames={{
                                    control: () =>
                                        'block py-1 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                    singleValue: () => 'dark:!text-white',
                                    dropdownIndicator: () => '!p-0 !hidden',
                                    menu: () => 'dark:bg-gray-800',
                                    indicatorSeparator: () => '!hidden',
                                    multiValue: () =>
                                        '!bg-sky-100 inline-block rounded p-0.5 py-px m-0 !mr-1.5 border border-sky-300 !rounded-md !text-sky-900 font-normal mr-2',
                                    clearIndicator: () => '!py-0',
                                    valueContainer: () => '!py-0',
                                    input: () => '!py-1',
                                    option: () => classes.selectOption,
                                }}
                            />
                        )}
                    </div>
                    {rescueData?.operationType?.find(
                        (operation: any) => operation.value == 'Other',
                    ) && (
                        <div
                            className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                            <textarea
                                id={`operation-description`}
                                rows={4}
                                className={classes.textarea}
                                placeholder="Operation description"
                                value={rescueData?.operationDescription}
                                onChange={() => {
                                    setRescueData({
                                        ...rescueData,
                                        operationDescription: (
                                            document.getElementById(
                                                'operation-description',
                                            ) as HTMLInputElement
                                        ).value,
                                    })
                                }}
                            />
                        </div>
                    )}
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <input
                            id="vessel-name"
                            type="text"
                            className={classes.input}
                            placeholder="Vessel Name"
                            value={rescueData?.vesselName}
                            onChange={() => {
                                setRescueData({
                                    ...rescueData,
                                    vesselName: (
                                        document.getElementById(
                                            'vessel-name',
                                        ) as HTMLInputElement
                                    ).value,
                                })
                            }}
                        />
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <input
                            id="call-sign"
                            type="text"
                            className={classes.input}
                            placeholder="Call Sign"
                            value={rescueData?.callSign}
                            onChange={() => {
                                setRescueData({
                                    ...rescueData,
                                    callSign: (
                                        document.getElementById(
                                            'call-sign',
                                        ) as HTMLInputElement
                                    ).value,
                                })
                            }}
                        />
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <input
                            id="pob"
                            type="number"
                            className={classes.input}
                            placeholder="Enter POB"
                            min={1}
                            value={rescueData?.pob}
                            onChange={() => {
                                setRescueData({
                                    ...rescueData,
                                    pob: (
                                        document.getElementById(
                                            'pob',
                                        ) as HTMLInputElement
                                    ).value,
                                })
                            }}
                        />
                    </div>
                </div>
            </div>
            <hr className="my-2" />
            <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                <div className="my-4 text-xl col-span-3 md:col-span-1">
                    Vessel location
                    <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                        Record the approximate location of vessel requiring
                        assistance
                    </p>
                </div>
                <div className="col-span-3 md:col-span-2">
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <div className="flex flex-col">
                            <label className="mb-1 text-sm">
                                Vessel position
                            </label>
                            <div className="flex gap-4">
                                <input
                                    id="location-lat"
                                    type="text"
                                    className={classes.input}
                                    placeholder="Latitude"
                                    value={rescueData?.latitude}
                                    onChange={() => {
                                        setRescueData({
                                            ...rescueData,
                                            latitude: (
                                                document.getElementById(
                                                    'location-lat',
                                                ) as HTMLInputElement
                                            ).value,
                                        })
                                    }}
                                />
                                <input
                                    id="location-long"
                                    type="text"
                                    className={classes.input}
                                    placeholder="Longitude"
                                    value={rescueData?.longitude}
                                    onChange={() => {
                                        setRescueData({
                                            ...rescueData,
                                            longitude: (
                                                document.getElementById(
                                                    'location-long',
                                                ) as HTMLInputElement
                                            ).value,
                                        })
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        {locations && (
                            <Select
                                id="geo-location"
                                options={locations}
                                menuPlacement="top"
                                placeholder="Select Location"
                                className={classes.selectMain}
                                value={
                                    locations?.find(
                                        (location: any) =>
                                            location.value ==
                                            rescueData?.locationID,
                                    )
                                        ? locations?.find(
                                              (location: any) =>
                                                  location.value ==
                                                  rescueData?.locationID,
                                          )
                                        : null
                                }
                                onChange={(value: any) => {
                                    setRescueData({
                                        ...rescueData,
                                        locationID: value?.value,
                                    })
                                }}
                                classNames={{
                                    control: () =>
                                        'flex py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                    singleValue: () => 'dark:!text-white',
                                    menu: () => 'dark:bg-gray-800',
                                    option: () => classes.selectOption,
                                }}
                            />
                        )}
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <textarea
                            id={`location-description`}
                            rows={4}
                            className={classes.textarea}
                            placeholder="Location description"
                            value={rescueData?.locationDescription}
                            onChange={() => {
                                setRescueData({
                                    ...rescueData,
                                    locationDescription: (
                                        document.getElementById(
                                            'location-description',
                                        ) as HTMLInputElement
                                    ).value,
                                })
                            }}
                        />
                    </div>
                </div>
            </div>
            <hr className="my-2" />
            <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                <div className="my-4 text-xl col-span-3 md:col-span-1">
                    Vessel description
                    <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                        Include details of vessel type, make and descriptors
                    </p>
                </div>
                <div className="col-span-3 md:col-span-2">
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <input
                            id="vessel-length"
                            type="number"
                            className={classes.input}
                            placeholder="Vessel Length"
                            value={rescueData?.vesselLength}
                            min={1}
                            onChange={() => {
                                setRescueData({
                                    ...rescueData,
                                    vesselLength: (
                                        document.getElementById(
                                            'vessel-length',
                                        ) as HTMLInputElement
                                    ).value,
                                })
                            }}
                        />
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <Select
                            id="vessel-type"
                            options={vesselTypes}
                            menuPlacement="top"
                            value={
                                vesselTypes?.find(
                                    (type: any) =>
                                        type.value == rescueData?.vesselType,
                                )
                                    ? vesselTypes?.find(
                                          (type: any) =>
                                              type.value ==
                                              rescueData?.vesselType,
                                      )
                                    : null
                            }
                            placeholder="Vessel Type"
                            className={classes.selectMain}
                            onChange={(value: any) => {
                                setRescueData({
                                    ...rescueData,
                                    vesselType: value?.value,
                                })
                            }}
                            classNames={{
                                control: () =>
                                    'flex py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                singleValue: () => 'dark:!text-white',
                                menu: () => 'dark:bg-gray-800',
                                option: () => classes.selectOption,
                            }}
                        />
                    </div>
                    {rescueData?.vesselType == 'Other' && (
                        <div
                            className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                            <textarea
                                id="vessel-type-description"
                                rows={4}
                                className={classes.textarea}
                                placeholder="Vessel Description"
                                value={rescueData?.vesselTypeDescription}
                                onChange={() => {
                                    setRescueData({
                                        ...rescueData,
                                        vesselTypeDescription: (
                                            document.getElementById(
                                                'vessel-type-description',
                                            ) as HTMLInputElement
                                        ).value,
                                    })
                                }}
                            />
                        </div>
                    )}
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <input
                            id="make"
                            type="text"
                            className={classes.input}
                            placeholder="Make and model"
                            value={rescueData?.makeAndModel}
                            onChange={() => {
                                setRescueData({
                                    ...rescueData,
                                    makeAndModel: (
                                        document.getElementById(
                                            'make',
                                        ) as HTMLInputElement
                                    ).value,
                                })
                            }}
                        />
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <input
                            id="color"
                            type="text"
                            className={classes.input}
                            placeholder="Color"
                            value={rescueData?.color}
                            onChange={() => {
                                setRescueData({
                                    ...rescueData,
                                    color: (
                                        document.getElementById(
                                            'color',
                                        ) as HTMLInputElement
                                    ).value,
                                })
                            }}
                        />
                    </div>
                </div>
            </div>
            <hr className="my-2" />
            <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                <div className="my-4 text-xl col-span-3 md:col-span-1">
                    Owners details
                    <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                        Record vessel owners’ details and membership number if
                        applicable
                    </p>
                </div>
                <div className="col-span-3 md:col-span-2">
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <div className="flex gap-4">
                            <input
                                id="owner-name"
                                type="text"
                                className={classes.input}
                                placeholder="Owners name"
                                value={rescueData?.ownerName}
                                onChange={() => {
                                    setRescueData({
                                        ...rescueData,
                                        ownerName: (
                                            document.getElementById(
                                                'owner-name',
                                            ) as HTMLInputElement
                                        ).value,
                                    })
                                }}
                            />
                            <input
                                id="owner-phone"
                                type="text"
                                className={classes.input}
                                placeholder="Phone number"
                                value={rescueData?.phone}
                                onChange={() => {
                                    setRescueData({
                                        ...rescueData,
                                        phone: (
                                            document.getElementById(
                                                'owner-phone',
                                            ) as HTMLInputElement
                                        ).value,
                                    })
                                }}
                            />
                        </div>
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <div className="flex gap-4">
                            <input
                                id="cgnz"
                                type="text"
                                className={classes.input}
                                placeholder="Coastguard NZ membership"
                                value={rescueData?.cgMembership}
                                onChange={() => {
                                    setRescueData({
                                        ...rescueData,
                                        cgMembership: (
                                            document.getElementById(
                                                'cgnz',
                                            ) as HTMLInputElement
                                        ).value,
                                    })
                                }}
                            />
                            <input
                                id="owner-email"
                                type="text"
                                className={classes.input}
                                placeholder="Email Address"
                                value={rescueData?.email}
                                onChange={() => {
                                    setRescueData({
                                        ...rescueData,
                                        email: (
                                            document.getElementById(
                                                'owner-email',
                                            ) as HTMLInputElement
                                        ).value,
                                    })
                                }}
                            />
                        </div>
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <textarea
                            id={`owner-address`}
                            rows={4}
                            className={classes.textarea}
                            placeholder="Owners address"
                            value={rescueData?.address}
                            onChange={() => {
                                setRescueData({
                                    ...rescueData,
                                    address: (
                                        document.getElementById(
                                            'owner-address',
                                        ) as HTMLInputElement
                                    ).value,
                                })
                            }}
                        />
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} inline-flex items-center`}>
                        <label
                            className="relative flex items-center pr-3 rounded-full cursor-pointer"
                            htmlFor="task-onChangeComplete"
                            data-ripple="true"
                            data-ripple-color="dark"
                            data-ripple-dark="true">
                            <input
                                type="checkbox"
                                id="task-onChangeComplete"
                                className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-sky-400 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-sky-500 before:opacity-0 before:transition-opacity checked:border-sky-700 checked:bg-sky-700 before:bg-sky-700 hover:before:opacity-10"
                                checked={rescueData?.ownerOnBoard}
                                onChange={(e: any) => {
                                    setRescueData({
                                        ...rescueData,
                                        ownerOnBoard: e.target.checked,
                                    })
                                }}
                            />
                            <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-1/3 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"></span>
                            <span className="ml-3 text-sm font-semibold uppercase">
                                is the owner on-board?
                            </span>
                        </label>
                    </div>
                </div>
            </div>
            <hr className="my-2" />
            <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                <div className="my-4 text-xl col-span-3 md:col-span-1">
                    Mission
                    <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Quod eveniet quaerat voluptates voluptatem quam odio
                        magnam, culpa accusantium at dolore, corrupti rem
                        reiciendis repudiandae cumque veritatis? Blanditiis
                        quibusdam nostrum suscipit?
                    </p>
                </div>
                <div className="col-span-3 md:col-span-2">
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <Select
                            id="mission"
                            options={missions}
                            menuPlacement="top"
                            placeholder="Mission Type"
                            value={
                                missions?.find(
                                    (mission: any) =>
                                        mission.value ==
                                        missionData?.missionType,
                                )
                                    ? missions?.find(
                                          (mission: any) =>
                                              mission.value ==
                                              missionData?.missionType,
                                      )
                                    : null
                            }
                            className={classes.selectMain}
                            onChange={(value: any) => {
                                setMissionData({
                                    ...missionData,
                                    missionType: value?.value,
                                })
                            }}
                            classNames={{
                                control: () =>
                                    'flex py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                singleValue: () => 'dark:!text-white',
                                menu: () => 'dark:bg-gray-800',
                                option: () => classes.selectOption,
                            }}
                        />
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <textarea
                            id={`mission-description`}
                            rows={4}
                            className={classes.textarea}
                            placeholder="Mission description"
                            value={missionData?.description}
                            onChange={() => {
                                setMissionData({
                                    ...missionData,
                                    description: (
                                        document.getElementById(
                                            'mission-description',
                                        ) as HTMLInputElement
                                    ).value,
                                })
                            }}
                        />
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <div className="flex flex-col">
                            <label className="mb-1 text-sm">
                                Mission timeline
                            </label>
                            <div className="flex gap-4 flex-col">
                                {timeline &&
                                    timeline?.map(
                                        (comment: any, index: number) => (
                                            <div
                                                key={index}
                                                className="flex flex-col gap-4 w-full mb-2">
                                                <div className="flex gap-4 justify-between">
                                                    <div
                                                        className="comment-html"
                                                        dangerouslySetInnerHTML={{
                                                            __html: comment.description,
                                                        }}></div>
                                                    <div className="flex gap-4">
                                                        {comment.author.id >
                                                            0 && (
                                                            <p className="text-sm">
                                                                {comment.author
                                                                    .firstName +
                                                                    ' ' +
                                                                    comment
                                                                        .author
                                                                        .surname}
                                                            </p>
                                                        )}
                                                        <p className="text-sm">
                                                            {formatDateTime(
                                                                comment.time,
                                                            )}
                                                        </p>
                                                        <Button className="w-5 h-5">
                                                            <PencilSquareIcon
                                                                className="w-5 h-5"
                                                                onClick={() => {
                                                                    setOpenCommentsDialog(
                                                                        true,
                                                                    ),
                                                                        setCommentData(
                                                                            comment,
                                                                        ),
                                                                        handleEditorChange(
                                                                            comment.description,
                                                                        ),
                                                                        setCommentTime(
                                                                            dayjs(
                                                                                comment.time,
                                                                            ).format(
                                                                                'DD/MM/YYYY HH:mm',
                                                                            ),
                                                                        )
                                                                }}
                                                            />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    )}
                            </div>
                            <div>
                                <SeaLogsButton
                                    text="Add Notes/Comments"
                                    type="text"
                                    icon="plus"
                                    action={() => {
                                        setOpenCommentsDialog(true),
                                            handleEditorChange(''),
                                            setCommentData(false)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <hr className="my-2" />
            <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                <div className="my-4 text-xl col-span-3 md:col-span-1">
                    Mission complete
                    <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                        Record the operation outcome, location and time of
                        completion
                    </p>
                </div>
                <div className="col-span-3 md:col-span-2">
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <Select
                            id="operation-outcome"
                            options={operationOutcomes}
                            menuPlacement="top"
                            placeholder="Operation outcome"
                            value={
                                operationOutcomes?.find(
                                    (outcome: any) =>
                                        outcome.value ==
                                        missionData?.operationOutcome,
                                )
                                    ? operationOutcomes?.find(
                                          (outcome: any) =>
                                              outcome.value ==
                                              missionData?.operationOutcome,
                                      )
                                    : null
                            }
                            className={classes.selectMain}
                            onChange={(value: any) => {
                                setMissionData({
                                    ...missionData,
                                    operationOutcome: value?.value,
                                })
                            }}
                            classNames={{
                                control: () =>
                                    'flex py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                singleValue: () => 'dark:!text-white',
                                menu: () => 'dark:bg-gray-800',
                                option: () => classes.selectOption,
                            }}
                        />
                    </div>
                    {missionData?.operationOutcome == 'Other' && (
                        <div
                            className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                            <textarea
                                id={`operation-outcome-description`}
                                rows={4}
                                className={classes.textarea}
                                placeholder="Description"
                                value={missionData?.operationDescription}
                                onChange={() => {
                                    setMissionData({
                                        ...missionData,
                                        operationDescription: (
                                            document.getElementById(
                                                'operation-outcome-description',
                                            ) as HTMLInputElement
                                        ).value,
                                    })
                                }}
                            />
                        </div>
                    )}
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <DialogTrigger>
                            <Button className={`w-full`}>
                                <input
                                    id="complete-time"
                                    name="complete-time"
                                    type="text"
                                    value={time}
                                    className={classes.input}
                                    aria-describedby="complete-time-error"
                                    required
                                    placeholder="Time of completion"
                                    onChange={() => handleTimeChange}
                                />
                            </Button>
                            <ModalOverlay
                                className={({ isEntering, isExiting }) => `
                                fixed inset-0 z-[15002] overflow-y-auto bg-black/25 flex min-h-full justify-center p-4 text-center backdrop-blur
                                ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                                ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                                `}>
                                <Modal>
                                    <Dialog
                                        role="alertdialog"
                                        className="outline-none relative">
                                        {({ close }) => (
                                            <LocalizationProvider
                                                dateAdapter={AdapterDayjs}>
                                                <StaticTimePicker
                                                    className={`p-0 mr-4`}
                                                    value={time}
                                                    onAccept={close}
                                                    onClose={close}
                                                    onChange={handleTimeChange}
                                                />
                                            </LocalizationProvider>
                                        )}
                                    </Dialog>
                                </Modal>
                            </ModalOverlay>
                        </DialogTrigger>
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        {locations && (
                            <Select
                                id="completed-geo-location"
                                options={locations}
                                menuPlacement="top"
                                placeholder="Current Location"
                                className={classes.selectMain}
                                value={
                                    locations?.find(
                                        (location: any) =>
                                            location.value ==
                                            missionData?.currentLocationID,
                                    )
                                        ? locations?.find(
                                              (location: any) =>
                                                  location.value ==
                                                  missionData?.currentLocationID,
                                          )
                                        : null
                                }
                                onChange={(value: any) => {
                                    setMissionData({
                                        ...missionData,
                                        currentLocationID: value?.value,
                                    })
                                }}
                                classNames={{
                                    control: () =>
                                        'flex py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                    singleValue: () => 'dark:!text-white',
                                    menu: () => 'dark:bg-gray-800',
                                    option: () => classes.selectOption,
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
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
                    action={locked ? () => {} : handleSave}
                />
            </FooterWrapper>
            <AlertDialog
                openDialog={openCommentsDialog}
                setOpenDialog={setOpenCommentsDialog}
                handleCreate={handleSaveComments}
                actionText={commentData?.id > 0 ? 'Update' : 'Create Comment'}>
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2 text-gray-700 dark:text-white">
                    {commentData?.id > 0
                        ? 'Update Comment'
                        : 'Create New Comment'}
                </Heading>
                <div className="my-4 flex items-center">
                    <Select
                        id="comment-type"
                        options={commentTypes}
                        menuPlacement="top"
                        placeholder="Comment type"
                        value={
                            commentTypes?.find(
                                (type: any) =>
                                    type.value ==
                                    commentData?.commentType?.replaceAll(
                                        '_',
                                        ' ',
                                    ),
                            )
                                ? commentTypes?.find(
                                      (type: any) =>
                                          type.value ==
                                          commentData?.commentType?.replaceAll(
                                              '_',
                                              ' ',
                                          ),
                                  )
                                : null
                        }
                        onChange={(value: any) =>
                            setCommentData({
                                ...commentData,
                                commentType: value?.value,
                            })
                        }
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
                <div className="mb-4 flex items-center">
                    <DialogTrigger>
                        <Button className={`w-full`}>
                            <input
                                id="comment-time"
                                name="comment-time"
                                type="text"
                                value={
                                    commentTime
                                        ? formatDateTime(commentTime)
                                        : formatDateTime('')
                                }
                                className={classes.input}
                                aria-describedby="comment-time-error"
                                required
                                placeholder="Time of completion"
                                onChange={() => handleCommentTimeChange}
                            />
                        </Button>
                        <ModalOverlay
                            className={({ isEntering, isExiting }) => `
                                fixed inset-0 z-[15002] overflow-y-auto bg-black/25 flex min-h-full justify-center p-4 text-center backdrop-blur
                                ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                                ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                                `}>
                            <Modal>
                                <Dialog
                                    role="alertdialog"
                                    className="outline-none relative">
                                    {({ close }) => (
                                        <LocalizationProvider
                                            dateAdapter={AdapterDayjs}>
                                            <StaticDateTimePicker
                                                className={`p-0 mr-4`}
                                                value={commentTime}
                                                onAccept={close}
                                                onClose={close}
                                                onChange={
                                                    handleCommentTimeChange
                                                }
                                            />
                                        </LocalizationProvider>
                                    )}
                                </Dialog>
                            </Modal>
                        </ModalOverlay>
                    </DialogTrigger>
                </div>
                <div className="mb-10 flex items-center">
                    <Editor
                        id="comment"
                        placeholder="Comment"
                        className="w-full"
                        content={content}
                        handleEditorChange={handleEditorChange}
                    />
                </div>
                <div className="flex items-center">
                    {members && (
                        <Select
                            id="comment-author"
                            options={members}
                            menuPlacement="top"
                            placeholder="Author"
                            defaultValue={
                                members?.find(
                                    (member: any) =>
                                        member.value == commentData?.author?.id,
                                )
                                    ? members?.find(
                                          (member: any) =>
                                              member.value ==
                                              commentData?.author?.id,
                                      )
                                    : null
                            }
                            className={classes.selectMain}
                            onChange={(value: any) =>
                                setCommentData({
                                    ...commentData,
                                    authorID: value?.value,
                                })
                            }
                            classNames={{
                                control: () =>
                                    'flex py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                singleValue: () => 'dark:!text-white',
                                menu: () => 'dark:bg-gray-800',
                                option: () => classes.selectOption,
                            }}
                        />
                    )}
                </div>
            </AlertDialog>
            <Toaster position="top-right" />
        </div>
    )
}
