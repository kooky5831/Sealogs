import { GET_SUPPLIER } from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'

import { useEffect, useState } from 'react'
import Select from 'react-select'
import { isEmpty } from 'lodash'
import Skeleton from '@/app/components/Skeleton'
import { classes } from '@/app/components/GlobalClasses'

const SupplierDropdown = ({ 
    value, 
    onChange, 
    isClearable = false, 
    supplierIdOptions = [],
}: any) => {
    const [isLoading, setIsLoading] = useState(true)
    const [supplierList, setSupplierList] = useState([] as any)
    const [selectedSupplier, setSelectedSupplier] = useState([] as any)
    const [allSupplierList, setAllSupplierList] = useState([] as any)
    const [querySupplierList, { loading: querySupplierListLoading }] =
        useLazyQuery(GET_SUPPLIER, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readSuppliers.nodes

                if (data) {
                    const filteredData = data.filter(
                        (supplier: any) => !supplier.archived,
                    )
                    const formattedData = filteredData.map((supplier: any) => ({
                        value: supplier.id,
                        label: supplier.name || 'No Name',
                    }))
                    formattedData.sort((a: any, b: any) =>
                        a.label.localeCompare(b.label),
                    )
                    setSupplierList(formattedData)
                    setAllSupplierList(formattedData)
                    setSelectedSupplier(
                        formattedData.find(
                            (supplier: any) => supplier.value === value,
                        ),
                    )
                }
            },
            onError: (error: any) => {
                console.error('querySupplierList error', error)
            },
        })
    const loadSupplierList = async () => {
        await querySupplierList()
    }
    useEffect(() => {
        if (isLoading) {
            loadSupplierList()
            setIsLoading(false)
        }
    }, [isLoading])
    useEffect(() => {
        setSelectedSupplier(
            supplierList.find((supplier: any) => supplier.value === value),
        )
    }, [value])
    useEffect(() => {
        if (supplierIdOptions.length > 0) {
            const filteredVesselList = allSupplierList.filter((v: any) =>
                supplierIdOptions.includes(v.value),
            )
            setSupplierList(filteredVesselList)
        } else {
            // If no options are provided, show the full list
            setSupplierList(allSupplierList)
        }
    }, [supplierIdOptions, allSupplierList])
    return (
        <>
            {querySupplierListLoading ? (
                <Skeleton />
            ) : (
                <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                    <div className="flex items-center">
                        {!isLoading && (
                            <Select
                                id="supplier-dropdown"
                                closeMenuOnSelect={true}
                                options={supplierList}
                                menuPlacement="top"
                                defaultValue={selectedSupplier}
                                value={selectedSupplier}
                                onChange={onChange}
                                isClearable={isClearable}
                                placeholder="Supplier"
                                className={classes.selectMain}
                                classNames={{
                                    control: () =>
                                        classes.selectControl + ' w-full',
                                    singleValue: () =>
                                        classes.selectSingleValue,
                                    menu: () => classes.selectMenu,
                                    option: () => classes.selectOption,
                                }}
                                styles={{
                                    container: (provided) => ({
                                        ...provided,
                                        width: '100%',
                                    }),
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default SupplierDropdown
