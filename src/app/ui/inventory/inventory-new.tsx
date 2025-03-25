'use client'
import React, { useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { Heading } from 'react-aria-components'
import {
    GET_INVENTORY_CATEGORY,
    GET_SUPPLIER,
    VESSEL_LIST,
} from '@/app/lib/graphQL/query'
import Select from 'react-select'
import Creatable from 'react-select/creatable'
import Editor from '@/app/ui/editor'
import FileUpload from '@/app/ui/file-upload'
import {
    CREATE_INVENTORY,
    CREATE_INVENTORY_CATEGORY,
    CREATE_SUPPLIER,
} from '@/app/lib/graphQL/mutation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { InputSkeleton } from '@/app/ui/skeletons'
import {
    SeaLogsButton,
    FooterWrapper,
    AlertDialog,
} from '@/app/components/Components'
import {
    getVesselList,
    getSupplier,
    getInventoryCategory,
} from '@/app/lib/actions'
import { classes } from '@/app/components/GlobalClasses'

export default function NewInventory({ vesselID = 0 }: { vesselID: number }) {
    const [categories, setCategories] = useState<any>()
    const [selectedCategories, setSelectedCategories] = useState<any>()
    const [suppliers, setSuppliers] = useState<any>()
    const [selectedSuppliers, setSelectedSuppliers] = useState<any>()
    const [isMounted, setIsMounted] = useState(false)
    const [vessels, setVessels] = useState<any>()
    const [location, setLocations] = useState<any>()
    const [selectedVessel, setSelectedVessel] = useState<any>()
    const [selectedLocation, setSelectedLocation] = useState<any>()
    const [openLocationDialog, setOpenLocationDialog] = useState(false)
    const [openSupplierDialog, setOpenSupplierDialog] = useState(false)
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false)
    const [documents, setDocuments] = useState<Array<Record<string, any>>>([])
    const router = useRouter()

    var description = ''

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
        const categoriesList = [
            {
                label: ' ---- Create Category ---- ',
                value: 'newCategory',
            },
            ...data
                ?.filter((category: any) => category.name !== null)
                .map((category: any) => ({
                    label: category.name,
                    value: category.id,
                })),
        ]
        setCategories(categoriesList)
    }

    getInventoryCategory(handleSetCategories)

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

    const handleEditorChange = (desc: any) => {
        description = desc
    }

    const handleCreate = async () => {
        const variables = {
            input: {
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
                    : null,
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
                    : null,
                content: description,
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
                    : null,
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
                    : null,
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
                    : null,
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
                    : null,
                documents: documents.map((doc: any) => doc.id).join(','),
                categories: selectedCategories?.map(
                    (category: any) => category.value,
                ).length
                    ? selectedCategories
                          .map((category: any) => category.value)
                          .join(',')
                    : null,
                suppliers: selectedSuppliers?.map(
                    (supplier: any) => supplier.value,
                ).length
                    ? selectedSuppliers
                          .map((supplier: any) => supplier.value)
                          .join(',')
                    : null,
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
                    : null,
                vesselID: vesselID > 0 ? vesselID : selectedLocation?.value,
            },
        }
        await mutationCreateInventory({
            variables,
        })
    }

    const [
        mutationCreateInventory,
        { loading: mutationcreateInventoryLoading },
    ] = useMutation(CREATE_INVENTORY, {
        onCompleted: (response: any) => {
            const data = response.createInventory
            if (data.id > 0) {
                router.back()
            } else {
                console.error('mutationcreateInventory error', response)
            }
        },
        onError: (error: any) => {
            console.error('mutationcreateInventory error', error)
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
                const categoriesList = [
                    ...categories,
                    { label: data.name, value: data.id },
                ]
                setCategories(categoriesList)
                const selectedCategoriesList = [
                    ...selectedCategories,
                    { label: data.name, value: data.id },
                ]
                setSelectedCategories(selectedCategoriesList)
                setOpenCategoryDialog(false)
            } else {
                console.error('mutationcreateInventoryCategory error', response)
            }
        },
        onError: (error: any) => {
            console.error('mutationcreateInventoryCategory error', error)
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

    return (
        <div className="w-full p-0 dark:text-white border border-slblue-50 bg-blue-50">
            <div className="flex justify-between px-8 py-3 items-center bg-sldarkblue-900 rounded-t-lg">
                <Heading className="font-light font-monasans text-2xl text-white">
                    New Inventory
                </Heading>
            </div>
            <div className="px-0 md:px-4 pt-4 border-t">
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 lg:pb-4 md:pb-4 lg:pt-3 md:pt-3 px-4">
                    <div className="my-4 text-xl">
                        <div className="mb-4">
                            <input
                                id={`inventory-name`}
                                type="text"
                                className={classes.input}
                                placeholder="Inventory name"
                            />
                        </div>
                        <div className="mb-4 text-sm">
                            {vessels ? (
                                <Select
                                    id="inventory-vessel"
                                    closeMenuOnSelect={true}
                                    options={vessels?.map((vessel: any) => ({
                                        label: vessel.title,
                                        value: vessel.id,
                                    }))}
                                    menuPlacement="bottom"
                                    defaultValue={
                                        vesselID > 0 &&
                                        vessels
                                            .filter(
                                                (vessel: any) =>
                                                    vessel.id === vesselID,
                                            )
                                            .map((vessel: any) => ({
                                                label: vessel.title,
                                                value: vessel.id,
                                            }))
                                    }
                                    // value={selectedLocation}
                                    placeholder={`Select Vessel ${vesselID}`}
                                    onChange={handleSelectedVesselChange}
                                    // onCreateOption={handleCreateLocation}
                                    className="w-full bg-slblue-50 rounded dark:bg-gray-800 text-sm"
                                    classNames={{
                                        control: () =>
                                            'block py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                        singleValue: () => 'dark:!text-white',
                                        menu: () => 'dark:bg-gray-800',
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
                                className={classes.input}
                                placeholder="Location"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                id={`inventory-qty`}
                                type="number"
                                className={classes.input}
                                placeholder="Quantity"
                            />
                        </div>
                    </div>
                    <div className="col-span-2 mt-4">
                        <textarea
                            id={`inventory-short-description`}
                            rows={9}
                            className={`${classes.textarea} px-2.5 pt-3 pb-4`}
                            placeholder="Short description"
                        />
                    </div>
                </div>
                <hr className="mb-4 mt-4 lg:mt-0 md:mt-0" />
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 lg:pb-4 md:pb-4 lg:pt-3 md:pt-3 px-4">
                    <div className="my-4 text-l">
                        Inventory details
                        <p className="text-xs mt-4 max-w-[25rem] leading-loose font-light">
                            In this section categorise the item and add the
                            suppliers where you normally purchase this item and
                            the expected cost. This will help replacing the item
                            in the future.
                        </p>
                    </div>
                    <div className="col-span-2 block pt-3 pb-3 px-7 bg-white border-slblue-200 rounded-lg">
                        <div className="my-4 flex items-center lg:flex-row md:flex-row flex-col">
                            <span className="lg:w-32 md:w-32 w-full text-msm font-light">
                                Product code
                            </span>
                            <input
                                id={`inventory-code`}
                                type="text"
                                className={classes.input}
                                placeholder="Product code"
                            />
                        </div>
                        <div className="my-4 flex items-center lg:flex-row md:flex-row flex-col text-sm">
                            <span className="lg:w-32 md:w-32 w-full text-msm font-light">
                                Categories
                            </span>
                            {categories ? (
                                <Select
                                    isClearable
                                    id="inventory-categories"
                                    closeMenuOnSelect={false}
                                    isMulti
                                    options={categories}
                                    value={selectedCategories}
                                    menuPlacement="top"
                                    onChange={handleSetSelectedCategories}
                                    className="w-full bg-slblue-50 rounded dark:bg-slblue-800 text-sm"
                                    classNames={{
                                        control: () =>
                                            'block py-1 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                        singleValue: () => 'dark:!text-white',
                                        dropdownIndicator: () => '!p-0 !hidden',
                                        menu: () => 'dark:bg-gray-800',
                                        indicatorSeparator: () => '!hidden',
                                        multiValue: () =>
                                            '!bg-slblue-100 inline-block rounded p-0.5 py-px m-0 !mr-1.5 border border-slblue-300 !rounded-md !text-slblue-900 font-normal mr-2',
                                        clearIndicator: () => '!py-0',
                                        valueContainer: () => '!py-0',
                                        input: () => '!py-1',
                                    }}
                                />
                            ) : (
                                <InputSkeleton />
                            )}
                        </div>
                        <div className="my-4 flex items-center lg:flex-row md:flex-row flex-col text-sm">
                            <span className="lg:w-32 md:w-32 w-full text-msm font-light">
                                Supplier
                            </span>
                            {suppliers ? (
                                <Select
                                    id="inventory-suppliers"
                                    closeMenuOnSelect={false}
                                    isMulti
                                    value={selectedSuppliers}
                                    onChange={handleSelectedSuppliers}
                                    options={suppliers}
                                    menuPlacement="top"
                                    className="w-full bg-slblue-50 rounded dark:bg-slblue-800 text-sm"
                                    classNames={{
                                        control: () =>
                                            'block py-1 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-slblue-200 focus:ring-slblue-500 focus:border-slblue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-slblue-500 !dark:focus:border-slblue-500',
                                        singleValue: () => 'dark:!text-white',
                                        dropdownIndicator: () => '!p-0 !hidden',
                                        menu: () => 'dark:bg-gray-800',
                                        indicatorSeparator: () => '!hidden',
                                        multiValue: () =>
                                            '!bg-slblue-100 inline-block rounded p-0.5 py-px m-0 !mr-1.5 border border-slblue-300 !rounded-md !text-slblue-900 font-normal mr-2',
                                        clearIndicator: () => '!py-0',
                                        valueContainer: () => '!py-0',
                                        input: () => '!py-1',
                                    }}
                                />
                            ) : (
                                <InputSkeleton />
                            )}
                        </div>
                        <div className="my-4 flex items-center lg:flex-row md:flex-row flex-col text-sm">
                            <span className="lg:w-32 md:w-32 w-full text-msm font-light">
                                Cost
                            </span>
                            <input
                                id={`inventory-cost`}
                                type="text"
                                className={classes.input}
                                placeholder="Costing Details"
                            />
                        </div>
                    </div>
                </div>
                <hr className="my-4" />
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 lg:pb-4 md:pb-4 lg:pt-3 md:pt-3 px-4">
                    <div className="my-4 text-l">
                        Attachment
                        <p className="text-xs mt-4 max-w-[25rem] leading-loose font-light">
                            Upload things like photos of the item, plus warranty
                            and guarantee documents or operating manuals. Add
                            links to any online manuals or product descriptions.
                        </p>
                    </div>
                    <div className="col-span-2 block pt-3 pb-3 px-7 bg-white border-slblue-200 rounded-lg">
                        <div className="my-4">
                            <div className="grid-cols-1 md:col-span-2 lg:col-span-3">
                                <FileUpload
                                    setDocuments={setDocuments}
                                    text=""
                                    subText="Drag files here or upload"
                                    bgClass="bg-slblue-50"
                                    documents={documents}
                                />
                            </div>
                        </div>
                        <div className="my-4 flex flex-col">
                            <label className="mb-1 text-sm">Links</label>
                            <input
                                id={`inventory-links`}
                                type="text"
                                className={classes.input}
                                placeholder="Links"
                            />
                        </div>
                    </div>
                </div>
                <hr className="my-4" />
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 lg:pb-4 md:pb-4 lg:pt-3 md:pt-3 px-4">
                    <div className="my-4 text-l">
                        Description
                        <p className="text-xs mt-4 max-w-[25rem] leading-loose font-light">
                            Enter details that might help with the maintenance
                            or operation of this item. Comments are sent to
                            directly to a person (use @name) to send a comment
                            to someone.
                        </p>
                    </div>
                    <div className="col-span-2 block pt-3 pb-3 px-7 bg-white border-slblue-200 rounded-lg mb-20 lg:mb-0 md:mb-0">
                        <div className="my-4">
                            <Editor
                                id={`inventory-Content`}
                                handleEditorChange={handleEditorChange}
                            />
                        </div>
                        <div className="mb-1 mt-14 lg:mt-0 md:mt-0">
                            <textarea
                                id={`inventory-comments`}
                                rows={5}
                                className={`${classes.textarea} p-1.5`}
                                placeholder="Comments"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <FooterWrapper bottom={10}>
                <div className="mb-3 lg:mb-0 md:mb-0">
                    <SeaLogsButton
                        // link="/inventory"
                        action={() => {
                            router.back()
                        }}
                        type="text"
                        text="Cancel"
                    />
                    <SeaLogsButton
                        color="sky"
                        action={handleCreate}
                        icon="check"
                        type="primary"
                        text="Create Inventory"
                    />
                </div>
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
