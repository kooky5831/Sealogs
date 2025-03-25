import Select from 'react-select'
import { TimezonesByCountry } from '../lib/data'
import { useEffect, useState } from 'react'
import { classes } from './GlobalClasses'

const TimezoneDropdown = ({
    value = 'Pacific/Auckland',
    countryCode = 'ALL',
    onChange,
}: any) => {
    const [timezones, setTimezones] = useState([] as any)
    const [selectedTimezone, setSelectedTimezone] = useState({})

    useEffect(() => {
        const tz = (TimezonesByCountry[countryCode] || []).map((t) => ({
            value: t,
            label: t,
        }))

        setTimezones(tz)
        let timezone = tz.find((c) => c.value === 'Pacific/Auckland')
        if (value) {
            timezone = tz.find((c) => c.value === value)
        }
        setSelectedTimezone(timezone ? timezone : tz[0])
    }, [value, countryCode])

    return (
        <Select
            options={timezones}
            closeMenuOnSelect={true}
            menuPlacement="bottom"
            placeholder="Time Zone"
            value={selectedTimezone}
            onChange={onChange}
            className={classes.selectMain}
            classNames={{
                singleValue: () => 'dark:!text-white',
                dropdownIndicator: () => '!p-0 !hidden',
                indicatorSeparator: () => '!hidden',
                multiValue: () =>
                    '!bg-slblue-50 inline-block rounded p-1 m-0 !mr-1.5 border border-slblue-300 !rounded-md !text-slblue-900 font-normal mr-2',
                clearIndicator: () => '!py-0',
                valueContainer: () => '!py-0',
                control: () =>
                    'block py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-slblue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-slblue-500 !dark:focus:border-slblue-500',
                menu: () => classes.selectMenu,
                option: () => classes.selectOption,
            }}
        />
    )
}

export default TimezoneDropdown
