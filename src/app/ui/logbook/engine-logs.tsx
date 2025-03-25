'use client'

import React, { useState } from 'react'
import { Heading } from 'react-aria-components'
import { LogBookEntrySections } from '@/app/lib/definitions'
import { classes } from '@/app/components/GlobalClasses'

export default function EngineLogs({
    logEntry,
    locked,
}: {
    logEntry: any
    locked: boolean
}) {
    console.log(logEntry)
    const [hoursStart, setHoursStart] = useState<Number>(
        Number(logEntry.engineStartStop?.hoursStart),
    )
    const [hoursEnd, setHoursEnd] = useState<Number>(
        Number(logEntry.engineStartStop?.hoursEnd),
    )

    const updateHoursStart = (e: any) => {
        setHoursStart(e.target.value)
    }
    const updateHoursEnd = (e: any) => {
        setHoursEnd(e.target.value)
    }

    return (
        <div
            className={`flex flex-col items-start dark:text-white ${locked ? 'pointer-events-none' : ''}`}>
            <div className="w-full p-0 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full p-4 text-lg border-b">
                    <Heading className="text-xl">
                        {logEntry.engine.title}
                    </Heading>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white p-4">
                    <label className="">Hours Start</label>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                        <div className="flex items-center">
                            <input
                                type="number"
                                id={`${logEntry.engine.id}-hours_start-input`}
                                aria-describedby="helper-text-explanation"
                                className={classes.input}
                                placeholder="0"
                                defaultValue={Number(
                                    logEntry.engineStartStop?.hoursStart,
                                )}
                                required
                                onChange={updateHoursStart}
                            />
                        </div>
                    </div>
                </div>
                <hr className="" />
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white p-4">
                    <label className="">Hours End</label>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                        <div className="flex items-center">
                            <input
                                type="number"
                                id={`${logEntry.engine.id}-hours_end-input`}
                                aria-describedby="helper-text-explanation"
                                className={classes.input}
                                placeholder="0"
                                defaultValue={Number(
                                    logEntry.engineStartStop?.hoursEnd,
                                )}
                                onChange={updateHoursEnd}
                                required
                            />
                        </div>
                    </div>
                </div>
                <hr className="" />
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white p-4">
                    <label className="">Hours Run</label>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                        {Number(hoursEnd) - Number(hoursStart)}
                    </div>
                </div>
                <hr className="" />
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white p-4">
                    <label className="">Fuel Start</label>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                        <div className="flex items-center">
                            <input
                                type="number"
                                id={`${logEntry.engine.id}-fuel_start-input`}
                                aria-describedby="helper-text-explanation"
                                className={classes.input}
                                placeholder="0"
                                defaultValue={Number(logEntry.fuelStart)}
                                required
                            />
                        </div>
                    </div>
                </div>
                <hr className="" />
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white p-4">
                    <label className="">Fuel End</label>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                        <div className="flex items-center">
                            <input
                                type="number"
                                id={`${logEntry.engine.id}-fuel_end-input`}
                                aria-describedby="helper-text-explanation"
                                className={classes.input}
                                placeholder="0"
                                defaultValue={Number(logEntry.fuelEnd)}
                                required
                            />
                        </div>
                    </div>
                </div>
                <hr className="" />
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white p-4">
                    <label className="">Comments</label>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                        <div className="flex items-center">
                            <textarea
                                id={`${logEntry.engine.id}-comment`}
                                rows={4}
                                className={classes.textarea}
                                placeholder="Write your thoughts here..."></textarea>
                        </div>
                    </div>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between px-4 mb-4">
                    <button
                        type="button"
                        className="w-48 text-sm font-semibold text-white bg-sky-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="w-48 text-sm font-semibold text-white bg-sky-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}
