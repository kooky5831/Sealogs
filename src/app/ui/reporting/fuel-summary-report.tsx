'use client'

import { SeaLogsButton, TableWrapper } from '@/app/components/Components'
import Filter from '@/app/components/Filter'
import { formatDate } from '@/app/helpers/dateHelper'
// import { userHasRescueVessel } from '@/app/lib/actions'
import {
    GetTripIdsByVesselID,
    TripReport_LogBookEntrySection_Brief,
} from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Heading } from 'react-aria-components'

export default function FuelSummaryReport() {
    const [vesselID, setVesselID] = useState('')
    const [dateRange, setDateRange] = useState<any>(false)
    // const [hasRescueVessel, setHasRescueVessel] = useState(false)
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
        onCompleted: (response) => {
            var tripIds: string[] = []
            const data = response.readOneVessel.logBookEntries.nodes?.map(
                (entry: any) =>
                    entry.logBookEntrySections.nodes?.map((section: any) => {
                        tripIds.push(section.id)
                    }),
            )
            getTripSections({
                variables: {
                    id: tripIds,
                },
            })
        },
        onError: (error) => {
            console.error(error)
        },
    })

    const [getTripSections] = useLazyQuery(
        TripReport_LogBookEntrySection_Brief,
        {
            onCompleted: (response: any) => {
                const data = response.readTripReport_LogBookEntrySections.nodes
                var fuelReport: any = []
                data.forEach((entry: any) => {
                    var fuelReportEvent: any = []
                    entry.tripEvents.nodes.forEach((event: any) => {
                        if (event.eventCategory === 'PassengerDropFacility') {
                            event.eventType_PassengerDropFacility.fuelLog.nodes
                                .length > 0 &&
                                fuelReportEvent.push({
                                    id: entry.id,
                                    fuelLog:
                                        event.eventType_PassengerDropFacility
                                            .fuelLog.nodes,
                                    created: entry.created,
                                    category: event.eventCategory,
                                })
                        }
                        if (event.eventCategory === 'Tasking') {
                            event.eventType_Tasking.fuelLog.nodes.length > 0 &&
                                fuelReportEvent.push({
                                    id: entry.id,
                                    fuelLog:
                                        event.eventType_Tasking.fuelLog.nodes,
                                    created: entry.created,
                                    category: event.eventCategory,
                                })
                        }
                        if (event.eventCategory === 'RefuellingBunkering') {
                            event.eventType_RefuellingBunkering.fuelLog.nodes
                                .length > 0 &&
                                fuelReportEvent.push({
                                    id: entry.id,
                                    fuelLog:
                                        event.eventType_RefuellingBunkering
                                            .fuelLog.nodes,
                                    created: entry.created,
                                    category: event.eventCategory,
                                })
                        }
                    })
                    fuelReportEvent.length > 0 &&
                        fuelReport.push({
                            id: entry.id,
                            fuelLog: fuelReportEvent,
                            created: entry.created,
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

    // userHasRescueVessel(setHasRescueVessel)

    const getEntryStart = (entry: any, title: any) => {
        return entry.fuelLog[0].fuelLog.filter(
            (log: any) => title === log.fuelTank.title,
        )[0].fuelBefore
    }

    const getEntryAdded = (entry: any, title: any) => {
        return entry.fuelLog.reduce(
            (sum: number, event: any) =>
                sum +
                event.fuelLog
                    .filter((log: any) => log.fuelTank.title === title)
                    .reduce(
                        (total: number, log: any) => total + log.fuelAdded,
                        0,
                    ),
            0,
        )
    }

    const getEntryAfter = (entry: any, title: any) => {
        return entry.fuelLog[entry.fuelLog.length - 1].fuelLog.filter(
            (log: any) => title === log.fuelTank.title,
        )[0].fuelAfter
    }

    const isFuelTankDormant = (entry: any, title: any) => {
        // return false // uncomment this line to display unused fuel tanks too.

        return (
            getEntryStart(entry, title) === getEntryAfter(entry, title) &&
            getEntryAdded(entry, title) === 0
        )
    }

    const getFuelTable = (entry: any) => {
        return (
            <TableWrapper
                headClasses="!bg-slblue-100 !text-sldarkblue-1000"
                headings={['', 'Start', 'Added', 'End']}>
                {Array.from(
                    new Set(
                        entry.fuelLog.flatMap((log: any) =>
                            log.fuelLog
                                .filter(
                                    (fuelTank: any) =>
                                        !isFuelTankDormant(
                                            entry,
                                            fuelTank.fuelTank.title,
                                        ),
                                )
                                .map(
                                    (fuelTank: any) => fuelTank.fuelTank.title,
                                ),
                        ),
                    ),
                ).map((title: any) => (
                    <tr key={title}>
                        <td className="text-left pl-4 py-2">{title}</td>
                        <td>{getEntryStart(entry, title)}</td>
                        <td>{getEntryAdded(entry, title)}</td>
                        <td>{getEntryAfter(entry, title)}</td>
                    </tr>
                ))}
            </TableWrapper>
        )
    }

    const getTotal = (entry: any) => {
        const fuelBefore = entry.fuelLog[0].fuelLog.reduce(
            (total: number, log: any) => total + log.fuelBefore,
            0,
        )
        const fuelAfter = entry.fuelLog[
            entry.fuelLog.length - 1
        ].fuelLog.reduce((total: number, log: any) => total + log.fuelAfter, 0)
        const fuelAdded = entry.fuelLog.reduce(
            (sum: number, event: any) =>
                sum +
                event.fuelLog.reduce(
                    (total: number, log: any) => total + log.fuelAdded,
                    0,
                ),
            0,
        )
        return +fuelBefore + +fuelAdded - +fuelAfter
    }

    return (
        <div className="w-full p-0 dark:text-white">
            <div className="flex justify-between pb-4 pt-3 items-center">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    Fuel summary report
                </Heading>
                <div className="flex">
                    <SeaLogsButton text="Back" type="text" link="/reporting" />
                    <SeaLogsButton
                        text="Detailed fuel report"
                        type="secondary"
                        color="sky"
                        icon="check"
                        link="/reporting/detailed-fuel-report"
                    />
                </div>
            </div>
            <Filter onChange={handleFilterChange} />
            {fuelReport.length > 0 && (
                <TableWrapper
                    headings={[
                        'Date:firstHead',
                        'Fuel Tank',
                        'Fuel used:last',
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
                                    {getFuelTable(entry)}
                                </td>
                                <td className="px-2 py-3 lg:px-6">
                                    {getTotal(entry)}
                                </td>
                            </tr>
                        ))}
                </TableWrapper>
            )}
        </div>
    )
}
