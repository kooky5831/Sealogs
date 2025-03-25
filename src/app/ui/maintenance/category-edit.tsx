'use client'
import React from 'react'
import { useMutation } from '@apollo/client'
import { useState } from 'react'
import {
    Heading,
    Button,
    Dialog,
    Modal,
    ModalOverlay,
    DialogTrigger,
} from 'react-aria-components'
import {
    UPDATE_MAINTENANCE_CATEGORY,
    DELETE_MAINTENANCE_CATEGORY,
} from '@/app/lib/graphQL/mutation'
import { useRouter } from 'next/navigation'
import { SeaLogsButton, FooterWrapper } from '@/app/components/Components'
import { getMaintenanceCategoryByID } from '@/app/lib/actions'
import { classes } from '@/app/components/GlobalClasses'

export default function EditMaintenanceCategory({
    categoryID,
}: {
    categoryID: number
}) {
    const router = useRouter()
    const [category, setCategory] = useState<any>()

    getMaintenanceCategoryByID(categoryID, setCategory)

    const handleUpdate = async () => {
        const categoryName = (
            document.getElementById('category-name') as HTMLInputElement
        )?.value
        const categoryAbbr = (
            document.getElementById('category-abbr') as HTMLInputElement
        )?.value
        const variables = {
            input: {
                id: +categoryID,
                name: categoryName,
                abbreviation: categoryAbbr,
            },
        }
        if (categoryName !== '') {
            return await mutationupdateMaintenanceCategory({
                variables,
            })
        }
    }

    const [
        mutationupdateMaintenanceCategory,
        { loading: mutationupdateMaintenanceCategoryLoading },
    ] = useMutation(UPDATE_MAINTENANCE_CATEGORY, {
        onCompleted: (response: any) => {
            const data = response.updateMaintenanceCategory
            if (data.id > 0) {
                router.back()
            } else {
                console.error(
                    'mutationupdateMaintenanceCategory error',
                    response,
                )
            }
        },
        onError: (error: any) => {
            console.error('mutationupdateMaintenanceCategory error', error)
        },
    })

    const handleDeleteCategory = async (categoryId: number) => {
        await mutationDeleteMaintenanceCategory({
            variables: {
                id: categoryId,
            },
        })
    }

    const [
        mutationDeleteMaintenanceCategory,
        { loading: mutationDeleteMaintenanceCategoryLoading },
    ] = useMutation(DELETE_MAINTENANCE_CATEGORY, {
        onCompleted: (response: any) => {
            const { isSuccess, data } = response.deleteMaintenanceCategory
            if (isSuccess) {
                // loadMaintenanceCategory()
            } else {
                console.error(
                    'mutationDeleteMaintenanceCategory error',
                    response,
                )
            }
        },
        onError: (error: any) => {
            console.error('mutationDeleteMaintenanceCategory error', error)
        },
    })

    return (
        <div className="w-full p-0 dark:text-white">
            <div className="flex justify-between pb-4 pt-3 items-center">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    Edit Maintenance Category
                </Heading>
            </div>
            <div className="px-0 md:px-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div className="my-4 text-xl">
                        Maintenance category details
                        <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Esse minima maxime enim, consectetur hic est
                            perferendis explicabo suscipit rem reprehenderit
                            vitae ex sunt corrupti obcaecati aliquid natus et
                            inventore tenetur?
                        </p>
                    </div>
                    <div className="col-span-2 flex flex-col">
                        <div className="my-4">
                            <input
                                id={`category-name`}
                                type="text"
                                defaultValue={category?.name}
                                className={classes.input}
                                placeholder="Category name"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                id={`category-abbr`}
                                type="text"
                                defaultValue={category?.abbreviation}
                                className={classes.input}
                                placeholder="Abbreviation"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <FooterWrapper>
                <SeaLogsButton
                    text="Cancel"
                    type="text"
                    // link="/settings/maintenance/category"
                    action={() => {
                        router.back()
                    }}
                />
                <DialogTrigger>
                    <SeaLogsButton
                        text="Delete"
                        type="secondary"
                        icon="trash"
                        color="rose"
                    />
                    <ModalOverlay
                        className={({ isEntering, isExiting }) => `
                            fixed inset-0 z-[15002] overflow-y-auto bg-black/25 flex min-h-full justify-center p-4 text-center backdrop-blur
                            ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                            ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                        `}>
                        <Modal
                            className={({ isEntering, isExiting }) => `
                                w-full max-w-md overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl
                                ${isEntering ? 'animate-in zoom-in-95 ease-out duration-300' : ''}
                                ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
                            `}>
                            <Dialog
                                role="alertdialog"
                                className="outline-none relative">
                                {({ close }) => (
                                    <div className="flex justify-center flex-col px-6 py-6">
                                        <Heading
                                            slot="title"
                                            className="text-2xl font-light leading-6 my-2 text-gray-700">
                                            Delete Maintenance Category
                                        </Heading>
                                        <p className="mt-3 text-slate-500">
                                            Are you sure you want to delete "
                                            {category?.Name}"?
                                        </p>
                                        <hr className="my-6" />
                                        <div className="flex justify-end">
                                            <Button
                                                className="mr-8 text-sm text-gray-600 hover:text-gray-600"
                                                onPress={close}>
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                className="group inline-flex justify-center items-center rounded-md bg-sky-700 px-4 py-2 text-sm text-white shadow-sm hover:bg-white hover:text-sky-800 ring-1 ring-sky-700"
                                                onPress={() => {
                                                    close()
                                                    handleDeleteCategory(
                                                        category.id,
                                                    )
                                                }}>
                                                <svg
                                                    className="-ml-0.5 mr-1.5 h-5 w-5 border rounded-full bg-sky-300 group-hover:bg-sky-700 group-hover:text-white"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    aria-hidden="true">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                        clipRule="evenodd"></path>
                                                </svg>
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Dialog>
                        </Modal>
                    </ModalOverlay>
                </DialogTrigger>
                <SeaLogsButton
                    text="Update Category"
                    type="primary"
                    icon="check"
                    color="sky"
                    action={handleUpdate}
                />
            </FooterWrapper>
        </div>
    )
}
