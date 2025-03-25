import { useState } from 'react'
import Select from 'react-select'
import Skeleton from '@/app/components/Skeleton'
import { getTrainingLocations } from '@/app/lib/actions'

const TrainingLocationDropdown = ({ value, onChange }: any) => {
    const [locationList, setLocationList] = useState([] as any)
    getTrainingLocations(setLocationList)

    return (
        <>
            {!locationList ? (
                <Skeleton />
            ) : (
                <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                    <div className="flex items-center">
                        <Select
                            id="training-location-dropdown"
                            closeMenuOnSelect={true}
                            options={locationList.map((location: any) => ({
                                value: location.id,
                                label: location.title,
                            }))}
                            menuPlacement="top"
                            defaultValue={
                                value
                                    ? { label: value.title, value: value.id }
                                    : null
                            }
                            onChange={onChange}
                            placeholder="Select location"
                            className="w-full bg-gray-100 rounded dark:bg-gray-700 text-sm"
                            classNames={{
                                control: () =>
                                    'block py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                singleValue: () => 'dark:!text-white',
                                menu: () => 'dark:bg-gray-800',
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default TrainingLocationDropdown
