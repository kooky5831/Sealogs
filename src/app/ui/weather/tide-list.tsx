import { TableWrapper } from '@/app/components/Components'
import Skeleton from '@/app/components/Skeleton'
import { formatDate } from '@/app/helpers/dateHelper'
import { ReadWeatherTides } from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { TableHeader } from 'react-aria-components'

const WeatherTideList = ({
    logBookEntryID,
    refreshList = false,
    onClick,
}: {
    logBookEntryID: number
    refreshList?: boolean
    onClick?: any
}) => {
    const [isLoading, setIsLoading] = useState(true)
    const [tides, setTides] = useState([])
    const [readWeatherTides, { loading: readWeatherTidesLoading }] =
        useLazyQuery(ReadWeatherTides, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response) => {
                const tides = response?.readWeatherTides?.nodes
                setTides(tides)
            },
            onError: (error) => {
                console.error('ReadWeatherTides error', error)
            },
        })
    const loadTides = async () => {
        await readWeatherTides({
            variables: {
                filter: {
                    logBookEntryID: { eq: logBookEntryID },
                },
            },
        })
    }
    // const formatDate = (dateString: string) => {
    //     return new Date(dateString).toLocaleDateString()
    // }
    useEffect(() => {
        if (isLoading || refreshList) {
            loadTides()
            setIsLoading(false)
        }
    }, [isLoading, refreshList])
    return (
        <div>
            {readWeatherTidesLoading && <WeatherTideListSkeleton />}
            {!readWeatherTidesLoading && (
                 <div>
                    {tides.length > 0 ? (
                        <div>
                            <TableWrapper headings={['Time:firstHead', 'Location']}>
                                {tides.map((tide: any) => (
                                    <tr
                                        key={tide.id}
                                        className="bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 text-left">
                                            <button
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    onClick(tide)
                                                }}>
                                                {formatDate(tide.tideDate)}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            {+tide.geoLocationID > 0
                                                ? tide.geoLocation.title
                                                : ''}
                                        </td>
                                    </tr>
                                ))}
                            </TableWrapper>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                No tides have been added to this section
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const WeatherTideListSkeleton = () => {
    const numRows = 3 // number of rows to render

    return (
        <TableWrapper headings={['Date:firstHead', 'Location']}>
            {Array.from({ length: numRows }).map((_, index) => (
                <tr
                    key={index}
                    className="bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
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

export default WeatherTideList
