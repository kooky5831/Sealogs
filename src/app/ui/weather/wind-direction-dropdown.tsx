import { classes } from '@/app/components/GlobalClasses'
import { windDirections } from '@/app/helpers/weatherHelper'
import { useEffect, useState } from 'react'
import Select from 'react-select'

const WindDirectionDropdown = ({
    disabled = false,
    value = '',
    onChange,
}: {
    disabled: boolean
    value?: string
    onChange: any
}) => {
    const [selectedValue, setSelectedValue] = useState<any>(
        windDirections.find((item) => {
            return item.value === value
        }),
    )

    const handleOnChange = (value: any) => {
        onChange(value)
    }

    useEffect(() => {
        const wd = windDirections.find((item) => {
            return item.value === value
        })
        setSelectedValue(wd)
    }, [value])
    return (
        <div>
            <Select
                isDisabled={disabled}
                id="wind-direction"
                closeMenuOnSelect={true}
                options={windDirections}
                menuPlacement="top"
                defaultValue={selectedValue}
                value={selectedValue}
                onChange={handleOnChange}
                className={classes.selectMain}
                classNames={{
                    control: () => classes.selectControl + ' !min-w-48',
                    singleValue: () => classes.selectSingleValue,
                    menu: () => classes.selectMenu,
                    option: () => classes.selectOption,
                }}
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

export default WindDirectionDropdown
