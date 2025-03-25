import { classes } from '@/app/components/GlobalClasses'
import { useEffect, useState } from 'react'
import TimeField from '../logbook/components/weatherTime'
import dayjs from 'dayjs'
import { SeaLogsButton } from '@/app/components/Components'
import LocationField from '../logbook/components/location'

import WindDirectionDropdown from './wind-direction-dropdown'
import SeaSwellDropdown from './sea-swell-dropdown'
import VisibilityDropdown from './visibility-dropdown'
import PrecipitationDropdown from './precipitation-dropdown'
import { debounce } from 'lodash'
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
    CreateWeatherForecast,
    DeleteWeatherForecasts,
    UpdateWeatherForecast,
} from '@/app/lib/graphQL/mutation'
import { useMutation } from '@apollo/client'
import WeatherForecastList from './forecast-list'
import {
    Button,
    Dialog,
    DialogTrigger,
    Heading,
    Modal,
    ModalOverlay,
} from 'react-aria-components'
import WeatherObservationForm from './observation-form'
import toast, { Toaster } from 'react-hot-toast'
import WeatherObservation from './observation'
import { useOnline } from '@reactuses/core'
import WeatherForecastModel from '@/app/offline/models/weatherForecast'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import { formatDate, formatDateTime } from '@/app/helpers/dateHelper'
const WeatherForecast = ({
    logBookEntryID,
    offline = false,
}: {
    logBookEntryID: number
    offline?: boolean
}) => {
    const [isWriteModeForecast, setIsWriteModeForecast] = useState(false)
    const [isWriteModeObservation, setIsWriteModeObservation] = useState(false)
    const [forecast, setForecast] = useState({} as any)
    const [currentLocation, setCurrentLocation] = useState<any>({
        latitude: null,
        longitude: null,
    })
    const [selectedCoordinates, setSelectedCoordinates] = useState<any>({
        latitude: null,
        longitude: null,
    })
    const isOnline = useOnline()
    const forecastModel = new WeatherForecastModel()
    const [isStormGlassLoading, setIsStormGlassLoading] = useState(false)
    const [refreshList, setRefreshList] = useState(false)
    const getTimeNow = () => {
        return dayjs().format('HH:mm')
    }

    const getDayNow = () => {
        return dayjs().format('YYYY-MM-DD')
    }

    const initForecast = () => {
        setForecast({
            id: 0,
            time: getTimeNow(),
            day: getDayNow(),
            geoLocationID: 0,
            lat: 0,
            long: 0,
            logBookEntryID: logBookEntryID,
        })
    }
    const createForecast = () => {
        initForecast()
        setIsWriteModeForecast(true)
    }
    const handleTimeChange = (time: any) => {
        setForecast({
            ...forecast,
            time: dayjs(time).format('HH:mm'),
        })
    }
    const handleDayChange = (day: any) => {
        const selectedValue = day.value
        setForecast({
            ...forecast,
            day: dayjs(selectedValue).format('YYYY-MM-DD'),
        })
    }
    const handleSetCurrentLocation = (value: any) => {
        setForecast({
            ...forecast,
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
        setForecast({
            ...forecast,
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
            windSpeed ? (windSpeed.noaa || windSpeed.sg || 0) / 0.51444 : 0
        ).toFixed(2) // Convert m/s to knot. One knot is equal to approximately 0.51444 meters per second (m/s).
        const compassWindDirection = getWindDirection(
            windDirection ? windDirection.noaa || windDirection.sg || 0 : 0,
        ) // convert degrees to compass direction
        const swellValue = getSwellHeightRange(
            swellHeight ? swellHeight.noaa || swellHeight.sg || 0 : 0,
        )
        const visibilityValue = getVisibility(
            visibility ? visibility.noaa || visibility.sg || 0 : 0,
        )
        const precipitationValue = getPrecipitation(
            precipitation ? precipitation.noaa || precipitation.sg || 0 : 0,
        )
        const pressureValue = pressure ? pressure.noaa || pressure.sg || 0 : 0

        const cloudCoverValue = cloudCover
            ? cloudCover.noaa || cloudCover.sg || 0
            : 0
        setForecast({
            ...forecast,
            windSpeed: +windSpeedInKnots,
            windDirection: compassWindDirection,
            swell: swellValue,
            visibility: visibilityValue,
            precipitation: precipitationValue,
            pressure: +pressureValue,
            cloudCover: +cloudCoverValue,
        })
        setIsStormGlassLoading(false)
    }
    const isStormGlassButtonEnabled = () => {
        let isStormGlassButtonEnabled = false
        if (+forecast.geoLocationID > 0) {
            isStormGlassButtonEnabled = true
        } else if (!isNaN(+forecast.lat) || !isNaN(+forecast.long)) {
            isStormGlassButtonEnabled = true
        }
        if (!isOnline) {
            isStormGlassButtonEnabled = false
        }
        return isStormGlassButtonEnabled
    }
    const getStormGlassData = () => {
        if ('geolocation' in navigator) {
            toast.remove()
            toast.loading('Retrieving forecast...')
            setIsStormGlassLoading(true)
            return new Promise((resolve, reject) => {
                return navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const dateString = `${formatDate(forecast.day)} ${forecast.time}`
                        let startDate = new Date(dateString)
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
                                toast.remove()
                                toast.success('Forecast retrieved successfully')
                                processStormGlassData(jsonData)
                                resolve(jsonData)
                            })
                            .catch((error) => {
                                setIsStormGlassLoading(false)
                                reject(error)
                                toast.remove()
                                toast.error(
                                    'There was a problem retrieving the forecast. Please try again later.',
                                )
                                console.error('Catch error:', error)
                            })

                        return request
                    },
                    (error) => {
                        setIsStormGlassLoading(false)
                        reject(error)
                        toast.remove()
                        toast.error(
                            'There was a problem retrieving the forecast. Please try again later.',
                        )
                        console.error('Geolocation error', error)
                    },
                )
            })
        } else {
            setIsStormGlassLoading(false)
            console.error('Geolocation is not supported by your browser')
            toast.remove()
            toast.error('Geolocation is not supported by your browser')
        }
    }
    const handleOnChangeWindSpeed = (value: any) => {
        const windSpeed = Array.isArray(value) ? value[0] : value
        setForecast({
            ...forecast,
            windSpeed: +windSpeed,
        })
    }
    const handleOnChangePressure = (value: any) => {
        const pressure = Array.isArray(value) ? value[0] : value
        setForecast({
            ...forecast,
            pressure: pressure,
        })
    }
    const handleOnChangeCloudCover = (value: any) => {
        const cloudCover = Array.isArray(value) ? value[0] : value
        setForecast({
            ...forecast,
            cloudCover: cloudCover,
        })
    }
    const handleOnChangeWindDirection = (item: any) => {
        setForecast({
            ...forecast,
            windDirection: item.value,
        })
    }
    const handleOnChangeSeaSwell = (item: any) => {
        setForecast({
            ...forecast,
            swell: item.value,
        })
    }
    const handleOnChangeVisibility = (item: any) => {
        setForecast({
            ...forecast,
            visibility: item.value,
        })
    }
    const handleOnChangePrecipitation = (item: any) => {
        setForecast({
            ...forecast,
            precipitation: item.value,
        })
    }
    const handleSetComment = debounce((item: any) => {
        setForecast({
            ...forecast,
            comment: item,
        })
    }, 600)
    const [createWeatherForecast, { loading: createWeatherForecastLoading }] =
        useMutation(CreateWeatherForecast, {
            onCompleted: (response) => {
                setIsWriteModeForecast(false)
                setRefreshList(true)
            },
            onError: (error) => {
                console.error('CreateWeatherForecast Error', error)
            },
        })
    const [updateWeatherForecast, { loading: updateWeatherForecastLoading }] =
        useMutation(UpdateWeatherForecast, {
            onCompleted: (response) => {
                setIsWriteModeForecast(false)
                setRefreshList(true)
            },
            onError: (error) => {
                console.error('UpdateWeatherForecast Error', error)
            },
        })
    const handleSave = async () => {
        if (+forecast.id === 0) {
            if (offline) {
                await forecastModel.save({
                    ...forecast,
                    id: generateUniqueId(),
                })
                setIsWriteModeForecast(false)
                setRefreshList(true)
            } else {
                await createWeatherForecast({
                    variables: {
                        input: {
                            ...forecast,
                        },
                    },
                })
            }
        } else {
            if (forecast.geoLocation) delete forecast.geoLocation
            if (forecast.__typename) delete forecast.__typename
            if (offline) {
                await forecastModel.save({
                    ...forecast,
                    day: dayjs(forecast.day).format('YYYY-MM-DD'),
                })
                setIsWriteModeForecast(false)
                setRefreshList(true)
            } else {
                await updateWeatherForecast({
                    variables: {
                        input: {
                            ...forecast,
                        },
                    },
                })
            }
        }
    }
    const handleCancel = () => {
        initForecast()
        setIsWriteModeForecast(false)
        setIsWriteModeObservation(false)
    }
    const handleForecastClick = (forecast: any) => {
        const newForecast = {
            ...forecast,
            time: formatTime(forecast.time),
            day: dayjs(forecast.day.toString()),
        }
        setForecast(newForecast)
        setIsWriteModeForecast(true)
    }
    const [deleteWeatherForecasts, { loading: deleteWeatherForecastsLoading }] =
        useMutation(DeleteWeatherForecasts, {
            onCompleted: (response) => {
                setIsWriteModeForecast(false)
                setRefreshList(true)
            },
            onError: (error) => {
                console.error('DeleteWeatherForecasts Error', error)
            },
        })
    const handleDeleteForecast = async () => {
        if (offline) {
            forecastModel.delete(forecast)
            setIsWriteModeForecast(false)
            setRefreshList(true)
        } else {
            await deleteWeatherForecasts({
                variables: {
                    ids: [forecast.id],
                },
            })
        }
    }
    const formatTime = (time: string) => {
        return dayjs(`${dayjs().format('YYYY-MM-DD')} ${time}`).format('HH:mm')
    }
    const formatDay = (day: string) => {
        return dayjs(day).format('YYYY-MM-DD')
    }
    const handleAddObservation = () => {
        setIsWriteModeObservation(true)
        setIsWriteModeForecast(false)
    }
    useEffect(() => {
        if (logBookEntryID > 0) {
            setForecast({
                ...forecast,
                logBookEntryID: logBookEntryID,
            })
        }
    }, [logBookEntryID])

    const { day, ...forecastWithoutDay } = forecast

    return (
        <div>
            {!isWriteModeForecast && !isWriteModeObservation && (
                <div className="flex justify-between md:flex-nowrap flex-wrap gap-3  items-center px-4">
                    <Heading className="dark:text-white text-xs leading-loose font-light">
                        You can start by retrieving a weather forecast up to
                        7-days into the future.
                        <br />
                        SeaLogs currently using the Stormglass API with more
                        forecasting services coming soon.
                        <br />
                        After retrieving a forecast you can add your own
                        observations. We use this data to compare
                        <br />
                        the accuracy of forecasts plus share weather
                        observatiosn with our community of users.
                    </Heading>
                    <button
                        className={`w-48 text-sm font-semibold text-white bg-slblue-800 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-slblue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`}
                        onClick={() => {
                            createForecast()
                        }}>
                        Add Forecast
                    </button>
                </div>
            )}
            {isWriteModeForecast && (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white">
                        <div>
                            <label className="font-light text-xs col-span-1">
                                Time
                            </label>
                        </div>
                        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                            <div className="flex md:items-center flex-col md:flex-row gap-4">
                                <div className="w-64">
                                    <TimeField
                                        time={forecast.time}
                                        day={forecast.day}
                                        handleTimeChange={handleTimeChange}
                                        handleDayChange={handleDayChange}
                                        timeID="forecast-time"
                                        fieldName="Time"
                                        dayFieldName="Day"
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
                                    setCurrentLocation={
                                        handleSetCurrentLocation
                                    }
                                    handleLocationChange={handleLocationChange}
                                    currentLocation={currentLocation}
                                    currentEvent={{
                                        geoLocationID: forecast.geoLocationID,
                                        lat: forecast.lat,
                                        long: forecast.long,
                                    }}
                                />
                                {isWriteModeForecast &&
                                    isStormGlassButtonEnabled() && (
                                        <div className="flex justify-end">
                                            <button
                                                className={`${classes.addButton}`}
                                                onClick={() => {
                                                    getStormGlassData()
                                                }}
                                                disabled={
                                                    isStormGlassLoading ||
                                                    createWeatherForecastLoading ||
                                                    updateWeatherForecastLoading ||
                                                    deleteWeatherForecastsLoading
                                                }>
                                                {isStormGlassLoading
                                                    ? 'Retrieving Forecast...'
                                                    : 'Retrieve Forecast'}
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
                                    disabled={true}
                                    value={Number(forecast.windSpeed || 0)}
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
                                {/*<WindDirectionDropdown
                                    disabled={true}
                                    value={forecast.windDirection}
                                    onChange={(item: any) => {
                                        handleOnChangeWindDirection(item)
                                    }}
                                /> */}
                                {(() => {
                                    if (forecast.windDirection == 'north') {
                                        return <div>North</div>
                                    } else if (
                                        forecast.windDirection == 'northEast'
                                    ) {
                                        return <div>North East</div>
                                    } else if (
                                        forecast.windDirection == 'east'
                                    ) {
                                        return <div>East</div>
                                    } else if (
                                        forecast.windDirection == 'southEast'
                                    ) {
                                        return <div>South East</div>
                                    } else if (
                                        forecast.windDirection == 'south'
                                    ) {
                                        return <div>South</div>
                                    } else if (
                                        forecast.windDirection == 'southWest'
                                    ) {
                                        return <div>South West</div>
                                    } else if (
                                        forecast.windDirection == 'west'
                                    ) {
                                        return <div>West</div>
                                    } else if (
                                        forecast.windDirection == 'northWest'
                                    ) {
                                        return <div>North West</div>
                                    } else if (
                                        forecast.windDirection == 'variable'
                                    ) {
                                        return <div>Variable</div>
                                    } else {
                                        return <div>Retrieve Forecast</div>
                                    }
                                })()}
                            </div>
                        </div>
                        <div className="mt-5">
                            <label>Swell</label>
                        </div>
                        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-5">
                            <div className="flex md:items-center flex-col md:flex-row gap-4">
                                {/*<SeaSwellDropdown
                                    disabled={true}
                                    value={forecast.swell}
                                    onChange={(item: any) => {
                                        handleOnChangeSeaSwell(item)
                                    }}
                                />*/}
                                {(() => {
                                    if (forecast.swell == 'smooth') {
                                        return <div>Less than 0.5m</div>
                                    } else if (forecast.swell == 'slight') {
                                        return <div>0.5m to 1.25m</div>
                                    } else if (forecast.swell == 'moderate') {
                                        return <div>1.25m to 2.5m</div>
                                    } else if (forecast.swell == 'rough') {
                                        return <div>2.5m to 4m</div>
                                    } else if (forecast.swell == 'veryRough') {
                                        return <div>4m to 6m</div>
                                    } else if (forecast.swell == 'high') {
                                        return <div>6m to 9m</div>
                                    } else if (forecast.swell == 'veryHigh') {
                                        return <div>9m to 14m</div>
                                    } else if (forecast.swell == 'phenomenal') {
                                        return <div>More than 14m</div>
                                    } else {
                                        return <div>Retrieve Forecast</div>
                                    }
                                })()}
                            </div>
                        </div>
                        <div className="mt-5">
                            <label>Visibility</label>
                        </div>
                        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-5">
                            <div className="flex md:items-center flex-col md:flex-row gap-4">
                                {/*<VisibilityDropdown
                                    disabled={true}
                                    value={forecast.visibility}
                                    onChange={(item: any) => {
                                        handleOnChangeVisibility(item)
                                    }}
                                />*/}
                                {(() => {
                                    if (forecast.visibility == 'fog') {
                                        return <div>Fog</div>
                                    } else if (forecast.visibility == 'poor') {
                                        return <div>Poor</div>
                                    } else if (
                                        forecast.visibility == 'variable'
                                    ) {
                                        return <div>Variable</div>
                                    } else if (
                                        forecast.visibility == 'moderate'
                                    ) {
                                        return <div>Moderate</div>
                                    } else if (forecast.visibility == 'good') {
                                        return <div>Good</div>
                                    } else {
                                        return <div>Retrieve Forecast</div>
                                    }
                                })()}
                            </div>
                        </div>
                        <div className="mt-5">
                            <label>Precipitation</label>
                        </div>
                        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-5">
                            <div className="flex md:items-center flex-col md:flex-row gap-4">
                                {/*<PrecipitationDropdown
                                    disabled={true}
                                    value={forecast.precipitation}
                                    onChange={(item: any) => {
                                        handleOnChangePrecipitation(item)
                                    }}
                                />*/}
                                {(() => {
                                    if (forecast.precipitation == 'none') {
                                        return <div>None</div>
                                    } else if (
                                        forecast.precipitation == 'drizzle'
                                    ) {
                                        return <div>Drizzle</div>
                                    } else if (
                                        forecast.precipitation == 'scattered'
                                    ) {
                                        return <div>Scattered Showers</div>
                                    } else if (
                                        forecast.precipitation == 'showers'
                                    ) {
                                        return <div>Showers</div>
                                    } else if (
                                        forecast.precipitation == 'rain'
                                    ) {
                                        return <div>Rain</div>
                                    } else if (
                                        forecast.precipitation == 'torrential'
                                    ) {
                                        return <div>Torrential Rain</div>
                                    } else {
                                        return <div>Retrieve Forecast</div>
                                    }
                                })()}
                            </div>
                        </div>
                        <div className="mt-4">
                            <label>Pressure</label>
                        </div>
                        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                            <div className="flex md:items-center flex-col md:flex-row gap-4">
                                <BarometricPressureSlider
                                    disabled={true}
                                    value={Number(forecast.pressure || 0)}
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
                                    disabled={true}
                                    value={Number(forecast.cloudCover || 0)}
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
                                    id={`forecast-comment`}
                                    rows={4}
                                    className={classes.textarea}
                                    placeholder="Comments ..."
                                    defaultValue={forecast.comment || ''}
                                    onChange={(e: any) =>
                                        handleSetComment(e.target.value)
                                    }></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="pb-4 pt-4">
                        <WeatherObservation
                            offline={offline}
                            logBookEntryID={logBookEntryID}
                            forecast={forecastWithoutDay}
                        />
                    </div>
                    <div className="flex my-4 justify-end">
                        <button
                            className="mr-2"
                            onClick={handleCancel}
                            disabled={
                                isStormGlassLoading ||
                                createWeatherForecastLoading ||
                                updateWeatherForecastLoading ||
                                deleteWeatherForecastsLoading
                            }>
                            Cancel
                        </button>
                        {+forecast.id > 0 && (
                            <DialogTrigger>
                                <SeaLogsButton
                                    type="secondary"
                                    color="rose"
                                    icon="trash"
                                    text="Delete"
                                    className="!mr-0"
                                    isDisabled={
                                        isStormGlassLoading ||
                                        createWeatherForecastLoading ||
                                        updateWeatherForecastLoading ||
                                        deleteWeatherForecastsLoading
                                    }
                                />
                                <ModalOverlay
                                    className={({ isEntering, isExiting }) => `
                                    fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur
                                    ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                                    ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                                `}>
                                    <Modal
                                        className={({
                                            isEntering,
                                            isExiting,
                                        }) => `
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
                                                        Delete Forecast Data
                                                    </Heading>
                                                    <p className="mt-3 text-slate-500">
                                                        Are you sure you want to
                                                        delete the forecast data
                                                        for{' '}
                                                        {formatTime(
                                                            forecast.time,
                                                        )}
                                                        {'   /   '}
                                                        {formatDate(
                                                            forecast.day,
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
                                                                handleDeleteForecast()
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
                            text={`${+forecast.id === 0 ? 'Create' : 'Update'} Forecast`}
                            color="sky"
                            action={handleSave}
                            isDisabled={
                                isStormGlassLoading ||
                                createWeatherForecastLoading ||
                                updateWeatherForecastLoading ||
                                deleteWeatherForecastsLoading
                            }
                        />
                    </div>
                </div>
            )}
            {!isWriteModeForecast && !isWriteModeObservation && (
                <div className="mt-4">
                    <WeatherForecastList
                        offline={offline}
                        logBookEntryID={logBookEntryID}
                        refreshList={refreshList}
                        onClick={handleForecastClick}
                    />
                </div>
            )}
            {isWriteModeObservation && (
                <div>
                    <WeatherObservationForm
                        offline={offline}
                        logBookEntryID={logBookEntryID}
                        forecast={forecast}
                        onCancel={handleCancel}
                        onSave={() => {
                            handleCancel()
                        }}
                    />
                </div>
            )}
            <Toaster position="top-right" />
        </div>
    )
}

export default WeatherForecast
