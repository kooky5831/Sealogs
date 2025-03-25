'use client'

import React, { useEffect, useState } from 'react'
import {
    Button,
    Heading,
    Dialog,
    Modal,
    ModalOverlay,
    DialogTrigger,
    TooltipTrigger,
    Tooltip,
} from 'react-aria-components'
import { useMutation } from '@apollo/client'
import Skeleton from '@/app/components/Skeleton'
import { DELETE_USER, UPDATE_USER } from '@/app/lib/graphQL/mutation'
import Link from 'next/link'
import CrewTrainingList from '../crew-training/list'
import dayjs from 'dayjs'
import { SeaLogsButton } from '@/app/components/Components'
import CrewAllocatedTasks from '../crew/allocated-tasks'
import CrewVoyages from '../crew/voyages'
import {
    getVesselList,
    getSeaLogsMembers,
    getComponentMaintenanceCheckByMemberId,
    isOverDueTask,
    getCrewMembersLogBookEntrySections,
    GetCrewListWithTrainingStatus,
    upcomingScheduleDate,
} from '@/app/lib/actions'
import { classes } from '@/app/components/GlobalClasses'
import { useRouter } from 'next/navigation'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import Loading from '@/app/loading'

export default function CrewView({ crewId }: { crewId: number }) {
    const router = useRouter()
    const [crewTab, setCrewTab] = useState('training')
    const [taskCounter, setTaskCounter] = useState(0)
    const [dueTrainingCounter, setDueTrainingCounter] = useState(0)
    const [vessels, setVessels] = useState<
        Array<{ label: string; value: number }>
    >([])
    const [taskList, setTaskList] = useState([] as any)
    const [voyages, setVoyages] = useState([] as any)
    const [isSelf, setIsSelf] = useState(false)
    const [permissions, setPermissions] = useState<any>(false)
    const [disabled, setDisabled] = useState(true)
    let [isOpen, setOpen] = useState(false);

    getCrewMembersLogBookEntrySections(crewId, setVoyages)

    useEffect(() => {
        setPermissions(getPermissions)
    }, [])

    const handleSetTaskList = (tasks: any) => {
        const activeTasks = tasks
            .filter((task: any) => task.archived === false)
            .map((task: any) => ({
                ...task,
                isOverDue: isOverDueTask(task),
            }))

        var maintenanceChecksArray = activeTasks.map(
            (maintenanceCheck: any) => {
                return {
                    id: maintenanceCheck.id,
                    name: maintenanceCheck.name,
                    basicComponentID: maintenanceCheck.basicComponentID,
                    comments: maintenanceCheck.comments,
                    description: maintenanceCheck.description,
                    assignedToID: maintenanceCheck.assignedToID,
                    expires: upcomingScheduleDate(maintenanceCheck),
                    status: maintenanceCheck.status,
                    startDate: maintenanceCheck.startDate,
                    isOverDue: maintenanceCheck.isOverDue,
                    basicComponent: maintenanceCheck.basicComponent,
                    isCompleted:
                        maintenanceCheck.status === 'Completed' ? '1' : '2',
                }
            },
        )
        maintenanceChecksArray.sort(
            (a: any, b: any) =>
                b.isCompleted.localeCompare(a.isCompleted) ||
                dayjs(a.expires).valueOf() - dayjs(b.expires).valueOf(),
        )

        setTaskList(maintenanceChecksArray)

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const taskCounter = activeTasks.filter(
            (task: any) =>
                task.status !== 'Completed' &&
                task.status !== 'Save_As_Draft' &&
                task.isOverDue.status !== 'Completed' &&
                task.isOverDue.status !== 'Upcoming',
        ).length
        setTaskCounter(taskCounter)
    }

    getComponentMaintenanceCheckByMemberId(crewId, handleSetTaskList)

    const [crewInfo, setCrewInfo] = useState({} as any)

    const handleSetVessels = (vessels: any) => {
        const activeVessels = vessels.filter((vessel: any) => !vessel.archived)
        const vesselSelection = activeVessels.map((vessel: any) => {
            return { label: vessel.title, value: vessel.id }
        })

        setVessels(vesselSelection)
    }

    getVesselList(handleSetVessels)

    const handleSetCrewInfo = (crewInfo: any) => {
        setCrewInfo(crewInfo[0])
        const crewWithTrainingStatus = GetCrewListWithTrainingStatus(
            crewInfo,
            vessels,
        )[0]
        const dues = crewWithTrainingStatus?.trainingSessionsDue?.nodes.filter(
            (node: any) => {
                return node.status.isOverdue || node.status.dueWithinSevenDays
            },
        )

        setDueTrainingCounter(dues.length)
        if (localStorage.getItem('userId') === crewInfo[0]?.id) {
            setIsSelf(true)
        }
    }

    getSeaLogsMembers([crewId], handleSetCrewInfo)

    const handleArchiveUser = async (crewInfo: any) => {
        if (crewInfo) {
            const variables = {
                input: {
                    id: crewInfo.id,
                    archived: !crewInfo.archived,
                },
            }
            await mutationUpdateUser({
                variables,
            })
        }
    }
    
    const [mutationUpdateUser, {}] = useMutation(UPDATE_USER, {
        onCompleted: (mutationUpdateUserResponse: any) => {
            router.back()
        },
        onError: (error: any) => {
            console.error('mutationUpdateUser error', error)
        },
    })
    
    /*const [mutationDeleteUser, {}] = useMutation(DELETE_USER, {
        onCompleted: (mutationDeleteUserResponse: any) => {
            router.back()
        },
        onError: (error: any) => {
            console.error('mutationDeleteUser error', error)
        },
    })*/

    // const [accessPermissions, setAccessPermissions] = useState<any>(false)

    // useEffect(() => {
    //     setAccessPermissions(getPermissions)
    // }, [])

    // if (!accessPermissions || !hasPermission('VIEW_MEMBER', accessPermissions)) {
    // return !permissions ? (
    //     <Loading />
    // ) : (
    //     <Loading errorMessage="Oops! You do not have the permission to view this section." />
    // )
    // }

    // console.log('permissions', permissions)

    if (
        !permissions ||
        !hasPermission(process.env.VIEW_MEMBER || 'VIEW_MEMBER', permissions)
    ) {
        return !permissions ? (
            <Loading />
        ) : (
            <Loading errorMessage="Oops! You do not have the permission to view this section." />
        )
    }

    let IsOpen = false
    if (voyages && voyages.length > 0 && voyages[0].punchOut == null) {
        IsOpen = true
    }

    return (
        <div className="w-full p-0">
            <div className="flex justify-between flex-col md:flex-row">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    <span className="font-medium mr-2">Crew:</span>
                    {!crewInfo ? (
                        <Skeleton />
                    ) : (
                        `${crewInfo?.firstName || ''} ${crewInfo?.surname || ''}`
                    )}
                    <span
                        className={`hidden lg:inline ms-2 text-sm font-normal rounded py-0.5 px-1.5 ${crewInfo.status?.state === 'Active' ? 'text-sky-500 border border-sky-500 bg-sky-100' : 'text-orange-500 border border-orange-500 bg-orange-100'}`}>
                        {/*(crewInfo.vehicles?.nodes &&
                            crewInfo.vehicles.nodes.find(
                                (vehicle: any) =>
                                    vehicle.id == crewInfo.currentVehicleID,
                            )?.title) ||
                            'No Vehicle Assigned'*/}
                        {IsOpen && 
                            <Link
                                href={`/log-entries/view?&vesselID=${voyages[0].logBookEntry.vehicle.id}&logentryID=${voyages[0].logBookEntry.id}`}>
                                    Active log book at {voyages[0].logBookEntry.vehicle.title}
                            </Link>
                            ||
                            'No active log books'
                        }
                    </span>
                    <div
                        className={`block lg:hidden w-max mb-2 ms-2 text-sm font-normal rounded py-0.5 px-1.5 ${crewInfo.status?.state === 'Active' ? 'text-sky-500 border border-sky-500 bg-sky-100' : 'text-orange-500 border border-orange-500 bg-orange-100'}`}>
                        {/*(crewInfo.vehicles?.nodes &&
                            crewInfo.vehicles.nodes.find(
                                (vehicle: any) =>
                                    vehicle.id == crewInfo.currentVehicleID,
                            )?.title) ||
                            'No Vehicle Assigned'*/}
                        {IsOpen && 
                            <Link
                                href={`/log-entries/view?&vesselID=${voyages[0].logBookEntry.vehicle.id}&logentryID=${voyages[0].logBookEntry.id}`}>
                                    Active log book at {voyages[0].logBookEntry.vehicle.title}
                            </Link>
                            ||
                            'No active log books'
                        }
                    </div>
                </Heading>
                <div className="flex items-center justify-end flex-wrap md:flexnowrap">
                    {permissions &&
                        hasPermission(
                            process.env.EDIT_MEMBER || 'EDIT_MEMBER',
                            permissions,
                        ) && (
                            <DialogTrigger>
                                <SeaLogsButton
                                    type="text"
                                    icon="record"
                                    text={
                                        crewInfo.archived
                                            ? 'Retrieve'
                                            : 'Archive'
                                    }
                                    className={'mb-1 md:mb-0'}
                                />
                                <ModalOverlay
                                    className={`fixed inset-0 z-[15001] overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur`}>
                                    <Modal
                                        className={`w-full max-w-md rounded-lg bg-white dark:bg-sldarkblue-800 text-left align-middle shadow-xl`}>
                                        <Dialog
                                            role="alertdialog"
                                            className="outline-none relative">
                                            {({ close }) => (
                                                <div className="flex justify-center flex-col px-6 py-6">
                                                    {permissions &&
                                                    hasPermission(
                                                        process.env
                                                            .DELETE_MEMBER ||
                                                            'DELETE_MEMBER',
                                                        permissions,
                                                    ) ? (
                                                        <>
                                                            <Heading
                                                                slot="title"
                                                                className="text-2xl font-light leading-6 my-2 text-gray-700">
                                                                {crewInfo?.archived
                                                                    ? 'Retrieve'
                                                                    : 'Archive'}{' '}
                                                                User
                                                            </Heading>
                                                            <p className="mt-3 text-slate-500">
                                                                Are you sure you
                                                                want to{' '}
                                                                {crewInfo?.archived
                                                                    ? 'retrieve'
                                                                    : 'archive'}{' '}
                                                                {`${crewInfo?.firstName || 'this user'} ${crewInfo?.surname || ''}`}
                                                                ?
                                                            </p>
                                                            <hr className="my-6" />
                                                            <div className="flex justify-end">
                                                                <Button
                                                                    className="mr-8 text-sm text-gray-600 hover:text-gray-600"
                                                                    onPress={
                                                                        close
                                                                    }>
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    className="group inline-flex justify-center items-center rounded-md bg-sky-700 px-4 py-2 text-sm text-white shadow-sm hover:bg-white hover:text-sky-800 ring-1 ring-sky-700"
                                                                    onPress={() => {
                                                                        close()
                                                                        handleArchiveUser(
                                                                            crewInfo,
                                                                        )
                                                                    }}>
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
                                                                    {crewInfo?.archived
                                                                        ? 'Retrieve'
                                                                        : 'Archive'}
                                                                </Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Heading
                                                                slot="title"
                                                                className="text-2xl font-light leading-6 my-2 text-gray-700">
                                                                Warning
                                                            </Heading>
                                                            <p className="mt-3 text-slate-500">
                                                                You do not have
                                                                permission to
                                                                archive user.
                                                            </p>
                                                            <hr className="my-6" />
                                                            <div className="flex justify-end">
                                                                <Button
                                                                    className="mr-8 text-sm text-gray-600 hover:text-gray-600"
                                                                    onPress={
                                                                        close
                                                                    }>
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </Dialog>
                                    </Modal>
                                </ModalOverlay>
                            </DialogTrigger>
                        )}
                    {((permissions &&
                        hasPermission(
                            process.env.EDIT_MEMBER || 'EDIT_MEMBER',
                            permissions,
                        )) ||
                        isSelf) && (
                        <SeaLogsButton
                            type="info"
                            icon="pencil"
                            text="Edit"
                            link={`/user/edit?id=${crewId}`}
                            className={'mb-1 md:mb-0'}
                        />
                    )}
                    {((permissions &&
                        hasPermission(
                            process.env.EDIT_MEMBER || 'EDIT_MEMBER',
                            permissions,
                        )) ||
                        isSelf) && (
                        <SeaLogsButton
                            type="secondary"
                            icon="qualification"
                            text="Add Qualification"
                            link={`/user/create`}
                            color="sky"
                            className={`${crewTab === 'training' ? 'hidden' : ''} ${crewTab === 'qualification' ? '!mr-0' : ''}`}
                        />
                    )}
                    <SeaLogsButton
                        type="primary"
                        icon="check"
                        text="Record Training"
                        link={`/crew-training/create?memberId=${crewId}`}
                        color="sky"
                        className={`${crewTab === 'qualification' ? 'hidden' : ''}`}
                    />
                </div>
            </div>
            {(crewInfo?.email ||
                crewInfo?.vehicles ||
                crewInfo?.phoneNumber) && (
                <div className="pb-4 pt-4 px-4 ml-[1px] border-t border-b mt-2 mb-3">
                    {crewInfo?.primaryDuty && (
                        <div className="flex items-center mt-2">
                            <span className="text-gray-500 dark:text-gray-100 mr-4 w-32">
                                Primary Duty:
                            </span>
                            <span className="ms-2 text-gray-800 dark:text-gray-200">
                                {crewInfo?.primaryDuty.title}
                            </span>
                        </div>
                    )}
                    {((permissions &&
                        hasPermission(
                            process.env.VIEW_MEMBER_CONTACT ||
                                'VIEW_MEMBER_CONTACT',
                            permissions,
                        )) ||
                        isSelf) &&
                        crewInfo?.email && (
                            <div className="flex items-center mt-4">
                                <span className="text-gray-500 dark:text-gray-100 mr-4 w-32">
                                    Email:
                                </span>
                                <span className="ms-2 text-gray-800 dark:text-gray-200">
                                    {crewInfo?.email}
                                </span>
                            </div>
                        )}
                    {((permissions &&
                        hasPermission(
                            process.env.VIEW_MEMBER_CONTACT ||
                                'VIEW_MEMBER_CONTACT',
                            permissions,
                        )) ||
                        isSelf) &&
                        crewInfo?.phoneNumber && (
                            <div className="flex items-center mt-4">
                                <span className="text-gray-500 dark:text-gray-100 mr-4 w-32">
                                    Phone:
                                </span>
                                <span className="ms-2 text-gray-800 dark:text-gray-200">
                                    {crewInfo?.phoneNumber}
                                </span>
                            </div>
                        )}
                    {crewInfo.vehicles.nodes && (
                        <div className="flex items-center mt-4 mb-2">
                            <span className="text-gray-500 dark:text-gray-100 mr-4 w-32">
                                Vessels:
                            </span>
                            <div className='flex flex-wrap md:flex-nowrap'>
                                {crewInfo.vehicles.nodes.map(
                                    (vessel: any, index: number) => {
                                        return (
                                            <Link
                                                key={index}
                                                href={`/vessel/info?id=${vessel.id}`}>
                                                    <div
                                                    className={`my-1 md:my-0 ms-2 text-sm font-normal rounded py-1 px-2 text-sky-500 border border-sky-500 bg-sky-100`}>
                                                        <span>
                                                            {vessel.title}
                                                        </span>
                                                    </div>

                                            </Link>
                                        )
                                    },
                                )}
                            </div>
                        </div>
                    )}
                    {crewInfo.departments.nodes && localStorage.getItem('useDepartment') === 'true' && (
                        <div className="flex items-center mt-4 mb-2">
                            <span className="text-gray-500 dark:text-gray-100 mr-4 w-32">
                                Departments:
                            </span>
                            <div className='flex flex-wrap md:flex-nowrap'>
                                {crewInfo.departments.nodes.map(
                                    (department: any, index: number) => {
                                        return (
                                            <Link
                                                key={index}
                                                href={`/department/info?id=${department.id}`}>
                                                <div
                                                    className={`my-1 md:my-0 ms-2 text-sm font-normal rounded py-1 px-2 text-sky-500 border border-sky-500 bg-sky-100`}>
                                                    <span>
                                                        {department.title}
                                                    </span>
                                                </div>
                                            </Link>
                                        )
                                    },
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div className="pb-5 pt-2 ml-[1px]">
                <div className="flex justify-start flex-col md:flex-row items-start">
                    <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-100 gap-2">
                        <li>
                            <Button
                                className={`${crewTab === 'training' ? classes.active : classes.inactive}`}
                                onPress={() => setCrewTab('training')}>
                                Training{' '}
                                {dueTrainingCounter > 0 && (
                                    <span className="text-xs font-normal border border-rose-600 bg-rose-100 text-rose-600 rounded-full w-5 h-5 flex justify-center items-center ms-2">
                                        {dueTrainingCounter}
                                    </span>
                                )}
                            </Button>
                        </li>
                        <li>
                        <TooltipTrigger delay={0}>
                            <Button
                                className={`${classes.disabled}`}
                                onPress={!disabled ? () => setCrewTab('qualification') : undefined}
                                style={{ pointerEvents: 'auto' }}
                                onHoverStart={() => setOpen(true)}
                                onHoverEnd={() => setOpen(false)}>
                                Qualifications
                            </Button>
                            {isOpen && <Tooltip placement="bottom" className={"mt-2 px-2 py-1 bg-slblue-400/50 rounded-md"}>Coming Soon</Tooltip>}
                        </TooltipTrigger>
                        </li>
                        <li>
                            <Button
                                className={`${crewTab === 'allocatedTasks' ? classes.active : classes.inactive}`}
                                onPress={() => setCrewTab('allocatedTasks')}>
                                Allocated Tasks
                                {taskCounter > 0 && (
                                    <span className="text-xs font-normal border border-rose-600 bg-rose-100 text-rose-600 rounded-full w-5 h-5 flex justify-center items-center ms-2">
                                        {taskCounter}
                                    </span>
                                )}
                            </Button>
                        </li>
                        <li>
                            <Button
                                className={`${crewTab === 'voyages' ? classes.active : classes.inactive}`}
                                onPress={() => setCrewTab('voyages')}>
                                Voyages
                            </Button>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="p-0">
                <div className="flex w-full justify-start flex-col md:flex-row items-start">
                    {crewTab === 'qualification' && (
                        // <CrewQualification />
                        <></>
                    )}
                    {crewTab === 'training' && (
                        <>
                            {!permissions ||
                            !hasPermission(
                                process.env.VIEW_CREW_TRAINING ||
                                    'VIEW_CREW_TRAINING',
                                permissions,
                            ) ? (
                                !permissions ? (
                                    <Loading />
                                ) : (
                                    <Loading errorMessage="Oops! You do not have the permission to view this section." />
                                )
                            ) : (
                                <CrewTrainingList memberId={crewId} />
                            )}
                        </>
                    )}
                    {crewTab === 'allocatedTasks' && (
                        <>
                            {!permissions ||
                            !hasPermission(
                                process.env.VIEW_MEMBER_TASKS ||
                                    'VIEW_MEMBER_TASKS',
                                permissions,
                            ) ? (
                                !permissions ? (
                                    <Loading />
                                ) : (
                                    <Loading errorMessage="Oops! You do not have the permission to view this section." />
                                )
                            ) : (
                                <CrewAllocatedTasks taskList={taskList} />
                            )}
                        </>
                    )}
                    {crewTab === 'voyages' && (
                        <>
                            {!permissions ||
                            !hasPermission(
                                process.env.VIEW_MEMBER_VOYAGES ||
                                    'VIEW_MEMBER_VOYAGES',
                                permissions,
                            ) ? (
                                !permissions ? (
                                    <Loading />
                                ) : (
                                    <Loading errorMessage="Oops! You do not have the permission to view this section." />
                                )
                            ) : (
                                <CrewVoyages voyages={voyages} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
