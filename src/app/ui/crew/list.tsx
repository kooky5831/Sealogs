'use client'
import { useEffect, useState } from 'react'
import { Button, Popover, DialogTrigger } from 'react-aria-components'
import { CREW_LIST } from '@/app/lib/graphQL/query'
import { useLazyQuery, useMutation } from '@apollo/client'
import Loading from '@/app/loading'
import Link from 'next/link'
import { UPDATE_USER } from '@/app/lib/graphQL/mutation'
import CrewDutyDropdown from '../crew-duty/dropdown'
import { classes } from '@/app/components/GlobalClasses'
import { TableWrapper, SeaLogsButton } from '@/app/components/Components'
import {
    getVesselList,
    getCrewDuties,
    GetCrewListWithTrainingStatus,
} from '@/app/lib/actions'
import Filter from '@/app/components/Filter'
import CustomPagination from '@/app/components/Pagination'
import { ReadDepartments } from '@/app/lib/graphQL/query'
import { isEmpty } from 'lodash'
export default function CrewList(props: any) {
    const [crewList, setCrewList] = useState<any>([])
    const [vessels, setVessels] = useState<
        Array<{ label: string; value: number }>
    >([])
    const [showActiveUsers, setShowActiveUsers] = useState(true)
    const [duties, setDuties] = useState<any>([])
    const limit = 100
    const [pageInfo, setPageInfo] = useState({
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    })
    const [page, setPage] = useState(0)
    let [filter, setFilter] = useState({
        archived: { eq: false },
    } as SearchFilter)
    // const [keywordFilter, setKeywordFilter] = useState([] as any)
    const handleSetCrewDuties = (crewDuties: any) => {
        //const activeDuties = crewDuties.filter((duty: any) => !duty.archived)
        const activeDuties = crewDuties.filter((duty: any) =>
            showActiveUsers ? !duty.archived : duty.archived,
        )
        const formattedCrewDuties = activeDuties.map((duty: any) => {
            return {
                label: duty.title,
                value: duty.id,
            }
        })
        setDuties(formattedCrewDuties)
    }

    getCrewDuties(handleSetCrewDuties)

    const handleSetVessels = (vessels: any) => {
        //const activeVessels = vessels.filter((vessel: any) => !vessel.archived)
        const activeVessels = vessels.filter((vessel: any) =>
            showActiveUsers ? !vessel.archived : vessel.archived,
        )
        const vesselSelection = activeVessels.map((vessel: any) => {
            return { label: vessel.title, value: vessel.id }
        })
        setVessels(vesselSelection)
        loadCrewMembers()
    }

    getVesselList(handleSetVessels)

    const [queryCrewMembers, { loading: queryCrewMembersLoading }] =
        useLazyQuery(CREW_LIST, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (queryCrewMembersResponse: any) => {
                handleSetCrewMembers(
                    queryCrewMembersResponse.readSeaLogsMembers.nodes,
                )
                setPageInfo(
                    queryCrewMembersResponse.readSeaLogsMembers.pageInfo,
                )
                return queryCrewMembersResponse.readSeaLogsMembers.nodes
            },
            onError: (error: any) => {
                console.error('queryCrewMembers error', error)
            },
        })

    const handleSetCrewMembers = (crewMembers: any) => {
        const transformedCrewList = GetCrewListWithTrainingStatus(
            crewMembers,
            vessels,
        )
        setCrewList(transformedCrewList)
    }

    const loadCrewMembers = async (
        startPage: number = 0,
        searchFilter: any = { ...filter },
        // searchkeywordFilter: any = keywordFilter,
    ) => {
        searchFilter.archived = { eq: !showActiveUsers }
        /* if (searchkeywordFilter.length > 0) {
            const promises = searchkeywordFilter.map(
                async (keywordFilter: any) => {
                    return await queryCrewMembers({
                        variables: {
                            limit: limit,
                            offset: startPage * limit,
                            filter: { ...searchFilter, ...keywordFilter },
                        },
                    })
                },
            )
            let responses = await Promise.all(promises)
            // filter out empty results
            responses = responses.filter(
                (r: any) => r.data.readSeaLogsMembers.nodes.length > 0,
            )
            // flatten results
            responses = responses.flatMap(
                (r: any) => r.data.readSeaLogsMembers.nodes,
            )
            // filter out duplicates
            responses = responses.filter(
                (value: any, index: any, self: any) =>
                    self.findIndex((v: any) => v.id === value.id) === index,
            )
            handleSetCrewMembers(responses)
        } else { 
        await queryCrewMembers({
            variables: {
                limit: limit,
                offset: startPage * limit,
                filter: searchFilter,
            },
        })
        } */
        const updatedFilter: SearchFilter = {
            ...searchFilter,
            archived: { eq: !showActiveUsers },
        }

        await queryCrewMembers({
            variables: {
                limit: limit,
                offset: startPage * limit,
                filter: updatedFilter,
            },
        })
    }

    const [mutationUpdateUser, {}] = useMutation(UPDATE_USER, {
        onCompleted: (mutationUpdateUserResponse: any) => {},
        onError: (error: any) => {
            console.error('mutationUpdateUser error', error)
        },
    })

    const handleCrewDuty = async (duty: any, user: any) => {
        const selectedUser = {
            ...crewList.find((crew: any) => crew.ID === user.ID),
        }
        const newPrimaryDutyID = duty.value
        if (selectedUser) {
            const updatedCrewList = crewList.map((crew: any) => {
                if (crew.ID === user.ID) {
                    return {
                        ...crew,
                        PrimaryDutyID: newPrimaryDutyID,
                    }
                }
                return crew
            })
            setCrewList(updatedCrewList)
            // Update user
            const variables = {
                input: {
                    id: +user.id,
                    primaryDutyID: newPrimaryDutyID,
                },
            }
            await mutationUpdateUser({
                variables,
            })
        }
    }
    const handleNavigationClick = (newPage: any) => {
        if (newPage < 0 || newPage === page) return
        setPage(newPage)
        loadCrewMembers(newPage)
    }
    const handleFilterOnChange = ({ type, data }: any) => {
        const searchFilter: SearchFilter = { ...filter }
        if (type === 'vessel') {
            if (data) {
                searchFilter.vehicles = { id: { contains: +data.value } }
            } else {
                delete searchFilter.vehicles
            }
        }
        if (type === 'crewDuty') {
            if (data) {
                searchFilter.primaryDutyID = { eq: +data.value }
            } else {
                delete searchFilter.primaryDutyID
            }
        }
        // let keyFilter = keywordFilter
        if (type === 'keyword') {
            if (type === 'keyword') {
                if (!isEmpty(data.value)) {
                    searchFilter.q = { contains: data.value }
                } else {
                    delete searchFilter.q
                }
            }
        }
        setFilter(searchFilter)
        // setKeywordFilter(keyFilter)
        setPage(0)
        loadCrewMembers(0, searchFilter)
    }

    useEffect(() => {
        setPage(0)
        loadCrewMembers(0, filter)
    }, [showActiveUsers, filter])

    return (
        <div className="w-full py-0">
            <div className="flex justify-end pt-0 items-center">
                <div className="flex items-center">
                    <SeaLogsButton
                        action={() => {
                            setShowActiveUsers(!showActiveUsers)
                        }}
                        icon="record"
                        color="slblue"
                        type="text"
                        text={`${showActiveUsers ? 'Archived Crews' : 'Active Crews'}`}
                    />
                    <SeaLogsButton
                        link={`/user/create`}
                        icon="crew_cap"
                        color="slblue"
                        type="primary"
                        text="Add Crew"
                    />
                </div>
            </div>

            <Filter onChange={handleFilterOnChange} />
            <div className="shadow-sm w-full border border-slblue-100 my-4 rounded-lg">
                {queryCrewMembersLoading ? (
                    <Loading />
                ) : (
                    <>
                        <CrewTable
                            vessels={vessels}
                            crewList={crewList}
                            duties={duties}
                            handleCrewDuty={handleCrewDuty}
                            showSurname={true}
                        />
                        <CustomPagination
                            page={page}
                            limit={limit}
                            visiblePageCount={5}
                            {...pageInfo}
                            onClick={(newPage: number) =>
                                handleNavigationClick(newPage)
                            }
                        />
                    </>
                )}
            </div>
        </div>
    )
}

