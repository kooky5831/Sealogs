'use client'
import React, { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Button, DialogTrigger, Heading, Popover } from 'react-aria-components'
import { List } from '@/app/ui/skeletons'
import {
    PopoverWrapper,
    TableWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import Link from 'next/link'
import dayjs from 'dayjs'
import Filter from '@/app/components/Filter'
import { isEmpty, set, trim } from 'lodash'
import {
    GET_SEA_TIME_REPORT,
    GET_LOGBOOKENTRY,
    CrewMembers_LogBookEntrySection,
    GET_LOGBOOK_ENTRY_BY_ID,
} from '@/app/lib/graphQL/query'
import {
    getVesselList,
    getSeaLogsMembers,
    getComponentMaintenanceCheckByMemberId,
    isOverDueTask,
    getCrewMembersLogBookEntrySections,
    GetCrewListWithTrainingStatus,
    upcomingScheduleDate,
    userHasRescueVessel,
} from '@/app/lib/actions'
interface DateRange {
    startDate: Date | null
    endDate: Date | null
}
interface LogBookEntry {
    logBookEntryLoggers: {
        id: string
    }
}

export default function TaskList() {
    const [filter, setFilter] = useState({} as SearchFilter)
    const [vessel, setVessel] = useState([] as any)
    const [member, setMember] = useState([] as any)
    const [logBookEntries, setLogBookEntries] = useState([])
    const [dataForSingleMember, setDataForSingleMember] = useState([])
    const [reportArray, setReportArray] = useState([] as any)
    const [rescueVessel, setHasRescueVessel] = useState(false)
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: null,
        endDate: null,
    })
    const [SeaTimeReport, setSeaTimeReport] = useState(null)
    const handleFilterOnChange = ({ type, data }: any) => {
        const searchFilter: SearchFilter = { ...filter }
        if (type === 'vessel') {
            if (data) {
                if (typeof data === 'object' && !Array.isArray(data)) {
                    setVessel([data]) // Convert object to array
                } else if (Array.isArray(data)) {
                    setVessel(data) // Data is already an array
                } else {
                    // Handle case where data is neither an object nor an array (optional)
                    console.error('Invalid data type for vessel:', data)
                }
            }
        }

        if (type === 'member') {
            if (data) {
                console.log('member::', member)
                if (typeof data === 'object' && !Array.isArray(data)) {
                    setMember([data]) // Convert object to array
                } else if (Array.isArray(data)) {
                    setMember(data) // Data is already an array
                } else {
                    // Handle case where data is neither an object nor an array (optional)
                    console.error('Invalid data type for member:', data)
                }
            }
        }
        if (type === 'dateRange') {
            if (data.startDate && data.endDate) {
                setDateRange(data)
            } else {
                delete searchFilter.expires
            }
        }
        setFilter(searchFilter)
    }

    userHasRescueVessel(setHasRescueVessel)

    const generateReport = async () => {
        setReportArray([])
        try {
            if (vessel.length > 1 && member.length === 1) {
                console.log('generateReporghgft1:::')
                for (const element of vessel) {
                    const searchFilter: SearchFilter = {}
                    searchFilter.crewMemberID = { eq: member[0]['value'] }
                    await queryLogBookEntrySections({
                        variables: {
                            filter: searchFilter,
                        },
                    })
                }
            } else if (vessel.length === 1 && member.length === 1) {
                console.log('generateReporghgft2:::')

                const searchFilter: SearchFilter = {}
                searchFilter.crewMemberID = { eq: member[0]['value'] }
                await queryLogBookEntrySections({
                    variables: {
                        filter: searchFilter,
                    },
                })
            } else if (vessel.length === 1 && member.length > 1) {
                console.log('generateReport:::', member)
                for (const element of member) {
                    const searchFilter: SearchFilter = {}
                    searchFilter.crewMemberID = { eq: element['value'] }
                    await queryLogBookEntrySections({
                        variables: {
                            filter: searchFilter,
                        },
                    })
                }
            } else {
                console.log('generateReporghgftelse::', vessel, member)
            }
        } catch (error) {
            console.error('generateReport error', error)
        }
    }

    const [queryLogBookEntrySections] = useLazyQuery(
        CrewMembers_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readCrewMembers_LogBookEntrySections.nodes
                setDataForSingleMember(data)
            },
            onError: (error: any) => {
                console.error('queryLogBookEntrySections error', error)
            },
        },
    )

    useEffect(() => {
        if (vessel.length > 1 && member.length === 1) {
            const reportArrays: any[] = []

            for (const elim of vessel) {
                const filterData = async () => {
                    if (member.length === 0) {
                        return false
                    }
                    const result: any[] = []
                    await dataForSingleMember.forEach((element: any) => {
                        console.log('vessel::', vessel)
                        if (element.logBookEntry.vehicle.id === elim['value']) {
                            result.push(element)
                        }
                    })

                    const finalresult = calculateLoggedHours(result, dateRange)
                    console.log('member::', member)

                    const data = {
                        crew_member_name: member[0]['label'],
                        vessel_name: elim['label'],
                        logged_in_hours: finalresult,
                    }

                    reportArrays.push(data)
                    setReportArray([reportArray, ...reportArrays])
                }
                filterData()
            }
        } else if (vessel.length === 1 && member.length === 1) {
            const filterData = async () => {
                if (member.length === 0) {
                    return false
                }
                const reportArrays: any[] = []
                const result: any[] = []
                await dataForSingleMember.forEach((element: any) => {
                    console.log('vessel::', vessel)
                    if (
                        element.logBookEntry.vehicle.id === vessel[0]['value']
                    ) {
                        result.push(element)
                    }
                })

                const finalresult = calculateLoggedHours(result, dateRange)
                console.log('member::', member)

                const data = {
                    crew_member_name: member[0]['label'],
                    vessel_name: vessel[0]['label'],
                    logged_in_hours: finalresult,
                }

                reportArrays.push(data)
                console.log('reportArrays::', reportArrays)
                setReportArray(reportArrays)
            }
            filterData()
        } else if (vessel.length === 1 && member.length > 1) {
            const filterData = async () => {
                if (member.length === 0) {
                    return false
                }
                const reportArrays: any[] = []
                const result: any[] = []
                console.log('dataForSingleMember::', dataForSingleMember)
                await dataForSingleMember.forEach((element: any) => {
                    console.log('vessel::', vessel)
                    if (
                        element.logBookEntry.vehicle.id === vessel[0]['value']
                    ) {
                        result.push(element)
                    }
                })

                const finalresult = calculateLoggedHours(result, dateRange)
                if (dataForSingleMember.length === 0) {
                    return false
                }
                const data = {
                    crew_member_name:
                        dataForSingleMember[0]['crewMember']['firstName'] +
                        ' ' +
                        dataForSingleMember[0]['crewMember']['surname'],
                    vessel_name: vessel[0]['label'],
                    logged_in_hours: finalresult,
                }

                reportArrays.push(data)
                console.log('reportArrays::', reportArrays)
                setReportArray([...reportArray, ...reportArrays])
            }
            filterData()
        }
    }, [dataForSingleMember])

    const calculateLoggedHours = (records: any, range: any) => {
        const { startDate, endDate } = range
        const start = new Date(startDate).getTime()
        const end = new Date(endDate).getTime()

        const totalMilliseconds = records
            .filter((record: any) => {
                const punchInTime = new Date(record.punchIn).getTime()
                const punchOutTime = new Date(record.punchOut).getTime()
                return (
                    punchInTime >= start &&
                    punchInTime <= end &&
                    punchOutTime >= start &&
                    punchOutTime <= end
                )
            })
            .reduce((totalMs: any, record: any) => {
                const punchInTime = new Date(record.punchIn).getTime()
                const punchOutTime = new Date(record.punchOut).getTime()
                return totalMs + (punchOutTime - punchInTime)
            }, 0)

        const totalMinutes = Math.floor(totalMilliseconds / (1000 * 60))
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60

        return { hours, minutes }
    }

    useEffect(() => {
        console.log('reportArray', reportArray)
    }, [reportArray])
    return (
        <div className="w-full p-0 dark:text-white">
            <div className="flex justify-between pb-4 pt-3 items-center">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    Report
                </Heading>
                {rescueVessel && (
                    <div className="flex-col">
                        <div className="flex">
                            <SeaLogsButton
                                text="Fuel analysis report"
                                type="secondary"
                                color="sky"
                                icon="check"
                                link="/reporting/fuel-analysis"
                            />
                            <SeaLogsButton
                                text="Fuel Tasking analysis report"
                                type="secondary"
                                color="sky"
                                icon="check"
                                link="/reporting/fuel-tasking-analysis"
                            />
                        </div>
                        <div className="flex">
                            <SeaLogsButton
                                text="Fuel summary report"
                                type="secondary"
                                color="sky"
                                icon="check"
                                link="/reporting/fuel-summary-report"
                            />
                            <SeaLogsButton
                                text="Detailed fuel report"
                                type="secondary"
                                color="sky"
                                icon="check"
                                link="/reporting/detailed-fuel-report"
                            />
                        </div>
                    </div>
                )}
            </div>
            <Filter
                onChange={handleFilterOnChange}
                onClick={generateReport}
                crewData={member}
                vesselData={vessel}
            />
            <div className="p-0 pt-5">
                <div className="flex w-full text-left justify-start flex-col md:flex-row items-start">
                    {reportArray && reportArray.length ? (
                        <Table reportArray={reportArray} />
                    ) : (
                        <div className="flex text-left items-center h-96">
                            <div className="flex flex-col items-center">
                                <div className="text-2xl font-light dark:text-white">
                                    No data available
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export const Table = ({ reportArray }: any) => {
    return (
        <TableWrapper headings={['Name:firstHead', 'Vessel:left', 'Time:left']}>
            {reportArray?.map((element: any, index: any) => (
                <tr
                    key={element.id}
                    className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-gray-600`}>
                    <td className="px-2 py-3 dark:text-white text-left">
                        <div className="text-xs inline-block ml-3">
                            {element.crew_member_name}
                        </div>
                    </td>
                    <td className="px-2 py-3 dark:text-white text-left">
                        <div className="text-xs inline-block ">
                            {element.vessel_name}
                        </div>
                    </td>
                    <td className="px-2 py-3 dark:text-white text-left">
                        <div className="text-xs inline-block ">
                            {element.logged_in_hours?.hours}h{' '}
                            {element.logged_in_hours?.minutes}m
                        </div>
                    </td>
                </tr>
            ))}
        </TableWrapper>
    )
}
