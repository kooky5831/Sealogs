import { VESSEL_LIST } from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'

import { useEffect, useState } from 'react'
import Select from 'react-select'
import Skeleton from '@/app/components/Skeleton'
import { classes } from '@/app/components/GlobalClasses'

const VesselDropdown = ({
    value,
    onChange,
    isClearable = false,
    vesselIdOptions = [],
    filterByTrainingSessionMemberId = 0,
    isMulti,
}: any) => {
    const [isLoading, setIsLoading] = useState(true)
    const [vesselList, setVesselList] = useState([] as any)
    const [allVesselList, setAllVesselList] = useState([] as any)
    const [selectedVessel, setSelectedVessel] = useState([] as any)
    const [queryVesselList, { loading: queryVesselListLoading }] = useLazyQuery(
        VESSEL_LIST,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readVessels.nodes

                if (data) {
                    const filteredData = data.filter(
                        (vessel: any) => !vessel.archived && vessel.title,
                    )
                    const formattedData = filteredData.map((vessel: any) => ({
                        value: vessel.id,
                        label: vessel.title,
                    }))
                    formattedData.sort((a: any, b: any) =>
                        a.label.localeCompare(b.label),
                    )
                    setAllVesselList(formattedData)
                    setVesselList(formattedData)
                    vesselIdOptions = vesselList
                    setSelectedVessel(
                        formattedData.find(
                            (vessel: any) => vessel.value === value,
                        ),
                    )
                }
            },
            onError: (error: any) => {
                console.error('queryVesselList error', error)
            },
        },
    )
    const loadVesselList = async () => {
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
        queryVesselList({
            variables: { filter: filter },
        })
    }
    useEffect(() => {
        if (isLoading) {
            loadVesselList()
            setIsLoading(false)
        }
    }, [isLoading])
    useEffect(() => {
        setSelectedVessel(
            vesselList.find((vessel: any) => vessel.value === value),
        )
    }, [value])
    useEffect(() => {
        if (vesselIdOptions.length > 0) {
            const filteredVesselList = allVesselList.filter((v: any) =>
                vesselIdOptions.includes(v.value),
            )
            setVesselList(filteredVesselList)
        } else {
            // If no options are provided, show the full list
            setVesselList(allVesselList)
        }
    }, [vesselIdOptions, allVesselList])
    return (
        <>
            {queryVesselListLoading ? (
                <Skeleton />
            ) : (
                <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                    <div className="flex items-center">
                        {vesselList && !isLoading && (
                            <Select
                                id="vessel-dropdown"
                                closeMenuOnSelect={true}
                                options={vesselList}
                                menuPlacement="top"
                                defaultValue={selectedVessel}
                                value={selectedVessel}
                                onChange={onChange}
                                isClearable={isClearable}
                                className={classes.selectMain}
                                placeholder="Vessel"
                                classNames={{
                                    control: () =>
                                        classes.selectControl + ' w-full',
                                    singleValue: () =>
                                        classes.selectSingleValue,
                                    menu: () => classes.selectMenu,
                                    option: () => classes.selectOption,
                                }}
                                isMulti={isMulti}
                                styles={{
                                    container: (provided) => ({
                                        ...provided,
                                        width: '100%',
                                    }),
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default VesselDropdown
