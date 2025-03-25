import { PopoverWrapper, TableWrapper } from '@/app/components/Components'
import Skeleton from '@/app/components/Skeleton'
import { ReadWeatherForecasts } from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Button, DialogTrigger, Popover } from 'react-aria-components'

const TripLogList = ({
    tripReport = false,
    updateTripReport,
    logBookConfig,
    onClick,
    locked,
}: {
    tripReport: any
    updateTripReport: any
    logBookConfig: any
    onClick?: any
    locked: boolean
}) => {
    const [isLoading, setIsLoading] = useState(true)
    const [currentTrip, setCurrentTrip] = useState<any>(false)
    const [bufferTripID, setBufferTripID] = useState(0)
    const [openTripModal, setOpenTripModal] = useState(false)

    useEffect(() => {
        if (tripReport && currentTrip) {
            const trip = tripReport.find(
                (trip: any) => trip.id === currentTrip.id,
            )
            setCurrentTrip(trip)
        }
        if (tripReport && bufferTripID > 0) {
            const trip = tripReport.find(
                (trip: any) => trip.id === bufferTripID,
            )
            setCurrentTrip(trip)
            setBufferTripID(0)
        }
    }, [tripReport])

    const convertTimeFormat = (time: string) => {
        if (time === null || time === undefined) return ''
        const [hours, minutes, seconds] = time.split(':')
        return `${hours}:${minutes}`
    }

    return (
        <div>
            {/*<TripLogListSkeleton />*/}
            {tripReport ? (
                <TableWrapper
                    className={'overflow-visible'}
                    headings={[
                        'Depart:firstHead',
                        'Arrival (est)',
                        'Location',
                        'Activities',
                    ]}>
                    {tripReport
                        .filter((trip: any) => trip.archived === false)
                        .map((trip: any) => (
                            <>
                                <tr
                                    key={trip.id}
                                    onClick={() => {
                                        onClick(trip)
                                    }}
                                    className={`bg-white group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                    <td className="px-2 py-3 lg:px-6 min-w-1/2 text-left">
                                        <Button
                                            className={`${locked ? 'pointer-events-none' : ''} text-sky-600 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-slblue-200`}
                                            onPress={() => {
                                                onClick(trip)
                                            }}>
                                            {trip?.departTime
                                                ? convertTimeFormat(
                                                      trip?.departTime,
                                                  )
                                                : 'No depart time'}
                                        </Button>
                                    </td>
                                    <td className="px-2 py-4">
                                        {trip?.arriveTime
                                            ? convertTimeFormat(
                                                  trip?.arriveTime,
                                              )
                                            : 'No arrival time'}
                                    </td>
                                    <td className="px-2 py-4">
                                        {trip?.fromLocation?.title}
                                        {trip?.fromLocation?.title &&
                                        trip?.toLocation?.title
                                            ? ' to '
                                            : ''}
                                        {trip?.toLocation?.title}
                                        {!trip?.fromLocation?.title &&
                                            !trip?.toLocation?.title &&
                                            '-'}
                                    </td>
                                    <td className="px-2 py-4">
                                        {trip?.tripEvents?.nodes.length > 0 ? (
                                            <>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {trip?.tripEvents?.nodes[0]
                                                        ?.eventType?.title
                                                        ? trip?.tripEvents
                                                              ?.nodes[0]
                                                              ?.eventType?.title
                                                        : trip?.tripEvents
                                                              ?.nodes[0]
                                                              ?.eventCategory}
                                                </span>
                                                {trip?.tripEvents?.nodes
                                                    .length > 1 && (
                                                    <DialogTrigger>
                                                        <Button className="text-base outline-none px-1">
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {' '}
                                                                +
                                                                {trip
                                                                    ?.tripEvents
                                                                    ?.nodes
                                                                    .length -
                                                                    1}{' '}
                                                                more
                                                            </span>
                                                        </Button>
                                                        <Popover>
                                                            <PopoverWrapper>
                                                                {trip?.tripEvents?.nodes.map(
                                                                    (
                                                                        event: any,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                event.id
                                                                            }
                                                                            className="flex items-center justify-between">
                                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                                {event
                                                                                    ?.eventType
                                                                                    ?.title
                                                                                    ? event
                                                                                          ?.eventType
                                                                                          ?.title
                                                                                    : event?.eventCategory}
                                                                            </span>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </PopoverWrapper>
                                                        </Popover>
                                                    </DialogTrigger>
                                                )}
                                            </>
                                        ) : (
                                            'No events'
                                        )}
                                    </td>
                                </tr>
                            </>
                        ))}
                </TableWrapper>
            ) : (
                <div className="flex justify-center items-center h-32">
                    <p className="text-gray-500 dark:text-gray-400">
                        No trip logs have been added to this section
                    </p>
                </div>
            )}
        </div>
    )
}

/*const TripLogListSkeleton = () => {
    const numRows = 3 // number of rows to render

    return (
        <TableWrapper headings={['Time:firstHead', 'Location']}>
            {Array.from({ length: numRows }).map((_, index) => (
                <tr
                    key={index}
                    className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                    <td className="px-6 py-4 text-left">
                        <Skeleton />
                    </td>
                    <td className="px-6 py-4">
                        <Skeleton />
                    </td>
                </tr>
            ))}
        </TableWrapper>
    )
}
*/
export default TripLogList
