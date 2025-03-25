import { GET_INVENTORY_CATEGORY } from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'

import { useEffect, useState } from 'react'
import Select from 'react-select'
import { isEmpty } from 'lodash'
import Skeleton from '@/app/components/Skeleton'
import { classes } from '@/app/components/GlobalClasses'

const CategoryDropdown = ({ 
    value, 
    onChange, 
    isClearable = false,
    categoryIdOptions = [],
}: any) => {
    const [isLoading, setIsLoading] = useState(true)
    const [categoryList, setCategoryList] = useState([] as any)
    const [selectedCategory, setSelectedCategory] = useState([] as any)
    const [allCategoryList, setAllCategoryList] = useState([] as any)
    const [queryCategoryList, { loading: queryCategoryListLoading }] =
        useLazyQuery(GET_INVENTORY_CATEGORY, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readInventoryCategories.nodes

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
                    setAllCategoryList(formattedData)
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
        await queryCategoryList()
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
    useEffect(() => {
        if (categoryIdOptions.length > 0) {
            const filteredVesselList = allCategoryList.filter((v: any) =>
                categoryIdOptions.includes(v.value),
            )
            setCategoryList(filteredVesselList)
        } else {
            // If no options are provided, show the full list
            setCategoryList(allCategoryList)
        }
    }, [categoryIdOptions, allCategoryList])
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
                                        classes.selectControl + ' !min-w-48',
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

export default CategoryDropdown
