import { classes } from '@/app/components/GlobalClasses'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import WeatherObservationList from './observation-list'
import WeatherObservationForm from './observation-form'
const WeatherObservation = ({
    logBookEntryID,
    forecast = {},
    offline = false,
}: {
    logBookEntryID: number
    forecast?: any
    offline?: boolean
}) => {
    const [isWriteMode, setIsWriteMode] = useState(false)
    const [observation, setObservation] = useState({} as any)
    const [refreshList, setRefreshList] = useState(false)
    const getTimeNow = () => {
        return dayjs().format('HH:mm')
    }
    const initObservation = () => {
        setObservation({
            id: 0,
            time: getTimeNow(),
            geoLocationID: 0,
            lat: 0,
            long: 0,
            logBookEntryID: logBookEntryID,
        })
    }
    const createObservation = () => {
        initObservation()
        setIsWriteMode(true)
    }
    const handleCancel = () => {
        initObservation()
        setIsWriteMode(false)
    }
    const handleObservationClick = (observation: any) => {
        const newObservation = {
            ...observation,
            time: formatTime(observation.time),
        }
        setObservation(newObservation)
        setIsWriteMode(true)
    }
    const formatTime = (time: string) => {
        return dayjs(`${dayjs().format('YYYY-MM-DD')} ${time}`).format('HH:mm')
    }
    useEffect(() => {
        if (logBookEntryID > 0) {
            setObservation({
                ...observation,
                logBookEntryID: logBookEntryID,
            })
        }
    }, [logBookEntryID])
    return (
        <div>
            {isWriteMode && (
                <WeatherObservationForm
                    offline={offline}
                    logBookEntryID={logBookEntryID}
                    observationID={+observation.id}
                    forecast={forecast}
                    onSave={() => {
                        setRefreshList(true)
                        handleCancel()
                    }}
                    onCancel={handleCancel}
                />
            )}
            {!isWriteMode && (
                <div className="flex justify-end">
                    <button
                        className={`${classes.addButton}`}
                        onClick={() => {
                            createObservation()
                        }}>
                        Add Observation
                    </button>
                </div>
            )}
            {!isWriteMode && (
                <div className="mt-4">
                    <WeatherObservationList
                        offline={offline}
                        logBookEntryID={logBookEntryID}
                        refreshList={refreshList}
                        onClick={(observation: any) =>
                            handleObservationClick(observation)
                        }
                    />
                </div>
            )}
        </div>
    )
}

export default WeatherObservation
