'use client'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { isEmpty } from 'lodash'
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
    Label,
    Popover,
} from 'react-aria-components'
import CrewDropdown from '../crew/dropdown'
import { TrainingSessionFormSkeleton } from '../skeletons'
import TrainingTypeMultiSelectDropdown from './type-multiselect-dropdown'
import CrewMultiSelectDropdown from '../crew/multiselect-dropdown'
import SignatureCanvas from 'react-signature-canvas'
import {
    CREATE_TRAINING_SESSION,
    UPDATE_TRAINING_SESSION,
    CREATE_MEMBER_TRAINING_SIGNATURE,
    UPDATE_MEMBER_TRAINING_SIGNATURE,
    CREATE_TRAINING_SESSION_DUE,
    UPDATE_TRAINING_SESSION_DUE,
} from '@/app/lib/graphQL/mutation'
import {
    GET_MEMBER_TRAINING_SIGNATURES,
    READ_ONE_TRAINING_SESSION_DUE,
} from '@/app/lib/graphQL/query'
import { useMutation, useLazyQuery } from '@apollo/client'
import { useRouter } from 'next/navigation'
import TrainingLocationDropdown from './location-dropdown'
import { today, getLocalTimeZone } from '@internationalized/date'
import Link from 'next/link'
import {
    getTrainingSessionByID,
    getTrainingTypeByID,
    getTrainingTypes,
    getVesselList,
} from '@/app/lib/actions'
import Select from 'react-select'
import { classes } from '@/app/components/GlobalClasses'
import { SeaLogsButton } from '@/app/components/Components'
import SlidingPanel from 'react-sliding-side-panel'
import 'react-sliding-side-panel/lib/index.css'
import Editor from '../editor'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import Loading from '@/app/loading'

