'use client'
import React, { useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { Heading } from 'react-aria-components'
import { CREATE_MAINTENANCE_CATEGORY } from '@/app/lib/graphQL/mutation'
import { useRouter } from 'next/navigation'
import { SeaLogsButton, FooterWrapper } from '@/app/components/Components'
import { classes } from '@/app/components/GlobalClasses'
import { preventCrewAccess } from '@/app/helpers/userHelper'

export default function NewMaintenanceCategory() {
    const router = useRouter()

    const handleCreate = async () => {
        const categoryName = (
            document.getElementById('category-name') as HTMLInputElement
        )?.value
        const categoryAbbr = (
            document.getElementById('category-abbr') as HTMLInputElement
        )?.value
        const variables = {
            input: {
                name: categoryName,
                abbreviation: categoryAbbr,
            },
        }
        if (categoryName !== '') {
            return await mutationcreateMaintenanceCategory({
                variables,
            })
        }
    }

    const [
        mutationcreateMaintenanceCategory,
        { loading: mutationcreateMaintenanceCategoryLoading },
    ] = useMutation(CREATE_MAINTENANCE_CATEGORY, {
        onCompleted: (response: any) => {
            const data = response.createMaintenanceCategory
            if (data.id > 0) {
                // router.push('/settings/maintenance/category')
                router.back()
            } else {
                console.error(
                    'mutationcreateMaintenanceCategory error',
                    response,
                )
            }
        },
        onError: (error: any) => {
            console.error('mutationcreateMaintenanceCategory error', error)
        },
    })

    useEffect(() => {
        preventCrewAccess()
    }, [])

    return (
        <div className="w-full p-0 dark:text-white">
            <div className="flex justify-between pb-4 pt-3 items-center">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    Create Maintenance Category
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
                                className={classes.input}
                                placeholder="Category name"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                id={`category-abbr`}
                                type="text"
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
                    link="/settings/maintenance/category"
                />
                <SeaLogsButton
                    text="Delete"
                    type="secondary"
                    icon="trash"
                    color="rose"
                />
                <SeaLogsButton
                    text="Create Category"
                    type="primary"
                    icon="check"
                    color="sky"
                    action={handleCreate}
                />
            </FooterWrapper>
        </div>
    )
}
