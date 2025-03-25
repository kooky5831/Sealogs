import Skeleton from '@/app/components/Skeleton'
import { useEffect, useState } from 'react'
import Select from 'react-select'
import { getDepartmentList, getSeaLogsMembersList } from '@/app/lib/actions'
import { isEmpty } from 'lodash'
import { AlertDialog } from '@/app/components/Components'
import { Heading } from 'react-aria-components'
import { CREATE_USER } from '@/app/lib/graphQL/mutation'
import { useLazyQuery, useMutation } from '@apollo/client'
import { classes } from '@/app/components/GlobalClasses'
import { READ_ONE_SEALOGS_MEMBER } from '@/app/lib/graphQL/query'
import { isAdmin } from '@/app/helpers/userHelper'

const DepartmentMultiSelectDropdown = ({
    value = [], // an array of department IDs
    onChange,
    allDepartments,
}: {
    value: any[]
    onChange: any
    allDepartments: any
}) => {
    const [departmentList, setDepartmentList] = useState([] as any)
    const [selectedIDs, setSelectedIDs] = useState([] as any)
    const [error, setError] = useState<any>(false)
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

    const handleSetDepartmentList = (allDepartment: any) => {
        if (allDepartment) {
            const departments = allDepartment?.map((item: any) => {
                return {
                    value: item.id,
                    label: item.title,
                }
            })
            setDepartmentList(departments)
        }
    }
    // getDepartmentList(handleSetDepartmentList)

    const handleOnChange = (data: any) => {
        onChange(data)
        setSelectedIDs(data)
    }

    useEffect(() => {
        if (!isEmpty(departmentList) && !isEmpty(value)) {
            setSelectedIDs(value)
        }
    }, [value, departmentList])

    useEffect(() => {
        handleSetDepartmentList(allDepartments)
    }, [])

    return (
        <>
            {isEmpty(departmentList) ? (
                <Skeleton />
            ) : (
                <>
                    <Select
                        closeMenuOnSelect={false}
                        value={
                            selectedIDs
                                ? selectedIDs.map((id: any) => {
                                      const department = departmentList.find(
                                          (c: any) => c.value === id,
                                      )
                                      return department
                                  })
                                : []
                        }
                        isMulti
                        options={
                            isAdmin()
                                ? departmentList
                                : currentDepartment
                                  ? departmentList.filter((item: any) =>
                                        currentDepartment.some(
                                            (c: any) => c.id === item.value,
                                        ),
                                    )
                                  : departmentList
                        }
                        menuPlacement="top"
                        onChange={handleOnChange}
                        placeholder="Select Department"
                        className={classes.selectMain}
                        classNames={{
                            control: () => classes.selectControl,
                            // 'block pt-2.5 pb-2 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-slblue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500 dark:bg-sldarkblue-900',
                            singleValue: () => classes.selectSingleValue,
                            dropdownIndicator: () =>
                                classes.selectDropdownIndicator,
                            indicatorSeparator: () =>
                                classes.selectIndicatorSeparator,
                            multiValue: () => classes.selectMultiValue,
                            menu: () => classes.selectMenu,
                            clearIndicator: () => classes.selectClearIndicator,
                            valueContainer: () => classes.selectValueContainer,
                            indicatorsContainer: () =>
                                classes.selectIndicatorsContainer,
                            option: () => classes.selectOption,
                        }}
                    />
                </>
            )}
        </>
    )
}

export default DepartmentMultiSelectDropdown
