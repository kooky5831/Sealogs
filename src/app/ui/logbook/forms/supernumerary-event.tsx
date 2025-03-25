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
import {
    CreateSupernumerary_LogBookEntrySection,
    UpdateSupernumerary_LogBookEntrySection,
    UpdateLogBookEntrySection_Signature,
    CreateLogBookEntrySection_Signature,
    CreateTripEvent,
    UpdateTripEvent,
    CreateEventType_Supernumerary,
    UpdateEventType_Supernumerary,
} from '@/app/lib/graphQL/mutation'
import { useLazyQuery, useMutation } from '@apollo/client'
import { useSearchParams } from 'next/navigation'
import {
    GetTripEvent,
    ReadOneEventType_Supernumerary,
    Supernumerary_LogBookEntrySection,
} from '@/app/lib/graphQL/query'
import toast, { Toaster } from 'react-hot-toast'
import { classes } from '@/app/components/GlobalClasses'
import dayjs from 'dayjs'
import { isEmpty, trim } from 'lodash'
import TimeField from '../components/time'
import TripEventModel from '@/app/offline/models/tripEvent'
import EventType_SupernumeraryModel from '@/app/offline/models/eventType_Supernumerary'
import Supernumerary_LogBookEntrySectionModel from '@/app/offline/models/supernumerary_LogBookEntrySection'
import LogBookEntrySection_SignatureModel from '@/app/offline/models/logBookEntrySection_Signature'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import { off } from 'process'

