import { TableWrapper } from '@/app/components/Components'
import Skeleton from '@/app/components/Skeleton'
import { formatDate } from '@/app/helpers/dateHelper'
import { ReadWeatherForecasts } from '@/app/lib/graphQL/query'
import WeatherForecastModel from '@/app/offline/models/weatherForecast'
import { useLazyQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

const WeatherForecastList = ({
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
    const [forecasts, setForecasts] = useState([])
    const forecastModel = new WeatherForecastModel()
    const [readWeatherForecasts, { loading: readWeatherForecastsLoading }] =
        useLazyQuery(ReadWeatherForecasts, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response) => {
                const forecasts = response?.readWeatherForecasts?.nodes
                setForecasts(forecasts)
            },
            onError: (error) => {
                console.error('ReadWeatherForecasts error', error)
            },
        })
    const loadForecasts = async () => {
        if (offline) {
            const forecasts =
                await forecastModel.getByLogBookEntryID(logBookEntryID)
            setForecasts(forecasts)
        } else {
            await readWeatherForecasts({
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
    const formatDay = (day: string) => {
        return dayjs(day).format('YYYY-MM-DD')
    }
    useEffect(() => {
        if (isLoading || refreshList) {
            loadForecasts()
            setIsLoading(false)
        }
    }, [isLoading, refreshList])
    return (
        <div>
            {readWeatherForecastsLoading && <WeatherForecastListSkeleton />}
            {!readWeatherForecastsLoading && (
                <div>
                    {forecasts.length > 0 ? (
                        <div>
                            <TableWrapper
                                headings={['Time:firstHead', 'Location']}>
                                {forecasts.map((forecast: any) => (
                                    <tr
                                        key={forecast.id}
                                        className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                        <td className="px-6 py-4 text-left">
                                            <button
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    onClick(forecast)
                                                }}>
                                                {formatTime(forecast.time)}
                                                {'   /   '}
                                                {formatDate(forecast.day)}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            {+forecast.geoLocationID > 0
                                                ? forecast.geoLocation.title
                                                : ''}
                                        </td>
                                    </tr>
                                ))}
                            </TableWrapper>
                        </div>
                    ) : (
                        <div></div>
                    )}
                </div>
            )}
        </div>
    )
}

const WeatherForecastListSkeleton = () => {
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

export default WeatherForecastList
