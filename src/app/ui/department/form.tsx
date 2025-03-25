'use client'
import { useEffect, useState } from 'react'
import { Button, Heading } from 'react-aria-components'
import { DepartmentFormSkeleton } from '../skeletons'
import Link from 'next/link'
import { debounce, isEmpty, trim } from 'lodash'
import { useLazyQuery, useMutation } from '@apollo/client'
import { CreateDepartment, UpdateDepartment } from '@/app/lib/graphQL/mutation'
import { useRouter } from 'next/navigation'
import { ReadOneDepartment } from '@/app/lib/graphQL/query'
import DepartmentDropdown from './dropdown'
import CrewMultiSelectDropdown from '../crew/multiselect-dropdown'
import { classes } from '@/app/components/GlobalClasses'
import { isAdmin, preventCrewAccess } from '@/app/helpers/userHelper'
import Loading from '@/app/loading'

const DepartmentForm = ({ departmentId = 0 }: { departmentId?: number }) => {
    const [isUserAdmin, setIsUserAdmin] = useState<any>(-1)
    const router = useRouter()
    const [department, setDepartment] = useState({} as any)
    const [formErrors, setFormErrors] = useState({} as any)
    const [isParent, setIsParent] = useState(false)
    const [departmentMemberIDs, setDepartmentMemberIDs] = useState([] as any)
    const handleInputOnChange = debounce((event: any) => {
        const { name, value } = event.target
        setDepartment({ ...department, [name]: trim(value) })
    }, 600)
    const [createDepartment, { loading: loadingCreateDepartment }] =
        useMutation(CreateDepartment, {
            onCompleted: (data: any) => {
                router.push(`/department/info?id=${data.createDepartment.id}`)
            },
            onError: (error: any) => {
                console.error('createDepartment', error)
            },
        })
    const [updateDepartment, { loading: loadingUpdateDepartment }] =
        useMutation(UpdateDepartment, {
            onCompleted: (data: any) => {
                router.push(`/department/info?id=${data.updateDepartment.id}`)
            },
            onError: (error: any) => {
                console.error('updateDepartment', error)
            },
        })
    useEffect(() => {
        setIsUserAdmin(isAdmin())
    }, [])
    const handleSave = async () => {
        setFormErrors({})
        // validate title
        if (isEmpty(trim(department.title))) {
            setFormErrors({
                ...formErrors,
                title: 'Department name is required',
            })
            return
        }
        const input = {
            id: departmentId,
            title: department.title,
            parentID: department.parentID,
            seaLogsMembers: departmentMemberIDs.join(','),
        }
        if (departmentId === 0) {
            await createDepartment({
                variables: {
                    input: input,
                },
            })
        } else {
            await updateDepartment({
                variables: {
                    input: input,
                },
            })
        }
    }
    const [readOneDepartment, { loading: loadingReadOneDepartment }] =
        useLazyQuery(ReadOneDepartment, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readOneDepartment
                setDepartment(data)
                setIsParent(data.parentID === '0')
                const deptMemberIDs = data.seaLogsMembers.nodes.map(
                    (m: any) => m.id,
                )
                setDepartmentMemberIDs(deptMemberIDs)
            },
            onError: (error: any) => {
                console.error('readOneDepartment', error)
            },
        })
    const loadDepartment = async () => {
        await readOneDepartment({
            variables: {
                id: departmentId,
            },
        })
    }
    const handleOnChangeParent = (item: any) => {
        setDepartment({ ...department, parentID: item.value })
    }
    const handleOnChangeMember = (item: any) => {
        setDepartmentMemberIDs(item.map((i: any) => i.value))
    }
    useEffect(() => {
        if (departmentId > 0) {
            loadDepartment()
        }
    }, [departmentId])

    useEffect(() => {
        preventCrewAccess()
    }, [])
    return (
        <div className="w-full p-0">
            {isUserAdmin === false ? (
                <Loading errorMessage="Oops! You do not have the permission to view this section." />
            ) : (
                <>
                    <div className="flex justify-between pb-4 pt-3">
                        <Heading className="font-light font-monasans text-3xl dark:text-white">
                            {departmentId === 0 ? 'New' : 'Edit'} Department
                        </Heading>
                    </div>
                    {!department && departmentId > 0 ? (
                        <DepartmentFormSkeleton />
                    ) : (
                        <div className="px-0 md:px-4 pt-4 border-t dark:text-white">
                            <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                                <div className="my-4 text-xl">
                                    Department Details
                                    <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                                        Lorem ipsum dolor sit amet consectetur
                                        adipisicing elit. Facilis possimus harum
                                        eaque itaque est id reprehenderit
                                        excepturi eius temporibus, illo officia
                                        amet nobis sapiente dolorem ipsa earum
                                        adipisci recusandae cumque.
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <div className="flex flex-col w-full gap-4">
                                        <div className="w-full">
                                            <div className="w-full my-4 flex flex-col">
                                                <label className="mb-1 text-sm">
                                                    Name
                                                </label>
                                                <input
                                                    name="title"
                                                    className={classes.input}
                                                    type="text"
                                                    defaultValue={
                                                        department?.title
                                                    }
                                                    required
                                                    onChange={
                                                        handleInputOnChange
                                                    }
                                                />
                                                {formErrors?.title && (
                                                    <small className="text-red-500">
                                                        {formErrors.title}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                        {!isParent && (
                                            <div className="w-full">
                                                <div className="w-full my-4 flex flex-col">
                                                    <label className="mb-1 text-sm">
                                                        Head Department
                                                    </label>
                                                    <DepartmentDropdown
                                                        excludeId={departmentId}
                                                        value={
                                                            department.parentID
                                                        }
                                                        onChange={
                                                            handleOnChangeParent
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {department.children?.nodes.length >
                                            0 && (
                                            <div className="px-0 md:px-4 pt-4 border-t  dark:text-gray-100">
                                                <div className="grid grid-cols-3 gap-6 py-4 px-4">
                                                    <div>Sub Departments</div>
                                                    <div className="col-span-2">
                                                        {department.children.nodes.map(
                                                            (child: any) => (
                                                                <div
                                                                    key={
                                                                        child.id
                                                                    }
                                                                    className="mb-2">
                                                                    <Link
                                                                        href={`/department/info?id=${child.id}`}
                                                                        className="flex items-center">
                                                                        <div className="font-normal text-medium group-hover:text-emerald-600">
                                                                            {
                                                                                child.title
                                                                            }
                                                                        </div>
                                                                    </Link>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="px-0 md:px-4 pt-4 border-t  dark:text-gray-100">
                                            <div className="grid grid-cols-3 gap-6 py-4 px-4">
                                                <div>Members</div>
                                                <div className="col-span-2">
                                                    <CrewMultiSelectDropdown
                                                        value={
                                                            departmentMemberIDs
                                                        }
                                                        onChange={
                                                            handleOnChangeMember
                                                        }
                                                        filterByAdmin={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr className="mb-4" />
                            <div className="flex justify-end px-4 pb-4 pt-4">
                                <Link
                                    href={
                                        departmentId == 0
                                            ? '/department'
                                            : `/department/info?id=${departmentId}`
                                    }
                                    className={`inline-flex justify-center items-center`}>
                                    <Button className="group rounded-md mr-8 text-sm text-gray-600 dark:text-gray-100 hover:text-gray-600">
                                        Cancel
                                    </Button>
                                </Link>

                                <Button
                                    onPress={handleSave}
                                    isDisabled={
                                        loadingCreateDepartment ||
                                        loadingUpdateDepartment ||
                                        loadingReadOneDepartment
                                    }
                                    className="group inline-flex justify-center items-center rounded-md bg-sky-700 px-4 py-2 text-sm text-white shadow-sm hover:bg-white hover:text-sky-800 ring-1 ring-sky-700">
                                    <svg
                                        className="-ml-0.5 mr-1.5 h-5 w-5 border rounded-full bg-sky-300 group-hover:bg-sky-700 group-hover:text-white"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                            clipRule="evenodd"></path>
                                    </svg>
                                    {departmentId === 0
                                        ? 'Create Department'
                                        : 'Update Department'}
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default DepartmentForm
