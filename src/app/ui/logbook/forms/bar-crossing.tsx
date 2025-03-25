'use client'

import { FooterWrapper, SeaLogsButton } from '@/app/components/Components'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import {
    CreateEventType_BarCrossing,
    UpdateEventType_BarCrossing,
    CreateTripEvent,
    UpdateTripEvent,
} from '@/app/lib/graphQL/mutation'
import { GetTripEvent } from '@/app/lib/graphQL/query'
import Editor from '../../editor'
import { useLazyQuery, useMutation } from '@apollo/client'
import toast, { Toaster } from 'react-hot-toast'
import LocationField from '../components/location'
import TimeField from '../components/time'
import SlidingPanel from 'react-sliding-side-panel'
import { XMarkIcon } from '@heroicons/react/24/outline'
import BarCrossingRiskAnalysis from './bar-crossing-risk-analysis'
import { classes } from '@/app/components/GlobalClasses'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import TripEventModel from '@/app/offline/models/tripEvent'
import EventType_BarCrossingModel from '@/app/offline/models/eventType_BarCrossing'
import { generateUniqueId } from '@/app/offline/helpers/functions'

export default function BarCrossing({
    currentTrip = false,
    updateTripReport,
    selectedEvent = false,
    tripReport,
    closeModal,
    logBookConfig,
    members = false,
    locked,
    offline = false,
}: {
    currentTrip: any
    updateTripReport: any
    selectedEvent: any
    tripReport: any
    closeModal: any
    logBookConfig: any
    members: any
    locked: any
    offline?: boolean
}) {
    const [time, setTime] = useState<any>()
    const [endTime, setEndTime] = useState<any>()
    const [content, setContent] = useState<any>('')
    const [barCrossing, setBarCrossing] = useState<any>(false)
    const [currentEvent, setCurrentEvent] = useState<any>(selectedEvent)
    const [barCrossingChecklistID, setBarCrossingChecklistID] = useState<any>(0)
    const [tripEvent, setTripEvent] = useState<any>(false)
    const [openRiskAnalysis, setOpenRiskAnalysis] = useState(false)
    const [currentLocation, setCurrentLocation] = useState<any>({
        latitude: '',
        longitude: '',
    })

    const [permissions, setPermissions] = useState<any>(false)
    const [editBarCrossingRisk, setEditBarCrossingRisk] = useState<any>(false)
    const tripEventModel = new TripEventModel()
    const barCrossingModel = new EventType_BarCrossingModel()
    const init_permissions = () => {
        if (permissions) {
            if (hasPermission('EDIT_LOGBOOKENTRY_RISK_ANALYSIS', permissions)) {
                setEditBarCrossingRisk(true)
            } else {
                setEditBarCrossingRisk(false)
            }
        }
    }

    useEffect(() => {
        setPermissions(getPermissions)
        init_permissions()
    }, [])

    useEffect(() => {
        init_permissions()
    }, [permissions])

    const handleTimeChange = (date: any) => {
        setTime(dayjs(date).format('HH:mm'))
    }

    const handleEndTimeChange = (date: any) => {
        setEndTime(dayjs(date).format('HH:mm'))
    }

    useEffect(() => {
        setBarCrossing(false)
        if (selectedEvent) {
            setCurrentEvent(selectedEvent)
            getCurrentEvent(selectedEvent?.id)
        }
    }, [selectedEvent])

    useEffect(() => {
        setBarCrossing(false)
        if (currentEvent) {
            getCurrentEvent(currentEvent?.id)
        }
    }, [currentEvent])

    const getCurrentEvent = async (id: any) => {
        if (offline) {
            const event = await tripEventModel.getById(id)
            if (event) {
                setTripEvent(event)
                setBarCrossing({
                    geoLocationID: event.eventType_BarCrossing?.geoLocationID,
                    geoLocationCompletedID:
                        event.eventType_BarCrossing?.geoLocationCompletedID,
                    time: event.eventType_BarCrossing?.time,
                    timeCompleted: event.eventType_BarCrossing?.timeCompleted,
                    stopAssessPlan: event.eventType_BarCrossing?.stopAssessPlan,
                    crewBriefing: event.eventType_BarCrossing?.crewBriefing,
                    weather: event.eventType_BarCrossing?.weather,
                    stability: event.eventType_BarCrossing?.stability,
                    waterTightness: event.eventType_BarCrossing?.waterTightness,
                    lifeJackets: event.eventType_BarCrossing?.lifeJackets,
                    lookoutPosted: event.eventType_BarCrossing?.lookoutPosted,
                    report: event.eventType_BarCrossing?.report,
                    lat: event.eventType_BarCrossing?.lat,
                    long: event.eventType_BarCrossing?.long,
                    latCompleted: event.eventType_BarCrossing?.latCompleted,
                    longCompleted: event.eventType_BarCrossing?.longCompleted,
                })
                if (
                    event.eventType_BarCrossing?.lat &&
                    event.eventType_BarCrossing?.long
                ) {
                    setCurrentLocation({
                        latitude: event.eventType_BarCrossing?.lat,
                        longitude: event.eventType_BarCrossing?.long,
                    })
                }
                setContent(event.eventType_BarCrossing?.report)
                setTime(event.eventType_BarCrossing?.time)
                setEndTime(event.eventType_BarCrossing?.timeCompleted)
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
                setBarCrossing({
                    geoLocationID: event.eventType_BarCrossing?.geoLocationID,
                    geoLocationCompletedID:
                        event.eventType_BarCrossing?.geoLocationCompletedID,
                    time: event.eventType_BarCrossing?.time,
                    timeCompleted: event.eventType_BarCrossing?.timeCompleted,
                    stopAssessPlan: event.eventType_BarCrossing?.stopAssessPlan,
                    crewBriefing: event.eventType_BarCrossing?.crewBriefing,
                    weather: event.eventType_BarCrossing?.weather,
                    stability: event.eventType_BarCrossing?.stability,
                    waterTightness: event.eventType_BarCrossing?.waterTightness,
                    lifeJackets: event.eventType_BarCrossing?.lifeJackets,
                    lookoutPosted: event.eventType_BarCrossing?.lookoutPosted,
                    report: event.eventType_BarCrossing?.report,
                    lat: event.eventType_BarCrossing?.lat,
                    long: event.eventType_BarCrossing?.long,
                    latCompleted: event.eventType_BarCrossing?.latCompleted,
                    longCompleted: event.eventType_BarCrossing?.longCompleted,
                })
                if (
                    event.eventType_BarCrossing?.lat &&
                    event.eventType_BarCrossing?.long
                ) {
                    setCurrentLocation({
                        latitude: event.eventType_BarCrossing?.lat,
                        longitude: event.eventType_BarCrossing?.long,
                    })
                }
                setContent(event.eventType_BarCrossing?.report)
                setTime(event.eventType_BarCrossing?.time)
                setEndTime(event.eventType_BarCrossing?.timeCompleted)
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
                geoLocationID: barCrossing?.geoLocationID,
                geoLocationCompletedID: barCrossing?.geoLocationCompletedID,
                time: time,
                timeCompleted: endTime,
                stopAssessPlan: barCrossing?.stopAssessPlan,
                crewBriefing: barCrossing?.crewBriefing,
                weather: barCrossing?.weather,
                stability: barCrossing?.stability,
                waterTightness: barCrossing?.waterTightness,
                lifeJackets: barCrossing?.lifeJackets,
                lookoutPosted: barCrossing?.lookoutPosted,
                report: content,
                lat: currentLocation.latitude.toString(),
                long: currentLocation.longitude.toString(),
            },
        }

        if (currentEvent) {
            if (offline) {
                await tripEventModel.save({
                    id: +currentEvent.id,
                    eventCategory: 'BarCrossing',
                    logBookEntrySectionID: currentTrip.id,
                })
                toast.success('Trip event updated')
                await getCurrentEvent(currentEvent?.id)
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
                            eventCategory: 'BarCrossing',
                            logBookEntrySectionID: currentTrip.id,
                        },
                    },
                })
            }
            if (offline) {
                await barCrossingModel.save({
                    id: +selectedEvent?.eventType_BarCrossingID,
                    ...variables.input,
                })
            } else {
                updateEventType_BarCrossing({
                    variables: {
                        input: {
                            id: +selectedEvent?.eventType_BarCrossingID,
                            ...variables.input,
                        },
                    },
                })
            }
        } else {
            if (offline) {
                const tripEventData = await tripEventModel.save({
                    id: generateUniqueId(),
                    eventCategory: 'BarCrossing',
                    logBookEntrySectionID: currentTrip.id,
                })
                toast.success('Trip event created')
                setCurrentEvent(tripEventData)
                const barCrossingData = await barCrossingModel.save({
                    id: generateUniqueId(),
                    geoLocationID: barCrossing?.geoLocationID,
                    geoLocationCompletedID: barCrossing?.geoLocationCompletedID,
                    time: time,
                    timeCompleted: endTime,
                    stopAssessPlan: barCrossing?.stopAssessPlan,
                    crewBriefing: barCrossing?.crewBriefing,
                    weather: barCrossing?.weather,
                    stability: barCrossing?.stability,
                    waterTightness: barCrossing?.waterTightness,
                    lifeJackets: barCrossing?.lifeJackets,
                    lookoutPosted: barCrossing?.lookoutPosted,
                    report: content,
                    lat: currentLocation.latitude.toString(),
                    long: currentLocation.longitude.toString(),
                    barCrossingChecklistID: barCrossingChecklistID,
                })
                await tripEventModel.save({
                    id: currentEvent?.id,
                    eventType_BarCrossingID: barCrossingData.id,
                })
                toast.success('Trip event updated')
                await getCurrentEvent(currentEvent?.id)
                updateTripReport({
                    id: [
                        ...tripReport.map((trip: any) => trip.id),
                        currentTrip.id,
                    ],
                })
                closeModal()
                await tripEventModel.save({
                    id: tripEventData.id,
                    eventCategory: 'BarCrossing',
                    eventType_BarCrossingID: currentTrip.id,
                })
                toast.success('Trip event updated')
                await getCurrentEvent(currentEvent?.id)
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
                            eventCategory: 'BarCrossing',
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
            createEventType_BarCrossing({
                variables: {
                    input: {
                        geoLocationID: barCrossing?.geoLocationID,
                        geoLocationCompletedID:
                            barCrossing?.geoLocationCompletedID,
                        time: time,
                        timeCompleted: endTime,
                        stopAssessPlan: barCrossing?.stopAssessPlan,
                        crewBriefing: barCrossing?.crewBriefing,
                        weather: barCrossing?.weather,
                        stability: barCrossing?.stability,
                        waterTightness: barCrossing?.waterTightness,
                        lifeJackets: barCrossing?.lifeJackets,
                        lookoutPosted: barCrossing?.lookoutPosted,
                        report: content,
                        lat: currentLocation.latitude.toString(),
                        long: currentLocation.longitude.toString(),
                        barCrossingChecklistID: barCrossingChecklistID,
                    },
                },
            })
            updateTripEvent({
                variables: {
                    input: {
                        id: data.id,
                        eventCategory: 'BarCrossing',
                        eventType_BarCrossingID: currentTrip.id,
                    },
                },
            })
        },
        onError: (error) => {
            console.error('Error creating trip event', error)
        },
    })

    const [createEventType_BarCrossing] = useMutation(
        CreateEventType_BarCrossing,
        {
            onCompleted: (response) => {
                const data = response.createEventType_BarCrossing
                updateTripEvent({
                    variables: {
                        input: {
                            id: currentEvent?.id,
                            eventType_BarCrossingID: data.id,
                        },
                    },
                })
                closeModal()
            },
            onError: (error) => {
                console.error('Error creating bar crossing', error)
            },
        },
    )

    const [updateEventType_BarCrossing] = useMutation(
        UpdateEventType_BarCrossing,
        {
            onCompleted: (response) => {
                const data = response.updateEventType_BarCrossing
            },
            onError: (error) => {
                console.error('Error updating bar crossing', error)
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

    const handleLocationChange = (value: any) => {
        setBarCrossing({
            ...barCrossing,
            geoLocationID: value?.value,
        })
    }

    const handleEndLocationChange = (value: any) => {
        setBarCrossing({
            ...barCrossing,
            geoLocationCompletedID: value?.value,
        })
    }

    return (
        <div className="w-full">
            {displayField('BarCrossing_Location') ||
            displayField('BarCrossing_Time') ? (
                <>
                    <p className={classes.helpText}>
                        Select the location and start time of your bar crossing
                    </p>
                    <div className="w-2/3 my-4">
                        <SeaLogsButton
                            text="Bar crossing - risk analysis"
                            color="orange"
                            type="primaryWithColor"
                            action={() => setOpenRiskAnalysis(true)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <div
                            className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                            <label className={`${classes.label} !w-full`}>
                                Location of bar crossing
                            </label>
                            {displayField('BarCrossing_Location') && (
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
                                        tripEvent.eventType_BarCrossing
                                    }
                                />
                            )}
                        </div>
                        <div
                            className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                            <label className={`${classes.label} !w-full`}>
                                Times when bar crossing starts
                            </label>
                            {displayField('BarCrossing_Time') && (
                                <>
                                    <div>
                                        <TimeField
                                            time={time}
                                            handleTimeChange={handleTimeChange}
                                            timeID="crossing-time"
                                            fieldName="Time"
                                            buttonLabel="Set to now"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </>
            ) : null}
            {displayField('BarCrossing_Report') && (
                <>
                    <hr className="my-2" />
                    <div className="mt-6 text-sm font-semibold uppercase">
                        Crossing comments
                    </div>
                    <p className="text-xs font-inter max-w-[40rem] leading-loose">
                        Record any comment associated with the crossing
                    </p>
                    <div className="col-span-3 md:col-span-2">
                        <div
                            className={`${locked ? 'pointer-events-none' : ''} my-4 flex items-center w-full`}>
                            {(!currentEvent || barCrossing) && (
                                <Editor
                                    id="bar-crossing-report"
                                    placeholder="Bar crossing report"
                                    className="!w-full bg-white ring-1 ring-inset ring-gray-200"
                                    content={content}
                                    handleEditorChange={handleEditorChange}
                                />
                            )}
                        </div>
                    </div>
                </>
            )}
            {displayField('BarCrossing_EndTime') ? (
                <>
                    {/*<div className='my-4'>
                            <label className={`${classes.label} !w-full`}>
                                Location where bar crossing ends
                            </label>
                            {displayField('BarCrossing_Location') && (
                            <LocationField
                                offline={offline}
                                currentTrip={currentTrip}
                                updateTripReport={updateTripReport}
                                tripReport={tripReport}
                                setCurrentLocation={setCurrentEndLocation}
                                handleLocationChange={
                                    handleEndLocationChange
                                }
                                currentLocation={currentEndLocation}
                                currentEvent={{
                                    geoLocationID:
                                        tripEvent.eventType_BarCrossing
                                            ?.geoLocationCompletedID,
                                    lat: tripEvent.eventType_BarCrossing
                                        ?.latCompleted,
                                    long: tripEvent.eventType_BarCrossing
                                        ?.longCompleted,
                                }}
                            />
                        )}
                        </div>*/}
                    <div
                        className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                        <label className={`${classes.label} !w-full`}>
                            Times when bar crossing ends
                        </label>
                        {displayField('BarCrossing_Time') && (
                            <div>
                                <TimeField
                                    time={endTime}
                                    handleTimeChange={handleEndTimeChange}
                                    timeID="end-crossing-time"
                                    fieldName="Time"
                                    buttonLabel="Set to now"
                                />
                            </div>
                        )}
                    </div>
                </>
            ) : (
                ''
            )}
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
            <Toaster position="top-right" />
            <SlidingPanel type={'right'} isOpen={openRiskAnalysis} size={60}>
                <div className="h-[calc(100vh_-_1rem)] pt-4">
                    <div className="bg-orange-100 h-full flex flex-col justify-between rounded-l-lg">
                        <div className="text-xl dark:text-white text-white items-center flex justify-between font-medium py-4 px-6 rounded-tl-lg bg-orange-400">
                            <div>
                                Risk analysis{' - '}
                                <span className="font-thin">Bar crossing</span>
                            </div>
                            <XMarkIcon
                                className="w-6 h-6"
                                onClick={() => setOpenRiskAnalysis(false)}
                            />
                        </div>
                        <div
                            className={`${locked ? 'pointer-events-none' : ''} p-4 flex-grow overflow-scroll`}>
                            <BarCrossingRiskAnalysis
                                offline={offline}
                                selectedEvent={selectedEvent}
                                onSidebarClose={() =>
                                    setOpenRiskAnalysis(false)
                                }
                                logBookConfig={logBookConfig}
                                currentTrip={currentTrip}
                                crewMembers={members}
                                barCrossingChecklistID={barCrossingChecklistID}
                                logentryID={0}
                                setBarCrossingChecklistID={
                                    setBarCrossingChecklistID
                                }
                            />
                            <SeaLogsButton
                                text="Save"
                                type="primary"
                                color="sky"
                                icon="check"
                                action={() => setOpenRiskAnalysis(false)}
                            />
                        </div>
                    </div>
                </div>
            </SlidingPanel>
        </div>
    )
}
