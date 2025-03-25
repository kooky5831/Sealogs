'use client'
import React, { useState } from 'react'
import { Button, DialogTrigger, Heading, Popover } from 'react-aria-components'
import { QueueListIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import {
    PopoverWrapper,
    TableWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import { getInventoryCategory } from '@/app/lib/actions'

export default function InventoryCategoryList() {
    const [categories, setCategories] = useState<any>()

    getInventoryCategory(setCategories)

    return (
        <div className="w-full p-0 dark:text-white">
            <div className="flex justify-between pb-4 items-center">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    Inventory Categories
                </Heading>
                <SeaLogsButton
                    link={`/settings/inventory/category/new`}
                    text="Add New"
                    color="sky"
                    type="primary"
                    icon="check"
                />
            </div>
            <div className="pt-4">
                <div className="flex w-full justify-start flex-col md:flex-row items-start">
                    {categories && (
                        <TableWrapper
                            headings={[
                                'Name:firstHead',
                                'Abbreviation',
                                'Recent Inventories:center',
                            ]}>
                            {categories.map((category: any) => (
                                <tr
                                    key={category.id}
                                    className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                    <td className="px-2 py-3 lg:px-6">
                                        <div className="flex items-center">
                                            <span
                                                className={`font-normal text-foreground ${category.archived == true ? 'line-through text-gray-500' : 'group-hover:text-emerald-600'}`}>
                                                <Link
                                                    href={`/settings/inventory/category?categoryID=${category.id}`}
                                                    className="">
                                                    {category.name}
                                                </Link>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3">
                                        {category.abbreviation}
                                    </td>
                                    <td className="px-2 py-3 text-center">
                                        {category.inventories.nodes.length >
                                            0 && (
                                            <DialogTrigger>
                                                <Button className="text-base outline-none">
                                                    <QueueListIcon className="w-5 h-5 text-gray-600 dark:text-white" />
                                                </Button>
                                                <Popover>
                                                    <PopoverWrapper>
                                                        {category.inventories.nodes.map(
                                                            (
                                                                inventory: any,
                                                            ) => (
                                                                <Link
                                                                    key={
                                                                        inventory
                                                                    }
                                                                    href={`/inventory/view?id=${inventory.id}`}
                                                                    className="block py-2 ps-2 hover:bg-gray-400">
                                                                    {
                                                                        inventory.title
                                                                    }
                                                                </Link>
                                                            ),
                                                        )}
                                                    </PopoverWrapper>
                                                </Popover>
                                            </DialogTrigger>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </TableWrapper>
                    )}
                </div>
            </div>
        </div>
    )
}
