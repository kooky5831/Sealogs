import Select from 'react-select'
import { CountriesList } from '../lib/data'
import { useEffect, useState } from 'react'
import { classes } from './GlobalClasses'

const CountryDropdown = ({ value = 'NZ', onChange }: any) => {
    const [selectedCountry, setSelectedCountry] = useState({})

    useEffect(() => {
        let country = CountriesList.find((c) => c.value === 'NZ')
        if (value) {
            country = CountriesList.find((c) => c.value === value)
        }
        setSelectedCountry(country ? country : CountriesList[0])
    }, [value])
    return (
        <Select
            options={CountriesList}
            closeMenuOnSelect={true}
            menuPlacement="bottom"
            placeholder="Country"
            value={selectedCountry}
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
                    'block py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-slblue-200 focus:ring-slblue-500 focus:border-slblue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-slblue-500 !dark:focus:border-slblue-500',
                menu: () => classes.selectMenu,
                option: () => classes.selectOption,
            }}
        />
    )
}

export default CountryDropdown
