import { useState } from 'react'
import { Button } from 'react-aria-components'
import WeatherForecast from '../weather/forecast'
import WeatherObservation from '../weather/observation'
import Tide from '../weather/tide'
import { useOnline } from '@reactuses/core'
const LogBookWeather = ({
    logBookConfig,
    logbook,
    offline = false,
}: {
    logBookConfig: any
    logbook: any
    offline?: boolean
}) => {
    const [tab, setTab] = useState('forecast_observation')
    const tabClasses = {
        inactive:
            'inline-flex items-center px-4 py-3 border border-slblue-200 rounded-md hover:text-slblue-900 bg-white hover:bg-slblue-1000 hover:text-white w-full dark:bg-slblue-800 dark:hover:bg-slblue-700 dark:hover:text-white ring-1 ring-transparent hover:ring-slblue-1000',
        active: 'inline-flex items-center px-4 py-3 border border-slblue-200 rounded-md text-white bg-slblue-800 w-full dark:bg-slblue-1000',
    }
    const isOnline = useOnline()
    const displayField = (fieldName: string) => {
        const element =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'Weather_LogBookComponent',
            )
        if (
            element?.length > 0 &&
            element[0]?.customisedComponentFields?.nodes.filter(
                (field: any) =>
                    field.fieldName === fieldName && field.status !== 'Off',
            ).length > 0
        ) {
            return true
        }
        return false
    }

    return (
        <>
            <div className="flex justify-start flex-col md:flex-row items-start border-b border-slblue-200 pb-4">
                <div>
                    <ul className="block sm:flex flex-nowrap flex-col sm:flex-row items-stretch sm:items-center w-full justify-center gap-0 sm:gap-2 lg:gap-3 text-sm font-medium text-center text-slblue-500 dark:text-slblue-100">
                        <li className="w-full md:w-auto me-2 mb-2">
                            <Button
                                className={`${tab === 'forecast_observation' ? tabClasses.active : tabClasses.inactive}`}
                                onPress={() => {
                                    tab === 'forecast_observation'
                                        ? setTab('')
                                        : setTab('forecast_observation')
                                }}>
                                Forecasts & observations
                            </Button>
                        </li>
                        {displayField('Tides') && (
                            <li className="w-full md:w-auto me-2 mb-2">
                                <Button
                                    className={`${tab === 'tide' ? tabClasses.active : tabClasses.inactive}`}
                                    onPress={() => {
                                        tab === 'tide'
                                            ? setTab('')
                                            : setTab('tide')
                                    }}>
                                    Tides
                                </Button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {tab === 'forecast_observation' && (
                <div className="mt-4">
                    <div>
                        <WeatherForecast
                            offline={offline}
                            logBookEntryID={logbook.id}
                        />
                    </div>
                </div>
            )}
            {tab === 'tide' && (
                <div className="mt-4">
                    <Tide logBookEntryID={logbook.id} />
                </div>
            )}
        </>
    )
}

export default LogBookWeather
