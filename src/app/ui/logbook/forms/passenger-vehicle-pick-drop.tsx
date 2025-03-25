'use client'
import { AlertDialog, SeaLogsButton } from '@/app/components/Components'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { Heading } from 'react-aria-components'
import {
    CreateTripReport_Stop,
    UpdateTripReport_Stop,
    CREATE_GEO_LOCATION,
    CreateDangerousGoodsChecklist,
    UpdateDangerousGoodsRecord,
} from '@/app/lib/graphQL/mutation'
import {
    GetDangerousGoodsRecords,
    GetTripReport_Stop,
} from '@/app/lib/graphQL/query'
import Select from 'react-select'
import { useLazyQuery, useMutation } from '@apollo/client'
import toast from 'react-hot-toast'
import { classes } from '@/app/components/GlobalClasses'
import TimeField from '../components/time'
import TripLocationField from '../components/triplocation'
import PVPDDGR from '../pvpddgr'
import DangerousGoodsRecordModel from '@/app/offline/models/dangerousGoodsRecord'
import TripReport_StopModel from '@/app/offline/models/tripReport_Stop'
import GeoLocationModel from '@/app/offline/models/geoLocation'
import DangerousGoodsChecklistModel from '@/app/offline/models/dangerousGoodsChecklist'
import { generateUniqueId } from '@/app/offline/helpers/functions'

