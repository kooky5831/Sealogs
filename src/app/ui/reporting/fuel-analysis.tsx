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
import { max, min } from 'lodash'
import { useEffect, useState } from 'react'
import { Heading } from 'react-aria-components'

export default function FuelAnalysis() {
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

    const [getSectionTripReport_LogBookEntrySection] = useLazyQuery(
        TripReport_LogBookEntrySection_Brief,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readTripReport_LogBookEntrySections.nodes
                var fuelReport: any = []
                data.forEach((entry: any) => {
                    var maxFuelLevel: any = 0
                    entry.tripEvents.nodes.forEach((event: any) => {
                        var fuelLevel = 0
                        if (event.eventCategory === 'PassengerDropFacility') {
                            fuelLevel =
                                event.eventType_PassengerDropFacility
                                    .fuelLevel != 0
                                    ? event.eventType_PassengerDropFacility
                                          .fuelLevel
                                    : fuelLevel
                        }
                        if (event.eventCategory === 'Tasking') {
                            fuelLevel =
                                event.eventType_Tasking.fuelLevel != 0
                                    ? event.eventType_Tasking.fuelLevel
                                    : fuelLevel
                        }
                        if (event.eventCategory === 'PassengerDropFacility') {
                            fuelLevel =
                                event.eventType_PassengerDropFacility
                                    .fuelLevel != 0
                                    ? event.eventType_PassengerDropFacility
                                          .fuelLevel
                                    : fuelLevel
                        }
                        maxFuelLevel = max([+maxFuelLevel, +fuelLevel])
                    })
                    var minFuelLevel: any = maxFuelLevel
                    entry.tripEvents.nodes.forEach((event: any) => {
                        var fuelLevel = 0
                        if (event.eventCategory === 'PassengerDropFacility') {
                            fuelLevel =
                                event.eventType_PassengerDropFacility
                                    .fuelLevel != 0
                                    ? event.eventType_PassengerDropFacility
                                          .fuelLevel
                                    : fuelLevel
                        }
                        if (event.eventCategory === 'Tasking') {
                            fuelLevel =
                                event.eventType_Tasking.fuelLevel != 0
                                    ? event.eventType_Tasking.fuelLevel
                                    : fuelLevel
                        }
                        if (event.eventCategory === 'PassengerDropFacility') {
                            fuelLevel =
                                event.eventType_PassengerDropFacility
                                    .fuelLevel != 0
                                    ? event.eventType_PassengerDropFacility
                                          .fuelLevel
                                    : fuelLevel
                        }
                        minFuelLevel =
                            minFuelLevel === 0
                                ? +fuelLevel
                                : min([+minFuelLevel, +fuelLevel])
                    })
                    if (maxFuelLevel > 0 || minFuelLevel > 0) {
                        fuelReport.push({
                            id: entry.id,
                            maxFuelLevel: maxFuelLevel,
                            minFuelLevel: minFuelLevel,
                            fromLocation: entry.fromLocation,
                            toLocation: entry.toLocation,
                            arrivalTime: entry.arriveTime,
                            departureTime: entry.departTime,
                            created: entry.created,
                        })
                    }
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
                            Fuel Analysis
                        </Heading>
                        <div className="flex">
                            <SeaLogsButton
                                text="Back"
                                type="text"
                                link="/reporting"
                            />
                            <SeaLogsButton
                                text="Fuel Tasking analysis report"
                                type="secondary"
                                color="sky"
                                icon="check"
                                link="/reporting/fuel-tasking-analysis"
                            />
                        </div>
                    </div>
                    <Filter onChange={handleFilterChange} />
                    {fuelReport.length > 0 && (
                        <TableWrapper
                            headings={[
                                'Date:firstHead',
                                'Start',
                                'End',
                                'Fuel Start',
                                'Fuel End',
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
                                            {entry.maxFuelLevel}
                                        </td>
                                        <td className="px-2 py-3 lg:px-6">
                                            {entry.minFuelLevel}
                                        </td>
                                        <td className="px-2 py-3 lg:px-6">
                                            {entry.maxFuelLevel -
                                                entry.minFuelLevel}
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
