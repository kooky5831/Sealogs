'use client'
import { Heading } from 'react-aria-components'
import { FooterWrapper, SeaLogsButton } from '@/app/components/Components'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { trim, isEmpty } from 'lodash'
import { useLazyQuery, useMutation } from '@apollo/client'
import Loading from '@/app/loading'
import {
    READ_ONE_SEALOGS_GROUP,
    READ_PERMISSION_TYPES,
} from '@/app/lib/graphQL/query'
import {
    UPDATE_SEALOGS_GROUP,
    CREATE_SEALOGS_GROUP,
} from '@/app/lib/graphQL/mutation'
import { classes } from '@/app/components/GlobalClasses'
import {
    isAdmin as isAdminRole,
    preventCrewAccess,
} from '@/app/helpers/userHelper'

const UserRoleForm = ({ roleID = 0 }: { roleID: number }) => {
    const [isUserAdmin, setIsUserAdmin] = useState<any>(-1)
    const router = useRouter()
    const [userRole, setUserRole] = useState<any>({})
    const [formError, setFormError] = useState<any>({})
    const [permissions, setPermissions] = useState<any>([])
    const [isLoading, setIsLoading] = useState(true)
    const [userPermissions, setUserPermissions] = useState<any>([])
    const [isAdmin, setIsAdmin] = useState(false)
    useEffect(() => {
        setIsUserAdmin(isAdminRole())
    }, [])
    const handleInputOnChange = (event: any) => {
        const { name, value } = event.target
        setUserRole({ ...userRole, id: roleID, [name]: value })
    }
    const [createSeaLogsGroup, { loading: createSeaLogsGroupLoading }] =
        useMutation(CREATE_SEALOGS_GROUP, {
            onCompleted: (response: any) => {
                const data = response.createSeaLogsGroup
                if (data) {
                    router.push('/settings/user-role')
                }
            },
            onError: (error: any) => {
                // console.error('createSeaLogsGroup error', error.message)
                setFormError({ ...formError, response: error.message })
            },
        })
    const [updateSeaLogsGroup, { loading: updateSeaLogsGroupLoading }] =
        useMutation(UPDATE_SEALOGS_GROUP, {
            onCompleted: (response: any) => {
                const data = response.updateSeaLogsGroup
                if (data) {
                    router.push('/settings/user-role')
                }
            },
            onError: (error: any) => {
                setFormError({ ...formError, response: error.message })
            },
        })
        console.log(userPermissions)
    const handleSave = async () => {
        // Do not allow the group with code admin to be saved
        if (isAdmin) {
            return
        }
        if (isEmpty(trim(userRole?.title))) {
            setFormError({ ...formError, title: 'Title is required' })
            return
        }
        setFormError({})
        const input = { ...userRole }
        delete input.__typename
        delete input.permissions
        delete input.members
        input.permissionCodes = userPermissions.join(',')
        if (roleID > 0) {
            await updateSeaLogsGroup({
                variables: {
                    input: input,
                },
            })
        } else {
            await createSeaLogsGroup({
                variables: {
                    input: input,
                },
            })
        }
    }
    const [readOneSealLogsGroup, { loading: readOneSealLogsGroupLoading }] =
        useLazyQuery(READ_ONE_SEALOGS_GROUP, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readOneSeaLogsGroup
                if (data) {
                    const codesArray = data.permissions.nodes.map(
                        (node: any) => node.code,
                    )
                    setUserPermissions(codesArray)
                    setUserRole(data)
                    const admin = data.code === 'admin'
                    setIsAdmin(admin)
                }
            },
            onError: (error: any) => {
                console.error('readOneSealLogsGroup error', error)
            },
        })
    const loadUserRole = async () => {
        await readOneSealLogsGroup({
            variables: {
                id: roleID,
            },
        })
    }
    const [readPermissionTypes, { loading: readPermissionTypesLoading }] =
        useLazyQuery(READ_PERMISSION_TYPES, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readPermissionTypes
                if (data) {
                    // Group by categories
                    const groupedByCategory = data.reduce(
                        (acc: any, obj: any) => {
                            const { category, ...rest } = obj
                            acc[category] = acc[category] || []
                            acc[category].push(rest)
                            acc[category].sort(
                                (a: any, b: any) => a.sort > b.sort,
                            ) // Sort by name
                            return acc
                        },
                        {},
                    )
                    setPermissions(groupedByCategory)
                }
            },
            onError: (error: any) => {
                console.error('readPermissionTypes error', error)
            },
        })
    const loadPermissions = async () => {
        await readPermissionTypes()
    }
    const handlePermissionCheckboxChange = (event: any) => {
        setUserPermissions((prevPermissions: any) => {
            if (event.target.checked) {
                return [...prevPermissions, event.target.id]
            } else {
                return prevPermissions.filter(
                    (permission: any) => permission !== event.target.id,
                )
            }
        })
    }
    useEffect(() => {
        if (roleID > 0) {
            loadUserRole()
        }
    }, [roleID])
    useEffect(() => {
        if (isLoading) {
            preventCrewAccess()
            loadPermissions()
            setIsLoading(false)
        }
    }, [isLoading])
    useEffect(() => {
        if (roleID == 0) {
            let defaultPerms = Object.values(permissions).flatMap(
                (subItems: any) =>
                    subItems
                        .filter((item: any) => item.default === true)
                        .map((item: any) => item.code),
            )

            setUserPermissions(defaultPerms)
        }
    }, [permissions])

    return (
        <div className="w-full p-0 dark:text-white">
            {isUserAdmin === false ? (
                <Loading errorMessage="Oops! You do not have the permission to view this section." />
            ) : (
                <>
                    <div className="flex justify-between pb-4 pt-3 items-center">
                        <Heading className="font-light font-monasans text-3xl dark:text-white">
                            {roleID > 0 ? 'Edit' : 'New'} User Role
                        </Heading>
                    </div>
                    <div className="px-0 md:px-4 pt-4 border-t">
                        <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                            <div className="">
                                <div className="my-4 text-xl">
                                    Role Details
                                    {/*
                            <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                                Lorem ipsum dolor sit amet consectetur
                                adipisicing elit. Facilis sint veritatis
                                laboriosam quo autem error provident nulla,
                                minima enim eveniet cupiditate. Reprehenderit
                                perferendis aspernatur at tenetur maiores
                                accusantium nostrum aliquid.
                            </p>
                            */}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <small className="text-red-500">
                                    {formError?.response}
                                </small>
                                <div className="my-4">
                                    <div className="flex gap-4">
                                        <div className="w-full">
                                            <input
                                                name="title"
                                                type="text"
                                                value={userRole?.title ?? ''}
                                                className={classes.input}
                                                placeholder="Title"
                                                onChange={handleInputOnChange}
                                                disabled={isAdmin}
                                            />
                                            <small className="text-red-500">
                                                {formError?.title}
                                            </small>
                                        </div>

                                        <input
                                            name="code"
                                            type="text"
                                            value={userRole?.code ?? ''}
                                            className={classes.input}
                                            placeholder="Code"
                                            onChange={handleInputOnChange}
                                            disabled={isAdmin}
                                        />
                                    </div>
                                </div>
                                <div className="my-4">
                                    <textarea
                                        name="description"
                                        value={userRole?.description ?? ''}
                                        className={classes.textarea}
                                        placeholder="Description"
                                        onChange={handleInputOnChange}
                                        rows={5}
                                        disabled={isAdmin}></textarea>
                                </div>
                            </div>

                            <div className="">
                                <div className="my-4 text-xl">
                                    Permissions
                                    {/*
                            <p className="text-xs mt-4 max-w-[25rem] leading-loose"></p>
                            */}
                                </div>
                            </div>

                            <div className="col-span-2">
                                <div className="my-4">
                                    <div className="mt-4">
                                        {Object.keys(permissions).map(
                                            (category) => (
                                                <div key={category}>
                                                    <h2 className="text-lg font-bold">
                                                        {category}
                                                    </h2>
                                                    <ul className="list-none ml-4">
                                                        {permissions[
                                                            category
                                                        ].map((obj: any) => (
                                                            <li
                                                                key={obj.code}
                                                                className="mt-2">
                                                                <label className="inline-flex">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={
                                                                            obj.code
                                                                        }
                                                                        className="form-checkbox h-5 w-5 min-w-5 text-blue-600"
                                                                        onChange={
                                                                            handlePermissionCheckboxChange
                                                                        }
                                                                        checked={userPermissions.includes(
                                                                            obj.code,
                                                                        )}
                                                                        disabled={
                                                                            isAdmin
                                                                        }
                                                                    />
                                                                    <span className="ml-2">
                                                                        {
                                                                            obj.name
                                                                        }

                                                                        {obj.help && (
                                                                            <>
                                                                                <br />
                                                                                <i className="text-xs">
                                                                                    {
                                                                                        obj.help
                                                                                    }
                                                                                </i>
                                                                            </>
                                                                        )}
                                                                    </span>
                                                                </label>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <FooterWrapper>
                        <SeaLogsButton
                            text="Cancel"
                            type="text"
                            action={() => router.back()}
                            className={
                                createSeaLogsGroupLoading ||
                                readOneSealLogsGroupLoading ||
                                updateSeaLogsGroupLoading
                                    ? 'hidden'
                                    : 'visible'
                            }
                        />
                        {!isAdmin && (
                            <SeaLogsButton
                                text={`${roleID > 0 ? 'Update' : 'Create'} Role`}
                                type="primary"
                                icon="check"
                                color="sky"
                                action={handleSave}
                                disabled={
                                    createSeaLogsGroupLoading ||
                                    readOneSealLogsGroupLoading ||
                                    updateSeaLogsGroupLoading
                                }
                            />
                        )}
                    </FooterWrapper>
                </>
            )}
        </div>
    )
}

export default UserRoleForm
