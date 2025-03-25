'use client'
import React, { useEffect, useState } from 'react'
import { Button, Heading } from 'react-aria-components'
import SignatureCanvas from 'react-signature-canvas'
import {
    AlertDialog,
    FooterWrapper,
    SeaLogsButton,
    TableWrapper,
} from '@/app/components/Components'
import { useRouter } from 'next/navigation'
import {
    CreateSupernumerary_LogBookEntrySection,
    UpdateSupernumerary_LogBookEntrySection,
    UpdateLogBookEntrySection_Signature,
    CreateLogBookEntrySection_Signature,
} from '@/app/lib/graphQL/mutation'
import { useLazyQuery, useMutation } from '@apollo/client'
import { useSearchParams } from 'next/navigation'
import { Supernumerary_LogBookEntrySection } from '@/app/lib/graphQL/query'

export default function CrewSupernumerary({
    logBookConfig = false,
    supernumerary = false,
    setSupernumerary,
    locked,
}: {
    logBookConfig: any
    supernumerary: any
    setSupernumerary: any
    locked: boolean
}) {
    const searchParams = useSearchParams()
    const logentryID = searchParams.get('logentryID') ?? 0
    const [currentSignature, setCurrentSignature] = useState<any>(null)
    const [currentGuest, setCurrentGuest] = useState<any>(false)
    const [supernumeraryConfig, setSupernumeraryConfig] = useState<any>(false)
    const [openAddGuestDialog, setopenAddGuestDialog] = useState<any>(false)

    useEffect(() => {
        if (logBookConfig) {
            setSupernumeraryConfig(
                logBookConfig.customisedLogBookComponents.nodes
                    .filter(
                        (config: any) =>
                            config.componentClass ===
                            'Supernumerary_LogBookComponent',
                    )[0]
                    .customisedComponentFields.nodes.map((field: any) => ({
                        title: field.fieldName,
                        status: field.status,
                    })),
            )
        }
    }, [logBookConfig])

    const handleSave = () => {
        if (
            !supernumeraryConfig ||
            supernumeraryConfig.find(
                (c: any) => c.title === 'Signature' && c.status != 'Off',
            )
        ) {
            if (currentSignature?.id > 0) {
                updateLogBookEntrySection_Signature({
                    variables: {
                        input: {
                            id: currentSignature?.id,
                            signatureData: currentSignature.signatureData,
                        },
                    },
                })
                updateGuest(currentSignature?.id)
            } else {
                createLogBookEntrySection_Signature({
                    variables: {
                        input: {
                            signatureData: currentSignature.signatureData,
                        },
                    },
                })
            }
        } else {
            updateGuest()
        }
    }

    const [createSupernumerary] = useMutation(
        CreateSupernumerary_LogBookEntrySection,
        {
            onCompleted: (data) => {
                const ids =
                    supernumerary.length > 0
                        ? [
                              ...supernumerary?.map((guest: any) => guest.id),
                              data?.createSupernumerary_LogBookEntrySection?.id,
                          ]
                        : [data?.createSupernumerary_LogBookEntrySection?.id]
                getSectionSupernumerary_LogBookEntrySection({
                    variables: {
                        id: ids,
                    },
                })
                setCurrentSignature(false)
                setopenAddGuestDialog(false)
            },

            onError: (error) => {
                console.log(error)
            },
        },
    )

    const [updateSupernumerary] = useMutation(
        UpdateSupernumerary_LogBookEntrySection,
        {
            onCompleted: (data) => {
                setCurrentSignature(false)
                getSectionSupernumerary_LogBookEntrySection({
                    variables: {
                        id: supernumerary?.map((guest: any) => guest.id),
                    },
                })
                setopenAddGuestDialog(false)
            },

            onError: (error) => {
                console.log(error)
            },
        },
    )

    const [createLogBookEntrySection_Signature] = useMutation(
        CreateLogBookEntrySection_Signature,
        {
            onCompleted: (data) => {
                console.log(data)
                updateGuest(data?.createLogBookEntrySection_Signature?.id)
                setopenAddGuestDialog(false)
            },

            onError: (error) => {
                console.log(error)
            },
        },
    )

    const updateGuest = (signatureID = 0) => {
        const firstName = (
            document.getElementById('firstname') as HTMLInputElement
        ).value
        const surname = (document.getElementById('surname') as HTMLInputElement)
            .value
        if (currentGuest && currentGuest?.id > 0) {
            if (signatureID == 0) {
                signatureID = currentGuest.sectionSignature.id
            }
            updateSupernumerary({
                variables: {
                    input: {
                        id: currentGuest.id,
                        firstName: firstName,
                        surname: surname,
                        sectionSignatureID: signatureID,
                    },
                },
            })
        } else {
            createSupernumerary({
                variables: {
                    input: {
                        firstName: firstName,
                        surname: surname,
                        logBookEntryID: logentryID,
                        sectionSignatureID: signatureID,
                    },
                },
            })
        }
    }

    const [updateLogBookEntrySection_Signature] = useMutation(
        UpdateLogBookEntrySection_Signature,
        {
            onCompleted: (data) => {
                console.log(data)
            },

            onError: (error) => {
                console.log(error)
            },
        },
    )

    const onSignatureChanged = (sign: any) => {
        currentSignature
            ? setCurrentSignature({ ...currentSignature, signatureData: sign })
            : setCurrentSignature({ signatureData: sign })
    }

    const [getSectionSupernumerary_LogBookEntrySection] = useLazyQuery(
        Supernumerary_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readSupernumerary_LogBookEntrySections.nodes
                setSupernumerary(data)
                setCurrentGuest(false)
            },
            onError: (error: any) => {
                console.error('Supernumerary_LogBookEntrySection error', error)
            },
        },
    )

    // console.log(currentGuest)

    const handleArchive = () => {
        if (currentGuest) {
            updateSupernumerary({
                variables: {
                    input: {
                        id: currentGuest.id,
                        archived: true,
                    },
                },
            })
            setCurrentGuest(false)
            getSectionSupernumerary_LogBookEntrySection({
                variables: {
                    id: supernumerary?.map((guest: any) => guest.id),
                },
            })
        }
    }

    const handleAddGuestDialog = () => {
        console.log('handleAddGuestDialog')
    }

    const handleCancel = () => {
        setopenAddGuestDialog(false)
    }

    const handleAddGuest = () => {
        setCurrentGuest(false)
        setopenAddGuestDialog(true)
    }

    const handleFirstNameClick = (guest: any) => {
        setCurrentGuest(guest)
        setopenAddGuestDialog(true)
    }

    return (
        <>
            <div className="py-0">
                <div className="flex justify-between md:flex-nowrap flex-wrap gap-3  items-center px-4 mb-4">
                    <h3 className="dark:text-white">
                        This section covers guest sign-ins and any policies they
                        must read
                    </h3>
                    <SeaLogsButton
                        text="Add Guest"
                        type="primary"
                        color="slblue"
                        icon="check"
                        action={handleAddGuest}
                    />
                </div>
                {supernumerary.length > 0 ? (
                    <div className="flex w-full justify-start flex-col md:flex-row items-start">
                        <div className="relative w-full my-6">
                            <div className="overflow-auto">
                                <TableWrapper headings={['Guests:firstHead']}>
                                    {supernumerary.map(
                                        (guest: any, index: number) => (
                                            <tr
                                                key={index}
                                                className={`border-b border-sldarkblue-50 even:bg-sllightblue-50/50 dark:border-slblue-50 hover:bg-sllightblue-50 dark:hover:bg-slblue-600 `}>
                                                <th
                                                    scope="row"
                                                    className="px-6 py-4 text-left">
                                                    <Button
                                                        className={`text-slblue-800 group-hover:text-emerald-600 font-light`}
                                                        onPress={() =>
                                                            handleFirstNameClick(
                                                                guest,
                                                            )
                                                        }>
                                                        {guest.firstName +
                                                            ' ' +
                                                            guest.surname}
                                                    </Button>
                                                </th>
                                            </tr>
                                        ),
                                    )}
                                </TableWrapper>
                            </div>
                        </div>
                    </div>
                ) : (
                    <hr className="my-0" />
                )}
            </div>
            <AlertDialog
                openDialog={openAddGuestDialog}
                setOpenDialog={setopenAddGuestDialog}
                handleCreate={handleAddGuestDialog}>
                <div className="bg-slblue-1000 -m-6 rounded-t-lg">
                    <Heading className="text-xl text-white font-medium p-6">
                        {currentGuest && currentGuest?.id > 0
                            ? 'Update Guest'
                            : 'Add Guest'}
                    </Heading>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
                    <div className="mb-4 md:mb-0">
                        {!locked && (
                            <>
                                <div className="my-4 flex items-center">
                                    {!supernumeraryConfig ||
                                    supernumeraryConfig.find(
                                        (c: any) =>
                                            c.title === 'FirstName' &&
                                            c.status != 'Off',
                                    ) ? (
                                        <div className="px-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white">
                                            <label className="hidden md:block font-light">
                                                First Name
                                            </label>
                                            <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                                                <div className="flex items-center">
                                                    <input
                                                        id="firstname"
                                                        className="w-64 peer flex justify-between rounded-md border border-gray-200 p-2 text-sm outline-2 placeholder:text-gray-500"
                                                        type="text"
                                                        placeholder="First Name"
                                                        name="firstname"
                                                        value={
                                                            currentGuest
                                                                ? currentGuest?.firstName
                                                                : ''
                                                        }
                                                        onChange={(e) => {
                                                            setCurrentGuest({
                                                                ...currentGuest,
                                                                firstName:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                    {!supernumeraryConfig ||
                                    supernumeraryConfig.find(
                                        (c: any) =>
                                            c.title === 'Surname' &&
                                            c.status != 'Off',
                                    ) ? (
                                        <div className="px-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white">
                                            <label className="hidden md:block font-light">
                                                Surname
                                            </label>
                                            <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                                                <div className="flex items-center">
                                                    <input
                                                        id="surname"
                                                        className="w-64 peer flex justify-between rounded-md border border-gray-200 p-2 text-sm outline-2 placeholder:text-gray-500"
                                                        type="text"
                                                        placeholder="Surname"
                                                        name="surname"
                                                        value={
                                                            currentGuest
                                                                ? currentGuest?.surname
                                                                : ''
                                                        }
                                                        onChange={(e) => {
                                                            setCurrentGuest({
                                                                ...currentGuest,
                                                                surname:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                                <div className="mb-2 md:mt-4 flex items-center">
                                    {!supernumeraryConfig ||
                                    supernumeraryConfig.find(
                                        (c: any) =>
                                            c.title === 'Signature' &&
                                            c.status != 'Off',
                                    ) ? (
                                        <>
                                            <div className="px-4 dark:text-white w-full overflow-hidden">
                                                <label className="font-light">
                                                    Signature
                                                </label>
                                                <SignaturePad
                                                    signature={
                                                        currentGuest?.sectionSignature
                                                    }
                                                    onSignatureChanged={
                                                        onSignatureChanged
                                                    }
                                                />
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                                {!supernumeraryConfig ||
                                supernumeraryConfig.find(
                                    (c: any) =>
                                        c.title === 'Policies' &&
                                        c.status != 'Off',
                                ) ? (
                                    <>
                                        <div>
                                            Please read and accept the following
                                            policies
                                        </div>
                                        {logBookConfig && (
                                            <div className="overflow-x-auto">
                                                <TableWrapper
                                                    headings={['', '']}>
                                                    {logBookConfig?.policies?.nodes.map(
                                                        (
                                                            policy: any,
                                                            index: number,
                                                        ) => (
                                                            <tr
                                                                key={index}
                                                                className="group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-gray-600">
                                                                <th
                                                                    scope="row"
                                                                    className="px-2 py-3 lg:px-6 min-w-1/2 text-left">
                                                                    {
                                                                        policy.title
                                                                    }
                                                                </th>
                                                                <td className="px-2 py-4">
                                                                    <a
                                                                        href={
                                                                            process
                                                                                .env
                                                                                .FILE_BASE_URL +
                                                                            policy.fileFilename
                                                                        }
                                                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                                        target="_blank">
                                                                        View
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </TableWrapper>
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <SeaLogsButton
                        action={handleCancel}
                        type="text"
                        text="Cancel"
                    />
                    <SeaLogsButton
                        color="slblue"
                        action={handleSave}
                        icon="check"
                        type="primary"
                        text={
                            currentGuest && currentGuest?.id > 0
                                ? 'Update Guest'
                                : 'Save Guest'
                        }
                    />
                </div>
            </AlertDialog>
        </>
    )
}

function SignaturePad({
    signature,
    onSignatureChanged,
}: {
    signature: any
    onSignatureChanged: (sign: String) => void
}) {
    const [signPad, setSignPad] = useState<SignaturePad | null>(null)
    const [loaded, setLoaded] = useState<boolean>(false)

    const handleSignatureChanged = (e: any) => {
        if (signPad?.toDataURL()) onSignatureChanged(signPad?.toDataURL())
    }
    const handleClear = () => {
        if (signPad) {
            signPad.clear()
            onSignatureChanged('')
        }
    }
    useEffect(() => {
        setLoaded(false)
        if (signPad) {
            signPad.clear()
        }
    }, [signature])
    {
        signature?.signatureData &&
            signPad &&
            !loaded &&
            (signPad.fromDataURL(signature.signatureData, {
                width: 384,
                height: 200,
            }),
            setLoaded(true))
    }
    return (
        <div className="flex flex-col items-right gap-3">
            <SignatureCanvas
                ref={(ref: any) => {
                    setSignPad(ref)
                }}
                penColor={`blue`}
                canvasProps={{
                    width: 384,
                    height: 200,
                    className:
                        'sigCanvas border border-gray-200 bg-white rounded-lg',
                }}
                onEnd={handleSignatureChanged}
            />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4"></div>
                <Button
                    onPress={handleClear}
                    className="peer flex justify-between text-sm">
                    Clear
                </Button>
            </div>
        </div>
    )
}
