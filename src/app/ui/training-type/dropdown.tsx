import { CREW_TRAINING_TYPES } from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'

import { useEffect, useState } from 'react'
import Select from 'react-select'
import { isEmpty } from 'lodash'
import Skeleton from '@/app/components/Skeleton'
import { classes } from '@/app/components/GlobalClasses'

const TrainingTypeDropdown = ({
    value,
    onChange,
    isClearable = false,
    filterByTrainingSessionMemberId = 0,
    trainingTypeIdOptions = [],
}: any) => {
    const [isLoading, setIsLoading] = useState(true)
    const [trainingTypeList, setTrainingTypeList] = useState([] as any)
    const [allTrainingTypeList, setAllTrainingTypeList] = useState([] as any)
    const [selectedTrainingType, setSelectedTrainingType] = useState([] as any)
    const [queryTrainingTypeList, { loading: queryTrainingTypeListLoading }] =
        useLazyQuery(CREW_TRAINING_TYPES, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readTrainingTypes.nodes

                if (data) {
                    const formattedData = data.map((trainingType: any) => ({
                        value: trainingType.id,
                        label: trainingType.title,
                    }))
                    formattedData.sort((a: any, b: any) =>
                        a.label.localeCompare(b.label),
                    )
                    setTrainingTypeList(formattedData)
                    setAllTrainingTypeList(formattedData)
                    setSelectedTrainingType(
                        formattedData.find(
                            (trainingType: any) => trainingType.value === value,
                        ),
                    )
                }
            },
            onError: (error: any) => {
                console.error('queryTrainingTypeList error', error)
            },
        })
    const loadTrainingTypeList = async () => {
        let filter = {}
        if (filterByTrainingSessionMemberId > 0) {
            filter = {
                trainingSessions: {
                    members: {
                        id: { contains: filterByTrainingSessionMemberId },
                    },
                },
            }
        }
        queryTrainingTypeList({
            variables: {
                filter: filter,
            },
        })
    }
    useEffect(() => {
        if (isLoading) {
            loadTrainingTypeList()
            setIsLoading(false)
        }
    }, [isLoading])
    useEffect(() => {
        setSelectedTrainingType(
            trainingTypeList.find(
                (trainingType: any) => trainingType.value === value,
            ),
        )
    }, [value])
    useEffect(() => {
        if (
            trainingTypeIdOptions.length > 0 &&
            allTrainingTypeList.length > 0
        ) {
            const trainingTypes = allTrainingTypeList.filter((t: any) =>
                trainingTypeIdOptions.includes(t.value),
            )
            setTrainingTypeList(trainingTypes)
        }
    }, [trainingTypeIdOptions, allTrainingTypeList])
    return (
        <>
            {queryTrainingTypeListLoading ? (
                <Skeleton />
            ) : (
                <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                    <div className="flex items-center">
                        <Select
                            id="trainingType-dropdown"
                            closeMenuOnSelect={true}
                            options={trainingTypeList}
                            menuPlacement="top"
                            defaultValue={selectedTrainingType}
                            value={selectedTrainingType}
                            onChange={onChange}
                            isClearable={isClearable}
                            placeholder="Training Type"
                            className={classes.selectMain}
                            classNames={{
                                control: () =>
                                    classes.selectControl + ' w-full',
                                singleValue: () => classes.selectSingleValue,
                                menu: () => classes.selectMenu,
                                option: () => classes.selectOption,
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default TrainingTypeDropdown
