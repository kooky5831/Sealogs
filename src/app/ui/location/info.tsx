import { SeaLogsButton } from '@/app/components/Components'
import LocationMap from '@/app/components/Map'
import { ReadOneGeoLocation } from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'
import { isEmpty } from 'lodash'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, Heading } from 'react-aria-components'

const GeoLocationInfo = ({ id = 0 }: { id?: number }) => {
    const router = useRouter()
    if (id <= 0) {
        router.push('/location')
    }
    const [isLoading, setIsLoading] = useState(true)
    const [geoLocation, setGeoLocation] = useState({} as any)
    const [readOneGeoLocation, { loading: loadingReadOneGeoLocation }] =
        useLazyQuery(ReadOneGeoLocation, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (data: any) => {
                setGeoLocation(data.readOneGeoLocation)
            },
            onError: (error: any) => {
                console.error('readOneGeoLocation', error)
            },
        })
    const loadGeoLocation = async () => {
        await readOneGeoLocation({
            variables: {
                id: id,
            },
        })
    }
    useEffect(() => {
        if (isLoading) {
            loadGeoLocation()
            setIsLoading(false)
        }
    }, [isLoading])

    return (
        <>
            <div className="w-full p-0">
                <div className="flex justify-between pb-4 pt-3 items-center">
                    <Heading className="flex items-center font-light font-monasans text-3xl dark:text-white">
                        <span className="font-medium mr-2">Location:</span>
                        {geoLocation.title}
                    </Heading>
                    <div className="flex">
                        <SeaLogsButton
                            text="Location List"
                            type="text"
                            className="hover:text-sllightblue-1000"
                            icon="back_arrow"
                            color="slblue"
                            link={'/location'}
                        />
                        {!isLoading && !loadingReadOneGeoLocation && (
                            <Link
                                href={`/location/edit?id=${geoLocation.id}`}
                                className="group block m-1">
                                <Button className="group inline-flex justify-center items-center mr-2 rounded-md bg-slblue-100 px-3 py-2 text-sm shadow-sm hover:bg-white hover:text-sllightblue-1000 ring-1 ring-sllightblue-600">
                                    <svg
                                        className="-ml-0.5 mr-1.5 h-5 w-5 group-hover:border-white"
                                        viewBox="0 0 36 36"
                                        fill="currentColor"
                                        aria-hidden="true">
                                        <path d="M33.87,8.32,28,2.42a2.07,2.07,0,0,0-2.92,0L4.27,23.2l-1.9,8.2a2.06,2.06,0,0,0,2,2.5,2.14,2.14,0,0,0,.43,0L13.09,32,33.87,11.24A2.07,2.07,0,0,0,33.87,8.32ZM12.09,30.2,4.32,31.83l1.77-7.62L21.66,8.7l6,6ZM29,13.25l-6-6,3.48-3.46,5.9,6Z"></path>
                                    </svg>
                                    Edit
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
                {!loadingReadOneGeoLocation && !isEmpty(geoLocation) && (
                    <div>
                        <LocationMap
                            position={[
                                geoLocation.lat || 0,
                                geoLocation.long || 0,
                            ]}
                            zoom={19}
                        />
                    </div>
                )}
            </div>
        </>
    )
}

export default GeoLocationInfo
