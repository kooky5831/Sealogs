'use client'

import {
    AlertDialog,
    FooterWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import { LocalizationProvider, StaticDateTimePicker } from '@mui/x-date-pickers'
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
    CreateMissionTimeline,
    UpdateMissionTimeline,
} from '@/app/lib/graphQL/mutation'
import { GetTripEvent_VesselRescue } from '@/app/lib/graphQL/query'
import Select from 'react-select'
import { getSeaLogsMembersList } from '@/app/lib/actions'
import Editor from '../../editor'
import { useLazyQuery, useMutation } from '@apollo/client'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast, { Toaster } from 'react-hot-toast'
import { classes } from '@/app/components/GlobalClasses'
import LocationField from '../components/location'
import TimeField from '../components/time'
import { formatDateTime } from '@/app/helpers/dateHelper'
import SeaLogsMemberModel from '@/app/offline/models/seaLogsMember'
import EventType_VesselRescueModel from '@/app/offline/models/eventType_VesselRescue'
import CGEventMissionModel from '@/app/offline/models/cgEventMission'
import MissionTimelineModel from '@/app/offline/models/missionTimeline'
import { generateUniqueId } from '@/app/offline/helpers/functions'

export default function VesselRescueFields({
    geoLocations,
    selectedEvent = false,
    closeModal,
    handleSaveParent,
    currentRescueID,
    type,
    eventCurrentLocation,
    offline = false,
}: {
    geoLocations: any
    selectedEvent: any
    closeModal: any
    handleSaveParent: any
    currentRescueID: any
    type: any
    eventCurrentLocation: any
    offline?: boolean
}) {
    const [locations, setLocations] = useState<any>(false)
    const [time, setTime] = useState<any>(dayjs().format('HH:mm'))
    const [openCommentsDialog, setOpenCommentsDialog] = useState(false)
    const [commentTime, setCommentTime] = useState<any>()
    const [members, setMembers] = useState<any>(false)
    const [content, setContent] = useState<any>()
    const [rescueData, setRescueData] = useState<any>(false)
    const [missionData, setMissionData] = useState<any>(false)
    const [commentData, setCommentData] = useState<any>(false)
    const [timeline, setTimeline] = useState<any>(false)
    const [deleteCommentsDialog, setDeleteCommentsDialog] = useState(false)
    const [currentLocation, setCurrentLocation] = useState<any>({
        latitude: '',
        longitude: '',
    })
    const [currentMissionLocation, setCurrentMissionLocation] = useState<any>({
        latitude: '',
        longitude: '',
    })
    const memberModel = new SeaLogsMemberModel()
    const vesselRescueModel = new EventType_VesselRescueModel()
    const cgEventMissionModel = new CGEventMissionModel()
    const missionTimelineModel = new MissionTimelineModel()
    const handleTimeChange = (date: any) => {
        setTime(dayjs(date).format('HH:mm'))
    }

    useEffect(() => {
        setRescueData(false)
        if (currentRescueID) {
            getCurrentEvent(currentRescueID)
        }
    }, [currentRescueID])

    useEffect(() => {
        setCurrentLocation(eventCurrentLocation?.currentLocation)
    }, [eventCurrentLocation])

    const getCurrentEvent = async (currentRescueID: any) => {
        if (currentRescueID > 0) {
            if (offline) {
                const event = await vesselRescueModel.getById(currentRescueID)
                if (event) {
                    setRescueData({
                        vesselName: event?.vesselName ? event?.vesselName : '',
                        callSign: event?.callSign ? event?.callSign : '',
                        pob: event?.pob ? event?.pob : '',
                        latitude: event?.latitude
                            ? event?.latitude
                            : eventCurrentLocation?.latitude,
                        longitude: event?.longitude
                            ? event?.longitude
                            : eventCurrentLocation?.longitude,
                        locationDescription: event?.locationDescription
                            ? event?.locationDescription
                            : '',
                        vesselLength: event?.vesselLength
                            ? event?.vesselLength
                            : '',
                        vesselType: event?.vesselType ? event?.vesselType : '',
                        makeAndModel: event?.makeAndModel
                            ? event?.makeAndModel
                            : '',
                        color: event?.color ? event?.color : '',
                        ownerName: event?.ownerName ? event?.ownerName : '',
                        phone: event?.phone ? event?.phone : '',
                        email: event?.email ? event?.email : '',
                        address: event?.address ? event?.address : '',
                        ownerOnBoard: event?.ownerOnBoard
                            ? event?.ownerOnBoard
                            : false,
                        cgMembership: event?.cgMembership
                            ? event?.cgMembership
                            : '',
                        locationID: event?.vesselLocationID
                            ? event?.vesselLocationID
                            : eventCurrentLocation?.geoLocationID,
                        missionID: event?.mission?.id ? event?.mission?.id : '',
                        operationType: event?.operationType
                            ? operationType.filter((operation: any) =>
                                  event?.operationType
                                      .split(',')
                                      .includes(operation.value),
                              )
                            : [],
                        operationDescription: event?.operationDescription
                            ? event?.operationDescription
                            : '',
                        vesselTypeDescription: event?.vesselTypeDescription
                            ? event?.vesselTypeDescription
                            : '',
                    })
                    setTime(event?.mission?.completedAt)
                    setMissionData({
                        missionType: event?.mission?.missionType?.replaceAll(
                            '_',
                            ' ',
                        ),
                        description: event?.mission?.description,
                        operationOutcome:
                            event?.mission?.operationOutcome?.replaceAll(
                                '_',
                                ' ',
                            ),
                        currentLocationID: event?.mission?.currentLocation?.id,
                        operationDescription:
                            event?.mission?.operationDescription,
                        lat: event?.mission?.currentLocation?.lat,
                        long: event?.mission?.currentLocation?.long,
                    })
                    setTimeline(event?.missionTimeline?.nodes)
                    setCurrentLocation({
                        latitude: event?.mission?.currentLocation?.lat,
                        longitude: event?.mission?.currentLocation?.long,
                    })
                    setCurrentMissionLocation({
                        latitude: event?.lat,
                        longitude: event?.long,
                    })
                }
            } else {
                getTripEvent({
                    variables: {
                        id: +currentRescueID,
                    },
                })
            }
        }
    }

    const [getTripEvent] = useLazyQuery(GetTripEvent_VesselRescue, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const event = response.readOneEventType_VesselRescue
            if (event) {
                setRescueData({
                    vesselName: event?.vesselName ? event?.vesselName : '',
                    callSign: event?.callSign ? event?.callSign : '',
                    pob: event?.pob ? event?.pob : '',
                    latitude: event?.latitude
                        ? event?.latitude
                        : eventCurrentLocation?.latitude,
                    longitude: event?.longitude
                        ? event?.longitude
                        : eventCurrentLocation?.longitude,
                    locationDescription: event?.locationDescription
                        ? event?.locationDescription
                        : '',
                    vesselLength: event?.vesselLength
                        ? event?.vesselLength
                        : '',
                    vesselType: event?.vesselType ? event?.vesselType : '',
                    makeAndModel: event?.makeAndModel
                        ? event?.makeAndModel
                        : '',
                    color: event?.color ? event?.color : '',
                    ownerName: event?.ownerName ? event?.ownerName : '',
                    phone: event?.phone ? event?.phone : '',
                    email: event?.email ? event?.email : '',
                    address: event?.address ? event?.address : '',
                    ownerOnBoard: event?.ownerOnBoard
                        ? event?.ownerOnBoard
                        : false,
                    cgMembership: event?.cgMembership
                        ? event?.cgMembership
                        : '',
                    locationID: event?.vesselLocationID
                        ? event?.vesselLocationID
                        : eventCurrentLocation?.geoLocationID,
                    missionID: event?.mission?.id ? event?.mission?.id : '',
                    operationType: event?.operationType
                        ? operationType.filter((operation: any) =>
                              event?.operationType
                                  .split(',')
                                  .includes(operation.value),
                          )
                        : [],
                    operationDescription: event?.operationDescription
                        ? event?.operationDescription
                        : '',
                    vesselTypeDescription: event?.vesselTypeDescription
                        ? event?.vesselTypeDescription
                        : '',
                })
                setTime(event?.mission?.completedAt)
                setMissionData({
                    missionType: event?.mission?.missionType?.replaceAll(
                        '_',
                        ' ',
                    ),
                    description: event?.mission?.description,
                    operationOutcome:
                        event?.mission?.operationOutcome?.replaceAll('_', ' '),
                    currentLocationID: event?.mission?.currentLocation?.id,
                    operationDescription: event?.mission?.operationDescription,
                    lat: event?.mission?.currentLocation?.lat,
                    long: event?.mission?.currentLocation?.long,
                })
                setTimeline(event?.missionTimeline?.nodes)
                setCurrentLocation({
                    latitude: event?.mission?.currentLocation?.lat,
                    longitude: event?.mission?.currentLocation?.long,
                })
                setCurrentMissionLocation({
                    latitude: event?.lat,
                    longitude: event?.long,
                })
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
        //    { label: 'Commercial', value: 'Commercial' },
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
        { label: 'Stood down', value: 'Stood down' },
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
                commentType: commentData?.commentType
                    ? commentData?.commentType
                    : 'General',
                description: content ? content : '',
                time: commentTime
                    ? commentTime
                    : dayjs().format('DD/MM/YYYY HH:mm'),
                authorID: commentData?.authorID,
                // missionID: rescueData?.missionID,
                vesselRescueID: currentRescueID,
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
                setDeleteCommentsDialog(false)
                getCurrentEvent(currentRescueID)
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
                setDeleteCommentsDialog(false)
                await getCurrentEvent(currentRescueID)
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
        setOpenCommentsDialog(false)
    }

    const [createMissionTimeline] = useMutation(CreateMissionTimeline, {
        onCompleted: (response) => {
            toast.success('Mission timeline created')
            setOpenCommentsDialog(false)
            setDeleteCommentsDialog(false)
            getCurrentEvent(currentRescueID)
        },
        onError: (error) => {
            console.error('Error creating mission timeline', error)
        },
    })

    const [updateMissionTimeline] = useMutation(UpdateMissionTimeline, {
        onCompleted: (response) => {
            toast.success('Mission timeline updated')
            setOpenCommentsDialog(false)
            setDeleteCommentsDialog(false)
            getCurrentEvent(currentRescueID)
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
                latitude:
                    rescueData.latitude > 0
                        ? rescueData.latitude?.toString()
                        : currentLocation.latitude?.toString(),

                longitude:
                    rescueData.longitude > 0
                        ? rescueData.longitude?.toString()
                        : currentLocation.longitude?.toString(),
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
                vesselLocationID:
                    rescueData.locationID > 0
                        ? rescueData.locationID
                        : eventCurrentLocation.geoLocationID,
                operationType: rescueData.operationType
                    ?.map((type: any) => type.value)
                    .join(','),
                operationDescription: rescueData.operationDescription,
                vesselTypeDescription: rescueData.vesselTypeDescription,
            },
        }

        if (currentRescueID > 0) {
            if (offline) {
                const data = await vesselRescueModel.save({
                    id: +currentRescueID,
                    ...variables.input,
                })
                if (rescueData.missionID > 0) {
                    await cgEventMissionModel.save({
                        id: rescueData.missionID,
                        missionType: missionData.missionType,
                        description: missionData.description,
                        operationDescription: missionData.operationDescription,
                        operationOutcome: missionData.operationOutcome,
                        completedAt: time,
                        currentLocationID: rescueData.locationID,
                        eventID: +data?.id,
                        eventType: 'VesselRescue',
                        lat: currentMissionLocation.latitude?.toString(),
                        long: currentMissionLocation.longitude?.toString(),
                    })
                } else {
                    await cgEventMissionModel.save({
                        id: generateUniqueId(),
                        missionType: missionData.missionType,
                        description: missionData.description,
                        operationDescription: missionData.operationDescription,
                        operationOutcome: missionData.operationOutcome,
                        completedAt: time,
                        currentLocationID: rescueData.currentLocationID,
                        eventID: +data?.id,
                        eventType: 'VesselRescue',
                        lat: currentMissionLocation.latitude.toString(),
                        long: currentMissionLocation.longitude.toString(),
                    })
                }
                handleSaveParent(+currentRescueID, 0)
            } else {
                updateEventType_VesselRescue({
                    variables: {
                        input: {
                            id: +currentRescueID,
                            ...variables.input,
                        },
                    },
                })
            }
        } else {
            if (offline) {
                const data = await vesselRescueModel.save({
                    id: generateUniqueId(),
                    vesselName: rescueData.vesselName,
                    callSign: rescueData.callSign,
                    pob: +rescueData.pob,
                    latitude:
                        rescueData.latitude > 0
                            ? rescueData.latitude?.toString()
                            : currentLocation.latitude?.toString(),

                    longitude:
                        rescueData.longitude > 0
                            ? rescueData.longitude?.toString()
                            : currentLocation.longitude?.toString(),
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
                    vesselLocationID: rescueData.locationID
                        ? rescueData.locationID
                        : eventCurrentLocation.geoLocationID,
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
                    currentLocationID: rescueData.locationID
                        ? rescueData.locationID
                        : eventCurrentLocation.geoLocationID,
                    eventID: +data?.id,
                    eventType: 'VesselRescue',
                })
                handleSaveParent(+data?.id, 0)
                closeModal()
            } else {
                createEventType_VesselRescue({
                    variables: {
                        input: {
                            vesselName: rescueData.vesselName,
                            callSign: rescueData.callSign,
                            pob: +rescueData.pob,
                            latitude:
                                rescueData.latitude > 0
                                    ? rescueData.latitude?.toString()
                                    : currentLocation.latitude?.toString(),

                            longitude:
                                rescueData.longitude > 0
                                    ? rescueData.longitude?.toString()
                                    : currentLocation.longitude?.toString(),
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
                            vesselLocationID: rescueData.locationID
                                ? rescueData.locationID
                                : eventCurrentLocation.geoLocationID,
                            operationType: rescueData.operationType
                                ?.map((type: any) => type.value)
                                .join(','),
                            operationDescription:
                                rescueData.operationDescription,
                            vesselTypeDescription:
                                rescueData.vesselTypeDescription,
                        },
                    },
                })
            }
        }
    }

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
                            currentLocationID: rescueData.locationID
                                ? rescueData.locationID
                                : eventCurrentLocation.geoLocationID,
                            eventID: +data?.id,
                            eventType: 'VesselRescue',
                        },
                    },
                })
                handleSaveParent(+data?.id, 0)
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
                                currentLocationID: rescueData.locationID,
                                eventID: +data?.id,
                                eventType: 'VesselRescue',
                                lat: currentMissionLocation.latitude?.toString(),
                                long: currentMissionLocation.longitude?.toString(),
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
                                currentLocationID: rescueData.currentLocationID,
                                eventID: +data?.id,
                                eventType: 'VesselRescue',
                                lat: currentMissionLocation.latitude.toString(),
                                long: currentMissionLocation.longitude.toString(),
                            },
                        },
                    })
                }
                handleSaveParent(+currentRescueID, 0)
            },
            onError: (error) => {
                console.error('Error updating vessel rescue', error)
            },
        },
    )

    const [createCGEventMission] = useMutation(CreateCGEventMission, {
        onCompleted: (response) => {},
        onError: (error) => {
            console.error('Error creating CG Event Mission', error)
        },
    })

    const [updateCGEventMission] = useMutation(UpdateCGEventMission, {
        onCompleted: (response) => {},
        onError: (error) => {
            console.error('Error updating CG Event Mission', error)
        },
    })

    const handleLocationChange = (location: any) => {
        setRescueData({
            ...rescueData,
            locationID: location?.value,
        })
    }

    const handleMissionLocationChange = (location: any) => {
        setMissionData({
            ...missionData,
            currentLocationID: location?.value,
        })
    }

    const handleCreateComment = () => {
        if (selectedEvent) {
            setOpenCommentsDialog(true)
            handleEditorChange('')
            setCommentData(false)
        } else {
            toast.error(
                'Please save the event first in order to create timeline!',
            )
        }
    }

    const handleDeleteComments = async () => {
        if (offline) {
            await missionTimelineModel.save({
                id: commentData?.id,
                archived: true,
            })
            toast.success('Mission timeline updated')
            setOpenCommentsDialog(false)
            setDeleteCommentsDialog(false)
            getCurrentEvent(currentRescueID)
            setDeleteCommentsDialog(false)
        } else {
            updateMissionTimeline({
                variables: {
                    input: {
                        id: commentData?.id,
                        archived: true,
                    },
                },
            })
            setDeleteCommentsDialog(false)
        }
    }
    const offlineGetSeaLogsMembersList = async () => {
        // getSeaLogsMembersList(handleSetMemberList)
        const members = await memberModel.getAll()
        handleSetMemberList(members)
    }
    useEffect(() => {
        if (offline) {
            offlineGetSeaLogsMembersList()
        }
    }, [offline])
    return (
        <div className="pt-0">
            {type === 'TaskingComplete' && (
                <>
                    <div className="grid grid-cols-3 gap-6 pb-0 pt-0 px-4">
                        <div className="my-0 text-xl col-span-3 md:col-span-1">
                            Mission complete
                            <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                                Record the operation outcome, location and time
                                of completion
                            </p>
                        </div>
                        <div className="col-span-3 md:col-span-2">
                            <div className="my-0">
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
                                <div className="my-4">
                                    <textarea
                                        id={`operation-outcome-description`}
                                        rows={4}
                                        className={classes.textarea}
                                        placeholder="Description"
                                        value={
                                            missionData?.operationDescription
                                                ? missionData?.operationDescription
                                                : ''
                                        }
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
                        </div>
                    </div>
                </>
            )}
            <div className="grid grid-cols-3 gap-6 pb-4 pt-0 px-4">
                <div></div>
                <div className="col-span-3 md:col-span-2">
                    <div className="my-4">
                        <div className="flex flex-col">
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
                                                        <Button className="w-5 h-5">
                                                            <TrashIcon
                                                                className="w-5 h-5"
                                                                onClick={() => {
                                                                    setDeleteCommentsDialog(
                                                                        true,
                                                                    ),
                                                                        setCommentData(
                                                                            comment,
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
                                    action={handleCreateComment}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4 border-t">
                <div className="my-4 text-xl col-span-3 md:col-span-1">
                    Target vessel and details
                    <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                        Record vessel name and callsign and include number of
                        people on board
                    </p>
                </div>
                <div className="col-span-3 md:col-span-2">
                    <div className="my-4">
                        <input
                            id="vessel-name"
                            type="text"
                            className={classes.input}
                            placeholder="Vessel Name"
                            value={
                                rescueData?.vesselName
                                    ? rescueData?.vesselName
                                    : ''
                            }
                            onChange={(e) => {
                                setRescueData({
                                    ...rescueData,
                                    vesselName: e.target.value,
                                })
                            }}
                        />
                    </div>
                    <div className="my-4">
                        <input
                            id="call-sign"
                            type="text"
                            className={classes.input}
                            placeholder="Call Sign"
                            value={
                                rescueData?.callSign ? rescueData?.callSign : ''
                            }
                            onChange={(e) => {
                                setRescueData({
                                    ...rescueData,
                                    callSign: e.target.value,
                                })
                            }}
                        />
                    </div>
                    <div className="my-4 flex items-center">
                        <span className="text-sm mr-4">POB</span>
                        <input
                            id="pob"
                            type="number"
                            className={classes.input}
                            placeholder="Enter POB"
                            min={1}
                            value={rescueData?.pob ? rescueData?.pob : 0}
                            onChange={(e) => {
                                setRescueData({
                                    ...rescueData,
                                    pob: e.target.value,
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
                    {locations && (
                        <div className="my-4">
                            <LocationField
                                offline={offline}
                                // geoLocations={geoLocations}
                                currentTrip={() => {}}
                                updateTripReport={() => {}}
                                tripReport={() => {}}
                                setCurrentLocation={setCurrentLocation}
                                handleLocationChange={handleLocationChange}
                                currentLocation={currentLocation}
                                currentEvent={{
                                    geoLocationID:
                                        rescueData?.locationID > 0
                                            ? rescueData?.locationID
                                            : eventCurrentLocation.geoLocationID,
                                    lat: rescueData?.latitude,
                                    long: rescueData?.longitude,
                                }}
                            />
                        </div>
                    )}
                    <div className="my-4">
                        <textarea
                            id={`location-description`}
                            rows={4}
                            className={classes.textarea}
                            placeholder="Location description"
                            value={rescueData?.locationDescription}
                            onChange={(e) => {
                                setRescueData({
                                    ...rescueData,
                                    locationDescription: e.target.value,
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
                    <div className="my-4 flex items-center">
                        <input
                            id="vessel-length"
                            type="number"
                            className={classes.input}
                            placeholder="Vessel Length"
                            value={
                                rescueData?.vesselLength
                                    ? rescueData?.vesselLength
                                    : 0
                            }
                            min={1}
                            onChange={(e) => {
                                setRescueData({
                                    ...rescueData,
                                    vesselLength: e.target.value,
                                })
                            }}
                        />
                    </div>
                    <div className="my-4">
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
                        <div className="my-4">
                            <textarea
                                id="vessel-type-description"
                                rows={4}
                                className={classes.textarea}
                                placeholder="Vessel Description"
                                value={
                                    rescueData?.vesselTypeDescription
                                        ? rescueData?.vesselTypeDescription
                                        : ''
                                }
                                onChange={(e) => {
                                    setRescueData({
                                        ...rescueData,
                                        vesselTypeDescription: e.target.value,
                                    })
                                }}
                            />
                        </div>
                    )}
                    <div className="my-4">
                        <input
                            id="make"
                            type="text"
                            className={classes.input}
                            placeholder="Make and model"
                            value={
                                rescueData?.makeAndModel
                                    ? rescueData?.makeAndModel
                                    : ''
                            }
                            onChange={(e) => {
                                setRescueData({
                                    ...rescueData,
                                    makeAndModel: e.target.value,
                                })
                            }}
                        />
                    </div>
                    <div className="my-4">
                        <input
                            id="color"
                            type="text"
                            className={classes.input}
                            placeholder="Color"
                            value={rescueData?.color ? rescueData?.color : ''}
                            onChange={(e) => {
                                setRescueData({
                                    ...rescueData,
                                    color: e.target.value,
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
                    <div className="my-4">
                        <div className="flex gap-4">
                            <input
                                id="owner-name"
                                type="text"
                                className={classes.input}
                                placeholder="Owners name"
                                value={
                                    rescueData?.ownerName
                                        ? rescueData?.ownerName
                                        : ''
                                }
                                onChange={(e) => {
                                    setRescueData({
                                        ...rescueData,
                                        ownerName: e.target.value,
                                    })
                                }}
                            />
                            <input
                                id="owner-phone"
                                type="text"
                                className={classes.input}
                                placeholder="Phone number"
                                value={
                                    rescueData?.phone ? rescueData?.phone : ''
                                }
                                onChange={(e) => {
                                    setRescueData({
                                        ...rescueData,
                                        phone: e.target.value,
                                    })
                                }}
                            />
                        </div>
                    </div>
                    <div className="my-4">
                        <div className="flex gap-4">
                            <input
                                id="cgnz"
                                type="text"
                                className={classes.input}
                                placeholder="Coastguard NZ membership"
                                value={
                                    rescueData?.cgMembership
                                        ? rescueData?.cgMembership
                                        : ''
                                }
                                onChange={(e) => {
                                    setRescueData({
                                        ...rescueData,
                                        cgMembership: e.target.value,
                                    })
                                }}
                            />
                            <input
                                id="owner-email"
                                type="text"
                                className={classes.input}
                                placeholder="Email Address"
                                value={
                                    rescueData?.email ? rescueData?.email : ''
                                }
                                onChange={(e) => {
                                    setRescueData({
                                        ...rescueData,
                                        email: e.target.value,
                                    })
                                }}
                            />
                        </div>
                    </div>
                    <div className="my-4">
                        <textarea
                            id={`owner-address`}
                            rows={4}
                            className={classes.textarea}
                            placeholder="Owners address"
                            value={
                                rescueData?.address ? rescueData?.address : ''
                            }
                            onChange={(e) => {
                                setRescueData({
                                    ...rescueData,
                                    address: e.target.value,
                                })
                            }}
                        />
                    </div>
                    <div className="inline-flex items-center ">
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
                                checked={
                                    rescueData?.ownerOnBoard ? true : false
                                }
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
            {/* {type === 'TaskingComplete' && (
                <>
                    <hr className="my-2" />
                    <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                        <div className="my-4 text-xl col-span-3 md:col-span-1">
                            Mission complete
                            <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                                Record the operation outcome, location and time
                                of completion
                            </p>
                        </div>
                        <div className="col-span-3 md:col-span-2">
                            <div className="my-4">
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
                                <div className="my-4">
                                    <textarea
                                        id={`operation-outcome-description`}
                                        rows={4}
                                        className={classes.textarea}
                                        placeholder="Description"
                                        value={
                                            missionData?.operationDescription
                                                ? missionData?.operationDescription
                                                : ''
                                        }
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
                            <div className="my-4 flex gap-4">
                                <TimeField
                                    time={time}
                                    handleTimeChange={handleTimeChange}
                                    timeID="complete-time"
                                    fieldName="Time of completion"
                                    buttonLabel="Complete Now"
                                />
                            </div>
                            <div className="my-4">
                                {locations && (
                                    <LocationField
                                        offline={offline}
                                        // geoLocations={geoLocations}
                                        currentTrip={() => {}}
                                        updateTripReport={() => {}}
                                        tripReport={() => {}}
                                        setCurrentLocation={
                                            setCurrentMissionLocation
                                        }
                                        handleLocationChange={
                                            handleMissionLocationChange
                                        }
                                        currentLocation={currentMissionLocation}
                                        currentEvent={{
                                            geoLocationID:
                                                missionData?.currentLocationID,
                                            lat: missionData?.lat,
                                            long: missionData?.long,
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )} */}
            <FooterWrapper noBorder parentClassName="z-10">
                <SeaLogsButton
                    text="Cancel"
                    type="text"
                    // action={() => {
                    //     setOpenTripModal(false), setCurrentTrip(false)
                    // }}
                />
                <SeaLogsButton
                    text="Save"
                    type="primary"
                    color="sky"
                    icon="check"
                    action={handleSave}
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
            <AlertDialog
                openDialog={deleteCommentsDialog}
                setOpenDialog={setDeleteCommentsDialog}
                handleCreate={handleDeleteComments}
                actionText="Confirm delete">
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2 text-gray-700 dark:text-white">
                    Delete Comment
                </Heading>
            </AlertDialog>
            <Toaster position="top-right" />
        </div>
    )
}
