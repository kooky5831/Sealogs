'use client'

import { SeaLogsButton, TableWrapper } from '@/app/components/Components'
import Filter from '@/app/components/Filter'
import { formatDate } from '@/app/helpers/dateHelper'
import { userHasRescueVessel } from '@/app/lib/actions'
import {
    GetTripIdsByVesselID,
    TripReport_LogBookEntrySection_Brief,
} from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { max } from 'lodash'
import { useEffect, useState } from 'react'
import { Heading } from 'react-aria-components'

export default function FuelTaskingAnalysis() {
    const [vesselID, setVesselID] = useState('')
    const [dateRange, setDateRange] = useState<any>(false)
    const [hasRescueVessel, setHasRescueVessel] = useState(false)
    const [fuelReport, setFuelReport] = useState([])

    const handleFilterChange = (filters: any) => {
        if (filters.type === 'vessel' && filters.data?.value) {
            setVesselID(filters.data?.value)
        }
        if (filters.type === 'dateRange') {
            setDateRange(filters.data)
        }
    }

    useEffect(() => {
        if (vesselID) {
            loadTripIdsByVesselID({
                variables: {
                    id: vesselID,
                },
            })
        }
    }, [vesselID])

    const [loadTripIdsByVesselID] = useLazyQuery(GetTripIdsByVesselID, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            var tripIds: string[] = []
            const data = response.readOneVessel.logBookEntries.nodes?.map(
                (entry: any) =>
                    entry.logBookEntrySections.nodes?.map((section: any) => {
                        tripIds.push(section.id)
                    }),
            )
            getSectionTripReport_LogBookEntrySection({
                variables: {
                    id: tripIds,
                },
            })
        },
        onError: (error) => {
            console.error(error)
        },
    })

    const findCGNZConsumption = (cgopTasking: any, taskingStart: any) => {
        var fuelConsumed = +taskingStart.eventType_Tasking.fuelLevel
        const tasking = cgopTasking.filter(
            (event: any) =>
                event.eventType_Tasking.cgop > 0 ||
                event.eventType_Tasking.type == 'TaskingPaused' ||
                event.eventType_Tasking.type == 'TaskingResumed',
        )
        const pausedTask = tasking.filter(
            (event: any) =>
                event.eventType_Tasking.pausedTaskID ==
                    taskingStart.eventType_TaskingID &&
                event.eventType_Tasking.type == 'TaskingPaused',
        )
        const resumedTask = tasking.filter(
            (event: any) =>
                event.eventType_Tasking.openTaskID ==
                    taskingStart.eventType_TaskingID &&
                event.eventType_Tasking.type == 'TaskingResumed',
        )
        const completedTask = tasking.filter(
            (event: any) =>
                (event.eventType_Tasking.groupID ==
                    taskingStart.eventType_TaskingID ||
                    event.eventType_Tasking.completedTaskID ==
                        taskingStart.eventType_TaskingID) &&
                event.eventType_Tasking.type == 'TaskingComplete',
        )
        if (pausedTask.length > 0) {
            pausedTask.forEach((event: any) => {
                fuelConsumed -= +event.eventType_Tasking.fuelLevel
            })
        }
        if (resumedTask.length > 0) {
            resumedTask.forEach((event: any) => {
                fuelConsumed += +event.eventType_Tasking.fuelLevel
            })
        }
        if (completedTask.length > 0) {
            fuelConsumed -= +completedTask[0].eventType_Tasking.fuelLevel
        } else {
            if (pausedTask.length > 0) {
                const lastPausedTask = pausedTask[pausedTask.length - 1]
                fuelConsumed -= +lastPausedTask.eventType_Tasking.fuelLevel
            } else {
                fuelConsumed = 0
            }
        }
        return fuelConsumed < 0 ? 0 : fuelConsumed
    }

    const findsaropConsumption = (cgopTasking: any, taskingStart: any) => {
        var fuelConsumed = +taskingStart.eventType_Tasking.fuelLevel
        const tasking = cgopTasking.filter(
            (event: any) =>
                event.eventType_Tasking.sarop > 0 ||
                event.eventType_Tasking.type == 'TaskingPaused' ||
                event.eventType_Tasking.type == 'TaskingResumed',
        )
        const pausedTask = tasking.filter(
            (event: any) =>
                event.eventType_Tasking.pausedTaskID ==
                    taskingStart.eventType_TaskingID &&
                event.eventType_Tasking.type == 'TaskingPaused',
        )
        const resumedTask = tasking.filter(
            (event: any) =>
                event.eventType_Tasking.openTaskID ==
                    taskingStart.eventType_TaskingID &&
                event.eventType_Tasking.type == 'TaskingResumed',
        )
        const completedTask = tasking.filter(
            (event: any) =>
                (event.eventType_Tasking.groupID ==
                    taskingStart.eventType_TaskingID ||
                    event.eventType_Tasking.completedTaskID ==
                        taskingStart.eventType_TaskingID) &&
                event.eventType_Tasking.type == 'TaskingComplete',
        )
        if (pausedTask.length > 0) {
            pausedTask.forEach((event: any) => {
                fuelConsumed -= +event.eventType_Tasking.fuelLevel
            })
        }
        if (resumedTask.length > 0) {
            resumedTask.forEach((event: any) => {
                fuelConsumed += +event.eventType_Tasking.fuelLevel
            })
        }
        if (completedTask.length > 0) {
            fuelConsumed -= +completedTask[0].eventType_Tasking.fuelLevel
        } else {
            if (pausedTask.length > 0) {
                const lastPausedTask = pausedTask[pausedTask.length - 1]
                fuelConsumed -= +lastPausedTask.eventType_Tasking.fuelLevel
            } else {
                fuelConsumed = 0
            }
        }
        return fuelConsumed < 0 ? 0 : fuelConsumed
    }

    const [getSectionTripReport_LogBookEntrySection] = useLazyQuery(
        TripReport_LogBookEntrySection_Brief,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readTripReport_LogBookEntrySections.nodes
                var fuelReport: any = []
                data.forEach((entry: any) => {
                    var fuelLevel = 0
                    const tasking = entry.tripEvents.nodes.filter(
                        (event: any) =>
                            event.eventCategory === 'Tasking' &&
                            event.eventType_Tasking.type !==
                                'TaskingStartUnderway',
                    )
                    const taskingStart = entry.tripEvents.nodes.filter(
                        (event: any) =>
                            event.eventCategory === 'Tasking' &&
                            event.eventType_Tasking.type ===
                                'TaskingStartUnderway',
                    )
                    taskingStart.forEach((event: any) => {
                        if (event.eventCategory === 'Tasking') {
                            // fuelLevel =
                            //     event.eventType_Tasking.fuelLevel != 0
                            //         ? event.eventType_Tasking.fuelLevel
                            //         : fuelLevel
                            // findCGNZConsumption(tasking, event)
                            fuelReport.push({
                                id: event.id,
                                fuelUsedCGNZ: findCGNZConsumption(
                                    tasking,
                                    event,
                                ),
                                fuelUsedSAROP: findsaropConsumption(
                                    tasking,
                                    event,
                                ),
                                incidentNumber:
                                    +event.eventType_Tasking?.cgop > 0
                                        ? 'CGOP: ' +
                                          event.eventType_Tasking.cgop
                                        : event.eventType_Tasking?.sarop > 0
                                          ? 'SAROP: ' +
                                            event.eventType_Tasking.sarop
                                          : '-',
                                fromLocation: entry.fromLocation,
                                toLocation: entry.toLocation,
                                arrivalTime: entry.arriveTime,
                                departureTime: entry.departTime,
                                created: entry.created,
                            })
                        }
                    })
                })
                setFuelReport(fuelReport)
            },
            onError: (error: any) => {
                console.error('TripReport_LogBookEntrySection error', error)
            },
        },
    )

    const filterByDate = (entry: any) => {
        if (dateRange) {
            return (
                dayjs(entry.created).isAfter(dayjs(dateRange.startDate)) &&
                dayjs(entry.created).isBefore(dayjs(dateRange.endDate))
            )
        }
        return true
    }

    userHasRescueVessel(setHasRescueVessel)

    return (
        <div className="w-full p-0 dark:text-white">
            {hasRescueVessel ? (
                <>
                    <div className="flex justify-between pb-4 pt-3 items-center">
                        <Heading className="font-light font-monasans text-3xl dark:text-white">
                            Fuel Tasking Analysis
                        </Heading>
                        <div className="flex">
                            <SeaLogsButton
                                text="Back"
                                type="text"
                                link="/reporting"
                            />
                            <SeaLogsButton
                                text="Fuel analysis report"
                                type="secondary"
                                color="sky"
                                icon="check"
                                link="/reporting/fuel-analysis"
                            />
                        </div>
                    </div>
                    <Filter onChange={handleFilterChange} />
                    {fuelReport.length > 0 && (
                        <TableWrapper
                            headings={[
                                'Date:firstHead',
                                'Tasking incedent/Police number',
                                'Tasking start',
                                'Tasking end',
                                'Fuel used CGNZ',
                                'Fuel used SAROP:last',
                            ]}>
                            {fuelReport
                                .filter((entry: any) => filterByDate(entry))
                                .map((entry: any) => (
                                    <tr
                                        key={entry.id}
                                        className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                        <td className="px-2 py-3 lg:px-6 text-left">
                                            {formatDate(entry.created)}
                                        </td>
                                        <td className="px-2 py-3 lg:px-6">
                                            {entry.incidentNumber}
                                        </td>
                                        <td className="px-2 py-3 lg:px-6">
                                            {entry.fromLocation?.title
                                                ? entry.fromLocation.title +
                                                  ' - '
                                                : ''}
                                            {entry.departureTime}
                                        </td>
                                        <td className="px-2 py-3 lg:px-6">
                                            {entry.toLocation?.title
                                                ? entry.toLocation.title + ' - '
                                                : ''}
                                            {entry.arrivalTime}
                                        </td>
                                        <td className="px-2 py-3 lg:px-6">
                                            {entry.fuelUsedCGNZ}
                                        </td>
                                        <td className="px-2 py-3 lg:px-6">
                                            {entry.fuelUsedSAROP}
                                        </td>
                                    </tr>
                                ))}
                        </TableWrapper>
                    )}
                </>
            ) : (
                <></>
            )}
        </div>
    )
}
