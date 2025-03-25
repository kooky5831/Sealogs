import { classes } from '@/app/components/GlobalClasses'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import {
    Button,
    Calendar,
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    DatePicker,
    Dialog,
    DialogTrigger,
    Group,
    Heading,
    Modal,
    ModalOverlay,
    Popover,
} from 'react-aria-components'
import { today, getLocalTimeZone } from '@internationalized/date'
import LocationField from '../logbook/components/location'
import { SeaLogsButton } from '@/app/components/Components'
import dayjs from 'dayjs'
import { debounce } from 'lodash'
import TimeField from '../logbook/components/time'
import {
    CreateWeatherTide,
    DeleteWeatherTides,
    UpdateWeatherTide,
} from '@/app/lib/graphQL/mutation'
import { useMutation } from '@apollo/client'
import WeatherTideList from './tide-list'
import { formatDate } from '@/app/helpers/dateHelper'
const Tide = ({ logBookEntryID }: { logBookEntryID: number }) => {
    const [isWriteMode, setIsWriteMode] = useState(false)
    const [isStormGlassLoading, setIsStormGlassLoading] = useState(false)
    const [tide, setTide] = useState({} as any)
    const [tideDate, setTideDate] = useState(new Date())
    const [refreshList, setRefreshList] = useState(false)
    const [currentLocation, setCurrentLocation] = useState<any>({
        latitude: null,
        longitude: null,
    })
    const [selectedCoordinates, setSelectedCoordinates] = useState<any>({
        latitude: null,
        longitude: null,
    })
    const initTide = () => {
        setTideDate(new Date())
        setTide({
            id: 0,
            tideDate: dayjs().format('YYYY-MM-DD'),
            geoLocationID: 0,
            lat: 0,
            long: 0,
            logBookEntryID: logBookEntryID,
        })
    }
    const createTide = () => {
        initTide()
        setIsWriteMode(true)
    }
    const processStormGlassData = (data: any) => {
        const highTides = data?.data.filter((tide: any) => {
            return tide.type == 'high'
        })
        const lowTides = data?.data.filter((tide: any) => {
            return tide.type == 'low'
        })

        const firstHighTideTime =
            dayjs(new Date(highTides[0]?.time)).format('HH:mm') || null
        const firstHighTideHeight = parseFloat(
            highTides[0]?.height.toFixed(2) || 0,
        )
        const secondHighTideTime =
            dayjs(highTides[1]?.time).format('HH:mm') || null
        const secondHighTideHeight = parseFloat(
            highTides[1]?.height.toFixed(2) || 0,
        )

        const firstLowTideTime =
            dayjs(lowTides[0]?.time).format('HH:mm') || null
        const firstLowTideHeight = Math.abs(
            parseFloat(lowTides[0]?.height.toFixed(2) || 0),
        )
        const secondLowTideTime =
            dayjs(lowTides[1]?.time).format('HH:mm') || null
        const secondLowTideHeight = Math.abs(
            parseFloat(lowTides[1]?.height.toFixed(2) || 0),
        )

        const tidalStation = data?.meta.station.name
        const tidalStationDistance = +data?.meta.station.distance

        setTide({
            ...tide,
            firstHighTideTime: firstHighTideTime,
            firstHighTideHeight: firstHighTideHeight,
            secondHighTideTime: secondHighTideTime,
            secondHighTideHeight: secondHighTideHeight,
            firstLowTideTime: firstLowTideTime,
            firstLowTideHeight: firstLowTideHeight,
            secondLowTideTime: secondLowTideTime,
            secondLowTideHeight: secondLowTideHeight,
            tidalStation: tidalStation,
            tidalStationDistance: tidalStationDistance,
        })
        setIsStormGlassLoading(false)
    }
    const isStormGlassButtonEnabled = () => {
        let isStormGlassButtonEnabled = false
        if (+tide.geoLocationID > 0) {
            isStormGlassButtonEnabled = true
        } else if (+tide.lat > 0 || +tide.long > 0) {
            isStormGlassButtonEnabled = true
        }
        return isStormGlassButtonEnabled
    }
    const getStormGlassData = () => {
        setIsStormGlassLoading(false)
        if ('geolocation' in navigator) {
            setIsStormGlassLoading(true)
            return new Promise((resolve, reject) => {
                console.log('tideDate', tideDate)
                let startDate = dayjs(new Date(tideDate).toString()).format(
                    'YYYY-MM-DD',
                )
                console.log('startDate', startDate)
                let endDate = dayjs(new Date(tideDate).toString())
                    .add(1, 'day')
                    .format('YYYY-MM-DD')
                console.log('endDate', endDate)
                var headers = {
                    'Cache-Control': 'no-cache',
                    Authorization: process.env.STORMGLASS_API_KEY || '',
                    'Access-Control-Allow-Credentials': 'true',
                }

                let request = fetch(
                    `https://api.stormglass.io/v2/tide/extremes/point?lat=${selectedCoordinates.latitude}&lng=${selectedCoordinates.longitude}&start=${startDate}&end=${endDate}`,
                    {
                        // method: 'GET',
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
            })
        } else {
            console.error('Geolocation is not supported by your browser')
        }
    }
    const handleOnChangeDate = (date: any) => {
        setTideDate(new Date(date))
        setTide({
            ...tide,
            tideDate: dayjs(date).format('YYYY-MM-DD'),
        })
    }
    const handleSetCurrentLocation = (value: any) => {
        setTide({
            ...tide,
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
        setTide({
            ...tide,
            geoLocationID: +value.value,
            lat: null,
            long: null,
        })
        setSelectedCoordinates({
            latitude: value.latitude,
            longitude: value.longitude,
        })
    }
    const handleSetComment = debounce((item: any) => {
        setTide({
            ...tide,
            comment: item,
        })
    }, 600)
    const handleCancel = () => {
        setIsWriteMode(false)
        initTide()
    }
    const [createWeatherTide, { loading: createWeatherTideLoading }] =
        useMutation(CreateWeatherTide, {
            onCompleted: (response) => {
                setIsWriteMode(false)
                setRefreshList(true)
            },
            onError: (error) => {
                console.error('CreateWeatherTide Error', error)
            },
        })
    const [updateWeatherTide, { loading: updateWeatherTideLoading }] =
        useMutation(UpdateWeatherTide, {
            onCompleted: (response) => {
                setIsWriteMode(false)
                setRefreshList(true)
            },
            onError: (error) => {
                console.error('UpdateWeatherTide Error', error)
            },
        })
    const handleSave = async () => {
        if (+tide.id === 0) {
            await createWeatherTide({
                variables: {
                    input: {
                        ...tide,
                    },
                },
            })
        } else {
            if (tide.geoLocation) delete tide.geoLocation
            if (tide.__typename) delete tide.__typename
            await updateWeatherTide({
                variables: {
                    input: {
                        ...tide,
                    },
                },
            })
        }
    }
    const handleFirstHighTideTimeChange = (value: any) => {
        const time = dayjs(value).format('HH:mm')
        setTide({
            ...tide,
            firstHighTideTime: time,
        })
    }
    const handleFirstHighTideHeightChange = (value: number) => {
        setTide({
            ...tide,
            firstHighTideHeight: value,
        })
    }
    const handleSecondHighTideTimeChange = (value: any) => {
        const time = dayjs(value).format('HH:mm')
        setTide({
            ...tide,
            secondHighTideTime: time,
        })
    }
    const handleSecondHighTideHeightChange = (value: number) => {
        setTide({
            ...tide,
            secondHighTideHeight: value,
        })
    }
    const handleFirstLowTideTimeChange = (value: any) => {
        const time = dayjs(value).format('HH:mm')
        setTide({
            ...tide,
            firstLowTideTime: time,
        })
    }
    const handleFirstLowTideHeightChange = (value: number) => {
        setTide({
            ...tide,
            firstLowTideHeight: value,
        })
    }
    const handleSecondLowTideTimeChange = (value: any) => {
        const time = dayjs(value).format('HH:mm')
        setTide({
            ...tide,
            secondLowTideTime: time,
        })
    }
    const handleSecondLowTideHeightChange = (value: number) => {
        setTide({
            ...tide,
            secondLowTideHeight: value,
        })
    }
    const formatTime = (time: string) => {
        return dayjs(`${dayjs().format('YYYY-MM-DD')} ${time}`).format('HH:mm')
    }
    const handleTideClick = (tide: any) => {
        setTideDate(new Date(tide.tideDate))
        const newTide = {
            ...tide,
            firstHighTideTime: formatTime(tide.firstHighTideTime),
            firstLowTideTime: formatTime(tide.firstLowTideTime),
            secondHighTideTime: formatTime(tide.secondHighTideTime),
            secondLowTideTime: formatTime(tide.secondLowTideTime),
        }
        setTide(newTide)
        setIsWriteMode(true)
    }
    const [deleteWeatherTides, { loading: deleteWeatherTidesLoading }] =
        useMutation(DeleteWeatherTides, {
            onCompleted: (response) => {
                setIsWriteMode(false)
                setRefreshList(true)
            },
            onError: (error) => {
                console.error('DeleteWeatherTides Error', error)
            },
        })
    const handleDeleteTide = async () => {
        await deleteWeatherTides({
            variables: {
                ids: [tide.id],
            },
        })
    }
    useEffect(() => {
        if (logBookEntryID > 0) {
            setTide({
                ...tide,
                logBookEntryID: logBookEntryID,
            })
        }
    }, [logBookEntryID])
    return (
        <div>
            {!isWriteMode && (
                <div className="flex justify-end">
                    <button
                        className={`${classes.addButton}`}
                        onClick={() => {
                            createTide()
                        }}>
                        Add Tide
                    </button>
                </div>
            )}

            {isWriteMode && (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white">
                        <div>
                            <label>Date</label>
                        </div>
                        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                            <div className="flex md:items-center flex-col md:flex-row gap-4">
                                <div className="w-64">
                                    <DatePicker onChange={handleOnChangeDate}>
                                        <Group>
                                            <Button className={`w-full`}>
                                                <input
                                                    id="start-date"
                                                    name="date"
                                                    type="text"
                                                    value={formatDate(tideDate)}
                                                    className={classes.input}
                                                    aria-describedby="start-date-error"
                                                    required
                                                    onChange={
                                                        handleOnChangeDate
                                                    }
                                                />
                                            </Button>
                                        </Group>
                                        <Popover>
                                            <Dialog>
                                                <div className="relative p-4 w-full max-w-2xl max-h-full bg-gray-50 rounded dark:bg-gray-800">
                                                    <Calendar
                                                        maxValue={today(
                                                            getLocalTimeZone(),
                                                        )}>
                                                        <header className="flex items-center gap-1 pb-4 px-1 font-serif w-full">
                                                            <Button slot="previous">
                                                                <ChevronLeftIcon className="w-5" />
                                                            </Button>
                                                            <Heading className="flex-1 font-semibold text-center text-2xl ml-2" />
                                                            <Button slot="next">
                                                                <ChevronRightIcon className="w-5" />
                                                            </Button>
                                                        </header>
                                                        <CalendarGrid className="border-spacing-1 border-separate">
                                                            <CalendarGridHeader>
                                                                {(day) => (
                                                                    <CalendarHeaderCell className="text-xs text-gray-500 font-semibold">
                                                                        {day}
                                                                    </CalendarHeaderCell>
                                                                )}
                                                            </CalendarGridHeader>
                                                            <CalendarGridBody>
                                                                {(date) => (
                                                                    <CalendarCell
                                                                        date={
                                                                            date
                                                                        }
                                                                        className="w-9 h-9 outline-none cursor-default rounded-full flex items-center justify-center outside-month:text-gray-300 hover:bg-gray-100 pressed:bg-gray-200 selected:bg-violet-700 selected:text-white focus-visible:ring ring-violet-600/70 ring-offset-2"
                                                                    />
                                                                )}
                                                            </CalendarGridBody>
                                                        </CalendarGrid>
                                                    </Calendar>
                                                </div>
                                            </Dialog>
                                        </Popover>
                                    </DatePicker>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label>Location</label>
                        </div>
                        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                            <div className="flex md:items-center flex-col md:flex-row gap-4">
                                <LocationField
                                    currentTrip={{}}
                                    updateTripReport={{}}
                                    tripReport={{}}
                                    setCurrentLocation={
                                        handleSetCurrentLocation
                                    }
                                    handleLocationChange={handleLocationChange}
                                    currentLocation={currentLocation}
                                    currentEvent={{
                                        geoLocationID: tide.geoLocationID,
                                        lat: tide.lat,
                                        long: tide.long,
                                    }}
                                />
                                {isWriteMode && isStormGlassButtonEnabled() && (
                                    <div className="flex justify-end">
                                        <button
                                            className={`${classes.addButton}`}
                                            onClick={() => {
                                                getStormGlassData()
                                            }}
                                            disabled={
                                                isStormGlassLoading ||
                                                createWeatherTideLoading ||
                                                updateWeatherTideLoading ||
                                                deleteWeatherTidesLoading
                                            }>
                                            {isStormGlassLoading
                                                ? 'Retrieving Tide Data...'
                                                : 'Retrieve Tide Data'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-4">
                            <label>1st High Tide</label>
                        </div>
                        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                            <div className="flex md:items-center flex-col md:flex-row gap-4 w-full">
                                <div>
                                    <TimeField
                                        time={tide.firstHighTideTime}
                                        handleTimeChange={
                                            handleFirstHighTideTimeChange
                                        }
                                        timeID="firstHighTideTime"
                                        fieldName="Time"
                                        hideButton
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        value={tide.firstHighTideHeight}
                                        className={classes.input}
                                        onChange={(event: any) => {
                                            handleFirstHighTideHeightChange(
                                                +event.target.value,
                                            )
                                        }}
                                        step={0.01}
                                    />
                                    <div className="ml-1">meters</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label>1st Low Tide</label>
                        </div>
                        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                            <div className="flex md:items-center flex-col md:flex-row gap-4 w-full">
                                <div>
                                    <TimeField
                                        time={tide.firstLowTideTime}
                                        handleTimeChange={
                                            handleFirstLowTideTimeChange
                                        }
                                        timeID="firstLowTideTime"
                                        fieldName="Time"
                                        hideButton
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        value={tide.firstLowTideHeight}
                                        className={classes.input}
                                        onChange={(event: any) => {
                                            handleFirstLowTideHeightChange(
                                                +event.target.value,
                                            )
                                        }}
                                        step={0.01}
                                    />
                                    <div className="ml-1">meters</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label>2nd High Tide</label>
                        </div>
                        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                            <div className="flex md:items-center flex-col md:flex-row gap-4 w-full">
                                <div>
                                    <TimeField
                                        time={tide.secondHighTideTime}
                                        handleTimeChange={
                                            handleSecondHighTideTimeChange
                                        }
                                        timeID="secondHighTideTime"
                                        fieldName="Time"
                                        hideButton
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        value={tide.secondHighTideHeight}
                                        className={classes.input}
                                        onChange={(event: any) => {
                                            handleSecondHighTideHeightChange(
                                                +event.target.value,
                                            )
                                        }}
                                        step={0.01}
                                    />
                                    <div className="ml-1">meters</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label>2nd Low Tide</label>
                        </div>
                        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                            <div className="flex md:items-center flex-col md:flex-row gap-4 w-full">
                                <div>
                                    <TimeField
                                        time={tide.secondLowTideTime}
                                        handleTimeChange={
                                            handleSecondLowTideTimeChange
                                        }
                                        timeID="secondLowTideTime"
                                        fieldName="Time"
                                        hideButton
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        value={tide.secondLowTideHeight}
                                        className={classes.input}
                                        onChange={(event: any) => {
                                            handleSecondLowTideHeightChange(
                                                +event.target.value,
                                            )
                                        }}
                                        step={0.01}
                                    />
                                    <span className="ml-1">meters</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label>Comment</label>
                        </div>
                        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3 mt-4">
                            <div className="flex md:items-center flex-col md:flex-row gap-4">
                                <textarea
                                    id={`tide-comment`}
                                    rows={4}
                                    className={classes.textarea}
                                    placeholder="Comments ..."
                                    defaultValue={tide.comment || ''}
                                    onChange={(e: any) =>
                                        handleSetComment(e.target.value)
                                    }></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="flex my-4 justify-end">
                        <button
                            className="mr-4"
                            onClick={handleCancel}
                            disabled={
                                isStormGlassLoading ||
                                createWeatherTideLoading ||
                                updateWeatherTideLoading ||
                                deleteWeatherTidesLoading
                            }>
                            Cancel
                        </button>
                        {+tide.id > 0 && (
                            <DialogTrigger>
                                <SeaLogsButton
                                    type="secondary"
                                    color="rose"
                                    icon="trash"
                                    text="Delete"
                                    isDisabled={
                                        isStormGlassLoading ||
                                        createWeatherTideLoading ||
                                        updateWeatherTideLoading ||
                                        deleteWeatherTidesLoading
                                    }
                                />
                                <ModalOverlay
                                    className={({ isEntering, isExiting }) => `
                            fixed inset-0 z-[15002] overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur
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
                                                        Delete Tide Data
                                                    </Heading>
                                                    <p className="mt-3 text-slate-500">
                                                        Are you sure you want to
                                                        delete the tide data for{' '}
                                                        {formatDate(
                                                            tide.tideDate,
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
                                                                handleDeleteTide()
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
                            text={`${+tide.id === 0 ? 'Create' : 'Update'} Tide`}
                            color="sky"
                            action={handleSave}
                            isDisabled={
                                isStormGlassLoading ||
                                createWeatherTideLoading ||
                                updateWeatherTideLoading ||
                                deleteWeatherTidesLoading
                            }
                        />
                    </div>
                </div>
            )}
            {!isWriteMode && (
                <div className="mt-4">
                    <WeatherTideList
                        logBookEntryID={logBookEntryID}
                        refreshList={refreshList}
                        onClick={handleTideClick}
                    />
                </div>
            )}
        </div>
    )
}

export default Tide
