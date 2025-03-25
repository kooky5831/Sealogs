'use client'

import {
    AlertDialog,
    PopoverWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import React, { useState, useEffect } from 'react'
import { Popover, Heading, DialogTrigger } from 'react-aria-components'
import Select from 'react-select'
import {
    CREATE_GEO_LOCATION,
    CreateFavoriteLocation,
} from '@/app/lib/graphQL/mutation'
import { useLazyQuery, useMutation } from '@apollo/client'
import toast, { Toaster } from 'react-hot-toast'
import { classes } from '@/app/components/GlobalClasses'
import {
    GET_GEO_LOCATIONS,
    GetFavoriteLocations,
} from '@/app/lib/graphQL/query'
import FavoriteLocationModel from '@/app/offline/models/favoriteLocation'
import GeoLocationModel from '@/app/offline/models/geoLocation'
import { generateUniqueId } from '@/app/offline/helpers/functions'

export default function LocationField({
    currentTrip,
    updateTripReport,
    tripReport,
    setCurrentLocation,
    handleLocationChange,
    currentLocation,
    currentEvent,
    offline = false,
}: {
    currentTrip?: any
    updateTripReport?: any
    tripReport?: any
    setCurrentLocation: any
    handleLocationChange: any
    currentLocation?: any
    currentEvent: any
    offline?: boolean
}) {
    const [geoLocations, setGeoLocations] = useState<any>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [showLocation, setShowLocation] = useState(false)
    const [newLocation, setNewLocation] = useState(false)
    const [closestLocation, setClosestLocation] = useState<any>(false)
    const [selectedLocation, setSelectedLocation] = useState<any>()
    const [favoriteLocations, setFavoriteLocations] = useState<any>([])
    const [selectedParentLocation, setSelectedParentLocation] =
        useState<any>(false)
    const [locations, setLocations] = useState<any>()
    const [openNewLocationDialog, setOpenNewLocationDialog] =
        useState<boolean>(false)
    const [openSetLocationDialog, setOpenSetLocationDialog] =
        useState<boolean>(false)
    const [location, setLocation] = useState<{
        latitude: any
        longitude: any
    }>({ latitude: 0, longitude: 0 })
    const favoriteLocationModel = new FavoriteLocationModel()
    const geolocationModel = new GeoLocationModel()
    const displayNewLocation = () => {
        setNewLocation(true)
        setShowLocation(false)
    }

    const hideNewLocation = () => {
        setShowLocation(false)
        setNewLocation(false)
    }

    const handleSetLocationChange = async (selectedLocation: any) => {
        if (selectedLocation.value === 'newLocation') {
            setSelectedParentLocation(false)
            setOpenNewLocationDialog(true)
        } else {
            setSelectedLocation(selectedLocation)
            handleLocationChange(selectedLocation)
            if (+localStorage.getItem('userId')! > 0) {
                if (offline) {
                    const variables = {
                        id: generateUniqueId(),
                        memberID: +localStorage.getItem('userId')!,
                        geoLocationID: +selectedLocation.value,
                    }
                    await favoriteLocationModel.save(variables)
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
        onCompleted: (data) => {
            console.log('onCompleted', data)
        },
        onError: (error) => {
            console.log('onError', error)
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
            input: {
                title: title,
                lat: +latitude,
                long: +longitude,
                parentLocationID: parentLocation,
            },
        }

        if (offline) {
            const uniqueID = generateUniqueId()
            const data = await geolocationModel.save({
                ...variables.input,
                id: uniqueID,
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
            handleLocationChange({
                label: data.title,
                value: data.id,
                latitude: data.lat,
                longitude: data.long,
            })
            setOpenNewLocationDialog(false)
            setOpenSetLocationDialog(false)
        } else {
            createGeoLocation({
                variables,
            })
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
            handleLocationChange({
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
    const offlineGetFavoriteLocations = async () => {
        const locations = await favoriteLocationModel.getByMemberID(
            +localStorage.getItem('userId')!,
        )
        setFavoriteLocations(locations)
    }
    useEffect(() => {
        if (offline) {
            offlineGetFavoriteLocations()
        } else {
            getFavoriteLocations({
                variables: {
                    userID: +localStorage.getItem('userId')!,
                },
            })
        }
    }, [])

    const [getFavoriteLocations] = useLazyQuery(GetFavoriteLocations, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            const locations = data.readFavoriteLocations.nodes
            setFavoriteLocations(locations)
        },
        onError: (error) => {
            console.log('onError', error)
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

    const findClosestLocation = (latitude: any, longitude: any) => {
        const closestLocation =
            geoLocations.length > 0 &&
            geoLocations.reduce((prev: any, curr: any) => {
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
    }

    const handleSetCurrentLocation = () => {
        toast.loading('Getting your current location...')
        if ('geolocation' in navigator) {
            const options = {
                timeout: 30000, // 30 seconds
            }
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    const { latitude, longitude } = coords
                    setLocation({ latitude, longitude })
                    setCurrentLocation({
                        latitude: +latitude,
                        longitude: +longitude,
                    })
                    findClosestLocation(latitude, longitude)
                    setOpenSetLocationDialog(true)
                },
                (error) => {
                    toast.remove()
                    toast.error('Failed to get current location')
                    setTimeout(() => {
                        setOpenSetLocationDialog(true)
                    }, 1000)
                },
                options,
            )
        } else {
            toast.error('Geolocation is not supported by your browser')
        }
    }

    const handleSetLocation = () => {
        setSelectedLocation(closestLocation)
        handleLocationChange(closestLocation)
        setOpenSetLocationDialog(false)
    }

    const updateLocationCoordinates = () => {
        const latitude = (
            document.getElementById('location-latitude') as HTMLInputElement
        ).value
        const longitude = (
            document.getElementById('location-longitude') as HTMLInputElement
        ).value
        setLocation({ latitude: +latitude, longitude: +longitude })
        setCurrentLocation({
            latitude: +latitude,
            longitude: +longitude,
        })
    }
    const handlesetShowLocation = () => {
        setShowLocation(true)
        // if (!location.latitude || !location.longitude) {
        //     toast.loading('Getting your current location...')
        //     if ('geolocation' in navigator) {
        //         const options = {
        //             timeout: 10000, // 10 seconds
        //         }
        //         navigator.geolocation.getCurrentPosition(
        //             ({ coords }) => {
        //                 const { latitude, longitude } = coords
        //                 setLocation({ latitude, longitude })
        //                 setCurrentLocation({
        //                     latitude: +latitude,
        //                     longitude: +longitude,
        //                 })
        //                 toast.remove()
        //             },
        //             (error) => {
        //                 toast.remove()
        //                 toast.error('Failed to get current location')
        //             },
        //             options,
        //         )
        //     } else {
        //         toast.error('Geolocation is not supported by your browser')
        //     }
        // }
    }

    const [getGeoLocations] = useLazyQuery(GET_GEO_LOCATIONS, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readGeoLocations.nodes
            if (data) {
                setGeoLocations(data)
            }
        },
        onError: (error: any) => {
            console.error('queryGeoLocations error', error)
        },
    })
    const loadGeoLocations = async () => {
        if (offline) {
            const data = await geolocationModel.getAll()
            if (data) {
                setGeoLocations(data)
            }
        } else {
            await getGeoLocations()
        }
    }

    useEffect(() => {
        if (isLoading) {
            loadGeoLocations()
            setIsLoading(false)
        }
    }, [isLoading])

    useEffect(() => {
        if (currentEvent) {
            if (+currentEvent?.geoLocationID > 0) {
                geoLocations?.find((location: any) => {
                    if (location.id === currentEvent.geoLocationID) {
                        setSelectedLocation({
                            label: location.title,
                            value: location.id,
                            latitude: location.lat,
                            longitude: location.long,
                        })
                    }
                })
                setShowLocation(false)
            } else {
                if (currentEvent?.lat && currentEvent?.long) {
                    setLocation({
                        latitude: currentEvent.lat,
                        longitude: currentEvent.long,
                    })
                    setShowLocation(true)
                }
            }
        }
    }, [currentEvent, geoLocations])
    return (
        <div className="flex items-center w-full">
            <div className="flex w-full">
                <div className="flex w-full md:items-center flex-col md:flex-row gap-1">
                    {geoLocations && !showLocation && (
                        <div className="min-w-60">
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
                                value={selectedLocation}
                                onChange={handleSetLocationChange}
                                menuPlacement="top"
                                placeholder="Select Location"
                                className={classes.selectMain}
                                classNames={{
                                    control: () => classes.selectControl,
                                    singleValue: () =>
                                        classes.selectSingleValue,
                                    menu: () => classes.selectMenu,
                                    option: () => classes.selectOption,
                                }}
                            />
                        </div>
                    )}
                    {showLocation && (
                        <div className="flex gap-4 grow w-full">
                            <div className="grow">
                                <input
                                    id="location-latitude"
                                    name="latitude"
                                    type="number"
                                    value={location.latitude}
                                    onChange={updateLocationCoordinates}
                                    className={classes.input}
                                    aria-describedby="latitude-error"
                                    placeholder="Latitude"
                                    required
                                />
                            </div>
                            <div className="grow">
                                <input
                                    id="location-longitude"
                                    name="longitude"
                                    type="number"
                                    value={location.longitude}
                                    onChange={updateLocationCoordinates}
                                    className={classes.input}
                                    aria-describedby="longitude-error"
                                    required
                                    placeholder="Longitude"
                                />
                            </div>
                            <SeaLogsButton
                                text="Use Location"
                                type="secondary"
                                color="sllightblue"
                                className="!mr-0 grow min-w-48"
                                action={hideNewLocation}
                            />
                        </div>
                    )}
                    {!showLocation && (
                        <div className="flex flex-wrap md:flex-none flex-row gap-3 w-full md:w-auto">
                            <SeaLogsButton
                                text="Use Coordinates"
                                type="secondary"
                                color="sllightblue"
                                action={handlesetShowLocation}
                                className="!mr-0 grow min-auto"
                            />
                            <SeaLogsButton
                                text="Current Location"
                                type="secondary"
                                color="sllightblue"
                                action={handleSetCurrentLocation}
                                className="!mr-0 grow min-auto"
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
                        </div>
                    )}
                </div>
            </div>
            <AlertDialog
                openDialog={openNewLocationDialog}
                setOpenDialog={setOpenNewLocationDialog}
                actionText="Add New Location"
                handleCreate={handleCreateNewLocation}>
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2 ">
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
                                '!bg-sllightblue-100 inline-flex rounded p-1 m-0 !mr-1.5 border border-sllightblue-200 !rounded-md font-base mr-2',
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
                {closestLocation?.label ? (
                    <>
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
                                    or alternatively do you want to save
                                    location?
                                </div>
                            </>
                        ) : (
                            <div className="">
                                Fetching current location took long, do you want
                                to create a new location instead?
                            </div>
                        )}
                    </>
                ) : (
                    <div className="">
                        Failed to fetch current location do you want to create a
                        new location instead?
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
                                '!bg-sllightblue-100 inline-flex rounded p-1 m-0 !mr-1.5 border border-sllightblue-300 !rounded-md font-base mr-2',
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
