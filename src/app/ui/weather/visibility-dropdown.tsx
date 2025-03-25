import { classes } from '@/app/components/GlobalClasses'
import { visibilities } from '@/app/helpers/weatherHelper'
import { useEffect, useState } from 'react'
import Select from 'react-select'

const VisibilityDropdown = ({
    disabled = false,
    value = '',
    onChange,
}: {
    disabled: boolean
    value?: any
    onChange: any
}) => {
    const [selectedValue, setSelectedValue] = useState<any>(
        visibilities.find((item) => {
            return item.value === value
        }),
    )

    const handleOnChange = (value: any) => {
        onChange(value)
    }
    useEffect(() => {
        const v = visibilities.find((item) => {
            return item.value === value
        })
        setSelectedValue(v)
    }, [value])
    return (
        <div>
            <Select
                isDisabled={disabled}
                id="wind-direction"
                closeMenuOnSelect={true}
                options={visibilities}
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

export default VisibilityDropdown
