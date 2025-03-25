'use client'

import { FooterWrapper, SeaLogsButton } from '@/app/components/Components'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import {
    CreateRefuellingBunkering,
    UpdateRefuellingBunkering,
    CreateTripEvent,
    UpdateTripEvent,
    CREATE_FUELLOG,
    UPDATE_FUELLOG,
    UpdateFuelTank,
} from '@/app/lib/graphQL/mutation'
import { GET_FUELTANKS, GetTripEvent } from '@/app/lib/graphQL/query'
import Editor from '../../editor'
import { useLazyQuery, useMutation } from '@apollo/client'
import toast, { Toaster } from 'react-hot-toast'
import LocationField from '../components/location'
import DateTimeField from '../components/date-time'
import { getVesselByID } from '@/app/lib/actions'
import { useSearchParams } from 'next/navigation'
import { SealogsFuelIcon } from '@/app/lib/icons/SealogsFuelIcon'
import { classes } from '@/app/components/GlobalClasses'
import FuelTankModel from '@/app/offline/models/fuelTank'
import VesselModel from '@/app/offline/models/vessel'
import TripEventModel from '@/app/offline/models/tripEvent'
import RefuellingBunkeringModel from '@/app/offline/models/refuellingBunkering'
import FuelLogModel from '@/app/offline/models/fuelLog'
import { generateUniqueId } from '@/app/offline/helpers/functions'

