'use client'
import React, { useEffect, useState } from 'react'
import {
    Button,
    DialogTrigger,
    Popover,
    Link,
    ComboBoxStateContext,
} from 'react-aria-components'
import { List } from '@/app/ui/skeletons'
import { TableWrapper, SeaLogsButton } from '@/app/components/Components'
import { getSupplier, isOverDueTask } from '@/app/lib/actions'
import Filter from '@/app/components/Filter'
import { useLazyQuery } from '@apollo/client'
import { GET_INVENTORIES } from '@/app/lib/graphQL/query'
import { isEmpty, trim } from 'lodash'
import { classes } from '@/app/components/GlobalClasses'
import {
    ChatBubbleBottomCenterTextIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function InventoryList() {
    const router = useRouter()
    const [inventories, setInventories] = useState<any>()
    const [currentCategory, setCurrentCategory] = useState(0)
    const [suppliers, setSuppliers] = useState<any>()
    const [filter, setFilter] = useState({} as SearchFilter)
    const [isLoading, setIsLoading] = useState(true)
    const [keywordFilter, setKeywordFilter] = useState([] as any)
    const [permissions, setPermissions] = useState<any>(false)
    const [edit_inventory, setEdit_inventory] = useState<any>(false)

    const init_permissions = () => {
        if (permissions) {
            if (hasPermission('EDIT_INVENTORY', permissions)) {
                setEdit_inventory(true)
            } else {
                setEdit_inventory(false)
            }
        }
    }

    useEffect(() => {
        setPermissions(getPermissions)
        init_permissions()
    }, [])

    useEffect(() => {
        init_permissions()
    }, [permissions])

    useEffect(() => {
        if (isLoading) {
            loadInventories()
            setIsLoading(false)
        }
    }, [isLoading])
    const [queryInventories] = useLazyQuery(GET_INVENTORIES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readInventories.nodes
            if (data) {
                setInventories(data)
            }
        },
        onError: (error: any) => {
            console.error('queryInventoriesEntry error', error)
        },
    })
    const loadInventories = async (
        searchFilter: SearchFilter = {},
        searchkeywordFilter: any = keywordFilter,
    ) => {
        if (searchkeywordFilter.length > 0) {
            const promises = searchkeywordFilter.map(
                async (keywordFilter: any) => {
                    return await queryInventories({
                        variables: {
                            filter: { ...searchFilter, ...keywordFilter },
                        },
                    })
                },
            )
            let responses = await Promise.all(promises)
            // filter out empty results
            responses = responses.filter(
                (r: any) => r.data.readInventories.nodes.length > 0,
            )
            // flatten results
            responses = responses.flatMap(
                (r: any) => r.data.readInventories.nodes,
            )
            // filter out duplicates
            responses = responses.filter(
                (value: any, index: any, self: any) =>
                    self.findIndex((v: any) => v.id === value.id) === index,
            )
            setInventories(responses)
        } else {
            await queryInventories({
                variables: {
                    filter: searchFilter,
                },
            })
        }
    }

    getSupplier(setSuppliers)

    const handleFilterOnChange = ({ type, data }: any) => {
        const searchFilter = { ...filter }
        if (type === 'vessel') {
            if (data) {
                searchFilter.vesselID = { eq: +data?.value }
            } else {
                delete searchFilter.vesselID
            }
        }
        if (type === 'supplier') {
            if (data) {
                searchFilter.suppliers = { id: { in: [+data?.value] } }
            } else {
                delete searchFilter.suppliers
            }
        }
        let keyFilter = keywordFilter
        if (type === 'keyword') {
            if (!isEmpty(trim(data?.value))) {
                keyFilter = [
                    { item: { contains: data.value } },
                    { title: { contains: data.value } },
                    { productCode: { contains: data.value } },
                    { description: { contains: data.value } },
                    { comments: { contains: data.value } },
                ]
            } else {
                keyFilter = []
            }
        }
        if (type === 'category') {
            if (data?.value) {
                searchFilter.categories = {
                    id: { in: [+data.value] },
                }
            } else {
                delete searchFilter.categories
            }
        }
        setFilter(searchFilter)
        setKeywordFilter(keyFilter)
        loadInventories(searchFilter, keyFilter)
    }
    return (
        <div className="w-full py-0">
            <div className="flex justify-end pt-0 items-center">
                <div className="flex items-center">
                    <SeaLogsButton
                        link={`/inventory/new`}
                        action={() => {
                            if (!edit_inventory) {
                                toast.error(
                                    'You do not have permission to create new inventory item',
                                )
                                return
                            }
                            router.push('/inventory/new')
                        }}
                        text="New Inventory Item"
                        type="primary"
                        color="slblue"
                        icon="inventory"
                    />
                </div>
            </div>
            <Filter onChange={handleFilterOnChange} list={inventories} />
            <div className="flex w-full justify-start flex-col md:flex-row items-start">
                {inventories && suppliers ? (
                    <InventortList
                        inventories={inventories}
                        suppliers={suppliers}
                        currentCategory={currentCategory}
                        isVesselView={false}
                    />
                ) : (
                    <List />
                )}
            </div>
        </div>
    )
}

