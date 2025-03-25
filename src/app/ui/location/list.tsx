import {
    PopoverWrapper,
    SeaLogsButton,
    TableWrapper,
} from '@/app/components/Components'
import { GET_GEO_LOCATIONS } from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { DialogTrigger, Popover, TableHeader } from 'react-aria-components'
import { GeoLocationListSkeleton } from '../skeletons'
import LocationMap from '@/app/components/Map'

const GeoLocationList = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [geoLocations, setGeoLocations] = useState([] as any)
    const [getGeoLocations, { loading: geoLocationsLoading }] = useLazyQuery(
        GET_GEO_LOCATIONS,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readGeoLocations.nodes
                if (data) {
                    setGeoLocations(data)
                }
            },
            onError: (error: any) => {
                console.error('queryGeoLocations error', error)
            },
        },
    )
    //
    const loadGeoLocations = async () => {
        await getGeoLocations()
    }
    useEffect(() => {
        if (isLoading) {
            loadGeoLocations()
            setIsLoading(false)
        }
    }, [isLoading])

    return (
        <div>
            {geoLocationsLoading ? (
                <GeoLocationListSkeleton />
            ) : (
                <TableWrapper
                    headings={[
                        'Location:firstHead',
                        'Latitude',
                        'Longitude',
                        '',
                    ]}>
                    {geoLocations.map((location: any) => (
                        <tr
                            key={location.id}
                            className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                            <th
                                scope="row"
                                className="flex items-center px-2 py-3 lg:px-6">
                                <div className={`flex items-center mb-2`}>
                                    <Link
                                        href={`/location/info?id=${location.id}`}
                                        className="flex items-center">
                                        <div className="font-normal text-medium group-hover:text-emerald-600">
                                            {location.title || 'No Title'}
                                        </div>
                                    </Link>
                                </div>
                            </th>
                            <td>{location.lat}</td>
                            <td>{location.long}</td>
                            <td>
                                <DialogTrigger>
                                    <SeaLogsButton
                                        icon="location"
                                        className="m-auto"
                                    />
                                    <Popover>
                                        <PopoverWrapper>
                                            <LocationMap
                                                position={[
                                                    location.lat || 0,
                                                    location.long || 0,
                                                ]}
                                                zoom={19}
                                            />
                                        </PopoverWrapper>
                                    </Popover>
                                </DialogTrigger>
                            </td>
                        </tr>
                    ))}
                </TableWrapper>
            )}
        </div>
    )
}
export default GeoLocationList
