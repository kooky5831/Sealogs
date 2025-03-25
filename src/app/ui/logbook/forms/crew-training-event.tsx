'use client'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { debounce, isEmpty } from 'lodash'
import { useEffect, useState } from 'react'
import {
    Button,
    Calendar,
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    DatePicker,
    Dialog,
    Group,
    Heading,
    Popover,
} from 'react-aria-components'
import CrewDropdown from '../../crew/dropdown'
import { TrainingSessionFormSkeleton } from '../../skeletons'
import CrewMultiSelectDropdown from '../../crew/multiselect-dropdown'
import SignatureCanvas from 'react-signature-canvas'
import {
    CREATE_TRAINING_SESSION,
    UPDATE_TRAINING_SESSION,
    CREATE_MEMBER_TRAINING_SIGNATURE,
    UPDATE_MEMBER_TRAINING_SIGNATURE,
    CREATE_TRAINING_SESSION_DUE,
    UPDATE_TRAINING_SESSION_DUE,
    CreateTripEvent,
    UpdateTripEvent,
} from '@/app/lib/graphQL/mutation'
import {
    GET_MEMBER_TRAINING_SIGNATURES,
    GetTripEvent,
    READ_ONE_TRAINING_SESSION_DUE,
    TRAINING_SESSION_BY_ID,
} from '@/app/lib/graphQL/query'
import { useMutation, useLazyQuery } from '@apollo/client'
import { today, getLocalTimeZone } from '@internationalized/date'
import { getTrainingTypeByID, getTrainingTypes } from '@/app/lib/actions'
import Select from 'react-select'
import { classes } from '@/app/components/GlobalClasses'
import TrainingTypeMultiSelectDropdown from '../../crew-training/type-multiselect-dropdown'
import toast, { Toaster } from 'react-hot-toast'
import LocationField from '../components/location'
import { SeaLogsButton } from '@/app/components/Components'
import TimeField from '../components/time'
import SlidingPanel from 'react-sliding-side-panel'
import Editor from '../../editor'
import TrainingTypeModel from '@/app/offline/models/trainingType'
import MemberTraining_SignatureModel from '@/app/offline/models/memberTraining_Signature'
import TripEventModel from '@/app/offline/models/tripEvent'
import TrainingSessionDueModel from '@/app/offline/models/trainingSessionDue'
import TrainingSessionModel from '@/app/offline/models/trainingSession'
import { generateUniqueId } from '@/app/offline/helpers/functions'

