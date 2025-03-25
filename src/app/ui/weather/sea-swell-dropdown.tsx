import { classes } from '@/app/components/GlobalClasses'
import { swellRanges } from '@/app/helpers/weatherHelper'
import { useEffect, useState } from 'react'
import Select from 'react-select'

const SeaSwellDropdown = ({
    disabled = false,
    value = '',
    onChange,
}: {
    disabled: boolean
    value?: any
    onChange: any
}) => {
    const [selectedValue, setSelectedValue] = useState<any>(
        swellRanges.find((item) => {
            return item.value === value
        }),
    )
    const handleOnChange = (value: any) => {
        onChange(value)
    }

    useEffect(() => {
        const swell = swellRanges.find((item) => {
            return item.value === value
        })
        setSelectedValue(swell)
    }, [value])
    return (
        <div>
            <Select
                isDisabled={disabled}
                id="wind-direction"
                closeMenuOnSelect={true}
                options={swellRanges}
                menuPlacement="top"
                defaultValue={selectedValue}
                value={selectedValue}
                onChange={handleOnChange}
                // placeholder={placeholder}
                // isClearable={isClearable}
                className={classes.selectMain}
                classNames={{
                    control: () => classes.selectControl + ' !min-w-48',
                    singleValue: () => classes.selectSingleValue,
                    menu: () => classes.selectMenu,
                    option: () => classes.selectOption,
                }}
                // isMulti={isMulti}
                styles={{
                    container: (provided: any) => ({
                        ...provided,
                        width: '100%',
                    }),
                }}
            />
        </div>
    )
}

export default SeaSwellDropdown
