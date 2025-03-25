'use client'
import React, { useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { Heading, Button, ListBox, ListBoxItem } from 'react-aria-components'
import {
    GET_INVENTORY_BY_ID,
    GET_INVENTORY_CATEGORY,
    GET_SUPPLIER,
    VESSEL_LIST,
    GET_MAINTENANCE_CHECK_BY_ID,
    GET_MAINTENANCE_CHECK,
    GET_CREW_BY_IDS,
} from '@/app/lib/graphQL/query'
import Select from 'react-select'
import Creatable from 'react-select/creatable'
import Editor from '@/app/ui/editor'
import FileUpload from '@/app/ui/file-upload'
import {
    UPDATE_INVENTORY,
    CREATE_INVENTORY_CATEGORY,
    DELETE_INVENTORIES,
    CREATE_SUPPLIER,
    CREATE_SEALOGS_FILE_LINKS,
} from '@/app/lib/graphQL/mutation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { InputSkeleton, List } from '@/app/ui/skeletons'
import {
    SeaLogsButton,
    FooterWrapper,
    AlertDialog,
} from '@/app/components/Components'
import { Table } from '@/app/ui/maintenance/list'
import {
    getInventoryByID,
    getVesselList,
    getSupplier,
    getInventoryCategory,
    isOverDueTask,
} from '@/app/lib/actions'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { classes } from '@/app/components/GlobalClasses'
import FileItem from '@/app/components/FileItem'
import toast from 'react-hot-toast'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import Loading from '@/app/loading'

export default function Inventory({
    inventoryID,
    inventoryTab = '',
}: {
    inventoryID: number
    inventoryTab: string
}) {
    const [inventory, setInventory] = useState<any>()
    const [categories, setCategories] = useState<any>()
    const [selectedCategories, setSelectedCategories] = useState<any>()
    const [suppliers, setSuppliers] = useState<any>()
    const [selectedSuppliers, setSelectedSuppliers] = useState<any>()
    const [selectedLocation, setSelectedLocation] = useState<any>()
    //    const [attachments, setAttachments] = useState<any>()
    const [vessels, setVessels] = useState<any>()
    const [tasks, setTasks] = useState<any>()
    const [taskCounter, setTaskCounter] = useState<number>(0)
    const [displayTask, setDisplayTask] = useState(false)
    const [crewInfo, setCrewInfo] = useState<any>()
    const [openLocationDialog, setOpenLocationDialog] = useState(false)
    const [openSupplierDialog, setOpenSupplierDialog] = useState(false)
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false)
    const [documents, setDocuments] = useState<Array<Record<string, any>>>([])
    const [fileLinks, setFileLinks] = useState<any>([])
    const [linkSelectedOption, setLinkSelectedOption] = useState<any>([])
    const router = useRouter()

    const [permissions, setPermissions] = useState<any>(false)
    const [edit_task, setEdit_task] = useState<any>(false)
    const [edit_inventory, setEdit_inventory] = useState<any>(false)
    const [delete_inventory, setDelete_inventory] = useState<any>(false)
    const [view_inventory, setView_inventory] = useState<any>(false)
    const [description, setDescription] = useState<any>(false)

    const init_permissions = () => {
        if (permissions) {
            if (hasPermission('EDIT_TASK', permissions)) {
                setEdit_task(true)
            } else {
                setEdit_task(false)
            }
            if (hasPermission('EDIT_INVENTORY', permissions)) {
                setEdit_inventory(true)
            } else {
                setEdit_inventory(false)
            }
            if (hasPermission('DELETE_INVENTORY', permissions)) {
                setDelete_inventory(true)
            } else {
                setDelete_inventory(false)
            }
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

    const handleSetInventory = (data: any) => {
        setInventory(data)
        if (inventoryTab === 'maintenance') {
            setDisplayTask(true)
        }
        setSelectedLocation({ label: data?.location, value: 0 })
        setSelectedCategories(
            data?.categories?.nodes?.map((category: any) => ({
                label: category.name,
                value: category.id,
            })),
        )
        setSelectedSuppliers(
            data?.suppliers?.nodes?.map((supplier: any) => ({
                label: supplier.name,
                value: supplier.id,
            })),
        )
        const searchFilter: SearchFilter = { inventoryID: { eq: +inventoryID } }
        queryMaintenanceCheck({
            variables: {
                filter: searchFilter,
            },
        })
        setDocuments(data?.documents?.nodes)
        setLinkSelectedOption(
            data?.attachmentLinks?.nodes.map((link: any) => ({
                label: link.link,
                value: link.id,
            })),
        )
    }

    getInventoryByID(inventoryID, handleSetInventory)

    const handleSetVessels = (vessels: any) => {
        const activeVessels = vessels.filter((vessel: any) => !vessel.archived)
        const vesselList = activeVessels.map((item: any) => ({
            ...item,
        }))
        const appendedData = [
            // { title: '-- Other --', id: 'newLocation' },
            ...vesselList,
            { title: 'Other', id: '0' },
        ]
        setVessels(appendedData)
    }

    getVesselList(handleSetVessels)

    const handelSetSuppliers = (data: any) => {
        const suppliersList = [
            {
                label: ' ---- Create Supplier ---- ',
                value: 'newSupplier',
            },
            ...data
                ?.filter((supplier: any) => supplier.name !== null)
                .map((supplier: any) => ({
                    label: supplier.name,
                    value: supplier.id,
                })),
        ]
        setSuppliers(suppliersList)
    }

    getSupplier(handelSetSuppliers)

    const handleSetCategories = (data: any) => {
        const formattedData = [
            {
                label: ' ---- Create Category ---- ',
                value: 'newCategory',
            },
            ...data
                ?.filter(
                    (category: any) =>
                        category.name !== null && category.archived === false,
                )
                .map((category: any) => ({
                    label: category.name,
                    value: category.id,
                })),
        ]
        setCategories(formattedData)
    }

    getInventoryCategory(handleSetCategories)

    // const loadAttachments = async (attachments: any) => {
    //     await queryFile({
    //         variables: {
    //             getFileId: +attachments,
    //         },
    //     })
    // }

    const [
        queryMaintenanceCheck,
        {
            loading: queryMaintenanceCheckLoading,
            error: queryMaintenanceCheckError,
            data: queryMaintenanceCheckData,
        },
    ] = useLazyQuery(GET_MAINTENANCE_CHECK, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readComponentMaintenanceChecks.nodes
            if (data) {
                const activeTasks = data
                    .filter((task: any) => task.archived === false)
                    .map((task: any) => ({
                        ...task,
                        isOverDue: isOverDueTask(task),
                    }))
                setTasks(activeTasks)
                const taskCounter = activeTasks.filter(
                    (task: any) =>
                        task.status !== 'Completed' &&
                        task.status !== 'Save_As_Draft' &&
                        task.isOverDue.status !== 'Completed' &&
                        task.isOverDue.status !== 'Upcoming',
                ).length
                setTaskCounter(taskCounter)
                const appendedData: number[] = Array.from(
                    new Set(
                        data
                            .filter((item: any) => item.assignedToID > 0)
                            .map((item: any) => item.assignedToID),
                    ),
                )
                loadCrewMemberInfo(appendedData)
            }
        },
        onError: (error: any) => {
            console.error('queryMaintenanceCheck error', error)
        },
    })

    const [
        queryCrewMemberInfo,
        {
            loading: queryCrewMemberInfoLoading,
            error: queryCrewMemberInfoError,
            data: queryCrewMemberInfoData,
        },
    ] = useLazyQuery(GET_CREW_BY_IDS, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readSeaLogsMembers.nodes
            if (data) {
                setCrewInfo(data)
            }
        },
        onError: (error) => {
            console.error('queryCrewMemberInfo error', error)
        },
    })

    const loadCrewMemberInfo = async (crewId: any) => {
        await queryCrewMemberInfo({
            variables: {
                crewMemberIDs: crewId.length > 0 ? crewId : [0],
            },
        })
    }

    const handleSetSelectedCategories = (selectedOption: any) => {
        if (
            selectedOption.find((option: any) => option.value === 'newCategory')
        ) {
            setOpenCategoryDialog(true)
        }
        setSelectedCategories(
            selectedOption.filter(
                (option: any) => option.value !== 'newCategory',
            ),
        )
    }

    const handleEditorChange = (content: any) => {
        setInventory({ ...inventory, content: content })
    }

    const handleSave = async () => {
        if (!edit_inventory) {
            toast.error('You do not have permission to edit this inventory')
            return
        }
        const variables = {
            input: {
                id: +inventory.id,
                item: (
                    document.getElementById(
                        'inventory-name',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'inventory-name',
                          ) as HTMLInputElement
                      ).value
                    : inventory.item,
                title: (
                    document.getElementById(
                        'inventory-name',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'inventory-name',
                          ) as HTMLInputElement
                      ).value
                    : inventory.title,
                location: (
                    document.getElementById(
                        'inventory-location',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'inventory-location',
                          ) as HTMLInputElement
                      ).value
                    : inventory.location,
                description: (
                    document.getElementById(
                        'inventory-short-description',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'inventory-short-description',
                          ) as HTMLInputElement
                      ).value
                    : inventory.description,
                content: inventory.content,
                quantity: (
                    document.getElementById('inventory-qty') as HTMLInputElement
                ).value
                    ? parseInt(
                          (
                              document.getElementById(
                                  'inventory-qty',
                              ) as HTMLInputElement
                          ).value,
                      )
                    : inventory.quantity,
                productCode: (
                    document.getElementById(
                        'inventory-code',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'inventory-code',
                          ) as HTMLInputElement
                      ).value
                    : inventory.productCode,
                costingDetails: (
                    document.getElementById(
                        'inventory-cost',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'inventory-cost',
                          ) as HTMLInputElement
                      ).value
                    : inventory.costingDetails,
                comments: (
                    document.getElementById(
                        'inventory-comments',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'inventory-comments',
                          ) as HTMLInputElement
                      ).value
                    : inventory.comments,
                archived: inventory.archived,
                inventoryImportID: inventory.inventoryImportID,
                vesselID: selectedLocation.value
                    ? selectedLocation.value
                    : inventory.vesselID,
                // attachments: inventory.attachments,
                documents: documents.map((doc: any) => doc.id).join(','),
                categories: selectedCategories?.map(
                    (category: any) => category.value,
                ).length
                    ? selectedCategories
                          .map((category: any) => category.value)
                          .join(',')
                    : inventory.categories.nodes
                          .map((categories: any) => categories.id)
                          .join(','),
                suppliers: selectedSuppliers?.map(
                    (supplier: any) => supplier.value,
                ).length
                    ? selectedSuppliers
                          .map((supplier: any) => supplier.value)
                          .join(',')
                    : inventory.suppliers.nodes
                          .map((supplier: any) => supplier.id)
                          .join(','),
                attachmentLinks: linkSelectedOption
                    ? linkSelectedOption
                          .map((link: any) => link.value)
                          .join(',')
                    : inventory.attachmentLinks?.nodes
                          .map((link: any) => link.id)
                          .join(','),
            },
        }
        await mutationUpdateInventory({
            variables,
        })
    }

    const [
        mutationUpdateInventory,
        { loading: mutationupdateInventoryLoading },
    ] = useMutation(UPDATE_INVENTORY, {
        onCompleted: (response: any) => {
            const data = response.updateInventory
            if (data.id > 0) {
                router.back()
            } else {
                console.error('mutationupdateInventory error', response)
            }
        },
        onError: (error: any) => {
            console.error('mutationupdateInventory error', error)
        },
    })

    const handleCreateCategory = async () => {
        const categoryName = (
            document.getElementById(
                'inventory-new-category',
            ) as HTMLInputElement
        ).value
        return await mutationcreateInventoryCategory({
            variables: {
                input: {
                    name: categoryName,
                },
            },
        })
    }

    const [
        mutationcreateInventoryCategory,
        { loading: mutationcreateInventoryCategoryLoading },
    ] = useMutation(CREATE_INVENTORY_CATEGORY, {
        onCompleted: (response: any) => {
            const data = response.createInventoryCategory
            if (data.id > 0) {
                const formattedData = [
                    ...categories,
                    { label: data.name, value: data.id },
                ]
                setCategories(formattedData)
                const categoriesList = [
                    ...selectedCategories,
                    { label: data.name, value: data.id },
                ]
                setSelectedCategories(categoriesList)
                setOpenCategoryDialog(false)
            } else {
                console.error('mutationcreateInventoryCategory error', response)
            }
        },
        onError: (error: any) => {
            console.error('mutationcreateInventoryCategory error', error)
        },
    })

    const handleDeleteInventories = async () => {
        if (!delete_inventory) {
            toast.error('You do not have permission to delete this inventory')
            return
        }
        await mutationDeleteInventories({
            variables: {
                ids: [+inventory.id],
            },
        })
    }

    const [
        mutationDeleteInventories,
        { loading: mutationdeleteInventoriesLoading },
    ] = useMutation(DELETE_INVENTORIES, {
        onCompleted: (response: any) => {
            if (
                response.deleteInventories &&
                response.deleteInventories.length > 0
            ) {
                router.push('/inventory')
            } else {
                console.error(
                    'mutationdeleteInventories failed to delete:',
                    response,
                )
            }
        },
        onError: (error: any) => {
            console.error('mutationdeleteInventories error:', error.message)
        },
    })

    const handleSelectedVesselChange = (selectedOption: any) => {
        if (selectedOption.value === 'newLocation') {
            setOpenLocationDialog(true)
        }
        setSelectedLocation(selectedOption)
    }

    const handleCreateLocation = (Location: any) => {
        var newLocation = { label: '', value: '' }
        if (typeof Location === 'string') {
            newLocation = { label: Location, value: Location }
        }
        if (typeof Location === 'object') {
            newLocation = {
                label: (
                    document.getElementById(
                        'inventory-new-location',
                    ) as HTMLInputElement
                ).value,
                value: (
                    document.getElementById(
                        'inventory-new-location-id',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'inventory-new-location-id',
                          ) as HTMLInputElement
                      ).value
                    : (
                          document.getElementById(
                              'inventory-new-location',
                          ) as HTMLInputElement
                      ).value,
            }
        }
        const vesselList = vessels.map((item: any) => ({
            ...item,
        }))
        const appendedData = [
            ...vesselList,
            { Title: newLocation.label, ID: newLocation.value },
        ]
        setVessels(appendedData)
        setSelectedLocation(newLocation)
        setOpenLocationDialog(false)
    }

    const deleteFile = async (id: number) => {
        const newDocuments = documents.filter((doc: any) => doc.id !== id)
        setDocuments(newDocuments)
    }

    const handleDisplayTask = () => {
        setDisplayTask(true)
    }

    const handleSelectedSuppliers = (selectedOption: any) => {
        console.log(
            'selectedOption',
            selectedOption.find(
                (option: any) => option.value === 'newSupplier',
            ),
        )
        if (
            selectedOption.find((option: any) => option.value === 'newSupplier')
        ) {
            setOpenSupplierDialog(true)
        }
        setSelectedSuppliers(
            selectedOption.filter(
                (option: any) => option.value !== 'newSupplier',
            ),
        )
    }

    const handleCreateSupplier = async () => {
        const name = (
            document.getElementById('supplier-name') as HTMLInputElement
        ).value
        const website = (
            document.getElementById('supplier-website') as HTMLInputElement
        ).value
        const phone = (
            document.getElementById('supplier-phone') as HTMLInputElement
        ).value
        const email = (
            document.getElementById('supplier-email') as HTMLInputElement
        ).value
        const address = (
            document.getElementById('supplier-address') as HTMLInputElement
        ).value

        const variables = {
            input: {
                name: name,
                address: address,
                website: website,
                email: email,
                phone: phone,
            },
        }
        if (name !== '') {
            await mutationCreateSupplier({
                variables,
            })
        }
        setOpenSupplierDialog(false)
    }

    const [mutationCreateSupplier, { loading: mutationcreateSupplierLoading }] =
        useMutation(CREATE_SUPPLIER, {
            onCompleted: (response: any) => {
                const data = response.createSupplier
                if (data.id > 0) {
                    const suppliersList = [
                        ...suppliers,
                        { label: data.name, value: data.id },
                    ]
                    setSuppliers(suppliersList)
                    const selectedSuppliersList = [
                        ...selectedSuppliers,
                        { label: data.name, value: data.id },
                    ]
                    setSelectedSuppliers(selectedSuppliersList)
                } else {
                    console.error('mutationcreateSupplier error', response)
                }
            },
            onError: (error: any) => {
                console.error('mutationcreateSupplier error', error)
            },
        })

    const [createSeaLogsFileLinks] = useMutation(CREATE_SEALOGS_FILE_LINKS, {
        onCompleted: (response: any) => {
            const data = response.createSeaLogsFileLinks
            if (data.id > 0) {
                const newLinks = [...fileLinks, data]
                setFileLinks(newLinks)
                linkSelectedOption
                    ? setLinkSelectedOption([
                          ...linkSelectedOption,
                          { label: data.link, value: data.id },
                      ])
                    : setLinkSelectedOption([
                          { label: data.link, value: data.id },
                      ])
            }
        },
        onError: (error: any) => {
            console.error('createSeaLogsFileLinksEntry error', error)
        },
    })

    const handleDeleteLink = (link: any) => {
        setLinkSelectedOption(linkSelectedOption.filter((l: any) => l !== link))
    }

    const linkItem = (link: any) => {
        return (
            <div className="flex justify-between align-middle mr-2 w-fit">
                <Link href={link.label} target="_blank" className="ml-2 ">
                    {link.label}
                </Link>
                <div className="ml-2 ">
                    <SeaLogsButton
                        icon="cross_icon"
                        action={() => handleDeleteLink(link)}
                    />
                </div>
            </div>
        )
    }

    if (!permissions || !view_inventory) {
        return !permissions ? (
            <Loading />
        ) : (
            <Loading errorMessage="Oops! You do not have the permission to view this section." />
        )
    }

    return (
        <div className="w-full p-0 dark:text-white border border-slblue-50 bg-blue-50 dark:bg-sldarkblue-800 rounded-lg mb-20">
            <div className="flex justify-between px-8 py-3 items-center bg-sldarkblue-900 rounded-t-lg">
                <Heading className="font-light font-monasans text-2xl text-white">
                    <span className="font-semibold">Inventory:</span>{' '}
                    {inventory?.item}
                </Heading>
            </div>
            <hr className="mb-4" />
            <div className="pb-2 pt-2 ml-[1px]">
                <div className="flex justify-start flex-col md:flex-row items-start">
                    <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-100 gap-2 p-2">
                        <li>
                            <SeaLogsButton
                                text="Item Info"
                                type={`${displayTask === false ? 'primary' : 'secondary'}`}
                                color={`${displayTask === false ? 'blue' : ''}`}
                                action={() => setDisplayTask(false)}
                                className={`mr-0`}
                            />
                        </li>
                        <li>
                            <SeaLogsButton
                                text="Tasks / Maintenance"
                                type={`${displayTask === true ? 'primary' : 'secondary'}`}
                                color={`${displayTask === true ? 'blue' : ''}`}
                                counter={taskCounter}
                                counterColor={`${taskCounter > 0 ? 'rose' : 'emerald'}`}
                                action={() => setDisplayTask(true)}
                                className={`mr-0`}
                            />
                        </li>
                    </ul>
                </div>
            </div>
            {displayTask ? (
                <div className="p-0 pt-4">
                    <div className="flex w-full justify-start flex-col md:flex-row items-start">
                        {tasks && vessels ? (
                            <Table
                                maintenanceChecks={tasks}
                                vessels={vessels}
                                crewInfo={crewInfo}
                            />
                        ) : (
                            <List />
                        )}
                    </div>
                </div>
            ) : (
                <div className="px-3 pt-3">
                    <div className="grid grid-cols-3 gap-6 pb-4 pt-0 px-0">
                        <div className="my-4 text-xl">
                            <div className="mb-4">
                                <input
                                    id={`inventory-name`}
                                    type="text"
                                    defaultValue={inventory?.item}
                                    className={classes.input}
                                    placeholder="Inventory name"
                                    readOnly={!edit_inventory}
                                />
                            </div>
                            <div className="mb-4">
                                {vessels && inventory ? (
                                    <Select
                                        id="inventory-vessel"
                                        closeMenuOnSelect={true}
                                        options={vessels?.map(
                                            (vessel: any) => ({
                                                label: vessel.title,
                                                value: vessel.id,
                                            }),
                                        )}
                                        isDisabled={!edit_inventory}
                                        defaultValue={
                                            inventory?.vesselID &&
                                            inventory?.vesselID == 0
                                                ? { label: 'Other', value: '0' }
                                                : {
                                                      label: inventory?.vessel
                                                          .title,
                                                      value: inventory?.vessel
                                                          .id,
                                                  }
                                        }
                                        // value={selectedLocation}
                                        menuPlacement="bottom"
                                        placeholder="Select Vessel"
                                        onChange={handleSelectedVesselChange}
                                        // onCreateOption={handleCreateLocation}
                                        className={classes.selectMain}
                                        classNames={{
                                            control: () =>
                                                'block py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-slblue-200 focus:ring-slblue-500 focus:border-slblue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-slblue-500 !dark:focus:border-slblue-500',
                                            singleValue: () =>
                                                'dark:!text-white',
                                            menu: () => classes.selectMenu,
                                            option: () => classes.selectOption,
                                        }}
                                    />
                                ) : (
                                    <InputSkeleton />
                                )}
                            </div>
                            <div className="mb-4">
                                <input
                                    id={`inventory-location`}
                                    type="text"
                                    defaultValue={inventory?.location}
                                    className={classes.input}
                                    placeholder="Location"
                                    readOnly={!edit_inventory}
                                />
                            </div>
                            <div className="mb-4">
                                <input
                                    id={`inventory-qty`}
                                    type="number"
                                    defaultValue={inventory?.quantity}
                                    className={classes.input}
                                    placeholder="Quantity"
                                    readOnly={!edit_inventory}
                                />
                            </div>
                        </div>
                        <div className="col-span-2 mt-4">
                            <textarea
                                id={`inventory-short-description`}
                                rows={9}
                                defaultValue={inventory?.description}
                                className={`${classes.textarea} px-2.5 pt-3 pb-4`}
                                placeholder="Short description"
                                readOnly={!edit_inventory}
                            />
                        </div>
                    </div>
                    <hr className="mb-4" />
                    <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                        <div className="my-4 text-l">
                            Inventory details
                            <p className="text-xs mt-4 max-w-[25rem] leading-loose font-light">
                                In this section categorise the item and add the
                                suppliers where you normally purchase this item
                                and the expected cost. This will help replacing
                                the item in the future.
                            </p>
                        </div>
                        <div className="col-span-2 block bg-white px-7 border border-slblue-200 rounded-lg dark:bg-sldarkblue-800">
                            <div className="my-4 flex items-center">
                                <span className="w-32 text-msm font-light">
                                    Product code
                                </span>
                                <input
                                    id={`inventory-code`}
                                    type="text"
                                    defaultValue={inventory?.productCode}
                                    className={classes.input}
                                    placeholder="Product code"
                                    readOnly={!edit_inventory}
                                />
                            </div>
                            <div className="my-4 flex items-center text-sm">
                                <span className="w-32 text-msm font-light">
                                    Categories
                                </span>
                                {inventory && categories ? (
                                    <Select
                                        isClearable
                                        id="inventory-categories"
                                        closeMenuOnSelect={false}
                                        defaultValue={
                                            inventory.categories &&
                                            inventory.categories.nodes.map(
                                                (category: any) => ({
                                                    label: category.name,
                                                    value: category.id,
                                                }),
                                            )
                                        }
                                        isDisabled={!edit_inventory}
                                        value={selectedCategories}
                                        isMulti
                                        options={categories}
                                        menuPlacement="top"
                                        onChange={handleSetSelectedCategories}
                                        // onCreateOption={handleCreateCategory}
                                        className={classes.selectMain}
                                        classNames={{
                                            control: () =>
                                                'block py-1 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-slblue-200 focus:ring-slblue-500 focus:border-slblue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-slblue-500 !dark:focus:border-slblue-500',
                                            singleValue: () =>
                                                'dark:!text-white',
                                            dropdownIndicator: () =>
                                                '!p-0 !hidden',
                                            menu: () => classes.selectMenu,
                                            indicatorSeparator: () => '!hidden',
                                            multiValue: () =>
                                                '!bg-slblue-100 inline-block rounded p-0.5 py-px m-0 !mr-1.5 border border-slblue-300 !rounded-md !text-slblue-900 font-normal mr-2',
                                            clearIndicator: () => '!py-0',
                                            valueContainer: () => '!py-0',
                                            input: () => '!py-1',
                                            option: () => classes.selectOption,
                                        }}
                                    />
                                ) : (
                                    <InputSkeleton />
                                )}
                            </div>
                            <div className="my-4 flex items-center text-sm">
                                <span className="w-32 text-msm font-light">
                                    Supplier
                                </span>
                                {inventory && suppliers ? (
                                    <Select
                                        id="inventory-suppliers"
                                        closeMenuOnSelect={false}
                                        defaultValue={
                                            inventory.Suppliers &&
                                            suppliers
                                                ?.filter(
                                                    (supplier: any) =>
                                                        inventory?.Suppliers &&
                                                        Object.keys(
                                                            inventory.Suppliers,
                                                        ).includes(
                                                            supplier?.value?.toString(),
                                                        ),
                                                )
                                                .map((supplier: any) => ({
                                                    label: supplier.label,
                                                    value: supplier.value,
                                                }))
                                        }
                                        isMulti
                                        isDisabled={!edit_inventory}
                                        value={selectedSuppliers}
                                        onChange={handleSelectedSuppliers}
                                        options={suppliers}
                                        menuPlacement="top"
                                        className={classes.selectMain}
                                        classNames={{
                                            control: () =>
                                                'block py-1 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-slblue-200 focus:ring-slblue-500 focus:border-slblue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-slblue-500 !dark:focus:border-slblue-500',
                                            singleValue: () =>
                                                'dark:!text-white',
                                            dropdownIndicator: () =>
                                                '!p-0 !hidden',
                                            menu: () => classes.selectMenu,
                                            indicatorSeparator: () => '!hidden',
                                            multiValue: () =>
                                                '!bg-slblue-100 inline-block rounded p-0.5 py-px m-0 !mr-1.5 border border-slblue-300 !rounded-md !text-slblue-900 font-normal mr-2',
                                            clearIndicator: () => '!py-0',
                                            valueContainer: () => '!py-0',
                                            input: () => '!py-1',
                                            option: () => classes.selectOption,
                                        }}
                                    />
                                ) : (
                                    <InputSkeleton />
                                )}
                            </div>
                            <div className="my-4 flex items-center text-sm">
                                <span className="w-32 text-msm font-light">
                                    Cost
                                </span>
                                <input
                                    id={`inventory-cost`}
                                    type="text"
                                    defaultValue={inventory?.costingDetails}
                                    className={classes.input}
                                    placeholder="Costing Details"
                                    readOnly={!edit_inventory}
                                />
                            </div>
                            <div className="my-4 flex  items-center text-sm">
                                {/* <div className="flex flex-col"> */}
                                <span className="w-32 text-msm font-light">
                                    Links
                                </span>
                                <div className="w-full">
                                    <input
                                        id="task-title"
                                        type="text"
                                        className={classes.input}
                                        placeholder="Type a link and press Enter"
                                        readOnly={!edit_inventory}
                                        onKeyDown={async (
                                            event: React.KeyboardEvent<HTMLInputElement>,
                                        ) => {
                                            if (event.key === 'Enter') {
                                                const inputValue = (
                                                    event.target as HTMLInputElement
                                                ).value
                                                await createSeaLogsFileLinks({
                                                    variables: {
                                                        input: {
                                                            link: inputValue,
                                                        },
                                                    },
                                                })
                                                ;(
                                                    event.target as HTMLInputElement
                                                ).value = '' // Clear input value
                                            }
                                        }}
                                    />
                                    <div className="mt-4 flex">
                                        {linkSelectedOption
                                            ? linkSelectedOption.map(
                                                  (link: any) => (
                                                      <div key={link.value}>
                                                          {linkItem(link)}
                                                      </div>
                                                  ),
                                              )
                                            : fileLinks.map((link: any) => (
                                                  <div key={link.value}>
                                                      {linkItem(link)}
                                                  </div>
                                              ))}
                                    </div>
                                </div>
                                {/* </div> */}
                            </div>
                        </div>
                    </div>
                    <hr className="my-4" />
                    <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                        <div className="my-4 text-l">
                            Attachment
                            <p className="text-xs mt-4 max-w-[25rem] leading-loose font-light">
                                Upload things like photos of the item, plus
                                warranty and guarantee documents or operating
                                manuals. Add links to any online manuals or
                                product descriptions.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 xl:grid-cols-3 col-span-2 gap-6 pb-4 pt-6">
                            {edit_inventory && (
                                <FileUpload
                                    setDocuments={setDocuments}
                                    text=""
                                    subText="Drag files here or upload"
                                    bgClass="bg-slblue-50"
                                    documents={documents}
                                />
                            )}
                            <div className="block pb-3">
                                <div className="pb-4">
                                    {documents.length > 0 && (
                                        <ListBox
                                            aria-label="Documents"
                                            className={``}>
                                            {documents.map((document: any) => (
                                                <ListBoxItem
                                                    key={document.id}
                                                    textValue={document.name}
                                                    className="flex items-center gap-8 justify-between p-2.5 bg-slblue-50 rounded-lg border border-slblue-300 dark:bg-slblue-800 dark:border-slblue-600 dark:placeholder-slblue-400 dark:text-white mb-4 hover:bg-slblue-1000 hover-text-white">
                                                    <FileItem
                                                        document={document}
                                                    />
                                                    <Button
                                                        className="flex gap-2 items-center"
                                                        onPress={() => {
                                                            if (
                                                                !edit_inventory
                                                            ) {
                                                                toast.error(
                                                                    'You do not have permission to delete this document',
                                                                )
                                                                return
                                                            }
                                                            deleteFile(
                                                                document.id,
                                                            )
                                                        }}>
                                                        <XCircleIcon className="w-5 h-5 text-red-500 cursor-pointer" />
                                                    </Button>
                                                </ListBoxItem>
                                            ))}
                                        </ListBox>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr className="my-4" />
                    <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                        <div className="my-4 text-l">
                            Description
                            <p className="text-xs mt-4 max-w-[25rem] leading-loose font-light">
                                Enter details that might help with the
                                maintenance or operation of this item. Comments
                                are sent to directly to a person (use @name) to
                                send a comment to someone.
                            </p>
                        </div>
                        <div className="col-span-2 block">
                            <div className="my-4">
                                <Editor
                                    id={`inventory-Content`}
                                    content={inventory?.content}
                                    className={`${classes.editor} ${!edit_inventory ? 'pointer-events-none' : ''}`}
                                    handleEditorChange={handleEditorChange}
                                />
                            </div>
                            <div className="my-4">
                                <textarea
                                    id={`inventory-comments`}
                                    rows={5}
                                    defaultValue={inventory?.comments}
                                    className={`${classes.textarea} p-1.5`}
                                    placeholder="Comments"
                                    readOnly={!edit_inventory}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <FooterWrapper>
                <SeaLogsButton
                    // link="/inventory"
                    action={() => router.back()}
                    type="text"
                    text="Cancel"
                />
                <SeaLogsButton
                    color="blue"
                    action={() => {
                        if (!edit_task) {
                            toast.error(
                                'You do not have permission to edit this section',
                            )
                            return
                        }
                        router.push(
                            '/maintenance/new?inventoryId=' +
                                inventoryID +
                                '&vesselId=' +
                                inventory?.vesselID +
                                '&redirectTo=inventory',
                        )
                    }}
                    icon="check"
                    type="secondary"
                    text="Create task/maintenance"
                    className={`${displayTask ? '!mr-0' : ''}`}
                />
                {!displayTask && (
                    <>
                        <SeaLogsButton
                            color="rose"
                            action={handleDeleteInventories}
                            icon="trash"
                            type="secondary"
                            text="Delete"
                        />
                        <SeaLogsButton
                            color="blue"
                            action={handleSave}
                            icon="check"
                            type="primary"
                            text="Update Inventory"
                        />
                    </>
                )}
            </FooterWrapper>
            <AlertDialog
                openDialog={openLocationDialog}
                setOpenDialog={setOpenLocationDialog}
                handleCreate={handleCreateLocation}
                actionText="Create Location">
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2 text-gray-700">
                    Create New Location
                </Heading>
                <div className="my-4 flex items-center">
                    <input
                        id={`inventory-new-location`}
                        type="text"
                        className={classes.input}
                        placeholder="Location"
                    />
                </div>
                <div className="flex items-center">
                    <input
                        id={`inventory-new-location-id`}
                        type="text"
                        className={classes.input}
                        placeholder="Location ID"
                    />
                </div>
            </AlertDialog>
            <AlertDialog
                openDialog={openSupplierDialog}
                setOpenDialog={setOpenSupplierDialog}
                handleCreate={handleCreateSupplier}
                actionText="Create Supplier"
                className="lg:max-w-lg">
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2 text-gray-700">
                    Create New Supplier
                </Heading>
                <div className="mt-4">
                    <div className="mb-4">
                        <input
                            id={`supplier-name`}
                            type="text"
                            className={classes.input}
                            placeholder="Supplier name"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            id={`supplier-website`}
                            type="text"
                            className={classes.input}
                            placeholder="Website"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            id={`supplier-phone`}
                            type="text"
                            className={classes.input}
                            placeholder="Phone"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            id={`supplier-email`}
                            type="email"
                            className={classes.input}
                            placeholder="Email"
                        />
                    </div>
                    <div>
                        <textarea
                            id={`supplier-address`}
                            rows={4}
                            className={`${classes.textarea} p-2`}
                            placeholder="Supplier address"
                        />
                    </div>
                </div>
            </AlertDialog>
            <AlertDialog
                openDialog={openCategoryDialog}
                setOpenDialog={setOpenCategoryDialog}
                handleCreate={handleCreateCategory}
                actionText="Create Category">
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2 text-gray-700">
                    Create New Category
                </Heading>
                <div className="my-4 flex items-center">
                    <input
                        id={`inventory-new-category`}
                        type="text"
                        className={classes.input}
                        placeholder="Category"
                    />
                </div>
            </AlertDialog>
        </div>
    )
}
