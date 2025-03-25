'use client'
import React, { useEffect, useState } from 'react'
import {
    Button,
    DialogTrigger,
    Heading,
    Popover,
    Link,
} from 'react-aria-components'
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline'
import { List } from '@/app/ui/skeletons'
import {
    PopoverWrapper,
    TableWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import { getSupplier } from '@/app/lib/actions'
import Filter from '@/app/components/Filter'
import { useLazyQuery } from '@apollo/client'
import { GET_SUPPLIER } from '@/app/lib/graphQL/query'
import { isEmpty, trim } from 'lodash'

export default function SupplierList() {
    const [suppliers, setSuppliers] = useState([] as any)
    const [filter, setFilter] = useState({} as SearchFilter)
    const [keywordFilter, setKeywordFilter] = useState([] as any)
    // getSupplier(setSuppliers)

    const [isLoading, setIsLoading] = useState(true)
    const [querySupplier] = useLazyQuery(GET_SUPPLIER, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readSuppliers.nodes
            if (data) {
                setSuppliers(data)
            }
        },
        onError: (error: any) => {
            console.error('querySupplier error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadSupplier()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadSupplier = async (
        searchFilter: SearchFilter = {},
        searchkeywordFilter: any = keywordFilter,
    ) => {
        if (searchkeywordFilter.length > 0) {
            const promises = searchkeywordFilter.map(
                async (keywordFilter: any) => {
                    return await querySupplier({
                        variables: {
                            filter: { ...searchFilter, ...keywordFilter },
                        },
                    })
                },
            )
            let responses = await Promise.all(promises)
            // filter out empty results
            responses = responses.filter(
                (r: any) => r.data.readSuppliers.nodes.length > 0,
            )
            // flatten results
            responses = responses.flatMap(
                (r: any) => r.data.readSuppliers.nodes,
            )
            // filter out duplicates
            responses = responses.filter(
                (value: any, index: any, self: any) =>
                    self.findIndex((v: any) => v.id === value.id) === index,
            )
            setSuppliers(responses)
        } else {
            await querySupplier({
                variables: {
                    filter: searchFilter,
                },
            })
        }
    }
    const handleFilterOnChange = ({ type, data }: any) => {
        const searchFilter: SearchFilter = { ...filter }
        let keyFilter = keywordFilter
        if (type === 'keyword') {
            if (!isEmpty(trim(data.value))) {
                keyFilter = [
                    { name: { contains: data.value } },
                    { website: { contains: data.value } },
                    { phone: { contains: data.value } },
                    { email: { contains: data.value } },
                    { address: { contains: data.value } },
                ]
            } else {
                keyFilter = [];
            }
        }
        setFilter(searchFilter)
        setKeywordFilter(keyFilter)
        loadSupplier(searchFilter, keyFilter)
    }
    return (
        <div className="w-full py-0 dark:text-white">
            <div className="flex justify-end pt-0 items-center">
                <div className="flex items-center">
                    <SeaLogsButton
                        link={`/inventory/suppliers/new`}
                        text="New Supplier"
                        color="sky"
                        type="primary"
                        icon="check"
                    />
                </div>
            </div>
            <Filter onChange={handleFilterOnChange} />
            <div className="">
                <div className="flex w-full justify-start flex-col md:flex-row items-start">
                    {suppliers ? (
                        <TableWrapper
                            headings={[
                                'Suppliers:firstHead',
                                'Address',
                                'Website',
                                'Contact People',
                                'Notes:last',
                            ]}>
                            {(suppliers as any[])
                                .filter(
                                    (supplier: any) => supplier.name !== null,
                                )
                                .map((supplier: any, index: number) => (
                                    <tr
                                        key={index}
                                        className={`border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                        <td className="px-2 lg:px-6 py-3 whitespace-nowrap text-left">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                <Link
                                                    href={`/inventory/suppliers/view?id=${supplier.id}`}>
                                                    {supplier.name}
                                                </Link>
                                                {supplier.phone ? (
                                                    <div className="inline-block rounded px-3 py-1 ml-3 font-semibold bg-green-100 text-green-900">
                                                        {supplier.phone}
                                                    </div>
                                                ) : (
                                                    ''
                                                )}
                                            </div>
                                            <div className="text-xs tracking-[.02px] text-gray-500 dark:text-gray-400">
                                                {supplier.email
                                                    ? supplier.email
                                                    : ''}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-gray-200">
                                                {supplier.address
                                                    ? supplier.address
                                                    : '-'}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 whitespace-nowrap">
                                            <a
                                                href={`https://${supplier.website ? supplier.website : '-'}`}
                                                target="_blank">
                                                <div className="text-sm text-gray-900 dark:text-gray-200">
                                                    {supplier.website
                                                        ? supplier.website
                                                        : '-'}
                                                </div>
                                            </a>
                                        </td>
                                        <td className="px-2 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-gray-200">
                                                {supplier.phone
                                                    ? supplier.phone
                                                    : ''}
                                            </div>
                                            <div className="text-sm text-gray-900 dark:text-gray-200">
                                                {supplier.email
                                                    ? supplier.email
                                                    : ''}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-gray-200">
                                                <DialogTrigger>
                                                    <Button className="text-base ml-2 outline-none">
                                                        <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-gray-600 dark:text-white" />
                                                    </Button>
                                                    <Popover>
                                                        <PopoverWrapper>
                                                            Notes placeholder
                                                        </PopoverWrapper>
                                                    </Popover>
                                                </DialogTrigger>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </TableWrapper>
                    ) : (
                        <List />
                    )}
                </div>
            </div>
        </div>
    )
}