export default function PassengerVehiclePickDrop({
    geoLocations,
    currentTrip = false,
    updateTripReport,
    selectedEvent = false,
    tripReport,
    closeModal,
    type,
    logBookConfig,
    members,
    vessel,
    locked,
    tripReport_Stops,
    setTripReport_Stops,
    displayDangerousGoods = false,
    displayDangerousGoodsSailing,
    setDisplayDangerousGoods,
    setDisplayDangerousGoodsSailing,
    allPVPDDangerousGoods,
    setAllPVPDDangerousGoods,
    selectedDGR,
    setSelectedDGR,
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
    members: any
    vessel: any
    locked: any
    tripReport_Stops: any
    setTripReport_Stops: any
    displayDangerousGoods: boolean
    displayDangerousGoodsSailing: any
    setDisplayDangerousGoods: any
    setDisplayDangerousGoodsSailing: any
    allPVPDDangerousGoods: any
    setAllPVPDDangerousGoods: any
    selectedDGR: any
    setSelectedDGR: any
    offline?: boolean
}) {
    const [locations, setLocations] = useState<any>(false)
    const [arrTime, setArrTime] = useState<any>(false)
    const [depTime, setDepTime] = useState<any>(false)
    const [cargoOnOff, setCargoOnOff] = useState<any>(false)
    const [currentEvent, setCurrentEvent] = useState<any>(selectedEvent)
    const [parentLocation, setParentLocation] = useState<any>(false)
    const [comments, setComments] = useState<any>(false)
    const [bufferDgr, setBufferDgr] = useState<any>([])
    const [dgrChecklist, setDgrChecklist] = useState<any>([])
    const [tripEvent, setTripEvent] = useState<any>(false)
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

    const dangerousGoodsRecordModel = new DangerousGoodsRecordModel()
    const tripReport_StopModel = new TripReport_StopModel()
    const geoLocationModel = new GeoLocationModel()
    const dangerousGoodsChecklistModel = new DangerousGoodsChecklistModel()

    const handleArrTimeChange = (date: any) => {
        setArrTime(dayjs(date).format('HH:mm'))
        setTripReport_Stops({
            ...tripReport_Stops,
            arriveTime: dayjs(date).format('HH:mm'),
            arrTime: dayjs(date).format('HH:mm'),
        })
    }

    const handleDepTimeChange = (date: any) => {
        setDepTime(dayjs(date).format('HH:mm'))
        setTripReport_Stops({
            ...tripReport_Stops,
            depTime: dayjs(date).format('HH:mm'),
            departTime: dayjs(date).format('HH:mm'),
        })
    }

    useEffect(() => {
        if (selectedEvent) {
            setCurrentEvent(selectedEvent)
            getCurrentTripReport_Stop(selectedEvent?.id)
        }
    }, [selectedEvent])
    const offlineCreateDangerousGoodsChecklist = async () => {
        // createDangerousGoodsChecklist
        const data = await dangerousGoodsChecklistModel.save({
            id: generateUniqueId(),
        })
        setDgrChecklist(data)
    }
    useEffect(() => {
        if (currentEvent) {
            getCurrentTripReport_Stop(currentEvent?.id)
            setDgrChecklist(currentEvent?.dangerousGoodsChecklist)
        } else {
            if (offline) {
                offlineCreateDangerousGoodsChecklist()
            } else {
                createDangerousGoodsChecklist({
                    variables: {
                        input: {},
                    },
                })
            }
        }
    }, [currentEvent])

    const getCurrentTripReport_Stop = async (id: any) => {
        if (offline) {
            // tripReport_Stop
            const event = await tripReport_StopModel.getById(id)
            if (event) {
                setDisplayDangerousGoods(
                    displayDangerousGoods
                        ? displayDangerousGoods
                        : event?.dangerousGoodsRecords?.nodes.length > 0,
                )
                setTripEvent(event)
                if (!tripReport_Stops) {
                    setBufferDgr(event?.dangerousGoodsRecords?.nodes)
                    setTripReport_Stops({
                        geoLocationID: event.stopLocationID,
                        arrTime: event?.arriveTime,
                        depTime: event.departTime,
                        paxOn: +event.paxJoined,
                        paxOff: +event.paxDeparted,
                        vehicleOn: +event.vehiclesJoined,
                        vehicleOff: +event.vehiclesDeparted,
                        otherCargo: event.otherCargo,
                        comments: event.comments,
                        lat: event.stopLocation?.lat,
                        long: event.stopLocation?.long,
                    })
                    setArrTime(event.arriveTime)
                    setDepTime(event.departTime)
                    if (event.stopLocation?.lat && event.stopLocation?.long) {
                        setCurrentLocation({
                            latitude: event.stopLocation?.lat,
                            longitude: event.stopLocation?.long,
                        })
                    }
                    if (event?.lat && event?.long) {
                        setCurrentLocation({
                            latitude: event?.lat,
                            longitude: event?.long,
                        })
                    }
                }
            }
        } else {
            tripReport_Stop({
                variables: {
                    id: id,
                },
            })
        }
    }

    const getBufferDgr = async (id: any) => {
        if (bufferDgr.length > 0) {
            const dgr = bufferDgr.map((d: any) => {
                return +d.id
            })
            if (offline) {
                // getDgrList
                const data = await dangerousGoodsRecordModel.getByIds([
                    ...dgr,
                    +id,
                ])
                setBufferDgr(data)
            } else {
                getDgrList({
                    variables: {
                        ids: [...dgr, +id],
                    },
                })
            }
        } else {
            if (offline) {
                // getDgrList
                const data = await dangerousGoodsRecordModel.getByIds([+id])
                setBufferDgr(data)
            } else {
                getDgrList({
                    variables: {
                        ids: [+id],
                    },
                })
            }
        }
    }

    const [getDgrList] = useLazyQuery(GetDangerousGoodsRecords, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            setBufferDgr(data.readDangerousGoodsRecords.nodes)
        },
        onError: (error) => {
            console.error('Error getting buffer dgr', error)
        },
    })

    const [tripReport_Stop] = useLazyQuery(GetTripReport_Stop, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const event = response.readOneTripReport_Stop
            if (event) {
                setDisplayDangerousGoods(
                    displayDangerousGoods
                        ? displayDangerousGoods
                        : event?.dangerousGoodsRecords?.nodes.length > 0,
                )
                setDisplayDangerousGoodsSailing(
                    displayDangerousGoodsSailing !== null
                        ? displayDangerousGoodsSailing
                        : event?.designatedDangerousGoodsSailing,
                )
                setTripEvent(event)
                if (!tripReport_Stops) {
                    setBufferDgr(event?.dangerousGoodsRecords?.nodes)
                    setTripReport_Stops({
                        geoLocationID: event.stopLocationID,
                        arrTime: event?.arriveTime,
                        depTime: event.departTime,
                        paxOn: +event.paxJoined,
                        paxOff: +event.paxDeparted,
                        vehicleOn: +event.vehiclesJoined,
                        vehicleOff: +event.vehiclesDeparted,
                        otherCargo: event.otherCargo,
                        comments: event.comments,
                        lat: event.stopLocation?.lat,
                        long: event.stopLocation?.long,
                        designatedDangerousGoodsSailing:
                            event.designatedDangerousGoodsSailing,
                    })
                    setArrTime(event.arriveTime)
                    setDepTime(event.departTime)
                    if (event.stopLocation?.lat && event.stopLocation?.long) {
                        setCurrentLocation({
                            latitude: event.stopLocation?.lat,
                            longitude: event.stopLocation?.long,
                        })
                    }
                    if (event?.lat && event?.long) {
                        setCurrentLocation({
                            latitude: event?.lat,
                            longitude: event?.long,
                        })
                    }
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
                arriveTime: arrTime ? arrTime : tripReport_Stops?.arriveTime,
                departTime: depTime ? depTime : tripReport_Stops?.departTime,
                paxJoined: +tripReport_Stops?.paxOn,
                paxDeparted: +tripReport_Stops?.paxOff,
                vehiclesJoined: +tripReport_Stops?.vehicleOn,
                vehiclesDeparted: +tripReport_Stops?.vehicleOff,
                stopLocationID: tripReport_Stops?.geoLocationID,
                otherCargo: tripReport_Stops?.otherCargo,
                comments: tripReport_Stops?.comments,
                lat: currentLocation.latitude.toString(),
                long: currentLocation.longitude.toString(),
                dangerousGoodsChecklistID: dgrChecklist?.id,
                designatedDangerousGoodsSailing: displayDangerousGoodsSailing,
            },
        }
        if (currentEvent) {
            if (offline) {
                // updateTripReport_Stop
                const data = await tripReport_StopModel.save({
                    id: +selectedEvent?.id,
                    ...variables.input,
                })
                getCurrentTripReport_Stop(data?.id)
                updateTripReport({
                    id: [
                        ...tripReport.map((trip: any) => trip.id),
                        currentTrip.id,
                    ],
                })
            } else {
                updateTripReport_Stop({
                    variables: {
                        input: {
                            id: +selectedEvent?.id,
                            ...variables.input,
                        },
                    },
                })
            }
        } else {
            if (offline) {
                // createTripReport_Stop
                const data = await tripReport_StopModel.save({
                    ...variables.input,
                    logBookEntrySectionID: currentTrip.id,
                    id: generateUniqueId(),
                })
                getCurrentTripReport_Stop(data?.id)
                if (bufferDgr.length > 0) {
                    Promise.all(
                        bufferDgr.map(async (dgr: any) => {
                            // updateDangerousGoodsRecord
                            const dgrData =
                                await dangerousGoodsRecordModel.save({
                                    id: dgr.id,
                                    tripReport_StopID: data.id,
                                    type: dgr.type,
                                    comment: dgr.comment,
                                })
                            toast.remove()
                            currentEvent?.id > 0
                                ? getCurrentTripReport_Stop(currentEvent?.id)
                                : getBufferDgr(dgrData.id)
                            // createDangerousGoodsChecklist
                            const dgChecklistData =
                                await dangerousGoodsChecklistModel.save({
                                    id: generateUniqueId(),
                                    tripReport_StopID: data.id,
                                    vesselSecuredToWharf:
                                        dgrChecklist?.vesselSecuredToWharf,
                                    bravoFlagRaised:
                                        dgrChecklist?.bravoFlagRaised,
                                    twoCrewLoadingVessel:
                                        dgrChecklist?.twoCrewLoadingVessel,
                                    fireHosesRiggedAndReady:
                                        dgrChecklist?.fireHosesRiggedAndReady,
                                    noSmokingSignagePosted:
                                        dgrChecklist?.noSmokingSignagePosted,
                                    spillKitAvailable:
                                        dgrChecklist?.spillKitAvailable,
                                    fireExtinguishersAvailable:
                                        dgrChecklist?.fireExtinguishersAvailable,
                                    dgDeclarationReceived:
                                        dgrChecklist?.dgDeclarationReceived,
                                    loadPlanReceived:
                                        dgrChecklist?.loadPlanReceived,
                                    msdsAvailable: dgrChecklist?.msdsAvailable,
                                    anyVehiclesSecureToVehicleDeck:
                                        dgrChecklist?.anyVehiclesSecureToVehicleDeck,
                                    safetyAnnouncement:
                                        dgrChecklist?.safetyAnnouncement,
                                    vehicleStationaryAndSecure:
                                        dgrChecklist?.vehicleStationaryAndSecure,
                                })
                            setDgrChecklist(dgChecklistData)
                        }),
                    )
                }
                updateTripReport({
                    id: [
                        ...tripReport.map((trip: any) => trip.id),
                        currentTrip.id,
                    ],
                })
                closeModal()
            } else {
                createTripReport_Stop({
                    variables: {
                        input: {
                            ...variables.input,
                            logBookEntrySectionID: currentTrip.id,
                        },
                    },
                })
            }
        }
    }

    const [createDangerousGoodsChecklist] = useMutation(
        CreateDangerousGoodsChecklist,
        {
            onCompleted: (response) => {
                const data = response.createDangerousGoodsChecklist
                setDgrChecklist(data)
            },
            onError: (error) => {
                console.error('Error creating dangerous goods', error)
            },
        },
    )

    const [updateDangerousGoodsRecord] = useMutation(
        UpdateDangerousGoodsRecord,
        {
            onCompleted: (response) => {
                const data = response.updateDangerousGoodsRecord
                toast.remove()
                currentEvent?.id > 0
                    ? getCurrentTripReport_Stop(currentEvent?.id)
                    : getBufferDgr(data.id)
            },
            onError: (error) => {
                console.error('Error updating dangerous goods record', error)
            },
        },
    )

    const [createTripReport_Stop] = useMutation(CreateTripReport_Stop, {
        onCompleted: (response) => {
            const data = response.createTripReport_Stop
            getCurrentTripReport_Stop(data?.id)
            if (bufferDgr.length > 0) {
                bufferDgr.map((dgr: any) => {
                    updateDangerousGoodsRecord({
                        variables: {
                            input: {
                                id: dgr.id,
                                tripReport_StopID: data.id,
                                type: dgr.type,
                                comment: dgr.comment,
                            },
                        },
                    })
                    createDangerousGoodsChecklist({
                        variables: {
                            input: {
                                tripReport_StopID: data.id,
                                vesselSecuredToWharf:
                                    dgrChecklist?.vesselSecuredToWharf,
                                bravoFlagRaised: dgrChecklist?.bravoFlagRaised,
                                twoCrewLoadingVessel:
                                    dgrChecklist?.twoCrewLoadingVessel,
                                fireHosesRiggedAndReady:
                                    dgrChecklist?.fireHosesRiggedAndReady,
                                noSmokingSignagePosted:
                                    dgrChecklist?.noSmokingSignagePosted,
                                spillKitAvailable:
                                    dgrChecklist?.spillKitAvailable,
                                fireExtinguishersAvailable:
                                    dgrChecklist?.fireExtinguishersAvailable,
                                dgDeclarationReceived:
                                    dgrChecklist?.dgDeclarationReceived,
                                loadPlanReceived:
                                    dgrChecklist?.loadPlanReceived,
                                msdsAvailable: dgrChecklist?.msdsAvailable,
                                anyVehiclesSecureToVehicleDeck:
                                    dgrChecklist?.anyVehiclesSecureToVehicleDeck,
                                safetyAnnouncement:
                                    dgrChecklist?.safetyAnnouncement,
                                vehicleStationaryAndSecure:
                                    dgrChecklist?.vehicleStationaryAndSecure,
                            },
                        },
                    })
                })
            }
            updateTripReport({
                id: [...tripReport.map((trip: any) => trip.id), currentTrip.id],
            })
            closeModal()
        },
        onError: (error) => {
            console.error('Error creating passenger drop facility', error)
        },
    })

    const [updateTripReport_Stop] = useMutation(UpdateTripReport_Stop, {
        onCompleted: (response) => {
            const data = response.updateTripReport_Stop
            getCurrentTripReport_Stop(data?.id)
            updateTripReport({
                id: [...tripReport.map((trip: any) => trip.id), currentTrip.id],
            })
        },
        onError: (error) => {
            console.error('Error updating passenger drop facility', error)
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
            setTripReport_Stops({
                ...tripReport_Stops,
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
                // createGeoLocation
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
                setTripReport_Stops({
                    ...tripReport_Stops,
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
            setTripReport_Stops({
                ...tripReport_Stops,
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

    return (
        <div className="w-full">
            <p className="text-xs font-inter max-w-[40rem] leading-loose">
                For recording trip stops where passengers, cargo and/or vehicles
                maybe getting on and off.
            </p>
            {displayField(type + 'Location') && (
                <div className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                    <label className={classes.label}>
                        Location of trip stop
                    </label>
                    <TripLocationField
                        offline={offline}
                        currentTrip={currentTrip}
                        tripReport={tripReport}
                        setCurrentLocation={setCurrentLocation}
                        handleLocationChange={handleLocationChange}
                        currentLocation={currentLocation}
                        currentEvent={{
                            geoLocationID: tripReport_Stops?.geoLocationID,
                            lat: tripReport_Stops?.lat,
                            long: tripReport_Stops?.long,
                        }}
                        geoLocations={geoLocations}
                    />
                </div>
            )}
            {displayField(type + 'Arrival') && (
                <div
                    className={`${locked ? 'pointer-events-none' : ''} my-4 flex flex-col md:flex-row items-start md:items-center`}>
                    <label className={classes.label}>Arrival Time</label>
                    <TimeField
                        time={
                            arrTime ? arrTime : tripReport_Stops?.arrTime ?? ''
                        }
                        handleTimeChange={handleArrTimeChange}
                        timeID="arrival-time"
                        fieldName="Arrival Time"
                    />
                </div>
            )}
            {displayField(type + 'Departure') && (
                <div
                    className={`${locked ? 'pointer-events-none' : ''} my-4 flex flex-col md:flex-row items-start md:items-center`}>
                    <label className={classes.label}>Departure Time</label>
                    <TimeField
                        time={
                            depTime ? depTime : tripReport_Stops?.depTime ?? ''
                        }
                        handleTimeChange={handleDepTimeChange}
                        timeID="departure-time"
                        fieldName="Departure Time"
                    />
                </div>
            )}
            {displayField(type + 'PaxPickDrop') && (
                <div
                    className={`${locked ? 'pointer-events-none' : ''} my-4 flex flex-row gap-4 w-full`}>
                    <div className="w-full">
                        <label className={classes.label}>Passengers on</label>
                        <input
                            id="paxOn"
                            name="paxOn"
                            type="number"
                            value={tripReport_Stops?.paxOn}
                            className={classes.input}
                            placeholder="Pax on"
                            min="0"
                            onChange={(e) =>
                                setTripReport_Stops({
                                    ...tripReport_Stops,
                                    paxOn: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="w-full">
                        <label className={classes.label}>Passengers off</label>
                        <input
                            id="paxOff"
                            name="paxOff"
                            type="number"
                            value={tripReport_Stops?.paxOff}
                            className={classes.input}
                            placeholder="Pax off"
                            min="0"
                            onChange={(e) =>
                                setTripReport_Stops({
                                    ...tripReport_Stops,
                                    paxOff: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>
            )}
            {displayField(type + 'VehiclePickDrop') && (
                <div
                    className={`${locked ? 'pointer-events-none' : ''} my-4 flex flex-row gap-4 w-full`}>
                    <div className="w-full">
                        <label className={classes.label}>Vehicles on</label>
                        <input
                            id="vehicleOn"
                            name="vehicleOn"
                            type="number"
                            value={tripReport_Stops?.vehicleOn}
                            className={classes.input}
                            placeholder="Vehicles getting on"
                            min="0"
                            onChange={(e) =>
                                setTripReport_Stops({
                                    ...tripReport_Stops,
                                    vehicleOn: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="w-full">
                        <label className={classes.label}>Vehicles off</label>
                        <input
                            id="vehicleOff"
                            name="vehicleOff"
                            type="number"
                            value={tripReport_Stops?.vehicleOff}
                            className={classes.input}
                            placeholder="Vehicles getting off"
                            min="0"
                            onChange={(e) =>
                                setTripReport_Stops({
                                    ...tripReport_Stops,
                                    vehicleOff: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>
            )}
            {displayField(type + 'OtherCargo') && (
                <div
                    className={`${locked ? 'pointer-events-none' : ''} my-4 flex-col`}>
                    <label className={classes.label}>Cargo (if any)</label>
                    <textarea
                        id={`cargo-onOff`}
                        rows={4}
                        className={classes.textarea}
                        placeholder="Other cargo on and off"
                        value={
                            cargoOnOff
                                ? cargoOnOff
                                : tripReport_Stops?.otherCargo
                        }
                        onChange={(e) => {
                            setCargoOnOff(e.target.value)
                        }}
                        onBlur={(e) => {
                            setTripReport_Stops({
                                ...tripReport_Stops,
                                otherCargo: e.target.value,
                            })
                        }}
                    />
                </div>
            )}
            {vessel?.vesselSpecifics?.carriesDangerousGoods && (
                <PVPDDGR
                    offline={offline}
                    locked={locked}
                    currentTrip={currentTrip}
                    updateTripReport={updateTripReport}
                    tripReport={tripReport}
                    logBookConfig={logBookConfig}
                    selectedDGR={selectedDGR}
                    setSelectedDGR={setSelectedDGR}
                    members={members}
                    displayDangerousGoods={displayDangerousGoods}
                    setDisplayDangerousGoods={setDisplayDangerousGoods}
                    displayDangerousGoodsSailing={displayDangerousGoodsSailing}
                    setDisplayDangerousGoodsSailing={
                        setDisplayDangerousGoodsSailing
                    }
                    allDangerousGoods={allPVPDDangerousGoods}
                    setAllDangerousGoods={setAllPVPDDangerousGoods}
                    currentEvent={tripEvent}
                />
            )}
            <div className={`${locked ? 'pointer-events-none' : ''} my-4`}>
                <textarea
                    id={`comments`}
                    rows={4}
                    className={classes.textarea}
                    placeholder="Comments"
                    value={comments ? comments : tripReport_Stops?.comments}
                    onChange={(e) => {
                        setComments(e.target.value)
                    }}
                    onBlur={(e) => {
                        setTripReport_Stops({
                            ...tripReport_Stops,
                            comments: e.target.value,
                        })
                    }}
                />
            </div>
            <div className="flex justify-end">
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
            </div>
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
        </div>
    )
}
