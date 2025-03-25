import Skeleton from '@/app/components/Skeleton'
import { useEffect, useState } from 'react'
import Select from 'react-select'
import { getSeaLogsMembersList } from '@/app/lib/actions'
import { isEmpty } from 'lodash'
import { AlertDialog } from '@/app/components/Components'
import { Heading } from 'react-aria-components'
import { CREATE_USER } from '@/app/lib/graphQL/mutation'
import { useMutation } from '@apollo/client'
import { classes } from '@/app/components/GlobalClasses'
import SeaLogsMemberModel from '@/app/offline/models/seaLogsMember'
import { generateUniqueId } from '@/app/offline/helpers/functions'

const CrewMultiSelectDropdown = ({
    value = [], // an array of crew IDs
    onChange,
    memberIdOptions = [],
    departments = [],
    filterByAdmin = false,
    offline = false,
}: {
    value: any[]
    onChange: any
    memberIdOptions?: any[]
    departments?: any
    filterByAdmin?: boolean
    offline?: boolean
}) => {
    const [crewList, setCrewList] = useState([] as any)
    const [openCreateMemberDialog, setOpenCreateMemberDialog] = useState(false)
    const [selectedIDs, setSelectedIDs] = useState([] as any)
    const [error, setError] = useState<any>(false)
    const seaLogsMemberModel = new SeaLogsMemberModel()
    const handleSetCrewList = (crewListRaw: any) => {
        const createOption = {
            value: 'newCrewMember',
            label: '--- Create Crew Member ---',
        }
        const data = crewListRaw.filter((crew: any) =>
            filterByAdmin ? !crewIsAdmin(crew) : true,
        )
        if (departments.length > 0) {
            const departmentList = departments.flatMap((department: any) => {
                return department.id
            })
            const crews = data
                .filter((crew: any) =>
                    crew.departments.nodes.some((node: any) =>
                        departmentList.includes(node.id),
                    ),
                )
                .map((item: any) => {
                    return {
                        value: item.id,
                        label: `${item.firstName ?? ''} ${item.surname ?? ''}`,
                    }
                })
            if (memberIdOptions.length === 0) {
                setCrewList([createOption, ...crews])
            } else {
                const filteredCrewList = crews.filter((crew: any) => {
                    return memberIdOptions.includes(crew.value)
                })
                setCrewList(filteredCrewList)
            }
        } else {
            const crews = data.map((item: any) => {
                return {
                    value: item.id,
                    label: `${item.firstName ?? ''} ${item.surname ?? ''}`,
                }
            })
            if (memberIdOptions.length === 0) {
                setCrewList([createOption, ...crews])
            } else {
                const filteredCrewList = crews.filter((crew: any) => {
                    return memberIdOptions.includes(crew.value)
                })
                setCrewList(filteredCrewList)
            }
        }
    }
    if (!offline) {
        getSeaLogsMembersList(handleSetCrewList)
    }

    useEffect(() => {
        if (offline) {
            // getSeaLogsMembersList(handleSetCrewList)
            seaLogsMemberModel.getAll().then((data: any) => {
                handleSetCrewList(data)
            })
        }
    }, [offline])

    const crewIsAdmin = (crew: any) => {
        return (
            crew.groups.nodes?.filter((permission: any) => {
                return permission.code === 'admin'
            }).length > 0
        )
    }

    const handleOnChange = (data: any) => {
        if (data.find((option: any) => option.value === 'newCrewMember')) {
            setOpenCreateMemberDialog(true)
        } else {
            if (data.length === 0) {
                setSelectedIDs([])
            }
            onChange(data)
        }
    }
    const [queryAddMember] = useMutation(CREATE_USER, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.createSeaLogsMember
            if (data.id > 0) {
                setOpenCreateMemberDialog(false)
                const newData = {
                    value: data.id,
                    label: data.firstName + ' ' + data.surname,
                }
                setCrewList([...crewList, newData])
                setSelectedIDs([...selectedIDs, data.id])
                onChange([
                    newData,
                    ...value.map((id: any) => {
                        const crew = crewList.find((c: any) => c.value === id)
                        return crew
                    }),
                ])
                setError(false)
            }
        },
        onError: (error: any) => {
            console.error('createUser error', error.message)
            setError(error)
        },
    })
    const handleAddNewMember = async () => {
        const variables = {
            input: {
                firstName: (
                    document.getElementById(
                        'crew-firstName',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'crew-firstName',
                          ) as HTMLInputElement
                      ).value
                    : null,
                surname: (
                    document.getElementById('crew-surname') as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'crew-surname',
                          ) as HTMLInputElement
                      ).value
                    : null,
                email: (
                    document.getElementById('crew-email') as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'crew-email',
                          ) as HTMLInputElement
                      ).value
                    : null,
                phoneNumber: (
                    document.getElementById(
                        'crew-phoneNumber',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'crew-phoneNumber',
                          ) as HTMLInputElement
                      ).value
                    : null,
                username: (
                    document.getElementById('crew-username') as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'crew-username',
                          ) as HTMLInputElement
                      ).value
                    : null,
                password: (
                    document.getElementById('crew-password') as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'crew-password',
                          ) as HTMLInputElement
                      ).value
                    : null,
            },
        }
        if (offline) {
            // queryAddMember
            const data = await seaLogsMemberModel.save({
                ...variables.input,
                id: generateUniqueId(),
            })
            setOpenCreateMemberDialog(false)
            const newData = {
                value: data.id,
                label: data.firstName + ' ' + data.surname,
            }
            setCrewList([...crewList, newData])
            setSelectedIDs([...selectedIDs, data.id])
            onChange([
                newData,
                ...value.map((id: any) => {
                    const crew = crewList.find((c: any) => c.value === id)
                    return crew
                }),
            ])
            setError(false)
        } else {
            await queryAddMember({
                variables: variables,
            })
        }
    }

    useEffect(() => {
        if (!isEmpty(crewList) && !isEmpty(value)) {
            setSelectedIDs(value)
        }
    }, [value, crewList])

    return (
        <>
            {isEmpty(crewList) ? (
                <Skeleton />
            ) : (
                <>
                    <Select
                        closeMenuOnSelect={false}
                        value={
                            selectedIDs
                                ? selectedIDs.map((id: any) => {
                                      const crew = crewList.find(
                                          (c: any) => c.value === id,
                                      )
                                      return crew
                                  })
                                : []
                        }
                        isMulti
                        options={crewList}
                        menuPlacement="top"
                        onChange={handleOnChange}
                        placeholder="Select Crew"
                        className={classes.selectMain}
                        classNames={{
                            control: () =>
                                'block pt-2.5 pb-3 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-slblue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                            singleValue: () => 'dark:!text-white',
                            dropdownIndicator: () => '!p-0 !hidden',
                            indicatorSeparator: () => '!hidden',
                            multiValue: () =>
                                '!bg-sky-100 inline-block rounded px-1 py-0.5 m-0 !mr-1.5 border border-sky-300 !rounded-md !text-sky-900 font-normal mr-2',
                            clearIndicator: () => '!py-0',
                            valueContainer: () =>
                                '!py-0 h-auto min-h-20 content-start flex flex-wrap',
                            indicatorsContainer: () => 'pt-1.5 items-start',
                            option: () => classes.selectOption,
                            menu: () => classes.selectMenu,
                        }}
                    />
                    <AlertDialog
                        openDialog={openCreateMemberDialog}
                        setOpenDialog={setOpenCreateMemberDialog}
                        handleCreate={handleAddNewMember}
                        actionText="Add Crew Member">
                        <Heading className="text-xl font-medium mb-4">
                            Add Crew Member
                        </Heading>
                        <div className="grid grid-cols-1 gap-4 border-t pt-6">
                            <div className="flex gap-4">
                                <input
                                    id={`crew-firstName`}
                                    type="text"
                                    className={classes.input}
                                    placeholder="First Name"
                                />
                                <input
                                    id={`crew-surname`}
                                    type="text"
                                    className={classes.input}
                                    placeholder="Surname"
                                />
                            </div>
                            <div className="flex gap-4">
                                <input
                                    id={`crew-username`}
                                    type="text"
                                    className={classes.input}
                                    placeholder="Username"
                                />
                                <input
                                    id={`crew-password`}
                                    type="password"
                                    className={classes.input}
                                    placeholder="Password"
                                />
                            </div>
                            <div className="flex gap-4">
                                <input
                                    id={`crew-email`}
                                    type="email"
                                    className={classes.input}
                                    placeholder="Email"
                                />
                                <input
                                    id={`crew-phoneNumber`}
                                    type="text"
                                    className={classes.input}
                                    placeholder="Phone Number"
                                />
                            </div>
                            {error && (
                                <div className="text-xs text-rose-600">
                                    {error.message}
                                </div>
                            )}
                        </div>
                    </AlertDialog>
                </>
            )}
        </>
    )
}

export default CrewMultiSelectDropdown
