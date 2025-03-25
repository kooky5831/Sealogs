'use client'

import { SeaLogsButton } from '@/app/components/Components'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import {
    CreateEventType_RestrictedVisibility,
    UpdateEventType_RestrictedVisibility,
    CreateTripEvent,
    UpdateTripEvent,
} from '@/app/lib/graphQL/mutation'
import { GetTripEvent } from '@/app/lib/graphQL/query'
import { useLazyQuery, useMutation } from '@apollo/client'
import toast, { Toaster } from 'react-hot-toast'
import { classes } from '@/app/components/GlobalClasses'
import LocationField from '../components/location'
import TimeField from '../components/time'
import TripEventModel from '@/app/offline/models/tripEvent'
import EventType_RestrictedVisibilityModel from '@/app/offline/models/eventType_RestrictedVisibility'
import { generateUniqueId } from '@/app/offline/helpers/functions'

export default function restrictedVisibility({
    currentTrip = false,
    updateTripReport,
    selectedEvent = false,
    tripReport,
    closeModal,
    logBookConfig,
    locked,
    offline = false,
}: {
    currentTrip: any
    updateTripReport: any
    selectedEvent: any
    tripReport: any
    closeModal: any
    logBookConfig: any
    locked: any
    offline?: boolean
}) {
    const [crossingTime, setCrossingTime] = useState<any>()
    const [crossedTime, setCrossedTime] = useState<any>()
    const [restrictedVisibility, setRestrictedVisibility] = useState<any>(false)
    const [tripEvent, setTripEvent] = useState<any>(false)
    const [currentEvent, setCurrentEvent] = useState<any>(selectedEvent)
    const [currentStartLocation, setCurrentStartLocation] = useState<any>({
        latitude: '',
        longitude: '',
    })
    const [currentEndLocation, setCurrentEndLocation] = useState<any>({
        latitude: '',
        longitude: '',
    })
    const tripEventModel = new TripEventModel()
    const restrictedVisibilityModel = new EventType_RestrictedVisibilityModel()
    const handleCrossingTimeChange = (date: any) => {
        setCrossingTime(dayjs(date).format('HH:mm'))
    }

    const handleCrossedTimeChange = (date: any) => {
        setCrossedTime(dayjs(date).format('HH:mm'))
    }

    useEffect(() => {
        setRestrictedVisibility(false)
        if (selectedEvent) {
            setCurrentEvent(selectedEvent)
            getCurrentEvent(selectedEvent?.id)
        }
    }, [selectedEvent])

    useEffect(() => {
        setRestrictedVisibility(false)
        if (currentEvent) {
            getCurrentEvent(currentEvent?.id)
        }
    }, [currentEvent])

    const getCurrentEvent = async (id: any) => {
        if (offline) {
            const event = await tripEventModel.getById(id)
            if (event) {
                setTripEvent(event)
                setRestrictedVisibility({
                    startLocationID:
                        event.eventType_RestrictedVisibility?.startLocationID,
                    crossingTime:
                        event.eventType_RestrictedVisibility?.crossingTime,
                    estSafeSpeed:
                        event.eventType_RestrictedVisibility?.estSafeSpeed,
                    stopAssessPlan:
                        event.eventType_RestrictedVisibility?.stopAssessPlan,
                    crewBriefing:
                        event.eventType_RestrictedVisibility?.crewBriefing,
                    navLights: event.eventType_RestrictedVisibility?.navLights,
                    soundSignal:
                        event.eventType_RestrictedVisibility?.soundSignal,
                    lookout: event.eventType_RestrictedVisibility?.lookout,
                    soundSignals:
                        event.eventType_RestrictedVisibility?.soundSignals,
                    radarWatch:
                        event.eventType_RestrictedVisibility?.radarWatch,
                    radioWatch:
                        event.eventType_RestrictedVisibility?.radioWatch,
                    endLocationID:
                        event.eventType_RestrictedVisibility?.endLocationID,
                    crossedTime:
                        event.eventType_RestrictedVisibility?.crossedTime,
                    approxSafeSpeed:
                        event.eventType_RestrictedVisibility?.approxSafeSpeed,
                    report: event.eventType_RestrictedVisibility?.report,
                    startLat: event.eventType_RestrictedVisibility?.startLat,
                    startLong: event.eventType_RestrictedVisibility?.startLong,
                    endLat: event.eventType_RestrictedVisibility?.endLat,
                    endLong: event.eventType_RestrictedVisibility?.endLong,
                })
                if (
                    event.eventType_RestrictedVisibility?.startLat &&
                    event.eventType_RestrictedVisibility?.startLong
                ) {
                    setCurrentStartLocation({
                        latitude:
                            event.eventType_RestrictedVisibility?.startLat,
                        longitude:
                            event.eventType_RestrictedVisibility?.startLong,
                    })
                }
                if (
                    event.eventType_RestrictedVisibility?.endLat &&
                    event.eventType_RestrictedVisibility?.endLong
                ) {
                    setCurrentEndLocation({
                        latitude: event.eventType_RestrictedVisibility?.endLat,
                        longitude:
                            event.eventType_RestrictedVisibility?.endLong,
                    })
                }
                setCrossedTime(
                    event.eventType_RestrictedVisibility?.crossedTime,
                )
                setCrossingTime(
                    event.eventType_RestrictedVisibility?.crossingTime,
                )
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
                setRestrictedVisibility({
                    startLocationID:
                        event.eventType_RestrictedVisibility?.startLocationID,
                    crossingTime:
                        event.eventType_RestrictedVisibility?.crossingTime,
                    estSafeSpeed:
                        event.eventType_RestrictedVisibility?.estSafeSpeed,
                    stopAssessPlan:
                        event.eventType_RestrictedVisibility?.stopAssessPlan,
                    crewBriefing:
                        event.eventType_RestrictedVisibility?.crewBriefing,
                    navLights: event.eventType_RestrictedVisibility?.navLights,
                    soundSignal:
                        event.eventType_RestrictedVisibility?.soundSignal,
                    lookout: event.eventType_RestrictedVisibility?.lookout,
                    soundSignals:
                        event.eventType_RestrictedVisibility?.soundSignals,
                    radarWatch:
                        event.eventType_RestrictedVisibility?.radarWatch,
                    radioWatch:
                        event.eventType_RestrictedVisibility?.radioWatch,
                    endLocationID:
                        event.eventType_RestrictedVisibility?.endLocationID,
                    crossedTime:
                        event.eventType_RestrictedVisibility?.crossedTime,
                    approxSafeSpeed:
                        event.eventType_RestrictedVisibility?.approxSafeSpeed,
                    report: event.eventType_RestrictedVisibility?.report,
                    startLat: event.eventType_RestrictedVisibility?.startLat,
                    startLong: event.eventType_RestrictedVisibility?.startLong,
                    endLat: event.eventType_RestrictedVisibility?.endLat,
                    endLong: event.eventType_RestrictedVisibility?.endLong,
                })
                if (
                    event.eventType_RestrictedVisibility?.startLat &&
                    event.eventType_RestrictedVisibility?.startLong
                ) {
                    setCurrentStartLocation({
                        latitude:
                            event.eventType_RestrictedVisibility?.startLat,
                        longitude:
                            event.eventType_RestrictedVisibility?.startLong,
                    })
                }
                if (
                    event.eventType_RestrictedVisibility?.endLat &&
                    event.eventType_RestrictedVisibility?.endLong
                ) {
                    setCurrentEndLocation({
                        latitude: event.eventType_RestrictedVisibility?.endLat,
                        longitude:
                            event.eventType_RestrictedVisibility?.endLong,
                    })
                }
                setCrossedTime(
                    event.eventType_RestrictedVisibility?.crossedTime,
                )
                setCrossingTime(
                    event.eventType_RestrictedVisibility?.crossingTime,
                )
            }
        },
        onError: (error) => {
            console.error('Error getting current event', error)
        },
    })

    const handleSave = async () => {
        const variables = {
            input: {
                startLocationID: restrictedVisibility?.startLocationID,
                crossingTime: crossingTime,
                estSafeSpeed: restrictedVisibility?.estSafeSpeed,
                stopAssessPlan: restrictedVisibility?.stopAssessPlan,
                crewBriefing: restrictedVisibility?.crewBriefing,
                navLights: restrictedVisibility?.navLights,
                soundSignal: restrictedVisibility?.soundSignal,
                lookout: restrictedVisibility?.lookout,
                soundSignals: restrictedVisibility?.soundSignals,
                radarWatch: restrictedVisibility?.radarWatch,
                radioWatch: restrictedVisibility?.radioWatch,
                endLocationID: restrictedVisibility?.endLocationID,
                crossedTime: crossedTime,
                approxSafeSpeed: restrictedVisibility?.approxSafeSpeed,
                report: restrictedVisibility?.report,
                startLat: currentStartLocation.latitude.toString(),
                startLong: currentStartLocation.longitude.toString(),
                endLat: currentEndLocation.latitude.toString(),
                endLong: currentEndLocation.longitude.toString(),
            },
        }

        if (currentEvent) {
            if (offline) {
                await tripEventModel.save({
                    id: +currentEvent.id,
                    eventCategory: 'RestrictedVisibility',
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
                            eventCategory: 'RestrictedVisibility',
                            logBookEntrySectionID: currentTrip.id,
                        },
                    },
                })
            }

            if (offline) {
                await restrictedVisibilityModel.save({
                    id: +selectedEvent?.eventType_RestrictedVisibilityID,
                    ...variables.input,
                })
            } else {
                updateEventType_RestrictedVisibility({
                    variables: {
                        input: {
                            id: +selectedEvent?.eventType_RestrictedVisibilityID,
                            ...variables.input,
                        },
                    },
                })
            }
        } else {
            if (offline) {
                const tripEventData = await tripEventModel.save({
                    id: generateUniqueId(),
                    eventCategory: 'RestrictedVisibility',
                    logBookEntrySectionID: currentTrip.id,
                })
                toast.success('Trip event created')
                setCurrentEvent(tripEventData)
                const restrictedVisibilityData =
                    await restrictedVisibilityModel.save({
                        id: generateUniqueId(),
                        startLocationID: restrictedVisibility?.startLocationID,
                        crossingTime: crossingTime,
                        estSafeSpeed: restrictedVisibility?.estSafeSpeed,
                        stopAssessPlan: restrictedVisibility?.stopAssessPlan,
                        crewBriefing: restrictedVisibility?.crewBriefing,
                        navLights: restrictedVisibility?.navLights,
                        soundSignal: restrictedVisibility?.soundSignal,
                        lookout: restrictedVisibility?.lookout,
                        soundSignals: restrictedVisibility?.soundSignals,
                        radarWatch: restrictedVisibility?.radarWatch,
                        radioWatch: restrictedVisibility?.radioWatch,
                        endLocationID: restrictedVisibility?.endLocationID,
                        crossedTime: crossedTime,
                        approxSafeSpeed: restrictedVisibility?.approxSafeSpeed,
                        report: restrictedVisibility?.report,
                        startLat: currentStartLocation.latitude.toString(),
                        startLong: currentStartLocation.longitude.toString(),
                        endLat: currentEndLocation.latitude.toString(),
                        endLong: currentEndLocation.longitude.toString(),
                    })
                await tripEventModel.save({
                    id: currentEvent?.id,
                    eventType_RestrictedVisibilityID:
                        restrictedVisibilityData.id,
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
                await tripEventModel.save({
                    id: tripEventData.id,
                    eventCategory: 'RestrictedVisibility',
                    eventType_RestrictedVisibilityID: tripEventData.id,
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
                            eventCategory: 'RestrictedVisibility',
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
            createEventType_RestrictedVisibility({
                variables: {
                    input: {
                        startLocationID: restrictedVisibility?.startLocationID,
                        crossingTime: crossingTime,
                        estSafeSpeed: restrictedVisibility?.estSafeSpeed,
                        stopAssessPlan: restrictedVisibility?.stopAssessPlan,
                        crewBriefing: restrictedVisibility?.crewBriefing,
                        navLights: restrictedVisibility?.navLights,
                        soundSignal: restrictedVisibility?.soundSignal,
                        lookout: restrictedVisibility?.lookout,
                        soundSignals: restrictedVisibility?.soundSignals,
                        radarWatch: restrictedVisibility?.radarWatch,
                        radioWatch: restrictedVisibility?.radioWatch,
                        endLocationID: restrictedVisibility?.endLocationID,
                        crossedTime: crossedTime,
                        approxSafeSpeed: restrictedVisibility?.approxSafeSpeed,
                        report: restrictedVisibility?.report,
                        startLat: currentStartLocation.latitude.toString(),
                        startLong: currentStartLocation.longitude.toString(),
                        endLat: currentEndLocation.latitude.toString(),
                        endLong: currentEndLocation.longitude.toString(),
                    },
                },
            })
            updateTripEvent({
                variables: {
                    input: {
                        id: data.id,
                        eventCategory: 'RestrictedVisibility',
                        eventType_RestrictedVisibilityID: data.id,
                    },
                },
            })
        },
        onError: (error) => {
            console.error('Error creating trip event', error)
        },
    })

    const [createEventType_RestrictedVisibility] = useMutation(
        CreateEventType_RestrictedVisibility,
        {
            onCompleted: (response) => {
                const data = response.createEventType_RestrictedVisibility
                updateTripEvent({
                    variables: {
                        input: {
                            id: currentEvent?.id,
                            eventType_RestrictedVisibilityID: data.id,
                        },
                    },
                })
                closeModal()
            },
            onError: (error) => {
                console.error('Error creating Person rescue', error)
            },
        },
    )

    const [updateEventType_RestrictedVisibility] = useMutation(
        UpdateEventType_RestrictedVisibility,
        {
            onCompleted: (response) => {
                const data = response.updateEventType_RestrictedVisibility
            },
            onError: (error) => {
                console.error('Error updating restricted visibility', error)
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

    const handleStartLocationChange = (value: any) => {
        setRestrictedVisibility({
            ...restrictedVisibility,
            startLocationID: value?.value,
        })
    }

    const handleEndLocationChange = (value: any) => {
        setRestrictedVisibility({
            ...restrictedVisibility,
            endLocationID: value?.value,
        })
    }
    const startLocationData = {
        geoLocationID:
            restrictedVisibility?.startLocationID > 0
                ? restrictedVisibility.startLocationID
                : tripEvent.eventType_RestrictedVisibility?.startLocationID,
        lat: tripEvent.eventType_RestrictedVisibility?.startLat,
        long: tripEvent.eventType_RestrictedVisibility?.startLong,
    }

    const endLocationData = {
        geoLocationID:
            restrictedVisibility?.endLocationID > 0
                ? restrictedVisibility.endLocationID
                : tripEvent.eventType_RestrictedVisibility?.endLocationID,
        lat: tripEvent.eventType_RestrictedVisibility?.endLat,
        long: tripEvent.eventType_RestrictedVisibility?.endLong,
    }
    return (
        <div className="w-full px-3">
            {displayField('RestrictedVisibility_StartLocation') ||
            displayField('RestrictedVisibility_CrossingTime') ||
            displayField('RestrictedVisibility_EstSafeSpeed') ? (
                <>
                    <p className={classes.helpText}>
                        For describing the conditions, actions taken and
                        duration of when there is limited visability
                    </p>
                    <div className="flex flex-col gap-4 my-4">
                        <div
                            className={`${locked ? 'pointer-events-none' : ''}`}>
                            <label
                                className={`${classes.label} ${locked ? 'pointer-events-none' : ''} !w-full`}>
                                Location where limited visibility starts
                            </label>
                            {displayField(
                                'RestrictedVisibility_StartLocation',
                            ) && (
                                <LocationField
                                    offline={offline}
                                    currentTrip={currentTrip}
                                    setCurrentLocation={setCurrentStartLocation}
                                    handleLocationChange={
                                        handleStartLocationChange
                                    }
                                    currentLocation={currentStartLocation}
                                    currentEvent={startLocationData}
                                />
                            )}
                        </div>
                        <div
                            className={`${locked ? 'pointer-events-none' : ''}`}>
                            <label
                                className={`${classes.label} ${locked ? 'pointer-events-none' : ''} !w-full`}>
                                Time where limited visibility starts
                            </label>
                            {displayField(
                                'RestrictedVisibility_CrossingTime',
                            ) && (
                                <>
                                    <TimeField
                                        time={crossingTime}
                                        handleTimeChange={
                                            handleCrossingTimeChange
                                        }
                                        timeID="crossingTime"
                                        fieldName="Time vis. restriction started"
                                    />
                                </>
                            )}
                        </div>
                        <div
                            className={`${locked ? 'pointer-events-none' : ''}`}>
                            <label
                                className={`${classes.label} ${locked ? 'pointer-events-none' : ''} !w-full`}>
                                Estimated safe speed for conditions
                            </label>
                            {displayField(
                                'RestrictedVisibility_EstSafeSpeed',
                            ) && (
                                <input
                                    id="estSafeSpeed"
                                    type="number"
                                    className={classes.input}
                                    placeholder="Enter safe speed for conditions"
                                    min={1}
                                    value={restrictedVisibility?.estSafeSpeed}
                                    onChange={(e: any) => {
                                        setRestrictedVisibility({
                                            ...restrictedVisibility,
                                            estSafeSpeed: e.target.value,
                                        })
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </>
            ) : null}
            {displayField('RestrictedVisibility_StopAssessPlan') ||
            displayField('RestrictedVisibility_CrewBriefing') ||
            displayField('RestrictedVisibility_NavLights') ||
            displayField('RestrictedVisibility_SoundSignal') ||
            displayField('RestrictedVisibility_Lookout') ||
            displayField('RestrictedVisibility_SoundSignals') ||
            displayField('RestrictedVisibility_RadarWatch') ||
            displayField('RestrictedVisibility_RadioWatch') ? (
                <>
                    <hr className="my-2" />
                    <div className="mt-6 text-sm font-semibold uppercase">
                        Safe operating procedures checklist
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} grid grid-cols-3 gap-6 pb-4 pt-3 px-4`}>
                        <div className="col-span-3 md:col-span-2">
                            {displayField(
                                'RestrictedVisibility_StopAssessPlan',
                            ) && (
                                <div className="my-4 flex flex-row items-center gap-4">
                                    <label
                                        className="relative flex items-center rounded-full cursor-pointer"
                                        htmlFor="stopAssessPlan-onChangeComplete"
                                        data-ripple="true"
                                        data-ripple-color="dark"
                                        data-ripple-dark="true">
                                        <input
                                            type="checkbox"
                                            id="stopAssessPlan-onChangeComplete"
                                            className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slgreen-1000 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-sky-500 before:opacity-0 before:transition-opacity checked:border-slgreen-1000 checked:bg-slneon-400 before:bg-slneon-400 hover:before:opacity-10"
                                            checked={
                                                restrictedVisibility?.stopAssessPlan
                                            }
                                            onChange={(e: any) => {
                                                setRestrictedVisibility({
                                                    ...restrictedVisibility,
                                                    stopAssessPlan:
                                                        e.target.checked,
                                                })
                                            }}
                                        />
                                        <div>Stopped, assessed, planned</div>
                                    </label>
                                </div>
                            )}
                            {displayField(
                                'RestrictedVisibility_CrewBriefing',
                            ) && (
                                <div className="my-4 flex flex-row items-center gap-4">
                                    <label
                                        className="relative flex items-center rounded-full cursor-pointer"
                                        htmlFor="crewBriefing-onChangeComplete"
                                        data-ripple="true"
                                        data-ripple-color="dark"
                                        data-ripple-dark="true">
                                        <input
                                            type="checkbox"
                                            id="crewBriefing-onChangeComplete"
                                            className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slgreen-1000 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-slgreen-1000 checked:bg-slneon-400 before:bg-slneon-400 hover:before:opacity-10"
                                            checked={
                                                restrictedVisibility?.crewBriefing
                                            }
                                            onChange={(e: any) => {
                                                setRestrictedVisibility({
                                                    ...restrictedVisibility,
                                                    crewBriefing:
                                                        e.target.checked,
                                                })
                                            }}
                                        />
                                    </label>
                                    <span>Briefed crew</span>
                                </div>
                            )}
                            {displayField('RestrictedVisibility_NavLights') && (
                                <div className="my-4 flex flex-row items-center gap-4">
                                    <label
                                        className="relative flex items-center rounded-full cursor-pointer"
                                        htmlFor="navLights-onChangeComplete"
                                        data-ripple="true"
                                        data-ripple-color="dark"
                                        data-ripple-dark="true">
                                        <input
                                            type="checkbox"
                                            id="navLights-onChangeComplete"
                                            className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slgreen-1000 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-slgreen-1000 checked:bg-slneon-400 before:bg-slneon-400 hover:before:opacity-10"
                                            checked={
                                                restrictedVisibility?.navLights
                                            }
                                            onChange={(e: any) => {
                                                setRestrictedVisibility({
                                                    ...restrictedVisibility,
                                                    navLights: e.target.checked,
                                                })
                                            }}
                                        />
                                    </label>
                                    <span>Navigation lights on</span>
                                </div>
                            )}
                            <hr className="my-4" />
                            {displayField(
                                'RestrictedVisibility_SoundSignal',
                            ) && (
                                <div className="pl-4">
                                    <label className={classes.label}>
                                        Sounds signals used (pick one)
                                    </label>
                                    <div className="flex flex-col">
                                        <div className="my-2 flex flex-row items-center gap-4">
                                            <label
                                                className="relative flex items-center rounded-full cursor-pointer"
                                                htmlFor="soundSignalNone-onChangeComplete"
                                                data-ripple="true"
                                                data-ripple-color="dark"
                                                data-ripple-dark="true">
                                                <input
                                                    type="checkbox"
                                                    id="soundSignalNone-onChangeComplete"
                                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slgreen-1000 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-slgreen-1000 checked:bg-slneon-400 before:bg-slneon-400 hover:before:opacity-10"
                                                    checked={
                                                        restrictedVisibility?.soundSignal ==
                                                        'None'
                                                    }
                                                    onChange={(e: any) => {
                                                        setRestrictedVisibility(
                                                            e.target
                                                                .checked && {
                                                                ...restrictedVisibility,
                                                                soundSignal:
                                                                    'None',
                                                            },
                                                        )
                                                    }}
                                                />
                                            </label>
                                            <span>None needed</span>
                                        </div>
                                        <div className="my-2 flex flex-row items-center gap-4">
                                            <label
                                                className="relative flex items-center rounded-full cursor-pointer"
                                                htmlFor="soundSignalMakingWay-onChangeComplete"
                                                data-ripple="true"
                                                data-ripple-color="dark"
                                                data-ripple-dark="true">
                                                <input
                                                    type="checkbox"
                                                    id="soundSignalMakingWay-onChangeComplete"
                                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slgreen-1000 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-slgreen-1000 checked:bg-slneon-400 before:bg-slneon-400 hover:before:opacity-10"
                                                    checked={
                                                        restrictedVisibility?.soundSignal ==
                                                        'MakingWay'
                                                    }
                                                    onChange={(e: any) => {
                                                        setRestrictedVisibility(
                                                            e.target
                                                                .checked && {
                                                                ...restrictedVisibility,
                                                                soundSignal:
                                                                    'MakingWay',
                                                            },
                                                        )
                                                    }}
                                                />
                                            </label>
                                            <span>
                                                Making way (1 long / 2 mins)
                                            </span>
                                        </div>
                                        <div className="my-2 flex flex-row items-center gap-4">
                                            <label
                                                className="relative flex items-center rounded-full cursor-pointer"
                                                htmlFor="soundSignalNotMakingWay-onChangeComplete"
                                                data-ripple="true"
                                                data-ripple-color="dark"
                                                data-ripple-dark="true">
                                                <input
                                                    type="checkbox"
                                                    id="soundSignalNotMakingWay-onChangeComplete"
                                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slgreen-1000 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-slgreen-1000 checked:bg-slneon-400 before:bg-slneon-400 hover:before:opacity-10"
                                                    checked={
                                                        restrictedVisibility?.soundSignal ==
                                                        'NotMakingWay'
                                                    }
                                                    onChange={(e: any) => {
                                                        setRestrictedVisibility(
                                                            e.target
                                                                .checked && {
                                                                ...restrictedVisibility,
                                                                soundSignal:
                                                                    'NotMakingWay',
                                                            },
                                                        )
                                                    }}
                                                />
                                            </label>
                                            <span>
                                                Not making way (2 long / 2 mins)
                                            </span>
                                        </div>
                                        <div className="my-2 flex flex-row items-center gap-4">
                                            <label
                                                className="relative flex items-center rounded-full cursor-pointer"
                                                htmlFor="soundSignalTowing-onChangeComplete"
                                                data-ripple="true"
                                                data-ripple-color="dark"
                                                data-ripple-dark="true">
                                                <input
                                                    type="checkbox"
                                                    id="soundSignalTowing-onChangeComplete"
                                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slgreen-1000 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-slgreen-1000 checked:bg-slneon-400 before:bg-slneon-400 hover:before:opacity-10"
                                                    checked={
                                                        restrictedVisibility?.soundSignal ==
                                                        'Towing'
                                                    }
                                                    onChange={(e: any) => {
                                                        setRestrictedVisibility(
                                                            e.target
                                                                .checked && {
                                                                ...restrictedVisibility,
                                                                soundSignal:
                                                                    'Towing',
                                                            },
                                                        )
                                                    }}
                                                />
                                            </label>
                                            <span>
                                                Towing (1 long + 2 short / 2
                                                mins)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <hr className="my-4" />
                            {displayField('RestrictedVisibility_Lookout') && (
                                <div className="my-4 flex flex-row items-center gap-4">
                                    <label
                                        className="relative flex items-center pr-3 rounded-full cursor-pointer"
                                        htmlFor="lookout-onChangeComplete"
                                        data-ripple="true"
                                        data-ripple-color="dark"
                                        data-ripple-dark="true">
                                        <input
                                            type="checkbox"
                                            id="lookout-onChangeComplete"
                                            className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slgreen-1000 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-slgreen-1000 checked:bg-slneon-400 before:bg-slneon-400 hover:before:opacity-10"
                                            checked={
                                                restrictedVisibility?.lookout
                                            }
                                            onChange={(e: any) => {
                                                setRestrictedVisibility({
                                                    ...restrictedVisibility,
                                                    lookout: e.target.checked,
                                                })
                                            }}
                                        />
                                    </label>
                                    <span>Set proper lookout</span>
                                </div>
                            )}
                            {displayField(
                                'RestrictedVisibility_SoundSignals',
                            ) && (
                                <div className="my-4 flex flex-row items-center gap-4">
                                    <label
                                        className="relative flex items-center pr-3 rounded-full cursor-pointer"
                                        htmlFor="soundSignals-onChangeComplete"
                                        data-ripple="true"
                                        data-ripple-color="dark"
                                        data-ripple-dark="true">
                                        <input
                                            type="checkbox"
                                            id="soundSignals-onChangeComplete"
                                            className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slgreen-1000 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-slgreen-1000 checked:bg-slneon-400 before:bg-slneon-400 hover:before:opacity-10"
                                            checked={
                                                restrictedVisibility?.soundSignals
                                            }
                                            onChange={(e: any) => {
                                                setRestrictedVisibility({
                                                    ...restrictedVisibility,
                                                    soundSignals:
                                                        e.target.checked,
                                                })
                                            }}
                                        />
                                    </label>
                                    <span>
                                        Listening for other sound signals
                                    </span>
                                </div>
                            )}
                            {displayField(
                                'RestrictedVisibility_RadarWatch',
                            ) && (
                                <div className="my-4 flex flex-row items-center gap-4">
                                    <label
                                        className="relative flex items-center pr-3 rounded-full cursor-pointer"
                                        htmlFor="radarWatch-onChangeComplete"
                                        data-ripple="true"
                                        data-ripple-color="dark"
                                        data-ripple-dark="true">
                                        <input
                                            type="checkbox"
                                            id="radarWatch-onChangeComplete"
                                            className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slgreen-1000 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-slgreen-1000 checked:bg-slneon-400 before:bg-slneon-400 hover:before:opacity-10"
                                            checked={
                                                restrictedVisibility?.radarWatch
                                            }
                                            onChange={(e: any) => {
                                                setRestrictedVisibility({
                                                    ...restrictedVisibility,
                                                    radarWatch:
                                                        e.target.checked,
                                                })
                                            }}
                                        />
                                    </label>
                                    <span>Radar watch on</span>
                                </div>
                            )}
                            {displayField(
                                'RestrictedVisibility_RadioWatch',
                            ) && (
                                <div className="my-4 flex flex-row items-center gap-4">
                                    <label
                                        className="relative flex items-center pr-3 rounded-full cursor-pointer"
                                        htmlFor="radioWatch-onChangeComplete"
                                        data-ripple="true"
                                        data-ripple-color="dark"
                                        data-ripple-dark="true">
                                        <input
                                            type="checkbox"
                                            id="radioWatch-onChangeComplete"
                                            className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slgreen-1000 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-slgreen-1000 checked:bg-slneon-400 before:bg-slneon-400 hover:before:opacity-10"
                                            checked={
                                                restrictedVisibility?.radioWatch
                                            }
                                            onChange={(e: any) => {
                                                setRestrictedVisibility({
                                                    ...restrictedVisibility,
                                                    radioWatch:
                                                        e.target.checked,
                                                })
                                            }}
                                        />
                                    </label>
                                    <span>Radio watch on</span>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : null}
            <hr className="my-4" />
            {displayField('RestrictedVisibility_EndLocation') ||
            displayField('RestrictedVisibility_CrossedTime') ||
            displayField('RestrictedVisibility_ApproxSafeSpeed') ||
            displayField('RestrictedVisibility_Report') ? (
                <div className="flex flex-col">
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <label
                            className={`${classes.label} ${locked ? 'pointer-events-none' : ''} !w-full`}>
                            Location where limited visibility ends
                        </label>
                        {displayField('RestrictedVisibility_EndLocation') && (
                            <LocationField
                                offline={offline}
                                // geoLocations={geoLocations}
                                currentTrip={currentTrip}
                                updateTripReport={updateTripReport}
                                tripReport={tripReport}
                                setCurrentLocation={setCurrentEndLocation}
                                handleLocationChange={handleEndLocationChange}
                                currentLocation={currentEndLocation}
                                currentEvent={endLocationData}
                            />
                        )}
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <label
                            className={`${classes.label} ${locked ? 'pointer-events-none' : ''} !w-full`}>
                            Time when limiited visibility ends
                        </label>
                        {displayField('RestrictedVisibility_CrossedTime') && (
                            <TimeField
                                time={crossedTime}
                                handleTimeChange={handleCrossedTimeChange}
                                timeID="crossedTime"
                                fieldName="End time"
                            />
                        )}
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <label
                            className={`${classes.label} ${locked ? 'pointer-events-none' : ''} !w-full`}>
                            Approximate average speed during restricted
                            visibility period
                        </label>
                        {displayField(
                            'RestrictedVisibility_ApproxSafeSpeed',
                        ) && (
                            <input
                                id="approxSafeSpeed"
                                type="number"
                                className={classes.input}
                                placeholder="Enter approximate average speed"
                                min={1}
                                value={restrictedVisibility?.approxSafeSpeed}
                                onChange={(e: any) => {
                                    setRestrictedVisibility({
                                        ...restrictedVisibility,
                                        approxSafeSpeed: e.target.value,
                                    })
                                }}
                            />
                        )}
                    </div>
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4 w-full`}>
                        {displayField('RestrictedVisibility_Report') && (
                            <textarea
                                id="restricted-visibility-report"
                                className={classes.textarea}
                                rows={4}
                                placeholder="Add any comments or observations pertinant to the limited visibility event"
                                value={restrictedVisibility?.report}
                                onChange={(e: any) => {
                                    setRestrictedVisibility({
                                        ...restrictedVisibility,
                                        report: e.target.value,
                                    })
                                }}
                            />
                        )}
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-end px-4 pb-4 pt-4">
                        <SeaLogsButton
                            action={closeModal}
                            type="text"
                            text="Cancel"
                        />
                        <SeaLogsButton
                            type="primary"
                            icon="check"
                            text={selectedEvent ? 'Update' : 'Save'}
                            color="slblue"
                            action={locked ? () => {} : handleSave}
                        />
                    </div>
                </div>
            ) : null}
            <Toaster position="top-right" />
        </div>
    )
}
