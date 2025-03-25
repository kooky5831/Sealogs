import { useEffect, useState } from 'react'
import Datepicker from 'react-tailwindcss-datepicker'

const DateRange = ({ value, onChange }: any) => {
    const [dateValue, setDateValue] = useState({
        startDate: null,
        endDate: null,
    })

    const handleValueChange = (newValue: any) => {
        setDateValue(newValue)
        onChange(newValue)
    }

    // useEffect(() => {
    //     if (value) {
    //         setDateValue(value)
    //     }
    // }, [value])
    return (
        <Datepicker
            placeholder="Date Range"
            value={dateValue}
            onChange={handleValueChange}
            showShortcuts
            showFooter
            displayFormat={'DD/MM/YYYY'}
        />
    )
}

export default DateRange
