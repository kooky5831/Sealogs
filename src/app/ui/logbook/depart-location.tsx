'use client'

import {
    AlertDialog,
    PopoverWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import React, { useState, useEffect } from 'react'
import { Button, Popover, Heading, DialogTrigger } from 'react-aria-components'
import Select from 'react-select'
import {
    CREATE_GEO_LOCATION,
    CreateFavoriteLocation,
    UpdateTripReport_LogBookEntrySection,
} from '@/app/lib/graphQL/mutation'
import { useLazyQuery, useMutation } from '@apollo/client'
import toast, { Toaster } from 'react-hot-toast'
import { classes } from '@/app/components/GlobalClasses'
import { GetFavoriteLocations } from '@/app/lib/graphQL/query'
import FavoriteLocationModel from '@/app/offline/models/favoriteLocation'
import TripReport_LogBookEntrySectionModel from '@/app/offline/models/tripReport_LogBookEntrySection'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import GeoLocationModel from '@/app/offline/models/geoLocation'

export default function DepartLocation({
    geoLocations = false,
    currentTrip,
    updateTripReport,
    tripReport,
    templateStyle = false,
    offline = false,
}: {
    geoLocations: any
    currentTrip: any
    updateTripReport?: any
    tripReport: any
    templateStyle: boolean | string
    offline?: boolean
}) {
    const favoriteLocationModel = new FavoriteLocationModel()
    const tripReportModel = new TripReport_LogBookEntrySectionModel()
    const geoLocationModel = new GeoLocationModel()
    const [showLocation, setShowLocation] = useState(false)
    const [newLocation, setNewLocation] = useState(false)
    const [closestLocation, setClosestLocation] = useState<any>(false)
    const [selectedLocation, setSelectedLocation] = useState<any>(false)
    const [favoriteLocations, setFavoriteLocations] = useState<any>([])
    const [selectedParentLocation, setSelectedParentLocation] =
        useState<any>(false)
    const [locations, setLocations] = useState<any>()
    const [openNewLocationDialog, setOpenNewLocationDialog] =
        useState<boolean>(false)
    const [openSetLocationDialog, setOpenSetLocationDialog] =
        useState<boolean>(false)
    const [location, setLocation] = useState<{
        latitude: number
        longitude: number
    }>({ latitude: 0, longitude: 0 })

    const displayNewLocation = () => {
        setNewLocation(true)
        setShowLocation(false)
    }

    const hideNewLocation = () => {
        setShowLocation(false)
        setNewLocation(false)
    }

    const getOfflineFavoriteLocations = async () => {
        if (selectedLocation) {
            await tripReportModel.save({
                id: currentTrip.id,
                fromLocationID: selectedLocation.value,
            })
            toast.success('Location updated successfully')
            if (+localStorage.getItem('userId')! > 0) {
                await favoriteLocationModel.save({
                    id: generateUniqueId(),
                    memberID: +localStorage.getItem('userId')!,
                    geoLocationID: +selectedLocation.value,
                })
            }
            const locations = await favoriteLocationModel.getByMemberID(
                localStorage.getItem('userId')!,
            )
            setFavoriteLocations(locations)
        }
    }
    useEffect(() => {
        if (offline) {
            getOfflineFavoriteLocations()
        } else {
            getFavoriteLocations({
                variables: {
                    memberID: +localStorage.getItem('userId')!,
                },
            })
        }
    }, [])

    const [getFavoriteLocations] = useLazyQuery(GetFavoriteLocations, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            updateTripReport_LogBookEntrySectionLocationID({
                variables: {
                    input: {
                        id: currentTrip.id,
                        fromLocationID: selectedLocation.value,
                    },
                },
            })

            if (+localStorage.getItem('userId')! > 0) {
                createFavoriteLocation({
                    variables: {
                        input: {
                            memberID: +localStorage.getItem('userId')!,
                            geoLocationID: +selectedLocation.value,
                        },
                    },
                })
            }
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const getSelectedLocation = () => {
        if (selectedLocation) return selectedLocation
        if (tripReport) {
            const trip = tripReport?.find(
                (trip: any) => trip.id === currentTrip.id,
            )
            if (trip?.fromLocation?.id > 0) {
                return {
                    label: trip.fromLocation.title,
                    value: trip.fromLocation.id,
                    latitude: trip.fromLocation.lat,
                    longitude: trip.fromLocation.long,
                }
            }
        }
        return selectedLocation
    }

    useEffect(() => {
        if (tripReport) {
            setSelectedLocation(false)
            const trip = tripReport.find(
                (trip: any) => trip.id === currentTrip.id,
            )
            if (trip?.fromLocation?.id > 0) {
                setSelectedLocation({
                    label: trip.fromLocation.title,
                    value: trip.fromLocation.id,
                    latitude: trip.fromLocation.lat,
                    longitude: trip.fromLocation.long,
                })
                setLocation({
                    latitude: trip.fromLocation.lat,
                    longitude: trip.fromLocation.long,
                })
                setShowLocation(false)
            } else {
                if (trip?.fromLat != 0 && trip?.fromLong != 0) {
                    setLocation({
                        latitude: trip?.fromLat,
                        longitude: trip?.fromLong,
                    })
                    setShowLocation(true)
                }
            }
        }
    }, [tripReport])

    const handleLocationChange = async (selectedLocation: any) => {
        if (selectedLocation.value === 'newLocation') {
            setSelectedParentLocation(false)
            setOpenNewLocationDialog(true)
        } else {
            setSelectedLocation(selectedLocation)
            if (offline) {
                const data = await tripReportModel.save({
                    id: currentTrip.id,
                    fromLocationID: selectedLocation.value,
                })
                updateTripReport({
                    id: [...tripReport.map((trip: any) => trip.id), data.id],
                    currentTripID: currentTrip.id,
                    key: 'fromLocationID',
                    value: selectedLocation.value,
                })
                toast.success('Location updated successfully')
            } else {
                updateTripReport_LogBookEntrySectionLocationID({
                    variables: {
                        input: {
                            id: currentTrip.id,
                            fromLocationID: selectedLocation.value,
                        },
                    },
                })
            }

            if (+localStorage.getItem('userId')! > 0) {
                if (offline) {
                    await favoriteLocationModel.save({
                        id: generateUniqueId(),
                        memberID: +localStorage.getItem('userId')!,
                        geoLocationID: +selectedLocation.value,
                    })
                    const locations = await favoriteLocationModel.getByMemberID(
                        localStorage.getItem('userId')!,
                    )
                    setFavoriteLocations(locations)
                } else {
                    createFavoriteLocation({
                        variables: {
                            input: {
                                memberID: +localStorage.getItem('userId')!,
                                geoLocationID: +selectedLocation.value,
                            },
                        },
                    })
                }
            }
        }
    }

    const [createFavoriteLocation] = useMutation(CreateFavoriteLocation, {
        onCompleted: (data) => {},
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const handleParentLocationChange = (selectedLocation: any) => {
        setSelectedParentLocation(selectedLocation)
    }

    const handleCreateNewLocation = async () => {
        const title = (
            document.getElementById('new-location-title') as HTMLInputElement
        )?.value
        const parentLocation = selectedParentLocation
            ? selectedParentLocation.value
            : null
        const latitude = (
            document.getElementById('new-location-latitude') as HTMLInputElement
        )?.value
        const longitude = (
            document.getElementById(
                'new-location-longitude',
            ) as HTMLInputElement
        )?.value

        const variables = {
            title: title,
            lat: +latitude,
            long: +longitude,
            parentLocationID: parentLocation,
        }

        if (offline) {
            const data = await geoLocationModel.save({
                ...variables,
                id: generateUniqueId(),
            })
            if (locations?.length > 0) {
                setLocations([...locations, data])
            } else {
                setLocations([data])
            }
            setSelectedLocation({
                label: data.title,
                value: data.id,
                latitude: data.lat,
                longitude: data.long,
            })
            setOpenNewLocationDialog(false)
            setOpenSetLocationDialog(false)
        } else {
            if (offline) {
                const data = await geoLocationModel.save({
                    ...variables,
                    id: generateUniqueId(),
                })
                if (locations?.length > 0) {
                    setLocations([...locations, data])
                } else {
                    setLocations([data])
                }
                setSelectedLocation({
                    label: data.title,
                    value: data.id,
                    latitude: data.lat,
                    longitude: data.long,
                })
                setOpenNewLocationDialog(false)
                setOpenSetLocationDialog(false)
            } else {
                createGeoLocation({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }

    const [createGeoLocation] = useMutation(CREATE_GEO_LOCATION, {
        onCompleted: (response) => {
            const data = response.createGeoLocation
            if (locations?.length > 0) {
                setLocations([...locations, data])
            } else {
                setLocations([data])
            }
            setSelectedLocation({
                label: data.title,
                value: data.id,
                latitude: data.lat,
                longitude: data.long,
            })
            setOpenNewLocationDialog(false)
            setOpenSetLocationDialog(false)
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const allLocations = () => {
        if (geoLocations && locations?.length > 0) {
            return sortLocations([
                ...locations,
                ...geoLocations?.map((location: any) => ({
                    label: location.title,
                    value: location.id,
                    latitude: location.lat,
                    longitude: location.long,
                })),
            ])
        } else {
            return sortLocations([
                ...geoLocations?.map((location: any) => ({
                    label: location.title,
                    value: location.id,
                    latitude: location.lat,
                    longitude: location.long,
                })),
            ])
        }
    }

    const sortLocations = (locations: any) => {
        favoriteLocations.length > 0
            ? locations.sort((a: any, b: any) => {
                  const aFav = favoriteLocations.find(
                      (fav: any) => fav.geoLocationID === a.value,
                  )
                  const bFav = favoriteLocations.find(
                      (fav: any) => fav.geoLocationID === b.value,
                  )
                  if (aFav && bFav) {
                      return bFav.usage - aFav.usage
                  } else if (aFav) {
                      return -1
                  } else if (bFav) {
                      return 1
                  }
                  return 0
              })
            : locations
        return locations
    }

    const getProximity = (location: any, latitude: any, longitude: any) => {
        const distance = Math.sqrt(
            Math.pow(location.lat - latitude, 2) +
                Math.pow(location.long - longitude, 2),
        )
        return distance
    }

    const findClosestLocation = async (latitude: any, longitude: any) => {
        const closestLocation = geoLocations.reduce((prev: any, curr: any) => {
            const prevDistance = Math.sqrt(
                Math.pow(prev.lat - latitude, 2) +
                    Math.pow(prev.long - longitude, 2),
            )
            const currDistance = Math.sqrt(
                Math.pow(curr.lat - latitude, 2) +
                    Math.pow(curr.long - longitude, 2),
            )
            return prevDistance < currDistance ? prev : curr
        })
        const proximity = getProximity(closestLocation, latitude, longitude)
        toast.remove()
        setClosestLocation({
            label: closestLocation.title,
            value: closestLocation.id,
            latitude: closestLocation.lat,
            longitude: closestLocation.long,
        })
        if (
            proximity > 0.15 ||
            (closestLocation.lat === 0 && closestLocation.long === 0)
        ) {
            toast.error('No location found within 10 KM radius!')
            return
        }
        if (offline) {
            await tripReportModel.save({
                id: currentTrip.id,
                fromLocationID: closestLocation.id,
            })
            toast.success('Location updated successfully')
        } else {
            updateTripReport_LogBookEntrySectionLocationID({
                variables: {
                    input: {
                        id: currentTrip.id,
                        fromLocationID: closestLocation.id,
                    },
                },
            })
        }
    }

    const handleSetCurrentLocation = () => {
        toast.loading('Getting your current location...')
        setOpenSetLocationDialog(true)
        if ('geolocation' in navigator) {
            const options = {
                timeout: 30000, // 30 seconds
            }
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    const { latitude, longitude } = coords
                    setLocation({ latitude, longitude })
                    findClosestLocation(latitude, longitude)
                },
                (error) => {
                    toast.remove()
                    toast.error('Failed to get current location')
                },
                options,
            )
        } else {
            toast.error('Geolocation is not supported by your browser')
        }
    }

    const [updateTripReport_LogBookEntrySectionLocationID] = useMutation(
        UpdateTripReport_LogBookEntrySection,
        {
            onCompleted: (data) => {
                toast.success('Location updated successfully')
            },
            onError: (error) => {
                console.error('onError', error)
            },
        },
    )

    const [updateTripReport_LogBookEntrySectionLocation] = useMutation(
        UpdateTripReport_LogBookEntrySection,
        {
            onCompleted: (data) => {
                toast.success('Location updated successfully')
            },
            onError: (error) => {
                console.error('onError', error)
            },
        },
    )

    const handleSetLocation = async () => {
        if (offline) {
            await tripReportModel.save({
                id: currentTrip.id,
                fromLocationID: closestLocation.id,
            })
            toast.success('Location updated successfully')
        } else {
            updateTripReport_LogBookEntrySectionLocationID({
                variables: {
                    input: {
                        id: currentTrip.id,
                        fromLocationID: closestLocation.id,
                    },
                },
            })
        }
        setSelectedLocation(closestLocation)
        setOpenSetLocationDialog(false)
    }

    const updateLocationCoordinates = async () => {
        const latitude = (
            document.getElementById('latitude') as HTMLInputElement
        ).value
        const longitude = (
            document.getElementById('longitude') as HTMLInputElement
        ).value
        setLocation({ latitude: +latitude, longitude: +longitude })
        if (offline) {
            await tripReportModel.save({
                id: currentTrip.id,
                fromLat: +latitude,
                fromLong: +longitude,
                fromLocationID: 0,
            })
            toast.success('Location updated successfully')
        } else {
            updateTripReport_LogBookEntrySectionLocation({
                variables: {
                    input: {
                        id: currentTrip.id,
                        fromLat: +latitude,
                        fromLong: +longitude,
                        fromLocationID: 0,
                    },
                },
            })
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center">
            {templateStyle === false && (
                <label className="md:block pb-1 md:pb-0">Depart Location</label>
            )}
            <div
                className={`${templateStyle === false ? 'grid-cols-1 md:col-span-2 lg:col-span-3' : 'grid-cols-1 md:col-span-3 lg:col-span-4'} flex flex-col`}>
                <div className="flex md:items-center flex-col md:flex-row gap-4">
                    {geoLocations && !showLocation && (
                        <Select
                            id="depart-location"
                            options={
                                geoLocations
                                    ? [
                                          {
                                              label: ' --- Add New Location --- ',
                                              value: 'newLocation',
                                          },
                                          ...allLocations(),
                                      ]
                                    : [
                                          {
                                              label: ' --- Add New Location --- ',
                                              value: 'newLocation',
                                          },
                                      ]
                            }
                            value={getSelectedLocation()}
                            onChange={handleLocationChange}
                            menuPlacement="top"
                            placeholder="Select Location"
                            className={`${classes.selectMain} md:w-64`}
                            classNames={{
                                control: () =>
                                    'flex py-0.5 md:w-64 !text-sm !bg-transparent !rounded-lg !border !border-slblue-200 focus:ring-slblue-500 focus:border-slblue-500 dark:placeholder-slblue-400 !dark:focus:ring-slblue-500 !dark:focus:border-slblue-500',
                                singleValue: () => 'dark:!text-white',
                                menu: () => 'dark:bg-slblue-800',
                                option: () => classes.selectOption,
                            }}
                        />
                    )}
                    {showLocation && (
                        <div className="flex gap-4">
                            <div>
                                <input
                                    id="latitude"
                                    name="latitude"
                                    type="number"
                                    value={location.latitude}
                                    onBlur={updateLocationCoordinates}
                                    onChange={(e) =>
                                        setLocation({
                                            ...location,
                                            latitude: +e.target.value,
                                        })
                                    }
                                    className={`${classes.input} min-w-64`}
                                    aria-describedby="latitude-error"
                                    placeholder="Latitude"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    id="longitude"
                                    name="longitude"
                                    type="number"
                                    value={location.longitude}
                                    onBlur={updateLocationCoordinates}
                                    onChange={(e) =>
                                        setLocation({
                                            ...location,
                                            longitude: +e.target.value,
                                        })
                                    }
                                    className={`${classes.input} min-w-64`}
                                    aria-describedby="longitude-error"
                                    required
                                    placeholder="Longitude"
                                />
                            </div>
                            <SeaLogsButton
                                className=""
                                text="Use Location"
                                type="text"
                                action={hideNewLocation}
                            />
                        </div>
                    )}
                    <div className="flex flex-row gap-3 w-full md:w-auto">
                        {!showLocation && (
                            <>
                                <SeaLogsButton
                                    text="Use Coordinates"
                                    type="secondary"
                                    color="sllightblue"
                                    action={() => setShowLocation(true)}
                                    className="!mr-0 grow"
                                />
                                <SeaLogsButton
                                    text="Current Location"
                                    type="secondary"
                                    color="sllightblue"
                                    action={handleSetCurrentLocation}
                                    className="!mr-0 grow"
                                />
                                <DialogTrigger>
                                    <SeaLogsButton
                                        icon="alert"
                                        className="w-6 h-6 sup -mt-2 ml-0.5"
                                    />
                                    <Popover>
                                        <PopoverWrapper>
                                            This automatically sets the nearest
                                            location available in locations list
                                            using your current GPS location.
                                        </PopoverWrapper>
                                    </Popover>
                                </DialogTrigger>
                            </>
                        )}
                    </div>
                </div>
                {newLocation && (
                    <div className="flex flex-col gap-3 mt-5 flex-wrap">
                        <Heading className="text-lg">Add New Location</Heading>
                        <div className="flex flex-row gap-3 flex-wrap">
                            <div>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    className={classes.input}
                                    aria-describedby="title-error"
                                    required
                                    placeholder="Title"
                                />
                            </div>
                            <div>
                                <input
                                    id="shortcode"
                                    name="shortcode"
                                    type="text"
                                    className={classes.input}
                                    aria-describedby="shortcode-error"
                                    required
                                    placeholder="Shortcode"
                                />
                            </div>
                            <div>
                                <input
                                    id="parent-location"
                                    name="parent-location"
                                    type="text"
                                    className={classes.input}
                                    aria-describedby="parent-location-error"
                                    required
                                    placeholder="Parent Location"
                                />
                            </div>
                            <div>
                                <input
                                    id="latitude"
                                    name="latitude"
                                    type="text"
                                    defaultValue={location.latitude}
                                    className={classes.input}
                                    aria-describedby="latitude-error"
                                    required
                                    placeholder="Latitude"
                                />
                            </div>
                            <div>
                                <input
                                    id="longitude"
                                    name="longitude"
                                    type="text"
                                    defaultValue={location.longitude}
                                    className={classes.input}
                                    aria-describedby="longitude-error"
                                    required
                                    placeholder="Longitude"
                                />
                            </div>
                            <div>
                                <input
                                    id="sort-order"
                                    name="sort-order"
                                    type="text"
                                    className={classes.input}
                                    aria-describedby="sort-order-error"
                                    required
                                    placeholder="Sort Order"
                                />
                            </div>
                        </div>
                        <div className="flex flex-row gap-3 flex-wrap">
                            <Button className="w-64 mt-3 text-white bg-slblue-700 hover:bg-slblue-800 focus:outline-none focus:ring-4 focus:ring-slblue-300 font-medium rounded text-sm px-2 py-2 text-center dark:bg-slblue-600 dark:hover:bg-slblue-700 dark:focus:ring-slblue-800">
                                Save Location
                            </Button>
                            <Button
                                className="w-64 mt-3 text-white bg-slblue-700 hover:bg-slblue-800 focus:outline-none focus:ring-4 focus:ring-slblue-300 font-medium rounded text-sm px-2 py-2 text-center dark:bg-slblue-600 dark:hover:bg-slblue-700 dark:focus:ring-slblue-800"
                                onPress={hideNewLocation}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <AlertDialog
                openDialog={openNewLocationDialog}
                setOpenDialog={setOpenNewLocationDialog}
                actionText="Add New Location"
                handleCreate={handleCreateNewLocation}>
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2">
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
                        options={geoLocations ? allLocations() : []}
                        onChange={handleParentLocationChange}
                        menuPlacement="top"
                        placeholder="Parent Location (Optional)"
                        className="w-full bg-slblue-100 rounded dark:bg-slblue-800 text-sm"
                        classNames={{
                            control: () =>
                                'flex py-1 w-full !text-sm !bg-transparent !rounded-lg !border !border-slblue-200 focus:ring-slblue-500 focus:border-slblue-500 dark:placeholder-slblue-400 !dark:focus:ring-slblue-500 !dark:focus:border-slblue-500',
                            singleValue: () => 'dark:!text-white',
                            dropdownIndicator: () => '!p-0 !hidden',
                            menu: () => 'dark:bg-slblue-800',
                            indicatorSeparator: () => '!hidden',
                            multiValue: () =>
                                '!bg-sllightblue-100 inline-flex rounded p-1 m-0 !mr-1.5 border border-sllightblue-200 !rounded-md mr-2',
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
            <AlertDialog
                openDialog={openSetLocationDialog}
                setOpenDialog={setOpenSetLocationDialog}
                actionText="Create location"
                handleCreate={handleCreateNewLocation}>
                {closestLocation?.label != undefined ? (
                    <>
                        <div className="mb-2">
                            Are you in {closestLocation?.label}?
                        </div>
                        <SeaLogsButton
                            text={`Use ${closestLocation?.label}`}
                            type="secondary"
                            color="sllightblue"
                            action={handleSetLocation}
                            className="!mr-0"
                        />
                        <hr className="my-4" />
                        <div className="">
                            or alternatively do you want to save location?2
                        </div>
                    </>
                ) : (
                    <div className="">
                        Fetching current location took long, do you want to
                        create a new location instead?
                    </div>
                )}
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
                        options={geoLocations ? allLocations() : []}
                        onChange={handleParentLocationChange}
                        menuPlacement="top"
                        placeholder="Parent Location (Optional)"
                        className="w-full bg-slblue-100 rounded dark:bg-slblue-800 text-sm"
                        classNames={{
                            control: () =>
                                'flex py-1 w-full !text-sm !bg-transparent !rounded-lg !border !border-slblue-200 focus:ring-slblue-500 focus:border-slblue-500 dark:placeholder-slblue-400 !dark:focus:ring-slblue-500 !dark:focus:border-slblue-500',
                            singleValue: () => 'dark:!text-white',
                            dropdownIndicator: () => '!p-0 !hidden',
                            menu: () => 'dark:bg-slblue-800',
                            indicatorSeparator: () => '!hidden',
                            multiValue: () =>
                                '!bg-sllightblue-100 inline-flex rounded p-1 m-0 !mr-1.5 border border-sllightblue-200 !rounded-md mr-2',
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
