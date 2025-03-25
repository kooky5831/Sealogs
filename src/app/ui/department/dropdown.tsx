import { useEffect, useState } from 'react'
import Select from 'react-select'
import Skeleton from '@/app/components/Skeleton'
import { useLazyQuery } from '@apollo/client'
import { ReadDepartments } from '@/app/lib/graphQL/query'
import { repeat } from 'lodash'
import { classes } from '@/app/components/GlobalClasses'

const DepartmentDropdown = ({
    value = 0,
    onChange,
    excludeId = 0,
    parentsOnly = false,
    disabled = false,
}: any) => {
    const [departments, setDepartments] = useState([] as any)
    const [isLoading, setIsLoading] = useState(true)
    const [defaultValue, setDefaultValue] = useState({} as any)
    const [defaultOptions, setDefaultOptions] = useState([] as any)
    const allOption = {
        value: '0',
        label: 'All Departments',
        level: 0,
    }
    const customStyles = {
        option: (provided: any, state: any) => ({
            ...provided,
            color: !state.data.isParent && '#7B8794',
        }),
    }
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
                let data = response.readDepartments.nodes
                if (parentsOnly) {
                    data = data.filter((d: any) => {
                        return +d.parentID === 0
                    })
                }
                setDepartments(data)

                const options = renderDepartment(data).map((d: any) => ({
                    value: d.id,
                    label: repeat(` `, d.level) + d.title,
                    level: d.level,
                }))
                setDefaultOptions([allOption, ...options])
            },
            onError: (error: any) => {
                console.error('readDepartments', error)
            },
        },
    )
    const loadDepartments = async () => {
        await readDepartments({
            variables: {
                filter: {
                    id: { ne: excludeId },
                },
            },
        })
    }
    useEffect(() => {
        if (isLoading) {
            loadDepartments()
            setIsLoading(false)
        }
        if (value > 0) {
            const selectedDepartment = departments.find(
                (d: any) => d.id === value,
            )
            setDefaultValue({
                value: selectedDepartment?.id,
                label: selectedDepartment?.title,
            })
        } else {
            setDefaultValue(allOption)
        }
    }, [isLoading, value, departments])
    return (
        <>
            {readDepartmentsLoading ? (
                <Skeleton />
            ) : (
                <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                    <div className="flex items-center">
                        <Select
                            id="department-dropdown"
                            closeMenuOnSelect={true}
                            options={defaultOptions}
                            menuPlacement="top"
                            value={defaultValue}
                            onChange={onChange}
                            placeholder="Select department"
                            isDisabled={disabled}
                            className={classes.selectMain}
                            classNames={{
                                control: () =>
                                    'block py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                singleValue: () => 'dark:!text-white',
                                menu: () => classes.selectMenu,
                                option: () => classes.selectOption,
                            }}
                            styles={customStyles}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default DepartmentDropdown
