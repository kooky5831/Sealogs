import { useEffect, useState } from 'react'
import Select from 'react-select'
import Skeleton from '@/app/components/Skeleton'
import { useLazyQuery } from '@apollo/client'
import { CREW_LIST } from '@/app/lib/graphQL/query'
import { classes } from '@/app/components/GlobalClasses'
import { usePathname } from 'next/navigation'
import { isCrew } from '@/app/helpers/userHelper'
import SeaLogsMemberModel from '@/app/offline/models/seaLogsMember'

const CrewDropdown = ({
    value,
    onChange,
    controlClasses = 'default' as 'default' | 'filter',
    placeholder = 'Trainer',
    isClearable = false,
    filterByTrainingSessionMemberId = 0,
    trainerIdOptions = [],
    memberIdOptions = [],
    isMulti,
    offline = false,
}: any) => {
    const [crewList, setCrewList] = useState<any>()
    const [selectedValue, setSelectedValue] = useState(value)
    const [isLoading, setIsLoading] = useState(true)
    const [allCrewList, setAllCrewList] = useState<any>([])
    const pathname = usePathname()
    const [imCrew, setImCrew] = useState(false) // if this is a crew member or not
    const seaLogsMemberModel = new SeaLogsMemberModel()
    const [querySeaLogsMembersList] = useLazyQuery(CREW_LIST, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readSeaLogsMembers.nodes
            if (data) {
                if (imCrew && pathname === '/reporting') {
                    // A crew can create a Sea Time report for themselves only. Limit the dropdown to only the current user
                    const userId = localStorage.getItem('userId')
                    const filteredCrewList = data.filter((crew: any) => {
                        return crew.id === userId
                    })
                    setCrewList(filteredCrewList)
                } else {
                    setCrewList(data)
                }

                setAllCrewList(data)
            }
        },
        onError: (error: any) => {
            console.error('querySeaLogsMembersList error', error)
        },
    })
    const loadCrewMembers = async () => {
        let filter: any = { archived: { eq: false } }
        if (filterByTrainingSessionMemberId > 0) {
            filter = {
                ...filter,
                trainingSessions: {
                    members: {
                        id: { contains: filterByTrainingSessionMemberId },
                    },
                },
            }
        }
        if (offline) {
            // querySeaLogsMembersList
            const allCrews = await seaLogsMemberModel.getAll()
            const data = allCrews.filter((crew: any) => {
                if (filterByTrainingSessionMemberId > 0) {
                    return (
                        crew.archived === false &&
                        crew.trainingSessions.nodes.some(
                            (trainingSession: any) =>
                                trainingSession.members.nodes.some(
                                    (member: any) =>
                                        member.id ===
                                        filterByTrainingSessionMemberId,
                                ),
                        )
                    )
                } else {
                    return crew.archived === false
                }
            })
            if (data) {
                if (imCrew && pathname === '/reporting') {
                    // A crew can create a Sea Time report for themselves only. Limit the dropdown to only the current user
                    const userId = localStorage.getItem('userId')
                    const filteredCrewList = data.filter((crew: any) => {
                        return crew.id === userId
                    })
                    setCrewList(filteredCrewList)
                } else {
                    setCrewList(data)
                }
                setAllCrewList(data)
            }
        } else {
            await querySeaLogsMembersList({
                variables: {
                    filter: filter,
                },
            })
        }
    }
    useEffect(() => {
        if (isLoading) {
            setImCrew(isCrew())
            loadCrewMembers()
            setIsLoading(false)
        }
    }, [isLoading])

    useEffect(() => {
        if (value && crewList) {
            const crew = crewList.find((crew: any) => crew.id === value)
            if (crew) {
                setSelectedValue({
                    value: crew.id,
                    label: `${crew.firstName || ''} ${crew.surname || ''}`,
                })
            }
        }
    }, [value, crewList])
    useEffect(() => {
        if (trainerIdOptions.length > 0 && allCrewList.length > 0) {
            const filteredCrewList = allCrewList.filter((crew: any) => {
                return trainerIdOptions.includes(crew.id)
            })
            setCrewList(filteredCrewList)
        }
    }, [trainerIdOptions, allCrewList])
    useEffect(() => {
        if (memberIdOptions.length > 0 && allCrewList.length > 0) {
            const filteredCrewList = allCrewList.filter((crew: any) => {
                return memberIdOptions.includes(crew.id)
            })
            setCrewList(filteredCrewList)
        }
    }, [memberIdOptions, allCrewList])
    return (
        <>
            {!crewList ? (
                <Skeleton />
            ) : (
                <div className="flex flex-col">
                    <div className="flex text-sm">
                        <Select
                            id="crew-dropdown"
                            closeMenuOnSelect={true}
                            options={crewList.map((crew: any) => ({
                                value: crew.id,
                                label: `${crew.firstName || ''} ${crew.surname || ''}`,
                            }))}
                            menuPlacement="top"
                            value={selectedValue}
                            onChange={onChange}
                            placeholder={placeholder}
                            isClearable={isClearable}
                            className={classes.selectMain}
                            classNames={{
                                control: () =>
                                    classes.selectControl + ' w-full',
                                singleValue: () => classes.selectSingleValue,
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
                    </div>
                </div>
            )}
        </>
    )
}

export default CrewDropdown
