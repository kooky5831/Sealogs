import { classes } from '@/app/components/GlobalClasses'
import { precipitations } from '@/app/helpers/weatherHelper'
import { useEffect, useState } from 'react'
import Select from 'react-select'

const PrecipitationDropdown = ({
    disabled = false,
    value = '',
    onChange,
}: {
    disabled: boolean
    value?: any
    onChange: any
}) => {
    const [selectedValue, setSelectedValue] = useState<any>(
        precipitations.find((item) => {
            return item.value === value
        }),
    )
    const handleOnChange = (value: any) => {
        onChange(value)
    }

    useEffect(() => {
        const p = precipitations.find((item) => {
            return item.value === value
        })
        setSelectedValue(p)
    }, [value])
    return (
        <div>
            <Select
                isDisabled={disabled}
                id="wind-direction"
                closeMenuOnSelect={true}
                options={precipitations}
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

export default PrecipitationDropdown
