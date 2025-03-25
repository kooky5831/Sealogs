'use client'
import { TableWrapper } from '@/app/components/Components'
import { ReadDepartments } from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { DepartmentListSkeleton } from '../skeletons'

const DepartmentList = () => {
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
    return (
        <div>
            {/* <Filter onChange={handleFilterOnChange} /> */}
            <div className="p-0 pt-5">
                <div className="flex w-full justify-start flex-col md:flex-row items-start">
                    <div className="w-full">
                        {readDepartmentsLoading ? (
                            <DepartmentListSkeleton />
                        ) : (
                            <>
                                <TableWrapper
                                    headings={['Departments:firstHead']}>
                                    {departments.map((department: any) => (
                                        <tr
                                            key={department.id}
                                            className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                            <th
                                                scope="row"
                                                className="flex items-center px-2 py-3 lg:px-6">
                                                <div
                                                    className={`flex items-center mb-2 pl-${4 * department.level}`}>
                                                    <Link
                                                        href={`/department/info?id=${department.id}`}
                                                        className="flex items-center">
                                                        <div className="font-normal text-medium group-hover:text-emerald-600">
                                                            {department.title}
                                                        </div>
                                                    </Link>
                                                </div>
                                            </th>
                                        </tr>
                                    ))}
                                </TableWrapper>
                                {/* <CustomPagination
                                page={page}
                                limit={limit}
                                visiblePageCount={5}
                                {...pageInfo}
                                onClick={(newPage: number) =>
                                    handleNavigationClick(newPage)
                                }
                            /> */}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DepartmentList
