'use client'
import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { Button, Heading } from 'react-aria-components'
import { PlusIcon } from '@heroicons/react/24/outline'
import {
    UPDATE_SUPPLIER,
    DELETE_SUPPLIER,
    CREATE_SUPPLIER,
    CREATE_SEALOGS_FILE_LINKS,
} from '@/app/lib/graphQL/mutation'
import { useRouter } from 'next/navigation'
import { SeaLogsButton } from '@/app/components/Components'
import { getSupplierByID } from '@/app/lib/actions'
import { classes } from '@/app/components/GlobalClasses'
import Link from 'next/link'

export default function Supplier({ supplierID }: { supplierID: number }) {
    const [supplier, setSupplier] = useState<any>()
    const router = useRouter()
    const [contactFields, setContactFields] = useState(1)
    const [fileLinks, setFileLinks] = useState<any>([])
    const [linkSelectedOption, setLinkSelectedOption] = useState<any>([])

    getSupplierByID(supplierID, setSupplier)

    const handleSave = async (e: any) => {
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
                id: parseInt(supplierID.toString()),
                name: name ? name : supplier.Name,
                address: address ? address : supplier.Address,
                website: website ? website : supplier.Website,
                email: email ? email : supplier.Email,
                phone: phone ? phone.toString() : supplier.Phone,
                // "contactPerson": supplier.ContactPerson,
            },
        }
        await mutationUpdateSupplier({
            variables,
        })
    }

    const [mutationUpdateSupplier, { loading: mutationupdateSupplierLoading }] =
        useMutation(UPDATE_SUPPLIER, {
            onCompleted: (response: any) => {
                const data = response.updateSupplier
                if (data.id > 0) {
                    router.back()
                } else {
                    console.error('mutationupdateSupplier error', response)
                }
            },
            onError: (error: any) => {
                console.error('mutationupdateSupplier error', error)
            },
        })

    const addContactFields = () => {
        setContactFields(contactFields + 1)
    }

    const handleDeleteSupplier = async () => {
        const variables = {
            id: parseInt(supplierID.toString()),
        }
        await mutationDeleteSupplier({
            variables,
        })
    }

    const [mutationDeleteSupplier, { loading: mutationdeleteSupplierLoading }] =
        useMutation(DELETE_SUPPLIER, {
            onCompleted: (response: any) => {
                const { isSuccess, data } = response.deleteSupplier
                if (isSuccess) {
                    router.back()
                } else {
                    console.error('mutationdeleteSupplier error', response)
                }
            },
            onError: (error: any) => {
                console.error('mutationdeleteSupplier error', error)
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

    return (
        <div className="w-full p-0 dark:text-white border border-slblue-50 bg-blue-50 dark:bg-sldarkblue-800">
            <div className="flex justify-between px-8 py-3 items-center bg-sldarkblue-900 rounded-t-lg">
                <Heading className="font-light font-monasans text-2xl text-white">
                    <span className="font-medium mr-2">Supplier:</span>{' '}
                    {supplier?.name}
                </Heading>
            </div>
            <div className="px-0 md:px-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div className="my-4 text-l">
                        Supplier details
                        <p className="text-xs mt-4 max-w-[25rem] leading-loose font-light">
                            Lorem ipsum dolor, sit amet consectetur adipisicing
                            elit. Aut minima, accusamus exercitationem eum non
                            iste, tempora dolorum dolorem a distinctio porro
                            pariatur asperiores id rem! Harum, dolorum hic!
                            Facere, aspernatur!
                        </p>
                    </div>
                    <div className="col-span-2 block pt-5 pb-3 px-7 bg-white border-slblue-200 rounded-lg dark:bg-sldarkblue-800 dark:border">
                        <div className="mb-4 flex gap-4">
                            <input
                                id={`supplier-name`}
                                type="text"
                                defaultValue={supplier?.name}
                                className={classes.input}
                                placeholder="Supplier name"
                            />
                            <input
                                id={`supplier-website`}
                                type="text"
                                defaultValue={supplier?.website}
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
                                defaultValue={supplier?.phone}
                                className={classes.input}
                                placeholder="Phone"
                            />
                            <input
                                id={`supplier-email`}
                                type="email"
                                defaultValue={supplier?.email}
                                className={classes.input}
                                placeholder="Email"
                            />
                        </div>
                        <div className="mb-4">
                            <textarea
                                id={`supplier-address`}
                                rows={4}
                                defaultValue={supplier?.address}
                                className={`${classes.textarea} p-2`}
                                placeholder="Supplier address"
                            />
                        </div>
                    </div>
                </div>
                <hr className="my-4" />
                <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div className="my-4 text-l">
                        Contact people
                        <p className="text-xs mt-4 max-w-[25rem] leading-loose font-light">
                            Lorem ipsum dolor, sit amet consectetur adipisicing
                            elit. Aut minima, accusamus exercitationem eum non
                            iste, tempora dolorum dolorem a distinctio porro
                            pariatur asperiores id rem! Facere, aspernatur!
                        </p>
                    </div>
                    <div className="col-span-2 block pt-5 pb-3 px-7 bg-white border-slblue-200 rounded-lg dark:bg-sldarkblue-800 dark:border">
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
                                    className="group inline-flex justify-center items-center rounded-md bg-sky-700 px-4 py-2 text-sm text-white shadow-sm hover:bg-white hover:text-sky-800 ring-1 ring-sky-700"
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
                    <div className="my-4 text-l">Notes</div>
                    <div className="col-span-2 block pt-5 pb-3 px-7 bg-white border-slblue-200 rounded-lg dark:bg-sldarkblue-800 dark:border">
                        <textarea
                            id={`supplier-notes`}
                            rows={5}
                            defaultValue={supplier?.notes}
                            className={`${classes.textarea} p-2`}
                            placeholder="Notes"
                        />
                    </div>
                </div>
            </div>
            <hr className="my-4" />
            <div className="flex justify-end px-8 pb-4 pt-4">
                <SeaLogsButton
                    text="Cancel"
                    type="text"
                    // link="/inventory/suppliers"
                    action={() => {
                        router.back()
                    }}
                />
                <SeaLogsButton
                    text="Delete"
                    type="secondary"
                    icon="trash"
                    color="rose"
                    action={handleDeleteSupplier}
                />
                <SeaLogsButton
                    text="Update Supplier"
                    type="primary"
                    icon="check"
                    color="sky"
                    action={handleSave}
                />
            </div>
        </div>
    )
}
