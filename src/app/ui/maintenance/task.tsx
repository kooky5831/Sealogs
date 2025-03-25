'use client'
import React, { useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
    Button,
    DialogTrigger,
    Heading,
    Modal,
    Dialog,
    ListBox,
    ListBoxItem,
    ModalOverlay,
    Popover,
    Label,
} from 'react-aria-components'
import {
    GET_CREW_BY_IDS,
    GET_ENGINE_IDS_BY_VESSEL,
    GET_ENGINES,
    GET_FILES,
    GET_MAINTENANCE_CHECK,
    GET_MAINTENANCE_CHECK_SUBTASK,
    GET_RECURRING_TASK,
    GetTaskRecords,
    GetMaintenanceCategories,
    GET_INVENTORIES,
} from '@/app/lib/graphQL/query'
import {
    UPDATE_COMPONENT_MAINTENANCE_CHECK,
    CREATE_SEALOGS_FILE_LINKS,
    UPDATE_COMPONENT_MAINTENANCE_SIGNATURE,
    DELETE_COMPONENT_MAINTENANCE_CHECK,
    UPDATE_COMPONENT_MAINTENANCE_SCHEDULE,
    CREATE_COMPONENT_MAINTENANCE_SCHEDULE,
    CREATE_COMPONENT_MAINTENANCE_SUBTASK,
    UPDATE_COMPONENT_MAINTENANCE_SUBTASK,
    CREATE_MAINTENANCE_CHECK_SUBTASK,
    UPDATE_COMPONENT_MAINTENANCE_CHECK_SUBTASK,
    CreateMissionTimeline,
    UpdateMissionTimeline,
    CreateEngine_Usage,
    UpdateEngine_Usage,
    CREATE_MAINTENANCE_CATEGORY,
    UPDATE_MAINTENANCE_CATEGORY,
} from '@/app/lib/graphQL/mutation'
import {
    ChatBubbleBottomCenterTextIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline'
import Select, { StylesConfig } from 'react-select'
import FileUpload from '@/app/ui/file-upload'
import SignatureCanvas from 'react-signature-canvas'
import dayjs from 'dayjs'
import { InputSkeleton } from '@/app/ui/skeletons'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    SeaLogsButton,
    FooterWrapper,
    AlertDialog,
    PopoverWrapper,
    TableWrapper,
} from '@/app/components/Components'
import {
    getInventoryList,
    getVesselList,
    getMaintenanceCheckByID,
    getSeaLogsMembersList,
    getMaintenanceCheckSubTaskByID,
    isOverDueTask,
} from '@/app/lib/actions'
import { create, isEmpty, set } from 'lodash'
import { classes } from '@/app/components/GlobalClasses'
import FileItem from '@/app/components/FileItem'
import Editor from '../editor'
import TimeField from '../logbook/components/time'
import toast, { Toaster } from 'react-hot-toast'
import DateField from '@/app/components/DateField'
import DateTimeField from '@/app/components/DateTimeField'
import { formatDate } from '@/app/helpers/dateHelper'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import Loading from '@/app/loading'

