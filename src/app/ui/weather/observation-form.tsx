import { classes } from '@/app/components/GlobalClasses'
import { useEffect, useState } from 'react'
import TimeField from '../logbook/components/time'
import dayjs from 'dayjs'
import { SeaLogsButton } from '@/app/components/Components'
import LocationField from '../logbook/components/location'

import WindDirectionDropdown from './wind-direction-dropdown'
import SeaSwellDropdown from './sea-swell-dropdown'
import VisibilityDropdown from './visibility-dropdown'
import PrecipitationDropdown from './precipitation-dropdown'
import { debounce, isEmpty } from 'lodash'
import WindSpeedSlider from './wind-speed-slider'
import BarometricPressureSlider from './barometric-pressure-slider'
import {
    precipitations,
    swellRanges,
    visibilities,
    windDirections,
} from '@/app/helpers/weatherHelper'
import CloudCoverSlider from './cloud-cover-slider'
import {
    CreateWeatherObservation,
    DeleteWeatherObservations,
    UpdateWeatherObservation,
} from '@/app/lib/graphQL/mutation'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
    Button,
    Dialog,
    DialogTrigger,
    Heading,
    Modal,
    ModalOverlay,
} from 'react-aria-components'
import { ReadOneWeatherObservation } from '@/app/lib/graphQL/query'
import WeatherObservationModel from '@/app/offline/models/weatherObservation'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import { useOnline } from '@reactuses/core'
const WeatherObservationForm = ({
    observationID = 0,
    logBookEntryID,
    forecast = {},
    onCancel,
    onSave,
    offline = false,
}: {
    observationID?: number
    logBookEntryID: number
    forecast?: any
    onCancel?: any
    onSave?: any
    offline?: boolean
}) => {
    const [isLoading, setIsLoading] = useState(true)
    const [observation, setObservation] = useState({} as any)
    const [selectedForecast, setSelectedForecast] = useState<any>(forecast)
    const [currentLocation, setCurrentLocation] = useState<any>({
        latitude: null,
        longitude: null,
    })
    const [selectedCoordinates, setSelectedCoordinates] = useState<any>({
        latitude: null,
        longitude: null,
    })
    const [isStormGlassLoading, setIsStormGlassLoading] = useState(false)
    const isOnline = useOnline()
    const observationModel = new WeatherObservationModel()
    const getTimeNow = () => {
        return dayjs().format('HH:mm')
    }
    const initObservation = () => {
        if (!isEmpty(forecast)) {
            const obs = {
                ...forecast,
                id: observationID,
                logBookEntryID: forecast.logBookEntryID,
                forecastID: forecast.id,
                comment: '',
            }
            setObservation(obs)
            setSelectedCoordinates({
                latitude:
                    +obs.geoLocationID > 0 ? obs.geoLocation.lat : obs.lat,
                longitude:
                    +obs.geoLocationID > 0 ? obs.geoLocation.long : obs.long,
            })
        } else {
            const obs = {
                id: observationID,
                time: getTimeNow(),
                geoLocationID: 0,
                lat: 0,
                long: 0,
                logBookEntryID: logBookEntryID,
                forecastID: 0,
            }
            setObservation(obs)
        }
    }
    const handleTimeChange = (time: any) => {
        setObservation({
            ...observation,
            time: dayjs(time).format('HH:mm'),
        })
    }
    const handleSetCurrentLocation = (value: any) => {
        setObservation({
            ...observation,
            geoLocationID: 0,
            lat: value.latitude,
            long: value.longitude,
        })
        setSelectedCoordinates({
            latitude: value.latitude,
            longitude: value.longitude,
        })
    }
    const handleLocationChange = (value: any) => {
        setObservation({
            ...observation,
            geoLocationID: +value.value,
            lat: null,
            long: null,
        })
        setSelectedCoordinates({
            latitude: value.latitude,
            longitude: value.longitude,
        })
    }
    const getWindDirection = (degrees: number) => {
        let wd = windDirections.find((item: any) => item.degrees === -1) // variable
        if (degrees >= 0 && degrees < 22.5) {
            wd = windDirections.find((item: any) => item.degrees === 0)
        } else if (degrees >= 22.5 && degrees < 67.5) {
            wd = windDirections.find((item: any) => item.degrees === 45)
        } else if (degrees >= 67.5 && degrees < 112.5) {
            wd = windDirections.find((item: any) => item.degrees === 90)
        } else if (degrees >= 112.5 && degrees < 157.5) {
            wd = windDirections.find((item: any) => item.degrees === 135)
        } else if (degrees >= 157.5 && degrees < 202.5) {
            wd = windDirections.find((item: any) => item.degrees === 180)
        } else if (degrees >= 202.5 && degrees < 247.5) {
            wd = windDirections.find((item: any) => item.degrees === 225)
        } else if (degrees >= 247.5 && degrees < 292.5) {
            wd = windDirections.find((item: any) => item.degrees === 270)
        } else if (degrees >= 292.5 && degrees < 337.5) {
            wd = windDirections.find((item: any) => item.degrees === 315)
        } else if (degrees >= 337.5 && degrees < 360) {
            wd = windDirections.find((item: any) => item.degrees === 0)
        }
        return wd ? wd.value : 'variable'
    }
    const getSwellHeightRange = (height: number) => {
        let swellHeight = 'less than 0.5m'
        const swell = swellRanges.find((item: any) => height <= item.meter)
        if (swell) {
            swellHeight = swell.value
        }
        return swellHeight
    }
    const getVisibility = (km: number) => {
        let visibility = 'good'
        const v = visibilities.find((item: any) => km <= item.km)
        if (v) {
            visibility = v.value
        }
        return visibility
    }
    const getPrecipitation = (value: number) => {
        let precipitation = 'none'
        const p = precipitations.find((item: any) => value <= item.max)

        if (p) {
            precipitation = p.value
        }
        return precipitation
    }
    const processStormGlassData = (data: any) => {
        const {
            windSpeed,
            windDirection,
            swellHeight,
            visibility,
            precipitation,
            pressure,
            cloudCover,
        } = data.hours[0]
        const windSpeedInKnots = (
            (windSpeed.noaa || windSpeed.sg || 0) / 0.51444
        ).toFixed(2) // Convert m/s to knot. One knot is equal to approximately 0.51444 meters per second (m/s).
        const compassWindDirection = getWindDirection(
            windDirection.noaa || windDirection.sg || 0,
        ) // convert degrees to compass direction
        const swellValue = getSwellHeightRange(
            swellHeight.noaa || swellHeight.sg || 0,
        )
        const visibilityValue = getVisibility(
            visibility.noaa || visibility.sg || 0,
        )
        const precipitationValue = getPrecipitation(
            precipitation.noaa || precipitation.sg || 0,
        )
        const pressureValue = pressure ? pressure.noaa || pressure.sg || 0 : 0

        const cloudCoverValue = cloudCover.noaa || cloudCover.sg || 0
        setObservation({
            ...observation,
            windSpeed: +windSpeedInKnots,
            windDirection: compassWindDirection,
            swell: swellValue,
            visibility: visibilityValue,
            precipitation: precipitationValue,
            pressure: pressureValue,
            cloudCover: cloudCoverValue,
        })
        setIsStormGlassLoading(false)
    }
    const isStormGlassButtonEnabled = () => {
        let isStormGlassButtonEnabled = false
        if (+observation.geoLocationID > 0) {
            isStormGlassButtonEnabled = true
        } else if (+observation.lat > 0 || +observation.long > 0) {
            isStormGlassButtonEnabled = true
        }
        if (!isOnline) {
            isStormGlassButtonEnabled = false
        }
        return isStormGlassButtonEnabled
    }
    const getStormGlassData = () => {
        setIsStormGlassLoading(false)
        if ('geolocation' in navigator) {
            setIsStormGlassLoading(true)
            return new Promise((resolve, reject) => {
                return navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const dateString = `${dayjs().format('YYYY-MM-DD')} ${observation.time}`
                        let startDate = new Date(dateString)
                        // if (startDate.getMinutes() > 31) {
                        //     startDate.setHours(startDate.getHours() + 1)
                        // }
                        let endDate = startDate
                        var headers = {
                            'Cache-Control': 'no-cache',
                            Authorization: process.env.STORMGLASS_API_KEY || '',
                            'Access-Control-Allow-Credentials': 'true',
                        }
                        var params =
                            'windSpeed,windDirection,swellHeight,visibility,precipitation,pressure,cloudCover'

                        let request = fetch(
                            `https://api.stormglass.io/v2/weather/point?lat=${selectedCoordinates.latitude || 0}&lng=${
                                selectedCoordinates.longitude || 0
                            }&params=${params}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
                            {
                                method: 'GET',
                                headers,
                            },
                        )
                        request
                            .then((response) => response.json())
                            .then((jsonData) => {
                                processStormGlassData(jsonData)
                                resolve(jsonData)
                            })
                            .catch((error) => {
                                setIsStormGlassLoading(false)
                                console.error('Error', error)
                                reject(error)
                            })

                        return request
                    },
                    (error) => {
                        setIsStormGlassLoading(false)
                        reject(error)
                    },
                )
            })
        } else {
            console.error('Geolocation is not supported by your browser')
        }
    }
    const handleOnChangeWindSpeed = (value: any) => {
        const windSpeed = Array.isArray(value) ? value[0] : value
        setObservation({
            ...observation,
            windSpeed: +windSpeed,
        })
    }
    const handleOnChangePressure = (value: any) => {
        const pressure = Array.isArray(value) ? value[0] : value
        setObservation({
            ...observation,
            pressure: pressure,
        })
    }
    const handleOnChangeCloudCover = (value: any) => {
        const cloudCover = Array.isArray(value) ? value[0] : value
        setObservation({
            ...observation,
            cloudCover: cloudCover,
        })
    }
    const handleOnChangeWindDirection = (item: any) => {
        setObservation({
            ...observation,
            windDirection: item.value,
        })
    }
    const handleOnChangeSeaSwell = (item: any) => {
        setObservation({
            ...observation,
            swell: item.value,
        })
    }
    const handleOnChangeVisibility = (item: any) => {
        setObservation({
            ...observation,
            visibility: item.value,
        })
    }
    const handleOnChangePrecipitation = (item: any) => {
        setObservation({
            ...observation,
            precipitation: item.value,
        })
    }
    const handleSetComment = debounce((item: any) => {
        setObservation({
            ...observation,
            comment: item,
        })
    }, 600)
    const [
        createWeatherObservation,
        { loading: createWeatherObservationLoading },
    ] = useMutation(CreateWeatherObservation, {
        onCompleted: () => {
            onSave()
        },
        onError: (error) => {
            console.error('CreateWeatherObservation Error', error)
        },
    })
    const [
        updateWeatherObservation,
        { loading: updateWeatherObservationLoading },
    ] = useMutation(UpdateWeatherObservation, {
        onCompleted: () => {
            onSave()
        },
        onError: (error) => {
            console.error('UpdateWeatherObservation Error', error)
        },
    })
    const handleSave = async () => {
        if (observation.geoLocation) delete observation.geoLocation
        if (observation.__typename) delete observation.__typename

        if (observationID === 0) {
            if (offline) {
                await observationModel.save({
                    ...observation,
                    id: generateUniqueId(),
                    forecastID: forecast ? forecast.id : 0,
                })
                onSave()
            } else {
                await createWeatherObservation({
                    variables: {
                        input: {
                            ...observation,
                            forecastID: forecast ? forecast.id : 0,
                        },
                    },
                })
            }
        } else {
            if (offline) {
                await observationModel.save(observation)
                onSave()
            } else {
                await updateWeatherObservation({
                    variables: {
                        input: {
                            ...observation,
                        },
                    },
                })
            }
        }
    }
    const handleCancel = () => {
        onCancel()
    }
    const handleObservationClick = (observation: any) => {
        const newObservation = {
            ...observation,
            time: formatTime(observation.time),
        }
        setObservation(newObservation)
    }
    const [
        deleteWeatherObservations,
        { loading: deleteWeatherObservationsLoading },
    ] = useMutation(DeleteWeatherObservations, {
        onCompleted: () => {
            onSave()
        },
        onError: (error) => {
            console.error('DeleteWeatherObservations Error', error)
        },
    })
    const handleDeleteObservation = async () => {
        if (offline) {
            await observationModel.delete(observation)
            onSave()
        } else {
            await deleteWeatherObservations({
                variables: {
                    ids: [observationID],
                },
            })
        }
    }
    const formatTime = (time: string) => {
        return dayjs(`${dayjs().format('YYYY-MM-DD')} ${time}`).format('HH:mm')
    }
    const [
        readOneWeatherObservation,
        { loading: readOneWeatherObservationLoading },
    ] = useLazyQuery(ReadOneWeatherObservation, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const data = response.readOneWeatherObservation
            if (data) {
                const obs = {
                    ...data,
                    time: formatTime(data.time),
                }
                setObservation(obs)
            }
        },
        onError: (error) => {
            console.error('ReadOneWeatherObservation Error', error)
        },
    })
    const loadObservation = async () => {
        if (observationID > 0) {
            if (offline) {
                const data = await observationModel.getById(observationID)
                if (data) {
                    const obs = {
                        ...data,
                        time: formatTime(data.time),
                    }
                    setObservation(obs)
                }
            } else {
                await readOneWeatherObservation({
                    variables: {
                        id: observationID,
                    },
                })
            }
        } else {
            initObservation()
        }
    }

    useEffect(() => {
        if (isLoading) {
            loadObservation()
            setIsLoading(false)
        }
    }, [isLoading])
    return (
        <div>
            <div className="bg-slblue-100 dark:bg-sldarkblue-900 border dark:border-gray-400 rounded-md">
                {!isEmpty(selectedForecast) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white">
                        <div>&nbsp;</div>
                        <div className="mb-3 mt-3">
                            This {observationID === 0 ? 'is' : 'was'} an
                            observation on the{' '}
                            <span className="font-bold">
                                {selectedForecast?.time} forecast
                            </span>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white px-2 py-3 lg:px-6 min-w-1/2">
                    <div>
                        <label>Time</label>
                    </div>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                        <div className="flex md:items-center flex-col md:flex-row gap-4">
                            <div className="w-64">
                                <TimeField
                                    time={observation.time}
                                    handleTimeChange={handleTimeChange}
                                    timeID="observation-time"
                                    fieldName="Time"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label>Location</label>
                    </div>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                        <div className="flex md:items-center flex-col md:flex-row gap-4">
                            <LocationField
                                offline={offline}
                                currentTrip={{}}
                                updateTripReport={{}}
                                tripReport={{}}
                                setCurrentLocation={handleSetCurrentLocation}
                                handleLocationChange={handleLocationChange}
                                currentLocation={currentLocation}
                                currentEvent={{
                                    geoLocationID: observation.geoLocationID,
                                    lat: observation.lat,
                                    long: observation.long,
                                }}
                            />
                            {isStormGlassButtonEnabled() && (
                                <div className="flex justify-end">
                                    <button
                                        className={`${classes.addButton}`}
                                        onClick={() => {
                                            getStormGlassData()
                                        }}
                                        disabled={
                                            isStormGlassLoading ||
                                            createWeatherObservationLoading ||
                                            updateWeatherObservationLoading ||
                                            deleteWeatherObservationsLoading ||
                                            readOneWeatherObservationLoading
                                        }>
                                        {isStormGlassLoading
                                            ? 'Retrieving Observation...'
                                            : 'Retrieve Observation'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4">
                        <label>Wind Strength</label>
                    </div>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                        <div className="flex md:items-center flex-col md:flex-row gap-4 w-full">
                            <WindSpeedSlider
                                disabled={false}
                                value={Number(observation.windSpeed || 0)}
                                onChange={handleOnChangeWindSpeed}
                                unitOfMeasure="knots"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label>Wind Direction</label>
                    </div>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                        <div className="flex md:items-center flex-col md:flex-row gap-4">
                            <WindDirectionDropdown
                                disabled={false}
                                value={observation.windDirection}
                                onChange={(item: any) => {
                                    handleOnChangeWindDirection(item)
                                }}
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label>Swell</label>
                    </div>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                        <div className="flex md:items-center flex-col md:flex-row gap-4">
                            <SeaSwellDropdown
                                disabled={false}
                                value={observation.swell}
                                onChange={(item: any) => {
                                    handleOnChangeSeaSwell(item)
                                }}
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label>Visibility</label>
                    </div>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                        <div className="flex md:items-center flex-col md:flex-row gap-4">
                            <VisibilityDropdown
                                disabled={false}
                                value={observation.visibility}
                                onChange={(item: any) => {
                                    handleOnChangeVisibility(item)
                                }}
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label>Precipitation</label>
                    </div>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                        <div className="flex md:items-center flex-col md:flex-row gap-4">
                            <PrecipitationDropdown
                                disabled={false}
                                value={observation.precipitation}
                                onChange={(item: any) => {
                                    handleOnChangePrecipitation(item)
                                }}
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label>Pressure</label>
                    </div>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                        <div className="flex md:items-center flex-col md:flex-row gap-4">
                            <BarometricPressureSlider
                                disabled={false}
                                value={Number(observation.pressure || 0)}
                                onChange={handleOnChangePressure}
                                unitOfMeasure="hPa"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label>Cloud Cover</label>
                    </div>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                        <div className="flex md:items-center flex-col md:flex-row gap-4">
                            <CloudCoverSlider
                                disabled={false}
                                value={Number(observation.cloudCover || 0)}
                                onChange={handleOnChangeCloudCover}
                                unitOfMeasure="%"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label>Comment</label>
                    </div>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                        <div className="flex md:items-center flex-col md:flex-row gap-4">
                            <textarea
                                id={`observation-comment`}
                                rows={4}
                                className={classes.textarea}
                                placeholder="Comments ..."
                                defaultValue={observation.comment || ''}
                                onChange={(e: any) =>
                                    handleSetComment(e.target.value)
                                }></textarea>
                        </div>
                    </div>
                </div>
                <div className="flex my-4 justify-end px-2 py-3 lg:px-6 min-w-1/2">
                    <button
                        className="mr-4"
                        onClick={handleCancel}
                        disabled={
                            isStormGlassLoading ||
                            createWeatherObservationLoading ||
                            updateWeatherObservationLoading ||
                            deleteWeatherObservationsLoading ||
                            readOneWeatherObservationLoading
                        }>
                        Cancel
                    </button>
                    {observationID > 0 && (
                        <DialogTrigger>
                            <SeaLogsButton
                                type="secondary"
                                color="rose"
                                icon="trash"
                                text="Delete"
                                isDisabled={
                                    isStormGlassLoading ||
                                    createWeatherObservationLoading ||
                                    updateWeatherObservationLoading ||
                                    deleteWeatherObservationsLoading ||
                                    readOneWeatherObservationLoading
                                }
                            />
                            <ModalOverlay
                                className={({ isEntering, isExiting }) => `
                            fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur
                            ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                            ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                        `}>
                                <Modal
                                    className={({ isEntering, isExiting }) => `
                                w-full max-w-md overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl
                                ${isEntering ? 'animate-in zoom-in-95 ease-out duration-300' : ''}
                                ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
                            `}>
                                    <Dialog
                                        role="alertdialog"
                                        className="outline-none relative">
                                        {({ close }) => (
                                            <div className="flex justify-center flex-col px-6 py-6">
                                                <Heading
                                                    slot="title"
                                                    className="text-2xl font-light leading-6 my-2 text-gray-700">
                                                    Delete Observation Data
                                                </Heading>
                                                <p className="mt-3 text-slate-500">
                                                    Are you sure you want to
                                                    delete the observation data
                                                    for{' '}
                                                    {formatTime(
                                                        observation.time,
                                                    )}
                                                    ?
                                                </p>
                                                <hr className="my-6" />
                                                <div className="flex justify-end">
                                                    <Button
                                                        className="mr-8 text-sm text-gray-600 hover:text-gray-600"
                                                        onPress={close}>
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        className="group inline-flex justify-center items-center rounded-md bg-sky-700 px-4 py-2 text-sm text-white shadow-sm hover:bg-white hover:text-sky-800 ring-1 ring-sky-700"
                                                        onPress={() => {
                                                            close()
                                                            handleDeleteObservation()
                                                        }}>
                                                        <svg
                                                            className="-ml-0.5 mr-1.5 h-5 w-5 border rounded-full bg-sky-300 group-hover:bg-sky-700 group-hover:text-white"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                            aria-hidden="true">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                                clipRule="evenodd"></path>
                                                        </svg>
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </Dialog>
                                </Modal>
                            </ModalOverlay>
                        </DialogTrigger>
                    )}
                    <SeaLogsButton
                        type="primary"
                        icon="check"
                        text={`${observationID === 0 ? 'Create' : 'Update'} Observation`}
                        color="sky"
                        action={handleSave}
                        isDisabled={
                            isStormGlassLoading ||
                            createWeatherObservationLoading ||
                            updateWeatherObservationLoading ||
                            deleteWeatherObservationsLoading ||
                            readOneWeatherObservationLoading
                        }
                    />
                </div>
            </div>
        </div>
    )
}

export default WeatherObservationForm