const CrewTrainingEvent = ({
    trainingTypeId = 0,
    vesselId = 0,
    selectedEvent = false,
    currentTrip = false,
    closeModal,
    updateTripReport,
    tripReport,
    crewMembers,
    masterID,
    logBookConfig,
    vessels,
    locked,
    offline = false,
}: {
    trainingTypeId: number
    vesselId: number
    selectedEvent: any
    currentTrip: any
    closeModal: any
    updateTripReport: any
    tripReport: any
    crewMembers: any
    masterID: any
    logBookConfig: any
    vessels: any
    locked: any
    offline?: boolean
}) => {
    const [trainingID, setTrainingID] = useState<any>(0)
    const [currentEvent, setCurrentEvent] = useState<any>(selectedEvent)
    const [training, setTraining] = useState<any>({})
    const [content, setContent] = useState<any>('')
    const [rawTraining, setRawTraining] = useState<any>()
    const [trainingDate, setTrainingDate] = useState(
        new Date().toLocaleDateString(),
    )
    const [hasFormErrors, setHasFormErrors] = useState(false)
    const [selectedMemberList, setSelectedMemberList] = useState([] as any[])
    const [signatureMembers, setSignatureMembers] = useState([] as any[])
    const [vesselList, setVesselList] = useState<any>()
    const [trainingTypes, setTrainingTypes] = useState<any>([])
    const [openViewProcedure, setOpenViewProcedure] = useState(false)
    const [formErrors, setFormErrors] = useState({
        TrainingTypes: '',
        TrainerID: '',
        VesselID: '',
        Date: '',
    })
    const [startTime, setStartTime] = useState<any>(dayjs().format('HH:mm'))
    const [finishTime, setFinishTime] = useState<any>(dayjs().format('HH:mm'))
    const memberIdOptions = [
        masterID,
        ...(Array.isArray(crewMembers)
            ? crewMembers.map((m: any) => m.crewMemberID)
            : []),
    ]
    const [currentLocation, setCurrentLocation] = useState<any>({
        latitude: '',
        longitude: '',
    })

    const trainingTypeModel = new TrainingTypeModel()
    const memberTraining_SignatureModel = new MemberTraining_SignatureModel()
    const tripEventModel = new TripEventModel()
    const trainingSessionDueModel = new TrainingSessionDueModel()
    const trainingSessionModel = new TrainingSessionModel()

    if (!offline) {
        getTrainingTypes(setTrainingTypes)
    }

    const handleSetTraining = (t: any) => {
        const tDate = new Date(t.date).toLocaleDateString()
        setTrainingDate(tDate)
        const trainingData = {
            ID: trainingID,
            Date: dayjs(t.date).format('YYYY-MM-DD'),
            Members: t.members.nodes.map((m: any) => m.id),
            TrainerID: t.trainer.id,
            trainingSummary: t.trainingSummary,
            TrainingTypes: t.trainingTypes.nodes.map((t: any) => t.id),
            VesselID: vesselId,
            FuelLevel: t.fuelLevel || 0,
            GeoLocationID: t.geoLocationID,
            StartTime: t.startTime,
            FinishTime: t.finishTime,
            Lat: t.lat,
            Long: t.long,
        }
        setContent(t.trainingSummary)
        setStartTime(t.startTime)
        setFinishTime(t.finishTime)
        setRawTraining(t)
        setTraining(trainingData)
        if (+t.geoLocationID > 0) {
            setCurrentLocation({
                latitude: t.geoLocation.lat,
                longitude: t.geoLocation.long,
            })
        } else {
            setCurrentLocation({
                latitude: t.lat,
                longitude: t.long,
            })
        }

        const members =
            t.members.nodes.map((m: any) => ({
                label: `${m.firstName ?? ''} ${m.surname ?? ''}`,
                value: m.id,
            })) || []
        setSelectedMemberList(members)
        const signatures = t.signatures.nodes.map((s: any) => ({
            MemberID: s.member.id,
            SignatureData: s.signatureData,
        }))
        setSignatureMembers(signatures)
    }

    const handleEditorChange = (newContent: any) => {
        setContent(newContent)
    }

    // const handleSetVessels = (data: any) => {
    //     const activeVessels = data?.filter((vessel: any) => !vessel.archived)
    //     const formattedData = [
    //         {
    //             label: 'Other',
    //             value: 'Other',
    //         },
    //         {
    //             label: 'Desktop/shore',
    //             value: 'Onshore',
    //         },
    //         ...activeVessels.map((vessel: any) => ({
    //             value: vessel.id,
    //             label: vessel.title,
    //         })),
    //     ]
    //     setVessels(formattedData)
    // }

    useEffect(() => {
        if (vessels) {
            const activeVessels = vessels?.filter(
                (vessel: any) => !vessel.archived,
            )
            const formattedData = [
                {
                    label: 'Other',
                    value: 'Other',
                },
                {
                    label: 'Desktop/shore',
                    value: 'Onshore',
                },
                ...activeVessels.map((vessel: any) => ({
                    value: vessel.id,
                    label: vessel.title,
                })),
            ]
            setVesselList(formattedData)
        }
    }, [vessels])

    // const [queryVessels] = useLazyQuery(VESSEL_LIST, {
    //     fetchPolicy: 'cache-and-network',
    //     onCompleted: (queryVesselResponse: any) => {
    //         if (queryVesselResponse.readVessels.nodes) {
    //             handleSetVessels(queryVesselResponse.readVessels.nodes)
    //         }
    //     },
    //     onError: (error: any) => {
    //         console.error('queryVessels error', error)
    //     },
    // })

    const [
        mutationCreateTrainingSession,
        { loading: mutationCreateTrainingSessionLoading },
    ] = useMutation(CREATE_TRAINING_SESSION, {
        onCompleted: (response: any) => {
            const data = response.createTrainingSession
            if (data.id > 0) {
                toast.success('Crew training created')
                setTrainingID(data.id)
                updateTrainingSessionDues()
                updateSignatures(data.id)
                handleEditorChange(data.trainingSummary)
                updateTripEvent({
                    variables: {
                        input: {
                            id: +currentEvent?.id,
                            eventCategory: 'CrewTraining',
                            crewTrainingID: data.id,
                        },
                    },
                })
                closeModal()
            } else {
                console.error('mutationCreateTrainingSession error', response)
            }
        },
        onError: (error: any) => {
            console.error('mutationCreateTrainingSession error', error)
        },
    })
    const [
        mutationUpdateTrainingSession,
        { loading: mutationUpdateTrainingSessionLoading },
    ] = useMutation(UPDATE_TRAINING_SESSION, {
        onCompleted: (response: any) => {
            const data = response.updateTrainingSession
            if (data.id > 0) {
                updateTrainingSessionDues()
                updateSignatures(trainingID)
                handleEditorChange(data.trainingSummary)
                toast.success('Crew training updated')
            } else {
                console.error('mutationUpdateTrainingSession error', response)
            }
        },
        onError: (error: any) => {
            console.error('mutationUpdateTrainingSession error', error)
        },
    })
    const [
        readOneTrainingSessionDue,
        { loading: readOneTrainingSessionDueLoading },
    ] = useLazyQuery(READ_ONE_TRAINING_SESSION_DUE, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            return response.readOneTrainingSessionDue.data
        },
        onError: (error: any) => {
            console.error('readOneTrainingSessionDueLoading error:', error)
            return null
        },
    })
    const getTrainingSessionDueWithVariables = async (
        variables: any = {},
        onCompleted: any,
    ) => {
        if (offline) {
            const allDues = await trainingSessionDueModel.getAll()
            const data = allDues.filter(
                (item: any) =>
                    item.memberID === variables.filter.memberID.eq &&
                    item.vesselID === variables.filter.vesselID.eq &&
                    item.trainingTypeID === variables.filter.trainingTypeID.eq,
            )
            onCompleted(data)
        } else {
            const { data }: any = await readOneTrainingSessionDue({
                variables: variables,
            })
            onCompleted(data.readOneTrainingSessionDue)
        }
    }

    const [
        mutationCreateTrainingSessionDue,
        { loading: createTrainingSessionDueLoading },
    ] = useMutation(CREATE_TRAINING_SESSION_DUE, {
        onCompleted: (response: any) => {
            toast.success('Crew training created')
        },
        onError: (error: any) => {
            console.error('createTrainingSessionDue error', error)
        },
    })
    const [
        mutationUpdateTrainingSessionDue,
        { loading: updateTrainingSessionDueLoading },
    ] = useMutation(UPDATE_TRAINING_SESSION_DUE, {
        onCompleted: (response: any) => {},
        onError: (error: any) => {
            console.error('updateTrainingSessionDue error', error)
        },
    })
    const updateTrainingSessionDues = async () => {
        const trainingSessionDues: any = []
        const vesselID = training.VesselID
        training.TrainingTypes.forEach((t: any) => {
            const trainingInfo = trainingTypes.find((tt: any) => tt.id === t)

            if (!isEmpty(trainingInfo) && trainingInfo.occursEvery > 0) {
                const trainingTypeID = t
                const newDueDate = dayjs(training.Date).add(
                    trainingInfo.occursEvery,
                    'day',
                )
                training.Members.forEach((m: any) => {
                    const memberID = m
                    trainingSessionDues.push({
                        dueDate: newDueDate.format('YYYY-MM-DD'),
                        memberID: memberID,
                        vesselID: vesselID,
                        trainingTypeID: trainingTypeID,
                    })
                })
            }
        })
        let trainingSessionDueWithIDs: any = []
        if (!isEmpty(trainingSessionDues)) {
            await Promise.all(
                trainingSessionDues.map(async (item: any) => {
                    const variables = {
                        filter: {
                            memberID: {
                                eq: item.memberID,
                            },
                            vesselID: {
                                eq: item.vesselID,
                            },
                            trainingTypeID: {
                                eq: item.trainingTypeID,
                            },
                        },
                    }
                    const onCompleted = (response: any) => {
                        trainingSessionDueWithIDs.push({
                            ...item,
                            id: response?.id ?? 0,
                        })
                    }

                    await getTrainingSessionDueWithVariables(
                        variables,
                        onCompleted,
                    )
                }),
            )
        }

        if (!isEmpty(trainingSessionDueWithIDs)) {
            await Promise.all(
                Array.from(trainingSessionDueWithIDs).map(async (item: any) => {
                    const variables = {
                        variables: { input: item },
                    }
                    if (item.id === 0) {
                        if (offline) {
                            // mutationCreateTrainingSessionDue
                            await trainingSessionDueModel.save({
                                ...item,
                                id: generateUniqueId(),
                            })
                            toast.success('Crew training created')
                        } else {
                            await mutationCreateTrainingSessionDue(variables)
                        }
                    } else {
                        if (offline) {
                            // mutationUpdateTrainingSessionDue
                            await trainingSessionDueModel.save(item)
                        } else {
                            await mutationUpdateTrainingSessionDue(variables)
                        }
                    }
                }),
            )
        }
    }

    const [updateTripEvent] = useMutation(UpdateTripEvent, {
        onCompleted: (response) => {
            toast.success('Trip event updated')
            getCurrentEvent(currentEvent?.id)
            updateTripReport({
                id: [...tripReport.map((trip: any) => trip.id), currentTrip.id],
            })
        },
        onError: (error) => {
            console.error('Error updating trip event', error)
        },
    })
    const [createTripEvent] = useMutation(CreateTripEvent, {
        onCompleted: (response) => {
            toast.success('Trip event created')
            const data = response.createTripEvent
            setCurrentEvent(data)
            saveTraining()
        },
        onError: (error) => {
            console.error('Error creating trip event', error)
        },
    })

    const saveTraining = async () => {
        const input = {
            id: trainingID,
            date: training.Date
                ? dayjs(training.Date).format('YYYY-MM-DD')
                : '',
            members: training.Members?.join(','),
            trainerID: training.TrainerID,
            trainingSummary: content,
            trainingTypes: training.TrainingTypes?.join(','),
            vesselID: training?.VesselID,
            trainingLocationType: training?.VesselID
                ? training.VesselID === 'Other' ||
                  training.VesselID === 'Onshore'
                    ? training.VesselID
                    : 'Vessel'
                : 'Location',
            fuelLevel: `${training.FuelLevel}`,
            geoLocationID: training.GeoLocationID,
            startTime: startTime,
            finishTime: finishTime,
            lat: `${training.Lat}`,
            long: `${training.Long}`,
        }
        if (trainingID === 0) {
            if (offline) {
                // mutationCreateTrainingSession
                const data = await trainingSessionModel.save({
                    ...input,
                    id: generateUniqueId(),
                })
                toast.success('Crew training created')
                setTrainingID(data.id)
                updateTrainingSessionDues()
                updateSignatures(data.id)
                handleEditorChange(data.trainingSummary)
                // updateTripEvent
                await tripEventModel.save({
                    id: +currentEvent?.id,
                    eventCategory: 'CrewTraining',
                    crewTrainingID: data.id,
                })
                toast.success('Trip event updated')
                await getCurrentEvent(currentEvent?.id)
                updateTripReport({
                    id: [
                        ...tripReport.map((trip: any) => trip.id),
                        currentTrip.id,
                    ],
                })
                closeModal()
            } else {
                await mutationCreateTrainingSession({
                    variables: {
                        input: input,
                    },
                })
            }
        } else {
            if (offline) {
                // mutationUpdateTrainingSession
                const data = await trainingSessionModel.save(input)
                updateTrainingSessionDues()
                updateSignatures(trainingID)
                handleEditorChange(data.trainingSummary)
                toast.success('Crew training updated')
            } else {
                await mutationUpdateTrainingSession({
                    variables: {
                        input: input,
                    },
                })
            }
        }
    }
    const handleSave = async () => {
        let hasErrors = false
        let errors = {
            TrainingTypes: '',
            TrainerID: '',
            VesselID: '',
            Date: '',
        }
        setFormErrors(errors)
        if (isEmpty(training.TrainingTypes)) {
            hasErrors = true
            errors.TrainingTypes = 'Nature of training is required'
        }
        if (!(training.TrainerID && training.TrainerID > 0)) {
            hasErrors = true
            errors.TrainerID = 'Trainer is required'
        }
        if (
            !training.VesselID &&
            !(training.TrainingLocationID && training.TrainingLocationID >= 0)
        ) {
            hasErrors = true
            errors.VesselID = 'Location is required'
        }

        if (typeof training.Date === 'undefined') {
            training.Date = dayjs().format('YYYY-MM-DD')
        }

        if (training.Date === null || !dayjs(training.Date).isValid()) {
            hasErrors = true
            errors.Date = 'The date is invalid'
        }
        if (hasErrors) {
            setHasFormErrors(true)
            setFormErrors(errors)
            return
        }
        if (currentEvent) {
            if (offline) {
                // updateTripEvent
                await tripEventModel.save({
                    id: +currentEvent.id,
                    eventCategory: 'CrewTraining',
                    logBookEntrySectionID: currentTrip.id,
                })
                toast.success('Trip event updated')
                await getCurrentEvent(currentEvent?.id)
                updateTripReport({
                    id: [
                        ...tripReport.map((trip: any) => trip.id),
                        currentTrip.id,
                    ],
                })
            } else {
                updateTripEvent({
                    variables: {
                        input: {
                            id: +currentEvent.id,
                            eventCategory: 'CrewTraining',
                            logBookEntrySectionID: currentTrip.id,
                        },
                    },
                })
            }
            saveTraining()
            closeModal()
        } else {
            if (offline) {
                // createTripEvent
                const tripEventData = await tripEventModel.save({
                    id: generateUniqueId(),
                    eventCategory: 'CrewTraining',
                    logBookEntrySectionID: currentTrip.id,
                })
                toast.success('Trip event created')
                setCurrentEvent(tripEventData)
                saveTraining()
            } else {
                createTripEvent({
                    variables: {
                        input: {
                            eventCategory: 'CrewTraining',
                            logBookEntrySectionID: currentTrip.id,
                        },
                    },
                })
            }
        }
    }

    const updateSignatures = (TrainingID: number) => {
        signatureMembers.length > 0 &&
            signatureMembers?.forEach((signature: any) => {
                checkAndSaveSignature(signature, TrainingID)
            })
    }

    const checkAndSaveSignature = async (
        signature: any,
        TrainingID: number,
    ) => {
        if (offline) {
            // queryGetMemberTrainingSignatures
            const allSignatures = await memberTraining_SignatureModel.getAll()
            const data = allSignatures.filter(
                (item: any) =>
                    item.memberID === signature.MemberID &&
                    item.trainingSessionID === TrainingID,
            )
            if (data.length > 0) {
                // mutationUpdateMemberTrainingSignature
                await memberTraining_SignatureModel.save({
                    id: data[0].id,
                    memberID: signature.MemberID,
                    signatureData: signature.SignatureData,
                    trainingSessionID: TrainingID,
                })
            } else {
                // mutationCreateMemberTrainingSignature
                await memberTraining_SignatureModel.save({
                    id: generateUniqueId(),
                    memberID: signature.MemberID,
                    signatureData: signature.SignatureData,
                    trainingSessionID: TrainingID,
                })
            }
        } else {
            await queryGetMemberTrainingSignatures({
                variables: {
                    filter: {
                        memberID: { eq: signature.MemberID },
                        trainingSessionID: { in: TrainingID },
                    },
                },
            })
                .then((response: any) => {
                    const data =
                        response.data.readMemberTraining_Signatures.nodes
                    if (data.length > 0) {
                        mutationUpdateMemberTrainingSignature({
                            variables: {
                                input: {
                                    id: data[0].id,
                                    memberID: signature.MemberID,
                                    signatureData: signature.SignatureData,
                                    trainingSessionID: TrainingID,
                                },
                            },
                        })
                    } else {
                        console.error(
                            'mutationGetMemberTrainingSignatures error',
                            response,
                        )
                        mutationCreateMemberTrainingSignature({
                            variables: {
                                input: {
                                    memberID: signature.MemberID,
                                    signatureData: signature.SignatureData,
                                    trainingSessionID: TrainingID,
                                },
                            },
                        })
                    }
                })
                .catch((error: any) => {
                    console.error(
                        'mutationGetMemberTrainingSignatures error',
                        error,
                    )
                })
        }
    }

    const [queryGetMemberTrainingSignatures] = useLazyQuery(
        GET_MEMBER_TRAINING_SIGNATURES,
    )

    const [
        mutationUpdateMemberTrainingSignature,
        { loading: mutationUpdateMemberTrainingSignatureLoading },
    ] = useMutation(UPDATE_MEMBER_TRAINING_SIGNATURE, {
        onCompleted: (response: any) => {
            const data = response.updateMemberTraining_Signature
            if (data.id > 0) {
                // signatureCount++
                // if (signatureCount === signatureMembers.length) {
                // }
            } else {
                console.error(
                    'mutationUpdateMemberTrainingSignature error',
                    response,
                )
            }
        },
        onError: (error: any) => {
            console.error('mutationUpdateMemberTrainingSignature error', error)
        },
    })

    const [
        mutationCreateMemberTrainingSignature,
        { loading: mutationCreateMemberTrainingSignatureLoading },
    ] = useMutation(CREATE_MEMBER_TRAINING_SIGNATURE, {
        onCompleted: (response: any) => {
            const data = response.createMemberTraining_Signature
            if (data.id > 0) {
                // signatureCount++
                // if (signatureCount === signatureMembers.length) {
                // }
            } else {
                console.error(
                    'mutationCreateMemberTrainingSignature error',
                    response,
                )
            }
        },
        onError: (error: any) => {
            console.error('mutationCreateMemberTrainingSignature error', error)
        },
    })

    const handleTrainingDateChange = (date: any) => {
        setTrainingDate(new Date(date.toString()).toLocaleDateString())
        setTraining({
            ...training,
            Date: dayjs(date).format('YYYY-MM-DD'),
        })
    }
    const handleTrainerChange = (trainer: any) => {
        // Use Set() to prevent duplicate values, then Array.from() to convert it to an array
        const membersSet = new Set(training?.Members || [])
        membersSet.add(trainer.value)
        const members = Array.from(membersSet)
        setTraining({
            ...training,
            TrainerID: trainer.value,
            Members: members,
        })
        setSelectedMemberList([...selectedMemberList, trainer])
        setSignatureMembers([
            ...signatureMembers,
            {
                MemberID: +trainer.value,
                SignatureData: null,
            },
        ])
    }
    const handleTrainingTypeChange = (trainingTypes: any) => {
        setTraining({
            ...training,
            TrainingTypes: !isEmpty(trainingTypes)
                ? trainingTypes.map((item: any) => item.value)
                : [],
        })
    }

    const handleMemberChange = (members: any) => {
        const signatures = signatureMembers.filter((item: any) =>
            members.some((m: any) => +m.value === item.MemberID),
        )
        setTraining({
            ...training,
            Members: members.map((item: any) => item.value),
            // Signatures: signatures,
        })
        setSelectedMemberList(members)
        setSignatureMembers(signatures)
    }
    const onSignatureChanged = (
        e: string,
        member: string,
        memberId: number,
    ) => {
        const index = signatureMembers.findIndex(
            (object) => object.MemberID === memberId,
        )
        const updatedMembers = [...signatureMembers]
        if (e) {
            if (index !== -1) {
                if (e.trim() === '') {
                    updatedMembers.splice(index, 1)
                } else {
                    updatedMembers[index].SignatureData = e
                }
            } else {
                updatedMembers.push({ MemberID: memberId, SignatureData: e })
            }
        } else {
            updatedMembers.splice(index, 1)
        }
        setSignatureMembers(updatedMembers)
    }

    if (!offline) {
        getTrainingTypeByID(trainingTypeId, setTraining)
    }

    const handleTrainingVesselChange = (vessel: any) => {
        setTraining({
            ...training,
            VesselID: vessel.value,
        })
    }

    const getCurrentEvent = async (id: any) => {
        if (offline) {
            // getTripEvent
            const event = await tripEventModel.getById(id)
            if (event) {
                setTrainingID(event.crewTrainingID)
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
                setTrainingID(event.crewTraining.id)
            }
        },
        onError: (error) => {
            console.error('Error getting current event', error)
        },
    })
    const [queryTrainingSessionByID] = useLazyQuery(TRAINING_SESSION_BY_ID, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneTrainingSession
            if (data) {
                handleSetTraining(data)
            }
        },
        onError: (error: any) => {
            console.error('queryTrainingSession error', error)
        },
    })
    const loadTrainingSession = async () => {
        if (offline) {
            // queryTrainingSessionByID
            const data = await trainingSessionModel.getById(trainingID)
            if (data) {
                handleSetTraining(data)
            }
        } else {
            await queryTrainingSessionByID({
                variables: {
                    id: +trainingID,
                },
            })
        }
    }
    const handleStartTimeChange = (date: any) => {
        setStartTime(dayjs(date).format('HH:mm'))
    }
    const handleFinishTimeChange = (date: any) => {
        setFinishTime(dayjs(date).format('HH:mm'))
    }
    const displayField = (fieldName: string) => {
        const eventTypesConfig =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'EventType_LogBookComponent',
            )
        if (
            eventTypesConfig?.length > 0 &&
            eventTypesConfig[0]?.customisedComponentFields?.nodes.filter(
                (field: any) =>
                    field.fieldName === fieldName && field.status !== 'Off',
            ).length > 0
        ) {
            return true
        }
        return false
    }
    const handleLocationChange = (value: any) => {
        setTraining({
            ...training,
            GeoLocationID: value.value,
            Lat: null,
            Long: null,
        })
    }
    const handleSetCurrentLocation = (value: any) => {
        setTraining({
            ...training,
            GeoLocationID: 0,
            Lat: value.latitude,
            Long: value.longitude,
        })
    }
    useEffect(() => {
        if (selectedEvent) {
            setCurrentEvent(selectedEvent)
            getCurrentEvent(selectedEvent?.id)
        }
        if (currentEvent) {
            getCurrentEvent(currentEvent?.id)
        }
    }, [selectedEvent, currentEvent])
    useEffect(() => {
        if (+trainingID > 0) {
            loadTrainingSession()
        }
    }, [trainingID])
    useEffect(() => {
        if (isEmpty(training)) {
            setTraining({
                ...training,
                VesselID: vesselId,
            })
        }
    }, [training])
    const offlineUseEffect = async () => {
        // getTrainingTypeByID(trainingTypeId, setTraining)
        const training = await trainingTypeModel.getById(trainingTypeId)
        setTraining(training)
        // getTrainingTypes(setTrainingTypes)
        const types = await trainingTypeModel.getAll()
        setTrainingTypes(types)
    }
    useEffect(() => {
        if (offline) {
            offlineUseEffect()
        }
    }, [offline])
    return (
        <div className="w-full ">
            <div className="flex justify-between my-4">
                <Heading className="font-semibold text-sm uppercase">
                    {trainingID === 0 ? 'New Training Session' : ''}
                </Heading>
            </div>
            {!training && trainingID > 0 ? (
                <TrainingSessionFormSkeleton />
            ) : (
                <>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} flex flex-row my-4 item-center`}>
                        <label className={classes.label}>Trainer</label>
                        <CrewDropdown
                            offline={offline}
                            value={training?.TrainerID}
                            onChange={handleTrainerChange}
                            memberIdOptions={memberIdOptions}
                        />
                        <small className="text-slred-800">
                            {hasFormErrors && formErrors.TrainerID}
                        </small>
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} flex flex-col lg:flex-row my-4`}>
                        <label className={classes.label}>Crew trained</label>
                        <CrewMultiSelectDropdown
                            offline={offline}
                            value={training?.Members}
                            onChange={handleMemberChange}
                            memberIdOptions={memberIdOptions}
                        />
                    </div>
                    <div className="gap-2 flex flex-col my-4 items-start">
                        <label className={classes.label}>Training types</label>
                        <div className="flex flex-col md:flex-row gap-2">
                            <TrainingTypeMultiSelectDropdown
                                offline={offline}
                                value={training?.TrainingTypes}
                                onChange={handleTrainingTypeChange}
                                locked={locked}
                            />
                            <small className="text-slred-800">
                                {hasFormErrors && formErrors.TrainingTypes}
                            </small>
                            {training &&
                                trainingTypes.filter(
                                    (type: any) =>
                                        training?.TrainingTypes?.includes(
                                            type.id,
                                        ) /*&& type.procedure,*/,
                                ).length > 0 && (
                                    <SeaLogsButton
                                        text="View Procedures"
                                        type="primary"
                                        className="w-auto"
                                        action={() =>
                                            setOpenViewProcedure(true)
                                        }
                                    />
                                )}
                        </div>
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} flex flex-col md:flex-row my-4 items-start md:items-center`}>
                        <label className={classes.label}>
                            Training location
                        </label>
                        {displayField('CrewTraining_Location') && (
                            <LocationField
                                offline={offline}
                                // geoLocations={geoLocations}
                                currentTrip={{}}
                                // updateTripReport={{}}
                                // tripReport={{}}
                                setCurrentLocation={handleSetCurrentLocation}
                                handleLocationChange={handleLocationChange}
                                currentLocation={currentLocation}
                                currentEvent={{
                                    geoLocationID: training.GeoLocationID,
                                    lat: training.Lat,
                                    long: training.Long,
                                }}
                            />
                        )}
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} flex flex-col gap-2 my-4 item-center`}>
                        <label className={`${classes.label} !w-full`}>
                            Fuel level at end of training
                        </label>
                        {displayField('CrewTraining_FuelLevel') && (
                            <input
                                id="fuel-level"
                                name="fuel-level"
                                type="number"
                                defaultValue={training?.FuelLevel}
                                className={`${classes.input} !w-auto`}
                                placeholder="Fuel level"
                                onChange={debounce(function (e) {
                                    setTraining({
                                        ...training,
                                        FuelLevel: e.target.value,
                                    })
                                }, 600)}
                            />
                        )}
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <label
                            className={`${classes.label} !font-semibold mb-1`}>
                            Training duration
                        </label>
                        <div className="flex flex-col md:flex-row gap-1">
                            <div className="flex flex-col">
                                <label className={`${classes.label} block`}>
                                    Start time
                                </label>
                                {displayField('CrewTraining_StartTime') && (
                                    <TimeField
                                        time={startTime}
                                        handleTimeChange={handleStartTimeChange}
                                        timeID="startTime"
                                        fieldName="Time"
                                    />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <label className={`${classes.label} block`}>
                                    End time
                                </label>
                                {displayField('CrewTraining_FinishTime') && (
                                    <TimeField
                                        time={finishTime}
                                        handleTimeChange={
                                            handleFinishTimeChange
                                        }
                                        timeID="finishTime"
                                        fieldName="Time"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} flex flex-col md:flex-row my-4 gap-2 w-full`}>
                        <div className="flex flex-col w-full">
                            <label className={`${classes.label} block`}>
                                Date of training
                            </label>
                            <DatePicker
                                onChange={handleTrainingDateChange}
                                isDisabled={true}>
                                <Group>
                                    <Button
                                        className={`w-full`}
                                        isDisabled={true}>
                                        <input
                                            id="start-date"
                                            name="date"
                                            type="text"
                                            value={trainingDate}
                                            className={classes.input}
                                            aria-describedby="start-date-error"
                                            required
                                            onChange={handleTrainingDateChange}
                                            disabled
                                        />
                                    </Button>
                                </Group>
                                <Popover>
                                    <Dialog>
                                        <div className="relative p-4 w-full max-w-2xl max-h-full bg-gray-50 rounded dark:bg-gray-800">
                                            <Calendar
                                                maxValue={today(
                                                    getLocalTimeZone(),
                                                )}>
                                                <header className="flex items-center gap-1 pb-4 px-1 font-serif w-full">
                                                    <Button slot="previous">
                                                        <ChevronLeftIcon className="w-5" />
                                                    </Button>
                                                    <Heading className="flex-1 font-semibold text-center text-2xl ml-2" />
                                                    <Button slot="next">
                                                        <ChevronRightIcon className="w-5" />
                                                    </Button>
                                                </header>
                                                <CalendarGrid className="border-spacing-1 border-separate">
                                                    <CalendarGridHeader>
                                                        {(day) => (
                                                            <CalendarHeaderCell className="text-xs text-gray-500 font-semibold">
                                                                {day}
                                                            </CalendarHeaderCell>
                                                        )}
                                                    </CalendarGridHeader>
                                                    <CalendarGridBody>
                                                        {(date) => (
                                                            <CalendarCell
                                                                date={date}
                                                                className="w-9 h-9 outline-none cursor-default rounded-full flex items-center justify-center outside-month:text-gray-300 hover:bg-gray-100 pressed:bg-gray-200 selected:bg-violet-700 selected:text-white focus-visible:ring ring-violet-600/70 ring-offset-2"
                                                            />
                                                        )}
                                                    </CalendarGridBody>
                                                </CalendarGrid>
                                            </Calendar>
                                        </div>
                                    </Dialog>
                                </Popover>
                            </DatePicker>
                            <small className="text-slred-800">
                                {hasFormErrors && formErrors.Date}
                            </small>
                        </div>
                        <div className="flex flex-col w-full">
                            <label className={`${classes.label} block`}>
                                Vessel
                            </label>
                            {vesselList &&
                                (rawTraining || trainingID === 0) && (
                                    <Select
                                        id="vessel-dropdown"
                                        closeMenuOnSelect={true}
                                        options={vesselList}
                                        menuPlacement="top"
                                        isDisabled={true}
                                        defaultValue={
                                            rawTraining?.trainingLocationType ===
                                            'Vessel'
                                                ? vesselList?.filter(
                                                      (vessel: any) =>
                                                          +vessel.value ===
                                                          +training?.VesselID,
                                                  )
                                                : rawTraining?.trainingLocationType ===
                                                    'Onshore'
                                                  ? {
                                                        label: 'Desktop/shore',
                                                        value: rawTraining?.trainingLocationType,
                                                    }
                                                  : rawTraining?.trainingLocationType ===
                                                      'Other'
                                                    ? {
                                                          label: 'Other',
                                                          value: rawTraining?.trainingLocationType,
                                                      }
                                                    : rawTraining?.trainingLocationType ===
                                                            'Location' &&
                                                        rawTraining
                                                            ?.trainingLocation
                                                            ?.id > 0
                                                      ? {
                                                            label: rawTraining
                                                                ?.trainingLocation
                                                                ?.title,
                                                            value: rawTraining
                                                                ?.trainingLocation
                                                                ?.id,
                                                        }
                                                      : vesselList.find(
                                                              (vessel: any) =>
                                                                  +vessel.value ===
                                                                  +vesselId,
                                                          )
                                                        ? {
                                                              label: vesselList.find(
                                                                  (
                                                                      vessel: any,
                                                                  ) =>
                                                                      +vessel.value ===
                                                                      +vesselId,
                                                              )?.label,
                                                              value: vesselList.find(
                                                                  (
                                                                      vessel: any,
                                                                  ) =>
                                                                      +vessel.value ===
                                                                      +vesselId,
                                                              )?.value,
                                                          }
                                                        : null
                                        }
                                        onChange={handleTrainingVesselChange}
                                        placeholder="Select location"
                                        isClearable={true}
                                        className={classes.selectMain}
                                        classNames={{
                                            control: () =>
                                                'block py-0 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 !dark:border-white focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                            singleValue: () =>
                                                'dark:!text-white',
                                            dropdownIndicator: () =>
                                                '!p-0 !hidden',
                                            indicatorSeparator: () => '!hidden',
                                            multiValue: () =>
                                                '!bg-sky-100 inline-block rounded px-1 py-0.5 m-0 !mr-1.5 border border-sky-300 !rounded-md !text-sky-900 font-normal mr-2',
                                            clearIndicator: () => '!py-0',
                                            valueContainer: () => '!py-1 h-10',
                                            menu: () => classes.selectMenu,
                                            option: () => classes.selectOption,
                                        }}
                                    />
                                )}
                            <small className="text-slred-800">
                                {hasFormErrors && formErrors.VesselID}
                            </small>
                        </div>
                    </div>
                    <div className="col-span-3 md:col-span-2">
                        <div
                            className={`my-4 flex items-center w-full ${locked ? 'pointer-events-none' : ''}`}>
                            {(!currentEvent || training) && (
                                <Editor
                                    id="TrainingSummary"
                                    placeholder="Summary of training, identify any outcomes, further training required or other observations."
                                    className="!w-full bg-white ring-1 ring-inset ring-gray-200"
                                    handleEditorChange={handleEditorChange}
                                    content={content}
                                />
                            )}
                        </div>
                    </div>
                    {/*<div className="w-full my-4 flex flex-col">
                        <textarea
                            id="TrainingSummary"
                            name="TrainingSummary"
                            placeholder="Summary of training, identify any outcomes, further training required or other observations."
                            defaultValue={training?.TrainingSummary}
                            rows={4}
                            className={classes.textarea}></textarea>
                    </div>*/}
                    <hr className="w-full" />
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} w-full my-4`}>
                        <label className={`${classes.label} block`}>
                            Participant signatures
                        </label>
                        <div className="my-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {selectedMemberList &&
                                selectedMemberList.map(
                                    (member: any, index: number) => (
                                        <div
                                            className="w-full rounded-md"
                                            key={index}>
                                            <SignaturePad
                                                member={member.label}
                                                memberId={member.value}
                                                onSignatureChanged={(
                                                    e: string,
                                                    member: string,
                                                    memberId: number,
                                                ) =>
                                                    onSignatureChanged(
                                                        e,
                                                        member,
                                                        +memberId,
                                                    )
                                                }
                                                value={
                                                    signatureMembers.find(
                                                        (sig: any) =>
                                                            sig.MemberID ===
                                                            member.value,
                                                    )?.SignatureData
                                                }
                                            />
                                        </div>
                                    ),
                                )}
                        </div>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-end px-4 pb-4 pt-4">
                        <SeaLogsButton
                            action={closeModal}
                            type="text"
                            text="Cancel"
                        />
                        <SeaLogsButton
                            type="primary"
                            icon="check"
                            text={trainingID === 0 ? 'Save' : 'Update'}
                            color="slblue"
                            action={locked ? () => {} : handleSave}
                            isDisabled={
                                mutationCreateTrainingSessionLoading ||
                                mutationUpdateTrainingSessionLoading
                            }
                        />
                    </div>
                </>
            )}
            <Toaster position="top-right" />
            <SlidingPanel type={'right'} isOpen={openViewProcedure} size={60}>
                <div className="h-[calc(100vh_-_1rem)] pt-4">
                    <div className="bg-slblue-100 h-full flex flex-col justify-between rounded-l-lg">
                        <div className="text-xl dark:text-white text-white items-center flex justify-between font-medium py-4 px-6 rounded-tl-lg bg-slblue-800">
                            <div>Procedures</div>
                            <XMarkIcon
                                className="w-6 h-6"
                                onClick={() => setOpenViewProcedure(false)}
                            />
                        </div>
                        <div className="p-4 flex-grow overflow-scroll">
                            {training &&
                                trainingTypes
                                    .filter(
                                        (type: any) =>
                                            training?.TrainingTypes?.includes(
                                                type.id,
                                            ) && type.procedure,
                                    )
                                    .map((type: any) => (
                                        <div
                                            key={type.id}
                                            className="bg-slblue-200 border border-slblue-400 rounded-md p-4 mb-4">
                                            <h3 className="text-lg font-medium leading-6 text-gray-9000 mb-4">
                                                {type.title}
                                            </h3>
                                            <div
                                                key={type.id}
                                                dangerouslySetInnerHTML={{
                                                    __html: type.procedure,
                                                }}></div>
                                        </div>
                                    ))}
                        </div>
                    </div>
                </div>
            </SlidingPanel>
        </div>
    )
}

