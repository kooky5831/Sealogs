import { TableWrapper } from '@/app/components/Components'
import Skeleton from '@/app/components/Skeleton'
import { ReadWeatherObservations } from '@/app/lib/graphQL/query'
import WeatherObservationModel from '@/app/offline/models/weatherObservation'
import { useLazyQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

const WeatherObservationList = ({
    logBookEntryID,
    refreshList = false,
    onClick,
    offline = false,
}: {
    logBookEntryID: number
    refreshList?: boolean
    onClick?: any
    offline?: boolean
}) => {
    const [isLoading, setIsLoading] = useState(true)
    const [observations, setObservations] = useState([])
    const observationModel = new WeatherObservationModel()
    const [
        readWeatherObservations,
        { loading: readWeatherObservationsLoading },
    ] = useLazyQuery(ReadWeatherObservations, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const observations = response?.readWeatherObservations?.nodes
            setObservations(observations)
        },
        onError: (error) => {
            console.error('ReadWeatherObservations error', error)
        },
    })
    const loadObservations = async () => {
        if (offline) {
            const observations =
                await observationModel.getByLogBookEntryID(logBookEntryID)
            setObservations(observations)
        } else {
            await readWeatherObservations({
                variables: {
                    filter: {
                        logBookEntryID: { eq: logBookEntryID },
                    },
                },
            })
        }
    }
    const formatTime = (time: string) => {
        return dayjs(`${dayjs().format('YYYY-MM-DD')} ${time}`).format('HH:mm')
    }
    useEffect(() => {
        if (isLoading || refreshList) {
            loadObservations()
            setIsLoading(false)
        }
    }, [isLoading, refreshList])
    return (
        <div>
            {readWeatherObservationsLoading && (
                <WeatherObservationListSkeleton />
            )}
            {!readWeatherObservationsLoading && (
                <div>
                    {observations.length > 0 ? (
                        <TableWrapper
                            headings={[
                                'Time:firstHead',
                                'Forecast',
                                'Location',
                            ]}>
                            {observations.map((observation: any) => (
                                <tr
                                    key={observation.id}
                                    className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                    <td className="px-6 py-4 text-left">
                                        <button
                                            className="cursor-pointer"
                                            onClick={() =>
                                                onClick(observation)
                                            }>
                                            {formatTime(observation.time)}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        {observation.forecast?.time
                                            ? formatTime(
                                                  observation.forecast.time,
                                              )
                                            : ''}
                                    </td>
                                    <td className="px-6 py-4">
                                        {+observation.geoLocationID > 0
                                            ? observation.geoLocation.title
                                            : ''}
                                    </td>
                                </tr>
                            ))}
                        </TableWrapper>
                    ) : (
                        <div className="flex justify-center items-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                No observations have been added to this section
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const WeatherObservationListSkeleton = () => {
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

export default WeatherObservationList
