'use client'
import React, { useEffect, useState } from 'react'

import { useLazyQuery, useMutation } from '@apollo/client'
import { Button, Heading, Link } from 'react-aria-components'
import { PlusIcon } from '@heroicons/react/24/outline'
import {
    CREATE_SUPPLIER,
    CREATE_SEALOGS_FILE_LINKS,
} from '@/app/lib/graphQL/mutation'
import { useRouter } from 'next/navigation'
import { classes } from '@/app/components/GlobalClasses'
import { SeaLogsButton } from '@/app/components/Components'
import { getSupplier, getSupplierByID } from '@/app/lib/actions'

export default function NewSupplier({ supplierId }: { supplierId: number }) {
    const router = useRouter()
    const [contactFields, setContactFields] = useState(1)

    const handleCreate = async () => {
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
        // const contactPhone = (document.getElementById('supplier-contact_phone') as HTMLInputElement).value;
        // const contactEmail = (document.getElementById('supplier-contact_email') as HTMLInputElement).value;
        // const notes = (document.getElementById('supplier-notes') as HTMLInputElement).value;

        const variables = {
            input: {
                name: name,
                address: address,
                website: website,
                email: email,
                phone: phone,
            },
        }
        console.log(variables)
        if (name !== '') {
            await mutationCreateSupplier({
                variables,
            })
        }
    }

    const [mutationCreateSupplier, { loading: mutationcreateSupplierLoading }] =
        useMutation(CREATE_SUPPLIER, {
            onCompleted: (response: any) => {
                const data = response.createSupplier
                if (data.id > 0) {
                    // router.push('/inventory/suppliers')
                    router.back()
                } else {
                    console.error('mutationcreateSupplier error', response)
                }
            },
            onError: (error: any) => {
                console.error('mutationcreateSupplier error', error)
            },
        })

    const addContactFields = () => {
        setContactFields(contactFields + 1)
    }

    /*const [suppliers, setSuppliers] = useState<any>()

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

    getSupplier(handelSetSuppliers) */

    const [fileLinks, setFileLinks] = useState<any>([])
    const [linkSelectedOption, setLinkSelectedOption] = useState<any>([])

    const handelSetSuppliers = (data: any) => {
        {
            data?.attachmentLinks?.nodes &&
                setLinkSelectedOption(
                    data?.attachmentLinks?.nodes.map((link: any) => ({
                        label: link.link,
                        value: link.id,
                    })),
                )
        }
    }

    getSupplierByID(supplierId, handelSetSuppliers)

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

    return (
        <div className="w-full p-0 dark:text-white">
            <div className="flex justify-between pb-4 pt-3 items-center">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    New Supplier
                </Heading>
            </div>
            <div className="px-0 md:px-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div className="my-4 text-xl">
                        Supplier details
                        <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                            Lorem ipsum dolor, sit amet consectetur adipisicing
                            elit. Aut minima, accusamus exercitationem eum non
                            iste, tempora dolorum dolorem a distinctio porro
                            pariatur asperiores id rem! Harum, dolorum hic!
                            Facere, aspernatur!
                        </p>
                    </div>
                    <div className="col-span-2 mt-4">
                        <div className="mb-4 flex gap-4">
                            <input
                                id={`supplier-name`}
                                type="text"
                                className={classes.input}
                                placeholder="Supplier name"
                            />
                            <input
                                id={`supplier-website`}
                                type="text"
                                className={classes.input}
                                placeholder="Type the website and press Enter"
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
                                    }
                                }}
                            />
                        </div>
                        <div className="mt-4 flex">
                            {linkSelectedOption
                                ? linkSelectedOption.map((link: any) => (
                                      <div key={link.value}>
                                          {linkItem(link)}
                                      </div>
                                  ))
                                : fileLinks.map((link: any) => (
                                      <div key={link.value}>
                                          {linkItem(link)}
                                      </div>
                                  ))}
                        </div>
                        <div className="mb-4 flex gap-4">
                            <input
                                id={`supplier-phone`}
                                type="text"
                                className={classes.input}
                                placeholder="Phone"
                            />
                            <input
                                id={`supplier-email`}
                                type="email"
                                className={classes.input}
                                placeholder="Email"
                            />
                        </div>
                        <div className="mb-4">
                            <textarea
                                id={`supplier-address`}
                                rows={4}
                                className={`${classes.textarea} p-2`}
                                placeholder="Supplier address"
                            />
                        </div>
                    </div>
                </div>
                <hr className="my-4" />
                <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div className="my-4 text-xl">
                        Contact people
                        <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                            Lorem ipsum dolor, sit amet consectetur adipisicing
                            elit. Aut minima, accusamus exercitationem eum non
                            iste, tempora dolorum dolorem a distinctio porro
                            pariatur asperiores id rem! Facere, aspernatur!
                        </p>
                    </div>
                    <div className="col-span-2 mt-4">
                        <div className="">
                            <div className="flex grow flex-col">
                                {contactFields > 0
                                    ? Array.from(
                                          Array(contactFields),
                                          (e, i) => {
                                              return (
                                                  <div
                                                      key={i}
                                                      className={`flex grow flex-col ${i > 0 ? 'mt-4 border-t pt-4' : ''}`}>
                                                      <div className="flex grow flex-col md:flex-row md:col-span-2 lg:col-span-3 lg:grid-cols-3 gap-4">
                                                          <input
                                                              id={`supplier-contact_name${i}`}
                                                              type="text"
                                                              className={`${classes.input}`}
                                                              placeholder="Contact Name"
                                                          />
                                                          <input
                                                              id={`supplier-contact_phone${i}`}
                                                              type="text"
                                                              className={`${classes.input}`}
                                                              placeholder="Contact Phone"
                                                          />
                                                          <input
                                                              id={`supplier-contact_email${i}`}
                                                              type="text"
                                                              className={`${classes.input}`}
                                                              placeholder="Contact Email"
                                                          />
                                                      </div>
                                                  </div>
                                              )
                                          },
                                      )
                                    : null}
                            </div>
                            <div className="flex justify-end mt-4">
                                <Button
                                    type="button"
                                    className="group inline-flex justify-center items-center rounded-md bg-transparent px-4 py-2 text-sm text-sky-800 shadow-sm hover:shadow-md hover:bg-white ring-1 ring-sky-700"
                                    onPress={addContactFields}>
                                    <PlusIcon className="w-5 h-5 -ml-2 mr-2" />
                                    Add contact
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="my-4" />
                <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div className="my-4 text-xl">Notes</div>
                    <div className="col-span-2">
                        <textarea
                            id={`supplier-notes`}
                            rows={5}
                            className={`${classes.textarea} p-2`}
                            placeholder="Notes"
                        />
                    </div>
                </div>
            </div>
            <hr className="my-4" />
            <div className="flex justify-end px-8 pb-4 pt-4">
                <Link
                    href="/inventory/suppliers"
                    className="group inline-flex justify-center items-center">
                    <Button className="mr-8 text-sm text-gray-600 hover:text-gray-600 dark:text-white">
                        Cancel
                    </Button>
                </Link>
                <Button
                    type="button"
                    className="group inline-flex justify-center items-center rounded-md bg-sky-700 px-4 py-2 text-sm text-white shadow-sm hover:shadow-md hover:bg-white hover:text-sky-800 ring-1 ring-sky-700"
                    onPress={handleCreate}>
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
                    Create Supplier
                </Button>
            </div>
        </div>
    )
}