function SignaturePad({
    member,
    memberId,
    onSignatureChanged,
    value,
}: {
    member: string
    memberId: string
    onSignatureChanged: (e: string, member: string, memberId: number) => void
    value: string
}) {
    const [signPad, setSignPad] = useState<SignaturePad | null>(null)

    useEffect(() => {
        if (value && signPad) {
            signPad.fromDataURL(value, { width: 384, height: 200 })
        }
    }, [signPad])

    const handleSignatureChanged = (e: any) => {
        if (signPad?.toDataURL())
            onSignatureChanged(signPad?.toDataURL(), member, +memberId)
    }

    const handleClear = () => {
        if (signPad) {
            signPad.clear()
            onSignatureChanged('', member, +memberId)
        }
    }
    return (
        <div className="flex flex-col items-right gap-2">
            <div className="flex items-center justify-between">
                <label className={`${classes.label} !font-medium`}>
                    {member}
                </label>
                <Button
                    onPress={handleClear}
                    className="peer flex justify-between text-2xs font-inter">
                    Clear
                </Button>
            </div>
            <SignatureCanvas
                ref={(ref: any) => {
                    setSignPad(ref)
                }}
                penColor={`blue`}
                canvasProps={{
                    width: 384,
                    height: 200,
                    className: 'sigCanvas border border-gray-200',
                }}
                onEnd={handleSignatureChanged}
            />
        </div>
    )
}

export default CrewTrainingEvent
