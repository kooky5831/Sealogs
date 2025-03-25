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
import React, { use, useEffect, useState } from 'react'
import {
    Button,
    Dialog,
    DialogTrigger,
    Heading,
    Modal,
    ModalOverlay,
} from 'react-aria-components'
import {
    CreateEventType_PersonRescue,
    UpdateEventType_PersonRescue,
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
import { useSearchParams } from 'next/navigation'
import { classes } from '@/app/components/GlobalClasses'
import { formatDateTime } from '@/app/helpers/dateHelper'
import SeaLogsMemberModel from '@/app/offline/models/seaLogsMember'
import TripEventModel from '@/app/offline/models/tripEvent'
import EventType_PersonRescueModel from '@/app/offline/models/eventType_PersonRescue'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import CGEventMissionModel from '@/app/offline/models/cgEventMission'
import MissionTimelineModel from '@/app/offline/models/missionTimeline'

export default function PersonRescue({
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
    const searchParams = useSearchParams()
    const vesselID = searchParams.get('vesselID') ?? 0
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
    const [currentEvent, setCurrentEvent] = useState<any>(selectedEvent)
    const seaLogsMemberModel = new SeaLogsMemberModel()
    const tripEventModel = new TripEventModel()
    const personRescueModel = new EventType_PersonRescueModel()
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
                    personName: event.eventType_PersonRescue?.personName,
                    gender: event.eventType_PersonRescue?.gender,
                    age: event.eventType_PersonRescue?.age,
                    personDescription:
                        event.eventType_PersonRescue?.personDescription,
                    cgMembershipNumber:
                        event.eventType_PersonRescue?.cgMembershipNumber,
                    personOtherDetails:
                        event.eventType_PersonRescue?.personOtherDetails,
                    cgMembershipType: 'cgnz',
                    missionID: event.eventType_PersonRescue?.missionID,
                    operationDescription:
                        event.eventType_PersonRescue?.operationDescription,
                    operationType: event.eventType_PersonRescue?.operationType
                        ? operationType.filter((operation: any) =>
                              event.eventType_PersonRescue?.operationType
                                  .split(',')
                                  .includes(operation.value),
                          )
                        : [],
                })
                setTime(event.eventType_PersonRescue?.mission?.completedAt)
                setMissionData({
                    missionType:
                        event.eventType_PersonRescue?.mission?.missionType?.replaceAll(
                            '_',
                            ' ',
                        ),
                    description:
                        event.eventType_PersonRescue?.mission?.description,
                    operationOutcome:
                        event.eventType_PersonRescue?.mission?.operationOutcome?.replaceAll(
                            '_',
                            ' ',
                        ),
                    currentLocationID:
                        event.eventType_PersonRescue?.mission?.currentLocation
                            ?.id,
                    operationDescription:
                        event.eventType_PersonRescue?.mission
                            ?.operationDescription,
                })
                setTimeline(
                    event.eventType_PersonRescue?.mission?.missionTimeline
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
                    personName: event.eventType_PersonRescue?.personName,
                    gender: event.eventType_PersonRescue?.gender,
                    age: event.eventType_PersonRescue?.age,
                    personDescription:
                        event.eventType_PersonRescue?.personDescription,
                    cgMembershipNumber:
                        event.eventType_PersonRescue?.cgMembershipNumber,
                    personOtherDetails:
                        event.eventType_PersonRescue?.personOtherDetails,
                    cgMembershipType: 'cgnz',
                    missionID: event.eventType_PersonRescue?.missionID,
                    operationDescription:
                        event.eventType_PersonRescue?.operationDescription,
                    operationType: event.eventType_PersonRescue?.operationType
                        ? operationType.filter((operation: any) =>
                              event.eventType_PersonRescue?.operationType
                                  .split(',')
                                  .includes(operation.value),
                          )
                        : [],
                })
                setTime(event.eventType_PersonRescue?.mission?.completedAt)
                setMissionData({
                    missionType:
                        event.eventType_PersonRescue?.mission?.missionType?.replaceAll(
                            '_',
                            ' ',
                        ),
                    description:
                        event.eventType_PersonRescue?.mission?.description,
                    operationOutcome:
                        event.eventType_PersonRescue?.mission?.operationOutcome?.replaceAll(
                            '_',
                            ' ',
                        ),
                    currentLocationID:
                        event.eventType_PersonRescue?.mission?.currentLocation
                            ?.id,
                    operationDescription:
                        event.eventType_PersonRescue?.mission
                            ?.operationDescription,
                })
                setTimeline(
                    event.eventType_PersonRescue?.mission?.missionTimeline
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
        { label: 'Person in water', value: 'Person in water' },
        { label: 'Lost', value: 'Lost' },
        { label: 'Suicide', value: 'Suicide' },
        { label: 'Medical', value: 'Medical' },
        { label: 'Other', value: 'Other' },
    ]

    const gender = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
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
                await getCurrentEvent(currentEvent?.id)
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
                await getCurrentEvent(currentEvent?.id)
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
            getCurrentEvent(currentEvent?.id)
        },
        onError: (error) => {
            console.error('Error creating mission timeline', error)
        },
    })

    const [updateMissionTimeline] = useMutation(UpdateMissionTimeline, {
        onCompleted: (response) => {
            toast.success('Mission timeline updated')
            setOpenCommentsDialog(false)
            getCurrentEvent(currentEvent?.id)
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
                personName: rescueData.personName,
                gender: rescueData.gender,
                age: +rescueData.age,
                personDescription: rescueData.personDescription,
                cgMembershipNumber: rescueData.cgMembershipNumber,
                personOtherDetails: rescueData.personOtherDetails,
                cgMembershipType: 'cgnz',
                missionID: +rescueData.missionID,
                operationType: rescueData.operationType
                    ?.map((type: any) => type.value)
                    .join(','),
                operationDescription: rescueData.operationDescription,
            },
        }

        if (currentEvent) {
            if (offline) {
                await tripEventModel.save({
                    id: +currentEvent.id,
                    eventCategory: 'HumanRescue',
                    logBookEntrySectionID: currentTrip.id,
                })
                toast.success('Trip event updated')
                await getCurrentEvent(currentEvent?.id)
                const personRescueData = await personRescueModel.save({
                    id: +selectedEvent?.eventType_PersonRescueID,
                    ...variables.input,
                })
                const dataToSave = {
                    id:
                        +rescueData.missionID > 0
                            ? +rescueData.missionID
                            : generateUniqueId(),
                    missionType: missionData.missionType,
                    description: missionData.description,
                    operationDescription: missionData.operationDescription,
                    operationOutcome: missionData.operationOutcome,
                    completedAt: time,
                    currentLocationID: missionData.currentLocationID,
                    eventID: +personRescueData?.id,
                    eventType: 'HumanRescue',
                    vesselID: vesselID,
                }
                await cgEventMissionModel.save(dataToSave)
                await getCurrentEvent(currentEvent?.id)
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
                updateTripEvent({
                    variables: {
                        input: {
                            id: +currentEvent.id,
                            eventCategory: 'HumanRescue',
                            logBookEntrySectionID: currentTrip.id,
                        },
                    },
                })
                updateEventType_PersonRescue({
                    variables: {
                        input: {
                            id: +selectedEvent?.eventType_PersonRescueID,
                            ...variables.input,
                        },
                    },
                })
            }
        } else {
            if (offline) {
                const data = await tripEventModel.save({
                    id: generateUniqueId(),
                    eventCategory: 'HumanRescue',
                    logBookEntrySectionID: currentTrip.id,
                })
                toast.success('Trip event created')
                setCurrentEvent(data)
                const personRescueData = await personRescueModel.save({
                    id: generateUniqueId(),
                    personName: rescueData.personName,
                    gender: rescueData.gender,
                    age: +rescueData.age,
                    personDescription: rescueData.personDescription,
                    cgMembershipNumber: rescueData.cgMembershipNumber,
                    personOtherDetails: rescueData.personOtherDetails,
                    cgMembershipType: 'cgnz',
                    missionID: +rescueData.missionID,
                    operationType: rescueData.operationType
                        ?.map((type: any) => type.value)
                        .join(','),
                    operationDescription: rescueData.operationDescription,
                })
                await cgEventMissionModel.save({
                    id: generateUniqueId(),
                    missionType: missionData.missionType,
                    description: missionData.description,
                    operationDescription: missionData.operationDescription,
                    operationOutcome: missionData.operationOutcome,
                    completedAt: time,
                    currentLocationID: missionData.currentLocationID,
                    eventID: +personRescueData?.id,
                    eventType: 'HumanRescue',
                    vesselID: vesselID,
                })
                await getCurrentEvent(currentEvent?.id)
                updateTripReport({
                    id: [
                        ...tripReport.map((trip: any) => trip.id),
                        currentTrip.id,
                    ],
                })
                await tripEventModel.save({
                    id: currentEvent?.id,
                    eventType_PersonRescueID: personRescueData.id,
                })
                toast.success('Trip event updated')
                await getCurrentEvent(currentEvent?.id)
                closeModal()
            } else {
                createTripEvent({
                    variables: {
                        input: {
                            eventCategory: 'HumanRescue',
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
            createEventType_PersonRescue({
                variables: {
                    input: {
                        personName: rescueData.personName,
                        gender: rescueData.gender,
                        age: +rescueData.age,
                        personDescription: rescueData.personDescription,
                        cgMembershipNumber: rescueData.cgMembershipNumber,
                        personOtherDetails: rescueData.personOtherDetails,
                        cgMembershipType: 'cgnz',
                        missionID: +rescueData.missionID,
                        operationType: rescueData.operationType
                            ?.map((type: any) => type.value)
                            .join(','),
                        operationDescription: rescueData.operationDescription,
                    },
                },
            })
        },
        onError: (error) => {
            console.error('Error creating trip event', error)
        },
    })

    const [createEventType_PersonRescue] = useMutation(
        CreateEventType_PersonRescue,
        {
            onCompleted: (response) => {
                const data = response.createEventType_PersonRescue
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
                            eventType: 'HumanRescue',
                            vesselID: vesselID,
                        },
                    },
                })
                updateTripEvent({
                    variables: {
                        input: {
                            id: currentEvent?.id,
                            eventType_PersonRescueID: data.id,
                        },
                    },
                })
                closeModal()
            },
            onError: (error) => {
                console.error('Error creating Person rescue', error)
            },
        },
    )

    const [updateEventType_PersonRescue] = useMutation(
        UpdateEventType_PersonRescue,
        {
            onCompleted: (response) => {
                const data = response.updateEventType_PersonRescue
                if (+rescueData.missionID > 0) {
                    updateCGEventMission({
                        variables: {
                            input: {
                                id: +rescueData.missionID,
                                missionType: missionData.missionType,
                                description: missionData.description,
                                operationDescription:
                                    missionData.operationDescription,
                                operationOutcome: missionData.operationOutcome,
                                completedAt: time,
                                currentLocationID:
                                    missionData.currentLocationID,
                                eventID: +data?.id,
                                eventType: 'HumanRescue',
                                vesselID: vesselID,
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
                                eventType: 'HumanRescue',
                                vesselID: vesselID,
                            },
                        },
                    })
                }
            },
            onError: (error) => {
                console.error('Error updating person rescue', error)
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
            updateTripReport({
                id: tripReport.map((trip: any) => trip.id),
            })
        },
        onError: (error) => {
            console.error('Error updating CG Event Mission', error)
        },
    })

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
    const offlineGetSeaLogsMembersList = async () => {
        // getSeaLogsMembersList(handleSetMemberList)
        const members = await seaLogsMemberModel.getAll()
        handleSetMemberList(members)
    }
    useEffect(() => {
        if (offline) {
            offlineGetSeaLogsMembersList()
        }
    }, [offline])
    return (
        <div className="px-0 md:px-4 pt-4">
            <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                <div className="my-4 text-xl col-span-3 md:col-span-1">
                    Target person/s details
                    <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                        Record person name and details
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
                        <div className="flex w-full gap-4">
                            <div className="w-1/2">
                                <input
                                    id="person-name"
                                    type="text"
                                    className={classes.input}
                                    placeholder="Person Name"
                                    value={
                                        rescueData?.personName
                                            ? rescueData?.personName
                                            : ''
                                    }
                                    onChange={() => {
                                        setRescueData({
                                            ...rescueData,
                                            personName: (
                                                document.getElementById(
                                                    'person-name',
                                                ) as HTMLInputElement
                                            ).value,
                                        })
                                    }}
                                />
                            </div>
                            <div className="w-1/2">
                                <Select
                                    id="gender"
                                    options={gender}
                                    menuPlacement="top"
                                    placeholder="Gender"
                                    className={classes.selectMain}
                                    value={
                                        gender?.find(
                                            (location: any) =>
                                                location.value ==
                                                rescueData?.gender,
                                        )
                                            ? gender?.find(
                                                  (location: any) =>
                                                      location.value ==
                                                      rescueData?.gender,
                                              )
                                            : null
                                    }
                                    onChange={(value: any) => {
                                        setRescueData({
                                            ...rescueData,
                                            gender: value?.value,
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
                        </div>
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <div className="flex w-full gap-4">
                            <div className="w-1/2">
                                <input
                                    id="age"
                                    type="number"
                                    className={classes.input}
                                    placeholder="Enter age"
                                    min={1}
                                    value={
                                        rescueData?.age ? rescueData?.age : ''
                                    }
                                    onChange={() => {
                                        setRescueData({
                                            ...rescueData,
                                            age: (
                                                document.getElementById(
                                                    'age',
                                                ) as HTMLInputElement
                                            ).value,
                                        })
                                    }}
                                />
                            </div>
                            <div className="w-1/2">
                                <input
                                    id="cgMembershipNumber"
                                    type="number"
                                    className={classes.input}
                                    placeholder="Enter cgMembershipNumber"
                                    min={1}
                                    value={
                                        rescueData?.cgMembershipNumber
                                            ? rescueData?.cgMembershipNumber
                                            : ''
                                    }
                                    onChange={() => {
                                        setRescueData({
                                            ...rescueData,
                                            cgMembershipNumber: (
                                                document.getElementById(
                                                    'cgMembershipNumber',
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
                        <textarea
                            id={`person-description`}
                            rows={4}
                            className={classes.textarea}
                            placeholder="Person description"
                            value={rescueData?.personDescription}
                            onChange={() => {
                                setRescueData({
                                    ...rescueData,
                                    personDescription: (
                                        document.getElementById(
                                            'person-description',
                                        ) as HTMLInputElement
                                    ).value,
                                })
                            }}
                        />
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <textarea
                            id={`other-details`}
                            rows={4}
                            className={classes.textarea}
                            placeholder="Other details"
                            value={rescueData?.personOtherDetails}
                            onChange={() => {
                                setRescueData({
                                    ...rescueData,
                                    personOtherDetails: (
                                        document.getElementById(
                                            'other-details',
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
                                                                            formatDateTime(
                                                                                comment.time,
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
                                    action={handleCreateComment}
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
                        className={`${locked ? 'pointer-events-none' : ''} my-4 flex gap-4`}>
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
                        <SeaLogsButton
                            text="Complete now"
                            type="secondary"
                            color="sky"
                            className="!mr-0 min-w-48"
                            action={() => setTime(dayjs().format('HH:mm'))}
                        />
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        {locations && (
                            <Select
                                id="completed-geo-location"
                                options={locations}
                                menuPlacement="top"
                                placeholder="Current Location"
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
                                        ? commentTime
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
