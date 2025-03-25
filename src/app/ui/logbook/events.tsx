'use client'

import { SeaLogsButton } from '@/app/components/Components'
import { getFieldName } from '@/app/lib/actions'
import React, { useEffect, useState } from 'react'
import Select, { StylesConfig } from 'react-select'
import VesselRescue from './forms/vessel-rescue'
import PersonRescue from './forms/person-rescue'
import RestrictedVisibility from './forms/restricted-visibility'
import BarCrossing from './forms/bar-crossing'
import { classes } from '@/app/components/GlobalClasses'
import PassengerDropFacility from './forms/passenger-drop-facility'
import Tasking from './forms/tasking'
import { useSearchParams } from 'next/navigation'
import CrewTrainingEvent from './forms/crew-training-event'
import SupernumeraryEvent from './forms/supernumerary-event'
import PassengerVehiclePickDrop from './forms/passenger-vehicle-pick-drop'
import { uniqueId } from 'lodash'
import RefuellingBunkering from './forms/refuelling-bunkering'
import { SLALL_LogBookFields, vesselTypes } from '@/app/lib/vesselDefaultConfig'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import toast from 'react-hot-toast'

export default function Events({
    eventTypes = false,
    currentTrip,
    logBookConfig,
    updateTripReport,
    locked,
    geoLocations,
    tripReport,
    crewMembers,
    masterID,
    vessel,
    vessels,
    offline = false,
    // openEventModal,
    // setOpenEventModal,
    setSelectedRow,
    setCurrentEventType,
    setCurrentStop,
    selectedRow,
    currentEventType,
    currentStop,
    tripReport_Stops,
    setTripReport_Stops,
    displayDangerousGoodsPvpd = false,
    displayDangerousGoodsPvpdSailing,
    setDisplayDangerousGoodsPvpd,
    setDisplayDangerousGoodsPvpdSailing,
    allPVPDDangerousGoods,
    setAllPVPDDangerousGoods,
    selectedDGRPVPD,
    setSelectedDGRPVPD,
}: {
    eventTypes: any
    currentTrip: any
    logBookConfig: any
    updateTripReport: any
    locked: boolean
    geoLocations: any
    tripReport: any
    crewMembers: any
    masterID: any
    vessel: any
    vessels: any
    offline?: boolean
    // openEventModal: any
    // setOpenEventModal: any
    setSelectedRow: any
    setCurrentEventType: any
    setCurrentStop: any
    selectedRow: any
    currentEventType: any
    currentStop: any
    tripReport_Stops: any
    setTripReport_Stops: any
    displayDangerousGoodsPvpd: boolean
    displayDangerousGoodsPvpdSailing: any
    setDisplayDangerousGoodsPvpd: any
    setDisplayDangerousGoodsPvpdSailing: any
    allPVPDDangerousGoods: any
    setAllPVPDDangerousGoods: any
    selectedDGRPVPD: any
    setSelectedDGRPVPD: any
}) {
    // const [newEvent, setNewEvent] = useState(false)
    const [eventConfig, setEventConfig] = useState<any>(false)
    const [events, setEvents] = useState<any>(false)
    const [openEventModal, setOpenEventModal] = useState(false)
    const [currentEvent, setCurrentEvent] = useState<any>(false)
    // const [tripReport_Stops, setTripReport_Stops] = useState<any>(false)
    // const [selectedRow, setSelectedRow] = useState<any>(0)
    // const [currentEventType, setCurrentEventType] = useState<any>(false)
    // const [currentStop, setCurrentStop] = useState<any>(false)
    const [taskingEvents, setTaskingEvents] = useState<any>(0)
    const vesselID = useSearchParams().get('vesselID') || '0'

    const [permissions, setPermissions] = useState<any>(false)
    const [edit_tripActivity, setEdit_tripActivity] = useState<any>(false)

    const init_permissions = () => {
        if (permissions) {
            if (
                hasPermission(
                    process.env.EDIT_LOGBOOKENTRY_ACTIVITY ||
                        'EDIT_LOGBOOKENTRY_ACTIVITY',
                    permissions,
                )
            ) {
                setEdit_tripActivity(true)
            } else {
                setEdit_tripActivity(false)
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

    useEffect(() => {
        const hasRescueType = logBookConfig?.customisedLogBookComponents?.nodes
            .find(
                (section: any) =>
                    section.componentClass === 'EventType_LogBookComponent',
            )
            ?.customisedComponentFields.nodes.find(
                (field: any) =>
                    field.fieldName === 'VesselRescue' ||
                    field.fieldName === 'HumanRescue',
            )
        if (logBookConfig) {
            const eventList = hasRescueType
                ? logBookConfig.customisedLogBookComponents.nodes
                      .find(
                          (section: any) =>
                              section.componentClass ===
                              'EventType_LogBookComponent',
                      )
                      ?.customisedComponentFields?.nodes.filter(
                          (field: any) =>
                              !hasParent(field) && field.status !== 'Off',
                      )
                : logBookConfig.customisedLogBookComponents.nodes
                      .find(
                          (section: any) =>
                              section.componentClass ===
                              'EventType_LogBookComponent',
                      )
                      ?.customisedComponentFields?.nodes.filter(
                          (field: any) =>
                              !hasParent(field) &&
                              field.status !== 'Off' &&
                              field.fieldName !== 'TaskingStartUnderway' &&
                              field.fieldName !== 'TaskingOnScene' &&
                              field.fieldName !== 'TaskingOnTow' &&
                              field.fieldName !== 'TaskingPaused' &&
                              field.fieldName !== 'TaskingResumed' &&
                              field.fieldName !== 'TaskingComplete' &&
                              field.fieldName !== 'DangerousGoodsSailing',
                      )
            setEventConfig(eventList)
            const filteredEvents = eventList
                ?.map((event: any) => ({
                    label: getFieldName(event)
                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                        .replace('Passenger Arrival', 'Arrival')
                        .replace('Passenger Departure', 'Departure'),
                    value: event.fieldName,
                }))
                .filter(
                    (event: any, index: number, self: any) =>
                        index ===
                        self.findIndex((e: any) => e.value === event.value),
                )
                .filter(
                    (event: any) =>
                        event?.value !== 'VesselRescue' &&
                        event?.value !== 'HumanRescue' &&
                        event?.value !== 'Supernumerary' &&
                        !isTowingField(event.value),
                )
                .filter((event: any) => checkVesselType(event.value))
            setEvents(sortFilteredEvents(filteredEvents))
        }
    }, [logBookConfig])

    const checkVesselType = (field: any) => {
        const vesselTypeID = vesselTypes.findIndex(
            (type: any) => type == vessel?.vesselType,
        )

        const config = SLALL_LogBookFields.find(
            (localField: any) =>
                localField.componentClass === 'EventType_LogBookComponent',
        )

        const isVesselType = config?.items.find(
            (localField: any) =>
                field === localField.value &&
                localField.vesselType.includes(vesselTypeID),
        )
        return isVesselType ? true : false
    }

    const sortFilteredEvents = (events: any) => {
        if (
            currentTrip?.tripEvents?.nodes?.find(
                (event: any) =>
                    event.eventCategory === 'Tasking' &&
                    event.eventType_Tasking?.type === 'TaskingStartUnderway' &&
                    event.eventType_Tasking?.status === 'Open',
            )
        ) {
            const pausedTask = currentTrip?.tripEvents.nodes.find(
                (event: any) =>
                    event.eventCategory === 'Tasking' &&
                    event.eventType_Tasking?.status === 'Paused',
            )?.length

            const sortedEvents = [
                ...events
                    .filter(
                        (event: any) => event.value === 'TaskingStartUnderway',
                    )
                    .map((event: any) => ({
                        ...event,
                        color: '#EB7C2A',
                        bgColor: '#FED7AA',
                    })),
                ...events
                    .filter((event: any) => event.value === 'TaskingOnScene')
                    .map((event: any) => ({
                        ...event,
                        color: '#EB7C2A',
                        bgColor: '#FED7AA',
                    })),
                ...events
                    .filter((event: any) => event.value === 'TaskingOnTow')
                    .map((event: any) => ({
                        ...event,
                        color: '#EB7C2A',
                        bgColor: '#FED7AA',
                    })),
                ...events
                    .filter((event: any) => event.value === 'TaskingComplete')
                    .map((event: any) => ({
                        ...event,
                        color: '#EB7C2A',
                        bgColor: '#FED7AA',
                    })),
                ...events
                    .filter((event: any) => event.value === 'TaskingPaused')
                    .map((event: any) => ({
                        ...event,
                        color: '#EB7C2A',
                        bgColor: '#FED7AA',
                    })),
                ...events
                    .filter(
                        (event: any) =>
                            event.value === 'TaskingResumed' && pausedTask > 0,
                    )
                    .map((event: any) => ({
                        ...event,
                        color: '#EB7C2A',
                        bgColor: '#FED7AA',
                    })),
                ...events.filter(
                    (event: any) => !event.value.includes('Tasking'),
                ),
            ]
            return sortedEvents
        }
        return events
    }

    const colourStyles: StylesConfig = {
        option: (
            styles: any,
            {
                data,
                isDisabled,
                isFocused,
                isSelected,
            }: { data: any; isDisabled: any; isFocused: any; isSelected: any },
        ) => {
            const color = data.color
            return {
                ...styles,
                backgroundColor: isDisabled
                    ? undefined
                    : isSelected
                      ? data.bgColor
                      : isFocused
                        ? data.bgColor
                        : data.bgColor + '60',
                color: data.color,
            }
        },
        singleValue: (styles: any, data: any) => ({
            ...styles,
            color: events.find((option: any) => option.value == data.data.value)
                ?.color,
        }),
    }

    useEffect(() => {
        // setOpenEventModal(false)
        // setCurrentEventType([])
        const taskingEvents = currentTrip?.tripEvents?.nodes.filter(
            (event: any) =>
                event?.eventCategory === 'Tasking' &&
                (event?.eventType_Tasking?.type === 'TaskingStartUnderway' ||
                    event?.eventType_Tasking?.type === 'TaskingPaused') &&
                event?.eventType_Tasking?.status === 'Open',
        )?.length
        setTaskingEvents(taskingEvents)
    }, [currentTrip])

    const hasParent = (field: any) => {
        const config = SLALL_LogBookFields.find(
            (localField: any) =>
                localField.componentClass === 'EventType_LogBookComponent',
        )

        const hasGroup = config?.items.find(
            (localField: any) =>
                field.fieldName === localField.value && localField.groupTo,
        )
        return hasGroup ? true : false
    }

    const isTowingField = (field: any) => {
        const config = SLALL_LogBookFields.find(
            (localField: any) =>
                localField.componentClass === 'EventType_LogBookComponent',
        )

        const isTowingCategory = config?.items.find(
            (localField: any) =>
                field === localField.value &&
                localField.type === 'TowingSubCategory',
        )
        return isTowingCategory ? true : false
    }

    const handleEventChange = (event: any) => {
        setCurrentEventType(event)
    }

    const handleSetOpenEventModal = () => {
        setOpenEventModal(!openEventModal)
    }

    const handleSetCurrentEventType = () => {
        setCurrentEventType(false)
        setOpenEventModal(false)
    }

    const previousDropEvent = (currentEvent: any) => {
        const previousEvent = currentTrip?.tripEvents?.nodes.find(
            (event: any) =>
                event?.eventCategory === 'PassengerDropFacility' &&
                event?.id !== currentEvent?.id,
        )
        return previousEvent
    }

    const mainTaskingEvent = (currentEvent: any) => {
        const mainEvent = currentTrip?.tripEvents?.nodes.filter(
            (event: any) =>
                event?.eventCategory === 'Tasking' &&
                event?.id !== currentEvent?.id &&
                event?.eventType_Tasking?.type === 'TaskingStartUnderway',
        )
        return mainEvent
    }

    return (
        <div key={uniqueId()}>
            <div className="my-4 text-sm font-semibold uppercase">
                Activities
            </div>
            <p className={classes.helpText}>
                Record the events that happen during a voyage in this section.
            </p>
            {currentTrip?.tripEvents?.nodes?.length > 0 ||
            currentTrip?.tripReport_Stops?.nodes?.length > 0 ||
            (openEventModal && !currentEvent) ? (
                <>
                    {(currentTrip?.tripEvents?.nodes?.length > 0 ||
                        currentTrip?.tripReport_Stops?.nodes?.length > 0) && (
                        <>
                            <div className="">
                                {currentTrip?.tripEvents.nodes.map(
                                    (event: any, index: number) => (
                                        <div key={index + '_events'}>
                                            <div
                                                key={event.id}
                                                className={`{group} bg-white border border-sllightblue-200 dark:bg-sldarkblue-900 rounded-lg p-4 my-4 -mx-3`}>
                                                <div
                                                    className="text-left cursor-pointer"
                                                    onClick={() => {
                                                        if (
                                                            selectedRow ===
                                                            event.id
                                                            // &&
                                                            // openEventModal
                                                        ) {
                                                            setSelectedRow(0)
                                                        } else {
                                                            setSelectedRow(
                                                                event.id,
                                                            )
                                                        }
                                                        if (
                                                            // openEventModal &&
                                                            currentEvent.id ===
                                                            event.id
                                                        ) {
                                                            setOpenEventModal(
                                                                false,
                                                            )
                                                            setCurrentEventType(
                                                                [],
                                                            )
                                                            setCurrentEvent(
                                                                false,
                                                            )
                                                            setCurrentStop(
                                                                false,
                                                            )
                                                            return
                                                        }
                                                        setOpenEventModal(true)
                                                        setCurrentEventType({
                                                            label:
                                                                event?.eventCategory ===
                                                                'PassengerDropFacility'
                                                                    ? event?.eventType_PassengerDropFacility?.type
                                                                          ?.replace(
                                                                              /([a-z])([A-Z])/g,
                                                                              '$1 $2',
                                                                          )
                                                                          ?.replace(
                                                                              'Passenger Arrival',
                                                                              'Arrival',
                                                                          )
                                                                          ?.replace(
                                                                              'Passenger Departure',
                                                                              'Departure',
                                                                          )
                                                                    : event?.eventCategory ===
                                                                        'Tasking'
                                                                      ? event?.eventType_Tasking?.type.replace(
                                                                            /([a-z])([A-Z])/g,
                                                                            '$1 $2',
                                                                        )
                                                                      : event?.eventCategory ===
                                                                          'EventSupernumerary'
                                                                        ? 'Supernumerary'
                                                                        : event?.eventCategory.replace(
                                                                              /([a-z])([A-Z])/g,
                                                                              '$1 $2',
                                                                          ),
                                                            value:
                                                                event?.eventCategory ===
                                                                'PassengerDropFacility'
                                                                    ? event
                                                                          ?.eventType_PassengerDropFacility
                                                                          ?.type
                                                                    : event?.eventCategory ===
                                                                        'Tasking'
                                                                      ? event
                                                                            ?.eventType_Tasking
                                                                            ?.type
                                                                      : event?.eventCategory ===
                                                                          'Supernumerary'
                                                                        ? 'EventSupernumerary'
                                                                        : event?.eventCategory,
                                                        })
                                                        setCurrentEvent(event)
                                                        setTripReport_Stops(
                                                            false,
                                                        )
                                                        setDisplayDangerousGoodsPvpd(
                                                            false,
                                                        )
                                                        setDisplayDangerousGoodsPvpdSailing(
                                                            null,
                                                        )
                                                    }}>
                                                    <div
                                                        className={`group-hover:text-sllightblue-1000 dark:group-hover:text-white`}>
                                                        {event?.eventCategory ===
                                                        'PassengerDropFacility'
                                                            ? (event
                                                                  ?.eventType_PassengerDropFacility
                                                                  ?.time
                                                                  ? event
                                                                        ?.eventType_PassengerDropFacility
                                                                        ?.time +
                                                                    ' - '
                                                                  : '') +
                                                              event?.eventType_PassengerDropFacility?.type
                                                                  ?.replace(
                                                                      /([a-z])([A-Z])/g,
                                                                      '$1 $2',
                                                                  )
                                                                  ?.replace(
                                                                      'Passenger Arrival',
                                                                      'Arrival',
                                                                  )
                                                                  ?.replace(
                                                                      'Passenger Departure',
                                                                      'Departure',
                                                                  ) +
                                                              (event
                                                                  ?.eventType_PassengerDropFacility
                                                                  ?.title
                                                                  ? ' - ' +
                                                                    event
                                                                        ?.eventType_PassengerDropFacility
                                                                        ?.title
                                                                  : '') +
                                                              '' +
                                                              (event
                                                                  ?.eventType_PassengerDropFacility
                                                                  ?.geoLocation
                                                                  ?.title
                                                                  ? ' - ' +
                                                                    event
                                                                        ?.eventType_PassengerDropFacility
                                                                        ?.geoLocation
                                                                        ?.title
                                                                  : '')
                                                            : event?.eventCategory ===
                                                                'Tasking'
                                                              ? event
                                                                    ?.eventType_Tasking
                                                                    ?.time +
                                                                ' - ' +
                                                                event?.eventType_Tasking?.type.replace(
                                                                    /([a-z])([A-Z])/g,
                                                                    '$1 $2',
                                                                ) +
                                                                ' ' +
                                                                (event
                                                                    ?.eventType_Tasking
                                                                    ?.title
                                                                    ? ' - ' +
                                                                      event
                                                                          ?.eventType_Tasking
                                                                          ?.title
                                                                    : '') +
                                                                '' +
                                                                (event
                                                                    ?.eventType_Tasking
                                                                    ?.geoLocation
                                                                    ?.title
                                                                    ? ' - ' +
                                                                      event
                                                                          ?.eventType_Tasking
                                                                          ?.geoLocation
                                                                          ?.title
                                                                    : '')
                                                              : event?.eventCategory ===
                                                                  'BarCrossing'
                                                                ? (event
                                                                      ?.eventType_BarCrossing
                                                                      ?.time
                                                                      ? event
                                                                            ?.eventType_BarCrossing
                                                                            ?.time +
                                                                        ' - '
                                                                      : '') +
                                                                  event?.eventCategory.replace(
                                                                      /([a-z])([A-Z])/g,
                                                                      '$1 $2',
                                                                  ) +
                                                                  (event
                                                                      ?.eventType_BarCrossing
                                                                      ?.geoLocation
                                                                      ?.title
                                                                      ? ' - ' +
                                                                        event
                                                                            ?.eventType_BarCrossing
                                                                            ?.geoLocation
                                                                            ?.title
                                                                      : '')
                                                                : event?.eventCategory ===
                                                                    'BarCrossing'
                                                                  ? (event
                                                                        ?.eventType_BarCrossing
                                                                        ?.time
                                                                        ? event
                                                                              ?.eventType_BarCrossing
                                                                              ?.time +
                                                                          ' - '
                                                                        : '') +
                                                                    event?.eventCategory.replace(
                                                                        /([a-z])([A-Z])/g,
                                                                        '$1 $2',
                                                                    ) +
                                                                    (event
                                                                        ?.eventType_BarCrossing
                                                                        ?.geoLocation
                                                                        ?.title
                                                                        ? ' - ' +
                                                                          event
                                                                              ?.eventType_BarCrossing
                                                                              ?.geoLocation
                                                                              ?.title
                                                                        : '')
                                                                  : event?.eventCategory ===
                                                                      'EventSupernumerary'
                                                                    ? 'Supernumerary'
                                                                    : event?.eventCategory.replace(
                                                                          /([a-z])([A-Z])/g,
                                                                          '$1 $2',
                                                                      )}
                                                        {event?.eventCategory ===
                                                            'CrewTraining' &&
                                                            ` ${event?.crewTraining.startTime ? '-' : ''} ${event?.crewTraining.startTime || ''} ${event?.crewTraining.startTime && event?.crewTraining.finishTime ? 'to' : ''} ${event?.crewTraining.finishTime || ''}`}
                                                        {event?.eventCategory ===
                                                            'RestrictedVisibility' &&
                                                            ` ${event?.eventType_RestrictedVisibility?.crossingTime ? '-' : ''} ${event?.eventType_RestrictedVisibility?.crossingTime || ''} ${event?.eventType_RestrictedVisibility?.crossingTime && event?.eventType_RestrictedVisibility?.crossedTime ? 'to' : ''} ${event?.eventType_RestrictedVisibility?.crossedTime || ''}`}
                                                    </div>
                                                    {event?.eventCategory ===
                                                        'Tasking' &&
                                                        event?.eventType_Tasking
                                                            ?.type ===
                                                            'TaskingStartUnderway' &&
                                                        event?.eventType_Tasking
                                                            ?.status && (
                                                            <span className="ml-3 px-2 py-1 text-xs font-light bg-sllightblue-100 border border-sllightblue-1000 text-sllightblue-800 rounded-md">
                                                                {
                                                                    event
                                                                        ?.eventType_Tasking
                                                                        ?.status
                                                                }
                                                            </span>
                                                        )}
                                                </div>
                                                <div
                                                    className={`${selectedRow === event.id && currentEventType && currentEvent ? 'my-4 border-t border-sllightblue-100' : 'hidden'} group-hover:text-sllightblue-1000 dark:group-hover:text-white`}>
                                                    {currentEventType &&
                                                        currentEvent && (
                                                            <>
                                                                {currentEventType.value ===
                                                                    'VesselRescue' && (
                                                                    <VesselRescue
                                                                        offline={
                                                                            offline
                                                                        }
                                                                        geoLocations={
                                                                            geoLocations
                                                                        }
                                                                        currentTrip={
                                                                            currentTrip
                                                                        }
                                                                        updateTripReport={
                                                                            updateTripReport
                                                                        }
                                                                        selectedEvent={
                                                                            currentEvent
                                                                        }
                                                                        tripReport={
                                                                            tripReport
                                                                        }
                                                                        closeModal={
                                                                            handleSetCurrentEventType
                                                                        }
                                                                        locked={
                                                                            locked ||
                                                                            !edit_tripActivity
                                                                        }
                                                                    />
                                                                )}
                                                                {currentEventType.value ===
                                                                    'HumanRescue' && (
                                                                    <PersonRescue
                                                                        offline={
                                                                            offline
                                                                        }
                                                                        geoLocations={
                                                                            geoLocations
                                                                        }
                                                                        currentTrip={
                                                                            currentTrip
                                                                        }
                                                                        updateTripReport={
                                                                            updateTripReport
                                                                        }
                                                                        selectedEvent={
                                                                            currentEvent
                                                                        }
                                                                        tripReport={
                                                                            tripReport
                                                                        }
                                                                        closeModal={
                                                                            handleSetCurrentEventType
                                                                        }
                                                                        locked={
                                                                            locked ||
                                                                            !edit_tripActivity
                                                                        }
                                                                    />
                                                                )}
                                                                {currentEventType.value ===
                                                                    'RestrictedVisibility' && (
                                                                    <RestrictedVisibility
                                                                        offline={
                                                                            offline
                                                                        }
                                                                        currentTrip={
                                                                            currentTrip
                                                                        }
                                                                        updateTripReport={
                                                                            updateTripReport
                                                                        }
                                                                        selectedEvent={
                                                                            currentEvent
                                                                        }
                                                                        tripReport={
                                                                            tripReport
                                                                        }
                                                                        closeModal={
                                                                            handleSetCurrentEventType
                                                                        }
                                                                        logBookConfig={
                                                                            logBookConfig
                                                                        }
                                                                        locked={
                                                                            locked ||
                                                                            !edit_tripActivity
                                                                        }
                                                                    />
                                                                )}
                                                                {currentEventType.value ===
                                                                    'BarCrossing' && (
                                                                    <BarCrossing
                                                                        offline={
                                                                            offline
                                                                        }
                                                                        currentTrip={
                                                                            currentTrip
                                                                        }
                                                                        updateTripReport={
                                                                            updateTripReport
                                                                        }
                                                                        selectedEvent={
                                                                            currentEvent
                                                                        }
                                                                        tripReport={
                                                                            tripReport
                                                                        }
                                                                        members={
                                                                            crewMembers
                                                                        }
                                                                        closeModal={
                                                                            handleSetCurrentEventType
                                                                        }
                                                                        logBookConfig={
                                                                            logBookConfig
                                                                        }
                                                                        locked={
                                                                            locked ||
                                                                            !edit_tripActivity
                                                                        }
                                                                    />
                                                                )}
                                                                {(currentEventType.value ===
                                                                    'PassengerArrival' ||
                                                                    currentEventType.value ===
                                                                        'PassengerDeparture' ||
                                                                    currentEventType.value ===
                                                                        'WaterTaxiService' ||
                                                                    currentEventType.value ===
                                                                        'ScheduledPassengerService') && (
                                                                    <PassengerDropFacility
                                                                        offline={
                                                                            offline
                                                                        }
                                                                        geoLocations={
                                                                            geoLocations
                                                                        }
                                                                        currentTrip={
                                                                            currentTrip
                                                                        }
                                                                        updateTripReport={
                                                                            updateTripReport
                                                                        }
                                                                        selectedEvent={
                                                                            currentEvent
                                                                        }
                                                                        tripReport={
                                                                            tripReport
                                                                        }
                                                                        closeModal={
                                                                            handleSetCurrentEventType
                                                                        }
                                                                        type={
                                                                            currentEventType.value
                                                                        }
                                                                        logBookConfig={
                                                                            logBookConfig
                                                                        }
                                                                        previousDropEvent={previousDropEvent(
                                                                            currentEvent,
                                                                        )}
                                                                        vessel={
                                                                            vessel
                                                                        }
                                                                        locked={
                                                                            locked ||
                                                                            !edit_tripActivity
                                                                        }
                                                                    />
                                                                )}
                                                                {(currentEventType.value ===
                                                                    'TaskingStartUnderway' ||
                                                                    currentEventType.value ===
                                                                        'TaskingOnScene' ||
                                                                    currentEventType.value ===
                                                                        'TaskingOnTow' ||
                                                                    currentEventType.value ===
                                                                        'TaskingPaused' ||
                                                                    currentEventType.value ===
                                                                        'TaskingResumed' ||
                                                                    currentEventType.value ===
                                                                        'TaskingComplete') && (
                                                                    <Tasking
                                                                        offline={
                                                                            offline
                                                                        }
                                                                        geoLocations={
                                                                            geoLocations
                                                                        }
                                                                        currentTrip={
                                                                            currentTrip
                                                                        }
                                                                        updateTripReport={
                                                                            updateTripReport
                                                                        }
                                                                        selectedEvent={
                                                                            currentEvent
                                                                        }
                                                                        tripReport={
                                                                            tripReport
                                                                        }
                                                                        closeModal={
                                                                            handleSetCurrentEventType
                                                                        }
                                                                        type={
                                                                            currentEventType.value
                                                                        }
                                                                        logBookConfig={
                                                                            logBookConfig
                                                                        }
                                                                        previousDropEvent={mainTaskingEvent(
                                                                            currentEvent,
                                                                        )}
                                                                        vessel={
                                                                            vessel
                                                                        }
                                                                        members={
                                                                            crewMembers
                                                                        }
                                                                        locked={
                                                                            locked ||
                                                                            !edit_tripActivity
                                                                        }
                                                                    />
                                                                )}
                                                                {currentEventType.value ===
                                                                    'CrewTraining' && (
                                                                    <CrewTrainingEvent
                                                                        offline={
                                                                            offline
                                                                        }
                                                                        vesselId={
                                                                            +vesselID
                                                                        }
                                                                        trainingTypeId={
                                                                            0
                                                                        }
                                                                        currentTrip={
                                                                            currentTrip
                                                                        }
                                                                        updateTripReport={
                                                                            updateTripReport
                                                                        }
                                                                        selectedEvent={
                                                                            currentEvent
                                                                        }
                                                                        tripReport={
                                                                            tripReport
                                                                        }
                                                                        closeModal={
                                                                            handleSetCurrentEventType
                                                                        }
                                                                        crewMembers={
                                                                            crewMembers
                                                                        }
                                                                        masterID={
                                                                            masterID
                                                                        }
                                                                        logBookConfig={
                                                                            logBookConfig
                                                                        }
                                                                        vessels={
                                                                            vessels
                                                                        }
                                                                        locked={
                                                                            locked ||
                                                                            !edit_tripActivity
                                                                        }
                                                                    />
                                                                )}
                                                                {currentEventType.value ===
                                                                    'EventSupernumerary' && (
                                                                    <SupernumeraryEvent
                                                                        offline={
                                                                            offline
                                                                        }
                                                                        logBookConfig={
                                                                            logBookConfig
                                                                        }
                                                                        locked={
                                                                            locked ||
                                                                            !edit_tripActivity
                                                                        }
                                                                        closeModal={
                                                                            handleSetCurrentEventType
                                                                        }
                                                                        currentTrip={
                                                                            currentTrip
                                                                        }
                                                                        updateTripReport={
                                                                            updateTripReport
                                                                        }
                                                                        tripReport={
                                                                            tripReport
                                                                        }
                                                                        selectedEvent={
                                                                            currentEvent
                                                                        }
                                                                    />
                                                                )}
                                                                {currentEventType.value ===
                                                                    'RefuellingBunkering' && (
                                                                    <RefuellingBunkering
                                                                        offline={
                                                                            offline
                                                                        }
                                                                        geoLocations={
                                                                            geoLocations
                                                                        }
                                                                        currentTrip={
                                                                            currentTrip
                                                                        }
                                                                        updateTripReport={
                                                                            updateTripReport
                                                                        }
                                                                        selectedEvent={
                                                                            currentEvent
                                                                        }
                                                                        tripReport={
                                                                            tripReport
                                                                        }
                                                                        closeModal={
                                                                            handleSetCurrentEventType
                                                                        }
                                                                        logBookConfig={
                                                                            logBookConfig
                                                                        }
                                                                        locked={
                                                                            locked ||
                                                                            !edit_tripActivity
                                                                        }
                                                                    />
                                                                )}
                                                            </>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}
                                {currentTrip?.tripReport_Stops.nodes.map(
                                    (event: any, index: number) => (
                                        <div key={index + '_stops'}>
                                            <div
                                                key={event.id}
                                                className={`{group} bg-white border border-sllightblue-200 dark:bg-sldarkblue-900 rounded-lg p-4 my-4 -mx-3`}>
                                                <div className="text-left cursor-pointer">
                                                    <div
                                                        onClick={() => {
                                                            if (
                                                                selectedRow ===
                                                                event.id
                                                                // &&
                                                                // openEventModal
                                                            ) {
                                                                setSelectedRow(
                                                                    0,
                                                                )
                                                            } else {
                                                                setSelectedRow(
                                                                    event.id,
                                                                )
                                                            }
                                                            if (
                                                                // openEventModal &&
                                                                currentStop.id ===
                                                                event.id
                                                            ) {
                                                                setOpenEventModal(
                                                                    false,
                                                                )
                                                                setCurrentEventType(
                                                                    [],
                                                                )
                                                                setCurrentEvent(
                                                                    false,
                                                                )
                                                                setCurrentStop(
                                                                    false,
                                                                )
                                                                return
                                                            }
                                                            setOpenEventModal(
                                                                true,
                                                            )
                                                            setCurrentEventType(
                                                                {
                                                                    label: 'Passenger/vehicle pickup/drop off',
                                                                    value: 'PassengerVehiclePickDrop',
                                                                },
                                                            )
                                                            setCurrentStop(
                                                                event,
                                                            )
                                                            setDisplayDangerousGoodsPvpd(
                                                                false,
                                                            )
                                                            setDisplayDangerousGoodsPvpdSailing(
                                                                null,
                                                            )
                                                            setTripReport_Stops(
                                                                false,
                                                            )
                                                        }}
                                                        className={`group-hover:text-sllightblue-1000 dark:group-hover:text-white`}>
                                                        Passenger / Vehicle Pick
                                                        & Drop -{' '}
                                                        {event?.arriveTime
                                                            ? event?.arriveTime +
                                                              ' (arr)'
                                                            : ''}{' '}
                                                        {event?.arriveTime &&
                                                        event?.departTime
                                                            ? '-'
                                                            : ''}{' '}
                                                        {event?.departTime
                                                            ? event?.departTime +
                                                              ' (dep)'
                                                            : ''}{' '}
                                                        {event?.stopLocation
                                                            ?.title
                                                            ? event
                                                                  ?.stopLocation
                                                                  ?.title
                                                            : ''}{' '}
                                                    </div>
                                                    <div
                                                        className={`${selectedRow === event.id && currentEventType && currentStop ? 'my-4 border-t border-sllightblue-100' : 'hidden'} text-left`}>
                                                        {currentEventType &&
                                                            currentStop && (
                                                                <div className="text-left cursor-pointer">
                                                                    {currentEventType.value ===
                                                                        'PassengerVehiclePickDrop' && (
                                                                        <PassengerVehiclePickDrop
                                                                            offline={
                                                                                offline
                                                                            }
                                                                            geoLocations={
                                                                                geoLocations
                                                                            }
                                                                            updateTripReport={
                                                                                updateTripReport
                                                                            }
                                                                            currentTrip={
                                                                                currentTrip
                                                                            }
                                                                            selectedEvent={
                                                                                currentStop
                                                                            }
                                                                            tripReport={
                                                                                tripReport
                                                                            }
                                                                            closeModal={
                                                                                handleSetCurrentEventType
                                                                            }
                                                                            type={
                                                                                currentEventType.value
                                                                            }
                                                                            logBookConfig={
                                                                                logBookConfig
                                                                            }
                                                                            members={
                                                                                crewMembers
                                                                            }
                                                                            vessel={
                                                                                vessel
                                                                            }
                                                                            locked={
                                                                                locked ||
                                                                                !edit_tripActivity
                                                                            }
                                                                            tripReport_Stops={
                                                                                tripReport_Stops
                                                                            }
                                                                            setTripReport_Stops={
                                                                                setTripReport_Stops
                                                                            }
                                                                            displayDangerousGoods={
                                                                                displayDangerousGoodsPvpd
                                                                            }
                                                                            setDisplayDangerousGoods={
                                                                                setDisplayDangerousGoodsPvpd
                                                                            }
                                                                            displayDangerousGoodsSailing={
                                                                                displayDangerousGoodsPvpdSailing
                                                                            }
                                                                            setDisplayDangerousGoodsSailing={
                                                                                setDisplayDangerousGoodsPvpdSailing
                                                                            }
                                                                            allPVPDDangerousGoods={
                                                                                allPVPDDangerousGoods
                                                                            }
                                                                            setAllPVPDDangerousGoods={
                                                                                setAllPVPDDangerousGoods
                                                                            }
                                                                            selectedDGR={
                                                                                selectedDGRPVPD
                                                                            }
                                                                            setSelectedDGR={
                                                                                setSelectedDGRPVPD
                                                                            }
                                                                        />
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </>
                    )}
                </>
            ) : (
                <div className="bg-sllightblue-100 border border-sllightblue-200 dark:bg-sldarkblue-900 rounded-lg p-6 my-4">
                    <div>No activities recorded yet</div>
                </div>
            )}
            <div className="my-4">
                {openEventModal && !currentEvent && !currentStop ? (
                    <div className="flex flex-col md:flex-row gap-2 mb-2 items-start md:items-center">
                        <label className={classes.label}>Activity Type</label>
                        <Select
                            id="task-assigned"
                            styles={colourStyles}
                            options={
                                taskingEvents === 0
                                    ? events?.filter(
                                          (event: any) =>
                                              event?.value !==
                                                  'TaskingOnScene' &&
                                              event?.value !== 'TaskingOnTow' &&
                                              event?.value !==
                                                  'TaskingPaused' &&
                                              event?.value !==
                                                  'TaskingResumed' &&
                                              event?.value !==
                                                  'TaskingComplete',
                                      )
                                    : currentTrip?.tripEvents?.nodes.filter(
                                            (event: any) =>
                                                event?.eventCategory ===
                                                    'Tasking' &&
                                                event?.eventType_Tasking
                                                    ?.type ===
                                                    'TaskingStartUnderway' &&
                                                event?.eventType_Tasking
                                                    ?.status === 'Open',
                                        )?.length > 0
                                      ? events.filter(
                                            (event: any) =>
                                                event?.value !==
                                                'TaskingStartUnderway',
                                        )
                                      : events
                            }
                            value={currentEventType}
                            onChange={handleEventChange}
                            menuPlacement="top"
                            placeholder="Activity Type"
                            className={`${classes.selectMain} !w-full`}
                            classNames={{
                                control: () => classes.selectControl,
                                singleValue: () => classes.selectSingleValue,
                                dropdownIndicator: () =>
                                    classes.selectDropdownIndicator,
                                menu: () => classes.selectMenu,
                                option: () => classes.selectOption,
                                indicatorSeparator: () => '!hidden',
                                clearIndicator: () =>
                                    classes.selectClearIndicator,
                                valueContainer: () =>
                                    classes.selectValueContainer,
                            }}
                        />
                    </div>
                ) : (
                    <></>
                )}

                <div
                    className={`flex justify-end ${locked || !edit_tripActivity ? 'pointer-events-none opacity-60' : ''}`}>
                    <SeaLogsButton
                        className="w-48 text-sm font-semibold text-slorange-1000 bg-slorange-300 border px-3 py-2 border-transparent rounded-md shadow-sm ring-1 ring-inset ring-slorange-1000 hover:ring-sldarkblue-1000 hover:bg-sldarkblue-1000 hover:text-white "
                        action={() => {
                            if (!edit_tripActivity) {
                                toast.error(
                                    'You do not have permission to record activity',
                                )
                                return
                            }
                            setOpenEventModal(true)
                            // setCurrentEventType(false)
                            setCurrentEvent(false)
                            setCurrentStop(false)
                            setTripReport_Stops(false)
                            setDisplayDangerousGoodsPvpd(false)
                            setDisplayDangerousGoodsPvpdSailing(null)
                        }}
                        disabled={locked || !edit_tripActivity}
                        color="slorange"
                        text="Record Activity"
                    />
                </div>
            </div>
            {currentEventType && !currentEvent && !currentStop && (
                <>
                    {currentEventType.value === 'VesselRescue' && (
                        <div className="p-3 my-3 bg-white border border-sllightblue-200 rounded-lg">
                            <VesselRescue
                                offline={offline}
                                geoLocations={geoLocations}
                                currentTrip={currentTrip}
                                updateTripReport={updateTripReport}
                                selectedEvent={currentEvent}
                                tripReport={tripReport}
                                closeModal={handleSetCurrentEventType}
                                locked={locked || !edit_tripActivity}
                            />
                        </div>
                    )}
                    {currentEventType.value === 'HumanRescue' && (
                        <div className="p-3 my-3 bg-sllightblue-100 border border-sllightblue-200 rounded-lg">
                            <PersonRescue
                                offline={offline}
                                geoLocations={geoLocations}
                                currentTrip={currentTrip}
                                updateTripReport={updateTripReport}
                                selectedEvent={currentEvent}
                                tripReport={tripReport}
                                closeModal={handleSetCurrentEventType}
                                locked={locked || !edit_tripActivity}
                            />
                        </div>
                    )}
                    {currentEventType.value === 'RestrictedVisibility' && (
                        <div className="p-3 my-3 bg-sllightblue-100 border border-sllightblue-200 rounded-lg">
                            <RestrictedVisibility
                                offline={offline}
                                currentTrip={currentTrip}
                                updateTripReport={updateTripReport}
                                selectedEvent={currentEvent}
                                tripReport={tripReport}
                                closeModal={handleSetCurrentEventType}
                                logBookConfig={logBookConfig}
                                locked={locked || !edit_tripActivity}
                            />
                        </div>
                    )}
                    {currentEventType.value === 'BarCrossing' && (
                        <div className="p-3 my-3 bg-sllightblue-100 border border-sllightblue-200 rounded-lg">
                            <BarCrossing
                                offline={offline}
                                currentTrip={currentTrip}
                                updateTripReport={updateTripReport}
                                selectedEvent={currentEvent}
                                tripReport={tripReport}
                                members={crewMembers}
                                closeModal={handleSetCurrentEventType}
                                logBookConfig={logBookConfig}
                                locked={locked || !edit_tripActivity}
                            />
                        </div>
                    )}
                    {(currentEventType.value === 'PassengerArrival' ||
                        currentEventType.value === 'PassengerDeparture' ||
                        currentEventType.value === 'WaterTaxiService' ||
                        currentEventType.value ===
                            'ScheduledPassengerService') && (
                        <div className="p-3 my-3 bg-sllightblue-100 border border-sllightblue-200 rounded-lg">
                            <PassengerDropFacility
                                offline={offline}
                                geoLocations={geoLocations}
                                currentTrip={currentTrip}
                                updateTripReport={updateTripReport}
                                selectedEvent={currentEvent}
                                tripReport={tripReport}
                                closeModal={handleSetCurrentEventType}
                                type={currentEventType.value}
                                logBookConfig={logBookConfig}
                                previousDropEvent={previousDropEvent(
                                    currentEvent,
                                )}
                                vessel={vessel}
                                locked={locked || !edit_tripActivity}
                            />
                        </div>
                    )}
                    {(currentEventType.value === 'TaskingStartUnderway' ||
                        currentEventType.value === 'TaskingOnScene' ||
                        currentEventType.value === 'TaskingOnTow' ||
                        currentEventType.value === 'TaskingPaused' ||
                        currentEventType.value === 'TaskingResumed' ||
                        currentEventType.value === 'TaskingComplete') && (
                        <div className="p-3 my-3 bg-sllightblue-100 border border-sllightblue-200 rounded-lg">
                            <Tasking
                                offline={offline}
                                geoLocations={geoLocations}
                                currentTrip={currentTrip}
                                updateTripReport={updateTripReport}
                                selectedEvent={currentEvent}
                                tripReport={tripReport}
                                closeModal={handleSetCurrentEventType}
                                type={currentEventType.value}
                                logBookConfig={logBookConfig}
                                previousDropEvent={mainTaskingEvent(
                                    currentEvent,
                                )}
                                vessel={vessel}
                                members={crewMembers}
                                locked={locked || !edit_tripActivity}
                            />
                        </div>
                    )}
                    {currentEventType.value === 'CrewTraining' && (
                        <div className="p-3 my-3 bg-sllightblue-100 border border-sllightblue-200 rounded-lg">
                            <CrewTrainingEvent
                                offline={offline}
                                vesselId={+vesselID}
                                trainingTypeId={0}
                                currentTrip={currentTrip}
                                updateTripReport={updateTripReport}
                                selectedEvent={currentEvent}
                                tripReport={tripReport}
                                closeModal={handleSetCurrentEventType}
                                crewMembers={crewMembers}
                                masterID={masterID}
                                logBookConfig={logBookConfig}
                                vessels={vessels}
                                locked={locked || !edit_tripActivity}
                            />
                        </div>
                    )}
                    {currentEventType.value === 'EventSupernumerary' && (
                        <div className="p-3 my-3 bg-sllightblue-100 border border-sllightblue-200 rounded-lg">
                            <SupernumeraryEvent
                                offline={offline}
                                logBookConfig={logBookConfig}
                                locked={locked || !edit_tripActivity}
                                closeModal={handleSetCurrentEventType}
                                currentTrip={currentTrip}
                                updateTripReport={updateTripReport}
                                tripReport={tripReport}
                                selectedEvent={currentEvent}
                            />
                        </div>
                    )}
                    {currentEventType.value === 'PassengerVehiclePickDrop' && (
                        <div className="p-3 my-3 bg-sllightblue-100 border border-sllightblue-200 rounded-lg">
                            <PassengerVehiclePickDrop
                                offline={offline}
                                geoLocations={geoLocations}
                                currentTrip={currentTrip}
                                updateTripReport={updateTripReport}
                                selectedEvent={currentStop}
                                tripReport={tripReport}
                                closeModal={handleSetCurrentEventType}
                                type={currentEventType.value}
                                logBookConfig={logBookConfig}
                                members={crewMembers}
                                vessel={vessel}
                                locked={locked || !edit_tripActivity}
                                tripReport_Stops={tripReport_Stops}
                                setTripReport_Stops={setTripReport_Stops}
                                displayDangerousGoods={
                                    displayDangerousGoodsPvpd
                                }
                                setDisplayDangerousGoods={
                                    setDisplayDangerousGoodsPvpd
                                }
                                displayDangerousGoodsSailing={
                                    displayDangerousGoodsPvpdSailing
                                }
                                setDisplayDangerousGoodsSailing={
                                    setDisplayDangerousGoodsPvpdSailing
                                }
                                allPVPDDangerousGoods={allPVPDDangerousGoods}
                                setAllPVPDDangerousGoods={
                                    setAllPVPDDangerousGoods
                                }
                                selectedDGR={selectedDGRPVPD}
                                setSelectedDGR={setSelectedDGRPVPD}
                            />
                        </div>
                    )}
                    {currentEventType.value === 'RefuellingBunkering' && (
                        <div className="p-3 my-3 bg-sllightblue-100 border border-sllightblue-200 rounded-lg">
                            <RefuellingBunkering
                                offline={offline}
                                geoLocations={geoLocations}
                                currentTrip={currentTrip}
                                updateTripReport={updateTripReport}
                                selectedEvent={currentEvent}
                                tripReport={tripReport}
                                closeModal={handleSetCurrentEventType}
                                logBookConfig={logBookConfig}
                                locked={locked || !edit_tripActivity}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
