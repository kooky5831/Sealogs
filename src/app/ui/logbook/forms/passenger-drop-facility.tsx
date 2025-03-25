'use client'
import {
    AlertDialog,
    FooterWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { Heading } from 'react-aria-components'
import {
    CreateEventType_PassengerDropFacility,
    UpdateEventType_PassengerDropFacility,
    CreateTripEvent,
    UpdateTripEvent,
    CREATE_GEO_LOCATION,
    UpdateTripReport_LogBookEntrySection,
    UPDATE_FUELLOG,
    CREATE_FUELLOG,
    UpdateFuelTank,
} from '@/app/lib/graphQL/mutation'
import { GET_FUELTANKS, GetTripEvent } from '@/app/lib/graphQL/query'
import Select from 'react-select'
import { useLazyQuery, useMutation } from '@apollo/client'
import toast, { Toaster } from 'react-hot-toast'
import { classes } from '@/app/components/GlobalClasses'
import LocationField from '../components/location'
import TimeField from '../components/time'
import { SealogsFuelIcon } from '@/app/lib/icons/SealogsFuelIcon'
import FuelTankModel from '@/app/offline/models/fuelTank'
import TripEventModel from '@/app/offline/models/tripEvent'
import EventType_PassengerDropFacilityModel from '@/app/offline/models/eventType_PassengerDropFacility'
import GeoLocationModel from '@/app/offline/models/geoLocation'
import TripReport_LogBookEntrySectionModel from '@/app/offline/models/tripReport_LogBookEntrySection'
import FuelLogModel from '@/app/offline/models/fuelLog'
import { generateUniqueId } from '@/app/offline/helpers/functions'

export default function PassengerDropFacility({
    geoLocations,
    currentTrip = false,
    updateTripReport,
    selectedEvent = false,
    tripReport,
    closeModal,
    type,
    logBookConfig,
    previousDropEvent,
    vessel,
    locked,
    offline = false,
}: {
    geoLocations: any
    currentTrip: any
    updateTripReport: any
    selectedEvent: any
    tripReport: any
    closeModal: any
    type: any
    logBookConfig: any
    previousDropEvent: any
    vessel: any
    locked: any
    offline?: boolean
}) {
    const [locations, setLocations] = useState<any>(false)
    const [time, setTime] = useState<any>(dayjs().format('HH:mm'))
    const [passengerDropFacility, setPassengerDropFacility] =
        useState<any>(false)
    const [currentEvent, setCurrentEvent] = useState<any>(selectedEvent)
    const [parentLocation, setParentLocation] = useState<any>(false)
    const [initialPax, setInitialPax] = useState<any>({ paxOn: 0, paxOff: 0 })
    const [tripEvent, setTripEvent] = useState<any>(false)
    const [fuelTankList, setFuelTankList] = useState<any>(false)
    const [location, setLocation] = useState<any>({
        latitude: '',
        longitude: '',
    })
    const [currentLocation, setCurrentLocation] = useState<any>({
        latitude: '',
        longitude: '',
    })
    const [openNewLocationDialog, setOpenNewLocationDialog] =
        useState<boolean>(false)

    const fuelTankModel = new FuelTankModel()
    const tripEventModel = new TripEventModel()
    const passengerDropFacilityModel =
        new EventType_PassengerDropFacilityModel()
    const geoLocationModel = new GeoLocationModel()
    const tripReportModel = new TripReport_LogBookEntrySectionModel()
    const fuelLogModel = new FuelLogModel()
    const handleTimeChange = (date: any) => {
        setTime(dayjs(date).format('HH:mm'))
    }

    const offlineSelectedEventUseEffect = async () => {
        const event = await tripEventModel.getById(previousDropEvent?.id)
        if (event) {
            setPassengerDropFacility({
                geoLocationID:
                    event.eventType_PassengerDropFacility?.geoLocationID,
                fuelLevel: event.eventType_PassengerDropFacility?.fuelLevel,
                lat: event.eventType_PassengerDropFacility?.lat,
                long: event.eventType_PassengerDropFacility?.long,
                fuelLog: event.eventType_PassengerDropFacility?.fuelLog?.nodes,
            })
            if (
                event.eventType_PassengerDropFacility?.lat &&
                event.eventType_PassengerDropFacility?.long
            ) {
                setCurrentLocation({
                    latitude: event.eventType_PassengerDropFacility?.lat,
                    longitude: event.eventType_PassengerDropFacility?.long,
                })
            }
        }
    }
    useEffect(() => {
        setPassengerDropFacility(false)
        if (selectedEvent) {
            setCurrentEvent(selectedEvent)
            getCurrentEvent(selectedEvent?.id)
        } else {
            if (offline) {
                offlineSelectedEventUseEffect()
            } else {
                getPreviousDropEvent({
                    variables: {
                        id: previousDropEvent?.id,
                    },
                })
            }
        }
    }, [selectedEvent])

    useEffect(() => {
        setPassengerDropFacility(false)
        if (currentEvent) {
            getCurrentEvent(currentEvent?.id)
        }
    }, [currentEvent])

    const [getPreviousDropEvent] = useLazyQuery(GetTripEvent, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const event = response.readOneTripEvent
            if (event) {
                setPassengerDropFacility({
                    geoLocationID:
                        event.eventType_PassengerDropFacility?.geoLocationID,
                    fuelLevel: event.eventType_PassengerDropFacility?.fuelLevel,
                    lat: event.eventType_PassengerDropFacility?.lat,
                    long: event.eventType_PassengerDropFacility?.long,
                    fuelLog:
                        event.eventType_PassengerDropFacility?.fuelLog?.nodes,
                })
                if (
                    event.eventType_PassengerDropFacility?.lat &&
                    event.eventType_PassengerDropFacility?.long
                ) {
                    setCurrentLocation({
                        latitude: event.eventType_PassengerDropFacility?.lat,
                        longitude: event.eventType_PassengerDropFacility?.long,
                    })
                }
            }
        },
        onError: (error) => {
            console.error('Error getting previous event', error)
        },
    })

    const getCurrentEvent = async (id: any) => {
        if (offline) {
            const event = await tripEventModel.getById(id)
            if (event) {
                setTripEvent(event)
                setPassengerDropFacility({
                    geoLocationID:
                        event.eventType_PassengerDropFacility?.geoLocationID,
                    time: event.eventType_PassengerDropFacility?.time,
                    title: event.eventType_PassengerDropFacility?.title,
                    fuelLevel: event.eventType_PassengerDropFacility?.fuelLevel,
                    paxOn: +event.eventType_PassengerDropFacility?.paxOn,
                    paxOff: +event.eventType_PassengerDropFacility?.paxOff,
                    type: event.eventType_PassengerDropFacility?.type,
                    lat: event.eventType_PassengerDropFacility?.lat,
                    long: event.eventType_PassengerDropFacility?.long,
                    fuelLog:
                        event.eventType_PassengerDropFacility?.fuelLog?.nodes,
                })
                setInitialPax({
                    paxOn: +event.eventType_PassengerDropFacility?.paxOn,
                    paxOff: +event.eventType_PassengerDropFacility?.paxOff,
                })
                setTime(event.eventType_PassengerDropFacility?.time)
                if (
                    event.eventType_PassengerDropFacility?.lat &&
                    event.eventType_PassengerDropFacility?.long
                ) {
                    setCurrentLocation({
                        latitude: event.eventType_PassengerDropFacility?.lat,
                        longitude: event.eventType_PassengerDropFacility?.long,
                    })
                }
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
                setPassengerDropFacility({
                    geoLocationID:
                        event.eventType_PassengerDropFacility?.geoLocationID,
                    time: event.eventType_PassengerDropFacility?.time,
                    title: event.eventType_PassengerDropFacility?.title,
                    fuelLevel: event.eventType_PassengerDropFacility?.fuelLevel,
                    paxOn: +event.eventType_PassengerDropFacility?.paxOn,
                    paxOff: +event.eventType_PassengerDropFacility?.paxOff,
                    type: event.eventType_PassengerDropFacility?.type,
                    lat: event.eventType_PassengerDropFacility?.lat,
                    long: event.eventType_PassengerDropFacility?.long,
                    fuelLog:
                        event.eventType_PassengerDropFacility?.fuelLog?.nodes,
                })
                setInitialPax({
                    paxOn: +event.eventType_PassengerDropFacility?.paxOn,
                    paxOff: +event.eventType_PassengerDropFacility?.paxOff,
                })
                setTime(event.eventType_PassengerDropFacility?.time)
                if (
                    event.eventType_PassengerDropFacility?.lat &&
                    event.eventType_PassengerDropFacility?.long
                ) {
                    setCurrentLocation({
                        latitude: event.eventType_PassengerDropFacility?.lat,
                        longitude: event.eventType_PassengerDropFacility?.long,
                    })
                }
            }
        },
        onError: (error) => {
            console.error('Error getting current event', error)
        },
    })

    useEffect(() => {
        if (geoLocations) {
            setLocations([
                { label: '--- Add new location ---', value: 'newLocation' },
                ...geoLocations
                    .filter((location: any) => location.title)
                    .map((location: any) => ({
                        label: location.title,
                        value: location.id,
                        latitude: location.lat,
                        longitude: location.long,
                    })),
            ])
        }
    }, [geoLocations])

    const handleSave = async () => {
        const variables = {
            input: {
                geoLocationID: passengerDropFacility?.geoLocationID,
                time: time,
                title: passengerDropFacility?.title,
                fuelLevel: passengerDropFacility?.fuelLevel,
                paxOn: +passengerDropFacility?.paxOn,
                paxOff: +passengerDropFacility?.paxOff,
                type: type,
                lat: currentLocation.latitude.toString(),
                long: currentLocation.longitude.toString(),
            },
        }

        if (
            initialPax.paxOn !==
                (passengerDropFacility?.paxOn
                    ? +passengerDropFacility.paxOn
                    : 0) ||
            initialPax.paxOff !==
                (passengerDropFacility?.paxOff
                    ? +passengerDropFacility?.paxOff
                    : 0)
        ) {
            const pob =
                (currentTrip?.pob ? +currentTrip.pob : 0) +
                ((passengerDropFacility?.paxOn
                    ? +passengerDropFacility.paxOn
                    : 0) -
                    initialPax.paxOn) -
                ((passengerDropFacility?.paxOff
                    ? +passengerDropFacility?.paxOff
                    : 0) -
                    initialPax.paxOff)
            if (offline) {
                await tripReportModel.save({
                    id: currentTrip.id,
                    pob: +pob,
                })
                updateTripReport({
                    id: tripReport.map((trip: any) => trip.id),
                })
            } else {
                updateTripLogPax({
                    variables: {
                        input: {
                            id: currentTrip.id,
                            pob: +pob,
                        },
                    },
                })
            }
        }

        if (currentEvent) {
            if (offline) {
                // updateTripEvent
                await tripEventModel.save({
                    id: +currentEvent.id,
                    eventCategory: 'PassengerDropFacility',
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
                // updateEventType_PassengerDropFacility
                await passengerDropFacilityModel.save({
                    id: +selectedEvent?.eventType_PassengerDropFacilityID,
                    ...variables.input,
                })
                // updateFuelLogs
                const currentID =
                    +selectedEvent?.eventType_PassengerDropFacilityID
                Promise.all(
                    fuelTankList?.map(async (fuelTank: any) => {
                        await fuelTankModel.save({
                            id: fuelTank.id,
                            currentLevel: fuelTank.currentLevel,
                        })
                        if (
                            currentEvent &&
                            currentEvent?.fuelLogs?.nodes.find(
                                (log: any) => log.fuelTankID === fuelTank.id,
                            ).id > 0
                        ) {
                            await fuelLogModel.save({
                                id: currentEvent?.fuelLogs?.nodes.find(
                                    (log: any) =>
                                        log.fuelTankID === fuelTank.id,
                                ).id,
                                fuelTankID: fuelTank.id,
                                fuelAfter: fuelTank.currentLevel,
                                date: dayjs().format('YYYY-MM-DD'),
                                eventType_PassengerDropFacilityID: currentID,
                            })
                        } else {
                            await fuelLogModel.save({
                                id: generateUniqueId(),
                                fuelTankID: fuelTank.id,
                                fuelAfter: fuelTank.currentLevel,
                                date: dayjs().format('YYYY-MM-DD'),
                                eventType_PassengerDropFacilityID: currentID,
                            })
                        }
                    }),
                )
            } else {
                updateTripEvent({
                    variables: {
                        input: {
                            id: +currentEvent.id,
                            eventCategory: 'PassengerDropFacility',
                            logBookEntrySectionID: currentTrip.id,
                        },
                    },
                })
                updateEventType_PassengerDropFacility({
                    variables: {
                        input: {
                            id: +selectedEvent?.eventType_PassengerDropFacilityID,
                            ...variables.input,
                        },
                    },
                })
                updateFuelLogs(
                    +selectedEvent?.eventType_PassengerDropFacilityID,
                )
            }
        } else {
            if (offline) {
                const tripEventData = await tripEventModel.save({
                    id: generateUniqueId(),
                    eventCategory: 'PassengerDropFacility',
                    logBookEntrySectionID: currentTrip.id,
                })
                toast.success('Trip event created')
                setCurrentEvent(tripEventData)
                const passengerDropFacilityData =
                    await passengerDropFacilityModel.save({
                        id: generateUniqueId(),
                        geoLocationID: passengerDropFacility?.geoLocationID,
                        time: time,
                        title: passengerDropFacility?.title,
                        fuelLevel: passengerDropFacility?.fuelLevel,
                        paxOn: +passengerDropFacility?.paxOn,
                        paxOff: +passengerDropFacility?.paxOff,
                        type: type,
                        lat: currentLocation.latitude.toString(),
                        long: currentLocation.longitude.toString(),
                    })
                const currentID = passengerDropFacilityData.id
                Promise.all(
                    fuelTankList?.map(async (fuelTank: any) => {
                        const variables = {
                            input: {
                                id: fuelTank.id,
                                currentLevel: fuelTank.currentLevel,
                            },
                        }
                        await fuelTankModel.save({
                            id: fuelTank.id,
                            currentLevel: fuelTank.currentLevel,
                        })
                        if (
                            currentEvent &&
                            currentEvent?.fuelLogs?.nodes.find(
                                (log: any) => log.fuelTankID === fuelTank.id,
                            ).id > 0
                        ) {
                            await fuelLogModel.save({
                                id: currentEvent?.fuelLogs?.nodes.find(
                                    (log: any) =>
                                        log.fuelTankID === fuelTank.id,
                                ).id,
                                fuelTankID: fuelTank.id,
                                fuelAfter: fuelTank.currentLevel,
                                date: dayjs().format('YYYY-MM-DD'),
                                eventType_PassengerDropFacilityID: currentID,
                            })
                        } else {
                            await fuelLogModel.save({
                                id: generateUniqueId(),
                                fuelTankID: fuelTank.id,
                                fuelAfter: fuelTank.currentLevel,
                                date: dayjs().format('YYYY-MM-DD'),
                                eventType_PassengerDropFacilityID: currentID,
                            })
                        }
                    }),
                )
                await tripEventModel.save({
                    id: currentEvent?.id,
                    eventType_PassengerDropFacilityID:
                        passengerDropFacilityData.id,
                })
                toast.success('Trip event updated')
                getCurrentEvent(currentEvent?.id)
                updateTripReport({
                    id: [
                        ...tripReport.map((trip: any) => trip.id),
                        currentTrip.id,
                    ],
                })
                closeModal()
            } else {
                createTripEvent({
                    variables: {
                        input: {
                            eventCategory: 'PassengerDropFacility',
                            logBookEntrySectionID: currentTrip.id,
                        },
                    },
                })
            }
        }
    }

    const [updateTripLogPax] = useMutation(
        UpdateTripReport_LogBookEntrySection,
        {
            onCompleted: (data) => {
                updateTripReport({
                    id: tripReport.map((trip: any) => trip.id),
                })
            },
            onError: (error) => {
                console.error('onError', error)
            },
        },
    )

    const [createTripEvent] = useMutation(CreateTripEvent, {
        onCompleted: (response) => {
            toast.success('Trip event created')
            const data = response.createTripEvent
            setCurrentEvent(data)
            createEventType_PassengerDropFacility({
                variables: {
                    input: {
                        geoLocationID: passengerDropFacility?.geoLocationID,
                        time: time,
                        title: passengerDropFacility?.title,
                        fuelLevel: passengerDropFacility?.fuelLevel,
                        paxOn: +passengerDropFacility?.paxOn,
                        paxOff: +passengerDropFacility?.paxOff,
                        type: type,
                        lat: currentLocation.latitude.toString(),
                        long: currentLocation.longitude.toString(),
                    },
                },
            })
        },
        onError: (error) => {
            console.error('Error creating trip event', error)
        },
    })

    const [createEventType_PassengerDropFacility] = useMutation(
        CreateEventType_PassengerDropFacility,
        {
            onCompleted: (response) => {
                const data = response.createEventType_PassengerDropFacility
                updateFuelLogs(data.id)
                updateTripEvent({
                    variables: {
                        input: {
                            id: currentEvent?.id,
                            eventType_PassengerDropFacilityID: data.id,
                        },
                    },
                })
                closeModal()
            },
            onError: (error) => {
                console.error('Error creating passenger drop facility', error)
            },
        },
    )

    const [updateEventType_PassengerDropFacility] = useMutation(
        UpdateEventType_PassengerDropFacility,
        {
            onCompleted: (response) => {
                const data = response.updateEventType_PassengerDropFacility
            },
            onError: (error) => {
                console.error('Error updating passenger drop facility', error)
            },
        },
    )

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

    const handleLocationChange = (selectedLocation: any) => {
        if (selectedLocation.value === 'newLocation') {
            toast.loading('Getting your current location...')
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(({ coords }) => {
                    const { latitude, longitude } = coords
                    setLocation({ latitude, longitude })
                    toast.remove()
                    toast.success('Location found')
                    setOpenNewLocationDialog(true)
                })
            } else {
                toast.error('Geolocation is not supported by your browser')
                setOpenNewLocationDialog(true)
            }
        } else {
            setPassengerDropFacility({
                ...passengerDropFacility,
                geoLocationID: selectedLocation.value,
            })
        }
    }

    const handleCreateNewLocation = async () => {
        const title = document.getElementById(
            'new-location-title',
        ) as HTMLInputElement
        const latitude = document.getElementById(
            'new-location-latitude',
        ) as HTMLInputElement
        const longitude = document.getElementById(
            'new-location-longitude',
        ) as HTMLInputElement
        if (title && latitude && longitude) {
            if (offline) {
                const data = await geoLocationModel.save({
                    id: generateUniqueId(),
                    title: title.value,
                    lat: +latitude.value,
                    long: +longitude.value,
                    parentID: parentLocation,
                })
                setLocations([
                    ...locations,
                    {
                        label: data.title,
                        value: data.id,
                        latitude: data.lat,
                        longitude: data.long,
                    },
                ])
                setPassengerDropFacility({
                    ...passengerDropFacility,
                    geoLocationID: data.id,
                })
                setOpenNewLocationDialog(false)
            } else {
                createGeoLocation({
                    variables: {
                        input: {
                            title: title.value,
                            lat: +latitude.value,
                            long: +longitude.value,
                            parentID: parentLocation,
                        },
                    },
                })
            }
        }
    }

    const [createGeoLocation] = useMutation(CREATE_GEO_LOCATION, {
        onCompleted: (response) => {
            const data = response.createGeoLocation
            setLocations([
                ...locations,
                {
                    label: data.title,
                    value: data.id,
                    latitude: data.lat,
                    longitude: data.long,
                },
            ])
            setPassengerDropFacility({
                ...passengerDropFacility,
                geoLocationID: data.id,
            })
            setOpenNewLocationDialog(false)
        },
        onError: (error) => {
            console.error('Error creating new location', error)
        },
    })

    const handleParentLocationChange = (selectedLocation: any) => {
        setParentLocation(selectedLocation.value)
    }

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

    const handleSetVessel = (vessel: any) => {
        const fuelTankIds = vessel?.parentComponent_Components?.nodes
            .filter(
                (item: any) =>
                    item.basicComponent.componentCategory === 'FuelTank',
            )
            .map((item: any) => {
                return item.basicComponent.id
            })
        fuelTankIds.length > 0 && getFuelTanks(fuelTankIds)
    }

    useEffect(() => {
        if (vessel) {
            handleSetVessel(vessel)
        }
    }, [vessel])

    const handleUpdateFuelTank = (tank: any, value: any) => {
        if (tank.capacity < +value) {
            toast.error(
                'Fuel level cannot be higher than tank capacity of ' +
                    tank.capacity,
            )
            return
        }
        setFuelTankList(
            fuelTankList.map((item: any) => {
                if (item.id === tank.id) {
                    item.currentLevel = +value
                    return item
                }
                return item
            }),
        )
    }

    const [updateFuelLog] = useMutation(UPDATE_FUELLOG, {
        onCompleted: (response) => {
            const data = response.updateFuelLog
        },
        onError: (error) => {
            console.error('Error updating fuel log', error)
        },
    })

    const [createFuelLog] = useMutation(CREATE_FUELLOG, {
        onCompleted: (response) => {
            const data = response.createFuelLog
        },
        onError: (error) => {
            console.error('Error creating fuel log', error)
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

    const updateFuelLogs = (currentID: number = 0) => {
        fuelTankList?.map((fuelTank: any) => {
            const variables = {
                input: {
                    id: fuelTank.id,
                    currentLevel: fuelTank.currentLevel,
                },
            }
            updateFuelTank({
                variables: variables,
            })
            currentEvent &&
            currentEvent?.fuelLogs?.nodes.find(
                (log: any) => log.fuelTankID === fuelTank.id,
            ).id > 0
                ? updateFuelLog({
                      variables: {
                          input: {
                              id: currentEvent?.fuelLogs?.nodes.find(
                                  (log: any) => log.fuelTankID === fuelTank.id,
                              ).id,
                              fuelTankID: fuelTank.id,
                              fuelAfter: fuelTank.currentLevel,
                              date: dayjs().format('YYYY-MM-DD'),
                              eventType_PassengerDropFacilityID: currentID,
                          },
                      },
                  })
                : createFuelLog({
                      variables: {
                          input: {
                              fuelTankID: fuelTank.id,
                              fuelAfter: fuelTank.currentLevel,
                              date: dayjs().format('YYYY-MM-DD'),
                              eventType_PassengerDropFacilityID: currentID,
                          },
                      },
                  })
        })
    }

    return (
        <div className="w-full">
            {/*<div className="pb-4 pt-3 px-4">*/}
            <>
                <div className="mt-6 text-sm font-semibold uppercase">
                    {type === 'PassengerArrival' && 'Details'}
                    {type === 'PassengerDeparture' && 'Details'}
                    {type === 'WaterTaxiService' &&
                        'Water taxi service details'}
                    {type === 'ScheduledPassengerService' &&
                        'Scheduled passenger service details'}
                    {/*<p className="text-xs mt-4 max-w-[25rem] leading-loose">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Quod eveniet quaerat voluptates voluptatem quam odio
                        magnam, culpa accusantium at dolore, corrupti rem
                        reiciendis repudiandae cumque veritatis? Blanditiis
                        quibusdam nostrum suscipit?
                    </p>*/}
                </div>
                <div
                    className={`${locked ? 'pointer-events-none' : ''} flex flex-col`}>
                    <div className="my-4">
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={passengerDropFacility?.title}
                            className={classes.input}
                            placeholder="Title"
                            onChange={(e) =>
                                setPassengerDropFacility({
                                    ...passengerDropFacility,
                                    title: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="my-4">
                        <TimeField
                            time={time}
                            handleTimeChange={handleTimeChange}
                            timeID="time"
                            fieldName="Time"
                        />
                    </div>
                    <div className="my-4">
                        <LocationField
                            offline={offline}
                            // geoLocations={geoLocations}
                            currentTrip={currentTrip}
                            updateTripReport={updateTripReport}
                            tripReport={tripReport}
                            setCurrentLocation={setCurrentLocation}
                            handleLocationChange={handleLocationChange}
                            currentLocation={currentLocation}
                            currentEvent={
                                tripEvent.eventType_PassengerDropFacility
                            }
                        />
                    </div>
                    {displayField(type + '_FuelLevel') && (
                        <>
                            {fuelTankList &&
                                fuelTankList.map((tank: any) => (
                                    <div
                                        className="my-2 flex items-end"
                                        key={tank.id}>
                                        <SealogsFuelIcon className="w-6 h-6 mr-3 mb-0.5 text-gray-900" />
                                        <span className="text-sm w-52 mb-2">
                                            {tank.title}
                                        </span>
                                        <input
                                            type="number"
                                            className={classes.input}
                                            placeholder="Fuel end"
                                            value={tank.currentLevel}
                                            min={0}
                                            max={
                                                passengerDropFacility?.fuelLog
                                                    ? passengerDropFacility.fuelLog.find(
                                                          (log: any) =>
                                                              log.fuelTank
                                                                  .id ===
                                                              tank.id,
                                                      )?.fuelAfter
                                                    : tank.capacity
                                            }
                                            onChange={(e: any) =>
                                                handleUpdateFuelTank(
                                                    tank,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                        </>
                        // <div className="my-4">
                        //     <input
                        //         id="fuel-level"
                        //         name="fuel-level"
                        //         type="text"
                        //         value={passengerDropFacility?.fuelLevel}
                        //         className={classes.input}
                        //         placeholder="Fuel level"
                        //         onChange={(e) =>
                        //             setPassengerDropFacility({
                        //                 ...passengerDropFacility,
                        //                 fuelLevel: e.target.value,
                        //             })
                        //         }
                        //     />
                        // </div>
                    )}
                    {displayField(type + '_Pax') && (
                        <div className="my-4 flex gap-4">
                            <input
                                id="paxOn"
                                name="paxOn"
                                type="number"
                                value={passengerDropFacility?.paxOn}
                                className={classes.input}
                                placeholder="Passengers getting on"
                                min="0"
                                onChange={(e) =>
                                    setPassengerDropFacility({
                                        ...passengerDropFacility,
                                        paxOn: e.target.value,
                                    })
                                }
                            />
                            <input
                                id="paxOff"
                                name="paxOff"
                                type="number"
                                value={passengerDropFacility?.paxOff}
                                className={classes.input}
                                placeholder="Passengers getting off"
                                min="0"
                                onChange={(e) =>
                                    setPassengerDropFacility({
                                        ...passengerDropFacility,
                                        paxOff: e.target.value,
                                    })
                                }
                            />
                        </div>
                    )}
                </div>
            </>
            {/*</div>*/}
            <FooterWrapper noBorder>
                <SeaLogsButton
                    text="Cancel"
                    type="text"
                    // action={() => {
                    //     setOpenTripModal(false), setCurrentTrip(false)
                    // }}
                />
                <SeaLogsButton
                    text={selectedEvent ? 'Update' : 'Save'}
                    type="primary"
                    color="sky"
                    icon="check"
                    action={locked ? () => {} : handleSave}
                />
            </FooterWrapper>
            <AlertDialog
                openDialog={openNewLocationDialog}
                setOpenDialog={setOpenNewLocationDialog}
                actionText="Add New Location"
                handleCreate={handleCreateNewLocation}>
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2 text-gray-700 dark:text-white">
                    Add New Location
                </Heading>
                <div className="my-4 flex items-center">
                    <input
                        id="new-location-title"
                        type="text"
                        className={classes.input}
                        aria-describedby="title-error"
                        required
                        placeholder="Location Title"
                    />
                </div>
                <div className="mb-4 flex items-center">
                    <Select
                        id="parent-location"
                        options={locations}
                        onChange={handleParentLocationChange}
                        menuPlacement="top"
                        placeholder="Parent Location (Optional)"
                        className="w-full bg-gray-100 rounded dark:bg-gray-800 text-sm"
                        classNames={{
                            control: () =>
                                'flex py-1 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                            singleValue: () => 'dark:!text-white',
                            dropdownIndicator: () => '!p-0 !hidden',
                            menu: () => 'dark:bg-gray-800',
                            indicatorSeparator: () => '!hidden',
                            multiValue: () =>
                                '!bg-sky-100 inline-flex rounded p-1 m-0 !mr-1.5 border border-sky-300 !rounded-md !text-sky-900 font-normal mr-2',
                            clearIndicator: () => '!py-0',
                            valueContainer: () => '!py-0',
                        }}
                    />
                </div>
                <div className="mb-4 flex items-center">
                    <input
                        id="new-location-latitude"
                        type="text"
                        defaultValue={location.latitude}
                        className={classes.input}
                        aria-describedby="latitude-error"
                        required
                        placeholder="Latitude"
                    />
                </div>
                <div className="flex items-center">
                    <input
                        id="new-location-longitude"
                        type="text"
                        defaultValue={location.longitude}
                        className={classes.input}
                        aria-describedby="longitude-error"
                        required
                        placeholder="Longitude"
                    />
                </div>
            </AlertDialog>
            <Toaster position="top-right" />
        </div>
    )
}