const TrainingForm = ({
    trainingID = 0,
    memberId = 0,
    trainingTypeId = 0,
    vesselId = 0,
}: {
    trainingID: number
    memberId: number
    trainingTypeId: number
    vesselId: number
}) => {
    const router = useRouter()
    const [training, setTraining] = useState<any>({})
    const [rawTraining, setRawTraining] = useState<any>()
    const [trainingDate, setTrainingDate] = useState(
        new Date().toLocaleDateString(),
    )
    const [hasFormErrors, setHasFormErrors] = useState(false)
    const [selectedMemberList, setSelectedMemberList] = useState([] as any[])
    const [signatureMembers, setSignatureMembers] = useState([] as any[])
    const [vessels, setVessels] = useState<any>()
    const [trainingTypes, setTrainingTypes] = useState<any>([])
    const [content, setContent] = useState<any>('')
    const [openViewProcedure, setOpenViewProcedure] = useState(false)
    const [formErrors, setFormErrors] = useState({
        TrainingTypes: '',
        TrainerID: '',
        VesselID: '',
        Date: '',
    })
    getTrainingTypes(setTrainingTypes)

    const handleSetTraining = (training: any) => {
        const tDate = new Date(training.date).toLocaleDateString()
        setTrainingDate(tDate)
        const trainingData = {
            ID: trainingID,
            Date: dayjs(training.date).format('YYYY-MM-DD'),
            Members: training.members.nodes.map((m: any) => m.id),
            TrainerID: training.trainer.id,
            TrainingSummary: training.trainingSummary,
            TrainingTypes: training.trainingTypes.nodes.map((t: any) => t.id),
            VesselID: training.vessel.id,
            // TrainingLocationType: training.trainingLocationType,
            // TrainingLocation: training.trainingLocation,
        }
        setRawTraining(training)
        setTraining(trainingData)
        setContent(training.trainingSummary)

        const members =
            training.members.nodes.map((m: any) => ({
                label: `${m.firstName ?? ''} ${m.surname ?? ''}`,
                value: m.id,
            })) || []
        setSelectedMemberList(members)
        const signatures = training.signatures.nodes.map((s: any) => ({
            MemberID: s.member.id,
            SignatureData: s.signatureData,
        }))
        setSignatureMembers(signatures)
    }

    const handleSetVessels = (data: any) => {
        const activeVessels = data?.filter((vessel: any) => !vessel.archived)
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
        setVessels(formattedData)
    }

    getVesselList(handleSetVessels)

    getTrainingSessionByID(trainingID, handleSetTraining)

    const [
        mutationCreateTrainingSession,
        { loading: mutationCreateTrainingSessionLoading },
    ] = useMutation(CREATE_TRAINING_SESSION, {
        onCompleted: (response: any) => {
            const data = response.createTrainingSession
            if (data.id > 0) {
                updateTrainingSessionDues()
                updateSignatures(data.id)
                handleEditorChange(data.trainingSummary)
                router.push('/crew-training')
            } else {
                console.error('mutationCreateUser error', response)
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
                if (+memberId > 0) {
                    router.push(`/crew/info?id=${memberId}`)
                } else if (+vesselId > 0) {
                    router.push(`/vessel/info?id=${vesselId}`)
                } else {
                    router.push('/crew-training')
                }
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
        const { data }: any = await readOneTrainingSessionDue({
            variables: variables,
        })
        onCompleted(data.readOneTrainingSessionDue)
    }

    const [
        mutationCreateTrainingSessionDue,
        { loading: createTrainingSessionDueLoading },
    ] = useMutation(CREATE_TRAINING_SESSION_DUE, {
        onCompleted: (response: any) => {
            console.log('createTrainingSessionDue response', response)
        },
        onError: (error: any) => {
            console.log('createTrainingSessionDue error', error)
        },
    })
    const [
        mutationUpdateTrainingSessionDue,
        { loading: updateTrainingSessionDueLoading },
    ] = useMutation(UPDATE_TRAINING_SESSION_DUE, {
        onCompleted: (response: any) => {
            console.log('updateTrainingSessionDue response', response)
        },
        onError: (error: any) => {
            console.log('updateTrainingSessionDue error', error)
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
                        await mutationCreateTrainingSessionDue(variables)
                    } else {
                        await mutationUpdateTrainingSessionDue(variables)
                    }
                }),
            )
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
        }
        if (trainingID === 0) {
            await mutationCreateTrainingSession({
                variables: {
                    input: input,
                },
            })
        } else {
            await mutationUpdateTrainingSession({
                variables: {
                    input: input,
                },
            })
        }
    }
    // var signatureCount = 0

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
        await queryGetMemberTrainingSignatures({
            variables: {
                filter: {
                    memberID: { eq: signature.MemberID },
                    trainingSessionID: { in: TrainingID },
                },
            },
        })
            .then((response: any) => {
                const data = response.data.readMemberTraining_Signatures.nodes
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
            TrainingTypes: trainingTypes.map((item: any) => item.value),
        })
    }
    /* const handleTrainingLocationChange = (vessel: any) => {
        setTraining({
            ...training,
            VesselID: vessel.isVessel ? vessel.value : 0,
            TrainingLocationID: !vessel.isVessel ? vessel.value : 0,
        })
    } */
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

    getTrainingTypeByID(trainingTypeId, setTraining)

    const handleTrainingVesselChange = (vessel: any) => {
        setTraining({
            ...training,
            VesselID: vessel.value,
        })
    }

    const handleEditorChange = (newContent: any) => {
        setContent(newContent)
    }

    const [permissions, setPermissions] = useState<any>(false)

    useEffect(() => {
        setPermissions(getPermissions)
    }, [])

    if (
        !permissions ||
        !hasPermission(
            process.env.EDIT_TRAINING || 'EDIT_TRAINING',
            permissions,
        )
    ) {
        return !permissions ? (
            <Loading />
        ) : (
            <Loading errorMessage="Oops! You do not have the permission to view this section." />
        )
    }

    return (
        <div className="w-full p-0">
            <div className="flex justify-between my-4">
                <Heading className="font-semibold uppercase text-sm dark:text-white">
                    {trainingID === 0 ? 'New' : 'Edit'} Training Session
                </Heading>
            </div>
            {!training && trainingID > 0 ? (
                <TrainingSessionFormSkeleton />
            ) : (
                <div className="px-0 md:px-4 pt-4 border-t dark:text-white">
                    <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                        <div className="my-4 text-xl">
                            Training Details
                            <p className="text-xs mt-4 max-w-[25rem] leading-loose mb-4">
                                Lorem ipsum dolor sit amet consectetur
                                adipisicing elit. Facilis possimus harum eaque
                                itaque est id reprehenderit excepturi eius
                                temporibus, illo officia amet nobis sapiente
                                dolorem ipsa earum adipisci recusandae cumque.
                            </p>
                            {training &&
                                trainingTypes.filter(
                                    (type: any) =>
                                        training?.TrainingTypes?.includes(
                                            type.id,
                                        ) && type.procedure,
                                ).length > 0 && (
                                    <SeaLogsButton
                                        text="View Procedures"
                                        type="primary"
                                        action={() =>
                                            setOpenViewProcedure(true)
                                        }
                                    />
                                )}
                        </div>
                        <div className="col-span-2">
                            <div className="flex w-full gap-4">
                                <div className="w-full">
                                    <div className="w-full my-4 flex flex-col">
                                        <label className="mb-1 text-sm">
                                            Trainer
                                        </label>
                                        <CrewDropdown
                                            value={training?.TrainerID}
                                            onChange={handleTrainerChange}
                                        />
                                        <small className="text-red-500">
                                            {hasFormErrors &&
                                                formErrors.TrainerID}
                                        </small>
                                    </div>
                                    <div className="w-full mt-4 flex flex-col">
                                        <TrainingTypeMultiSelectDropdown
                                            value={training?.TrainingTypes}
                                            onChange={handleTrainingTypeChange}
                                        />
                                        <small className="text-red-500">
                                            {hasFormErrors &&
                                                formErrors.TrainingTypes}
                                        </small>
                                    </div>
                                </div>
                                <div className="w-full mt-4 flex flex-col">
                                    <label className="mb-1 text-sm">Crew</label>
                                    <CrewMultiSelectDropdown
                                        value={training?.Members}
                                        onChange={handleMemberChange}
                                    />
                                </div>
                            </div>
                            <div className="flex w-full gap-4 mt-4">
                                <div className="w-full ">
                                    <DatePicker
                                        onChange={handleTrainingDateChange}>
                                        <Group>
                                            <Button className={`w-full`}>
                                                <input
                                                    id="start-date"
                                                    name="date"
                                                    type="text"
                                                    value={trainingDate}
                                                    className={classes.input}
                                                    aria-describedby="start-date-error"
                                                    required
                                                    onChange={
                                                        handleTrainingDateChange
                                                    }
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
                                                                        date={
                                                                            date
                                                                        }
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
                                    <small className="text-red-500">
                                        {hasFormErrors && formErrors.Date}
                                    </small>
                                </div>
                                <div className="w-full">
                                    {vessels &&
                                        (rawTraining || trainingID === 0) && (
                                            <Select
                                                id="vessel-dropdown"
                                                closeMenuOnSelect={true}
                                                options={vessels}
                                                menuPlacement="top"
                                                defaultValue={
                                                    rawTraining?.trainingLocationType ===
                                                    'Vessel'
                                                        ? vessels?.filter(
                                                              (vessel: any) =>
                                                                  vessel.value ===
                                                                  training?.VesselID,
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
                                                              : vessels.find(
                                                                      (
                                                                          vessel: any,
                                                                      ) =>
                                                                          +vessel.value ===
                                                                          +vesselId,
                                                                  )
                                                                ? {
                                                                      label: vessels.find(
                                                                          (
                                                                              vessel: any,
                                                                          ) =>
                                                                              +vessel.value ===
                                                                              +vesselId,
                                                                      )?.label,
                                                                      value: vessels.find(
                                                                          (
                                                                              vessel: any,
                                                                          ) =>
                                                                              +vessel.value ===
                                                                              +vesselId,
                                                                      )?.value,
                                                                  }
                                                                : null
                                                }
                                                onChange={
                                                    handleTrainingVesselChange
                                                }
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
                                                    indicatorSeparator: () =>
                                                        '!hidden',
                                                    multiValue: () =>
                                                        '!bg-sky-100 inline-block rounded px-1 py-0.5 m-0 !mr-1.5 border border-sky-300 !rounded-md !text-sky-900 font-normal mr-2',
                                                    clearIndicator: () =>
                                                        '!py-0',
                                                    valueContainer: () =>
                                                        '!py-1 h-10',
                                                    menu: () =>
                                                        classes.selectMenu,
                                                    option: () =>
                                                        classes.selectOption,
                                                }}
                                            />
                                        )}
                                    <small className="text-red-500">
                                        {hasFormErrors && formErrors.VesselID}
                                    </small>
                                </div>

                                {/* <div className="w-full">
                                    <TrainingLocationDropdown
                                        value={training?.TrainingLocation}
                                        onChange={handleTrainingLocationChange}
                                    />
                                    <small className="text-red-500">
                                        {hasFormErrors && formErrors.VesselID}
                                    </small>
                                </div> */}
                            </div>
                            <div className="col-span-3 md:col-span-2">
                                <div className="my-4 flex items-center w-full">
                                    <Editor
                                        id="TrainingSummary"
                                        placeholder="Summary of training, identify any outcomes, further training required or other observations."
                                        className="!w-full bg-white ring-1 ring-inset ring-gray-200"
                                        handleEditorChange={handleEditorChange}
                                        content={content}
                                    />
                                </div>
                            </div>
                            {/*<div className="w-full my-4 flex flex-col">
                                <textarea
                                    id="TrainingSummary"
                                    name="TrainingSummary"
                                    placeholder="Summary"
                                    defaultValue={training?.TrainingSummary}
                                    rows={4}
                                    className={classes.textarea}></textarea>
                            </div>*/}
                        </div>
                    </div>
                    <hr className="my-2" />
                    <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                        <div className="my-4 text-xl">Signatures</div>
                        <div className="col-span-2 my-4 flex justify-between flex-wrap gap-4">
                            {selectedMemberList &&
                                selectedMemberList.map(
                                    (member: any, index: number) => (
                                        <div
                                            className="w-full md:w-96"
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
                    <hr className="mb-4" />
                    <div className="flex justify-end px-4 pb-4 pt-4">
                        <Link
                            href="/crew-training"
                            className={`inline-flex justify-center items-center`}>
                            <Button className="group rounded-md mr-8 text-sm text-gray-600 dark:text-gray-100 hover:text-gray-600">
                                Cancel
                            </Button>
                        </Link>
                        {/* <Button className="group inline-flex justify-center items-center mr-8 rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-600 shadow-sm hover:bg-white hover:text-rose-600 ring-1 ring-rose-600">
                                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="-ml-0.5 mr-1.5 h-5 w-5 border border-rose-600 group-hover:border-white rounded-full group-hover:bg-rose-600 group-hover:text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                                Delete task
                            </Button> */}
                        <Button
                            onPress={handleSave}
                            isDisabled={
                                mutationCreateTrainingSessionLoading ||
                                mutationUpdateTrainingSessionLoading
                            }
                            className="group inline-flex justify-center items-center rounded-md bg-sky-700 px-4 py-2 text-sm text-white shadow-sm hover:bg-white hover:text-sky-800 ring-1 ring-sky-700">
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
                            {trainingID === 0
                                ? 'Create Session'
                                : 'Update Session'}
                        </Button>
                    </div>
                </div>
            )}
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
        <div className="flex flex-col items-right gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">{member}</div>
                <Button
                    onPress={handleClear}
                    className="peer flex justify-between text-sm">
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
                    className: 'sigCanvas border border-sllightblue-200',
                }}
                onEnd={handleSignatureChanged}
            />
        </div>
    )
}

export default TrainingForm
