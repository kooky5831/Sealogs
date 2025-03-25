'use client'
import { Heading } from 'react-aria-components'
import Select from 'react-select'
import { useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { debounce, isEmpty, trim } from 'lodash'
import { CREATE_USER, UPDATE_USER } from '@/app/lib/graphQL/mutation'
import { useRouter } from 'next/navigation'
import {
    getSeaLogsMembers,
    getVesselList,
    getSeaLogsGroups,
    getDepartmentList,
} from '@/app/lib/actions'
import CrewDutyDropdown from '../crew-duty/dropdown'
import DepartmentMultiSelectDropdown from '../department/multiselect-dropdown'
import { classes } from '@/app/components/GlobalClasses'
import { SeaLogsButton } from '@/app/components/Components'
import toast, { Toaster } from 'react-hot-toast'
import { label } from 'yet-another-react-lightbox'
import { isAdmin } from '@/app/helpers/userHelper'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import Loading from '@/app/loading'
import { READ_ONE_SEALOGS_MEMBER } from '@/app/lib/graphQL/query'

const UserForm = ({ userId }: { userId: number }) => {
    const [isUserAdmin, setIsUserAdmin] = useState<any>(-1)
    const router = useRouter()
    const [user, setUser] = useState<any>()
    const [hasFormErrors, setHasFormErrors] = useState(false)
    const [formErrors, setFormErrors] = useState({
        firstName: '',
        email: '',
        response: '',
    })
    const [userGroups, setUserGroups] = useState([])
    const [userVessels, setUserVessels] = useState([])
    const [groups, setGroups] = useState<any>()
    const [vessels, setVessels] = useState<any>()
    const [departmentList, setDepartmentList] = useState<any>(false)
    const [selectedDepartments, setSelectedDepartments] = useState([] as any[])
    const [permissions, setPermissions] = useState<any>(false)
    const [isSelf, setIsSelf] = useState(false)

    const [currentDepartment, setCurrentDepartment] = useState<any>(false)

    const [querySeaLogsMembers] = useLazyQuery(READ_ONE_SEALOGS_MEMBER, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneSeaLogsMember
            if (data) {
                setCurrentDepartment(data.departments.nodes)
            }
        },
        onError: (error: any) => {
            console.error('querySeaLogsMembers error', error)
        },
    })

    useEffect(() => {
        querySeaLogsMembers({
            variables: {
                filter: { id: { eq: +(localStorage.getItem('userId') ?? 0) } },
            },
        })
    }, [])

    useEffect(() => {
        setPermissions(getPermissions)
        setIsUserAdmin(isAdmin())
    }, [])

    const handleSetUser = (members: any) => {
        const user = members[0]
        setUserVessels(
            user?.vehicles.nodes.map((vessel: any) => {
                return { label: vessel.title, value: vessel.id }
            }) ?? [],
        )

        setUserGroups(
            user.groups.nodes.map((group: any) => {
                if (group) {
                    const groupItem = groups.find(
                        (g: any) => g.value === group.id,
                    )
                    return { label: groupItem.label, value: groupItem.value }
                }
            }),
        )
        setUser({ ...user, primaryDutyID: user.primaryDuty?.id })
        const userDepartments = user.departments.nodes.map(
            (department: any) => {
                return department.id
            },
        )
        setSelectedDepartments(userDepartments)

        if (localStorage.getItem('userId') === user?.id) {
            setIsSelf(true)
        }
    }

    getSeaLogsMembers([userId], handleSetUser)

    const handleSetVessels = (vessels: any) => {
        const activeVessels = vessels.filter((vessel: any) => !vessel.archived)
        const vesselsResponse = activeVessels.map((vessel: any) => {
            return {
                label: vessel.title,
                value: vessel.id,
            }
        })
        setVessels(vesselsResponse)
    }

    getVesselList(handleSetVessels)

    getDepartmentList(setDepartmentList)

    const handleSetGroups = (groups: any) => {
        let groupsResponse = groups
            .filter((group: any) => isAdmin() || group.code !== 'admin')
            .map((group: any) => {
                return {
                    label: group.title,
                    value: group.id,
                }
            })
        setGroups(groupsResponse)
    }

    getSeaLogsGroups(handleSetGroups)

    const debouncedhandleInputChange = debounce(
        (name: string, value: string) => {
            setUser({
                ...user,
                [name]: value,
                id: userId,
            })
        },
        300,
    )

    const handleInputChange = (e: any) => {
        const { name, value } = e.target

        debouncedhandleInputChange(name, value)
    }

    const handleGroupChange = (groups: any) => {
        setUserGroups(groups)
        setUser({
            ...user,
            groups: {
                nodes: groups.map((group: any) => {
                    return { id: group.value }
                }),
            },
        })
    }
    const handleVesselChange = (vessels: any) => {
        const vesselIDs = vessels.map((vessel: any) => {
            return vessel.value
        })
        setUserVessels(vessels)
        setUser({
            ...user,
            vehicles: vesselIDs,
        })
    }
    const handleDutyChange = (duty: any) => {
        setUser({
            ...user,
            primaryDutyID: +duty.value,
        })
    }
    const [mutationCreateUser, { loading: mutationCreateUserLoading }] =
        useMutation(CREATE_USER, {
            onCompleted: (response: any) => {
                const data = response.createSeaLogsMember
                if (data.id > 0) {
                    router.push('/crew')
                } else {
                    console.error('mutationCreateUser response error', response)
                }
            },
            onError: (error: any) => {
                setFormErrors({
                    ...formErrors,
                    response: error.message,
                })
                setHasFormErrors(true)
                console.error('mutationCreateUser catch error', error.message)
            },
        })
    const [mutationUpdateUser, { loading: mutationUpdateUserLoading }] =
        useMutation(UPDATE_USER, {
            onCompleted: (response: any) => {
                const data = response.updateSeaLogsMember
                if (data.id > 0) {
                    router.push('/crew')
                } else {
                    console.error('mutationUpdateUser error', response)
                }
            },
            onError: (error: any) => {
                console.error('mutationUpdateUser error', error.message)
                toast.error(error.message)
            },
        })
    const handleSave = async () => {
        if (currentDepartment && localStorage.getItem('useDepartment') === 'true') {
            if (selectedDepartments.length === 0) {
                toast.error('Please select a department')
                return
            }
        }
        if (
            user === undefined ||
            user?.groups === undefined ||
            userGroups.length === 0
        ) {
            toast.error('Please select a role')
            return
        }
        let hasErrors = false
        let errors = {
            firstName: '',
            email: '',
            response: '',
        }
        if (isEmpty(trim(user.firstName))) {
            hasErrors = true
            errors.firstName = 'First name is required'
        }
        if (isEmpty(trim(user.email))) {
            hasErrors = true
            errors.email = 'Email is required'
        }
        if (hasErrors) {
            setHasFormErrors(true)
            setFormErrors(errors)
            return
        }
        const variables = {
            input: {
                id: +user.id,
                firstName: user.firstName,
                surname: user.surname,
                username: user.username,
                password: user.password,
                email: user.email,
                phoneNumber: user.phoneNumber,
                ...(!isEmpty(user.groups) && {
                    groups: user.groups.nodes
                        .map((group: any) => group.id)
                        .join(','),
                }),
                ...(!isEmpty(userVessels) && {
                    vehicles: userVessels
                        .map((vessel: any) => vessel.value)
                        .join(','),
                }),
                primaryDutyID: +user.primaryDutyID,
                departments: selectedDepartments.join(','),
            },
        }
        if (userId === 0) {
            await mutationCreateUser({
                variables,
            })
        } else {
            await mutationUpdateUser({
                variables,
            })
        }
    }

    const handleDepartmentChange = (departments: any) => {
        setSelectedDepartments(departments.map((d: any) => d.value))
    }

    const filterByDepartment = (vessels: any) => {
        return (
            departmentList &&
            departmentList
                ?.filter(
                    (d: any) =>
                        d.seaLogsMembers.nodes?.find(
                            (m: any) => m.id == userId,
                        ) || selectedDepartments.includes(d.id),
                )
                ?.map((d: any) => d.basicComponents.nodes)
                .flat()
                ?.map((v: any) => {
                    return vessels.find((vessel: any) => vessel.value === v.id)
                })
        )
    }

    if (
        !permissions ||
        !hasPermission(process.env.VIEW_MEMBER || 'VIEW_MEMBER', permissions)
    ) {
        return !permissions ? (
            <Loading />
        ) : (
            <Loading errorMessage="Oops! You do not have the permission to view this section." />
        )
    }

    return (
        <div className="w-full p-0 dark:text-white border border-slblue-50 bg-blue-50 mb-10 lg:mb-0 md:mb-0 dark:bg-sldarkblue-800">
            <div className="flex justify-between px-8 py-3 items-center bg-sldarkblue-900 rounded-t-lg">
                <Heading className="font-light font-monasans text-2xl text-white">
                    {userId === 0 ? 'Create' : 'Edit'} User
                </Heading>
            </div>
            <div className="px-0 md:px-4 pt-4 border-t">
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 lg:pb-4 md:pb-4 lg:pt-3 md:pt-3 px-4">
                    <div className="my-4 text-l">
                        User Details
                        <p className="text-xs mt-4 max-w-[25rem] leading-loose font-light"></p>
                    </div>
                    <div className="col-span-2 block pt-2 pb-5 px-7 bg-white border-slblue-200 rounded-lg dark:bg-sldarkblue-800 dark:border">
                        <div className="mb-4 text-center">
                            <small className="text-red-500">
                                {hasFormErrors && formErrors.response}
                            </small>
                        </div>
                        <div className="lg:flex md:flex flex-cols lg:gap-4 md:gap-4">
                            <div className="flex grow flex-col mb-4">
                                <div className="flex items-center">
                                    <input
                                        name="firstName"
                                        placeholder="First name"
                                        type="text"
                                        className={classes.input}
                                        required
                                        defaultValue={user?.firstName || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <small className="text-red-500">
                                    {hasFormErrors && formErrors.firstName}
                                </small>
                            </div>
                            <div className="flex grow flex-col mb-4">
                                <div className="flex items-center">
                                    <input
                                        name="surname"
                                        placeholder="Surname"
                                        type="text"
                                        className={classes.input}
                                        defaultValue={user?.surname || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="lg:flex md:flex lg:gap-4 md:gap-4 flex-col lg:flex-row md:flex-row">
                            <div className="flex grow flex-col mb-4">
                                <div className="flex items-center">
                                    <input
                                        name="username"
                                        placeholder="Username"
                                        type="text"
                                        defaultValue={user?.username || ''}
                                        className={classes.input}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            {((permissions &&
                                hasPermission('ADMIN', permissions)) ||
                                isSelf) && (
                                <div className="flex grow flex-col mb-4">
                                    <div className="flex items-center">
                                        <input
                                            name="password"
                                            placeholder="Password"
                                            type="password"
                                            className={classes.input}
                                            required={userId === 0}
                                            onChange={handleInputChange}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        {((permissions &&
                            hasPermission(
                                process.env.VIEW_MEMBER_CONTACT ||
                                    'VIEW_MEMBER_CONTACT',
                                permissions,
                            )) ||
                            isSelf) && (
                            <div className="lg:flex md:flex flex-col lg:gap-4 md:gap-4 lg:flex-row md:flex-row">
                                <div className="flex grow flex-col mb-4">
                                    <div className="flex items-center">
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="Email"
                                            className={classes.input}
                                            defaultValue={user?.email || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <small className="text-red-500">
                                        {hasFormErrors && formErrors.email}
                                    </small>
                                </div>
                                <div className="flex grow flex-col mb-4">
                                    <div className="flex items-center">
                                        <input
                                            name="phoneNumber"
                                            placeholder="Phone Number"
                                            type="tel"
                                            className={classes.input}
                                            defaultValue={
                                                user?.phoneNumber || ''
                                            }
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col mb-4 lg:items-start md:items-start">
                            <label className="mb-1 text-sm font-light">
                                Primary Duty
                            </label>
                            <CrewDutyDropdown
                                onChange={handleDutyChange}
                                crewDutyID={user?.primaryDuty?.id || 0}
                                menuPlacement={'bottom'}
                            />
                        </div>
                        <div className="flex flex-col mb-4">
                            <label className="mb-1 text-sm font-light">
                                User Role
                            </label>
                            {groups && (
                                <Select
                                    id="user-roles"
                                    name="groups"
                                    closeMenuOnSelect={false}
                                    isMulti
                                    options={groups}
                                    value={userGroups}
                                    menuPlacement="top"
                                    placeholder="Select roles"
                                    className={classes.selectMain}
                                    classNames={{
                                        control: () =>
                                            'block py-1 w-full h-12 !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-slblue-200 focus:ring-slblue-500 focus:border-slblue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-slblue-500 !dark:focus:border-slblue-500',
                                        singleValue: () => 'dark:!text-white',
                                        dropdownIndicator: () => '!p-0 !hidden',
                                        indicatorSeparator: () => '!hidden',
                                        multiValue: () =>
                                            '!bg-slblue-50 inline-block rounded p-1 m-0 !mr-1.5 border border-slblue-300 !rounded-md !text-slblue-900 font-normal mr-2',
                                        clearIndicator: () => '!py-0',
                                        valueContainer: () => '!py-0',
                                        option: () => classes.selectOption,
                                        menu: () => classes.selectMenu,
                                    }}
                                    onChange={handleGroupChange}
                                />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <label className="mb-1 text-sm font-light">
                                Vessels
                            </label>
                            {vessels && (
                                <Select
                                    id="vessel-list"
                                    name="VesselList"
                                    closeMenuOnSelect={false}
                                    isMulti
                                    options={filterByDepartment(vessels)}
                                    value={userVessels}
                                    menuPlacement="top"
                                    placeholder="Select vessels"
                                    className={classes.selectMain}
                                    classNames={{
                                        control: () =>
                                            'flex py-1 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-slblue-200 focus:ring-slblue-500 focus:border-slblue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-slblue-500 !dark:focus:border-slblue-500',
                                        singleValue: () => 'dark:!text-white',
                                        dropdownIndicator: () => '!p-0 !hidden',
                                        indicatorSeparator: () => '!hidden',
                                        multiValue: () =>
                                            '!bg-slblue-100 inline-block rounded p-1 m-0 !mr-1.5 border border-slblue-300 !rounded-md !text-slblue-900 font-normal mr-2',
                                        clearIndicator: () => '!py-0',
                                        valueContainer: () => '!py-0',
                                        option: () => classes.selectOption,
                                        menu: () => classes.selectMenu,
                                    }}
                                    onChange={handleVesselChange}
                                />
                            )}
                        </div>
                        {localStorage.getItem('useDepartment') === 'true' && (
                            <div className="flex flex-col">
                                <label className="mb-1 text-sm font-light">
                                    Departments
                                </label>
                                {departmentList && (
                                    <DepartmentMultiSelectDropdown
                                        onChange={handleDepartmentChange}
                                        value={selectedDepartments}
                                        allDepartments={departmentList}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <hr className="mb-4" />
            <div className="flex justify-end px-8 pb-4 pt-4">
                <SeaLogsButton
                    action={() => {
                        router.push('/crew')
                    }}
                    text="Back to Crew"
                    type="text"
                />
                <SeaLogsButton
                    action={handleSave}
                    text={userId === 0 ? 'Create user' : 'Update user'}
                    color="slblue"
                    type="primary"
                    icon="check"
                    className="bg-red-500"
                    isDisabled={
                        mutationCreateUserLoading || mutationUpdateUserLoading
                    }
                />
            </div>
            <Toaster position="top-right" />
        </div>
    )
}

export default UserForm
