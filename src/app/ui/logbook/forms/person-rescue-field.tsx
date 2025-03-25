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
    CreateEventType_PersonRescue,
    UpdateEventType_PersonRescue,
    CreateCGEventMission,
    UpdateCGEventMission,
    CreateMissionTimeline,
    UpdateMissionTimeline,
} from '@/app/lib/graphQL/mutation'
import { GetTripEvent_PersonRescue } from '@/app/lib/graphQL/query'
import Select from 'react-select'
import { getSeaLogsMembersList } from '@/app/lib/actions'
import Editor from '../../editor'
import { useLazyQuery, useMutation } from '@apollo/client'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast, { Toaster } from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'
import { classes } from '@/app/components/GlobalClasses'
import { formatDateTime } from '@/app/helpers/dateHelper'
import SeaLogsMemberModel from '@/app/offline/models/seaLogsMember'
import EventType_PersonRescueModel from '@/app/offline/models/eventType_PersonRescue'
import CGEventMissionModel from '@/app/offline/models/cgEventMission'
import MissionTimelineModel from '@/app/offline/models/missionTimeline'
import { generateUniqueId } from '@/app/offline/helpers/functions'

export default function PersonRescueField({
    geoLocations,
    selectedEvent = false,
    closeModal,
    handleSaveParent,
    currentRescueID,
    type,
    offline = false,
}: {
    geoLocations: any
    selectedEvent: any
    closeModal: any
    handleSaveParent: any
    currentRescueID: any
    type: any
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
    const [deleteCommentsDialog, setDeleteCommentsDialog] = useState(false)
    const [currentMissionLocation, setCurrentMissionLocation] = useState<any>({
        latitude: '',
        longitude: '',
    })
    const seaLogsMemberModel = new SeaLogsMemberModel()
    const personRescueModel = new EventType_PersonRescueModel()
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

    const getCurrentEvent = async (currentRescueID: any) => {
        if (currentRescueID > 0) {
            if (offline) {
                const event = await personRescueModel.getById(currentRescueID)
                if (event) {
                    setRescueData({
                        personName: event?.personName ? event?.personName : '',
                        gender: event?.gender ? event?.gender : '',
                        age: event?.age ? event?.age : '',
                        personDescription: event?.personDescription
                            ? event?.personDescription
                            : '',
                        cgMembershipNumber: event?.cgMembershipNumber
                            ? event?.cgMembershipNumber
                            : '',
                        personOtherDetails: event?.personOtherDetails
                            ? event?.personOtherDetails
                            : '',
                        cgMembershipType: 'cgnz',
                        missionID: event?.missionID ? event?.missionID : '',
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
                    })
                    setTimeline(event?.missionTimeline?.nodes)
                }
            } else {
                getTripEvent({
                    variables: {
                        id: currentRescueID,
                    },
                })
            }
        }
    }

    const [getTripEvent] = useLazyQuery(GetTripEvent_PersonRescue, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const event = response.readOneEventType_PersonRescue
            if (event) {
                setRescueData({
                    personName: event?.personName ? event?.personName : '',
                    gender: event?.gender ? event?.gender : '',
                    age: event?.age ? event?.age : '',
                    personDescription: event?.personDescription
                        ? event?.personDescription
                        : '',
                    cgMembershipNumber: event?.cgMembershipNumber
                        ? event?.cgMembershipNumber
                        : '',
                    personOtherDetails: event?.personOtherDetails
                        ? event?.personOtherDetails
                        : '',
                    cgMembershipType: 'cgnz',
                    missionID: event?.missionID ? event?.missionID : '',
                    // operationDescription: event?.operationDescription
                    //     ? event?.operationDescription
                    //     : '',
                    // operationType: event?.operationType
                    //     ? operationType.filter((operation: any) =>
                    //           event?.operationType
                    //               .split(',')
                    //               .includes(operation.value),
                    //       )
                    //     : [],
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
                })
                setTimeline(event?.missionTimeline?.nodes)
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
        { label: 'Stood down', value: 'Stood down' },
        { label: 'Other', value: 'Other' },
    ]

    const commentTypes = [
        { label: 'General', value: 'General' },
        { label: 'Underway', value: 'Underway' },
        { label: 'On Scene', value: 'On Scene' },
    ]

    // const operationType = [
    //     { label: 'Person in water', value: 'Person in water' },
    //     { label: 'Lost', value: 'Lost' },
    //     { label: 'Suicide', value: 'Suicide' },
    //     { label: 'Medical', value: 'Medical' },
    //     { label: 'Other', value: 'Other' },
    // ]

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
                commentType: commentData?.commentType
                    ? commentData?.commentType
                    : 'General',
                description: content ? content : '',
                time: commentTime
                    ? commentTime
                    : dayjs().format('DD/MM/YYYY HH:mm'),
                authorID: commentData?.authorID,
                // missionID: rescueData?.missionID,
                personRescueID: currentRescueID,
            },
        }
        if (commentData?.id > 0) {
            if (offline) {
                // updateMissionTimeline
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
                // createMissionTimeline
                await missionTimelineModel.save({
                    id: generateUniqueId(),
                    ...variables.input,
                })
                toast.success('Mission timeline created')
                setOpenCommentsDialog(false)
                setDeleteCommentsDialog(false)
                getCurrentEvent(currentRescueID)
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
                personName: rescueData.personName,
                gender: rescueData.gender,
                age: +rescueData.age,
                personDescription: rescueData.personDescription,
                cgMembershipNumber: rescueData.cgMembershipNumber,
                personOtherDetails: rescueData.personOtherDetails,
                cgMembershipType: 'cgnz',
                missionID: +rescueData.missionID,
                // operationType: rescueData.operationType
                //     ?.map((type: any) => type.value)
                //     .join(','),
                // operationDescription: rescueData.operationDescription,
            },
        }

        if (currentRescueID) {
            if (offline) {
                // updateEventType_PersonRescue
                const data = await personRescueModel.save({
                    id: +currentRescueID,
                    ...variables.input,
                })
                if (+rescueData.missionID > 0) {
                    // updateCGEventMission
                    await cgEventMissionModel.save({
                        id: +rescueData.missionID,
                        missionType: missionData.missionType,
                        description: missionData.description,
                        operationDescription: missionData.operationDescription,
                        operationOutcome: missionData.operationOutcome,
                        completedAt: time,
                        currentLocationID: rescueData.currentLocationID,
                        eventID: +data?.id,
                        eventType: 'HumanRescue',
                        vesselID: vesselID,
                        lat: currentMissionLocation?.latitude?.toString(),
                        long: currentMissionLocation?.longitude?.toString(),
                    })
                } else {
                    // createCGEventMission
                    await cgEventMissionModel.save({
                        id: generateUniqueId(),
                        missionType: missionData.missionType,
                        description: missionData.description,
                        operationDescription: missionData.operationDescription,
                        operationOutcome: missionData.operationOutcome,
                        completedAt: time,
                        currentLocationID: rescueData.currentLocationID,
                        eventID: +data?.id,
                        eventType: 'HumanRescue',
                        vesselID: vesselID,
                        lat: currentMissionLocation?.latitude?.toString(),
                        long: currentMissionLocation?.longitude?.toString(),
                    })
                }
                handleSaveParent(0, +currentRescueID)
            } else {
                updateEventType_PersonRescue({
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
                // createEventType_PersonRescue
                const data = await personRescueModel.save({
                    id: generateUniqueId(),
                    personName: rescueData.personName,
                    gender: rescueData.gender,
                    age: +rescueData.age,
                    personDescription: rescueData.personDescription,
                    cgMembershipNumber: rescueData.cgMembershipNumber,
                    personOtherDetails: rescueData.personOtherDetails,
                    cgMembershipType: 'cgnz',
                    missionID: +rescueData.missionID,
                })
                // createCGEventMission
                await cgEventMissionModel.save({
                    id: generateUniqueId(),
                    missionType: missionData.missionType,
                    description: missionData.description,
                    operationDescription: missionData.operationDescription,
                    operationOutcome: missionData.operationOutcome,
                    completedAt: time,
                    currentLocationID: rescueData.currentLocationID,
                    eventID: +data?.id,
                    eventType: 'HumanRescue',
                    vesselID: vesselID,
                })
                handleSaveParent(0, +data?.id)
                closeModal()
            } else {
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
                        },
                    },
                })
            }
        }
    }

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
                            currentLocationID: rescueData.currentLocationID,
                            eventID: +data?.id,
                            eventType: 'HumanRescue',
                            vesselID: vesselID,
                        },
                    },
                })
                handleSaveParent(0, +data?.id)
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
            onCompleted: async (response) => {
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
                                currentLocationID: rescueData.currentLocationID,
                                eventID: +data?.id,
                                eventType: 'HumanRescue',
                                vesselID: vesselID,
                                lat: currentMissionLocation?.latitude?.toString(),
                                long: currentMissionLocation?.longitude?.toString(),
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
                                eventType: 'HumanRescue',
                                vesselID: vesselID,
                                lat: currentMissionLocation?.latitude?.toString(),
                                long: currentMissionLocation?.longitude?.toString(),
                            },
                        },
                    })
                }
                handleSaveParent(0, +currentRescueID)
            },
            onError: (error) => {
                console.error('Error updating person rescue', error)
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

    const handleMissionLocationChange = (value: any) => {
        setMissionData({
            ...missionData,
            currentLocationID: value?.value,
        })
    }

    const handleDeleteComments = async () => {
        if (offline) {
            // updateMissionTimeline
            await missionTimelineModel.save({
                id: commentData?.id,
                archived: true,
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
                        archived: true,
                    },
                },
            })
        }
        setDeleteCommentsDialog(false)
    }
    const offlineGetSeaLogsMembersList = async () => {
        // getSeaLogsMembersList(handleSetMemberList)
        const data = await seaLogsMemberModel.getAll()
        handleSetMemberList(data)
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
                                        }
                                        onChange={(e) => {
                                            setMissionData({
                                                ...missionData,
                                                operationDescription:
                                                    e.target.value,
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
                            <label className="mb-1 text-sm">
                                Add Notes/Comments
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
            <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4 border-t">
                <div className="my-4 text-xl col-span-3 md:col-span-1">
                    Target person/s details
                    <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                        Record person name and details
                    </p>
                </div>
                <div className="col-span-3 md:col-span-2">
                    {/* <div className="my-4">
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
                    </div> */}
                    {/* {rescueData?.operationType?.find(
                        (operation: any) => operation.value == 'Other',
                    ) && (
                        <div className="my-4">
                            <textarea
                                id={`operation-description`}
                                rows={4}
                                className={classes.textarea}
                                placeholder="Operation description"
                                value={rescueData?.operationDescription}
                                onChange={(e) => {
                                    setRescueData({
                                        ...rescueData,
                                        operationDescription: e.target.value,
                                    })
                                }}
                            />
                        </div>
                    )} */}
                    <div className="my-4">
                        <div className="flex w-full gap-4">
                            <div className="w-1/2">
                                <input
                                    id="person-name"
                                    type="text"
                                    className={classes.input}
                                    placeholder="Person Name"
                                    value={rescueData?.personName}
                                    onChange={(e) => {
                                        setRescueData({
                                            ...rescueData,
                                            personName: e.target.value,
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
                    <div className="my-4">
                        <div className="flex w-full gap-4">
                            <div className="w-1/2">
                                <input
                                    id="age"
                                    type="number"
                                    className={classes.input}
                                    placeholder="Enter age"
                                    min={1}
                                    value={rescueData?.age}
                                    onChange={(e) => {
                                        setRescueData({
                                            ...rescueData,
                                            age: e.target.value,
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
                                    value={rescueData?.cgMembershipNumber}
                                    onChange={(e) => {
                                        setRescueData({
                                            ...rescueData,
                                            cgMembershipNumber: e.target.value,
                                        })
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="my-4">
                        <textarea
                            id={`person-description`}
                            rows={4}
                            className={classes.textarea}
                            placeholder="Person description"
                            value={rescueData?.personDescription}
                            onChange={(e) => {
                                setRescueData({
                                    ...rescueData,
                                    personDescription: e.target.value,
                                })
                            }}
                        />
                    </div>
                    <div className="my-4">
                        <textarea
                            id={`other-details`}
                            rows={4}
                            className={classes.textarea}
                            placeholder="Other details"
                            value={rescueData?.personOtherDetails}
                            onChange={(e) => {
                                setRescueData({
                                    ...rescueData,
                                    personOtherDetails: e.target.value,
                                })
                            }}
                        />
                    </div>
                </div>
            </div>

            <FooterWrapper noBorder parentClassName="z-10">
                <SeaLogsButton text="Cancel" type="text" />
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