export default function SupernumeraryEvent({
    logBookConfig = false,
    locked,
    closeModal,
    currentTrip = false,
    updateTripReport,
    tripReport,
    selectedEvent = false,
    offline = false,
}: {
    logBookConfig: any
    locked: boolean
    closeModal: any
    currentTrip: any
    updateTripReport: any
    tripReport: any
    selectedEvent: any
    offline?: boolean
}) {
    const searchParams = useSearchParams()
    const logentryID = searchParams.get('logentryID') ?? 0
    const [currentSignature, setCurrentSignature] = useState<any>(null)
    const [currentGuest, setCurrentGuest] = useState<any>(false)
    const [supernumeraryConfig, setSupernumeraryConfig] = useState<any>(false)
    const [openAddGuestDialog, setOpenAddGuestDialog] = useState<any>(false)
    const [currentEvent, setCurrentEvent] = useState<any>(selectedEvent)
    const [supernumerary, setSupernumerary] = useState({} as any)
    const [formError, setFormError] = useState({} as any)
    const [closeOnSave, setCloseOnSave] = useState(false)

    const tripEventModel = new TripEventModel()
    const supernumeraryModel = new EventType_SupernumeraryModel()
    const supernumerarySectionModel =
        new Supernumerary_LogBookEntrySectionModel()
    const signatureModel = new LogBookEntrySection_SignatureModel()

    const handleSaveGuest = async () => {
        if (
            !supernumeraryConfig ||
            supernumeraryConfig.find(
                (c: any) =>
                    c.title === 'Supernumerary_Signature' && c.status != 'Off',
            )
        ) {
            if (currentSignature?.id > 0) {
                if (offline) {
                    // updateLogBookEntrySection_Signature
                    await signatureModel.save({
                        id: currentSignature?.id,
                        signatureData: currentSignature.signatureData,
                    })
                } else {
                    updateLogBookEntrySection_Signature({
                        variables: {
                            input: {
                                id: currentSignature?.id,
                                signatureData: currentSignature.signatureData,
                            },
                        },
                    })
                }
                updateGuest(currentSignature?.id)
            } else {
                if (currentSignature) {
                    if (offline) {
                        // createLogBookEntrySection_Signature
                        const data = await signatureModel.save({
                            id: generateUniqueId(),
                            signatureData: currentSignature.signatureData,
                        })
                        updateGuest(data.id)
                        setOpenAddGuestDialog(false)
                    } else {
                        createLogBookEntrySection_Signature({
                            variables: {
                                input: {
                                    signatureData:
                                        currentSignature.signatureData,
                                },
                            },
                        })
                    }
                } else {
                    updateGuest()
                }
            }
        } else {
            updateGuest()
        }
    }

    const handleDeleteGuest = async () => {
        if (offline) {
            // updateSupernumeraryLogbookEntrySection
            await supernumerarySectionModel.save({
                id: currentGuest.id,
                supernumeraryID: 0,
            })
            setCurrentSignature(false)
            // getSectionSupernumerary_LogBookEntrySection
            await supernumerarySectionModel.getByIds(
                supernumerary.guestList.nodes.map((guest: any) => guest.id),
            )
            setCurrentGuest(false)
            // readOneEventType_Supernumerary
            const data = await supernumeraryModel.getById(supernumerary.id)
            console.log('146', data)
            setSupernumerary(data)
            setOpenAddGuestDialog(false)
        } else {
            updateSupernumeraryLogbookEntrySection({
                variables: {
                    input: {
                        id: currentGuest.id,
                        supernumeraryID: 0,
                    },
                },
            })
        }
    }

    const [createTripEvent] = useMutation(CreateTripEvent, {
        onCompleted: (response) => {
            const data = response.createTripEvent
            setCurrentEvent(data)
        },
        onError: (error) => {
            console.error('Error creating trip event', error)
        },
    })

    const [createSupernumerary, { loading: createSupernumeraryLoading }] =
        useMutation(CreateEventType_Supernumerary, {
            onCompleted: (data) => {
                const supernumeraryID = data.createEventType_Supernumerary.id
                setSupernumerary({
                    ...supernumerary,
                    id: supernumeraryID,
                })
                createTripEvent({
                    variables: {
                        input: {
                            eventCategory: 'EventSupernumerary',
                            logBookEntrySectionID: currentTrip.id,
                            supernumeraryID: supernumeraryID,
                        },
                    },
                })
                if (closeOnSave) {
                    toast.success('Supernumerary event created')
                    setCloseOnSave(false)
                    closeModal()
                }
            },
            onError: (error) => {
                console.error('Error creating supernumerary event', error)
            },
        })
    const [createSupernumeraryLogbookEntrySection] = useMutation(
        CreateSupernumerary_LogBookEntrySection,
        {
            onCompleted: (data) => {
                loadSupernumerary(supernumerary.id)
                setCurrentSignature(false)
                setOpenAddGuestDialog(false)
                readOneEventType_Supernumerary({
                    variables: {
                        id: supernumerary.id,
                    },
                })
            },

            onError: (error) => {
                console.error(error)
            },
        },
    )

    const getCurrentEvent = async (id: any) => {
        if (offline) {
            // getTripEvent
            const event = await tripEventModel.getById(id)
            if (event) {
                // setTrainingID(event.crewTraining.id)
            }
        } else {
            getTripEvent({
                variables: {
                    id: id,
                },
            })
        }
    }

    const [getTripEvent] = useLazyQuery(GetTripEvent, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const event = response.readOneTripEvent
            if (event) {
                // setTrainingID(event.crewTraining.id)
            }
        },
        onError: (error) => {
            console.error('Error getting current event', error)
        },
    })
    const [updateTripEvent] = useMutation(UpdateTripEvent, {
        onCompleted: (response) => {
            toast.success('Trip event updated')
            getCurrentEvent(currentEvent?.id)
            updateTripReport({
                id: [...tripReport.map((trip: any) => trip.id), currentTrip.id],
            })
        },
        onError: (error) => {
            console.error('Error updating trip event', error)
        },
    })

    const [updateSupernumerary, { loading: updateSupernumeraryLoading }] =
        useMutation(UpdateEventType_Supernumerary, {
            onCompleted: (data) => {
                toast.success('Supernumerary event updated')
                updateTripReport({
                    id: [
                        ...tripReport.map((trip: any) => trip.id),
                        currentTrip.id,
                    ],
                })
                if (closeOnSave) {
                    setCloseOnSave(false)
                    closeModal()
                }
            },
            onError: (error) => {
                console.error('Error updating supernumerary event', error)
            },
        })
    const [updateSupernumeraryLogbookEntrySection] = useMutation(
        UpdateSupernumerary_LogBookEntrySection,
        {
            onCompleted: (data) => {
                setCurrentSignature(false)
                getSectionSupernumerary_LogBookEntrySection({
                    variables: {
                        id: supernumerary.guestList.nodes.map(
                            (guest: any) => guest.id,
                        ),
                    },
                })
                setOpenAddGuestDialog(false)
            },

            onError: (error) => {
                console.error(error)
            },
        },
    )

    const [createLogBookEntrySection_Signature] = useMutation(
        CreateLogBookEntrySection_Signature,
        {
            onCompleted: (data) => {
                updateGuest(data?.createLogBookEntrySection_Signature?.id)
                setOpenAddGuestDialog(false)
            },

            onError: (error) => {
                console.error(error)
            },
        },
    )

    const updateGuest = async (signatureID = 0) => {
        const firstName = (
            document.getElementById('firstname') as HTMLInputElement
        )?.value
        const surname = (document.getElementById('surname') as HTMLInputElement)
            ?.value
        if (currentGuest && currentGuest?.id > 0) {
            if (signatureID == 0) {
                signatureID = currentGuest.sectionSignature.id
            }
            if (offline) {
                // updateSupernumeraryLogbookEntrySection
                await supernumerarySectionModel.save({
                    id: currentGuest.id,
                    firstName: firstName,
                    surname: surname,
                    sectionSignatureID: signatureID,
                    supernumeraryID: supernumerary.id,
                })
                setCurrentSignature(false)
                // getSectionSupernumerary_LogBookEntrySection
                await supernumerarySectionModel.getByIds(
                    supernumerary.guestList.nodes.map((guest: any) => guest.id),
                )
                setCurrentGuest(false)
                // readOneEventType_Supernumerary
                const data = await supernumeraryModel.getById(supernumerary.id)
                console.log('340', data)
                setSupernumerary(data)
                setOpenAddGuestDialog(false)
            } else {
                updateSupernumeraryLogbookEntrySection({
                    variables: {
                        input: {
                            id: currentGuest.id,
                            firstName: firstName,
                            surname: surname,
                            sectionSignatureID: signatureID,
                            supernumeraryID: supernumerary.id,
                        },
                    },
                })
            }
        } else {
            if (offline) {
                // createSupernumeraryLogbookEntrySection
                await supernumerarySectionModel.save({
                    id: generateUniqueId(),
                    firstName: firstName,
                    surname: surname,
                    logBookEntryID: logentryID,
                    sectionSignatureID: signatureID,
                    supernumeraryID: supernumerary.id,
                })
                loadSupernumerary(supernumerary.id)
                setCurrentSignature(false)
                setOpenAddGuestDialog(false)
            } else {
                createSupernumeraryLogbookEntrySection({
                    variables: {
                        input: {
                            firstName: firstName,
                            surname: surname,
                            logBookEntryID: logentryID,
                            sectionSignatureID: signatureID,
                            supernumeraryID: supernumerary.id,
                        },
                    },
                })
            }
        }
    }

    const [updateLogBookEntrySection_Signature] = useMutation(
        UpdateLogBookEntrySection_Signature,
        {
            onCompleted: (data) => {},

            onError: (error) => {
                console.error(error)
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
                const data = response.readSupernumerary_LogBookEntrySections
                setCurrentGuest(false)
                // setSupernumerary(supernumerary)
                readOneEventType_Supernumerary({
                    variables: {
                        id: supernumerary.id,
                    },
                })
            },
            onError: (error: any) => {
                console.error('Supernumerary_LogBookEntrySection error', error)
            },
        },
    )

    const handleCancel = () => {
        setOpenAddGuestDialog(false)
    }

    const handleAddGuest = () => {
        setCurrentGuest(false)
        setOpenAddGuestDialog(true)
    }

    const handleFirstNameClick = (guest: any) => {
        setCurrentGuest(guest)
        setOpenAddGuestDialog(true)
    }
    const handleSave = async () => {
        const input = {
            id: supernumerary.id || 0,
            title: supernumerary.title,
            totalGuest: +supernumerary.totalGuest || 0,
            isBriefed: supernumerary.isBriefed || false,
            briefingTime: supernumerary.briefingTime || null,
        }
        setFormError({})
        if (isEmpty(supernumerary)) {
            setFormError({
                element: 'title',
                message: 'Title is required',
            })
            return
        } else if (!supernumerary.title || isEmpty(trim(supernumerary.title))) {
            setFormError({
                element: 'title',
                message: 'Title is required',
            })
        } else if (
            !supernumerary.totalGuest ||
            +supernumerary.totalGuest <= 0
        ) {
            setFormError({
                element: 'totalGuest',
                message: 'Number of guests is required',
            })
            return
        }
        if (currentEvent?.supernumerary) {
            if (offline) {
                // updateTripEvent
                const data = await tripEventModel.save({
                    id: +currentEvent.id,
                    eventCategory: 'Supernumerary',
                    logBookEntrySectionID: currentTrip.id,
                })
                toast.success('Trip event updated')
                console.log('475 setCurrentEvent', data)
                setCurrentEvent(data)
                updateTripReport({
                    id: [
                        ...tripReport.map((trip: any) => trip.id),
                        currentTrip.id,
                    ],
                })
            } else {
                updateTripEvent({
                    variables: {
                        input: {
                            id: +currentEvent.id,
                            eventCategory: 'Supernumerary',
                            logBookEntrySectionID: currentTrip.id,
                        },
                    },
                })
            }

            if (offline) {
                // updateSupernumeraryLogbookEntrySection
                await supernumerarySectionModel.save({
                    id: +selectedEvent?.eventType_Supernumerary,
                })
                setCurrentSignature(false)
                // getSectionSupernumerary_LogBookEntrySection
                await supernumerarySectionModel.getByIds(
                    supernumerary.guestList.nodes.map((guest: any) => guest.id),
                )
                setCurrentGuest(false)
                // readOneEventType_Supernumerary
                const data = await supernumeraryModel.getById(supernumerary.id)
                console.log('507', data)
                setSupernumerary(data)
                setOpenAddGuestDialog(false)
            } else {
                updateSupernumeraryLogbookEntrySection({
                    variables: {
                        input: {
                            id: +selectedEvent?.eventType_Supernumerary,
                        },
                    },
                })
            }
        }

        if (!supernumerary.id || +supernumerary.id === 0) {
            if (offline) {
                const data = await supernumeraryModel.save({
                    ...input,
                    id: generateUniqueId(),
                })
                const supernumeraryID = data.id
                console.log('528', data)
                setSupernumerary(data)
                // createTripEvent
                const tripEventData = await tripEventModel.save({
                    id: generateUniqueId(),
                    eventCategory: 'EventSupernumerary',
                    logBookEntrySectionID: currentTrip.id,
                    supernumeraryID: supernumeraryID,
                })
                console.log('538 setCurrentEvent', tripEventData)
                setCurrentEvent(tripEventData)
                if (closeOnSave) {
                    toast.success('Supernumerary event created')
                    setCloseOnSave(false)
                    closeModal()
                }
            } else {
                createSupernumerary({
                    variables: {
                        input: input,
                    },
                })
            }
        } else {
            if (offline) {
                const data = await supernumeraryModel.save(input)
                console.log('553', data)
                setSupernumerary(data)
                toast.success('Supernumerary event updated')
                updateTripReport({
                    id: [
                        ...tripReport.map((trip: any) => trip.id),
                        currentTrip.id,
                    ],
                })
                if (closeOnSave) {
                    setCloseOnSave(false)
                    closeModal()
                }
            } else {
                updateSupernumerary({
                    variables: {
                        input: input,
                    },
                })
            }
        }
    }
    const handleBriefingTimeChange = (date: any) => {
        const briefingTime = dayjs(date).format('HH:mm')
        console.log('577', {
            ...supernumerary,
            briefingTime: briefingTime,
        })
        setSupernumerary({
            ...supernumerary,
            briefingTime: briefingTime,
        })
    }
    const [readOneEventType_Supernumerary, { loading: loadingSupernumerary }] =
        useLazyQuery(ReadOneEventType_Supernumerary, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (data) => {
                setSupernumerary(data.readOneEventType_Supernumerary)
            },
            onError: (error) => {
                console.error(error)
            },
        })
    const loadSupernumerary = async (id: number) => {
        if (offline) {
            // readOneEventType_Supernumerary
            const data = await supernumeraryModel.getById(id)
            console.log('600', data)
            setSupernumerary(data)
        } else {
            await readOneEventType_Supernumerary({
                variables: {
                    id: id,
                },
            })
        }
    }
    useEffect(() => {
        if (logBookConfig) {
            setSupernumeraryConfig(
                logBookConfig.customisedLogBookComponents.nodes
                    .filter(
                        (config: any) =>
                            config.componentClass ===
                            'EventType_LogBookComponent',
                    )[0]
                    ?.customisedComponentFields.nodes.map((field: any) => ({
                        title: field.fieldName,
                        status: field.status,
                    })),
            )
        }
        console.log('currentEvent', currentEvent)
        if (currentEvent?.supernumerary) {
            loadSupernumerary(currentEvent.supernumerary.id)
        }
    }, [logBookConfig, currentEvent])
    return (
        <div className="w-full">
            <>
                <div className="mt-6 text-sm font-semibold uppercase">
                    Supernumerary
                </div>
                <p className="text-xs font-inter max-w-[40rem] leading-loose">
                    This section covers guest sign-ins and any policies they
                    must read.
                </p>
                <div className="my-4">
                    <SeaLogsButton
                        text="Add Guest"
                        type="primary"
                        icon="check"
                        action={handleAddGuest}
                        isDisabled={
                            loadingSupernumerary ||
                            createSupernumeraryLoading ||
                            updateSupernumeraryLoading
                        }
                    />
                </div>
                <div className="flex flex-col">
                    <div className="my-4">
                        <label className={`${classes.label} !w-full`}>
                            Title of supernumerary
                        </label>
                        <input
                            type="text"
                            className={classes.input}
                            value={supernumerary?.title}
                            onChange={(e) => {
                                console.log('662', {
                                    ...supernumerary,
                                    title: e.target.value,
                                })
                                setSupernumerary({
                                    ...supernumerary,
                                    title: e.target.value,
                                })
                            }}
                            placeholder="Enter Title"
                            onBlur={() => {
                                setCloseOnSave(false)
                                handleSave()
                            }}
                        />
                        {formError?.element === 'title' && (
                            <small className="text-red-500">
                                {formError?.message}
                            </small>
                        )}
                    </div>
                    <div className="flex gap-4 my-4">
                        <div>
                            <label className={`${classes.label} !w-full`}>
                                Number of Guests
                            </label>
                            <input
                                type="number"
                                className={classes.input}
                                min={1}
                                value={supernumerary?.totalGuest}
                                onChange={(e) => {
                                    console.log('694', {
                                        ...supernumerary,
                                        totalGuest: e.target.value,
                                    })
                                    setSupernumerary({
                                        ...supernumerary,
                                        totalGuest: e.target.value,
                                    })
                                }}
                                onBlur={() => {
                                    setCloseOnSave(false)
                                    handleSave()
                                }}
                            />
                            {formError?.element === 'totalGuest' && (
                                <small className="text-red-500">
                                    {formError?.message}
                                </small>
                            )}
                        </div>
                        {!supernumeraryConfig ||
                        supernumeraryConfig.find(
                            (c: any) =>
                                c.title === 'Supernumerary_BriefingTime' &&
                                c.status != 'Off',
                        ) ? (
                            <div>
                                <label className={`${classes.label} !w-full`}>
                                    Time of Briefing
                                </label>
                                <TimeField
                                    time={supernumerary?.briefingTime}
                                    handleTimeChange={handleBriefingTimeChange}
                                    timeID="time"
                                    fieldName="Time"
                                />
                            </div>
                        ) : null}
                    </div>
                    <div className="flex gap-4 my-4">
                        {!supernumeraryConfig ||
                        supernumeraryConfig.find(
                            (c: any) =>
                                c.title === 'Supernumerary_GuestBriefing' &&
                                c.status != 'Off',
                        ) ? (
                            <div className="w-1/2">
                                <div>
                                    <label
                                        className={`${classes.label} !w-full`}>
                                        Guest Briefing Completed
                                    </label>
                                    <div className="flex gap-4 ">
                                        <div className={classes.radio}>
                                            <input
                                                id="isBriefedNo"
                                                type="radio"
                                                name="isBriefed"
                                                className={classes.radioInput}
                                                // checked={getNoCheckedStatus(field)}
                                                checked={
                                                    !supernumerary?.isBriefed
                                                }
                                                onChange={() => {
                                                    console.log('758', {
                                                        ...supernumerary,
                                                        isBriefed: false,
                                                    })
                                                    setSupernumerary({
                                                        ...supernumerary,
                                                        isBriefed: false,
                                                    })
                                                }}
                                            />
                                            <label
                                                htmlFor="isBriefedNo"
                                                className={classes.radioLabel}>
                                                {' '}
                                                No{' '}
                                            </label>
                                        </div>
                                        <div className={classes.radio}>
                                            <input
                                                id="isBriefedYes"
                                                type="radio"
                                                name="isBriefed"
                                                className={classes.radioInput}
                                                // checked={getYesCheckedStatus(field)}
                                                checked={
                                                    supernumerary?.isBriefed
                                                }
                                                onChange={() => {
                                                    console.log('786', {
                                                        ...supernumerary,
                                                        isBriefed: true,
                                                    })
                                                    setSupernumerary({
                                                        ...supernumerary,
                                                        isBriefed: true,
                                                    })
                                                }}
                                            />
                                            <label
                                                htmlFor="isBriefedYes"
                                                className={classes.radioLabel}>
                                                {' '}
                                                Yes{' '}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </>
            {supernumerary?.guestList?.nodes.length > 0 && (
                <div className="flex w-full justify-start flex-col md:flex-row items-start">
                    <div className="relative w-full px-4">
                        <div className="overflow-auto">
                            <TableWrapper headings={['Guests:firstHead']}>
                                {supernumerary.guestList.nodes.map(
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
                                                    {guest?.firstName
                                                        ? guest?.firstName
                                                        : '' + guest?.surname
                                                          ? ' ' + guest.surname
                                                          : ''}
                                                </Button>
                                            </th>
                                        </tr>
                                    ),
                                )}
                            </TableWrapper>
                        </div>
                    </div>
                </div>
            )}
            <FooterWrapper noBorder>
                <SeaLogsButton
                    text="Cancel"
                    type="text"
                    action={() => {
                        closeModal()
                    }}
                />
                <SeaLogsButton
                    text={
                        !currentEvent || +currentEvent.id === 0
                            ? 'Save'
                            : 'Update'
                    }
                    type="primary"
                    color="sky"
                    icon="check"
                    action={
                        locked
                            ? () => {}
                            : () => {
                                  setCloseOnSave(true)
                                  handleSave()
                              }
                    }
                    isDisabled={
                        loadingSupernumerary ||
                        createSupernumeraryLoading ||
                        updateSupernumeraryLoading
                    }
                />
            </FooterWrapper>
            <AlertDialog
                openDialog={openAddGuestDialog}
                setOpenDialog={setOpenAddGuestDialog}
                handleCreate={handleSaveGuest}
                handleDelete={handleDeleteGuest}
                deleteText="Delete Guest"
                actionText={
                    currentGuest && currentGuest?.id > 0
                        ? 'Update Guest'
                        : 'Save Guest'
                }>
                <div className="bg-slblue-1000 -m-6 px-6 py-4 mb-4 rounded-t-lg">
                    <Heading className="text-xl text-white font-medium">
                        {currentGuest && currentGuest?.id > 0
                            ? 'Update Guest'
                            : 'Add Guest'}
                    </Heading>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
                    {!locked && (
                        <>
                            <div className="my-4 md:mb-0 w-full">
                                {!supernumeraryConfig ||
                                supernumeraryConfig.find(
                                    (c: any) =>
                                        c.title === 'Supernumerary_FirstName' &&
                                        c.status != 'Off',
                                ) ? (
                                    <div className="px-4 my-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white">
                                        <label className="hidden md:block font-light">
                                            First Name
                                        </label>
                                        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                                            <div className="flex items-center">
                                                <input
                                                    id="firstname"
                                                    className={classes.input}
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
                                                                e.target.value,
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
                                        c.title === 'Supernumerary_Surname' &&
                                        c.status != 'Off',
                                ) ? (
                                    <div className="px-4 mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white">
                                        <label className="hidden md:block font-light">
                                            Surname
                                        </label>
                                        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                                            <div className="flex items-center">
                                                <input
                                                    id="surname"
                                                    className={classes.input}
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
                                                                e.target.value,
                                                        })
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            <div>
                                <div className="my-4 flex items-center">
                                    {!supernumeraryConfig ||
                                    supernumeraryConfig.find(
                                        (c: any) =>
                                            c.title ===
                                                'Supernumerary_Signature' &&
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
                            </div>
                            {!supernumeraryConfig ||
                            supernumeraryConfig.find(
                                (c: any) =>
                                    c.title === 'Supernumerary_Policies' &&
                                    c.status != 'Off',
                            ) ? (
                                <div className="md:col-span-2">
                                    <div>
                                        Please read and accept the following
                                        policies
                                    </div>
                                    {logBookConfig && (
                                        <div className="overflow-x-auto">
                                            <TableWrapper headings={['', '']}>
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
                                                                {policy.title}
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
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </AlertDialog>
            <Toaster position="top-right" />
        </div>
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
