'use client'
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import {
    Button,
    Dialog,
    DialogTrigger,
    Heading,
    Modal,
    ModalOverlay,
    Popover,
} from 'react-aria-components'
import { StaticTimePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import Select from 'react-select'
import { useMutation, useLazyQuery } from '@apollo/client'
import { UpdateVesselDailyCheck_LogBookEntrySection } from '@/app/lib/graphQL/mutation'
import {
    AlertDialog,
    DailyCheckField,
    DailyCheckGroupField,
    FooterWrapper,
    PopoverWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import {
    CrewMembers_LogBookEntrySection,
    GET_SECTION_MEMBER_COMMENTS,
    VesselDailyCheck_LogBookEntrySection,
} from '@/app/lib/graphQL/query'
import {
    CREATE_COMPONENT_MAINTENANCE_CHECK,
    CreateVesselDailyCheck_LogBookEntrySection,
    UPDATE_SECTION_MEMBER_COMMENT,
    CREATE_SECTION_MEMBER_COMMENT,
} from '@/app/lib/graphQL/mutation'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { getLogBookEntryByID, getSeaLogsMembersList } from '@/app/lib/actions'
import { InputSkeleton } from '../skeletons'
import toast, { Toaster } from 'react-hot-toast'
import {
    getDailyCheckNotification,
    displayDescription,
    composeField,
    displayField,
    getFilteredFields,
    getSortOrder,
    displayDescriptionIcon,
    getFieldLabel,
} from '@/app/ui/daily-checks/actions'
import { classes } from '@/app/components/GlobalClasses'
import SlidingPanel from 'react-sliding-side-panel'
import { XMarkIcon } from '@heroicons/react/24/outline'
import 'react-quill/dist/quill.snow.css'
import LogBookEntryModel from '@/app/offline/models/logBookEntry'
import CrewMembers_LogBookEntrySectionModel from '@/app/offline/models/crewMembers_LogBookEntrySection'
import SectionMemberCommentModel from '@/app/offline/models/sectionMemberComment'
import VesselDailyCheck_LogBookEntrySectionModel from '@/app/offline/models/vesselDailyCheck_LogBookEntrySection'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import ComponentMaintenanceCheckModel from '@/app/offline/models/componentMaintenanceCheck'
import SeaLogsMemberModel from '@/app/offline/models/seaLogsMember'

export default function Safety({
    logBookConfig = false,
    vesselDailyCheck = false,
    comments,
    setComments,
    setTab,
    setVesselDailyCheck,
    locked,
    handleCreateTask,
    createMaintenanceCheckLoading,
    offline = false,
    edit_logBookEntry,
}: {
    logBookConfig: any
    vesselDailyCheck: any
    comments: any
    setComments: any
    setTab: any
    setVesselDailyCheck: any
    locked: boolean
    handleCreateTask: any
    createMaintenanceCheckLoading: any
    offline?: boolean
    edit_logBookEntry: boolean
}) {
    const logBookModel = new LogBookEntryModel()
    const lbCrewModel = new CrewMembers_LogBookEntrySectionModel()
    const dailyCheckModel = new VesselDailyCheck_LogBookEntrySectionModel()
    const commentModel = new SectionMemberCommentModel()
    const maintenanceModel = new ComponentMaintenanceCheckModel()
    const memberModel = new SeaLogsMemberModel()
    const router = useRouter()
    const searchParams = useSearchParams()
    const vesselID = searchParams.get('vesselID') ?? 0
    const logentryID = searchParams.get('logentryID') ?? 0
    const [logbook, setLogbook] = useState([] as any)
    const [openDescriptionPanel, setOpenDescriptionPanel] = useState(false)
    const [descriptionPanelContent, setDescriptionPanelContent] = useState('')
    const [descriptionPanelHeading, setDescriptionPanelHeading] = useState('')
    const [sectionComment, setSectionComment] = useState('')
    const [
        getSectionCrewMembers_LogBookEntrySection,
        { loading: crewMembersLoading },
    ] = useLazyQuery(CrewMembers_LogBookEntrySection, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            let data = response.readCrewMembers_LogBookEntrySections.nodes
            const crewMembers = data
                .map((member: any) => {
                    return {
                        label: `${member.crewMember.firstName ?? ''} ${member.crewMember.surname ?? ''}`,
                        value: member.crewMember.id,
                    }
                })
                .filter((member: any) => member.value != logbook.master.id)
            setMemberList([...memberList, ...crewMembers])
        },
        onError: (error: any) => {
            console.error('CrewMembers_LogBookEntrySection error', error)
        },
    })
    const handleSetLogbook = async (logbook: any) => {
        setLogbook(logbook)
        const master = logbook.master
            ? {
                  label: `${logbook.master.firstName ?? ''} ${logbook.master.surname ?? ''}`,
                  value: logbook.master.id,
              }
            : null
        if (!master) {
            setMemberList([master])
        }
        const mList = master ? [master] : []
        // Get the logbook crew members
        const sections = logbook.logBookEntrySections.nodes.filter(
            (node: any) => {
                return (
                    node.className ===
                    'SeaLogs\\CrewMembers_LogBookEntrySection'
                )
            },
        )
        if (sections) {
            const sectionIDs = sections.map((section: any) => section.id)
            if (sectionIDs?.length > 0) {
                if (offline) {
                    let data = await lbCrewModel.getByIds(sectionIDs)
                    const crewMembers = data
                        .map((member: any) => {
                            return {
                                label: `${member.crewMember.firstName ?? ''} ${member.crewMember.surname ?? ''}`,
                                value: member.crewMember.id,
                            }
                        })
                        .filter(
                            (member: any) => member.value != logbook.master?.id,
                        )

                    setMemberList([...mList, ...crewMembers])
                } else {
                    getSectionCrewMembers_LogBookEntrySection({
                        variables: {
                            filter: { id: { in: sectionIDs } },
                        },
                    })
                }
            }
        }
    }

    // const [createMaintenanceCheck, { loading: createMaintenanceCheckLoading }] =
    //     useMutation(CREATE_COMPONENT_MAINTENANCE_CHECK, {
    //         onCompleted: (response: any) => {
    //             const data = response.createComponentMaintenanceCheck
    //             if (data) {
    //                 setNewTaskID(data.id)
    //                 setOpenCreateTaskSidebar(true)
    //             }
    //         },
    //         onError: (error: any) => {
    //             console.error('createMaintenanceCheck error', error)
    //         },
    //     })

    // const handleCreateTask = async () => {
    //     const assignedBy = localStorage.getItem('userId')
    //     await createMaintenanceCheck({
    //         variables: {
    //             input: {
    //                 name: `New Task ${new Date().toLocaleDateString()}`,
    //                 startDate: new Date().toLocaleDateString(),
    //                 severity: 'Low',
    //                 status: 'Save As Draft',
    //                 assignedByID: assignedBy,
    //                 inventoryID: null,
    //                 basicComponentID: vesselID,
    //             },
    //         },
    //     })
    // }

    /* const handleSetMemberList = (members: any) => {
        setMemberList(
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
    } */

    // getSeaLogsMembersList(handleSetMemberList)
    if (!offline) {
        getLogBookEntryByID(+logentryID, handleSetLogbook)
    }

    const [saving, setSaving] = useState(false)
    const [openCommentAlert, setOpenCommentAlert] = useState(false)
    const [currentComment, setCurrentComment] = useState<any>('')
    const [crewResponsible, setCrewResponsible] = useState<any>(
        vesselDailyCheck?.crewResponsible?.nodes?.map((member: any) => ({
            label: member.firstName + ' ' + member.surname,
            value: member.id,
        })),
    )
    const [currentField, setCurrentField] = useState<any>('')
    const [memberList, setMemberList] = useState<any>(false)

    const [checkTime, setCheckTime] = useState(
        vesselDailyCheck?.checkTime
            ? dayjs(vesselDailyCheck?.checkTime)
            : dayjs(),
    )

    const handleSafetyChecks = async (check: Boolean, value: any) => {
        if (vesselDailyCheck?.id > 0) {
            const variables = {
                id: vesselDailyCheck.id,
                logBookEntryID: logentryID,
                [value]: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const newVesselDailyCheck =
                    await dailyCheckModel.save(variables)
                setSaving(true)
                setVesselDailyCheck([newVesselDailyCheck])
                const sections = logbook.logBookEntrySections.nodes
                const section = {
                    className: 'SeaLogs\\VesselDailyCheck_LogBookEntrySection',
                    id: `${vesselDailyCheck.id}`,
                    logBookComponentClass: 'VesselDailyCheck_LogBookComponent',
                    __typename: 'VesselDailyCheck_LogBookEntrySection',
                }
                if (
                    !sections.some(
                        (s: any) =>
                            JSON.stringify(s) === JSON.stringify(section),
                    )
                ) {
                    sections.push(section)
                }
                const lb = {
                    ...logbook,
                    logBookEntrySections: { nodes: sections },
                }
                await logBookModel.save(lb)
                getOfflineLogBookEntry()
            } else {
                updateVesselDailyCheck_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
        /* vesselDailyCheck?.id > 0 &&
            updateVesselDailyCheck_LogBookEntrySection({
                variables: {
                    input: {
                        id: vesselDailyCheck.id,
                        [value]: check ? 'OK' : 'Not Ok',
                    },
                },
            }) */
    }

    const handleCheckTime = async (date: any) => {
        setCheckTime(dayjs(date))

        if (vesselDailyCheck?.id > 0) {
            const variables = {
                id: vesselDailyCheck?.id,
                logBookEntryID: logentryID,
                checkTime: dayjs(date).format('YYYY-MM-DD HH:mm'),
            }
            if (offline) {
                const newVesselDailyCheck =
                    await dailyCheckModel.save(variables)
                setSaving(true)
                setVesselDailyCheck([newVesselDailyCheck])
                const sections = logbook.logBookEntrySections.nodes
                const section = {
                    className: 'SeaLogs\\VesselDailyCheck_LogBookEntrySection',
                    id: `${vesselDailyCheck.id}`,
                    logBookComponentClass: 'VesselDailyCheck_LogBookComponent',
                    __typename: 'VesselDailyCheck_LogBookEntrySection',
                }
                if (
                    !sections.some(
                        (s: any) =>
                            JSON.stringify(s) === JSON.stringify(section),
                    )
                ) {
                    sections.push(section)
                }
                const lb = {
                    ...logbook,
                    logBookEntrySections: { nodes: sections },
                }
                await logBookModel.save(lb)
                getOfflineLogBookEntry()
            } else {
                updateVesselDailyCheck_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
        /* vesselDailyCheck?.id > 0 &&
            updateVesselDailyCheck_LogBookEntrySection({
                variables: {
                    input: {
                        checkTime: dayjs(date).format('YYYY-MM-DD HH:mm'),
                    },
                },
            }) */
    }

    const setCurrentTime = () => {
        setCheckTime(dayjs())
        handleCheckTime(dayjs())
    }

    const [updateVesselDailyCheck_LogBookEntrySection] = useMutation(
        UpdateVesselDailyCheck_LogBookEntrySection,
        {
            onCompleted: (response) => {
                console.log('Safety check completed')
            },
            onError: (error) => {
                console.error('Error completing safety check', error)
            },
        },
    )

    const [getSectionVesselDailyCheck_LogBookEntrySection] = useLazyQuery(
        VesselDailyCheck_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readVesselDailyCheck_LogBookEntrySections.nodes
                setVesselDailyCheck(data)
                setSaving(true)
                if (vesselDailyCheck === data[0]) {
                    toast.dismiss()
                    toast.custom((t) =>
                        getDailyCheckNotification(
                            fields,
                            logBookConfig,
                            vesselDailyCheck,
                            'Safety Checks',
                            handleSetTab,
                        ),
                    )
                }
            },
            onError: (error: any) => {
                console.error(
                    'VesselDailyCheck_LogBookEntrySection error',
                    error,
                )
            },
        },
    )

    const handleSetTab = (tab: any) => {
        toast.remove()
        setTab(tab)
    }

    useEffect(() => {
        if (saving) {
            toast.dismiss()
            toast.custom((t) =>
                getDailyCheckNotification(
                    fields,
                    logBookConfig,
                    vesselDailyCheck,
                    'Safety Checks',
                    handleSetTab,
                ),
            )
        }
    }, [vesselDailyCheck])

    const getComment = (fieldName: string, commentType = 'FieldComment') => {
        const comment =
            comments?.length > 0
                ? comments.filter(
                      (comment: any) =>
                          comment.fieldName === fieldName &&
                          comment.commentType === commentType,
                  )
                : false
        return comment.length > 0 ? comment[0] : false
    }

    const showCommentPopup = (comment: any, field: any) => {
        setCurrentComment(comment ? comment : '')
        setCurrentField(field)
        setOpenCommentAlert(true)
    }

    const handleSaveComment = async () => {
        setOpenCommentAlert(false)
        const comment = (document.getElementById('comment') as HTMLInputElement)
            ?.value
        let id = currentComment?.id ? currentComment?.id : 0
        if (offline) {
            id = currentComment?.id ? currentComment?.id : generateUniqueId()
        }
        const variables = {
            id: id,
            fieldName: currentField[0]?.fieldName || 'Safety',
            comment: comment,
            logBookEntryID: +logentryID,
            logBookEntrySectionID: vesselDailyCheck.id,
            commentType: 'FieldComment',
        }
        if (currentComment) {
            if (offline) {
                await commentModel.save(variables)
                loadSectionMemberComments()
            } else {
                updateSectionMemberComment({
                    variables: { input: variables },
                })
            }
        } else {
            if (offline) {
                await commentModel.save(variables)
                loadSectionMemberComments()
            } else {
                createSectionMemberComment({
                    variables: { input: variables },
                })
            }
        }
    }

    const [updateSectionMemberComment] = useMutation(
        UPDATE_SECTION_MEMBER_COMMENT,
        {
            onCompleted: (response) => {
                console.log('Comment updated')
                loadSectionMemberComments()
            },
            onError: (error) => {
                console.error('Error updating comment', error)
            },
        },
    )

    const [createSectionMemberComment] = useMutation(
        CREATE_SECTION_MEMBER_COMMENT,
        {
            onCompleted: (response) => {
                console.log('Comment created')
                loadSectionMemberComments()
            },
            onError: (error) => {
                console.error('Error creating comment', error)
            },
        },
    )

    const [querySectionMemberComments] = useLazyQuery(
        GET_SECTION_MEMBER_COMMENTS,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readSectionMemberComments.nodes
                if (data) {
                    setComments(data)
                }
            },
            onError: (error: any) => {
                console.error('querySectionMemberComments error', error)
            },
        },
    )

    /* const [querySectionMemberCommentsOnline] = useLazyQuery(
        GET_SECTION_MEMBER_COMMENTS,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readSectionMemberComments.nodes
                if (data) {
                    setComments(data)
                }
            },
            onError: (error: any) => {
                console.error('querySectionMemberComments error', error)
            },
        },
    ) */

    const loadSectionMemberComments = async () => {
        if (offline) {
            const data = await commentModel.getByLogBookEntrySectionID(
                vesselDailyCheck.id,
            )
            if (data) {
                setComments(data)
            }
        } else {
            await querySectionMemberComments({
                variables: {
                    filter: {
                        logBookEntrySectionID: { eq: vesselDailyCheck.id },
                    },
                },
            })
        }
    }

    const fields = [
        {
            name: 'EPIRB',
            label: 'EPIRB as expected',
            value: 'epirb',
            sortOrder: getSortOrder('EPIRB', logBookConfig),
            checked: vesselDailyCheck?.epirb,
        },
        {
            name: 'LifeJackets',
            label: 'Life jackets',
            value: 'lifeJackets',
            sortOrder: getSortOrder('LifeJackets', logBookConfig),
            checked: vesselDailyCheck?.lifeJackets,
        },
        {
            name: 'LifeRings',
            label: 'Life rings',
            value: 'lifeRings',
            sortOrder: getSortOrder('LifeRings', logBookConfig),
            checked: vesselDailyCheck?.lifeRings,
        },
        {
            name: 'Flares',
            label: 'Flares, visual distress signals',
            value: 'flares',
            sortOrder: getSortOrder('Flares', logBookConfig),
            checked: vesselDailyCheck?.flares,
        },
        {
            name: 'FireExtinguisher',
            label: 'Fire equipment',
            value: 'fireExtinguisher',
            sortOrder: getSortOrder('FireExtinguisher', logBookConfig),
            checked: vesselDailyCheck?.fireExtinguisher,
        },
        {
            name: 'SafetyEquipment',
            label: 'Safety equipment',
            value: 'safetyEquipment',
            sortOrder: getSortOrder('SafetyEquipment', logBookConfig),
            checked: vesselDailyCheck?.safetyEquipment,
        },
        {
            name: 'FireHoses',
            label: 'Fire hoses, nozzles and cam locks fitted as expected',
            value: 'fireHoses',
            sortOrder: getSortOrder('FireHoses', logBookConfig),
            checked: vesselDailyCheck?.fireHoses,
        },
        {
            name: 'FireBuckets',
            label: 'Fire buckets',
            value: 'fireBuckets',
            sortOrder: getSortOrder('FireBuckets', logBookConfig),
            checked: vesselDailyCheck?.fireBuckets,
        },
        {
            name: 'FireBlanket',
            label: 'Fire blankets',
            value: 'fireBlanket',
            sortOrder: getSortOrder('FireBlanket', logBookConfig),
            checked: vesselDailyCheck?.fireBlanket,
        },
        {
            name: 'FireAxes',
            label: 'Fire axes',
            value: 'fireAxes',
            sortOrder: getSortOrder('FireAxes', logBookConfig),
            checked: vesselDailyCheck?.fireAxes,
        },
        {
            name: 'FirePump',
            label: 'Fire pump',
            value: 'firePump',
            sortOrder: getSortOrder('FirePump', logBookConfig),
            checked: vesselDailyCheck?.firePump,
        },
        {
            name: 'FireFlaps',
            label: 'Fire Flaps',
            value: 'fireFlaps',
            sortOrder: getSortOrder('FireFlaps', logBookConfig),
            checked: vesselDailyCheck?.fireFlaps,
        },
        {
            name: 'LifeRaft',
            label: 'Life raft',
            value: 'lifeRaft',
            sortOrder: getSortOrder('LifeRaft', logBookConfig),
            checked: vesselDailyCheck?.lifeRaft,
        },
        {
            name: 'HighWaterAlarm',
            label: 'High water alarm',
            value: 'highWaterAlarm', // Note: This should be highWaterAlarm not `high Water Alarm` as there is no such field known to SilverStripe.
            sortOrder: getSortOrder('HighWaterAlarm', logBookConfig),
            checked: vesselDailyCheck?.highWaterAlarm,
        },
        {
            name: 'FirstAid',
            label: 'First aid',
            value: 'firstAid',
            sortOrder: getSortOrder('FirstAid', logBookConfig),
            checked: vesselDailyCheck?.firstAid,
        },
        {
            name: 'PersonOverboardRescueEquipment',
            label: 'Person overboard rescue equipment',
            value: 'personOverboardRescueEquipment',
            sortOrder: getSortOrder(
                'PersonOverboardRescueEquipment',
                logBookConfig,
            ),
            checked: vesselDailyCheck?.personOverboardRescueEquipment,
        },
        {
            name: 'SmokeDetectors',
            label: 'Smoke and carbon monoxide detectors test',
            value: 'smokeDetectors',
            sortOrder: getSortOrder('SmokeDetectors', logBookConfig),
            checked: vesselDailyCheck?.smokeDetectors,
        },
    ]

    const handleSave = async () => {
        if (offline) {
            const data = await dailyCheckModel.getByIds([vesselDailyCheck.id])
            setVesselDailyCheck(data)
            setSaving(true)
            if (vesselDailyCheck === data[0]) {
                toast.dismiss()
                toast.custom((t) =>
                    getDailyCheckNotification(
                        fields,
                        logBookConfig,
                        vesselDailyCheck,
                        'Safety Checks',
                        handleSetTab,
                    ),
                )
            }
        } else {
            getSectionVesselDailyCheck_LogBookEntrySection({
                variables: {
                    id: [vesselDailyCheck.id],
                },
            })
        }
        toast.loading('Saving safety checks...')

        let id = currentComment?.id ? currentComment?.id : 0
        if (offline) {
            id = currentComment?.id ? currentComment?.id : generateUniqueId()
            const comments = await commentModel.getByLogBookEntrySectionID(
                vesselDailyCheck.id,
            )
            const safetySectionComment = comments.filter(
                (comment: any) =>
                    comment.fieldName === 'Safety' &&
                    comment.commentType === 'Section',
            )
            if (safetySectionComment.length > 0) {
                id = safetySectionComment[0].id
            }
        }
        const variables = {
            id: id,
            fieldName: 'Safety',
            comment: sectionComment,
            logBookEntryID: +logentryID,
            logBookEntrySectionID: vesselDailyCheck.id,
            commentType: 'Section',
        }
        if (currentComment) {
            if (offline) {
                await commentModel.save(variables)
                loadSectionMemberComments()
            } else {
                updateSectionMemberComment({
                    variables: { input: variables },
                })
            }
        } else if (sectionComment != '') {
            if (offline) {
                await commentModel.save(variables)
                loadSectionMemberComments()
            } else {
                createSectionMemberComment({
                    variables: { input: variables },
                })
            }
        }
        const crewResponsibleIDs = crewResponsible?.map(
            (member: any) => member.value,
        )

        if (vesselDailyCheck?.id) {
            if (offline) {
                const crews = crewResponsibleIDs
                    ? await memberModel.getByIds(crewResponsibleIDs)
                    : []
                const variables = {
                    id: vesselDailyCheck?.id,
                    logBookEntryID: logentryID,
                    crewResponsible: { nodes: crews },
                }
                const newVesselDailyCheck =
                    await dailyCheckModel.save(variables)
                setSaving(true)
                setVesselDailyCheck([newVesselDailyCheck])
                const sections = logbook.logBookEntrySections.nodes
                const section = {
                    className: 'SeaLogs\\VesselDailyCheck_LogBookEntrySection',
                    id: `${vesselDailyCheck.id}`,
                    logBookComponentClass: 'VesselDailyCheck_LogBookComponent',
                    __typename: 'VesselDailyCheck_LogBookEntrySection',
                }
                if (
                    !sections.some(
                        (s: any) =>
                            JSON.stringify(s) === JSON.stringify(section),
                    )
                ) {
                    sections.push(section)
                }
                const lb = {
                    ...logbook,
                    logBookEntrySections: { nodes: sections },
                }
                await logBookModel.save(lb)
                getOfflineLogBookEntry()
            } else {
                const variables = {
                    id: vesselDailyCheck?.id,
                    logBookEntryID: logentryID,
                    crewResponsible: crewResponsibleIDs.join(','),
                }
                updateVesselDailyCheck_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }

    const getOfflineLogBookEntry = async () => {
        const logbook = await logBookModel.getById(logentryID)
        if (logbook) {
            handleSetLogbook(logbook)
        }
    }

    useEffect(() => {
        if (offline) {
            getOfflineLogBookEntry()
            loadSectionMemberComments()
        }
    }, [])

    const handleGroupNoChange = async (
        groupField: any,
        groupFieldParent: any,
    ) => {
        await handleSafetyChecks(
            false,
            fields.find((field: any) => field.name === groupFieldParent.name)
                ?.value,
        )
        await Promise.all(
            groupField.map((field: any) =>
                handleSafetyChecks(false, field.value),
            ),
        )
    }

    const handleGroupYesChange = async (
        groupField: any,
        groupFieldParent: any,
    ) => {
        await handleSafetyChecks(
            true,
            fields.find((field: any) => field.name === groupFieldParent.name)
                ?.value,
        )
        await Promise.all(
            groupField.map((field: any) =>
                handleSafetyChecks(true, field.value),
            ),
        )
    }

    /* const getOfflineLogBookEntry = async () => {
        const logbook = await logBookModel.getById(logentryID)
        if (logbook) {
            handleSetLogbook(logbook)
        }
    } */

    /* const onCommentBlur = async (e: any) => {
        const id = getComment('Safety', 'Section')?.id
        if (id > 0) {
            const variables = {
                id: id,
                comment: e.target.value,
            }
            if (offline) {
                await commentModel.save(variables)
                loadSectionMemberComments()
            } else {
                updateSectionMemberComment({
                    variables: { input: variables },
                })
            }
        } else {
            const id = offline ? generateUniqueId() : 0
            const variables = {
                id: id,
                fieldName: 'Safety',
                comment: e.target.value,
                logBookEntryID: +logentryID,
                logBookEntrySectionID: vesselDailyCheck.id,
                commentType: 'Section',
            }
            if (offline) {
                await commentModel.save(variables)
                loadSectionMemberComments()
            } else {
                createSectionMemberComment({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    } */
    useEffect(() => {
        if (offline) {
            getOfflineLogBookEntry()
            loadSectionMemberComments()
        }
    }, [])
    return (
        <>
            <div className="my-4">
                {logBookConfig && vesselDailyCheck && (
                    <>
                        {getFilteredFields(fields, false, logBookConfig)
                            .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                            .map((field: any, index: number) => (
                                <DailyCheckField
                                    locked={
                                        !edit_logBookEntry
                                            ? !edit_logBookEntry
                                            : locked
                                    }
                                    key={index}
                                    displayField={displayField(
                                        field.name,
                                        logBookConfig,
                                    )}
                                    displayDescription={displayDescription(
                                        field.name,
                                        logBookConfig,
                                    )}
                                    setDescriptionPanelContent={
                                        setDescriptionPanelContent
                                    }
                                    setOpenDescriptionPanel={
                                        setOpenDescriptionPanel
                                    }
                                    setDescriptionPanelHeading={
                                        setDescriptionPanelHeading
                                    }
                                    displayLabel={getFieldLabel(
                                        field.name,
                                        logBookConfig,
                                    )}
                                    inputId={field.value}
                                    handleNoChange={() =>
                                        handleSafetyChecks(false, field.value)
                                    }
                                    defaultNoChecked={
                                        field.checked === 'Not_Ok'
                                    }
                                    handleYesChange={() =>
                                        handleSafetyChecks(true, field.value)
                                    }
                                    defaultYesChecked={field.checked === 'Ok'}
                                    commentAction={() =>
                                        showCommentPopup(
                                            getComment(field.name),
                                            composeField(
                                                field.name,
                                                logBookConfig,
                                            ),
                                        )
                                    }
                                    comment={getComment(field.name)?.comment}
                                />
                            ))}
                        {getFilteredFields(fields, true, logBookConfig)
                            ?.filter((groupField: any) =>
                                displayField(groupField.name, logBookConfig),
                            )
                            ?.map((groupField: any) => (
                                <div
                                    key={groupField.name}
                                    className="flex flex-row gap-2 my-4 text-left items-center justify-between">
                                    <div className="my-2">
                                        <div className="text-2xs uppercase font-inter w-48 text-left">
                                            {groupField.field?.title
                                                ? groupField.field.title
                                                : groupField.field.label}
                                            {displayDescription(
                                                groupField.name,
                                                logBookConfig,
                                            ) && (
                                                <SeaLogsButton
                                                    icon="alert"
                                                    className="w-6 h-6 sup -mt-2 ml-0.5"
                                                    action={() => {
                                                        setDescriptionPanelContent(
                                                            displayDescription(
                                                                groupField.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                        setOpenDescriptionPanel(
                                                            true,
                                                        )
                                                        setDescriptionPanelHeading(
                                                            groupField.name,
                                                        )
                                                    }}
                                                />
                                            )}
                                        </div>
                                        {groupField?.items
                                            ?.filter((field: any) =>
                                                displayField(
                                                    field.name,
                                                    logBookConfig,
                                                ),
                                            )
                                            ?.map(
                                                (field: any, index: number) => (
                                                    <span
                                                        key={`${field.label}-${index}`}
                                                        className="text-sm lg:text-base">
                                                        {index <
                                                        groupField.items
                                                            .length -
                                                            1
                                                            ? getFieldLabel(
                                                                  field.name,
                                                                  logBookConfig,
                                                              ) + ' -'
                                                            : getFieldLabel(
                                                                  field.name,
                                                                  logBookConfig,
                                                              )}
                                                        {displayDescription(
                                                            field.name,
                                                            logBookConfig,
                                                        ) && (
                                                            <SeaLogsButton
                                                                icon="alert"
                                                                className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                action={() => {
                                                                    setDescriptionPanelContent(
                                                                        displayDescription(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                    )
                                                                    setOpenDescriptionPanel(
                                                                        true,
                                                                    )
                                                                    setDescriptionPanelHeading(
                                                                        field.name,
                                                                    )
                                                                }}
                                                            />
                                                        )}{' '}
                                                    </span>
                                                ),
                                            )}
                                    </div>
                                    <DailyCheckGroupField
                                        locked={
                                            !edit_logBookEntry
                                                ? !edit_logBookEntry
                                                : locked
                                        }
                                        className="my-4"
                                        groupField={groupField?.items?.filter(
                                            (field: any) =>
                                                displayField(
                                                    field.name,
                                                    logBookConfig,
                                                ),
                                        )}
                                        handleYesChange={() =>
                                            handleGroupYesChange(
                                                groupField?.items?.filter(
                                                    (field: any) =>
                                                        displayField(
                                                            field.name,
                                                            logBookConfig,
                                                        ),
                                                ),
                                                groupField,
                                            )
                                        }
                                        handleNoChange={() =>
                                            handleGroupNoChange(
                                                groupField?.items?.filter(
                                                    (field: any) =>
                                                        displayField(
                                                            field.name,
                                                            logBookConfig,
                                                        ),
                                                ),
                                                groupField,
                                            )
                                        }
                                        defaultNoChecked={
                                            groupField?.items?.filter(
                                                (field: any) =>
                                                    displayField(
                                                        field.name,
                                                        logBookConfig,
                                                    ),
                                            ).length > 0 &&
                                            groupField?.items
                                                ?.filter((field: any) =>
                                                    displayField(
                                                        field.name,
                                                        logBookConfig,
                                                    ),
                                                )
                                                ?.every(
                                                    (field: any) =>
                                                        field.checked ===
                                                        'Not_Ok',
                                                )
                                        }
                                        defaultYesChecked={
                                            groupField?.items?.filter(
                                                (field: any) =>
                                                    displayField(
                                                        field.name,
                                                        logBookConfig,
                                                    ),
                                            ).length > 0 &&
                                            groupField?.items
                                                ?.filter((field: any) =>
                                                    displayField(
                                                        field.name,
                                                        logBookConfig,
                                                    ),
                                                )
                                                ?.every(
                                                    (field: any) =>
                                                        field.checked === 'Ok',
                                                )
                                        }
                                        commentAction={() =>
                                            showCommentPopup(
                                                getComment(groupField.name),
                                                composeField(
                                                    groupField.name,
                                                    logBookConfig,
                                                ),
                                            )
                                        }
                                        comment={
                                            getComment(groupField.name)?.comment
                                        }
                                    />
                                    {groupField?.items?.map(
                                        (field: any, index: number) => (
                                            <DailyCheckField
                                                locked={
                                                    !edit_logBookEntry
                                                        ? !edit_logBookEntry
                                                        : locked
                                                }
                                                className={`lg:!grid-cols-2 hidden my-4`}
                                                innerWrapperClassName={`lg:!col-span-1`}
                                                key={index}
                                                displayField={displayField(
                                                    field.name,
                                                    logBookConfig,
                                                )}
                                                displayDescription={displayDescription(
                                                    field.name,
                                                    logBookConfig,
                                                )}
                                                displayLabel={getFieldLabel(
                                                    field.name,
                                                    logBookConfig,
                                                )}
                                                inputId={field.value}
                                                handleNoChange={() =>
                                                    handleSafetyChecks(
                                                        false,
                                                        field.value,
                                                    )
                                                }
                                                defaultNoChecked={
                                                    field.checked === 'Not_Ok'
                                                }
                                                handleYesChange={() =>
                                                    handleSafetyChecks(
                                                        true,
                                                        field.value,
                                                    )
                                                }
                                                defaultYesChecked={
                                                    field.checked === 'Ok'
                                                }
                                                commentAction={() =>
                                                    showCommentPopup(
                                                        getComment(field.name),
                                                        composeField(
                                                            field.name,
                                                            logBookConfig,
                                                        ),
                                                    )
                                                }
                                                comment={
                                                    getComment(field.name)
                                                        ?.comment
                                                }
                                            />
                                        ),
                                    )}
                                </div>
                            ))}
                    </>
                )}
                <hr className="my-4" />
                <div
                    className={`flex flex-col md:flex-row items-start md:items-center ${displayField('CheckTime', logBookConfig) ? '' : 'hidden'}`}>
                    <label className={`${classes.label} !w-full`}>
                        Time checks completed:
                    </label>
                    <div
                        className={` ${locked || !edit_logBookEntry ? 'pointer-events-none' : ''} flex flex-row items-start gap-2`}>
                        <DialogTrigger>
                            <Button>
                                <input
                                    id="depart-time"
                                    name="depart-time"
                                    type="text"
                                    value={checkTime.format('HH:mm')}
                                    className="bg-slblue-50 w-24 border border-slblue-100 text-slblue-800 text-sm rounded-lg focus:ring-slblue-500 focus:border-slblue-500 block p-2.5 dark:bg-slblue-800 dark:border-white dark:placeholder-slblue-400 dark:text-white dark:focus:ring-slblue-500 dark:focus:border-slblue-500"
                                    aria-describedby="depart-time-error"
                                    required
                                    readOnly
                                    // onChange={() => handleCheckTime}
                                />
                            </Button>
                            <ModalOverlay
                                className={({ isEntering, isExiting }) =>
                                    ` fixed inset-0 z-[15002] overflow-y-auto bg-black/25 flex min-h-full justify-center p-4 text-center backdrop-blur ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''} ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''} `
                                }>
                                <Modal>
                                    <Dialog
                                        role="alertdialog"
                                        className="outline-none relative">
                                        {({ close }) => (
                                            <LocalizationProvider
                                                dateAdapter={AdapterDayjs}>
                                                <StaticTimePicker
                                                    className={`p-0 mr-4`}
                                                    defaultValue={checkTime}
                                                    onAccept={handleCheckTime}
                                                    onClose={close}
                                                    // onChange={handleCheckTime}
                                                />
                                            </LocalizationProvider>
                                        )}
                                    </Dialog>
                                </Modal>
                            </ModalOverlay>
                        </DialogTrigger>
                        {(!locked || edit_logBookEntry) && (
                            <SeaLogsButton
                                text="Set to current time"
                                type="secondary"
                                color="slblue"
                                action={setCurrentTime}
                                className={`w-48 py-2.5`}
                            />
                        )}
                    </div>
                </div>
                <div
                    className={`my-4 flex flex-col md:flex-row items-center dark:text-white ${displayField('CrewResponsible', logBookConfig) ? '' : 'hidden'}`}>
                    <label className={`${classes.label} !w-full`}>
                        Crew responsible for safety checks:
                    </label>
                    <div className="w-full">
                        {!memberList || crewMembersLoading ? (
                            <InputSkeleton />
                        ) : (
                            <Select
                                id="crew-responsible"
                                closeMenuOnSelect={false}
                                isMulti
                                isDisabled={locked || !edit_logBookEntry}
                                options={memberList}
                                menuPlacement="top"
                                onChange={setCrewResponsible}
                                defaultValue={crewResponsible}
                                className={classes.selectMain}
                                classNames={{
                                    control: () => classes.selectControl,
                                    singleValue: () =>
                                        classes.selectSingleValue,
                                    dropdownIndicator: () =>
                                        classes.selectDropdownIndicator,
                                    menu: () => classes.selectMenu,
                                    indicatorSeparator: () =>
                                        classes.selectIndicatorSeparator,
                                    multiValue: () => classes.selectMultiValue,
                                    clearIndicator: () =>
                                        classes.selectClearIndicator,
                                    valueContainer: () =>
                                        classes.selectValueContainer,
                                }}
                            />
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between w-full">
                    <textarea
                        id={`section_comment`}
                        rows={4}
                        readOnly={locked || !edit_logBookEntry}
                        className={classes.textarea}
                        placeholder="Comments ..."
                        onChange={(e) => setSectionComment(e.target.value)}
                        /*onBlur={(e) =>
                            getComment('Safety', 'Section')?.id > 0
                                ? updateSectionMemberComment({
                                        variables: {
                                            input: {
                                                id: getComment(
                                                    'Safety',
                                                    'Section',
                                                )?.id,
                                                comment: e.target.value,
                                            },
                                        },
                                    })
                                : createSectionMemberComment({
                                        variables: {
                                            input: {
                                                fieldName: 'Safety',
                                                comment: e.target.value,
                                                logBookEntryID:
                                                    +logentryID,
                                                logBookEntrySectionID:
                                                    vesselDailyCheck.id,
                                                commentType: 'Section',
                                            },
                                        },
                                    })
                        }*/
                        defaultValue={
                            getComment('Safety', 'Section')?.comment
                        }></textarea>
                </div>
            </div>
            {(!locked || edit_logBookEntry) && (
                <FooterWrapper>
                    <SeaLogsButton
                        text="Cancel"
                        type="text"
                        action={() => router.back()}
                    />
                    <SeaLogsButton
                        text="Create Task"
                        type="secondary"
                        color="slblue"
                        icon="check"
                        action={handleCreateTask}
                        isDisabled={createMaintenanceCheckLoading}
                    />
                    <SeaLogsButton
                        text="Save"
                        type="primary"
                        color="sky"
                        icon="check"
                        action={handleSave}
                    />
                </FooterWrapper>
            )}
            <AlertDialog
                openDialog={openCommentAlert}
                setOpenDialog={setOpenCommentAlert}
                handleCreate={handleSaveComment}
                actionText="Save">
                <div
                    className={`flex flex-col ${locked || !edit_logBookEntry ? 'pointer-events-none' : ''}`}>
                    <label className="text-sm font-medium text-slblue-800 dark:text-slblue-300">
                        Comments
                    </label>
                    <textarea
                        readOnly={locked || !edit_logBookEntry}
                        id="comment"
                        rows={4}
                        className="block p-2.5 w-full mt-4 text-sm text-slblue-800 bg-slblue-50 rounded-lg border border-slblue-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-slblue-700 dark:border-white dark:placeholder-slblue-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Comments ..."
                        defaultValue={
                            currentComment ? currentComment.comment : ''
                        }></textarea>
                </div>
            </AlertDialog>
            <SlidingPanel type={'left'} isOpen={openDescriptionPanel} size={80}>
                <div className="h-[calc(100vh_-_1rem)] pt-4">
                    {openDescriptionPanel && (
                        <div className="bg-sllightblue-50 h-full flex flex-col justify-between rounded-r-lg">
                            <div className="text-xl text-white items-center flex justify-between font-medium py-4 px-6 rounded-tr-lg bg-slblue-1000">
                                <Heading
                                    slot="title"
                                    className="text-lg font-semibold leading-6 my-2 text-white dark:text-slblue-200">
                                    Field -{' '}
                                    <span className="font-thin">
                                        {descriptionPanelHeading}
                                    </span>
                                </Heading>
                                <XMarkIcon
                                    className="w-6 h-6"
                                    onClick={() => {
                                        setOpenDescriptionPanel(false)
                                        setDescriptionPanelContent('')
                                        setDescriptionPanelHeading('')
                                    }}
                                />
                            </div>
                            <div className="text-xl p-4 flex-grow overflow-scroll ql-container">
                                <div className="ql-editor">
                                    <div
                                        className="text-xs leading-loose font-light"
                                        dangerouslySetInnerHTML={{
                                            __html: descriptionPanelContent,
                                        }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SlidingPanel>
            <Toaster position="top-right" />
        </>
    )
}
