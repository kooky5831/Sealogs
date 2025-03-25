'use client'
import React, { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Button } from 'react-aria-components'
import {
    GET_MAINTENANCE_CHECK,
    GET_ALL_LOGBOOK_ENTRIES,
    GET_LOGBOOK_ENTRY_BY_ID,
    CREW_LIST,
    GET_INVENTORIES,
} from '@/app/lib/graphQL/query'
import { AlertDialog } from '@/app/components/Components'
import Link from 'next/link'
import { GetCrewListWithTrainingStatus, getVesselList } from '@/app/lib/actions'
import Filter from '@/app/components/Filter'
import { isEmpty, trim } from 'lodash'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import {
    TRAINING_SESSIONS,
    READ_TRAINING_SESSION_DUES,
} from '@/app/lib/graphQL/query'
import { GetTrainingSessionStatus } from '@/app/lib/actions'
import { Vessel } from '@/app/lib/definitions'
import { formatDate } from '@/app/helpers/dateHelper'

export default function Calendar({
    initialView = 'dayGridMonth',
    isDashboard = false,
}: any) {
    const [events, setEvents] = useState<any>([])
    const [eventsCopy, setEventsCopy] = useState<any>([])
    const [vessel, setVessel] = useState<any>()
    const [inventory, setInventory] = useState<any>([])
    const [crewInfo, setCrewInfo] = useState<any>()
    const [isLoading, setIsLoading] = useState(true)
    const [trainingList, setTrainingList] = useState([] as any)
    const [logBookEntry, setLogBookEntry] = useState({} as any)
    const [trainingSessionDues, setTrainingSessionDues] = useState([] as any)
    const [page, setPage] = useState(0)
    const [vesselIdOptions, setVesselIdOptions] = useState([] as any)
    const [crewList, setCrewList] = useState<any>([])
    const [vesselList, setVesselList] = useState<Vessel[]>([])
    const [inventories, setInventories] = useState<any>([])
    const [trainingTypeIdOptions, setTrainingTypeIdOptions] = useState(
        [] as any,
    )
    const [trainerIdOptions, setTrainerIdOptions] = useState([] as any)
    const [crewIdOptions, setCrewIdOptions] = useState([] as any)
    const [popupDate, setPopupDate] = useState({} as any)
    const [openCalendarDataDialog, setopenCalendarDataDialog] = useState(false)
    const [vesselListWithDocuments, setVesselListWithDocuments] = useState(
        [] as any,
    )
    const [vesselListWithDocumentsCopy, setVesselListWithDocumentsCopy] =
        useState([] as any)

    const [filter, setFilter] = useState({} as SearchFilter)
    const [pageInfo, setPageInfo] = useState({
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    })
    const limit = 100
    const handleCalendarDataDialog = async (data: any) => {
        // console.log(data?.event?._def?.extendedProps?.type)
        setPopupDate(data)
        if (data?.event?._def?.extendedProps?.type === 'Log Book Entry') {
            // console.log('data?.event?._def?.extendedProps?.type?.other_info?.logBookID::',data?.event?._def?.extendedProps?.other_info?.logBookID)
            loadLogBookEntry(data?.event?._def?.extendedProps?.other_info?.id)
            setopenCalendarDataDialog(true)
        } else {
            setopenCalendarDataDialog(true)
        }
    }

    const [queryMaintenanceChecks] = useLazyQuery(GET_MAINTENANCE_CHECK, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            let eventArray: any[] = [] // Initialize eventArray as an empty array
            const data = response.readComponentMaintenanceChecks.nodes.filter(
                (info: any) => info.status === 'Open',
            )
            data.forEach((element: any) => {
                eventArray.push({
                    title: 'Task :' + element.name,
                    start: new Date(element.expires),
                    type: 'Task',
                    other_info: element,
                })
            })
            if (data) {
                setEvents([...events, ...eventArray])
                setEventsCopy([...eventsCopy, ...eventArray])
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
    ) => {
        await queryMaintenanceChecks({
            variables: {
                filter: searchFilter,
            },
        })
    }

    useEffect(() => {
        // console.log('events::', events)
    }, [events])

    const [queryTrainingList, { loading: queryTrainingListLoading }] =
        useLazyQuery(TRAINING_SESSIONS, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                let eventArray: any[] = [] // Initialize eventArray as an empty array
                const data = response.readTrainingSessions.nodes
                const vesselIDs = Array.from(
                    new Set(data.map((item: any) => item.vessel.id)),
                ).filter((id: any) => +id !== 0)
                const trainingTypeIDs = Array.from(
                    new Set(
                        data.flatMap((item: any) =>
                            item.trainingTypes.nodes.map((t: any) => t.id),
                        ),
                    ),
                )
                const trainerIDs = Array.from(
                    new Set(data.map((item: any) => item.trainerID)),
                ).filter((id: any) => +id !== 0)
                const memberIDs = Array.from(
                    new Set(
                        data.flatMap((item: any) =>
                            item.members.nodes.map((t: any) => t.id),
                        ),
                    ),
                )

                if (data) {
                    data.forEach((element: any) => {
                        if (element.date) {
                            eventArray.push({
                                title:
                                    'Training Completed :' +
                                    element.trainingSummary,
                                start: new Date(element.date),
                                type: 'Completed Training',
                                other_info: element,
                            })
                        }
                    })

                    setEvents([...events, ...eventArray])
                    setEventsCopy([...eventsCopy, ...eventArray])
                }
            },
            onError: (error: any) => {
                console.error('queryTrainingList error', error)
            },
        })
    const loadTrainingList = async (
        startPage: number = 0,
        searchFilter: any = { ...filter },
    ) => {
        await queryTrainingList({
            variables: {},
        })
    }

    const [
        readTrainingSessionDues,
        { loading: readTrainingSessionDuesLoading },
    ] = useLazyQuery(READ_TRAINING_SESSION_DUES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            let eventArray: any[] = [] // Initialize eventArray as an empty array
            const data = response.readTrainingSessionDues.nodes
            if (data) {
                // Filter out crew members who are no longer assigned to the vessel.
                const filteredData = data.filter((item: any) =>
                    item.vessel.seaLogsMembers.nodes.some((m: any) => {
                        return m.id === item.memberID
                    }),
                )
                const dueWithStatus = filteredData.map((due: any) => {
                    return { ...due, status: GetTrainingSessionStatus(due) }
                })
                // Return only due within 7 days and overdue
                const filteredDueWithStatus = dueWithStatus.filter(
                    (item: any) => {
                        return (
                            item.status.isOverdue ||
                            (item.status.isOverdue === false &&
                                item.status.dueWithinSevenDays === true)
                        )
                    },
                )
                const groupedDues = filteredDueWithStatus.reduce(
                    (acc: any, due: any) => {
                        const key = `${due.vesselID}-${due.trainingTypeID}-${due.dueDate}`
                        if (!acc[key]) {
                            acc[key] = {
                                id: due.id,
                                vesselID: due.vesselID,
                                vessel: due.vessel,
                                trainingTypeID: due.trainingTypeID,
                                trainingType: due.trainingType,
                                dueDate: due.dueDate,
                                status: due.status,
                                members: [],
                            }
                        }
                        acc[key].members.push(due.member)
                        return acc
                    },
                    {},
                )

                const mergedDues = Object.values(groupedDues).map(
                    (group: any) => {
                        const mergedMembers = group.members.reduce(
                            (acc: any, member: any) => {
                                const existingMember = acc.find(
                                    (m: any) => m.id === member.id,
                                )
                                if (existingMember) {
                                    existingMember.firstName = member.firstName
                                    existingMember.surname = member.surname
                                } else {
                                    acc.push(member)
                                }
                                return acc
                            },
                            [],
                        )
                        return {
                            id: group.id,
                            vesselID: group.vesselID,
                            vessel: group.vessel,
                            trainingTypeID: group.trainingTypeID,
                            trainingType: group.trainingType,
                            status: group.status,
                            dueDate: group.dueDate,
                            members: mergedMembers,
                        }
                    },
                )
                mergedDues.forEach((element: any) => {
                    if (element.dueDate) {
                        eventArray.push({
                            title:
                                'Training Due :' + element.trainingType.title,
                            start: new Date(element.dueDate),
                            type: 'Training Due',
                            other_info: element,
                        })
                    }
                })
                if (data) {
                    setEvents([...events, ...eventArray])
                    setEventsCopy([...eventsCopy, ...eventArray])
                }
                // setTrainingSessionDues(mergedDues)
            }
        },
        onError: (error: any) => {
            console.error('readTrainingSessionDues error', error)
        },
    })
    const loadTrainingSessionDues = async (filter: any) => {
        const dueFilter: any = {}
        await readTrainingSessionDues({
            variables: {
                filter: dueFilter,
            },
        })
    }

    useEffect(() => {
        if (isLoading) {
            const f: { members?: any } = { ...filter }
            setFilter(f)
            loadTrainingSessionDues(f)
            loadTrainingList(0, f)
            queryLogBookEntries()
            setIsLoading(false)
        }
    }, [isLoading])

    const [queryLogBookEntries] = useLazyQuery(GET_ALL_LOGBOOK_ENTRIES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            let eventArray: any[] = [] // Initialize eventArray as an empty array
            const entries = response.readLogBookEntries.nodes
            entries.forEach((element: any) => {
                if (element.startDate) {
                    eventArray.push({
                        title: 'Log Book Entry',
                        start: new Date(element.startDate),
                        type: 'Log Book Entry',
                        other_info: element,
                    })
                }
            })
            if (entries) {
                setEvents([...events, ...eventArray])
                setEventsCopy([...eventsCopy, ...eventArray])
            }
        },
        onError: (error: any) => {
            console.error('queryLogBookEntries error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            setIsLoading(false)
        }
    }, [isLoading])

    const loadLogBookEntry = async (id: any) => {
        await queryLogBookEntry({
            variables: {
                logbookEntryId: +id,
            },
        })
    }
    const [queryLogBookEntry] = useLazyQuery(GET_LOGBOOK_ENTRY_BY_ID, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneLogBookEntry
            // console.log('data', data)
            if (data) {
                setLogBookEntry(data)
            }
        },
        onError: (error: any) => {
            console.error('queryLogBookEntry error', error)
        },
    })

    function renderEventContent(eventInfo: any) {
        return (
            <>
                <p
                    onClick={() => handleCalendarDataDialog(eventInfo)}
                    className="cursor-pointer text-xs truncate overflow-hidden">
                    <b>{eventInfo.event.title} </b>
                </p>
                {/* <i>{eventInfo.event.title}</i> */}
            </>
        )
    }
    const handleFilterOnChange = ({ type, data }: any) => {
        let searchFilter = { ...filter }

        if (type === 'Module') {
            if (data && data !== null && !isEmpty(data?.value)) {
                searchFilter.moduleName = data?.value
            } else {
                delete searchFilter.item
                searchFilter = {}
                setEvents(eventsCopy)
            }
        }

        if (type === 'vessel') {
            if (data) {
                searchFilter.vesselID = { eq: +data?.value }
            } else {
                delete searchFilter.vesselID
                setEvents(eventsCopy)
            }
        }
        if (type === 'member') {
            if (data) {
                searchFilter.assignedToID = { eq: +data.value }
            } else {
                delete searchFilter.assignedToID
                setEvents(eventsCopy)
            }
        }

        setFilter(searchFilter)
        applyFilterOptions(type, searchFilter)
    }

    const applyFilterOptions = (type: any, data: any) => {
        if (type === 'vessel' && data && data.vesselID && data.vesselID.eq) {
            const filteredData = events.filter(
                (item: any) =>
                    item?.other_info?.vessel?.id ===
                    data.vesselID.eq.toString(),
            )
            setEvents(filteredData)
        }
        if (type === 'Module' && data !== null && data && data.moduleName) {
            const filteredData = events.filter(
                (item: any) => item.type === data.moduleName,
            )
            setEvents(filteredData)
        }
        if (type === 'member' && data !== null && data && data.assignedToID) {
            const filteredData = events.filter((item: any) => {
                if (
                    item &&
                    item.other_info &&
                    item.other_info.members &&
                    item.other_info.members.nodes &&
                    item.other_info.members.nodes.length > 0
                ) {
                    return item.other_info.members.nodes.some(
                        (element: any) => {
                            // console.log(
                            //     element.id,
                            //     data.assignedToID.eq.toString(),
                            //     element.id === data.assignedToID.eq.toString(),
                            // )
                            return (
                                element.id === data.assignedToID.eq.toString()
                            )
                        },
                    )
                } else {
                    return false // Include items with no 'other_info' or 'members' or 'nodes' as they don't meet the condition
                }
            })

            setEvents(filteredData)
        }
    }

    const handleSetVessels = (vessels: any) => {
        const activeVessels = vessels.filter((vessel: any) => !vessel.archived)
        setVesselList(activeVessels)
    }

    getVesselList(handleSetVessels)

    const [queryCrewMembers, { loading: queryCrewMembersLoading }] =
        useLazyQuery(CREW_LIST, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (queryCrewMembersResponse: any) => {
                handleSetCrewMembers(
                    queryCrewMembersResponse.readSeaLogsMembers.nodes,
                )
                setPageInfo(
                    queryCrewMembersResponse.readSeaLogsMembers.pageInfo,
                )
                return queryCrewMembersResponse.readSeaLogsMembers.nodes
            },
            onError: (error: any) => {
                console.error('queryCrewMembers error', error)
            },
        })

    const handleSetCrewMembers = (crewMembers: any) => {
        const transformedCrewList = GetCrewListWithTrainingStatus(
            crewMembers,
            vesselList,
        )
        setCrewList(transformedCrewList)
    }

    const loadCrewMembers = async (
        startPage: number = 0,
        searchFilter: any = { ...filter },
    ) => {
        const updatedFilter: SearchFilter = {
            ...searchFilter,
            archived: { eq: false },
        }

        await queryCrewMembers({
            variables: {
                limit: limit,
                offset: startPage * limit,
                filter: updatedFilter,
            },
        })
    }

    useEffect(() => {
        loadCrewMembers(0, filter)
    }, [])

    useEffect(() => {
        loadInventories()
    }, [])
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
    const loadInventories = async (searchFilter: SearchFilter = {}) => {
        await queryInventories({
            variables: {
                filter: searchFilter,
            },
        })
    }

    useEffect(() => {
        setVessel(
            vesselList.find(
                (vessel: any) => vessel?.id === logBookEntry?.vehicle?.id,
            ),
        )
    }, [logBookEntry, popupDate])

    useEffect(() => {
        setInventory(
            inventories.find(
                (int: any) =>
                    int?.id ===
                    popupDate?.event?._def?.extendedProps?.other_info
                        ?.inventoryID,
            ),
        )
    }, [popupDate])

    return (
        <div>
            {isDashboard === false ? (
                <Filter onChange={handleFilterOnChange} />
            ) : (
                <></>
            )}

            <FullCalendar
                plugins={[dayGridPlugin, listPlugin]}
                initialView={initialView}
                weekends={false}
                events={events}
                eventContent={renderEventContent}
                height="auto"
                contentHeight={500}
            />

            <AlertDialog
                openDialog={openCalendarDataDialog}
                setOpenDialog={setopenCalendarDataDialog}
                handleCreate={handleCalendarDataDialog}>
                <div className="rounded-t-lg p-2">
                    {popupDate?.event?._def?.extendedProps?.type === 'Task' ? (
                        <>
                            <h1 className="p-4">
                                <b>Task : </b>
                                {
                                    popupDate?.event?._def?.extendedProps
                                        ?.other_info?.name
                                }
                            </h1>
                            <p className="p-4 text-sm">
                                <b>Due date : </b>
                                {formatDate(
                                    popupDate?.event?._def?.extendedProps
                                        ?.other_info?.expires,
                                )}
                            </p>
                            <p className="p-4 text-sm">
                                <b>Assigned by : </b>
                                {crewList.find(
                                    (crew: any) =>
                                        crew.id ===
                                        popupDate?.event?._def?.extendedProps
                                            ?.other_info?.assignedByID,
                                )?.firstName || 'Unknown'}
                            </p>
                            <p className="p-4 text-sm">
                                <b>Assigned to : </b>
                                {crewList.find(
                                    (crew: any) =>
                                        crew.id ===
                                        popupDate?.event?._def?.extendedProps
                                            ?.other_info?.assignedToID,
                                )?.firstName || 'Unknown'}
                            </p>
                            <p className="p-4 text-sm">
                                <b>Inventory item : </b>
                                {inventory ? inventory.item : 'Item'}
                            </p>
                            <p className="p-4 text-sm">
                                <b>Vessel : </b>
                                {
                                    popupDate?.event?._def?.extendedProps
                                        ?.other_info?.basicComponent?.title
                                }
                            </p>
                            {popupDate?.event?._def?.extendedProps?.other_info
                                ?.comments !==
                            '<p>This is the description of the task</p>' ? (
                                <p className="p-4 text-sm">
                                    <b>Comment : </b>
                                    {
                                        popupDate?.event?._def?.extendedProps
                                            ?.other_info?.comments
                                    }
                                </p>
                            ) : (
                                <></>
                            )}
                            <p className="p-4 text-sm">
                                <b>Severity : </b>
                                {
                                    popupDate?.event?._def?.extendedProps
                                        ?.other_info?.severity
                                }
                            </p>
                        </>
                    ) : (
                        <></>
                    )}

                    {popupDate?.event?._def?.extendedProps?.type ===
                    'Completed Training' ? (
                        <>
                            <p className="p-4 text-sm">
                                <b>Training Summary : </b>
                                {
                                    popupDate?.event?._def?.extendedProps
                                        ?.other_info?.trainingSummary
                                }
                            </p>
                            <p className="p-4 text-sm">
                                <b>Trainer : </b>
                                {
                                    popupDate?.event?._def?.extendedProps
                                        ?.other_info?.trainer?.firstName
                                }{' '}
                                {
                                    popupDate?.event?._def?.extendedProps
                                        ?.other_info?.trainer?.surname
                                }
                            </p>
                            <p className="p-4 text-sm">
                                <b>Members : </b>
                                {logBookEntry?.vehicle?.seaLogsMembers?.nodes?.map(
                                    (member: any) => {
                                        return (
                                            <span key={member.id}>
                                                {' '}
                                                {member.firstName}{' '}
                                                {member.surname},{' '}
                                            </span>
                                        )
                                    },
                                )}
                            </p>
                            <p className="p-4 text-sm">
                                <b>Training Types : </b>
                                {popupDate?.event?._def?.extendedProps?.other_info?.trainingTypes?.nodes?.map(
                                    (types: any) => {
                                        return (
                                            <span key={types.id}>
                                                {' '}
                                                {types.title}
                                                {', '}
                                            </span>
                                        )
                                    },
                                )}
                            </p>
                            <p className="p-4 text-sm">
                                <b>Completed Date : </b>
                                {formatDate(
                                    popupDate?.event?._def?.extendedProps
                                        ?.other_info?.date,
                                )}
                            </p>
                            <p className="p-4 text-sm">
                                <b>Vessel : </b>
                                {
                                    popupDate?.event?._def?.extendedProps
                                        ?.other_info?.vessel?.title
                                }
                            </p>
                        </>
                    ) : (
                        <></>
                    )}
                    {popupDate?.event?._def?.extendedProps?.type ===
                    'Training Due' ? (
                        <>
                            <p className="p-4 text-sm">
                                <b>Training Summary : </b>
                                {
                                    popupDate?.event?._def?.extendedProps
                                        ?.other_info?.trainingType?.title
                                }
                            </p>
                            <p className="p-4 text-sm">
                                <b>Trainer : </b>
                                {
                                    popupDate?.event?._def?.extendedProps
                                        ?.other_info?.trainer?.firstName
                                }{' '}
                                {
                                    popupDate?.event?._def?.extendedProps
                                        ?.other_info?.trainer?.surname
                                }
                            </p>
                            <p className="p-4 text-sm">
                                <b>Members : </b>
                                {logBookEntry?.vehicle?.seaLogsMembers?.nodes?.map(
                                    (member: any) => {
                                        return (
                                            <span key={member.id}>
                                                {' '}
                                                {member.firstName}{' '}
                                                {member.surname},{' '}
                                            </span>
                                        )
                                    },
                                )}
                            </p>
                            <p className="p-4 text-sm">
                                <b>Training Types : </b>
                                {popupDate?.event?._def?.extendedProps?.other_info?.trainingTypes?.nodes?.map(
                                    (types: any) => {
                                        return (
                                            <span key={types.id}>
                                                {' '}
                                                {types.title}
                                                {', '}
                                            </span>
                                        )
                                    },
                                )}
                            </p>
                            <p className="p-4 text-sm">
                                <b>Due Date : </b>
                                {formatDate(
                                    popupDate?.event?._def?.extendedProps
                                        ?.other_info?.dueDate,
                                )}
                            </p>
                            <p className="p-4 text-sm">
                                <b>Vessel : </b>
                                {
                                    popupDate?.event?._def?.extendedProps
                                        ?.other_info?.vessel?.title
                                }
                            </p>
                        </>
                    ) : (
                        <></>
                    )}
                    {popupDate?.event?._def?.extendedProps?.type ===
                    'Log Book Entry' ? (
                        <>
                            <p className="p-4 text-sm">
                                <b>Members : </b>
                                {logBookEntry?.vehicle?.seaLogsMembers?.nodes?.map(
                                    (member: any) => {
                                        return (
                                            <span key={member.id}>
                                                {' '}
                                                {member.firstName}{' '}
                                                {member.surname},{' '}
                                            </span>
                                        )
                                    },
                                )}
                            </p>
                            <p className="p-4 text-sm">
                                <b>Date : </b>
                                {formatDate(
                                    popupDate?.event?._def?.extendedProps
                                        ?.other_info?.startDate,
                                )}
                            </p>
                            <p className="p-4 text-sm">
                                <b>Created by : </b>
                                {crewList.find(
                                    (crew: any) =>
                                        crew.id ===
                                        popupDate?.event?._def?.extendedProps
                                            ?.other_info?.createdByID,
                                )?.firstName || 'Unknown'}{' '}
                                {
                                    crewList.find(
                                        (crew: any) =>
                                            crew.id ===
                                            popupDate?.event?._def
                                                ?.extendedProps?.other_info
                                                ?.createdByID,
                                    )?.surname
                                }
                            </p>
                            <p className="p-4 text-sm">
                                <b>Vessel : </b>
                                {vessel?.title || 'No Vessel'}
                            </p>
                            <p className="p-4 text-sm">
                                <b>Logbook Section : </b>
                                {logBookEntry?.logBook?.title}
                            </p>
                            <p className="p-4 text-sm">
                                <b>Master : </b>
                                {logBookEntry?.master?.firstName}{' '}
                                {logBookEntry?.master?.surname}
                            </p>
                        </>
                    ) : (
                        <></>
                    )}

                    <button
                        type="button"
                        className={`mr-2 text-sm font-semibold text-slblue-100 bg-slblue-800 border px-4 py-2 rounded-md shadow-sm ring-inset ring-slblue-1000 hover:ring-slblue-1000 hover:bg-slblue-1000 hover:text-white mt-4`}
                        onClick={() => setopenCalendarDataDialog(false)}>
                        Cancel
                    </button>
                    {popupDate?.event?._def?.extendedProps?.type === 'Task' ? (
                        <Link
                            href={`/maintenance?taskID=${popupDate?.event?._def?.extendedProps?.other_info?.id}`}>
                            <Button
                                className={`text-sm font-semibold text-slblue-800 bg-white border px-4 py-2 rounded-md shadow-sm ring-inset ring-slblue-1000 hover:ring-slblue-1000 hover:bg-slblue-1000 hover:text-white mt-4`}>
                                Open Task
                            </Button>
                        </Link>
                    ) : (
                        <></>
                    )}
                    {popupDate?.event?._def?.extendedProps?.type ===
                        'Completed Training' ||
                    popupDate?.event?._def?.extendedProps?.type ===
                        'Training Due' ? (
                        <Link
                            href={`/crew-training/info?id=${popupDate?.event?._def?.extendedProps?.other_info?.id}`}>
                            <Button
                                className={`text-sm font-semibold text-slblue-800 bg-white border px-4 py-2 rounded-md shadow-sm ring-inset ring-slblue-1000 hover:ring-slblue-1000 hover:bg-slblue-1000 hover:text-white mt-4`}>
                                Open Training
                            </Button>
                        </Link>
                    ) : (
                        <></>
                    )}
                    {popupDate?.event?._def?.extendedProps?.type ===
                        'Log Book Entry' && vessel ? (
                        <Link
                            href={`/log-entries/view?vesselID=${logBookEntry?.vehicle?.id}&logentryID=${logBookEntry?.id}`}>
                            <Button
                                className={`text-sm font-semibold text-slblue-800 bg-white border px-4 py-2 rounded-md shadow-sm ring-inset ring-slblue-1000 hover:ring-slblue-1000 hover:bg-slblue-1000 hover:text-white mt-4`}>
                                Open Log Book
                            </Button>
                        </Link>
                    ) : (
                        <></>
                    )}
                </div>
            </AlertDialog>
        </div>
    )
}
