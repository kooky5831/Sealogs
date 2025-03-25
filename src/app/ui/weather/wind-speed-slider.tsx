import { useEffect, useState } from 'react'
import {
    Label,
    Slider,
    SliderOutput,
    SliderThumb,
    SliderTrack,
} from 'react-aria-components'
const WindSpeedSlider = ({
    disabled = false,
    value = 0,
    onChange,
    unitOfMeasure = '',
}: {
    disabled: boolean
    value: number
    onChange: any
    unitOfMeasure?: string
}) => {
    const [selectedValue, setSelectedValue] = useState<any>(value)
    const handleSliderChange = (value: any) => {
        const windStrength = Array.isArray(value) ? value[0] : value
        setSelectedValue(windStrength)
        onChange(windStrength)
    }
    useEffect(() => {
        setSelectedValue(value)
    }, [value])
    return (
        <div className="w-full">
            <Slider
                isDisabled={disabled}
                defaultValue={selectedValue}
                maxValue={60}
                value={selectedValue}
                className="w-full mr-2"
                onChange={handleSliderChange}
                step={0.01}>
                <div className="flex text-sky-700">
                    <Label className="flex-1">&nbsp;</Label>
                    <SliderOutput />{' '}
                    <span className="ml-1">{unitOfMeasure}</span>
                </div>
                <SliderTrack className="relative w-full h-7">
                    {({ state }) => (
                        <>
                            {/* track */}
                            <div className="absolute h-2 top-[50%] translate-y-[-50%] w-full border-1 rounded-full bg-white" />
                            {/* fill */}
                            <div
                                className="absolute h-2 top-[50%] translate-y-[-50%] rounded-full bg-sky-700"
                                style={{
                                    width: state.getThumbPercent(0) * 100 + '%',
                                }}
                            />
                            <SliderThumb
                                className={`${disabled === false ? 'h-7 w-7' : 'h-2 w-2'} top-[50%] rounded-full border border-solid border-purple-800/75 bg-white transition dragging:bg-purple-100 outline-none focus-visible:ring-2 ring-black`}
                            />
                        </>
                    )}
                </SliderTrack>
            </Slider>
        </div>
    )
}

export default WindSpeedSlider
