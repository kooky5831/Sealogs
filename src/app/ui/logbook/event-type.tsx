'use client'

import { classes } from '@/app/components/GlobalClasses'
import { getFieldName } from '@/app/lib/actions'
import React, { useEffect, useState } from 'react'
import Select from 'react-select'

export default function EventType({
    eventTypes = false,
    currentTrip,
    logBookConfig,
}: {
    eventTypes: any
    currentTrip: any
    logBookConfig: any
}) {
    const [newEvent, setNewEvent] = useState(false)
    const [eventConfig, setEventConfig] = useState<any>(false)
    const [events, setEvents] = useState<any>(false)

    useEffect(() => {
        if (logBookConfig) {
            const eventList =
                logBookConfig.customisedLogBookComponents.nodes.find(
                    (section: any) =>
                        section.componentClass === 'EventType_LogBookComponent',
                )?.customisedComponentFields?.nodes
            setEventConfig(eventList)
            setEvents(
                eventList?.map((event: any) => ({
                    label: getFieldName(event),
                    value: event.id,
                })),
            )
        }
    }, [logBookConfig])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white">
            <label className="hidden md:block">Activity Type</label>
            <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                <div className="flex items-center">
                    <Select
                        id="task-assigned"
                        options={events}
                        // value={selectedLocation}
                        // onChange={handleLocationChange}
                        menuPlacement="top"
                        placeholder="Select Location"
                        className={`${classes.input} !w-64`}
                        classNames={{
                            control: () =>
                                'flex py-1 w-64 !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                            singleValue: () => 'dark:!text-white',
                            dropdownIndicator: () => '!p-0 !hidden',
                            menu: () => classes.selectMenu,
                            option: () => classes.selectOption,
                            indicatorSeparator: () => '!hidden',
                            multiValue: () =>
                                '!bg-sky-100 inline-flex rounded p-1 m-0 !mr-1.5 border border-sky-300 !rounded-md !text-sky-900 font-normal mr-2',
                            clearIndicator: () => '!py-0',
                            valueContainer: () => '!py-0',
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
