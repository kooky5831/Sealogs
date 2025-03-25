import Skeleton from '@/app/components/Skeleton'
import { useEffect, useState } from 'react'
import Select from 'react-select'
import { getTrainingTypes } from '@/app/lib/actions'
import { classes } from '@/app/components/GlobalClasses'
import { isEmpty } from 'lodash'
import TrainingTypeModel from '@/app/offline/models/trainingType'

const TrainingTypeMultiSelectDropdown = ({
    value = [],
    onChange,
    locked,
    offline = false,
}: any) => {
    const [typesOfTraining, setTypesOfTraining] = useState<any>(false)
    const [selectedTrainings, setSelectedTrainings] = useState<any>(false)
    const trainingTypeModel = new TrainingTypeModel()
    const handleSetTrainingTypes = (data: any) => {
        const formattedData = data.map((trainingType: any) => ({
            value: trainingType.id,
            label: trainingType.title,
        }))
        formattedData.sort((a: any, b: any) => a.label.localeCompare(b.label))
        setTypesOfTraining(formattedData)
        const selectedData = value.map((value: any) => {
            return formattedData.find((type: any) => type.value === value)
        })
        setSelectedTrainings(selectedData)
    }

    if (!offline) {
        getTrainingTypes(handleSetTrainingTypes)
    }
    useEffect(() => {
        if (offline) {
            // getTrainingTypes(handleSetTrainingTypes)
            trainingTypeModel.getAll().then((data: any) => {
                handleSetTrainingTypes(data)
            })
        }
    }, [offline])
    const handleOnChange = (data: any) => {
        if (data.length === 0) {
            setSelectedTrainings([])
        }
        onChange(data)
    }
    useEffect(() => {
        if (!isEmpty(value) && !isEmpty(typesOfTraining)) {
            const selectedData = value.map((value: any) => {
                return typesOfTraining.find((type: any) => type.value === value)
            })
            setSelectedTrainings(selectedData)
        }
    }, [value, typesOfTraining])
    return (
        <>
            {!typesOfTraining ? (
                <Skeleton />
            ) : (
                <div className={`${locked ? 'pointer-events-none' : ''}`}>
                    <Select
                        closeMenuOnSelect={false}
                        // defaultValue={selectedTrainings}
                        value={selectedTrainings}
                        isMulti
                        options={typesOfTraining}
                        menuPlacement="top"
                        onChange={handleOnChange}
                        placeholder="Select training type"
                        className={classes.selectMain}
                        classNames={{
                            control: () => classes.selectControl,
                            singleValue: () => 'dark:!text-white',
                            dropdownIndicator: () => '!p-0 !hidden',
                            indicatorSeparator: () => '!hidden',
                            multiValue: () =>
                                '!bg-sllightblue-100 inline-block rounded px-1 py-0.5 m-0 !mr-1.5 border border-slblue-200 !rounded-md',
                            clearIndicator: () => '!py-0',
                            valueContainer: () => '!py-1',
                            option: () => classes.selectOption,
                            menu: () => classes.selectMenu,
                        }}
                    />
                </div>
            )}
        </>
    )
}

export default TrainingTypeMultiSelectDropdown