export default function RefuellingBunkering({
    geoLocations,
    currentTrip = false,
    updateTripReport,
    selectedEvent = false,
    tripReport,
    closeModal,
    logBookConfig,
    locked,
    offline = false,
}: {
    geoLocations: any
    currentTrip: any
    updateTripReport: any
    selectedEvent: any
    tripReport: any
    closeModal: any
    logBookConfig: any
    locked: any
    offline?: boolean
}) {
    const searchParams = useSearchParams()
    const logentryID = searchParams.get('logentryID') ?? 0
    const vesselID = searchParams.get('vesselID') ?? 0
    const [time, setTime] = useState<any>()
    const [content, setContent] = useState<any>('')
    const [refuellingBunkering, setRefuellingBunkering] = useState<any>(false)
    const [currentEvent, setCurrentEvent] = useState<any>(selectedEvent)
    const [tripEvent, setTripEvent] = useState<any>(false)
    const [fuelLogs, setFuelLogs] = useState<any>([])
    const [fuelTankList, setFuelTankList] = useState<any>(false)
    const [currentLocation, setCurrentLocation] = useState<any>({
        latitude: '',
        longitude: '',
    })

    const fuelTankModel = new FuelTankModel()
    const vesselModel = new VesselModel()
    const tripEventModel = new TripEventModel()
    const refuellingBunkeringModel = new RefuellingBunkeringModel()
    const fuelLogModel = new FuelLogModel()

    const [queryGetFuelTanks] = useLazyQuery(GET_FUELTANKS, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.readFuelTanks.nodes
            setFuelTankList(data)
        },
        onError: (error: any) => {
            console.error('getFuelTanks error', error)
        },
    })

    const getFuelTanks = async (fuelTankIds: any) => {
        if (offline) {
            // queryGetFuelTanks
            const data = await fuelTankModel.getByIds(fuelTankIds)
            setFuelTankList(data)
        } else {
            await queryGetFuelTanks({
                variables: {
                    id: fuelTankIds,
                },
            })
        }
    }

    const handleSetVessel = (data: any) => {
        const fuelTankIds = data?.parentComponent_Components?.nodes
            .filter(
                (item: any) =>
                    item.basicComponent.componentCategory === 'FuelTank',
            )
            .map((item: any) => {
                return item.basicComponent.id
            })
        fuelTankIds.length > 0 && getFuelTanks(fuelTankIds)
    }

    if (!offline) {
        getVesselByID(+vesselID, handleSetVessel)
    }
    const offlineUseEffect = async () => {
        // getVesselByID(+vesselID, handleSetVessel)
        const data = await vesselModel.getById(vesselID)
        handleSetVessel(data)
    }
    useEffect(() => {
        if (offline) {
            offlineUseEffect()
        }
    }, [offline])

    const handleTimeChange = (date: any) => {
        setTime(dayjs(date))
    }

    useEffect(() => {
        setRefuellingBunkering(false)
        if (selectedEvent) {
            setCurrentEvent(selectedEvent)
            getCurrentEvent(selectedEvent?.id)
        }
    }, [selectedEvent])

    useEffect(() => {
        setRefuellingBunkering(false)
        if (currentEvent) {
            getCurrentEvent(currentEvent?.id)
        }
    }, [currentEvent])

    const getCurrentEvent = async (id: any) => {
        if (offline) {
            // getTripEvent
            const event = await tripEventModel.getById(id)
            if (event) {
                setTripEvent(event)
                setRefuellingBunkering({
                    geoLocationID:
                        event.eventType_RefuellingBunkering?.geoLocationID,
                    date: event.eventType_RefuellingBunkering?.date,
                    notes: event.eventType_RefuellingBunkering?.notes,
                    lat: event.eventType_RefuellingBunkering?.lat,
                    long: event.eventType_RefuellingBunkering?.long,
                })
                if (
                    event.eventType_RefuellingBunkering?.lat &&
                    event.eventType_RefuellingBunkering?.long
                ) {
                    setCurrentLocation({
                        latitude: event.eventType_RefuellingBunkering?.lat,
                        longitude: event.eventType_RefuellingBunkering?.long,
                    })
                }
                setContent(event.eventType_RefuellingBunkering?.notes)
                setTime(dayjs(event.eventType_RefuellingBunkering?.date))
                setFuelLogs(event.eventType_RefuellingBunkering.fuelLog.nodes)
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
                setTripEvent(event)
                setRefuellingBunkering({
                    geoLocationID:
                        event.eventType_RefuellingBunkering?.geoLocationID,
                    date: event.eventType_RefuellingBunkering?.date,
                    notes: event.eventType_RefuellingBunkering?.notes,
                    lat: event.eventType_RefuellingBunkering?.lat,
                    long: event.eventType_RefuellingBunkering?.long,
                })
                if (
                    event.eventType_RefuellingBunkering?.lat &&
                    event.eventType_RefuellingBunkering?.long
                ) {
                    setCurrentLocation({
                        latitude: event.eventType_RefuellingBunkering?.lat,
                        longitude: event.eventType_RefuellingBunkering?.long,
                    })
                }
                setContent(event.eventType_RefuellingBunkering?.notes)
                setTime(dayjs(event.eventType_RefuellingBunkering?.date))
                setFuelLogs(event.eventType_RefuellingBunkering.fuelLog.nodes)
            }
        },
        onError: (error) => {
            console.error('Error getting current event', error)
        },
    })

    const handleEditorChange = (newContent: any) => {
        setContent(newContent)
    }

    const handleSave = async () => {
        const variables = {
            input: {
                geoLocationID: refuellingBunkering?.geoLocationID,
                notes: content,
                lat: currentLocation.latitude.toString(),
                date: dayjs(time).format('YYYY-MM-DDTHH:mm:ssZ'),
                long: currentLocation.longitude.toString(),
            },
        }

        if (currentEvent) {
            if (offline) {
                // updateTripEvent
                await tripEventModel.save({
                    id: +currentEvent.id,
                    eventCategory: 'RefuellingBunkering',
                    logBookEntrySectionID: currentTrip.id,
                })
                toast.success('Trip event updated')
                getCurrentEvent(currentEvent?.id)
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
                            eventCategory: 'RefuellingBunkering',
                            logBookEntrySectionID: currentTrip.id,
                        },
                    },
                })
            }
            if (offline) {
                // updateRefuellingBunkering
                const data = await refuellingBunkeringModel.save({
                    id: +selectedEvent?.eventType_RefuellingBunkering?.id,
                    ...variables.input,
                })
                Promise.all(
                    fuelLogs.map(async (item: any) => {
                        if (item.id > 0) {
                            // updateFuelLog
                            await fuelLogModel.save({
                                id: item.id,
                                fuelTankID: +item.fuelTank.id,
                                fuelBefore: +item.fuelBefore,
                                fuelAdded: +item.fuelAdded,
                                fuelAfter: +item.fuelAfter,
                                date: dayjs(time).format(
                                    'YYYY-MM-DDTHH:mm:ssZ',
                                ),
                                refuellingBunkeringID: data.id,
                            })
                        } else {
                            // creteFuelLog
                            await fuelLogModel.save({
                                id: generateUniqueId(),
                                fuelTankID: +item.fuelTank.id,
                                fuelBefore: +item.fuelBefore,
                                fuelAdded: +item.fuelAdded,
                                fuelAfter: +item.fuelAfter,
                                date: dayjs(time).format(
                                    'YYYY-MM-DDTHH:mm:ssZ',
                                ),
                                refuellingBunkeringID: data.id,
                            })
                        }
                        // updateFuelTank
                        await fuelTankModel.save({
                            id: item.fuelTank.id,
                            currentLevel: +item.fuelAfter,
                        })
                    }),
                )
            } else {
                updateRefuellingBunkering({
                    variables: {
                        input: {
                            id: +selectedEvent?.eventType_RefuellingBunkering
                                ?.id,
                            ...variables.input,
                        },
                    },
                })
            }
        } else {
            if (offline) {
                // createTripEvent
                const data = await tripEventModel.save({
                    id: generateUniqueId(),
                    eventCategory: 'RefuellingBunkering',
                    logBookEntrySectionID: currentTrip.id,
                })
                toast.success('Trip event created')
                setCurrentEvent(data)
                // createRefuellingBunkering
                const refuellingBunkeringData =
                    await refuellingBunkeringModel.save({
                        id: generateUniqueId(),
                        geoLocationID: refuellingBunkering?.geoLocationID,
                        notes: content,
                        lat: currentLocation.latitude.toString(),
                        long: currentLocation.longitude.toString(),
                        date: dayjs(time).format('YYYY-MM-DDTHH:mm:ssZ'),
                    })
                Promise.all(
                    fuelLogs.map(async (item: any) => {
                        // creteFuelLog
                        await fuelLogModel.save({
                            id: generateUniqueId(),
                            fuelTankID: +item.fuelTank.id,
                            fuelBefore: +item.fuelBefore,
                            fuelAdded: +item.fuelAdded,
                            fuelAfter: +item.fuelAfter,
                            date: dayjs(time).format('YYYY-MM-DDTHH:mm:ssZ'),
                            refuellingBunkeringID: refuellingBunkeringData.id,
                        })
                        // updateFuelTank
                        await fuelTankModel.save({
                            id: item.fuelTank.id,
                            currentLevel: +item.fuelAfter,
                        })
                    }),
                )
                setTimeout(async () => {
                    // updateTripEvent
                    const x = await tripEventModel.save({
                        id: currentEvent?.id,
                        eventType_RefuellingBunkeringID:
                            refuellingBunkeringData.id,
                    })
                    toast.success('Trip event updated')
                    getCurrentEvent(currentEvent?.id)
                    updateTripReport({
                        id: [
                            ...tripReport.map((trip: any) => trip.id),
                            currentTrip.id,
                        ],
                    })
                }, 200)
                closeModal()
                // updateTripEvent
                await tripEventModel.save({
                    id: data.id,
                    eventCategory: 'RefuellingBunkering',
                    eventType_RefuellingBunkeringID: currentTrip.id,
                })
                toast.success('Trip event updated')
                getCurrentEvent(currentEvent?.id)
                updateTripReport({
                    id: [
                        ...tripReport.map((trip: any) => trip.id),
                        currentTrip.id,
                    ],
                })
            } else {
                createTripEvent({
                    variables: {
                        input: {
                            eventCategory: 'RefuellingBunkering',
                            logBookEntrySectionID: currentTrip.id,
                        },
                    },
                })
            }
        }
    }

    const [createTripEvent] = useMutation(CreateTripEvent, {
        onCompleted: (response) => {
            toast.success('Trip event created')
            const data = response.createTripEvent
            setCurrentEvent(data)
            createRefuellingBunkering({
                variables: {
                    input: {
                        geoLocationID: refuellingBunkering?.geoLocationID,
                        notes: content,
                        lat: currentLocation.latitude.toString(),
                        long: currentLocation.longitude.toString(),
                        date: dayjs(time).format('YYYY-MM-DDTHH:mm:ssZ'),
                    },
                },
            })
            updateTripEvent({
                variables: {
                    input: {
                        id: data.id,
                        eventCategory: 'RefuellingBunkering',
                        eventType_RefuellingBunkeringID: currentTrip.id,
                    },
                },
            })
        },
        onError: (error) => {
            console.error('Error creating trip event', error)
        },
    })

    const [createRefuellingBunkering] = useMutation(CreateRefuellingBunkering, {
        onCompleted: (response) => {
            const data = response.createRefuellingBunkering
            fuelLogs.map((item: any) => {
                creteFuelLog({
                    variables: {
                        input: {
                            fuelTankID: +item.fuelTank.id,
                            fuelBefore: +item.fuelBefore,
                            fuelAdded: +item.fuelAdded,
                            fuelAfter: +item.fuelAfter,
                            date: dayjs(time).format('YYYY-MM-DDTHH:mm:ssZ'),
                            refuellingBunkeringID: data.id,
                        },
                    },
                })
                updateFuelTank({
                    variables: {
                        input: {
                            id: item.fuelTank.id,
                            currentLevel: +item.fuelAfter,
                        },
                    },
                })
            })
            setTimeout(() => {
                updateTripEvent({
                    variables: {
                        input: {
                            id: currentEvent?.id,
                            eventType_RefuellingBunkeringID: data.id,
                        },
                    },
                })
            }, 200)
            closeModal()
        },
        onError: (error) => {
            console.error('Error creating refuelling', error)
        },
    })

    const [updateFuelTank] = useMutation(UpdateFuelTank, {
        onCompleted: (response) => {
            const data = response.updateFuelTank
        },
        onError: (error) => {
            console.error('Error updating fuel tank', error)
        },
    })

    const [creteFuelLog] = useMutation(CREATE_FUELLOG, {
        onCompleted: (response) => {
            const data = response.createFuelLog
        },
        onError: (error) => {
            console.error('Error creating fuel log', error)
        },
    })

    const [updateRefuellingBunkering] = useMutation(UpdateRefuellingBunkering, {
        onCompleted: (response) => {
            const data = response.updateRefuellingBunkering
            fuelLogs.map((item: any) => {
                if (item.id > 0) {
                    updateFuelLog({
                        variables: {
                            input: {
                                id: item.id,
                                fuelTankID: +item.fuelTank.id,
                                fuelBefore: +item.fuelBefore,
                                fuelAdded: +item.fuelAdded,
                                fuelAfter: +item.fuelAfter,
                                date: dayjs(time).format(
                                    'YYYY-MM-DDTHH:mm:ssZ',
                                ),
                                refuellingBunkeringID: data.id,
                            },
                        },
                    })
                } else {
                    creteFuelLog({
                        variables: {
                            input: {
                                fuelTankID: +item.fuelTank.id,
                                fuelBefore: +item.fuelBefore,
                                fuelAdded: +item.fuelAdded,
                                fuelAfter: +item.fuelAfter,
                                date: dayjs(time).format(
                                    'YYYY-MM-DDTHH:mm:ssZ',
                                ),
                                refuellingBunkeringID: data.id,
                            },
                        },
                    })
                }
                updateFuelTank({
                    variables: {
                        input: {
                            id: item.fuelTank.id,
                            currentLevel: +item.fuelAfter,
                        },
                    },
                })
            })
        },
        onError: (error) => {
            console.error('Error updating refuelling', error)
        },
    })

    const [updateFuelLog] = useMutation(UPDATE_FUELLOG, {
        onCompleted: (response) => {
            const data = response.updateFuelLog
        },
        onError: (error) => {
            console.error('Error updating fuel log', error)
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

    const displayField = (fieldName: string) => {
        const eventTypesConfig =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'EventType_LogBookComponent',
            )
        if (
            eventTypesConfig?.length > 0 &&
            eventTypesConfig[0]?.customisedComponentFields?.nodes.filter(
                (field: any) =>
                    field.fieldName === fieldName && field.status !== 'Off',
            ).length > 0
        ) {
            return true
        }
        return false
    }

    const handleLocationChange = (value: any) => {
        setRefuellingBunkering({
            ...refuellingBunkering,
            geoLocationID: value?.value,
        })
    }

    return (
        <div className="w-full">
            <>
                <div className="mt-6 text-sm font-semibold uppercase">
                    Refuelling / Bunkering
                </div>
                <p className="text-xs font-inter max-w-[40rem] leading-loose">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Molestias tempora suscipit maxime, fuga possimus quis porro
                    nisi eum voluptates libero quo velit, quisquam eos aliquid
                    vitae laboriosam in facilis dicta!
                </p>
                <div className="flex flex-col">
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <label className={`${classes.label} !w-full`}>
                            Location where Refuelling / Bunkering takes place
                        </label>
                        <LocationField
                            offline={offline}
                            currentTrip={currentTrip}
                            updateTripReport={updateTripReport}
                            tripReport={tripReport}
                            setCurrentLocation={setCurrentLocation}
                            handleLocationChange={handleLocationChange}
                            currentLocation={currentLocation}
                            currentEvent={
                                tripEvent.eventType_RefuellingBunkering
                            }
                        />
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <label className={`${classes.label} !w-full`}>
                            Times when Refuelling / Bunkering takes place
                        </label>
                        <DateTimeField
                            time={time}
                            handleTimeChange={handleTimeChange}
                            timeID="fuel-added-time"
                            fieldName="Time"
                            buttonLabel="Current now"
                        />
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        {fuelTankList &&
                            fuelTankList.length > 0 &&
                            fuelTankList.map((tank: any) => (
                                <div className="flex items-end" key={tank.id}>
                                    <SealogsFuelIcon className="w-6 h-6 mr-3 mb-0.5 text-gray-900" />
                                    <span className="text-sm font-semibold uppercase w-48 mb-2">
                                        {tank.title}
                                    </span>
                                    <div className="flex gap-4 w-full">
                                        <div className="flex flex-col justify-center grow">
                                            <label
                                                htmlFor={`fuel-level-${tank.id}`}
                                                className={`${classes.label} !w-full`}>
                                                Fuel before refuelling
                                            </label>
                                            <input
                                                id={`fuel-level-${tank.id}`}
                                                name={`fuel-level-${tank.id}`}
                                                type="number"
                                                min="0"
                                                max={tank.capacity}
                                                value={
                                                    fuelLogs?.find(
                                                        (item: any) =>
                                                            item.fuelTank.id ===
                                                            tank.id,
                                                    )?.fuelBefore
                                                        ? fuelLogs.find(
                                                              (item: any) =>
                                                                  item.fuelTank
                                                                      .id ===
                                                                  tank.id,
                                                          ).fuelBefore
                                                        : tank.currentLevel
                                                }
                                                className={classes.input}
                                                placeholder="Fuel level"
                                                onChange={(e) => {
                                                    if (
                                                        e.target.value >
                                                        tank.capacity
                                                    ) {
                                                        toast.error(
                                                            'Fuel level cannot be more than fuel tank capacity of ' +
                                                                tank.capacity,
                                                        )
                                                        return
                                                    }
                                                    if (
                                                        fuelLogs?.find(
                                                            (item: any) =>
                                                                item.fuelTank
                                                                    .id ===
                                                                tank.id,
                                                        )
                                                    ) {
                                                        setFuelLogs(
                                                            fuelLogs.map(
                                                                (item: any) => {
                                                                    if (
                                                                        item
                                                                            .fuelTank
                                                                            .id ===
                                                                        tank.id
                                                                    ) {
                                                                        return {
                                                                            ...item,
                                                                            fuelBefore:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            fuelAfter:
                                                                                +e
                                                                                    .target
                                                                                    .value +
                                                                                +item.fuelAdded,
                                                                        }
                                                                    }
                                                                    return item
                                                                },
                                                            ),
                                                        )
                                                    } else {
                                                        setFuelLogs([
                                                            ...fuelLogs,
                                                            {
                                                                fuelTank: {
                                                                    id: tank.id,
                                                                },
                                                                fuelBefore:
                                                                    e.target
                                                                        .value,
                                                                fuelAdded: 0,
                                                                fuelAfter:
                                                                    tank.currentLevel,
                                                            },
                                                        ])
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col justify-center grow">
                                            <label
                                                htmlFor={`fuel-added-${tank.id}`}
                                                className={`${classes.label} !w-full`}>
                                                Added fuel
                                            </label>
                                            <input
                                                id={`fuel-added-${tank.id}`}
                                                name={`fuel-added-${tank.id}`}
                                                type="number"
                                                min="0"
                                                max={
                                                    tank.capacity -
                                                    (fuelLogs.find(
                                                        (item: any) =>
                                                            item.fuelTank.id ===
                                                            tank.id,
                                                    )
                                                        ? fuelLogs.find(
                                                              (item: any) =>
                                                                  item.fuelTank
                                                                      .id ===
                                                                  tank.id,
                                                          ).fuelBefore
                                                        : tank.currentLevel)
                                                }
                                                value={
                                                    fuelLogs?.find(
                                                        (item: any) =>
                                                            item.fuelTank.id ===
                                                            tank.id,
                                                    )?.fuelAdded
                                                }
                                                onChange={(e) => {
                                                    if (
                                                        +e.target.value >
                                                        tank.capacity -
                                                            (fuelLogs.find(
                                                                (item: any) =>
                                                                    item
                                                                        .fuelTank
                                                                        .id ===
                                                                    tank.id,
                                                            )
                                                                ? fuelLogs.find(
                                                                      (
                                                                          item: any,
                                                                      ) =>
                                                                          item
                                                                              .fuelTank
                                                                              .id ===
                                                                          tank.id,
                                                                  ).fuelBefore
                                                                : tank.currentLevel)
                                                    ) {
                                                        toast.error(
                                                            'Fuel level cannot be more than fuel tank capacity of ' +
                                                                tank.capacity,
                                                        )
                                                        return
                                                    }
                                                    if (
                                                        fuelLogs?.find(
                                                            (item: any) =>
                                                                item.fuelTank
                                                                    .id ===
                                                                tank.id,
                                                        )
                                                    ) {
                                                        setFuelLogs(
                                                            fuelLogs.map(
                                                                (item: any) => {
                                                                    if (
                                                                        item
                                                                            .fuelTank
                                                                            .id ===
                                                                        tank.id
                                                                    ) {
                                                                        return {
                                                                            ...item,
                                                                            fuelAdded:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            fuelAfter:
                                                                                +item.fuelBefore +
                                                                                +e
                                                                                    .target
                                                                                    .value,
                                                                        }
                                                                    }
                                                                    return item
                                                                },
                                                            ),
                                                        )
                                                    } else {
                                                        setFuelLogs([
                                                            ...fuelLogs,
                                                            {
                                                                fuelTank: {
                                                                    id: tank.id,
                                                                },
                                                                fuelBefore:
                                                                    tank.currentLevel,
                                                                fuelAdded:
                                                                    e.target
                                                                        .value,
                                                                fuelAfter:
                                                                    +tank.currentLevel +
                                                                    +e.target
                                                                        .value,
                                                            },
                                                        ])
                                                    }
                                                }}
                                                className={classes.input}
                                                placeholder="Fuel added"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-center grow">
                                            <label
                                                htmlFor={`fuel-added-${tank.id}`}
                                                className={`${classes.label} !w-full`}>
                                                Current after refuelling
                                            </label>
                                            <input
                                                id={`fuel-current-${tank.id}`}
                                                name={`fuel-current-${tank.id}`}
                                                type="number"
                                                min={0}
                                                max={tank.capacity}
                                                value={
                                                    fuelLogs?.find(
                                                        (item: any) =>
                                                            item.fuelTank.id ===
                                                            tank.id,
                                                    )?.fuelAfter
                                                        ? fuelLogs.find(
                                                              (item: any) =>
                                                                  item.fuelTank
                                                                      .id ===
                                                                  tank.id,
                                                          ).fuelAfter
                                                        : +tank.currentLevel +
                                                          +fuelLogs.find(
                                                              (item: any) =>
                                                                  item.fuelTank
                                                                      .id ===
                                                                  tank.id,
                                                          )?.fuelAdded
                                                }
                                                onChange={(e) => {
                                                    if (
                                                        e.target.value >
                                                        tank.capacity
                                                    ) {
                                                        toast.error(
                                                            'Fuel level cannot be more than fuel tank capacity of ' +
                                                                tank.capacity,
                                                        )
                                                        return
                                                    }
                                                    if (
                                                        fuelLogs?.find(
                                                            (item: any) =>
                                                                item.fuelTank
                                                                    .id ===
                                                                tank.id,
                                                        )
                                                    ) {
                                                        setFuelLogs(
                                                            fuelLogs.map(
                                                                (item: any) => {
                                                                    if (
                                                                        item
                                                                            .fuelTank
                                                                            .id ===
                                                                        tank.id
                                                                    ) {
                                                                        return {
                                                                            ...item,
                                                                            fuelAfter:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        }
                                                                    }
                                                                    return item
                                                                },
                                                            ),
                                                        )
                                                    } else {
                                                        setFuelLogs([
                                                            ...fuelLogs,
                                                            {
                                                                fuelTank: {
                                                                    id: tank.id,
                                                                },
                                                                fuelBefore:
                                                                    tank.currentLevel,
                                                                fuelAdded: 0,
                                                                fuelAfter:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        ])
                                                    }
                                                }}
                                                className={classes.input}
                                                placeholder="Current fuel"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </>
            <hr className="my-2" />
            <>
                <div className="mt-6 text-sm font-semibold uppercase">
                    Fuel Receipts / Comments
                </div>
                <p className="text-xs font-inter max-w-[40rem] leading-loose">
                    Add receipts and comment associated with fuel
                </p>
                <div className="">
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4 flex items-center w-full`}>
                        {(!currentEvent || refuellingBunkering) && (
                            <Editor
                                id="fuel-receipts"
                                placeholder="Fuel Receipts"
                                className="!w-full bg-white ring-1 ring-inset ring-gray-200"
                                content={content}
                                handleEditorChange={handleEditorChange}
                            />
                        )}
                    </div>
                </div>
            </>
            <FooterWrapper noBorder>
                <SeaLogsButton text="Cancel" type="text" />
                <SeaLogsButton
                    text={selectedEvent ? 'Update' : 'Save'}
                    type="primary"
                    color="sky"
                    icon="check"
                    action={locked ? () => {} : handleSave}
                />
            </FooterWrapper>
            <Toaster position="top-right" />
        </div>
    )
}
