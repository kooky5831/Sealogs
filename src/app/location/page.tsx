'use client'
import { useEffect } from 'react'
import GeoLocationList from '../ui/location/list'
import { preventCrewAccess } from '../helpers/userHelper'
import { Heading } from 'react-aria-components'
import { SeaLogsButton } from '../components/Components'

const GeoLocationListPage = () => {
    useEffect(() => {
        preventCrewAccess()
    }, [])
    return (
        <div className="w-full p-0 dark:text-white">
            <div className="flex flex-col md:flex-row md:justify-between pb-4 pt-3 items-center">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    Locations
                </Heading>
                <div className="flex flex-col md:flex-row items-center">
                    <SeaLogsButton
                        link={`/location/create`}
                        icon="check"
                        color="sky"
                        type="primary"
                        text="Add Location"
                    />
                </div>
            </div>
            <GeoLocationList />
        </div>
    )
}
export default GeoLocationListPage
