'use client'
import { ReadOneDepartment } from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, Heading } from 'react-aria-components'
import Link from 'next/link'
import { SeaLogsButton } from '@/app/components/Components'
import { DepartmentInfoSkeleton } from '../skeletons'
import { preventCrewAccess } from '@/app/helpers/userHelper'

const DepartmentInfo = ({ departmentId = 0 }: { departmentId?: number }) => {
    const router = useRouter()
    if (departmentId <= 0) {
        router.push('/department')
    }
    const [department, setDepartment] = useState({} as any)
    const [isLoading, setIsLoading] = useState(true)
    const [readOneDepartment, { loading: loadingReadOneDepartment }] =
        useLazyQuery(ReadOneDepartment, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (data: any) => {
                setDepartment(data.readOneDepartment)
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
    useEffect(() => {
        if (isLoading) {
            preventCrewAccess()
            loadDepartment()
            setIsLoading(false)
        }
    }, [isLoading])
    return (
        <>
            {loadingReadOneDepartment ? (
                <DepartmentInfoSkeleton />
            ) : (
                <div className="w-full p-0">
                    <div className="flex justify-between pb-4 pt-3 items-center">
                        <Heading className="flex items-center font-light font-monasans text-3xl dark:text-white">
                            <span className="font-medium mr-2">
                                Department:
                            </span>
                            {department.title}
                        </Heading>
                        <div className="flex">
                            <SeaLogsButton
                                text="Department List"
                                type="text"
                                className="hover:text-sllightblue-1000"
                                icon="back_arrow"
                                color="slblue"
                                link={'/department'}
                            />
                            <Link
                                href={`/department/edit?id=${department.id}`}
                                className="group block m-1">
                                <Button className="group inline-flex justify-center items-center mr-2 rounded-md bg-sky-100 px-3 py-2 text-sm text-sky-600 shadow-sm hover:bg-white hover:text-sky-600 ring-1 ring-sky-600">
                                    <svg
                                        className="-ml-0.5 mr-1.5 h-5 w-5 group-hover:border-white"
                                        viewBox="0 0 36 36"
                                        fill="currentColor"
                                        aria-hidden="true">
                                        <path d="M33.87,8.32,28,2.42a2.07,2.07,0,0,0-2.92,0L4.27,23.2l-1.9,8.2a2.06,2.06,0,0,0,2,2.5,2.14,2.14,0,0,0,.43,0L13.09,32,33.87,11.24A2.07,2.07,0,0,0,33.87,8.32ZM12.09,30.2,4.32,31.83l1.77-7.62L21.66,8.7l6,6ZM29,13.25l-6-6,3.48-3.46,5.9,6Z"></path>
                                    </svg>
                                    Edit
                                </Button>
                            </Link>
                        </div>
                    </div>
                    {department.parentID > 0 && (
                        <div className="px-0 md:px-4 pt-4 border-t border-b dark:text-gray-100">
                            <div className="grid grid-cols-3 gap-6 py-4 px-4">
                                <div>Head Department</div>
                                <div className="col-span-2">
                                    <div
                                        key={department.parent.id}
                                        className="mb-2">
                                        <Link
                                            href={`/department/info?id=${department.parent.id}`}
                                            className="flex items-center">
                                            <div className="font-normal text-medium group-hover:text-emerald-600">
                                                {department.parent.title}
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {department.children?.nodes.length > 0 && (
                        <div className="px-0 md:px-4 pt-4 border-t border-b dark:text-gray-100">
                            <div className="grid grid-cols-3 gap-6 py-4 px-4">
                                <div>Sub Departments</div>
                                <div className="col-span-2">
                                    {department.children.nodes.map(
                                        (child: any) => (
                                            <div
                                                key={child.id}
                                                className="mb-2">
                                                <Link
                                                    href={`/department/info?id=${child.id}`}
                                                    className="flex items-center">
                                                    <div className="font-normal text-medium group-hover:text-emerald-600">
                                                        {child.title}
                                                    </div>
                                                </Link>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {department.seaLogsMembers?.nodes.length > 0 && (
                        <div className="px-0 md:px-4 pt-4 border-t border-b dark:text-gray-100">
                            <div className="grid grid-cols-3 gap-6 py-4 px-4">
                                <div>Members</div>
                                <div className="col-span-2">
                                    {department.seaLogsMembers.nodes.map(
                                        (member: any) => (
                                            <div
                                                key={member.id}
                                                className="mb-2">
                                                <Link
                                                    href={`/crew/info?id=${member.id}`}
                                                    className="flex items-center">
                                                    <div className="font-normal text-medium group-hover:text-emerald-600">
                                                        {`${member.firstName || ''} ${member.surname || ''}`}
                                                    </div>
                                                </Link>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default DepartmentInfo