export const InventortList = ({
    inventories,
    currentCategory = 0,
    isVesselView,
}: any) => {
    const checkOverdueTasks = (inventory: any) => {
        let blank = <p></p>
        let overdueTextWarning = (
            //<ExclamationTriangleIcon className={`h-7 w-7 text-red-500`} />
            <svg
                viewBox="0 0 98.75 98.7516"
                stroke="#022450"
                strokeMiterlimit="10"
                strokeWidth=".75px"
                className={`h-7 w-7`}>
                <path
                    d="M49.375,1.1898c26.5687,0,48.1852,21.6165,48.1852,48.186s-21.6165,48.186-48.1852,48.186S1.1898,75.9453,1.1898,49.3758,22.8063,1.1898,49.375,1.1898Z"
                    fill="#ffffff"
                />
                <path
                    d="M49.375,98.3766c27.0191,0,49-21.9817,49-49.0008S76.3941.375,49.375.375.375,22.3567.375,49.3758s21.9809,49.0008,49,49.0008ZM49.375,1.1898c26.5687,0,48.1852,21.6165,48.1852,48.186s-21.6165,48.186-48.1852,48.186S1.1898,75.9453,1.1898,49.3758,22.8063,1.1898,49.375,1.1898Z"
                    fill="#022450"
                />
                <path
                    d="M40.1112,55.766h18.5277c.3237,0,.5877-.2875.5877-.6427V16.0185c0-.3552-.264-.6427-.5877-.6427h-18.5277c-.3237,0-.5877.2875-.5877.6427v39.1048c0,.3552.264.6427.5877.6427Z"
                    fill="#2a99ea"
                    strokeWidth="1.1315px"
                />
                <path
                    d="M49.375,84.3758c5.82,0,10.5564-4.7352,10.5564-10.5564s-4.7364-10.5564-10.5564-10.5564-10.5564,4.7352-10.5564,10.5564,4.7364,10.5564,10.5564,10.5564Z"
                    fill="#2a99ea"
                    strokeWidth="1.1315px"
                />
            </svg>
        )

        let overdueText = (
            <img
                src="/sealogs-ok-check.svg"
                alt="Warning"
                className="ml-3 mr-1 h-9 w-9 flex-shrink-0 mx-auto"
            />
        )

        let tasks = inventory.componentMaintenanceChecks.nodes
        let activeTasks = tasks
            .filter((task: any) => {
                return (
                    task.archived === false &&
                    isOverDueTask(task).status !== 'Completed'
                )
            })
            .map((task: any) => ({
                ...task,
                isOverDue: isOverDueTask(task),
            }))
            .sort((taskA: any, taskB: any) => {
                const dateA: any = new Date(taskA.expires)
                const dateB: any = new Date(taskB.expires)
                return dateA - dateB
            })

        let AllsaveAsDraft = tasks.filter((task: any) => {
            return task.status === 'Save_As_Draft'
        })

        let AllOpen = tasks.filter((task: any) => {
            return task.status === 'Open'
        })

        if (tasks.length == 0) {
            return blank
        } else if (activeTasks.length > 0) {
            return overdueTextWarning
        } else if (!activeTasks.length) {
            return overdueText
        } else if (AllsaveAsDraft.length > 0) {
            return overdueTextWarning
        }

        // return overdueText
    }

    const [permissions, setPermissions] = useState<any>(false)
    const [view_inventory, setView_inventory] = useState<any>(false)

    const init_permissions = () => {
        if (permissions) {
            if (hasPermission('VIEW_INVENTORY', permissions)) {
                setView_inventory(true)
            } else {
                setView_inventory(false)
            }
        }
    }

    useEffect(() => {
        setPermissions(getPermissions)
        init_permissions()
    }, [])

    useEffect(() => {
        init_permissions()
    }, [permissions])

    return (
        <div className="overflow-x-auto w-full">
            <TableWrapper headings={[]}>
                <tr className='hidden md:table-row'>
                    <td></td>
                    <td className="hidden md:table-cell text-left p-3 border-b border-slblue-200">
                        <label className={classes.label}>Location</label>
                    </td>
                    <td className="text-center p-3 border-b border-slblue-200">
                        <label className={classes.label}>Maintenance</label>
                    </td>
                    <td className="text-left p-3 border-b border-slblue-200">
                        <label className={classes.label}>Categories</label>
                    </td>
                    <td className="text-left p-3 border-b border-slblue-200">
                        <label className={classes.label}>Suppliers</label>
                    </td>
                </tr>
                {inventories?.map((inventory: any) => (
                    <tr
                        key={inventory.id}
                        className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90 ${inventory.categories.nodes.find((cat: any) => cat.id == currentCategory) || currentCategory === 0 ? '' : 'hidden'}`}>
                        <td className="p-2 items-center border-y md:border-0 border-slblue-100 table-cell md:hidden">
                            <div className="flex text-start p-2 min-w-3/8 w-auto align-top">
                                <span className="font-light text-foreground">
                                    {view_inventory ? (
                                        <Link
                                            href={`/inventory/view/?id=${inventory.id}`}
                                            className="group-hover:text-sllightblue-1000">
                                            {inventory.quantity +
                                                ' x ' +
                                                inventory.item}
                                        </Link>
                                    ) : (
                                        <span className="group-hover:text-sllightblue-1000">
                                            {inventory.quantity +
                                                ' x ' +
                                                inventory.item}
                                        </span>
                                    )}
                                </span>
                            </div>
                        
                            {isVesselView ? (
                                <div className="p-2 align-top">
                                    <span>{inventory.location}</span>
                                </div>
                            ) : (
                                <div className="p-2 align-top">
                                    {inventory.vessel?.title || ''}
                                </div>
                            )}
                            <div className="p-2 align-top justify-center">
                                <div className="flex justify-center items-center">
                                    {checkOverdueTasks(inventory)}
                                </div>
                            </div>
                            <div className="p-2 align-top">
                                {inventory.categories &&
                                    inventory.categories.nodes &&
                                    Array.isArray(inventory.categories.nodes) &&
                                    inventory.categories.nodes.length > 0 &&
                                    inventory.categories.nodes.map(
                                        (cat: any, idx: number) => {
                                            if (idx < 2) {
                                                if (cat.name) {
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="bg-slblue-50 font-light rounded-lg p-2 border m-1 border-slblue-200 text-nowrap">
                                                            {cat.name}
                                                        </div>
                                                    )
                                                }
                                            }

                                            if (idx === 2) {
                                                if (cat.name) {
                                                    return (
                                                        <DialogTrigger key={cat.id}>
                                                            <Button className="inline-block bg-slblue-50 text-sllightblue-800 border border-slblue-200 font-light rounded-lg text-sm m-1 p-2 outline-none dark:text-sldarkblue-800">
                                                                +{' '}
                                                                {inventory
                                                                    .categories
                                                                    .nodes.length -
                                                                    2}{' '}
                                                                more
                                                            </Button>
                                                            <Popover>
                                                                <div className="p-0 w-64 max-h-full bg-slblue-100 rounded 0">
                                                                    {inventory.categories.nodes
                                                                        .slice(2)
                                                                        .map(
                                                                            (
                                                                                sCat: any,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        sCat.id
                                                                                    }
                                                                                    className="flex cursor-pointer hover:bg-sllightblue-1000 items-center overflow-auto ps-3 py-2">
                                                                                    <div className="text-sm">
                                                                                        <a
                                                                                            href={`/vessel/info?id=${sCat.id}`}>
                                                                                            {
                                                                                                sCat.name
                                                                                            }
                                                                                        </a>
                                                                                    </div>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                </div>
                                                            </Popover>
                                                        </DialogTrigger>
                                                    )
                                                }
                                            }
                                        },
                                    )}
                            </div>
                            <div className="p-2 align-top">
                                {inventory.suppliers.nodes &&
                                    inventory.suppliers.nodes.map(
                                        (supplier: any) => (
                                            <div
                                                key={supplier.id}
                                                className="bg-slblue-50 font-light rounded-lg p-2 border m-1 border-slblue-200 text-nowrap">
                                                <Link
                                                    href={`/inventory/suppliers/view?id=${supplier.id}`}
                                                    className="">
                                                    {supplier.name}
                                                </Link>
                                            </div>
                                        ),
                                    )}
                            </div>
                        </td>
                        <td className="hidden md:table-cell p-2 min-w-3/8 w-auto align-top">
                            <div className="flex text-start">
                                <span className="font-light text-foreground">
                                    {view_inventory ? (
                                        <Link
                                            href={`/inventory/view/?id=${inventory.id}`}
                                            className="group-hover:text-sllightblue-1000">
                                            {inventory.quantity +
                                                ' x ' +
                                                inventory.item}
                                        </Link>
                                    ) : (
                                        <span className="group-hover:text-sllightblue-1000">
                                            {inventory.quantity +
                                                ' x ' +
                                                inventory.item}
                                        </span>
                                    )}
                                </span>
                            </div>
                        </td>
                        {isVesselView ? (
                            <td className="hidden md:table-cell p-2 align-top">
                                <span>{inventory.location}</span>
                            </td>
                        ) : (
                            <td className="hidden md:table-cell p-2 align-top">
                                {inventory.vessel?.title || ''}
                            </td>
                        )}
                        <td className="hidden md:table-cell p-2 align-top justify-center">
                            <div className="flex justify-center items-center">
                                {checkOverdueTasks(inventory)}
                            </div>
                        </td>
                        <td className="hidden md:table-cell p-2 align-top">
                            {inventory.categories &&
                                inventory.categories.nodes &&
                                Array.isArray(inventory.categories.nodes) &&
                                inventory.categories.nodes.length > 0 &&
                                inventory.categories.nodes.map(
                                    (cat: any, idx: number) => {
                                        if (idx < 2) {
                                            if (cat.name) {
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="bg-slblue-50 font-light rounded-lg p-2 border m-1 border-slblue-200 text-nowrap">
                                                        {cat.name}
                                                    </div>
                                                )
                                            }
                                        }

                                        if (idx === 2) {
                                            if (cat.name) {
                                                return (
                                                    <DialogTrigger key={cat.id}>
                                                        <Button className="inline-block bg-slblue-50 text-sllightblue-800 border border-slblue-200 font-light rounded-lg text-sm m-1 p-2 outline-none dark:text-sldarkblue-800">
                                                            +{' '}
                                                            {inventory
                                                                .categories
                                                                .nodes.length -
                                                                2}{' '}
                                                            more
                                                        </Button>
                                                        <Popover>
                                                            <div className="p-0 w-64 max-h-full bg-slblue-100 rounded 0">
                                                                {inventory.categories.nodes
                                                                    .slice(2)
                                                                    .map(
                                                                        (
                                                                            sCat: any,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    sCat.id
                                                                                }
                                                                                className="flex cursor-pointer hover:bg-sllightblue-1000 items-center overflow-auto ps-3 py-2">
                                                                                <div className="text-sm">
                                                                                    <a
                                                                                        href={`/vessel/info?id=${sCat.id}`}>
                                                                                        {
                                                                                            sCat.name
                                                                                        }
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                            </div>
                                                        </Popover>
                                                    </DialogTrigger>
                                                )
                                            }
                                        }
                                    },
                                )}
                        </td>
                        <td className="hidden md:table-cell p-2 align-top">
                            {inventory.suppliers.nodes &&
                                inventory.suppliers.nodes.map(
                                    (supplier: any) => (
                                        <div
                                            key={supplier.id}
                                            className="bg-slblue-50 font-light rounded-lg p-2 border m-1 border-slblue-200 text-nowrap">
                                            <Link
                                                href={`/inventory/suppliers/view?id=${supplier.id}`}
                                                className="">
                                                {supplier.name}
                                            </Link>
                                        </div>
                                    ),
                                )}
                        </td>
                    </tr>
                ))}
            </TableWrapper>
        </div>
    )
}
