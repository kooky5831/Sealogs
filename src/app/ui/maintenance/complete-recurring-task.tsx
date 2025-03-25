'use client'
import React, { useState } from 'react'
import {
    getMaintenanceCheckByID,
    getMaintenanceCheckSubTaskByID,
    upcomingScheduleDate,
} from '@/app/lib/actions'
import {
    UPDATE_COMPONENT_MAINTENANCE_CHECK,
    CREATE_COMPONENT_MAINTENANCE_CHECK,
    CREATE_SEALOGS_FILE_LINKS,
    UPDATE_COMPONENT_MAINTENANCE_SIGNATURE,
    DELETE_COMPONENT_MAINTENANCE_CHECK,
    UPDATE_COMPONENT_MAINTENANCE_SCHEDULE,
    CREATE_COMPONENT_MAINTENANCE_SCHEDULE,
    CREATE_COMPONENT_MAINTENANCE_SUBTASK,
    CREATE_MAINTENANCE_CHECK_SUBTASK,
    UPDATE_COMPONENT_MAINTENANCE_CHECK_SUBTASK,
    UpdateEngine_Usage,
    CreateEngine_Usage,
} from '@/app/lib/graphQL/mutation'
import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import Loading from '@/app/loading'

export default function CompleteRecurringTask({
    taskID,
    lastCompletedDate = false,
}: {
    taskID: number
    lastCompletedDate: any
}) {
    const router = useRouter()
    const [task, setTask] = useState<any>()
    const [newTaskID, setNewTaskID] = useState()
    const [subTasks, setSubTasks] = useState<any>()
    const [taskCountState, setTaskCountState] = useState(0)
    const [engineCountState, setEngineCountState] = useState(0)

    var taskCount = 0
    var engineCount = 0

    getMaintenanceCheckSubTaskByID(taskID, setSubTasks)

    const [updateMaintenanceChecks] = useMutation(
        UPDATE_COMPONENT_MAINTENANCE_CHECK,
        {
            onCompleted: (response: any) => {
                const data = response.updateComponentMaintenanceCheck
                if (
                    data.id > 0 &&
                    task.maintenanceSchedule.engineUsage.nodes.length ===
                        engineCountState &&
                    taskCountState === subTasks?.length
                ) {
                    router.push('/maintenance')
                }
            },
            onError: (error: any) => {
                console.error('updateMaintenanceChecksEntry error', error)
            },
        },
    )

    const [createSubtask] = useMutation(CREATE_COMPONENT_MAINTENANCE_SUBTASK, {
        onCompleted: (response: any) => {
            const data = response.createMaintenanceScheduleSubTask
            if (data) {
                createSubtaskCheck({
                    variables: {
                        input: {
                            maintenanceScheduleSubTaskID: data.id,
                            componentMaintenanceCheckID: newTaskID,
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

    const [createSubtaskCheck] = useMutation(CREATE_MAINTENANCE_CHECK_SUBTASK, {
        onCompleted: (response: any) => {
            const data = response.createMaintenanceCheckSubTask
            if (data.id > 0) {
                taskCount++
                setTaskCountState(taskCount)
                if (taskCount === subTasks.length) {
                    updateMaintenanceChecks({
                        variables: {
                            input: {
                                id: taskID,
                                archived: true,
                            },
                        },
                    })
                }
            }
        },
        onError: (error: any) => {
            console.error('createSubtaskCheckEntry error', error)
        },
    })

    const [createMaintenanceCheck] = useMutation(
        CREATE_COMPONENT_MAINTENANCE_CHECK,
        {
            onCompleted: (response: any) => {
                const data = response.createComponentMaintenanceCheck
                if (data.id > 0) {
                    setNewTaskID(data.id)
                    createMaintenanceSchedule({
                        variables: {
                            input: {
                                title: task.maintenanceSchedule.title,
                                description:
                                    task.maintenanceSchedule.description,
                                type: task.maintenanceSchedule.type,
                                occursEveryType:
                                    task.maintenanceSchedule.occursEveryType,
                                occursEvery:
                                    +task.maintenanceSchedule.occursEvery,
                                warnWithinType:
                                    task.maintenanceSchedule.warnWithinType,
                                maintenanceChecks: data.id,
                                basicComponents: task.basicComponentID,
                                inventoryID:
                                    task.maintenanceSchedule.inventoryID,
                                assignedByID:
                                    task.maintenanceSchedule.assignedByID,
                                assignedToID:
                                    task.maintenanceSchedule.assignedToID,
                            },
                        },
                    })
                    subTasks?.map((subTask: any) => {
                        createSubtask({
                            variables: {
                                input: {
                                    task: subTask.maintenanceScheduleSubTask
                                        .task,
                                    description:
                                        subTask.maintenanceScheduleSubTask
                                            .description,
                                },
                            },
                        })
                    })
                }
            },
            onError: (error: any) => {
                console.error('createMaintenanceCheck error', error)
            },
        },
    )

    const [createMaintenanceSchedule] = useMutation(
        CREATE_COMPONENT_MAINTENANCE_SCHEDULE,
        {
            onCompleted: (response: any) => {
                const data = response.createComponentMaintenanceSchedule
                task.maintenanceSchedule.engineUsage.nodes.length === 0 &&
                    subTasks?.length === 0 &&
                    router.push('/maintenance')
                task.maintenanceSchedule.engineUsage.nodes.map(
                    (engine: any) => {
                        createEngineUsage({
                            variables: {
                                input: {
                                    lastScheduleHours:
                                        +engine.lastScheduleHours +
                                        +task.maintenanceSchedule.occursEvery,
                                    maintenanceScheduleID: data.id,
                                    isScheduled: engine.isScheduled,
                                    engineID: engine.engine.id,
                                },
                            },
                        })
                    },
                )
                const routeInterval = setInterval(() => {
                    if (
                        task.maintenanceSchedule.engineUsage.nodes.length ===
                            engineCountState &&
                        taskCountState === subTasks?.length
                    ) {
                        router.push('/maintenance')
                        clearInterval(routeInterval)
                    }
                }, 2000)
            },
            onError: (error: any) => {
                console.error('createMaintenanceScheduleEntry error', error)
            },
        },
    )

    const [createEngineUsage] = useMutation(CreateEngine_Usage, {
        onCompleted: (response: any) => {
            const data = response.createEngine_Usage
            engineCount++
            setEngineCountState(engineCount)
            if (
                engineCountState ===
                    task.maintenanceSchedule.engineUsage.nodes.length &&
                taskCountState === subTasks?.length
            ) {
                router.push('/maintenance')
            }
        },
        onError: (error: any) => {
            console.error('updateEngineUsage error', error)
        },
    })

    const handleSetTask = async (data: any) => {
        setTask(data)
        await createMaintenanceCheck({
            variables: {
                input: {
                    projected: +data.projected,
                    difference: +data.difference,
                    name: data.name,
                    expires: upcomingScheduleDate(data, true),
                    startDate: data.dateCompleted,
                    comments: data.comments,
                    severity: data.severity,
                    status: 'Open',
                    assignedByID: data.assignedByID,
                    attachmentLinks: data.attachmentLinks?.nodes
                        .map((link: any) => link.id)
                        .join(','),
                    assignees: data.assignees?.nodes
                        .map((assignee: any) => assignee.id)
                        .join(','),
                    assignedToID: data.assignedToID,
                    basicComponentID: data.basicComponentID,
                    inventoryID: data.inventoryID,
                    maintenanceScheduleID: data.maintenanceScheduleID,
                    recurringID: data.recurringID,
                },
            },
        })
    }

    getMaintenanceCheckByID(taskID, handleSetTask)

    return (
        <div>
            <Loading message="Completing Task" />
        </div>
    )
}
