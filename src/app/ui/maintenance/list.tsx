'use client'
import React, { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Button, DialogTrigger, Heading, Popover } from 'react-aria-components'
import { GET_MAINTENANCE_CHECK, GET_CREW_BY_IDS } from '@/app/lib/graphQL/query'
import {
    ChatBubbleBottomCenterTextIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { List } from '@/app/ui/skeletons'
import {
    PopoverWrapper,
    TableWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import Link from 'next/link'
import { classes } from '@/app/components/GlobalClasses'
import { getVesselList } from '@/app/lib/actions'
import dayjs from 'dayjs'
import Filter from '@/app/components/Filter'
import { isEmpty, trim } from 'lodash'
import { isOverDueTask } from '@/app/lib/actions'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import toast from 'react-hot-toast'

export default function TaskList() {
    const [maintenanceChecks, setMaintenanceChecks] = useState<any>()
    const [vessels, setVessels] = useState<any>()
    const [crewInfo, setCrewInfo] = useState<any>()
    const [filter, setFilter] = useState({} as SearchFilter)
    const [isLoading, setIsLoading] = useState(true)
    const [keywordFilter, setKeywordFilter] = useState([] as any)
    const [permissions, setPermissions] = useState<any>(false)
    const [edit_task, setEdit_task] = useState<any>(false)
    const router = useRouter()

    const init_permissions = () => {
        if (permissions) {
            if (hasPermission('EDIT_TASK', permissions)) {
                setEdit_task(true)
            } else {
                setEdit_task(false)
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

    const [queryMaintenanceChecks] = useLazyQuery(GET_MAINTENANCE_CHECK, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readComponentMaintenanceChecks.nodes
            if (data) {
                handleSetMaintenanceChecks(data)
            }
        },
        onError: (error: any) => {
            console.error('queryMaintenanceChecks error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadMaintenanceChecks()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadMaintenanceChecks = async (
        searchFilter: SearchFilter = { ...filter },
        searchkeywordFilter: any = keywordFilter,
    ) => {
        if (searchkeywordFilter.length > 0) {
            const promises = searchkeywordFilter.map(
                async (keywordFilter: any) => {
                    return await queryMaintenanceChecks({
                        variables: {
                            filter: { ...searchFilter, ...keywordFilter },
                        },
                    })
                },
            )
            let responses = await Promise.all(promises)
            // filter out empty results
            responses = responses.filter(
                (r: any) =>
                    r.data.readComponentMaintenanceChecks.nodes.length > 0,
            )
            // flatten results
            responses = responses.flatMap(
                (r: any) => r.data.readComponentMaintenanceChecks.nodes,
            )
            // filter out duplicates
            responses = responses.filter(
                (value: any, index: any, self: any) =>
                    self.findIndex((v: any) => v.id === value.id) === index,
            )
            handleSetMaintenanceChecks(responses)
        } else {
            await queryMaintenanceChecks({
                variables: {
                    filter: searchFilter,
                },
            })
        }
    }
    const handleSetVessels = (vessels: any) => {
        const activeVessels = vessels.filter((vessel: any) => !vessel.archived)
        const appendedData = activeVessels.map((item: any) => ({
            ...item,
        }))
        appendedData.push({ title: 'Other', id: 0 })
        setVessels(appendedData)
    }

    getVesselList(handleSetVessels)

    const handleSetMaintenanceChecks = (tasks: any) => {
        const activeTasks = tasks
            .filter((task: any) => task.archived === false)
            .map((task: any) => ({
                ...task,
                isOverDue: isOverDueTask(task),
            }))
        setMaintenanceChecks(activeTasks)
        const appendedData: number[] = Array.from(
            new Set(
                activeTasks
                    .filter((item: any) => item.assignedToID > 0)
                    .map((item: any) => item.assignedToID),
            ),
        )
        loadCrewMemberInfo(appendedData)
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
    const handleFilterOnChange = ({ type, data }: any) => {
        const searchFilter: SearchFilter = { ...filter }
        if (type === 'vessel') {
            if (data) {
                searchFilter.basicComponentID = { eq: +data.value }
            } else {
                delete searchFilter.basicComponentID
            }
        }
        let keyFilter = keywordFilter
        if (type === 'keyword') {
            if (!isEmpty(trim(data.value))) {
                keyFilter = [
                    { name: { contains: data.value } },
                    { comments: { contains: data.value } },
                    { workOrderNumber: { contains: data.value } },
                ]
            } else {
                keyFilter = []
            }
        }
        if (type === 'status') {
            if (data) {
                searchFilter.status = { eq: data.value }
            } else {
                delete searchFilter.status
            }
        }
        if (type === 'member') {
            if (data) {
                searchFilter.assignedToID = { eq: +data.value }
            } else {
                delete searchFilter.assignedToID
            }
        }
        if (type === 'dateRange') {
            if (data.startDate && data.endDate) {
                searchFilter.expires = {
                    gte: data.startDate,
                    lte: data.endDate,
                }
            } else {
                delete searchFilter.expires
            }
        }
        if (type === 'category') {
            if (data) {
                searchFilter.maintenanceCategoryID = { eq: +data.value }
            } else {
                delete searchFilter.maintenanceCategoryID
            }
        }
        setFilter(searchFilter)
        setKeywordFilter(keyFilter)
        loadMaintenanceChecks(searchFilter, keyFilter)
    }
    return (
        <div className="w-full">
            <div className="flex justify-end">
                <SeaLogsButton
                    action={() => {
                        if (!edit_task) {
                            toast.error(
                                'You do not have permission to edit this section',
                            )
                            return
                        }
                        router.push('/maintenance/new?redirectTo=/maintenance')
                    }}
                    text="New Task"
                    color="slblue"
                    type="primary"
                    icon="check"
                />
            </div>
            <Filter onChange={handleFilterOnChange} />

            <div className="flex w-full justify-start flex-col md:flex-row items-start">
                {maintenanceChecks && vessels ? (
                    <Table
                        maintenanceChecks={maintenanceChecks}
                        vessels={vessels}
                        crewInfo={crewInfo}
                    />
                ) : (
                    <List />
                )}
            </div>
        </div>
    )
}

export const Table = ({
    maintenanceChecks,
    vessels,
    crewInfo,
    showVessel = false,
}: any) => {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    var maintenanceChecksArray = maintenanceChecks
        .filter(
            (maintenanceCheck: any) =>
                maintenanceCheck.status !== 'Save_As_Draft',
        )
        .map((maintenanceCheck: any) => {
            return {
                id: maintenanceCheck.id,
                name: maintenanceCheck.name,
                basicComponentID: maintenanceCheck.basicComponentID,
                comments: maintenanceCheck.comments,
                description: maintenanceCheck.description,
                assignedToID: maintenanceCheck.assignedToID,
                expires: maintenanceCheck.expires, // the value of maintenanceCheck.expires here is already computed from upcomingScheduleDate()
                status: maintenanceCheck.status,
                startDate: maintenanceCheck.startDate,
                isOverDue: maintenanceCheck.isOverDue,
                isCompleted:
                    maintenanceCheck.status === 'Completed' ||
                    maintenanceCheck.isOverDue.status === 'Completed'
                        ? '1'
                        : '2',
                severity: maintenanceCheck.severity,
            }
        })
    // Completed: sort by "expires" from recent to oldest
    maintenanceChecksArray.sort((a: any, b: any) => {
        if (a.isCompleted === '1' && b.isCompleted === '1') {
            if (a.expires === 'NA' && b.expires !== 'NA') {
                return 1
            } else if (a.expires !== 'NA' && b.expires === 'NA') {
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

    return (
        <div className="overflow-x-auto w-full block font-normal">
            <TableWrapper headings={[]}>
                <tr className="hidden md:table-row">
                    <td className="text-left p-3"></td>
                    <td className="text-left p-3"></td>
                    {!showVessel && (
                        <td className="hidden lg:table-cell text-left p-3 border-b border-slblue-200">
                            <label className={`${classes.label} !w-full`}>
                                Location
                            </label>
                        </td>
                    )}
                    <td className="hidden md:table-cell text-left p-3 border-b border-slblue-200">
                        <label
                            className={`${classes.label} text-nowrap !w-full`}>
                            Assigned to
                        </label>
                    </td>
                    <td className="hidden md:table-cell text-left p-3 border-b border-slblue-200">
                        <label className={`${classes.label} !w-full`}>
                            Due
                        </label>
                    </td>
                </tr>
                {maintenanceChecksArray.map((maintenanceCheck: any) => (
                    <tr
                        key={maintenanceCheck.id}
                        className={`border-b border-slblue-100 even:bg-sllightblue-50/50 dark:border-slblue-50 hover:bg-sllightblue-50 dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                        <td className="hidden md:table-cell pl-2 pr-0 items-center">
                            {(maintenanceCheck.severity === 'High' ||
                                maintenanceCheck.severity === 'Medium') && (
                                <ExclamationTriangleIcon
                                    className={`h-6 w-6  ${maintenanceCheck.severity === 'High' ? 'text-slred-800' : 'text-slorange-1000'}`}
                                />
                            )}
                        </td>
                        <td className="p-2 items-center text-left border-y md:border-0 border-slblue-100">
                            <div className="flex flex-col sm:flex-row">
                                <Link
                                    href={`/maintenance?taskID=${maintenanceCheck.id}&redirect_to=${pathname}?${searchParams.toString()}`}
                                    className="group-hover:text-sllightblue-1000 focus:outline-none imtems-center flex gap-1">
                                    <div className="inline-block md:hidden">
                                        {(maintenanceCheck.severity ===
                                            'High' ||
                                            maintenanceCheck.severity ===
                                                'Medium') && (
                                            <ExclamationTriangleIcon
                                                className={`h-6 w-6  ${maintenanceCheck.severity === 'High' ? 'text-slred-800' : 'text-slorange-1000'}`}
                                            />
                                        )}
                                    </div>
                                    {maintenanceCheck.name}
                                </Link>
                            </div>
                            {!showVessel && (
                                <div className="flex lg:hidden my-3">
                                    {maintenanceCheck.basicComponentID !==
                                        null &&
                                        vessels
                                            ?.filter(
                                                (vessel: any) =>
                                                    vessel?.id ==
                                                    maintenanceCheck.basicComponentID,
                                            )
                                            .map((vessel: any) => (
                                                <div key={vessel.id}>
                                                    <Link
                                                        href={`/vessel/info?id=${vessel.id}`}
                                                        className="group-hover:text-sllightblue-800 border border-slblue-100 rounded-md p-2 bg-sllightblue-50 font-light focus:outline-none">
                                                        {vessel.title}
                                                    </Link>
                                                </div>
                                            ))}
                                </div>
                            )}
                            <div className="flex flex-row gap-2 md:hidden my-3 items-center">
                                <label
                                    className={`${classes.label} text-nowrap !w-20`}>
                                    Assigned to
                                </label>
                                {crewInfo &&
                                    crewInfo
                                        .filter(
                                            (crew: any) =>
                                                crew.id ===
                                                maintenanceCheck.assignedToID,
                                        )
                                        .map((crew: any, index: number) => {
                                            return (
                                                <Link
                                                    key={index}
                                                    href={`/crew/info?id=${crew.id}`}
                                                    className="bg-slblue-50 border border-slblue-200 font-light rounded-lg p-2 outline-none dark:text-sldarkblue-800">
                                                    {crew.firstName}
                                                    <span className="hidden md:inline-block">
                                                        &nbsp;{crew.surname}
                                                    </span>
                                                </Link>
                                            )
                                        })}
                                <div
                                    className={`inline-block border rounded-lg p-2 text-xs
                                        ${maintenanceCheck?.isOverDue?.status === 'High' ? 'text-slred-1000 bg-slred-100 border-slred-1000' : ''}
                                        ${maintenanceCheck?.isOverDue?.status === 'Low' || maintenanceCheck?.isOverDue?.status === 'Upcoming' || maintenanceCheck?.isOverDue?.status === 'Completed' ? 'text-slgreen-1000 bg-slneon-100 border-slgreen-1000' : ''}
                                        ${maintenanceCheck?.isOverDue?.status === 'Medium' || maintenanceCheck?.isOverDue?.days === 'Save As Draft' ? 'text-orange-1000 bg-orange-100' : ''} `}>
                                    <span>
                                        {maintenanceCheck?.isOverDue?.status &&
                                            ['High', 'Medium', 'Low'].includes(
                                                maintenanceCheck.isOverDue
                                                    .status,
                                            ) &&
                                            maintenanceCheck?.isOverDue?.days}
                                        {maintenanceCheck?.isOverDue?.status ===
                                            'Completed' &&
                                            maintenanceCheck?.isOverDue
                                                ?.days === 'Save As Draft' &&
                                            maintenanceCheck?.isOverDue?.days}
                                        {maintenanceCheck?.isOverDue?.status ===
                                            'Upcoming' &&
                                            maintenanceCheck?.isOverDue?.days}
                                        {maintenanceCheck?.isOverDue?.status ===
                                            'Completed' &&
                                            isEmpty(
                                                maintenanceCheck?.isOverDue
                                                    ?.days,
                                            ) &&
                                            maintenanceCheck?.isOverDue?.status}
                                        {maintenanceCheck?.isOverDue?.status ===
                                            'Completed' &&
                                            !isEmpty(
                                                maintenanceCheck?.isOverDue
                                                    ?.days,
                                            ) &&
                                            maintenanceCheck?.isOverDue
                                                ?.days !== 'Save As Draft' &&
                                            maintenanceCheck?.isOverDue?.days}
                                        {/*{maintenanceCheck.status.replaceAll('_', ' ')}*/}
                                    </span>
                                </div>
                            </div>
                        </td>
                        {!showVessel && (
                            <td className="hidden lg:table-cell p-2 text-left items-center ">
                                {maintenanceCheck.basicComponentID !== null &&
                                    vessels
                                        ?.filter(
                                            (vessel: any) =>
                                                vessel?.id ==
                                                maintenanceCheck.basicComponentID,
                                        )
                                        .map((vessel: any) => (
                                            <div key={vessel.id}>
                                                <Link
                                                    href={`/vessel/info?id=${vessel.id}`}
                                                    className="group-hover:text-sllightblue-800 focus:outline-none">
                                                    {vessel.title}
                                                </Link>
                                            </div>
                                        ))}
                            </td>
                        )}
                        <td className="hidden md:table-cell p-2 text-left items-center ">
                            {crewInfo &&
                                crewInfo
                                    .filter(
                                        (crew: any) =>
                                            crew.id ===
                                            maintenanceCheck.assignedToID,
                                    )
                                    .map((crew: any, index: number) => {
                                        return (
                                            <Link
                                                key={index}
                                                href={`/crew/info?id=${crew.id}`}
                                                className="bg-slblue-50 border border-slblue-200 font-light rounded-lg p-2 outline-none dark:text-sldarkblue-800">
                                                {crew.firstName}
                                                <span className="hidden md:inline-block">
                                                    &nbsp;{crew.surname}
                                                </span>
                                            </Link>
                                        )
                                    })}
                        </td>
                        <td className="hidden md:table-cell p-2 text-left items-center">
                            <div
                                className={`inline-block border rounded-lg p-2 text-xs
                                        ${maintenanceCheck?.isOverDue?.status === 'High' ? 'text-slred-1000 bg-slred-100 border-slred-1000' : ''}
                                        ${maintenanceCheck?.isOverDue?.status === 'Low' || maintenanceCheck?.isOverDue?.status === 'Upcoming' || maintenanceCheck?.isOverDue?.status === 'Completed' ? 'text-slgreen-1000 bg-slneon-100 border-slgreen-1000' : ''}
                                        ${maintenanceCheck?.isOverDue?.status === 'Medium' || maintenanceCheck?.isOverDue?.days === 'Save As Draft' ? 'text-orange-1000 bg-orange-100' : ''} `}>
                                <span>
                                    {maintenanceCheck?.isOverDue?.status &&
                                        ['High', 'Medium', 'Low'].includes(
                                            maintenanceCheck.isOverDue.status,
                                        ) &&
                                        maintenanceCheck?.isOverDue?.days}
                                    {maintenanceCheck?.isOverDue?.status ===
                                        'Completed' &&
                                        maintenanceCheck?.isOverDue?.days ===
                                            'Save As Draft' &&
                                        maintenanceCheck?.isOverDue?.days}
                                    {maintenanceCheck?.isOverDue?.status ===
                                        'Upcoming' &&
                                        maintenanceCheck?.isOverDue?.days}
                                    {maintenanceCheck?.isOverDue?.status ===
                                        'Completed' &&
                                        isEmpty(
                                            maintenanceCheck?.isOverDue?.days,
                                        ) &&
                                        maintenanceCheck?.isOverDue?.status}
                                    {maintenanceCheck?.isOverDue?.status ===
                                        'Completed' &&
                                        !isEmpty(
                                            maintenanceCheck?.isOverDue?.days,
                                        ) &&
                                        maintenanceCheck?.isOverDue?.days !==
                                            'Save As Draft' &&
                                        maintenanceCheck?.isOverDue?.days}
                                    {/*{maintenanceCheck.status.replaceAll('_', ' ')}*/}
                                </span>
                            </div>
                        </td>
                    </tr>
                ))}
            </TableWrapper>
        </div>
    )
}