export const CrewTable = ({
    crewList,
    vessels,
    handleCrewDuty = false,
    showSurname,
}: any) => {
    const [isAdmin, setIsAdmin] = useState(false)
    const [departments, setDepartments] = useState([] as any)
    const [isLoading, setIsLoading] = useState(true)
    const renderDepartment = (
        departments: any[],
        parentID: number = 0,
        depth: number = 0,
    ): any[] => {
        return departments
            .filter((department: any) => +department.parentID === parentID)
            .flatMap((department: any) => {
                const children = renderDepartment(
                    departments,
                    +department.id,
                    depth + 1,
                )
                const item = {
                    ...department,
                    level: depth,
                }
                return [item, ...children]
            })
    }
    const [readDepartments, { loading: readDepartmentsLoading }] = useLazyQuery(
        ReadDepartments,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readDepartments.nodes
                if (data) {
                    const formattedData = renderDepartment(data)
                    setDepartments(formattedData)
                }
            },
            onError: (error: any) => {
                console.error('queryCrewMembers error', error)
            },
        },
    )
    const loadDepartments = async () => {
        await readDepartments()
    }
    useEffect(() => {
        if (isLoading) {
            loadDepartments()
            setIsLoading(false)
        }
    }, [isLoading])
    const transformedCrewList = GetCrewListWithTrainingStatus(crewList, vessels)

    useEffect(() => {
        if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            const result = localStorage.getItem('admin')
            const admin = (result === 'true')
            setIsAdmin(admin)
        }
    }, [])
    return (
        <>
            <div className="block">
                <TableWrapper
                    bodyClass="overflow-auto h-[calc(100svh-12rem)] font-normal"
                    headings={[]}>
                    <tr>
                        <td></td>
                        {handleCrewDuty && (
                            <td className="hidden md:table-cell text-left p-3 border-b border-slblue-200">
                                <label className={classes.label}>Vessel</label>
                            </td>
                        )}
                        <td className="text-left p-3 border-b border-slblue-200">
                            <label className={classes.label}>
                                Primary duty
                            </label>
                        </td>
                        <td className="text-center p-3 border-b border-slblue-200 ">
                            <label className={classes.label}>
                                Training status
                            </label>
                        </td>
                        {isAdmin && localStorage.getItem('useDepartment') === 'true' && (
                            <td className="text-left p-3 border-b border-slblue-200 hidden md:table-cell">
                                <label className={classes.label}>
                                    departments
                                </label>
                            </td>
                        )}
                    </tr>
                    {transformedCrewList.map(
                        (crewMember: any, index: number) => (
                            <tr
                                key={crewMember.id}
                                className={`border-b border-sldarkblue-50 even:bg-sllightblue-50/50 dark:border-slblue-50 hover:bg-sllightblue-50 dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                <td
                                    scope="row"
                                    className="p-2 text-left align-middle items-center border-y md:border-0 border-slblue-100">
                                    <Link
                                        href={`/crew/info?id=${crewMember.id}`}
                                        className="flex items-center pl-2 text-nowrap">
                                        {crewMember.firstName}
                                        {showSurname == true ? (
                                            <span>
                                                &nbsp;{crewMember.surname}
                                            </span>
                                        ) : (
                                            <span className="hidden md:flex">
                                                &nbsp;{crewMember.surname}
                                            </span>
                                        )}
                                    </Link>
                                    {handleCrewDuty && (
                                        <div className="flex md:hidden flex-col">
                                            {crewMember.vehicles.nodes &&
                                                crewMember.vehicles.nodes.map(
                                                    (
                                                        vessel: any,
                                                        index: number,
                                                    ) => {
                                                        if (index < 2) {
                                                            return (
                                                                <div
                                                                    key={
                                                                        vessel.id
                                                                    }
                                                                    className="bg-slblue-50 font-light rounded-lg p-2 border m-1 border-slblue-200 text-nowrap">
                                                                    <a
                                                                        className="max-w-32 overflow-hidden block"
                                                                        href={`/vessel/info?id=${vessel.id}`}>
                                                                        {
                                                                            vessel.title
                                                                        }
                                                                    </a>
                                                                </div>
                                                            )
                                                        }
                                                        if (index === 2) {
                                                            return (
                                                                <DialogTrigger
                                                                    key={
                                                                        vessel.id
                                                                    }>
                                                                    <Button
                                                                        style={{
                                                                            color: 'orange',
                                                                        }}
                                                                        className="inline-block bg-slblue-50 border border-slblue-200 font-light rounded-lg text-sm mr-1 p-2 outline-none">
                                                                        +{' '}
                                                                        {crewMember
                                                                            .vehicles
                                                                            .nodes
                                                                            .length -
                                                                            2}{' '}
                                                                        more
                                                                    </Button>
                                                                    <Popover>
                                                                        <div className="p-0 max-h-full bg-slblue-100 rounded text-slblue-800">
                                                                            {crewMember.vehicles.nodes
                                                                                .slice(
                                                                                    2,
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        v: any,
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                v.id
                                                                                            }
                                                                                            className="flex cursor-pointer hover:bg-sllightblue-1000 items-center overflow-auto ps-3 py-2">
                                                                                            <div className="text-sm">
                                                                                                <a
                                                                                                    href={`/vessel/info?id=${v.id}`}>
                                                                                                    {
                                                                                                        v.title
                                                                                                    }
                                                                                                </a>
                                                                                            </div>
                                                                                        </div>
                                                                                    ),
                                                                                )}
                                                                        </div>
                                                                    </Popover>
                                                                </DialogTrigger>
                                                            )
                                                        }
                                                        return null
                                                    },
                                                )}
                                        </div>
                                    )}
                                </td>
                                {handleCrewDuty && (
                                    <td className="hidden md:table-cell text-left p-2">
                                        {crewMember.vehicles.nodes &&
                                            crewMember.vehicles.nodes.map(
                                                (
                                                    vessel: any,
                                                    index: number,
                                                ) => {
                                                    if (index < 2) {
                                                        return (
                                                            <div
                                                                key={vessel.id}
                                                                className="bg-slblue-50 inline-block font-light rounded-lg p-2 border border-slblue-200 m-1">
                                                                <a
                                                                    href={`/vessel/info?id=${vessel.id}`}>
                                                                    {
                                                                        vessel.title
                                                                    }
                                                                </a>
                                                            </div>
                                                        )
                                                    }
                                                    if (index === 2) {
                                                        return (
                                                            <DialogTrigger
                                                                key={vessel.id}>
                                                                <Button
                                                                    style={{
                                                                        color: 'orange',
                                                                    }}
                                                                    className="inline-block bg-slblue-50 border border-slblue-200 font-light rounded-lg text-sm mr-1 p-2 outline-none">
                                                                    +{' '}
                                                                    {crewMember
                                                                        .vehicles
                                                                        .nodes
                                                                        .length -
                                                                        2}{' '}
                                                                    more
                                                                </Button>
                                                                <Popover>
                                                                    <div className="p-0 w-64 max-h-full bg-slblue-100 rounded text-slblue-800">
                                                                        {crewMember.vehicles.nodes
                                                                            .slice(
                                                                                2,
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    v: any,
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            v.id
                                                                                        }
                                                                                        className="flex cursor-pointer hover:bg-sllightblue-1000 items-center overflow-auto ps-3 py-2">
                                                                                        <div className="text-sm">
                                                                                            <a
                                                                                                href={`/vessel/info?id=${v.id}`}>
                                                                                                {
                                                                                                    v.title
                                                                                                }
                                                                                            </a>
                                                                                        </div>
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                    </div>
                                                                </Popover>
                                                            </DialogTrigger>
                                                        )
                                                    }
                                                    return null
                                                },
                                            )}
                                    </td>
                                )}
                                <td className="text-left p-2 justify-start border-y md:border-0 border-slblue-100">
                                    <div className="text-wrap whitespace-normal">
                                        {crewMember.primaryDuty.title}
                                    </div>
                                </td>
                                <td className="p-2 border-y md:border-0 border-slblue-100">
                                    <div className="flex justify-center">
                                        {crewMember.trainingStatus.label !==
                                        'Good' ? (
                                            <div>
                                                {
                                                    crewMember.trainingStatus
                                                        .label
                                                }
                                                <DialogTrigger>
                                                    <SeaLogsButton
                                                        icon="alert"
                                                        className="w-6 h-6 sup"
                                                    />
                                                    <Popover>
                                                        <div className="bg-slblue-100 rounded p-2">
                                                            <div className="text-xs whitespace-nowrap font-medium focus:outline-none inline-block rounded">
                                                                {crewMember.trainingStatus.dues.map(
                                                                    (
                                                                        item: any,
                                                                        dueIndex: number,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                dueIndex
                                                                            }>
                                                                            {`${item.trainingType.title} - ${item.status.label}`}
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Popover>
                                                </DialogTrigger>
                                            </div>
                                        ) : (
                                            <svg
                                                className="ml-3 mr-1 h-9 w-9 flex-shrink-0"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 19.4014 20.2416">
                                                <path
                                                    d="M9.7007.6208C4.4624.6208.2007,4.8825.2007,10.1208s4.2617,9.5,9.5,9.5,9.5-4.2617,9.5-9.5S14.939.6208,9.7007.6208Z"
                                                    fill="#f0fdea"
                                                    strokeWidth="0"
                                                    stroke="#6b6b49"
                                                    strokeMiterlimit="10"
                                                />
                                                <path
                                                    d="M9.7007.6208C4.4624.6208.2007,4.8825.2007,10.1208s4.2617,9.5,9.5,9.5,9.5-4.2617,9.5-9.5S14.939.6208,9.7007.6208ZM9.7007,19.3833C4.5935,19.3833.4382,15.2283.4382,10.1208S4.5935.8583,9.7007.8583s9.2625,4.155,9.2625,9.2625-4.1552,9.2625-9.2625,9.2625Z"
                                                    fill="#6b6b49"
                                                    strokeWidth=".25px"
                                                    stroke="#6b6b49"
                                                    strokeMiterlimit="10"
                                                />
                                                <path
                                                    d="M12.6437,6.3523l-4.1295,4.6806-1.7725-1.9369c-.4929-.5386-1.3317-.5753-1.8708-.0826-.2607.2385-.4131.5646-.4289.9181-.0155.3531.1072.6913.3459.9525l2.7676,3.0235c.2503.2733.6064.4301.9889.4301.3753-.0037.7328-.167.981-.4482l5.1042-5.7857c.4827-.547.4303-1.3853-.1169-1.8683-.547-.483-1.3853-.431-1.869.1169ZM14.4514,7.9468l-5.1042,5.7857c-.2037.2306-.4971.3647-.8149.3674-.3041,0-.5962-.1285-.8014-.3531l-2.7676-3.0235c-.196-.2139-.2967-.4918-.2839-.7817.013-.29.138-.5572.3521-.753.2081-.1907.4709-.2849.7332-.2849.2944,0,.5878.1188.8017.3526l1.8618,2.0344c.0225.0246.0543.0385.0877.0385.0313-.0009.0666-.0144.0891-.0404l4.2169-4.7799c.3967-.4486,1.0844-.4918,1.5335-.0956s.4922,1.0842.096,1.5333Z"
                                                    fill="#6b6b49"
                                                    strokeWidth=".25px"
                                                    stroke="#6b6b49"
                                                    strokeMiterlimit="10"
                                                />
                                                <path
                                                    d="M14.4514,7.9468l-5.1042,5.7857c-.2037.2306-.4971.3647-.8149.3674-.3041,0-.5962-.1285-.8014-.3531l-2.7676-3.0235c-.196-.2139-.2967-.4918-.2839-.7817.013-.29.138-.5572.3521-.753.2081-.1907.4709-.2849.7332-.2849.2944,0,.5878.1188.8017.3526l1.8618,2.0344c.0225.0246.0543.0385.0877.0385.0313-.0009.0666-.0144.0891-.0404l4.2169-4.7799c.3967-.4486,1.0844-.4918,1.5335-.0956s.4922,1.0842.096,1.5333Z"
                                                    fill="#c2f7aa"
                                                    strokeWidth=".25px"
                                                    stroke="#c2f7aa"
                                                    strokeMiterlimit="10"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </td>
                                {isAdmin && localStorage.getItem('useDepartment') === 'true' && (
                                    <td scope="col"
                                    className="p-2 text-left align-middle items-center border-y md:border-0 border-slblue-100 hidden md:table-cell">
                                        {crewMember.departments && crewMember.departments.nodes.length > 0 ? (
                                            crewMember.departments.nodes.map((department: any) => (
                                                <Link
                                                    key={department.id}
                                                    href={`/department/info?id=${department.id}`}
                                                    className="flex items-center text-nowrap text-xs">
                                                    {departments.find((dept: any) => dept.id === department.id)?.title}
                                                </Link>
                                            ))
                                        ) : (
                                            <p>No departments found</p>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ),
                    )}
                </TableWrapper>
            </div>
        </>
    )
}