export default function Task({
    taskId,
    redirectTo,
    inSidebar = false,
    onSidebarClose = () => {},
}: {
    taskId: number
    redirectTo: string
    inSidebar?: boolean
    onSidebarClose?: () => void
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [vessels, setVessels] = useState<any>()
    const [crewMembers, setCrewMembers] = useState<any>()
    const [inventories, setInventories] = useState<any>()
    const [maintenanceChecks, setMaintenanceChecks] = useState<any>()
    const [signature, setSignature] = useState<any>()
    const [fileLinks, setFileLinks] = useState<any>([])
    const [documents, setDocuments] = useState<Array<Record<string, any>>>([])
    const [currentTask, setCurrentTask] = useState<any>()
    const [isCompleted, setIsCompleted] = useState<boolean>(false)
    const [expiryDate, setExpiryDate] = useState<any>('')
    const [scheduleCompletedDate, setScheduleCompletedDate] = useState<any>('')
    const [authorID, setAuthorID] = useState<any>(0)
    const [completionDate, setCompletionDate] = useState<any>('')
    const [startDate, setStartDate] = useState<any>(false)
    const [openSubTaskDialog, setOpenSubTaskDialog] = useState(false)
    const [displayRecurringTasks, setDisplayRecurringTasks] = useState(false)
    const [recurringTasks, setRecurringTasks] = useState<any>(false)
    const [subTasks, setSubTask] = useState<any>([])
    const [currentSubTaskCheckID, setCurrentSubTaskCheckID] = useState<any>()
    const [currentSubTask, setCurrentSubTask] = useState<any>()
    const [displayAddFindings, setDisplayAddFindings] = useState(false)
    const [linkSelectedOption, setLinkSelectedOption] = useState<any>([])
    const [isLastCompletedDateChanged, setIsLastCompletedDateChanged] =
        useState(false)
    const [displayUpdateSubTask, setDisplayUpdateSubTask] = useState(false)
    const [alertSubTaskStatus, setAlertSubTaskStatus] = useState(false)
    const [displayUpdateFindings, setDisplayUpdateFindings] = useState(false)
    const [displayWarnings, setDisplayWarnings] = useState(false)
    const [costsDifference, setCostsDifference] = useState<any>(0)
    const [openDeleteTaskDialog, setOpenDeleteTaskDialog] = useState(false)
    const [openRecordsDialog, setOpenRecordsDialog] = useState(false)
    const [commentTime, setCommentTime] = useState<any>()
    const [openDeleteRecordDialog, setOpenDeleteRecordDialog] = useState(false)
    const [deleteRecordID, setDeleteRecordID] = useState<any>(0)
    const [commentData, setCommentData] = useState<any>(false)
    const [members, setMembers] = useState<any>()
    const [completedRecurringTasks, setCompletedRecurringTasks] = useState<any>(
        [],
    )
    const [crewInfo, setCrewInfo] = useState<any>()
    const [taskTab, setTaskTab] = useState('task')
    const [allInventories, setAllInventories] = useState<any>([])
    const [inventoryDefaultValue, setInventoryDefaultValue] =
        useState<any>(null)
    const [content, setContent] = useState<any>('')
    const [reviewContent, setReviewContent] = useState<any>('')
    const [subtaskContent, setSubtaskContent] = useState<any>('')
    const [subtaskInventoryValue, setSubtaskInventoryValue] = useState<any>([])
    const [taskRecords, setTaskRecords] = useState<any>(false)
    const [engineList, setEngineList] = useState<any>([])
    const [displayCheckEngineCheck, setDisplayCheckEngineCheck] = useState<any>(
        [],
    )
    const [engineHours, setEngineHours] = useState<any>([])
    const [categoryList, setCategoryList] = useState<any>(false)
    const [createCategoryDialog, setCreateCategoryDialog] = useState(false)
    const [tab, setTab] = useState('Details')
    const [loadedInventory, setLoadedInventory] = useState(0)
    const [currentMaintenanceCheck, setCurrentMaintenanceCheck] =
        useState<any>(false)

    const changeTab = (tab: string) => () => {
        setTab(tab)
    }

    const [permissions, setPermissions] = useState<any>(false)
    const [edit_task, setEdit_task] = useState<any>(false)
    const [delete_task, setDelete_task] = useState<any>(false)
    const [complete_task, setComplete_task] = useState<any>(false)
    const [edit_recurring_task, setEdit_recurring_task] = useState<any>(false)

    const init_permissions = () => {
        if (permissions) {
            if (hasPermission('EDIT_TASK', permissions)) {
                setEdit_task(true)
            } else {
                setEdit_task(false)
            }
            if (hasPermission('DELETE_TASK', permissions)) {
                setDelete_task(true)
            } else {
                setDelete_task(false)
            }
            if (hasPermission('COMPLETE_TASK', permissions)) {
                setComplete_task(true)
            } else {
                setComplete_task(false)
            }
            if (hasPermission('EDIT_RECURRING_TASK', permissions)) {
                setEdit_recurring_task(true)
            } else {
                setEdit_recurring_task(false)
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

    const tabClasses = {
        inactive:
            'inline-flex items-center px-4 py-3 border border-slblue-200 rounded-md hover:text-slblue-900 bg-white hover:bg-slblue-1000 hover:text-white w-full dark:bg-slblue-800 dark:hover:bg-slblue-700 dark:hover:text-white ring-1 ring-transparent hover:ring-slblue-1000',
        active: 'inline-flex items-center px-4 py-3 border border-slblue-200 rounded-md text-white bg-slblue-800 w-full dark:bg-slblue-1000',
    }

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

    getSeaLogsMembersList(handleSetMemberList)

    const handleCommentTimeChange = (date: any) => {
        setCommentTime(date)
    }

    const handleScheduleCompletedDateChange = (newValue: any) => {
        setScheduleCompletedDate(newValue)
    }

    const handleEditorChange = (value: any) => {
        setContent(value)
    }

    const handleReviewEditorChange = (value: any) => {
        setReviewContent(value)
    }

    const handleSubtaskEditorChange = (value: any) => {
        setSubtaskContent(value)
    }

    getMaintenanceCheckSubTaskByID(taskId, setSubTask)

    getSeaLogsMembersList(setCrewMembers)

    // const handleSetInventories = (data: any) => {
    //     setAllInventories(data)
    //     if (maintenanceChecks?.basicComponentID > 0) {
    //         const filteredInvenventories = data.filter((inventory: any) => {
    //             return (
    //                 inventory.vesselID === maintenanceChecks?.basicComponentID
    //             )
    //         })
    //         setInventories(filteredInvenventories)
    //     } else {
    //         setInventories(data)
    //     }
    // }

    const [queryInventories] = useLazyQuery(GET_INVENTORIES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readInventories.nodes
            if (data) {
                setInventories(data)
            }
        },
        onError: (error: any) => {
            console.error('queryInventoriesEntry error', error)
        },
    })

    const loadInventories = async () => {
        const vesselID =
            currentTask?.basicComponentID > 0
                ? currentTask.basicComponentID
                : maintenanceChecks?.basicComponentID
        if (vesselID > 0) {
            if (loadedInventory != vesselID) {
                setLoadedInventory(vesselID)
                await queryInventories({
                    variables: {
                        filter: {
                            vesselID: {
                                eq: vesselID,
                            },
                        },
                    },
                })
            }
        } else {
            setLoadedInventory(0)
            await queryInventories()
        }
    }

    useEffect(() => {
        loadInventories()
    }, [maintenanceChecks, currentTask])

    const handleVesselList = (vessels: any) => {
        const activeVessels = vessels.filter((vessel: any) => !vessel.archived)
        const appendedData = activeVessels.map((item: any) => ({
            ...item,
        }))
        appendedData.push({ title: 'Other', id: 0 })
        setVessels(appendedData)
    }

    getVesselList(handleVesselList)

    const handleSetMaintenanceChecks = (data: any) => {
        setCurrentMaintenanceCheck(data)
        data?.startDate && setStartDate(dayjs(data.startDate))
        {
            data?.expires &&
                data?.maintenanceScheduleID == 0 &&
                setExpiryDate(dayjs(data.expires))
        }
        {
            data?.dateCompleted
                ? setCompletionDate(dayjs(data.dateCompleted))
                : data?.completed && setCompletionDate(dayjs(data.completed))
        }
        if (data?.maintenanceScheduleID > 0) {
            setDisplayRecurringTasks(true)
            setRecurringTasks(data?.maintenanceSchedule)
            upcomingScheduleDate(data)
            data?.basicComponentID > 0 &&
                getEngineIdsByVessel({
                    variables: {
                        id: +data?.basicComponentID,
                    },
                })
        }
        setMaintenanceChecks(data)
        setInventoryDefaultValue(
            data?.inventory?.id > 0
                ? {
                      label: data.inventory.item,
                      value: data.inventory.id,
                  }
                : {
                      label: null,
                      value: '0',
                  },
        )
        setSignature(data?.maintenanceCheck_Signature)
        {
            data?.documents.nodes?.length > 0 &&
                getFiles(
                    data?.documents.nodes
                        ?.map((link: any) => link.id)
                        .join(','),
                )
        }
        {
            data?.attachmentLinks?.nodes &&
                setLinkSelectedOption(
                    data?.attachmentLinks?.nodes.map((link: any) => ({
                        label: link.link,
                        value: link.id,
                    })),
                )
        }
        setCurrentTask({
            ...currentTask,
            status: data?.status.replaceAll('_', ' '),
        })
        setIsCompleted(data?.status == 'Completed')
        const difference =
            parseInt(data?.projected) - parseInt(data?.actual) > -1 &&
            parseInt(data?.projected) - parseInt(data?.actual)
        setCostsDifference(difference)
        data?.documents?.nodes?.length > 0 &&
            setDocuments(data?.documents?.nodes)
        data?.comments ? setContent(data?.comments) : setContent('')
    }

    const updateCostsDifference = (e: any) => {
        const projected = (
            document.getElementById('task-projected') as HTMLInputElement
        ).value
        const actual = (
            document.getElementById('task-actual') as HTMLInputElement
        ).value
        const newDifference =
            parseInt(projected) - parseInt(actual) > -1 &&
            parseInt(projected) - parseInt(actual)
        setCostsDifference(newDifference)
    }

    getMaintenanceCheckByID(taskId, handleSetMaintenanceChecks)

    const getFiles = async (ids: string) => {
        await queryFiles({
            variables: {
                id: ids,
            },
        })
    }

    const [queryFiles] = useLazyQuery(GET_FILES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const { isSuccess, data } = response.getFile
            if (isSuccess) {
                documents.push(data)
                setDocuments(documents)
            }
        },
        onError: (error: any) => {
            console.error('queryFilesEntry error', error)
        },
    })

    const onChangeComplete = (event: any) => {
        if (event === true) {
            setCurrentTask({
                ...currentTask,
                status: 'Completed',
            })
            setIsCompleted(true)
        }
    }

    const [createSeaLogsFileLinks] = useMutation(CREATE_SEALOGS_FILE_LINKS, {
        onCompleted: (response: any) => {
            const data = response.createSeaLogsFileLinks
            if (data.id > 0) {
                const newLinks = [...fileLinks, data]
                setFileLinks(newLinks)
                linkSelectedOption
                    ? setLinkSelectedOption([
                          ...linkSelectedOption,
                          { label: data.link, value: data.id },
                      ])
                    : setLinkSelectedOption([
                          { label: data.link, value: data.id },
                      ])
            }
        },
        onError: (error: any) => {
            console.error('createSeaLogsFileLinksEntry error', error)
        },
    })

    const priorityOptions = [
        { value: 'None', label: 'None', color: '#1f2937' },
        { value: 'Low', label: 'Low', color: '#15803d' },
        { value: 'Medium', label: 'Medium', color: '#f97316' },
        { value: 'High', label: 'High', color: '#e11d48' },
    ]

    const recurringType = [
        { label: 'Engine Hours', value: 'Hours' },
        { label: 'Days', value: 'Days' },
        { label: 'Weeks', value: 'Weeks' },
        { label: 'Months', value: 'Months' },
        { label: 'Number of sailings', value: 'Uses' },
    ]

    const colourStyles: StylesConfig = {
        option: (
            styles: any,
            {
                data,
                isDisabled,
                isFocused,
                isSelected,
            }: { data: any; isDisabled: any; isFocused: any; isSelected: any },
        ) => {
            const color = data.color
            return {
                ...styles,
                backgroundColor: isDisabled
                    ? undefined
                    : isSelected
                      ? data.color + '20'
                      : isFocused
                        ? data.color + '20'
                        : undefined,
                color: data.color,
            }
        },
        singleValue: (styles: any, data: any) => ({
            ...styles,
            color: priorityOptions.find(
                (option: any) => option.value == data.data.value,
            )?.color,
        }),
    }

    const statusOptions = [
        { value: 'Open', label: 'Open' },
        { value: 'Save As Draft', label: 'Save as Draft' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'On Hold', label: 'On Hold' },
        { value: 'Completed', label: 'Completed' },
    ]

    const subtaskProgress = (
        (subTasks.filter((subtask: any) => subtask.status == 'Completed')
            .length /
            subTasks.length) *
        100
    ).toFixed(0)

    const handleUpdate = async (e: any) => {
        if (!edit_task) {
            toast.error('You do not have permission to delete this task')
            return
        }
        if (displayRecurringTasks && !edit_recurring_task) {
            toast.error('You do not have permission to delete this task')
            return
        }
        if (displayRecurringTasks && typeof e === 'object') {
            //const title = (
            //    document.getElementById('task-title') as HTMLInputElement
            //).value
            const titleElement = document.getElementById(
                'task-title',
            ) as HTMLInputElement
            const title = titleElement ? titleElement.value : '' // Add null checks
            //const frequency = (
            //    document.getElementById('task-frequency') as HTMLInputElement
            //).value
            const frequencyElement = document.getElementById(
                'task-frequency',
            ) as HTMLInputElement
            const frequency = frequencyElement ? frequencyElement.value : ''

            const type = currentTask.occursEveryType
            const scheduleType =
                currentTask.occursEveryType === 'Hours'
                    ? 'DutyHours'
                    : currentTask.occursEveryType === 'Uses'
                      ? 'EquipmentUsages'
                      : 'Frequency'
            //const description = (
            //    document.getElementById(
            //        'recurring-task-description',
            //    ) as HTMLInputElement
            //).value
            const descriptionElement = document.getElementById(
                'recurring-task-description',
            ) as HTMLInputElement
            const description = descriptionElement
                ? descriptionElement.value
                : ''

            //const highWarnWithin = (
            //    document.getElementById('high-warn-within') as HTMLInputElement
            //)?.value
            const highWarnWithinElement = document.getElementById(
                'high-warn-within',
            ) as HTMLInputElement
            const highWarnWithin = highWarnWithinElement
                ? highWarnWithinElement.value
                : ''

            //const mediumWarnWithin = (
            //    document.getElementById(
            //        'medium-warn-within',
            //    ) as HTMLInputElement
            //)?.value
            const mediumWarnWithinElement = document.getElementById(
                'medium-warn-within',
            ) as HTMLInputElement
            const mediumWarnWithin = mediumWarnWithinElement
                ? mediumWarnWithinElement.value
                : ''

            //const lowWarnWithin = (
            //    document.getElementById('low-warn-within') as HTMLInputElement
            //)?.value
            const lowWarnWithinElement = document.getElementById(
                'low-warn-within',
            ) as HTMLInputElement
            const lowWarnWithin = lowWarnWithinElement
                ? lowWarnWithinElement.value
                : ''

            {
                recurringTasks?.id > 0
                    ? await updateMaintenanceSchedule({
                          variables: {
                              input: {
                                  id: recurringTasks.id,
                                  title: title,
                                  description: description,
                                  type: scheduleType,
                                  occursEveryType: type,
                                  occursEvery: +frequency,
                                  highWarnWithin: +highWarnWithin,
                                  mediumWarnWithin: +mediumWarnWithin,
                                  lowWarnWithin: +lowWarnWithin,
                                  warnWithinType: type,
                                  maintenanceChecks: maintenanceChecks.id,
                                  basicComponents: currentTask.basicComponentID
                                      ? currentTask.basicComponentID
                                      : maintenanceChecks.basicComponentID,
                                  inventoryID:
                                      currentTask.InventoryID >= 0
                                          ? currentTask.InventoryID
                                          : maintenanceChecks.inventoryID,
                              },
                          },
                      })
                    : await createMaintenanceSchedule({
                          variables: {
                              input: {
                                  title: title,
                                  description: description,
                                  type: scheduleType,
                                  occursEveryType: type,
                                  occursEvery: +frequency,
                                  highWarnWithin: highWarnWithin,
                                  mediumWarnWithin: mediumWarnWithin,
                                  lowWarnWithin: lowWarnWithin,
                                  warnWithinType: type,
                                  maintenanceChecks: maintenanceChecks.id,
                                  basicComponents: currentTask.basicComponentID
                                      ? currentTask.basicComponentID
                                      : maintenanceChecks.basicComponentID,
                                  inventoryID:
                                      currentTask.inventoryID >= 0
                                          ? currentTask.inventoryID
                                          : maintenanceChecks.inventoryID,
                              },
                          },
                      })
            }
        } else {
            //const name = (
            //    document.getElementById('task-name') as HTMLInputElement
            //)?.value
            const nameElement = document.getElementById(
                'task-name',
            ) as HTMLInputElement
            const name = nameElement ? nameElement.value : ''

            //const workorder = (
            //    document.getElementById('task-workorder') as HTMLInputElement
            //).value
            const workorderElement = document.getElementById(
                'task-workorder',
            ) as HTMLInputElement
            const workorder = workorderElement ? workorderElement.value : ''

            const description = content
            //const projected = (
            //    document.getElementById('task-projected') as HTMLInputElement
            //).value
            const projectedElement = document.getElementById(
                'task-projected',
            ) as HTMLInputElement
            const projected = projectedElement ? projectedElement.value : ''

            //const actual = (
            //    document.getElementById('task-actual') as HTMLInputElement
            //).value
            const actualElement = document.getElementById(
                'task-actual',
            ) as HTMLInputElement
            const actual = actualElement ? actualElement.value : ''

            //const difference = (
            //    document.getElementById('task-difference') as HTMLInputElement
            //).value
            const differenceElement = document.getElementById(
                'task-difference',
            ) as HTMLInputElement
            const difference = differenceElement ? differenceElement.value : ''

            await updateMaintenanceChecks({
                variables: {
                    input: {
                        id: maintenanceChecks.id,
                        workOrderNumber: workorder,
                        projected: projected
                            ? +projected
                            : +maintenanceChecks.projected,
                        actual: actual ? +actual : +maintenanceChecks.actual,
                        difference: difference
                            ? +difference
                            : +maintenanceChecks.difference,
                        name: name,
                        startDate: startDate
                            ? dayjs(startDate).format('YYYY-MM-DD')
                            : maintenanceChecks.startDate,
                        completed: expiryDate
                            ? expiryDate === 'Invalid Date'
                                ? maintenanceChecks.completed
                                : expiryDate
                            : maintenanceChecks.completed,
                        completedByID: currentTask.completedBy,
                        dateCompleted: completionDate
                            ? completionDate
                            : maintenanceChecks.dateCompleted,
                        expires:
                            expiryDate === 'Invalid Date' ? null : expiryDate,
                        comments: description,
                        severity: currentTask.severity,
                        maintenanceCategoryID: currentTask.category,
                        status: currentTask.status
                            ? currentTask.status
                            : maintenanceChecks.status.replaceAll('_', ' '),
                        documents:
                            documents.length > 0
                                ? documents
                                      ?.map((doc: any) => +doc.id)
                                      .join(',')
                                : maintenanceChecks.documents?.nodes
                                      .map((doc: any) => +doc.id)
                                      .join(','),
                        attachmentLinks: linkSelectedOption
                            ? linkSelectedOption
                                  .map((link: any) => link.value)
                                  .join(',')
                            : maintenanceChecks.attachmentLinks?.nodes
                                  .map((link: any) => link.id)
                                  .join(','),
                        assignees: currentTask.assignees
                            ? currentTask.assignees
                            : maintenanceChecks.assignees?.nodes
                                  .map((assignee: any) => assignee.id)
                                  .join(','),
                        assignedToID: currentTask.assignees
                            ? +currentTask.assignees
                            : maintenanceChecks?.assignedToID,
                        basicComponentID: currentTask.basicComponentID
                            ? currentTask.basicComponentID
                            : maintenanceChecks.basicComponentID,
                        inventoryID:
                            currentTask.inventoryID >= 0
                                ? currentTask.inventoryID
                                : maintenanceChecks.inventoryID,
                        maintenanceCheck_SignatureID:
                            maintenanceChecks.maintenanceCheck_SignatureID,
                        recurringID:
                            +maintenanceChecks.recurringID === 0 &&
                            recurringTasks
                                ? taskId
                                : maintenanceChecks.recurringID,
                    },
                },
            })
        }
    }

    const [createMaintenanceSchedule] = useMutation(
        CREATE_COMPONENT_MAINTENANCE_SCHEDULE,
        {
            onCompleted: (response: any) => {
                const data = response.createComponentMaintenanceSchedule
                if (data.id > 0) {
                    handleUpdate(true)
                }
            },
            onError: (error: any) => {
                handleUpdate(true)
                console.error('createMaintenanceScheduleEntry error', error)
            },
        },
    )

    const [createBlankMaintenanceSchedule] = useMutation(
        CREATE_COMPONENT_MAINTENANCE_SCHEDULE,
        {
            onCompleted: (response: any) => {
                const data = response.createComponentMaintenanceSchedule
                updateWithoutCreateMaintenanceChecks({
                    variables: {
                        input: {
                            id: taskId,
                            maintenanceScheduleID: data.id,
                        },
                    },
                })
                setRecurringTasks(data)
            },
            onError: (error: any) => {
                console.error('createMaintenanceScheduleEntry error', error)
            },
        },
    )

    const [updateWithoutCreateMaintenanceChecks] = useMutation(
        UPDATE_COMPONENT_MAINTENANCE_CHECK,
        {
            onCompleted: (response: any) => {
                const data = response.updateComponentMaintenanceCheck
            },
            onError: (error: any) => {
                console.error('updateMaintenanceChecksEntry error', error)
            },
        },
    )

    const [updateMaintenanceSchedule] = useMutation(
        UPDATE_COMPONENT_MAINTENANCE_SCHEDULE,
        {
            onCompleted: (response: any) => {
                const data = response.updateComponentMaintenanceSchedule
                if (data.id > 0) {
                    handleUpdate(true)
                }
            },
            onError: (error: any) => {
                handleUpdate(true)
                console.error('updateMaintenanceScheduleEntry error', error)
            },
        },
    )

    const [updateMaintenanceChecks] = useMutation(
        UPDATE_COMPONENT_MAINTENANCE_CHECK,
        {
            onCompleted: (response: any) => {
                const data = response.updateComponentMaintenanceCheck
                if (
                    displayRecurringTasks &&
                    maintenanceChecks.status != 'Completed' &&
                    currentTask.status == 'Completed'
                ) {
                    router.push(
                        '/maintenance/complete-recurring-task?taskID=' + taskId,
                        // '&lastCompletedDate=' +
                        // expiryDate.format('YYYY-MM-DD'),
                    )
                } else if (data.id > 0) {
                    if (
                        searchParams.get('taskCreated') ||
                        searchParams.get('taskCompleted')
                    ) {
                        if (redirectTo === 'inventory') {
                            router.push(
                                `/inventory/view?id=${
                                    currentTask.inventoryID
                                        ? currentTask.inventoryID
                                        : maintenanceChecks.inventoryID
                                }&inventoryTab=maintenance`,
                            )
                        } else {
                            searchParams.get('redirect_to')
                                ? router.push(
                                      searchParams?.get('redirect_to') + '',
                                  )
                                : router.push('/maintenance')
                        }
                    } else {
                        if (!inSidebar) {
                            searchParams.get('redirect_to')
                                ? router.push(
                                      searchParams?.get('redirect_to') + '',
                                  )
                                : router.push('/maintenance')
                        } else {
                            onSidebarClose()
                        }
                    }
                }
            },
            onError: (error: any) => {
                console.error('updateMaintenanceChecksEntry error', error)
            },
        },
    )

    const handleCancel = () => {
        if (!inSidebar) {
            if (
                searchParams.get('taskCreated') ||
                searchParams.get('taskCompleted')
            ) {
                searchParams.get('redirect_to')
                    ? router.push(searchParams?.get('redirect_to') + '')
                    : router.push('/maintenance')
            } else {
                router.back()
            }
        } else {
            onSidebarClose()
        }
    }

    const onSignatureChanged = async (sign: any) => {
        if (maintenanceChecks.MaintenanceCheck_SignatureID > 0) {
            var newSignature = { ...signature }
            newSignature.SignatureData = sign
            setSignature(newSignature)
            await updateSignature({
                variables: {
                    input: {
                        id: newSignature.id,
                        signatureData: newSignature.signatureData,
                        maintenanceCheckId: newSignature.maintenanceCheckID,
                        memberId: newSignature.memberID,
                    },
                },
            })
        }
    }

    const [updateSignature] = useMutation(
        UPDATE_COMPONENT_MAINTENANCE_SIGNATURE,
        {
            onCompleted: (response: any) => {
                const data = response.updateMaintenanceCheck_Signature
            },
            onError: (error: any) => {
                console.error('updateSignatureEntry error', error)
            },
        },
    )

    const handleExpiryChange = (newValue: any) => {
        setExpiryDate(newValue)
    }

    const handleCompletionChange = (newValue: any) => {
        setCompletionDate(newValue)
    }

    const handleStartDateChange = (newValue: any) => {
        setStartDate(newValue)
        updateDueDate(newValue)
        setIsLastCompletedDateChanged(true)
    }

    const handleDeleteCheck = async () => {
        if (!delete_task) {
            onSidebarClose()
            toast.error('You do not have permission to delete this task')
            return
        }
        if (displayRecurringTasks && !edit_recurring_task) {
            toast.error('You do not have permission to delete this task')
            return
        }
        await deleteMaintenanceCheck({
            variables: {
                id: [+taskId],
            },
        })
    }

    const [deleteMaintenanceCheck] = useMutation(
        DELETE_COMPONENT_MAINTENANCE_CHECK,
        {
            onCompleted: (response: any) => {
                if (!inSidebar) {
                    router.back()
                } else {
                    onSidebarClose()
                }
            },
            onError: (error: any) => {
                console.error('deleteMaintenanceCheckEntry error', error)
            },
        },
    )

    const handleCreateSubTask = () => {
        const subTaskName = (
            document.getElementById('subtask-name') as HTMLInputElement
        ).value
        setOpenSubTaskDialog(false)
        createSubtask({
            variables: {
                input: {
                    task: subTaskName,
                    description: subtaskContent,
                    inventoryID: subtaskInventoryValue,
                },
            },
        })
    }

    const [createSubtask] = useMutation(CREATE_COMPONENT_MAINTENANCE_SUBTASK, {
        onCompleted: (response: any) => {
            const data = response.createMaintenanceScheduleSubTask
            if (data) {
                createSubtaskCheck({
                    variables: {
                        input: {
                            maintenanceScheduleSubTaskID: data.id,
                            componentMaintenanceCheckID: taskId,
                            status: 'In Review',
                        },
                    },
                })
            }
        },
        onError: (error: any) => {
            console.error('createSubtaskEntry error', error)
        },
    })

    const [queryMaintenanceCheckSubTask] = useLazyQuery(
        GET_MAINTENANCE_CHECK_SUBTASK,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readMaintenanceCheckSubTasks.nodes
                if (data) {
                    setSubTask(data)
                }
            },
            onError: (error: any) => {
                console.error('queryMaintenanceCheckSubTask error', error)
            },
        },
    )

    const loadMaintenanceCheckSubTask = async () => {
        await queryMaintenanceCheckSubTask({
            variables: {
                id: +taskId,
            },
        })
    }

    const [createSubtaskCheck] = useMutation(CREATE_MAINTENANCE_CHECK_SUBTASK, {
        onCompleted: (response: any) => {
            const data = response.createMaintenanceCheckSubTask
            if (+data.id > 0) {
                loadMaintenanceCheckSubTask()
            }
        },
        onError: (error: any) => {
            console.error('createSubtaskCheckEntry error', error)
        },
    })

    const handleDisplayRecurringTasks = (e: any) => {
        if (!edit_recurring_task) {
            toast.error('You do not have permission to change recurring tasks')
            return
        }
        setDisplayRecurringTasks(e.target.checked)
        if (!recurringTasks?.id) {
            createBlankMaintenanceSchedule({
                variables: {
                    input: {},
                },
            })
        }
    }

    const updateDueDate = (newStartDate: any = false) => {
        const occursEveryType =
            currentMaintenanceCheck.maintenanceSchedule.occursEveryType
        if (occursEveryType === 'Hours' || occursEveryType === 'Uses') {
            if (occursEveryType === 'Uses') {
                // setExpiryDate(dayjs(maintenanceChecks.equipmentUsagesAtCheck).format('DD/MM/YYYY'))
            }
            // setExpiryDate(dayjs(maintenanceChecks.dutyHoursAtCheck).format('DD/MM/YYYY'))
        } else {
            const occursEvery = parseInt(
                (document.getElementById('task-frequency') as HTMLInputElement)
                    .value ?? '1',
            ) as any
            const lastCompletedDate = dayjs(
                startDate &&
                    new Date(dayjs(startDate).toISOString()).getTime() > 0
                    ? new Date(newStartDate ? newStartDate : startDate)
                    : new Date(),
            ).startOf('day')
            const nextOccurrence = lastCompletedDate.add(
                occursEvery,
                occursEveryType?.slice(0, -1).toLowerCase(),
            )
            if (nextOccurrence.format('DD/MM/YYYY') != 'Invalid Date') {
                setExpiryDate(nextOccurrence)
            }
        }
    }

    const upcomingScheduleDate = (maintenanceChecks: any) => {
        setCurrentTask({
            ...currentTask,
            occursEveryType:
                maintenanceChecks?.maintenanceSchedule?.occursEveryType,
        })
        const recurringTasks = maintenanceChecks?.maintenanceSchedule
        if (maintenanceChecks?.maintenanceSchedule?.id > 0) {
            const occursEveryType = recurringTasks.occursEveryType
                ? recurringTasks.occursEveryType
                : 'Days'
            if (occursEveryType === 'Hours' || occursEveryType === 'Uses') {
                if (occursEveryType === 'Uses') {
                    return (
                        maintenanceChecks.equipmentUsagesAtCheck +
                        ' Equipment Uses'
                    )
                }
                // setExpiryDate(dayjs(maintenanceChecks.dutyHoursAtCheck).format('DD/MM/YYYY'))
                // return maintenanceChecks.dutyHoursAtCheck + ' Engine Hours'
            } else {
                const occursEvery = recurringTasks.occursEvery
                    ? recurringTasks.occursEvery
                    : 1
                const lastCompletedDate = dayjs(
                    maintenanceChecks?.startDate
                        ? new Date(maintenanceChecks.startDate)
                        : new Date(),
                ).startOf('day')
                const nextOccurrence = lastCompletedDate.add(
                    occursEvery,
                    occursEveryType,
                )
                setExpiryDate(nextOccurrence)
                return nextOccurrence.format('DD/MM/YYYY')
            }
        }
        // return dayjs().format('DD/MM/YYYY')
    }

    const lastScheduleDate = () => {
        if (recurringTasks) {
            const occursEveryType = recurringTasks.occursEveryType
                ? recurringTasks.occursEveryType
                : 'Days'
            if (occursEveryType !== 'Hours' && occursEveryType !== 'Uses') {
                const lastCompleted = maintenanceChecks?.startDate
                    ? dayjs(maintenanceChecks.startDate)
                    : dayjs()
                return lastCompleted
            }
        }
        return dayjs()
    }

    const handleUpdateSubTask = (e: any) => {
        if (e?.target?.checked) {
            setCurrentSubTaskCheckID(e.target.id)
            setCurrentSubTask(
                subTasks.filter((subtask: any) => subtask.id == e.target.id)[0]
                    .maintenanceScheduleSubTask.id,
            )
            setSubtaskContent(
                subTasks.filter((subtask: any) => subtask.id == e.target.id)[0]
                    .maintenanceScheduleSubTask.description,
            )
            setSubtaskInventoryValue(
                subTasks.filter((subtask: any) => subtask.id == e.target.id)[0]
                    .maintenanceScheduleSubTask.inventoryID,
            )

            setDisplayUpdateSubTask(true)
            setAlertSubTaskStatus(false)
        }
        if (e?.target?.checked === false) {
            setAlertSubTaskStatus(true)
            setCurrentSubTask(
                subTasks.filter((subtask: any) => subtask.id == e.target.id)[0]
                    .maintenanceScheduleSubTask.id,
            )
            setCurrentSubTaskCheckID(e.target.id)
            setSubtaskContent(
                subTasks.filter((subtask: any) => subtask.id == e.target.id)[0]
                    .maintenanceScheduleSubTask.description,
            )
            setSubtaskInventoryValue(
                subTasks.filter((subtask: any) => subtask.id == e.target.id)[0]
                    .maintenanceScheduleSubTask.inventoryID,
            )
            setDisplayUpdateSubTask(true)
        }
        if (e === 'updateFindings') {
            const subtaskFindings = (
                document.getElementById('subtask-findings') as HTMLInputElement
            ).value
            setDisplayAddFindings(false)
            setAuthorID(0)
            setScheduleCompletedDate('')
            updateSubtaskCheck({
                variables: {
                    input: {
                        id: currentSubTaskCheckID,
                        findings: subtaskFindings,
                        completedByID: authorID,
                        dateCompleted: scheduleCompletedDate,
                    },
                },
            })
        }
        if (e === 'updateSubTask') {
            const subTaskName = (
                document.getElementById('subtask-name') as HTMLInputElement
            ).value
            setDisplayUpdateSubTask(false)
            const dateCompleted = subTasks.find(
                (subtask: any) => subtask.id === currentSubTaskCheckID,
            )?.dateCompleted
                ? dayjs(
                      subTasks.find(
                          (subtask: any) =>
                              subtask.id === currentSubTaskCheckID,
                      ).dateCompleted,
                  )
                : ''
            alertSubTaskStatus
                ? (setDisplayAddFindings(true),
                  setAuthorID(
                      subTasks.find(
                          (subtask: any) =>
                              subtask.id === currentSubTaskCheckID,
                      )?.completedBy?.id,
                  ),
                  setScheduleCompletedDate(dateCompleted))
                : setDisplayAddFindings(false)
            updateSubtask({
                variables: {
                    input: {
                        id: currentSubTask,
                        task: subTaskName,
                        description: subtaskContent,
                        inventoryID: subtaskInventoryValue,
                    },
                },
            })
            updateSubtaskCheck({
                variables: {
                    input: {
                        id: currentSubTaskCheckID,
                        status: alertSubTaskStatus ? 'Completed' : 'In Review',
                    },
                },
            })
        }
        if (e === 'deleteSubTask') {
            const subtaskFindings = subTasks.filter(
                (subtask: any) => subtask.id == currentSubTaskCheckID,
            )[0].findings
            updateSubtaskCheck({
                variables: {
                    input: {
                        id: currentSubTaskCheckID,
                        componentMaintenanceCheckID: '0',
                        findings:
                            subtaskFindings +
                            'deleted from task ' +
                            currentSubTaskCheckID,
                    },
                },
            })
            setDisplayUpdateSubTask(false)
        }
    }

    const [updateSubtask] = useMutation(UPDATE_COMPONENT_MAINTENANCE_SUBTASK, {
        onCompleted: (response: any) => {
            const data = response.updateMaintenanceScheduleSubTask
            if (data.id > 0) {
                loadMaintenanceCheckSubTask()
            }
        },
        onError: (error: any) => {
            console.error('updateSubtaskEntry error', error)
        },
    })

    const [updateSubtaskCheck] = useMutation(
        UPDATE_COMPONENT_MAINTENANCE_CHECK_SUBTASK,
        {
            onCompleted: (response: any) => {
                const data = response.updateMaintenanceCheckSubTask
                if (data.id > 0) {
                    loadMaintenanceCheckSubTask()
                }
            },
            onError: (error: any) => {
                console.error('updateSubtaskCheckEntry error', error)
            },
        },
    )

    const handleSetDisplayAddFindings = (subTaskID: any, e: any) => {
        setDisplayUpdateFindings(false)
        setCurrentSubTaskCheckID(subTaskID)
        setAuthorID(
            subTasks.find((subtask: any) => subtask.id === subTaskID)
                ?.completedBy?.id,
        )
        const dateCompleted = subTasks.find(
            (subtask: any) => subtask.id === subTaskID,
        )?.dateCompleted
            ? dayjs(
                  subTasks.find((subtask: any) => subtask.id === subTaskID)
                      .dateCompleted,
              )
            : ''
        setScheduleCompletedDate(dateCompleted)
        setDisplayAddFindings(true)
    }

    const handleDisplayWarnings = (e: any) => {
        setDisplayWarnings(e.target.checked)
    }

    const deleteFile = async (id: number) => {
        const newDocuments = documents.filter((doc: any) => doc.id !== id)
        setDocuments(newDocuments)
    }

    const [queryCrewMemberInfo] = useLazyQuery(GET_CREW_BY_IDS, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readSeaLogsMembers.nodes
            if (data) {
                setCrewInfo(data)
            }
        },
        onError: (error) => {
            console.error('queryCrewMemberInfo error', error)
        },
    })
    const loadCrewMemberInfo = async (crewId: any) => {
        await queryCrewMemberInfo({
            variables: {
                crewMemberIDs: crewId.length > 0 ? crewId : [0],
            },
        })
    }
    const [readComponentMaintenanceChecks] = useLazyQuery(
        GET_MAINTENANCE_CHECK,
        {
            onCompleted: (response: any) => {
                const data = response.readComponentMaintenanceChecks
                if (data.nodes.length > 0) {
                    const crewIds: number[] = Array.from(
                        new Set(
                            data.nodes
                                .filter((item: any) => item.assignedToID > 0)
                                .map((item: any) => item.assignedToID),
                        ),
                    )
                    loadCrewMemberInfo(crewIds)
                    var maintenanceChecksArray = data.nodes.map(
                        (maintenanceCheck: any) => {
                            return {
                                id: maintenanceCheck.id,
                                name: maintenanceCheck.name,
                                basicComponentID:
                                    maintenanceCheck.basicComponentID,
                                comments: maintenanceCheck.comments,
                                description: maintenanceCheck.description,
                                assignedToID: maintenanceCheck.assignedToID,
                                expires: maintenanceCheck.expires, // the value of maintenanceCheck.expires here is already computed from upcomingScheduleDate()
                                status: maintenanceCheck.status,
                                startDate: maintenanceCheck.startDate,
                                isOverDue: isOverDueTask(maintenanceCheck),
                                isCompleted:
                                    maintenanceCheck.status === 'Completed'
                                        ? '1'
                                        : '2',
                            }
                        },
                    )
                    // Completed: sort by "expires" from recent to oldest
                    maintenanceChecksArray.sort((a: any, b: any) => {
                        if (a.isCompleted === '1' && b.isCompleted === '1') {
                            if (a.expires === 'NA' && b.expires !== 'NA') {
                                return 1
                            } else if (
                                a.expires !== 'NA' &&
                                b.expires === 'NA'
                            ) {
                                return -1
                            } else {
                                return (
                                    new Date(b.expires).getTime() -
                                    new Date(a.expires).getTime()
                                )
                            }
                        } else if (a.isCompleted === '1') {
                            return 1
                        } else if (b.isCompleted === '1') {
                            return -1
                        } else {
                            return dayjs(a.expires).diff(b.expires)
                        }
                    })
                    setCompletedRecurringTasks(maintenanceChecksArray)
                }
            },
            onError: (error: any) => {
                console.error('readComponentMaintenanceChecks error', error)
            },
        },
    )

    const loadCompletedRecurringTasks = async (recurringID: number) => {
        if (recurringID > 0) {
            await readComponentMaintenanceChecks({
                variables: {
                    filter: {
                        recurringID: {
                            eq: recurringID,
                        },
                        status: { eq: 'Completed' },
                    },
                },
            })
        }
    }
    const handleOnChangeVessel = (value: any) => {
        setInventoryDefaultValue({
            label: null,
            value: '0',
        })
        setCurrentTask({
            ...currentTask,
            basicComponentID: value?.value,
            inventoryID: 0,
        })
        setInventories(
            allInventories.filter((inventory: any) => {
                return inventory.vesselID === value?.value
            }),
        )
        getEngineIdsByVessel({
            variables: {
                id: +value?.value,
            },
        })
    }

    const handleOnChangeInventory = (value: any) => {
        setCurrentTask({
            ...currentTask,
            inventoryID: value?.value,
        })
        setInventoryDefaultValue(value)
    }

    const handleSubtaskOnChangeInventory = (value: any) => {
        setSubtaskInventoryValue(value.value)
    }

    const handleDeleteLink = (link: any) => {
        setLinkSelectedOption(linkSelectedOption.filter((l: any) => l !== link))
    }
    const linkItem = (link: any) => {
        return (
            <div className="flex justify-between align-middle mr-2 w-fit">
                <Link href={link.label} target="_blank" className="ml-2 ">
                    {link.label}
                </Link>
                <div className="ml-2 ">
                    <XCircleIcon
                        className="w-5 h-5 text-slred-1000 bg-slred-100 rounded-full cursor-pointer"
                        onClick={() => handleDeleteLink(link)}
                    />
                </div>
            </div>
        )
    }
    useEffect(() => {
        if (maintenanceChecks) {
            loadCompletedRecurringTasks(maintenanceChecks.recurringID)
        }
        getTaskRecords(taskId)
        getCategoryList({
            variables: {
                clientID: +(localStorage.getItem('clientId') ?? 0),
            },
        })
    }, [maintenanceChecks])

    const [getCategoryList] = useLazyQuery(GetMaintenanceCategories, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const data = response.readMaintenanceCategories.nodes
            if (data) {
                setCategoryList(
                    data.map((category: any) => ({
                        label: category.name,
                        value: category.id,
                    })),
                )
            }
        },
        onError: (error) => {
            console.error('Error getting maintenance categories', error)
        },
    })

    const handleSaveRecords = () => {
        const variables = {
            input: {
                commentType: 'General',
                description: reviewContent,
                time: commentTime
                    ? dayjs(commentTime).format('DD/MM/YYYY HH:mm')
                    : dayjs().format('DD/MM/YYYY HH:mm'),
                authorID: commentData?.authorID,
                maintenanceCheckID: taskId,
                subTaskID: displayUpdateSubTask ? currentSubTaskCheckID : 0,
            },
        }
        if (commentData?.id > 0) {
            updateTaskRecord({
                variables: {
                    input: {
                        id: commentData?.id,
                        ...variables.input,
                    },
                },
            })
        } else {
            createTaskRecord({
                variables: {
                    input: {
                        ...variables.input,
                    },
                },
            })
        }
        setOpenRecordsDialog(false)
    }

    const [createTaskRecord] = useMutation(CreateMissionTimeline, {
        onCompleted: (response) => {
            getTaskRecords(taskId)
        },
        onError: (error) => {
            console.error('Error creating Task Record', error)
        },
    })

    const [updateTaskRecord] = useMutation(UpdateMissionTimeline, {
        onCompleted: (response) => {
            getTaskRecords(taskId)
        },
        onError: (error) => {
            console.error('Error updating mission timeline', error)
        },
    })

    const getTaskRecords = (taskId: number) => {
        queryTaskRecords({
            variables: {
                id: taskId,
            },
        })
    }

    const [queryTaskRecords] = useLazyQuery(GetTaskRecords, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const data = response.readMissionTimelines.nodes
            if (data) {
                setTaskRecords(data)
            }
        },
        onError: (error) => {
            console.error('Error getting task records', error)
        },
    })

    const handleDeleteRecord = () => {
        updateTaskRecord({
            variables: {
                input: {
                    id: +deleteRecordID,
                    archived: true,
                },
            },
        })
        setOpenDeleteRecordDialog(false)
    }

    const taskIsDateType = () => {
        if (currentTask.occursEveryType) {
            if (
                currentTask.occursEveryType === 'Days' ||
                currentTask.occursEveryType === 'Weeks' ||
                currentTask.occursEveryType === 'Months'
            ) {
                return true
            }
        } else {
            if (
                recurringTasks?.occursEveryType === 'Days' ||
                recurringTasks?.occursEveryType === 'Weeks' ||
                recurringTasks?.occursEveryType === 'Months'
            ) {
                return true
            }
        }
        return false
    }

    const taskIsEngineHourType = () => {
        if (currentTask?.occursEveryType) {
            if (currentTask.occursEveryType === 'Hours') {
                return true
            }
        } else {
            if (recurringTasks?.occursEveryType === 'Hours') {
                return true
            }
        }
        return false
    }

    const handleSetOccursEveryType = (value: any) => {
        setEngineList([])
        if (value === 'Days' || value === 'Weeks' || value === 'Months') {
            setCurrentTask({
                ...currentTask,
                occursEveryType: value,
            })
        } else if (
            maintenanceChecks?.basicComponentID > 0 ||
            currentTask?.basicComponentID > 0
        ) {
            setCurrentTask({
                ...currentTask,
                occursEveryType: value,
            })
            getEngineIdsByVessel({
                variables: {
                    id:
                        currentTask?.basicComponentID > 0
                            ? currentTask.basicComponentID
                            : maintenanceChecks.basicComponentID,
                },
            })
        } else {
            setCurrentTask({
                ...currentTask,
                occursEveryType: 'Days',
            })
            toast.error('Please add a vessel to set this option')
        }
    }

    const [getEngineIdsByVessel] = useLazyQuery(GET_ENGINE_IDS_BY_VESSEL, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readBasicComponents.nodes
            const engineIds = data.map((engine: any) => engine.id)
            queryGetEngines({
                variables: {
                    id: engineIds,
                },
            })
        },
        onError: (error: any) => {
            console.error('getEnginesByVessel error', error)
        },
    })

    const [queryGetEngines] = useLazyQuery(GET_ENGINES, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.readEngines.nodes
            setEngineList(data)
        },
        onError: (error: any) => {
            console.error('getEngines error', error)
        },
    })

    const handleCheckEngineCheck = (e: any, engineId: number) => {
        setDisplayCheckEngineCheck({
            ...displayCheckEngineCheck,
            [engineId]: e.target.checked,
        })
        if (
            recurringTasks?.engineUsage?.nodes?.find(
                (engine: any) => engine.engine.id === engineId,
            )
        ) {
            updateEngineUsage({
                variables: {
                    input: {
                        id: recurringTasks?.engineUsage?.nodes?.find(
                            (engine: any) => engine.engine.id === engineId,
                        ).id,
                        isScheduled: e.target.checked,
                    },
                },
            })
        } else {
            createEngineUsage({
                variables: {
                    input: {
                        engineID: +engineId,
                        maintenanceScheduleID: +recurringTasks.id,
                        isScheduled: e.target.checked,
                    },
                },
            })
        }
    }

    const [createEngineUsage] = useMutation(CreateEngine_Usage, {
        onCompleted: (response: any) => {
            const data = response.createEngine_Usage
            if (data.id > 0) {
                getRecurringTask()
            }
        },
        onError: (error: any) => {
            console.error('createEngineUsage error', error)
        },
    })

    const [updateEngineUsage] = useMutation(UpdateEngine_Usage, {
        onCompleted: (response: any) => {
            const data = response.updateEngine_Usage
            if (data.id > 0) {
                getRecurringTask()
            }
        },
        onError: (error: any) => {
            console.error('updateEngineUsage error', error)
        },
    })

    const getRecurringTask = async () => {
        await queryRecurringTask({
            variables: {
                id: +recurringTasks.id,
            },
        })
    }

    const [queryRecurringTask] = useLazyQuery(GET_RECURRING_TASK, {
        onCompleted: (response: any) => {
            const data = response.readOneMaintenanceSchedule
            if (data) {
                setRecurringTasks(data)
            }
        },
        onError: (error: any) => {
            console.error('queryRecurringTask error', error)
        },
    })

    const handleEngineHours = (e: any, engineId: number) => {
        if (
            recurringTasks?.engineUsage?.nodes?.find(
                (engine: any) => engine.engine.id === engineId,
            )
        ) {
            updateEngineUsage({
                variables: {
                    input: {
                        id: recurringTasks?.engineUsage?.nodes?.find(
                            (engine: any) => engine.engine.id === engineId,
                        ).id,
                        lastScheduleHours: +e.target.value,
                    },
                },
            })
        } else {
            createEngineUsage({
                variables: {
                    input: {
                        engineID: engineId,
                        maintenanceScheduleID: recurringTasks.id,
                        lastScheduleHours: +e.target.value,
                    },
                },
            })
        }
    }

    const handleChangeCategpory = (value: any) => {
        if (value.value === 'NEW_CATEGORY') {
            setCreateCategoryDialog(true)
        } else {
            setCurrentTask({
                ...currentTask,
                category: value.value,
            })
        }
    }

    const handleCreateCategory = () => {
        const category = (
            document.getElementById('task-new-category') as HTMLInputElement
        ).value
        createCategory({
            variables: {
                input: {
                    name: category,
                },
            },
        })
    }

    const [createCategory] = useMutation(CREATE_MAINTENANCE_CATEGORY, {
        onCompleted: (response: any) => {
            const data = response.createMaintenanceCategory
            if (data.id > 0) {
                getCategoryList({
                    variables: {
                        clientID: +(localStorage.getItem('clientId') ?? 0),
                    },
                })
                setCreateCategoryDialog(false)
                setCurrentTask({
                    ...currentTask,
                    category: data.id,
                })
            }
        },
        onError: (error: any) => {
            console.error('createCategoryEntry error', error)
        },
    })

    const isDateDisabled = () => {
        return (
            currentTask?.occursEveryType === 'Hours' ||
            currentTask?.occursEveryType === 'Uses' ||
            maintenanceChecks?.maintenanceSchedule?.occursEveryType ===
                'Hours' ||
            maintenanceChecks?.maintenanceSchedule?.occursEveryType === 'Uses'
        )
    }

    return (
        <div className="w-full mb-20 md:mb-0">
            <div className="px-2 dark:py-2 dark:rounded-lg lg:px-4 mt-2 ">
                <div className="flex md:flex-nowrap md:flex-row gap-3 flex-col-reverse flex-wrap justify-between md:items-center items-start">
                    <Heading className="font-light md:text-3xl text-2xl">
                        <span className="font-medium">Task:</span>{' '}
                        {maintenanceChecks?.name
                            ? ' ' + maintenanceChecks.name
                            : ' Task #' + taskId}
                    </Heading>
                    {!isEmpty(completedRecurringTasks) && (
                        <div className="flex items-center">
                            {taskTab === 'task' && (
                                <SeaLogsButton
                                    text="Completed Tasks"
                                    type="text"
                                    className="hover:text-slblue-800"
                                    icon="check"
                                    color="slblue"
                                    action={() => {
                                        setTaskTab('completed')
                                    }}
                                />
                            )}
                            {taskTab === 'completed' && (
                                <SeaLogsButton
                                    text="Task Details"
                                    type="text"
                                    className="hover:text-slblue-800"
                                    icon="back_arrow"
                                    color="slblue"
                                    action={() => {
                                        setTaskTab('task')
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>
                <hr className="mb-4" />

                {taskTab === 'task' && (
                    <>
                        <div className="my-4">
                            <Label className={`${classes.label} block`}>
                                Title
                            </Label>
                            <input
                                id={`task-name`}
                                defaultValue={maintenanceChecks?.name}
                                type="text"
                                className={classes.input}
                                placeholder="Task name"
                            />
                        </div>
                        <div className="flex items-end gap-4 flex-wrap md:flex-nowrap">
                            <div className="w-full">
                                <Label className={`${classes.label} block`}>
                                    Vessel
                                </Label>
                                {vessels && maintenanceChecks ? (
                                    <Select
                                        id="task-vessel"
                                        // isClearable
                                        options={vessels.map((vessel: any) => ({
                                            value: vessel.id,
                                            label: vessel.title,
                                        }))}
                                        defaultValue={
                                            maintenanceChecks?.basicComponent
                                                ?.id > 0
                                                ? {
                                                      label: maintenanceChecks
                                                          .basicComponent.title,
                                                      value: maintenanceChecks
                                                          .basicComponent.id,
                                                  }
                                                : {
                                                      label: maintenanceChecks
                                                          .inventory.vessel
                                                          ?.title,
                                                      value: maintenanceChecks
                                                          .inventory.vessel.id,
                                                  }
                                        }
                                        menuPlacement="top"
                                        onChange={handleOnChangeVessel}
                                        placeholder="Select vessel"
                                        className={classes.selectMain}
                                        classNames={{
                                            control: () =>
                                                classes.selectControl,
                                            singleValue: () =>
                                                classes.selectSingleValue,
                                            menu: () => classes.selectMenu,
                                            option: () => classes.selectOption,
                                        }}
                                    />
                                ) : (
                                    <InputSkeleton />
                                )}
                            </div>
                            <div className="w-full">
                                <Label className={`${classes.label} block`}>
                                    Inventory
                                </Label>
                                {inventories ? (
                                    <Select
                                        id="task-inventory"
                                        options={inventories.map(
                                            (inventory: any) => ({
                                                value: inventory.id,
                                                label: inventory.item,
                                            }),
                                        )}
                                        defaultValue={inventoryDefaultValue}
                                        value={inventoryDefaultValue}
                                        menuPlacement="top"
                                        onChange={handleOnChangeInventory}
                                        placeholder="Select inventory item"
                                        className={classes.selectMain}
                                        classNames={{
                                            control: () =>
                                                classes.selectControl,
                                            singleValue: () =>
                                                classes.selectSingleValue,
                                            menu: () => classes.selectMenu,
                                            option: () => classes.selectOption,
                                        }}
                                    />
                                ) : (
                                    <InputSkeleton />
                                )}
                            </div>
                        </div>
                        <div className="my-4 w-full">
                            <Label className={`${classes.label} block`}>
                                Group to:
                            </Label>
                            {categoryList && maintenanceChecks ? (
                                <Select
                                    id="task-category"
                                    options={[
                                        {
                                            label: ' --- Add new category --- ',
                                            value: 'NEW_CATEGORY',
                                        },
                                        ...categoryList,
                                    ]}
                                    value={
                                        categoryList?.filter(
                                            (option: any) =>
                                                option.value ===
                                                currentTask.category,
                                        ).length > 0
                                            ? categoryList.filter(
                                                  (option: any) =>
                                                      option.value ===
                                                      currentTask.category,
                                              )[0]
                                            : categoryList.filter(
                                                  (option: any) =>
                                                      option.value ===
                                                      maintenanceChecks
                                                          .maintenanceCategory
                                                          .id,
                                              )[0]
                                    }
                                    placeholder="Select Category"
                                    onChange={handleChangeCategpory}
                                    className={classes.selectMain}
                                    classNames={{
                                        control: () => classes.selectControl,
                                        singleValue: () =>
                                            classes.selectSingleValue,
                                        menu: () => classes.selectMenu,
                                        option: () => classes.selectOption,
                                    }}
                                />
                            ) : (
                                <InputSkeleton />
                            )}
                        </div>
                        <div className="my-4 bg-slblue-100 rounded-lg p-4 pt-3 flex flex-col border border-slblue-200">
                            <label className="mb-1 pl-1 text-2xs font-bold uppercase dark:text-slblue-800">
                                Due date
                            </label>
                            {isDateDisabled() ? (
                                <Button
                                    className={`${isDateDisabled() ? '' : 'hidden'}`}
                                    onPress={() => {
                                        maintenanceChecks?.maintenanceSchedule
                                            ?.occursEveryType === 'Hours' &&
                                            toast.error(
                                                'This task has recurring based on engine hours and not allow the date edit',
                                            )
                                    }}>
                                    <input
                                        id="expiry-date"
                                        name="expiry-date"
                                        type="text"
                                        readOnly
                                        placeholder="Select due date"
                                        value={expiryDate ? expiryDate : ''}
                                        className={classes.input}
                                        aria-describedby="expiry-date-error"
                                        required
                                    />
                                </Button>
                            ) : (
                                <DateField
                                    dateID="expiry-date"
                                    fieldName="Select due date"
                                    date={expiryDate}
                                    handleDateChange={handleExpiryChange}
                                    hideButton={true}
                                />
                                //     <DialogTrigger>
                                //         <Button isDisabled={isDateDisabled()}>
                                //             <input
                                //                 id="expiry-date"
                                //                 name="expiry-date"
                                //                 type="text"
                                //                 readOnly
                                //                 placeholder="Select due date"
                                //                 // value={loginTime.format('DD/MM/YYYY, hh:mm A')}
                                //                 // defaultValue={expiryDate}
                                //                 value={expiryDate ? expiryDate : ''}
                                //                 className={classes.input}
                                //                 aria-describedby="expiry-date-error"
                                //                 required
                                //                 // onChange={handleLogin}
                                //             />
                                //         </Button>
                                //         <ModalOverlay
                                //             className={({
                                //                 isEntering,
                                //                 isExiting,
                                //             }) => `
                                // fixed inset-0 z-[15001] overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur
                                // ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                                // ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                                // `}>
                                //             <Modal>
                                //                 <Dialog
                                //                     role="alertdialog"
                                //                     className="outline-none relative">
                                //                     {({ close }) => (
                                //                         <LocalizationProvider
                                //                             dateAdapter={
                                //                                 AdapterDayjs
                                //                             }>
                                //                             <StaticDatePicker
                                //                                 className={`p-0 mr-4`}
                                //                                 onAccept={
                                //                                     handleExpiryChange
                                //                                 }
                                //                                 onClose={close}
                                //                             />
                                //                         </LocalizationProvider>
                                //                     )}
                                //                 </Dialog>
                                //             </Modal>
                                //         </ModalOverlay>
                                //     </DialogTrigger>
                            )}
                            {(currentTask?.occursEveryType === 'Hours' ||
                                currentTask?.occursEveryType === 'Uses') && (
                                <p className="text-xs mt-2 text-slred-800">
                                    This task has a recurring period based on
                                    the number of hours/uses
                                </p>
                            )}
                            <div className="mt-4">
                                <div className="inline-flex items-center">
                                    <label
                                        className="relative flex items-center pr-3 rounded-full cursor-pointer"
                                        htmlFor="task-recurring"
                                        data-ripple="true"
                                        data-ripple-color="dark"
                                        data-ripple-dark="true">
                                        <input
                                            type="checkbox"
                                            id="task-recurring"
                                            className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slblue-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-slblue-800 checked:bg-sllightblue-800 before:bg-slblue-300 hover:before:opacity-10"
                                            onChange={
                                                handleDisplayRecurringTasks
                                            }
                                            checked={displayRecurringTasks}
                                        />
                                        <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-1/3 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"></span>
                                        <span className="ml-3 text-sm font-medium uppercase">
                                            This task is recurring
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        {/*<div className="my-4">
                        <input
                            id={`task-name`}
                            defaultValue={maintenanceChecks?.name}
                            type="text"
                            className={classes.input}
                            placeholder="Task name"
                        />
                    </div>*/}

                        <div className="md:flex flex-nowrap md:justify-between flex-column sm:flex-row items-between sm:items-center pb-6 w-full">
                            <div className={classes.tabsHolder}>
                                <ul className={classes.tabsUl}>
                                    <li className={classes.tabsUlLi}>
                                        <Button
                                            className={`${tab === 'Details' ? tabClasses.active : tabClasses.inactive}`}
                                            onPress={
                                                tab === 'Details'
                                                    ? changeTab('')
                                                    : changeTab('Details')
                                            }>
                                            Details
                                        </Button>
                                    </li>
                                    <li className={classes.tabsUlLi}>
                                        <Button
                                            className={`${tab === 'Sub-tasks' ? tabClasses.active : tabClasses.inactive}`}
                                            onPress={
                                                tab === 'Sub-tasks'
                                                    ? changeTab('')
                                                    : changeTab('Sub-tasks')
                                            }>
                                            Sub-tasks
                                        </Button>
                                    </li>
                                    <li className={classes.tabsUlLi}>
                                        <Button
                                            className={`${tab === 'Links-docs' ? tabClasses.active : tabClasses.inactive}`}
                                            onPress={
                                                tab === 'Links-docs'
                                                    ? changeTab('')
                                                    : changeTab('Links-docs')
                                            }>
                                            Links & docs
                                        </Button>
                                    </li>
                                    {displayRecurringTasks && (
                                        <li className={classes.tabsUlLi}>
                                            <Button
                                                className={`${tab === 'Recurring schedule' ? tabClasses.active : tabClasses.inactive}`}
                                                onPress={
                                                    tab === 'Recurring schedule'
                                                        ? changeTab('')
                                                        : changeTab(
                                                              'Recurring schedule',
                                                          )
                                                }>
                                                Recurring schedule
                                            </Button>
                                        </li>
                                    )}
                                    <li className={classes.tabsUlLi}>
                                        <Button
                                            className={`${tab === 'Task costs' ? tabClasses.active : tabClasses.inactive}`}
                                            onPress={
                                                tab === 'Task costs'
                                                    ? changeTab('')
                                                    : changeTab('Task costs')
                                            }>
                                            Task costs
                                        </Button>
                                    </li>
                                    <li className={classes.tabsUlLi}>
                                        <Button
                                            className={`${tab === 'Notes & updates' ? tabClasses.active : tabClasses.inactive}`}
                                            onPress={
                                                tab === 'Notes & updates'
                                                    ? changeTab('')
                                                    : changeTab(
                                                          'Notes & updates',
                                                      )
                                            }>
                                            Notes & updates
                                        </Button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {tab === 'Details' && (
                            <>
                                <div>
                                    <Label
                                        className={`${classes.label} block mb-1 ml-2`}>
                                        Task Description
                                    </Label>
                                    <div>
                                        {maintenanceChecks &&
                                            maintenanceChecks.id && (
                                                <Editor
                                                    id="task-description"
                                                    placeholder="Task description"
                                                    className={classes.editor}
                                                    content={content}
                                                    handleEditorChange={
                                                        handleEditorChange
                                                    }
                                                />
                                            )}
                                    </div>
                                </div>
                                <div className="my-4 flex flex-row items-center">
                                    <Label className={classes.label}>
                                        Reference
                                    </Label>
                                    <input
                                        id={`task-workorder`}
                                        defaultValue={
                                            maintenanceChecks?.workOrderNumber
                                        }
                                        type="text"
                                        className={classes.input}
                                        placeholder="Work order/Reference"
                                    />
                                </div>
                                <div className="my-4 flex flex-row items-center gap-2">
                                    <Label className={classes.label}>
                                        Allocated to:
                                    </Label>
                                    {crewMembers && maintenanceChecks ? (
                                        <Select
                                            id="task-assigned"
                                            options={crewMembers?.map(
                                                (member: any) => ({
                                                    value: member.id,
                                                    label: `${member.firstName ?? ''} ${member.surname ?? ''}`,
                                                }),
                                            )}
                                            defaultValue={
                                                maintenanceChecks?.assignedTo
                                                    ? {
                                                          label: `${maintenanceChecks.assignedTo.firstName ?? ''} ${maintenanceChecks.assignedTo.surname ?? ''}`,
                                                          value: maintenanceChecks
                                                              .assignedTo.id,
                                                      }
                                                    : ''
                                            }
                                            onChange={(value: any) =>
                                                setCurrentTask({
                                                    ...currentTask,
                                                    assignees: value.value,
                                                })
                                            }
                                            menuPlacement="top"
                                            placeholder="Select team"
                                            className={classes.selectMain}
                                            classNames={{
                                                control: () =>
                                                    classes.selectControl,
                                                singleValue: () =>
                                                    classes.selectSingleValue,
                                                menu: () => classes.selectMenu,
                                                option: () =>
                                                    classes.selectOption,
                                                dropdownIndicator: () =>
                                                    classes.selectDropdownIndicator,
                                                indicatorSeparator: () =>
                                                    classes.selectIndicatorSeparator,
                                                multiValue: () =>
                                                    classes.selectMultiValue,
                                                clearIndicator: () =>
                                                    classes.selectClearIndicator,
                                                valueContainer: () =>
                                                    classes.selectValueContainer,
                                            }}
                                        />
                                    ) : (
                                        <InputSkeleton />
                                    )}
                                </div>
                                <p className="text-2xs font-inter -mt-3">
                                    <span className="w-40 inline-block">
                                        &nbsp;
                                    </span>
                                    An email will be sent to the allocated team
                                    with order reference (if any) and details of
                                    this task.
                                </p>

                                <div className="my-4 flex flex-row items-center">
                                    <Label className={classes.label}>
                                        Priority
                                    </Label>
                                    {inventories && maintenanceChecks ? (
                                        <Select
                                            id="task-priority"
                                            options={priorityOptions}
                                            defaultValue={
                                                priorityOptions
                                                    .filter(
                                                        (option: any) =>
                                                            option.value ===
                                                            maintenanceChecks.severity,
                                                    )
                                                    .map((option: any) => ({
                                                        value: option.value,
                                                        label: option.label,
                                                    }))[0]
                                            }
                                            placeholder="Select priority"
                                            styles={colourStyles}
                                            onChange={(value: any) =>
                                                setCurrentTask({
                                                    ...currentTask,
                                                    severity: value.value,
                                                })
                                            }
                                            className={classes.selectMain}
                                            classNames={{
                                                control: () =>
                                                    classes.selectControl,
                                                singleValue: () =>
                                                    classes.selectSingleValue,
                                                menu: () => classes.selectMenu,
                                                option: () =>
                                                    classes.selectOption,
                                            }}
                                        />
                                    ) : (
                                        <InputSkeleton />
                                    )}
                                </div>
                            </>
                        )}
                        {tab === 'Sub-tasks' && (
                            <>
                                {subTasks.length > 0 && (
                                    <>
                                        <div className="flex items-center">
                                            <span className="mr-2">
                                                {subtaskProgress}%
                                            </span>
                                            <div className="w-full grow bg-slorange-300 rounded-md h-3.5">
                                                <div
                                                    className={`bg-slorange-1000 duration-700 h-3.5 rounded-md`}
                                                    style={{
                                                        width:
                                                            subtaskProgress +
                                                            '%',
                                                    }}></div>
                                            </div>
                                        </div>
                                        <ListBox
                                            aria-label="SubTasks"
                                            className={`my-4`}>
                                            {subTasks.map((subtask: any) => (
                                                <ListBoxItem
                                                    key={`${subtask.id}-subtask`}
                                                    textValue={
                                                        subtask
                                                            .maintenanceScheduleSubTask
                                                            .task
                                                    }
                                                    className="flex items-center justify-between mb-4 border bg-white border-sllightblue-200 dark:placeholder-sllightblue-400 p-2 rounded-md ">
                                                    <label
                                                        className="relative inline-flex items-center pr-3 rounded-full cursor-pointer"
                                                        htmlFor={subtask.id}
                                                        data-ripple="true"
                                                        data-ripple-color="dark"
                                                        data-ripple-dark="true">
                                                        <input
                                                            type="checkbox"
                                                            id={subtask.id}
                                                            className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-sllightblue-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-2xl before:bg-slblue-200 before:opacity-0 before:transition-opacity checked:border-slgreen-1000 checked:bg-slneon-400 hover:before:opacity-10"
                                                            onChange={
                                                                handleUpdateSubTask
                                                            }
                                                            checked={
                                                                subtask.status ==
                                                                'Completed'
                                                                    ? true
                                                                    : false
                                                            }
                                                        />
                                                        <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-1/3 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"></span>
                                                        <span
                                                            className={`ml-3 text-sm ${subtask.status == 'Completed' ? 'line-through' : ''}`}>
                                                            {
                                                                subtask
                                                                    .maintenanceScheduleSubTask
                                                                    .task
                                                            }{' '}
                                                            {inventories?.filter(
                                                                (i: any) =>
                                                                    i.id ===
                                                                    subtask
                                                                        .maintenanceScheduleSubTask
                                                                        .inventoryID,
                                                            ).length > 0
                                                                ? ' - ' +
                                                                  inventories
                                                                      ?.filter(
                                                                          (
                                                                              i: any,
                                                                          ) =>
                                                                              i.id ===
                                                                              subtask
                                                                                  .maintenanceScheduleSubTask
                                                                                  .inventoryID,
                                                                      )
                                                                      .map(
                                                                          (
                                                                              i: any,
                                                                          ) =>
                                                                              i.item,
                                                                      )
                                                                : ''}
                                                        </span>
                                                        {subtask.findings && (
                                                            <DialogTrigger>
                                                                <Button
                                                                    className="text-base outline-none px-1"
                                                                    onPress={() =>
                                                                        setDisplayUpdateFindings(
                                                                            subtask.id,
                                                                        )
                                                                    }>
                                                                    <SeaLogsButton
                                                                        icon="alert"
                                                                        className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                    />
                                                                </Button>
                                                                <Popover
                                                                    isOpen={
                                                                        displayUpdateFindings ===
                                                                        subtask.id
                                                                    }
                                                                    onOpenChange={
                                                                        setDisplayUpdateFindings
                                                                    }>
                                                                    <PopoverWrapper>
                                                                        <Button
                                                                            className="text-base outline-none px-1"
                                                                            onPress={(
                                                                                e,
                                                                            ) =>
                                                                                handleSetDisplayAddFindings(
                                                                                    subtask.id,
                                                                                    e,
                                                                                )
                                                                            }>
                                                                            {
                                                                                subtask.findings
                                                                            }
                                                                        </Button>
                                                                    </PopoverWrapper>
                                                                </Popover>
                                                            </DialogTrigger>
                                                        )}
                                                    </label>
                                                    <div>
                                                        {subtask?.completedBy
                                                            ?.firstName
                                                            ? subtask
                                                                  ?.completedBy
                                                                  ?.firstName +
                                                              ' ' +
                                                              subtask
                                                                  ?.completedBy
                                                                  ?.surname +
                                                              ' '
                                                            : ''}
                                                        {subtask?.dateCompleted
                                                            ? formatDate(
                                                                  subtask?.dateCompleted,
                                                              )
                                                            : ''}
                                                    </div>
                                                </ListBoxItem>
                                            ))}
                                        </ListBox>
                                    </>
                                )}
                                <div className="my-4 flex justify-end">
                                    <div>
                                        <SeaLogsButton
                                            text="Add Sub-task"
                                            type="button"
                                            className="font-semibold text-slorange-1000 bg-slorange-300 border px-4 py-3 border-transparent rounded-md shadow-sm ring-1 ring-inset ring-slorange-1000 hover:ring-sldarkblue-1000 hover:bg-sldarkblue-1000 hover:text-white "
                                            action={() => {
                                                setOpenSubTaskDialog(true)
                                                setSubtaskContent('')
                                            }}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        {tab === 'Links-docs' && (
                            <>
                                <div>
                                    <Label
                                        className={`${classes.label} block mb-1 ml-2`}>
                                        Links
                                    </Label>
                                    {vessels && (
                                        <input
                                            id="task-title"
                                            type="text"
                                            className={classes.input}
                                            placeholder="Type a link and press Enter"
                                            onKeyDown={async (
                                                event: React.KeyboardEvent<HTMLInputElement>,
                                            ) => {
                                                if (event.key === 'Enter') {
                                                    const inputValue = (
                                                        event.target as HTMLInputElement
                                                    ).value
                                                    await createSeaLogsFileLinks(
                                                        {
                                                            variables: {
                                                                input: {
                                                                    link: inputValue,
                                                                },
                                                            },
                                                        },
                                                    )
                                                    ;(
                                                        event.target as HTMLInputElement
                                                    ).value = '' // Clear input value
                                                }
                                            }}
                                        />
                                    )}
                                    <div className="my-4 flex">
                                        {linkSelectedOption
                                            ? linkSelectedOption.map(
                                                  (link: any) => (
                                                      <div key={link.value}>
                                                          {linkItem(link)}
                                                      </div>
                                                  ),
                                              )
                                            : fileLinks.map((link: any) => (
                                                  <div key={link.value}>
                                                      {linkItem(link)}
                                                  </div>
                                              ))}
                                    </div>
                                </div>
                                <hr className="my-4 w-full" />
                                <div>
                                    <Label
                                        className={`${classes.label} block mb-1`}>
                                        Documents
                                    </Label>
                                    <FileUpload
                                        setDocuments={setDocuments}
                                        text=""
                                        subText="Drag files here or upload"
                                        documents={documents}
                                    />
                                    <div className="my-4">
                                        {documents.length > 0 && (
                                            <ListBox
                                                aria-label="Documents"
                                                className={``}>
                                                {documents.map(
                                                    (document: any) => (
                                                        <ListBoxItem
                                                            key={document.id}
                                                            textValue={
                                                                document.name
                                                            }
                                                            className="flex items-center gap-8 justify-between p-2.5 bg-slblue-50 rounded-lg border border-slblue-300 dark:bg-slblue-800 dark:border-slblue-600 dark:placeholder-slblue-400 dark:text-white mb-4 hover:bg-slblue-1000 hover-text-white">
                                                            <FileItem
                                                                document={
                                                                    document
                                                                }
                                                            />
                                                            <Button
                                                                className="flex gap-2 items-center"
                                                                onPress={() =>
                                                                    deleteFile(
                                                                        document.id,
                                                                    )
                                                                }>
                                                                <XCircleIcon className="w-5 h-5 text-slred-1000 bg-slred-100 rounded-full cursor-pointer" />
                                                            </Button>
                                                        </ListBoxItem>
                                                    ),
                                                )}
                                            </ListBox>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                        {displayRecurringTasks && (
                            <>
                                {!edit_recurring_task ? (
                                    <Loading errorMessage="Oops! You do not have the permission to view this section." />
                                ) : (
                                    <>
                                        {tab === 'Recurring schedule' && (
                                            <>
                                                <Label
                                                    className={`${classes.label} block mb-1 font-semibold`}>
                                                    Schedule details
                                                </Label>
                                                {/*<div className="my-4">
                                                    <input
                                                        id="task-title"
                                                        type="text"
                                                        defaultValue={
                                                            recurringTasks
                                                                ? recurringTasks.title
                                                                : ''
                                                        }
                                                        className={classes.input}
                                                        placeholder="Title"
                                                    />
                                                </div>*/}
                                                <div className="flex w-full gap-4 flex-wrap md:flex-nowrap">
                                                    <div className="flex flex-col w-full">
                                                        <Label
                                                            className={`${classes.label} block`}>
                                                            Occurs every
                                                        </Label>
                                                        <input
                                                            id="task-frequency"
                                                            defaultValue={
                                                                recurringTasks
                                                                    ? recurringTasks.occursEvery
                                                                    : '1'
                                                            }
                                                            type="number"
                                                            className={
                                                                classes.input
                                                            }
                                                            placeholder="Schedule every"
                                                            min={1}
                                                            onChange={(e) => {
                                                                setCurrentMaintenanceCheck(
                                                                    {
                                                                        ...currentMaintenanceCheck,
                                                                        maintenanceSchedule:
                                                                            {
                                                                                ...currentMaintenanceCheck.maintenanceSchedule,
                                                                                occursEvery:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                    },
                                                                )
                                                                updateDueDate()
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col w-full">
                                                        <Label
                                                            className={`${classes.label} block`}>
                                                            Occurrence type
                                                        </Label>
                                                        <Select
                                                            id="task-recurring-type"
                                                            options={
                                                                recurringType
                                                            }
                                                            value={
                                                                currentTask?.occursEveryType
                                                                    ? recurringType
                                                                          .filter(
                                                                              (
                                                                                  option: any,
                                                                              ) =>
                                                                                  option.value ===
                                                                                  currentTask.occursEveryType,
                                                                          )
                                                                          .map(
                                                                              (
                                                                                  option: any,
                                                                              ) => ({
                                                                                  value: option.value,
                                                                                  label: option.label,
                                                                              }),
                                                                          )[0]
                                                                    : recurringType
                                                                          .filter(
                                                                              (
                                                                                  option: any,
                                                                              ) =>
                                                                                  option.value ===
                                                                                  recurringTasks.occursEveryType,
                                                                          )
                                                                          .map(
                                                                              (
                                                                                  option: any,
                                                                              ) => ({
                                                                                  value: option.value,
                                                                                  label: option.label,
                                                                              }),
                                                                          )[0]
                                                            }
                                                            placeholder="Select type"
                                                            onChange={(
                                                                value: any,
                                                            ) => {
                                                                setCurrentMaintenanceCheck(
                                                                    {
                                                                        ...currentMaintenanceCheck,
                                                                        maintenanceSchedule:
                                                                            {
                                                                                ...currentMaintenanceCheck.maintenanceSchedule,
                                                                                occursEveryType:
                                                                                    value.value,
                                                                            },
                                                                    },
                                                                )
                                                                handleSetOccursEveryType(
                                                                    value.value,
                                                                )
                                                            }}
                                                            className={
                                                                classes.selectMain
                                                            }
                                                            classNames={{
                                                                control: () =>
                                                                    classes.selectControl,
                                                                singleValue:
                                                                    () =>
                                                                        classes.selectSingleValue,
                                                                menu: () =>
                                                                    classes.selectMenu,
                                                                option: () =>
                                                                    classes.selectOption,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {taskIsDateType() && (
                                                    <div className="my-4">
                                                        <div className="flex w-full gap-4 items-center">
                                                            <Label
                                                                className={`${classes.label} !w-48`}>
                                                                Last completed
                                                                date
                                                            </Label>
                                                            <div className="w-full">
                                                                <DateField
                                                                    dateID="last-schedule-date"
                                                                    fieldName="Enter last schedule date"
                                                                    date={
                                                                        startDate
                                                                            ? startDate
                                                                            : lastScheduleDate()
                                                                    }
                                                                    handleDateChange={
                                                                        handleStartDateChange
                                                                    }
                                                                    hideButton={
                                                                        true
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {taskIsEngineHourType() && (
                                                    <>
                                                        {engineList.length >
                                                            0 &&
                                                            engineList.map(
                                                                (
                                                                    engine: any,
                                                                ) => (
                                                                    <div className="my-4">
                                                                        <div className="flex w-full gap-4 items-center">
                                                                            <div className="text-sm w-1/2 font-normal">
                                                                                <div>
                                                                                    <label
                                                                                        className="relative flex items-center pr-3 rounded-full cursor-pointer"
                                                                                        htmlFor={`check_engine-${engine.id}`}
                                                                                        data-ripple="true"
                                                                                        data-ripple-color="dark"
                                                                                        data-ripple-dark="true">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            id={`check_engine-${engine.id}`}
                                                                                            className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slblue-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-slblue-800 checked:bg-sllightblue-1000 before:bg-slblue-300 hover:before:opacity-10"
                                                                                            onChange={(
                                                                                                e,
                                                                                            ) =>
                                                                                                handleCheckEngineCheck(
                                                                                                    e,
                                                                                                    engine.id,
                                                                                                )
                                                                                            }
                                                                                            checked={
                                                                                                displayCheckEngineCheck[
                                                                                                    engine
                                                                                                        .id
                                                                                                ]
                                                                                                    ? displayCheckEngineCheck[
                                                                                                          engine
                                                                                                              .id
                                                                                                      ]
                                                                                                    : recurringTasks?.engineUsage?.nodes?.find(
                                                                                                          (
                                                                                                              engineUsage: any,
                                                                                                          ) =>
                                                                                                              engineUsage
                                                                                                                  .engine
                                                                                                                  .id ===
                                                                                                              engine.id,
                                                                                                      )
                                                                                                          ?.isScheduled
                                                                                            }
                                                                                        />
                                                                                        <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-1/3 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"></span>
                                                                                        <span className="ml-3 text-sm font-semibold">
                                                                                            <div>
                                                                                                {
                                                                                                    engine.title
                                                                                                }
                                                                                                {engine.type
                                                                                                    ? ' - ' +
                                                                                                      engine.type
                                                                                                    : ''}
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="font-light">
                                                                                                    Engine
                                                                                                    Hours:{' '}
                                                                                                </span>
                                                                                                {
                                                                                                    engine.currentHours
                                                                                                }
                                                                                            </div>
                                                                                        </span>
                                                                                    </label>
                                                                                </div>
                                                                            </div>
                                                                            <div className="w-full">
                                                                                <input
                                                                                    id={`check_engine_hours-${engine.id}`}
                                                                                    name="check_engine_hours"
                                                                                    type="number"
                                                                                    min={
                                                                                        0
                                                                                    }
                                                                                    placeholder="Enter last schedule hours"
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) =>
                                                                                        setEngineHours(
                                                                                            {
                                                                                                ...engineHours,
                                                                                                [engine.id]:
                                                                                                    e
                                                                                                        .target
                                                                                                        .value,
                                                                                            },
                                                                                        )
                                                                                    }
                                                                                    onBlur={(
                                                                                        e,
                                                                                    ) =>
                                                                                        handleEngineHours(
                                                                                            e,
                                                                                            engine.id,
                                                                                        )
                                                                                    }
                                                                                    value={
                                                                                        engineHours[
                                                                                            engine
                                                                                                .id
                                                                                        ]
                                                                                            ? engineHours[
                                                                                                  engine
                                                                                                      .id
                                                                                              ]
                                                                                            : recurringTasks?.engineUsage?.nodes?.find(
                                                                                                  (
                                                                                                      engineUsage: any,
                                                                                                  ) =>
                                                                                                      engineUsage
                                                                                                          .engine
                                                                                                          .id ===
                                                                                                      engine.id,
                                                                                              )
                                                                                                  ?.lastScheduleHours
                                                                                    }
                                                                                    className={
                                                                                        classes.input
                                                                                    }
                                                                                    aria-describedby="expiry-last-schedule-error"
                                                                                    required
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                    </>
                                                )}
                                                <div className="my-4">
                                                    <textarea
                                                        id="recurring-task-description"
                                                        rows={4}
                                                        defaultValue={
                                                            recurringTasks
                                                                ? recurringTasks.description
                                                                : ''
                                                        }
                                                        className={
                                                            classes.input
                                                        }
                                                        placeholder="Description and notes"
                                                    />
                                                </div>
                                                <div className="my-4">
                                                    <label
                                                        className="relative flex items-center pr-3 rounded-full cursor-pointer"
                                                        htmlFor="task-reminders"
                                                        data-ripple="true"
                                                        data-ripple-color="dark"
                                                        data-ripple-dark="true">
                                                        <input
                                                            type="checkbox"
                                                            id="task-reminders"
                                                            className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slblue-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-slblue-800 checked:bg-sllightblue-800 before:bg-slblue-300 hover:before:opacity-10"
                                                            onChange={
                                                                handleDisplayWarnings
                                                            }
                                                            checked={
                                                                displayWarnings
                                                            }
                                                        />
                                                        <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-1/3 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"></span>
                                                        <span className="ml-3 text-xs uppercase">
                                                            create your own
                                                            reminders
                                                        </span>
                                                        <span className="ml-1 text-2xs">
                                                            (Optional)
                                                        </span>
                                                    </label>
                                                </div>
                                                {displayWarnings && (
                                                    <>
                                                        <hr className="my-6" />
                                                        <div className="mt-4 flex gap-4">
                                                            <div className="w-full">
                                                                <Label
                                                                    className={`${classes.label} block !w-full`}>
                                                                    Low warning
                                                                    within
                                                                    (days)
                                                                </Label>
                                                                <input
                                                                    type="number"
                                                                    id="low-warn-within"
                                                                    className={
                                                                        classes.input
                                                                    }
                                                                    placeholder="Low warning within"
                                                                    disabled
                                                                    value={
                                                                        (currentTask.occursEveryType
                                                                            ? currentTask.occursEveryType
                                                                            : recurringTasks.occursEveryType) ===
                                                                        'Months'
                                                                            ? '14'
                                                                            : (
                                                                                    currentTask.occursEveryType
                                                                                        ? currentTask.occursEveryType
                                                                                        : recurringTasks.occursEveryType
                                                                                )
                                                                              ? '7'
                                                                              : '0'
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="w-full">
                                                                <Label
                                                                    className={`${classes.label} block !w-full`}>
                                                                    Medium
                                                                    warning
                                                                    within
                                                                    (days)
                                                                </Label>
                                                                <input
                                                                    type="number"
                                                                    id="medium-warn-within"
                                                                    className={
                                                                        classes.input
                                                                    }
                                                                    placeholder="Medium warning within"
                                                                    disabled
                                                                    value={
                                                                        (currentTask.occursEveryType
                                                                            ? currentTask.occursEveryType
                                                                            : recurringTasks.occursEveryType) ===
                                                                        'Months'
                                                                            ? '7'
                                                                            : (
                                                                                    currentTask.occursEveryType
                                                                                        ? currentTask.occursEveryType
                                                                                        : recurringTasks.occursEveryType
                                                                                )
                                                                              ? '3'
                                                                              : '0'
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="w-full">
                                                                <Label
                                                                    className={`${classes.label} block !w-full`}>
                                                                    High warning
                                                                    within
                                                                    (days)
                                                                </Label>
                                                                <input
                                                                    type="number"
                                                                    id="high-warn-within"
                                                                    className={
                                                                        classes.input
                                                                    }
                                                                    placeholder="High warning within"
                                                                    disabled
                                                                    value={
                                                                        (currentTask.occursEveryType
                                                                            ? currentTask.occursEveryType
                                                                            : recurringTasks.occursEveryType) ===
                                                                        'Months'
                                                                            ? '3'
                                                                            : (
                                                                                    currentTask.occursEveryType
                                                                                        ? currentTask.occursEveryType
                                                                                        : recurringTasks.occursEveryType
                                                                                )
                                                                              ? '1'
                                                                              : '0'
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {tab === 'Task costs' && (
                            <>
                                <p className="text-xs font-inter max-w-[40rem] leading-loose">
                                    Track the expected and actual costs of
                                    repairs and maintenance in SeaLogs reports
                                    module.
                                </p>
                                <div className="my-4 flex items-center">
                                    <Label className={classes.label}>
                                        Projected costs
                                    </Label>
                                    <input
                                        id={`task-projected`}
                                        defaultValue={
                                            maintenanceChecks?.projected
                                        }
                                        type="number"
                                        className={classes.input}
                                        placeholder="Projected"
                                        onChange={updateCostsDifference}
                                    />
                                </div>
                                <div className="my-4 flex items-center">
                                    <Label className={classes.label}>
                                        Actual costs
                                    </Label>
                                    <input
                                        id={`task-actual`}
                                        defaultValue={maintenanceChecks?.actual}
                                        type="number"
                                        className={classes.input}
                                        placeholder="Actual"
                                        onChange={updateCostsDifference}
                                    />
                                </div>
                                <div className="my-4 flex items-center">
                                    <Label className={classes.label}>
                                        Difference
                                    </Label>
                                    <div
                                        id="task-difference"
                                        className="w-full p-2 text-sm border-t border-slblue-700 border-dashed">
                                        {costsDifference}
                                    </div>
                                </div>
                            </>
                        )}
                        {tab === 'Notes & updates' && (
                            <>
                                <div>
                                    {taskRecords.length > 0 && (
                                        <ListBox aria-label="Task Records">
                                            {taskRecords.map((record: any) => (
                                                <ListBoxItem
                                                    key={`${record.id}-record`}
                                                    textValue={
                                                        record.description
                                                    }
                                                    className="border border-slblue-100 bg-white rounded-md flex items-start justify-between mb-4 p-4 dark:placeholder-slblue-400">
                                                    <label
                                                        className="relative inline-flex items-center pr-3 rounded-full cursor-pointer"
                                                        htmlFor={record.id}
                                                        data-ripple="true"
                                                        data-ripple-color="dark"
                                                        data-ripple-dark="true">
                                                        <div className="flex-grow overflow-scroll ql-container">
                                                            <div className="ql-editor !px-0">
                                                                <div
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: record.description,
                                                                    }}></div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    <div className="flex gap-2 mt-5">
                                                        <SeaLogsButton
                                                            icon="pencil"
                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                            action={() => {
                                                                setReviewContent(
                                                                    record.description,
                                                                )
                                                                setCommentData(
                                                                    record,
                                                                )
                                                                setOpenRecordsDialog(
                                                                    true,
                                                                )
                                                                setCommentTime(
                                                                    record.time,
                                                                )
                                                            }}
                                                        />
                                                        <SeaLogsButton
                                                            icon="trash"
                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                            action={() => {
                                                                setDeleteRecordID(
                                                                    record.id,
                                                                )
                                                                setOpenDeleteRecordDialog(
                                                                    true,
                                                                )
                                                            }}
                                                        />
                                                    </div>
                                                </ListBoxItem>
                                            ))}
                                        </ListBox>
                                    )}
                                </div>
                                <div className="mt-2 flex justify-end">
                                    <SeaLogsButton
                                        text="Add note / update"
                                        type="button"
                                        className="font-semibold text-slorange-1000 bg-slorange-300 border px-4 py-3 border-transparent rounded-md shadow-sm ring-1 ring-inset ring-slorange-1000 hover:ring-sldarkblue-1000 hover:bg-sldarkblue-1000 hover:text-white "
                                        action={() => {
                                            setReviewContent('')
                                            setCommentData(false)
                                            setOpenRecordsDialog(true)
                                            setCommentTime(false)
                                        }}
                                    />
                                </div>
                            </>
                        )}
                        <hr className="my-4" />
                        <div className="my-4 pb-32 flex flex-row items-center">
                            <div className="bg-slblue-100 w-80 rounded-lg p-4 pt-3 border border-slblue-200">
                                <Label className={`${classes.label}`}>
                                    <span className="font-bold">
                                        Task status
                                    </span>
                                </Label>
                                <div className="flex flex-row w-full">
                                    {inventories && maintenanceChecks ? (
                                        <Select
                                            id="task-status"
                                            options={statusOptions}
                                            defaultValue={
                                                statusOptions
                                                    .filter(
                                                        (option: any) =>
                                                            option.value ===
                                                            maintenanceChecks.status.replaceAll(
                                                                '_',
                                                                ' ',
                                                            ),
                                                    )
                                                    .map((option: any) => ({
                                                        value: option.value,
                                                        label: option.label,
                                                    }))[0]
                                            }
                                            placeholder="Select status"
                                            onChange={(value: any) => {
                                                if (
                                                    !complete_task &&
                                                    value.value === 'Completed'
                                                ) {
                                                    toast.error(
                                                        'You do not have the permission to complete this task.',
                                                    )
                                                    return
                                                }
                                                setCurrentTask({
                                                    ...currentTask,
                                                    status: value.value.replaceAll(
                                                        '_',
                                                        ' ',
                                                    ),
                                                })
                                            }}
                                            className={classes.selectMain}
                                            classNames={{
                                                control: () =>
                                                    classes.selectControl,
                                                singleValue: () =>
                                                    classes.selectSingleValue,
                                                menu: () => classes.selectMenu,
                                                option: () =>
                                                    classes.selectOption,
                                            }}
                                        />
                                    ) : (
                                        <InputSkeleton />
                                    )}
                                </div>
                            </div>
                            {currentTask?.status === 'Completed' && (
                                <div className="w-80 rounded-lg p-4 pt-3 flex flex-col">
                                    <Label className={`${classes.label} block`}>
                                        Completion date
                                    </Label>
                                    <DateField
                                        dateID="completion-date"
                                        fieldName="Enter completion date"
                                        date={completionDate}
                                        handleDateChange={
                                            handleCompletionChange
                                        }
                                        hideButton={true}
                                    />
                                </div>
                            )}
                            {currentTask?.status === 'Completed' && (
                                <>
                                    {crewMembers && maintenanceChecks ? (
                                        <div className="w-80 rounded-lg p-4 pt-3 flex flex-col">
                                            <Label
                                                className={`${classes.label} block`}>
                                                Completed by
                                            </Label>
                                            <Select
                                                id="task-completed-by"
                                                options={crewMembers?.map(
                                                    (member: any) => ({
                                                        value: member.id,
                                                        label: `${member.firstName ?? ''} ${member.surname ?? ''}`,
                                                    }),
                                                )}
                                                defaultValue={
                                                    maintenanceChecks?.completedBy
                                                        ? {
                                                              label: `${maintenanceChecks.completedBy.firstName ?? ''} ${maintenanceChecks.completedBy.surname ?? ''}`,
                                                              value: maintenanceChecks
                                                                  .completedBy
                                                                  .id,
                                                          }
                                                        : ''
                                                }
                                                onChange={(value: any) =>
                                                    (currentTask.completedBy =
                                                        value.value)
                                                }
                                                menuPlacement="top"
                                                placeholder="Select team"
                                                className={classes.selectMain}
                                                classNames={{
                                                    control: () =>
                                                        classes.selectControl,
                                                    singleValue: () =>
                                                        classes.selectSingleValue,
                                                    menu: () =>
                                                        classes.selectMenu,
                                                    option: () =>
                                                        classes.selectOption,
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <InputSkeleton />
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}

                {/*<div className="my-4">
                    <Label className={`${classes.label} block`}>
                        Signature
                    </Label>
                    
                    <div className="w-full md:w-96">
                        <SignaturePad
                            signature={signature}
                            onSignatureChanged={onSignatureChanged}
                        />
                    </div>
                    
                </div>*/}

                {taskTab === 'completed' && (
                    <>
                        <TableWrapper
                            headings={[' ', 'Assigned To', 'Due date']}>
                            {completedRecurringTasks.map(
                                (maintenanceCheck: any) => (
                                    <tr
                                        key={maintenanceCheck.id}
                                        className={` ${maintenanceCheck.id} group border-b dark:border-slblue-400 hover:bg-white dark:hover:bg-slblue-600`}>
                                        <td className="px-2 py-3 lg:px-6 min-w-1/2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-light text-foreground flex items-center">
                                                    <Link
                                                        href={`/maintenance?taskID=${maintenanceCheck.id}&redirect_to=${pathname}?${searchParams.toString()}`}
                                                        className="group-hover:text-sllightblue-800 focus:outline-none">
                                                        {maintenanceCheck.name}
                                                    </Link>
                                                    <div
                                                        className={`inline-block rounded px-3 py-1 ml-3 text-xs ${maintenanceCheck?.isOverDue?.status === 'High' ? 'text-slred-800 bg-slred-100' : ''} ${maintenanceCheck?.isOverDue?.status === 'Low' || maintenanceCheck?.isOverDue?.status === 'Upcoming' || maintenanceCheck?.isOverDue?.status === 'Completed' ? 'text-slgreen-1000 bg-slneon-100' : ''} ${maintenanceCheck?.isOverDue?.status === 'Medium' || maintenanceCheck?.isOverDue?.days === 'Save As Draft' ? 'text-yellow-600 bg-yellow-100' : ''} `}>
                                                        {maintenanceCheck
                                                            ?.isOverDue
                                                            ?.status &&
                                                            [
                                                                'High',
                                                                'Medium',
                                                                'Low',
                                                            ].includes(
                                                                maintenanceCheck
                                                                    .isOverDue
                                                                    .status,
                                                            ) &&
                                                            maintenanceCheck
                                                                ?.isOverDue
                                                                ?.days}
                                                        {maintenanceCheck
                                                            ?.isOverDue
                                                            ?.status ===
                                                            'Completed' &&
                                                            maintenanceCheck
                                                                ?.isOverDue
                                                                ?.days ===
                                                                'Save As Draft' &&
                                                            maintenanceCheck
                                                                ?.isOverDue
                                                                ?.days}
                                                        {maintenanceCheck
                                                            ?.isOverDue
                                                            ?.status ===
                                                            'Upcoming' &&
                                                            maintenanceCheck
                                                                ?.isOverDue
                                                                ?.days}
                                                        {maintenanceCheck
                                                            ?.isOverDue
                                                            ?.status ===
                                                            'Completed' &&
                                                            isEmpty(
                                                                maintenanceCheck
                                                                    ?.isOverDue
                                                                    ?.days,
                                                            ) &&
                                                            maintenanceCheck
                                                                ?.isOverDue
                                                                ?.status}
                                                        {maintenanceCheck
                                                            ?.isOverDue
                                                            ?.status ===
                                                            'Completed' &&
                                                            !isEmpty(
                                                                maintenanceCheck
                                                                    ?.isOverDue
                                                                    ?.days,
                                                            ) &&
                                                            maintenanceCheck
                                                                ?.isOverDue
                                                                ?.days !==
                                                                'Save As Draft' &&
                                                            maintenanceCheck
                                                                ?.isOverDue
                                                                ?.days}
                                                        {/* {maintenanceCheck?.isOverDue?.status !==
                                        'Completed' &&
                                        maintenanceCheck?.isOverDue?.status !==
                                            'Upcoming' &&
                                        maintenanceCheck?.isOverDue?.days} */}
                                                    </div>
                                                </span>
                                                <div className="flex">
                                                    {maintenanceCheck.basicComponentID !==
                                                        null &&
                                                        vessels
                                                            ?.filter(
                                                                (vessel: any) =>
                                                                    vessel?.id ==
                                                                    maintenanceCheck.basicComponentID,
                                                            )
                                                            .map(
                                                                (
                                                                    vessel: any,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            vessel.id
                                                                        }
                                                                        className="inline-block rounded px-3 py-1 ml-3 font-semibold bg-slblue-10">
                                                                        <span>
                                                                            {
                                                                                vessel.title
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                ),
                                                            )}
                                                    <div className="w-14 flex items-center pl-1">
                                                        {maintenanceCheck.comments !==
                                                            null && (
                                                            <DialogTrigger>
                                                                <Button className="text-base outline-none px-1">
                                                                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-slgreen-1000" />
                                                                </Button>
                                                                <Popover>
                                                                    <PopoverWrapper>
                                                                        {
                                                                            maintenanceCheck.comments
                                                                        }
                                                                    </PopoverWrapper>
                                                                </Popover>
                                                            </DialogTrigger>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                {maintenanceCheck.description}
                                            </div>
                                            <div></div>
                                        </td>
                                        <td className="px-2 py-3 dark:text-white">
                                            {crewInfo &&
                                                crewInfo
                                                    .filter(
                                                        (crew: any) =>
                                                            crew.id ===
                                                            maintenanceCheck.assignedToID,
                                                    )
                                                    .map(
                                                        (
                                                            crew: any,
                                                            index: number,
                                                        ) => {
                                                            return (
                                                                <Link
                                                                    key={index}
                                                                    href={`/crew/info?id=${crew.id}`}
                                                                    className="focus:outline-none group-hover:text-slblue-800">
                                                                    {
                                                                        crew.firstName
                                                                    }{' '}
                                                                    {
                                                                        crew.surname
                                                                    }
                                                                </Link>
                                                            )
                                                        },
                                                    )}
                                        </td>
                                        <td className="px-2 py-3 dark:text-white">
                                            {formatDate(
                                                maintenanceCheck.expires,
                                            )}
                                            <div
                                                className={`inline-block rounded px-3 py-1 ml-3 text-xs ${maintenanceCheck.status == 'Completed' ? 'bg-slneon-100 text-slgreen-1000' : 'bg-slred-100 text-slred-800'}`}>
                                                <span>
                                                    {maintenanceCheck.status.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ),
                            )}
                        </TableWrapper>
                    </>
                )}

                {inSidebar && (
                    <div className="flex justify-end">
                        <div className="flex lg:flex-row">
                            <SeaLogsButton
                                text="Cancel"
                                type="text"
                                action={() => {
                                    handleCancel()
                                }}
                            />
                            <SeaLogsButton
                                text="Delete task"
                                type="secondary"
                                icon="trash"
                                color="slred"
                                action={() => {
                                    if (!delete_task) {
                                        toast.error(
                                            'You do not have permission to delete this task',
                                        )
                                        return
                                    }
                                    if (
                                        displayRecurringTasks &&
                                        !edit_recurring_task
                                    ) {
                                        toast.error(
                                            'You do not have permission to delete this task',
                                        )
                                        return
                                    }
                                    setOpenDeleteTaskDialog(true)
                                }}
                            />
                            <SeaLogsButton
                                text="Update task"
                                type="primary"
                                icon="check"
                                color="sky"
                                action={handleUpdate}
                            />
                        </div>
                    </div>
                )}
                {!inSidebar && (
                    <FooterWrapper
                        noBorder
                        className="lg:justify-end items-center flex-col lg:flex-row">
                        <div className="flex lg:flex-row hidden md:block">
                            <SeaLogsButton
                                text="Cancel"
                                type="text"
                                action={() => {
                                    handleCancel()
                                }}
                            />
                            <SeaLogsButton
                                text="Delete task"
                                type="secondary"
                                icon="trash"
                                color="slred"
                                action={() => {
                                    if (!delete_task) {
                                        toast.error(
                                            'You do not have permission to delete this task',
                                        )
                                        return
                                    }
                                    if (
                                        displayRecurringTasks &&
                                        !edit_recurring_task
                                    ) {
                                        toast.error(
                                            'You do not have permission to delete this task',
                                        )
                                        return
                                    }
                                    setOpenDeleteTaskDialog(true)
                                }}
                            />
                            <SeaLogsButton
                                text="Update task"
                                type="primary"
                                icon="check"
                                color="sky"
                                action={handleUpdate}
                            />
                        </div>
                        <div className="flex lg:flex-row block md:hidden">
                            <SeaLogsButton
                                text="Cancel"
                                type="text"
                                action={() => {
                                    handleCancel()
                                }}
                            />
                            <SeaLogsButton
                                text="Delete"
                                type="secondary"
                                icon="trash"
                                color="slred"
                                action={() => {
                                    if (!delete_task) {
                                        toast.error(
                                            'You do not have permission to delete this task',
                                        )
                                        return
                                    }
                                    if (
                                        displayRecurringTasks &&
                                        !edit_recurring_task
                                    ) {
                                        toast.error(
                                            'You do not have permission to delete this task',
                                        )
                                        return
                                    }
                                    setOpenDeleteTaskDialog(true)
                                }}
                            />
                            <SeaLogsButton
                                text="Update"
                                type="primary"
                                icon="check"
                                color="sky"
                                action={handleUpdate}
                            />
                        </div>
                    </FooterWrapper>
                )}
                <AlertDialog
                    openDialog={openSubTaskDialog}
                    setOpenDialog={setOpenSubTaskDialog}
                    handleCreate={handleCreateSubTask}
                    actionText="Create SubTask">
                    <div className="bg-slblue-1000 -m-6 rounded-t-lg">
                        <Heading
                            slot="title"
                            className="text-xl text-white font-medium p-6">
                            Create new sub-task
                        </Heading>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 items-start mt-6">
                        <div className="mb-4 md:mb-0">
                            <div className="my-4 flex items-center">
                                <input
                                    id={`subtask-name`}
                                    type="text"
                                    className={classes.input}
                                    placeholder="Sub-task"
                                />
                            </div>
                            <div className="my-4">
                                {inventories ? (
                                    <>
                                        <Label
                                            htmlFor="subtask-inventory"
                                            className="text-2xs uppercase w-full dark:text-slblue-800">
                                            Optional inventory item
                                        </Label>
                                        <Select
                                            id="subtask-inventory"
                                            options={inventories
                                                ?.filter(
                                                    (i: any) =>
                                                        i.vesselID ===
                                                            maintenanceChecks
                                                                ?.basicComponent
                                                                ?.id ||
                                                        i.vesselID ===
                                                            currentTask?.basicComponentID,
                                                )
                                                ?.map((inventory: any) => ({
                                                    value: inventory.id,
                                                    label: inventory.item,
                                                }))}
                                            menuPlacement="top"
                                            onChange={
                                                handleSubtaskOnChangeInventory
                                            }
                                            placeholder="Select inventory item"
                                            className={classes.selectMain}
                                            classNames={{
                                                control: () =>
                                                    classes.selectControl,
                                                singleValue: () =>
                                                    classes.selectSingleValue,
                                                menu: () => classes.selectMenu,
                                                option: () =>
                                                    classes.selectOption,
                                            }}
                                        />
                                    </>
                                ) : (
                                    <InputSkeleton />
                                )}
                            </div>
                        </div>
                        <div className="mb-2 md:mt-4 flex items-center">
                            <Editor
                                id="comment"
                                placeholder="Comment"
                                className={classes.editor}
                                content={subtaskContent}
                                handleEditorChange={handleSubtaskEditorChange}
                            />
                        </div>
                    </div>
                </AlertDialog>
                <DialogTrigger
                    isOpen={displayUpdateSubTask}
                    onOpenChange={setDisplayUpdateSubTask}>
                    <ModalOverlay
                        className={`fixed inset-0 z-[15002] overflow-y-auto bg-black/25 max-h-5/6 flex items-center justify-center p-4 text-center backdrop-blur`}>
                        <Modal
                            className={` w-full max-w-md md:max-w-5xl max-h-5/6 overflow-hidden rounded-lg dark:bg-sldarkblue-800 text-left align-middle shadow-xl`}>
                            <Dialog
                                role="alertdialog"
                                className="outline-none relative">
                                {({ close }) => (
                                    <div
                                        className={`flex justify-center flex-col p-6 border bg-white rounded-lg border-sllightblue-200`}>
                                        <div className="bg-slblue-1000 -m-6 rounded-t-lg">
                                            <Heading className="text-xl text-white font-medium p-6">
                                                Sub-task details
                                            </Heading>
                                        </div>
                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 md:gap-4 items-start text-sldarkblue-950">
                                            <div className="mb-4 md:mb-0">
                                                <div className="my-4 flex items-center">
                                                    <input
                                                        id={`subtask-name`}
                                                        type="text"
                                                        className={
                                                            classes.input
                                                        }
                                                        defaultValue={
                                                            subTasks.filter(
                                                                (
                                                                    subtask: any,
                                                                ) =>
                                                                    subtask.id ===
                                                                    currentSubTaskCheckID,
                                                            )[0]
                                                                ?.maintenanceScheduleSubTask
                                                                .task
                                                        }
                                                        placeholder={`SubTask ${currentSubTaskCheckID}`}
                                                    />
                                                </div>
                                                <div className="my-4">
                                                    {inventories ? (
                                                        <>
                                                            <Label
                                                                htmlFor="subtask-inventory"
                                                                className={
                                                                    classes.label
                                                                }>
                                                                Inventory item
                                                                (optional)
                                                            </Label>
                                                            <Select
                                                                id="subtask-inventory"
                                                                options={inventories
                                                                    ?.filter(
                                                                        (
                                                                            i: any,
                                                                        ) =>
                                                                            i.vesselID ===
                                                                                maintenanceChecks
                                                                                    ?.basicComponent
                                                                                    ?.id ||
                                                                            i.vesselID ===
                                                                                currentTask?.basicComponentID,
                                                                    )
                                                                    ?.map(
                                                                        (
                                                                            inventory: any,
                                                                        ) => ({
                                                                            value: inventory.id,
                                                                            label: inventory.item,
                                                                        }),
                                                                    )}
                                                                menuPlacement="top"
                                                                value={
                                                                    inventories
                                                                        ?.filter(
                                                                            (
                                                                                i: any,
                                                                            ) =>
                                                                                i.id ===
                                                                                subtaskInventoryValue,
                                                                        )
                                                                        ?.map(
                                                                            (
                                                                                inventory: any,
                                                                            ) => ({
                                                                                value: inventory.id,
                                                                                label: inventory.item,
                                                                            }),
                                                                        )[0]
                                                                }
                                                                onChange={
                                                                    handleSubtaskOnChangeInventory
                                                                }
                                                                placeholder="Select inventory item"
                                                                className={
                                                                    classes.selectMain
                                                                }
                                                                classNames={{
                                                                    control:
                                                                        () =>
                                                                            classes.selectControl,
                                                                    singleValue:
                                                                        () =>
                                                                            classes.selectSingleValue,
                                                                    menu: () =>
                                                                        classes.selectMenu,
                                                                    option: () =>
                                                                        classes.selectOption,
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        <InputSkeleton />
                                                    )}
                                                </div>
                                                <div>
                                                    {taskRecords.filter(
                                                        (record: any) =>
                                                            record.subTaskID ==
                                                            currentSubTaskCheckID,
                                                    ).length > 0 && (
                                                        <ListBox
                                                            aria-label="Task Records"
                                                            className={`mb-4`}>
                                                            {taskRecords
                                                                .filter(
                                                                    (
                                                                        record: any,
                                                                    ) =>
                                                                        record.subTaskID ==
                                                                        currentSubTaskCheckID,
                                                                )
                                                                .map(
                                                                    (
                                                                        record: any,
                                                                    ) => (
                                                                        <ListBoxItem
                                                                            key={`${record.id}-record`}
                                                                            textValue={
                                                                                record.description
                                                                            }
                                                                            className="flex items-start justify-between text-sm dark:placeholder-slblue-400">
                                                                            <label
                                                                                className="relative inline-flex items-center pr-3 rounded-full cursor-pointer"
                                                                                htmlFor={
                                                                                    record.id
                                                                                }
                                                                                data-ripple="true"
                                                                                data-ripple-color="dark"
                                                                                data-ripple-dark="true">
                                                                                <div className="flex-grow overflow-scroll ql-container">
                                                                                    <div className="ql-editor !px-0">
                                                                                        <div
                                                                                            dangerouslySetInnerHTML={{
                                                                                                __html: record.description,
                                                                                            }}></div>
                                                                                    </div>
                                                                                </div>
                                                                            </label>
                                                                            <div className="flex gap-2 mt-5">
                                                                                <SeaLogsButton
                                                                                    icon="pencil"
                                                                                    className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                                    action={() => {
                                                                                        setReviewContent(
                                                                                            record.description,
                                                                                        )
                                                                                        setCommentData(
                                                                                            record,
                                                                                        )
                                                                                        setOpenRecordsDialog(
                                                                                            true,
                                                                                        )
                                                                                    }}
                                                                                />
                                                                                <SeaLogsButton
                                                                                    icon="trash"
                                                                                    className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                                    action={() => {
                                                                                        setDeleteRecordID(
                                                                                            record.id,
                                                                                        )
                                                                                        setOpenDeleteRecordDialog(
                                                                                            true,
                                                                                        )
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </ListBoxItem>
                                                                    ),
                                                                )}
                                                        </ListBox>
                                                    )}
                                                </div>
                                                <div className="mt-2">
                                                    <SeaLogsButton
                                                        text="Add Record"
                                                        type="text"
                                                        icon="plus"
                                                        action={() => {
                                                            setReviewContent('')
                                                            setCommentData(
                                                                false,
                                                            )
                                                            setOpenRecordsDialog(
                                                                true,
                                                            )
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-2 md:mt-4 flex items-center">
                                                <Editor
                                                    id="comment"
                                                    placeholder="Comment"
                                                    className={classes.editor}
                                                    content={subtaskContent}
                                                    handleEditorChange={
                                                        handleSubtaskEditorChange
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <hr className="my-6" />
                                        <div className="flex justify-between items-center">
                                            <div className="inline-flex items-center">
                                                <label
                                                    className="relative flex items-center pr-3 rounded-full cursor-pointer"
                                                    htmlFor="task-alertChange"
                                                    data-ripple="true"
                                                    data-ripple-color="dark"
                                                    data-ripple-dark="true">
                                                    <input
                                                        type="checkbox"
                                                        id="task-alertChange"
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slblue-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-slblue-800 checked:bg-sllightblue-1000 before:bg-slblue-300 hover:before:opacity-10"
                                                        checked={
                                                            alertSubTaskStatus
                                                        }
                                                        onChange={() =>
                                                            setAlertSubTaskStatus(
                                                                !alertSubTaskStatus,
                                                            )
                                                        }
                                                    />
                                                    <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-1/3 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"></span>
                                                    <span className="ml-3 text-sm font-semibold uppercase dark:text-white">
                                                        {alertSubTaskStatus
                                                            ? 'Completed'
                                                            : 'Complete'}
                                                    </span>
                                                </label>
                                            </div>
                                            <div className="flex justify-end">
                                                <SeaLogsButton
                                                    text="Cancel"
                                                    type="text"
                                                    action={close}
                                                />
                                                <SeaLogsButton
                                                    text="Delete"
                                                    color="slred"
                                                    type="secondary"
                                                    icon="trash"
                                                    action={() =>
                                                        handleUpdateSubTask(
                                                            'deleteSubTask',
                                                        )
                                                    }
                                                />
                                                <SeaLogsButton
                                                    text="Update"
                                                    color="sky"
                                                    type="primary"
                                                    icon="check"
                                                    action={() =>
                                                        handleUpdateSubTask(
                                                            'updateSubTask',
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Dialog>
                        </Modal>
                    </ModalOverlay>
                </DialogTrigger>
                <AlertDialog
                    openDialog={displayAddFindings}
                    setOpenDialog={setDisplayAddFindings}
                    handleCreate={() => handleUpdateSubTask('updateFindings')}
                    actionText="Complete SubTask">
                    <Heading
                        slot="title"
                        className="text-2xl font-light leading-6 my-2 ">
                        Add Findings
                    </Heading>
                    <div className="flex items-center mt-4">
                        <textarea
                            id={`subtask-findings`}
                            rows={4}
                            className={classes.textarea}
                            placeholder="Findings"
                            defaultValue={
                                subTasks.filter(
                                    (subtask: any) =>
                                        subtask.id === currentSubTaskCheckID,
                                )[0]?.findings
                            }
                        />
                    </div>
                    <div className="flex items-center mt-4 gap-4 w-full">
                        <div className="flex items-center w-1/2">
                            {members && (
                                <Select
                                    id="comment-author"
                                    options={members}
                                    menuPlacement="top"
                                    placeholder="Author"
                                    defaultValue={
                                        members?.find(
                                            (member: any) =>
                                                member.value == authorID,
                                        )
                                            ? members?.find(
                                                  (member: any) =>
                                                      member.value == authorID,
                                              )
                                            : null
                                    }
                                    className={classes.selectMain}
                                    onChange={(value: any) =>
                                        setAuthorID(value?.value)
                                    }
                                    classNames={{
                                        control: () =>
                                            'flex py-0.5 w-full !text-sm !text-sldarkblue-950 !bg-transparent !rounded-lg !border !border-slblue-200 focus:ring-slblue-500 focus:border-slblue-500 dark:placeholder-slblue-400 !dark:text-white !dark:focus:ring-slblue-500 !dark:focus:border-slblue-500',
                                        singleValue: () => 'dark:!text-white',
                                        menu: () => 'dark:bg-slblue-800',
                                        option: () => classes.selectOption,
                                    }}
                                />
                            )}
                        </div>
                        <div className="flex items-center w-1/2">
                            <DateTimeField
                                dateID="completed-date"
                                fieldName="Select completed date"
                                date={scheduleCompletedDate}
                                handleDateChange={
                                    handleScheduleCompletedDateChange
                                }
                                hideButton={true}
                            />
                            {/* <DialogTrigger>
                                <Button
                                    className={`w-full`}
                                    isDisabled={
                                        currentTask?.occursEveryType ===
                                            'Hours' ||
                                        currentTask?.occursEveryType === 'Uses'
                                    }>
                                    <input
                                        id="completed-date"
                                        name="completed-date"
                                        type="text"
                                        readOnly
                                        placeholder="Select completed date"
                                        value={
                                            scheduleCompletedDate
                                                ? scheduleCompletedDate
                                                : ''
                                        }
                                        className={classes.input}
                                        aria-describedby="completed-date-error"
                                        required
                                    />
                                </Button>
                                <ModalOverlay
                                    className={({ isEntering, isExiting }) => `
                                        fixed inset-0 z-[15001] overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur
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
                                                        defaultValue={dayjs()}
                                                        onAccept={
                                                            handleScheduleCompletedDateChange
                                                        }
                                                        onClose={close}
                                                    />
                                                </LocalizationProvider>
                                            )}
                                        </Dialog>
                                    </Modal>
                                </ModalOverlay>
                            </DialogTrigger> */}
                        </div>
                    </div>
                </AlertDialog>
                <AlertDialog
                    openDialog={openDeleteTaskDialog}
                    setOpenDialog={setOpenDeleteTaskDialog}
                    handleCreate={handleDeleteCheck}
                    actionText="Delete Task">
                    <Heading
                        slot="title"
                        className="text-2xl font-light leading-6 my-2">
                        Delete Task
                    </Heading>
                    <div className="my-4 flex items-center">
                        Are you sure you want to delete this task?
                    </div>
                </AlertDialog>
                <AlertDialog
                    openDialog={openRecordsDialog}
                    setOpenDialog={setOpenRecordsDialog}
                    wrapperClassName="!z-[15002]"
                    handleCreate={handleSaveRecords}
                    actionText={
                        commentData?.id > 0 ? 'Update' : 'Create Record'
                    }>
                    <Heading
                        slot="title"
                        className="text-2xl font-light leading-6 my-2">
                        {commentData?.id > 0
                            ? 'Update Record'
                            : 'Create New Record'}
                    </Heading>
                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 items-start">
                        <div className="mb-4 md:mb-0">
                            <div className="my-4 flex items-center">
                                <DateTimeField
                                    dateID="comment-time"
                                    fieldName="Time of completion"
                                    date={commentTime}
                                    handleDateChange={handleCommentTimeChange}
                                    hideButton={true}
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
                                                    member.value ==
                                                    commentData?.author?.id,
                                            )
                                                ? members?.find(
                                                      (member: any) =>
                                                          member.value ==
                                                          commentData?.author
                                                              ?.id,
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
                                                'flex py-0.5 w-full !text-sm !bg-transparent !rounded-lg !border !border-slblue-200 focus:ring-slblue-500 focus:border-slblue-500 dark:placeholder-slblue-400 !dark:text-white !dark:focus:ring-slblue-500 !dark:focus:border-slblue-500',
                                            singleValue: () =>
                                                'dark:!text-white',
                                            menu: () => 'dark:bg-slblue-800',
                                            option: () => classes.selectOption,
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="mb-2 md:mt-4 flex items-center">
                            <Editor
                                id="comment"
                                placeholder="Comment"
                                className={classes.editor}
                                content={reviewContent}
                                handleEditorChange={handleReviewEditorChange}
                            />
                        </div>
                    </div>
                </AlertDialog>
                <AlertDialog
                    openDialog={openDeleteRecordDialog}
                    setOpenDialog={setOpenDeleteRecordDialog}
                    handleCreate={handleDeleteRecord}
                    actionText="Delete Record">
                    <Heading
                        slot="title"
                        className="text-2xl font-light leading-6 my-2">
                        Delete Record
                    </Heading>
                    <div className="my-4 flex items-center">
                        Are you sure you want to delete this record?
                    </div>
                </AlertDialog>
                <AlertDialog
                    openDialog={createCategoryDialog}
                    setOpenDialog={setCreateCategoryDialog}
                    handleCreate={handleCreateCategory}
                    actionText="Create Category">
                    <Heading
                        slot="title"
                        className="text-2xl font-light leading-6 my-2">
                        Create New Category
                    </Heading>
                    <div className="my-4 flex items-center">
                        <input
                            id={`task-new-category`}
                            name={`task-new-category`}
                            type="text"
                            className={classes.input}
                            placeholder="Category"
                        />
                    </div>
                </AlertDialog>
                <Toaster position="top-right" />
            </div>
        </div>
    )
}

function SignaturePad({
    signature,
    onSignatureChanged,
}: {
    signature: any
    onSignatureChanged: (sign: String) => void
}) {
    const [signPad, setSignPad] = useState<SignaturePad | null>(null)
    const [loaded, setLoaded] = useState<boolean>(false)

    const handleSignatureChanged = (e: any) => {
        if (signPad?.toDataURL()) onSignatureChanged(signPad?.toDataURL())
    }
    const handleClear = () => {
        if (signPad) {
            signPad.clear()
        }
    }
    {
        signature?.signatureData &&
            signPad &&
            !loaded &&
            (signPad.fromDataURL(signature.signatureData, {
                width: 384,
                height: 200,
            }),
            setLoaded(true))
    }
    return (
        <div className="flex flex-col items-right gap-3">
            <SignatureCanvas
                ref={(ref: any) => {
                    setSignPad(ref)
                }}
                penColor={`blue`}
                canvasProps={{
                    width: 384,
                    height: 200,
                    className:
                        'sigCanvas border border-slblue-200 bg-white rounded-lg dark:bg-sldarkblue-200 dark:border-slblue-200',
                }}
                onEnd={handleSignatureChanged}
            />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4"></div>
                <Button
                    onPress={handleClear}
                    className="peer flex justify-between text-sm">
                    Clear
                </Button>
            </div>
        </div>
    )
}
