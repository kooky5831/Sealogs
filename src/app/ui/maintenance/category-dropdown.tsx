import { GET_MAINTENANCE_CATEGORY } from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import Select from 'react-select'
import Skeleton from '@/app/components/Skeleton'
import { classes } from '@/app/components/GlobalClasses'

const MaintenanceCategoryDropdown = ({
    value,
    onChange,
    isClearable = false,
}: any) => {
    const [isLoading, setIsLoading] = useState(true)
    const [categoryList, setCategoryList] = useState([] as any)
    const [selectedCategory, setSelectedCategory] = useState([] as any)
    const [queryCategoryList, { loading: queryCategoryListLoading }] =
        useLazyQuery(GET_MAINTENANCE_CATEGORY, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readMaintenanceCategories.nodes

                if (data) {
                    const filteredData = data.filter(
                        (category: any) => !category.archived,
                    )
                    const formattedData = filteredData.map((category: any) => ({
                        value: category.id,
                        label: category.name || 'No Name',
                    }))
                    formattedData.sort((a: any, b: any) =>
                        a.label.localeCompare(b.label),
                    )
                    setCategoryList(formattedData)
                    setSelectedCategory(
                        formattedData.find(
                            (category: any) => category.value === value,
                        ),
                    )
                }
            },
            onError: (error: any) => {
                console.error('queryCategoryList error', error)
            },
        })
    const loadCategoryList = async () => {
        await queryCategoryList({
            variables: {
                clientID: +(localStorage.getItem('clientId') ?? 0),
            },
        })
    }
    useEffect(() => {
        if (isLoading) {
            loadCategoryList()
            setIsLoading(false)
        }
    }, [isLoading])
    useEffect(() => {
        setSelectedCategory(
            categoryList.find((category: any) => category.value === value),
        )
    }, [value])
    return (
        <>
            {queryCategoryListLoading ? (
                <Skeleton />
            ) : (
                <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                    <div className="flex items-center">
                        {!isLoading && (
                            <Select
                                id="category-dropdown"
                                closeMenuOnSelect={true}
                                options={categoryList}
                                menuPlacement="top"
                                defaultValue={selectedCategory}
                                value={selectedCategory}
                                onChange={onChange}
                                isClearable={isClearable}
                                placeholder="Category"
                                className={classes.selectMain}
                                classNames={{
                                    control: () =>
                                        classes.selectControl + ' w-full',
                                    singleValue: () =>
                                        classes.selectSingleValue,
                                    menu: () => classes.selectMenu,
                                    option: () => classes.selectOption,
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default MaintenanceCategoryDropdown
