'use client'
import React, { useState } from 'react'
import { Button } from 'react-aria-components'

export default function WeatherConditions({
    logBookConfig,
    offline = false,
}: {
    logBookConfig: any
    offline?: boolean
}) {
    const [tides, setTides] = useState<Boolean>()
    const [weatherConditions, setWeatherConditions] = useState<Boolean>()

    const [additionalComment, setAdditionalComment] = useState<Boolean>(false)

    const handleTides = (check: Boolean) => {
        setTides(check)
    }
    const handleWeatherConditions = (check: Boolean) => {
        setWeatherConditions(check)
    }

    const classes = {
        fieldWrapper:
            'grid grid-cols-1 my-4 md:grid-cols-2 lg:grid-cols-3 items-start dark:text-white',
        inputWrapper: 'flex flex-col grid-cols-1 md:col-span-1 lg:col-span-2',
        inputWrapperInner: 'flex items-center justify-between',
        radio: 'flex items-center me-4',
        radioInput:
            'w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600',
        radioLabel: 'ms-2 text-sm font-medium text-gray-900 dark:text-gray-300',
        textarea:
            'block p-2.5 w-full mt-4 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-white dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
        input: 'w-64 peer flex justify-between rounded-md border border-gray-200 p-2 text-sm outline-2 placeholder:text-gray-500',
    }

    return (
        <>
            <div className="px-4">
                <div className={`${classes.fieldWrapper}`}>
                    <label className="hidden md:block">
                        Check tides (GPS-based or manual)
                    </label>
                    <div className={`${classes.inputWrapper}`}>
                        <div className={`${classes.inputWrapperInner}`}>
                            <span className="mr-4 md:hidden">
                                Check tides (GPS-based or manual)
                            </span>
                            <div className="flex">
                                <div className={`${classes.radio}`}>
                                    <input
                                        id={`tides-no_radio`}
                                        type="radio"
                                        name={`tides-radio`}
                                        onChange={() => handleTides(false)}
                                        className={`${classes.radioInput}`}
                                    />
                                    <label
                                        htmlFor={`tides-no_radio`}
                                        className={`${classes.radioLabel}`}>
                                        No
                                    </label>
                                </div>
                                <div className={`${classes.radio}`}>
                                    <input
                                        id={`tides-yes_radio`}
                                        type="radio"
                                        name={`tides-radio`}
                                        onChange={() => handleTides(true)}
                                        className={`${classes.radioInput}`}
                                    />
                                    <label
                                        htmlFor={`tides-yes_radio`}
                                        className={`${classes.radioLabel}`}>
                                        Yes
                                    </label>
                                </div>
                            </div>
                        </div>
                        {tides === false && (
                            <textarea
                                id={`tides-comment`}
                                rows={4}
                                className={`${classes.textarea}`}
                                placeholder="Comment"></textarea>
                        )}
                    </div>
                </div>
                <div className={`${classes.fieldWrapper}`}>
                    <label className="hidden md:block">
                        Assess weather conditions (automated systems)
                    </label>
                    <div className={`${classes.inputWrapper}`}>
                        <div className={`${classes.inputWrapperInner}`}>
                            <span className="mr-4 md:hidden">
                                Assess weather conditions (automated systems)
                            </span>
                            <div className="flex">
                                <div className={`${classes.radio}`}>
                                    <input
                                        id={`weatherConditions-no_radio`}
                                        type="radio"
                                        name={`weatherConditions-radio`}
                                        onChange={() =>
                                            handleWeatherConditions(false)
                                        }
                                        className={`${classes.radioInput}`}
                                    />
                                    <label
                                        htmlFor={`weatherConditions-no_radio`}
                                        className={`${classes.radioLabel}`}>
                                        No
                                    </label>
                                </div>
                                <div className={`${classes.radio}`}>
                                    <input
                                        id={`weatherConditions-yes_radio`}
                                        type="radio"
                                        name={`weatherConditions-radio`}
                                        onChange={() =>
                                            handleWeatherConditions(true)
                                        }
                                        className={`${classes.radioInput}`}
                                    />
                                    <label
                                        htmlFor={`weatherConditions-yes_radio`}
                                        className={`${classes.radioLabel}`}>
                                        Yes
                                    </label>
                                </div>
                            </div>
                        </div>
                        {weatherConditions === false && (
                            <textarea
                                id={`weatherConditions-comment`}
                                rows={4}
                                className={`${classes.textarea}`}
                                placeholder="Comment"></textarea>
                        )}
                    </div>
                </div>

                {!additionalComment && (
                    <div className={`${classes.fieldWrapper}`}>
                        <label className="hidden md:block"></label>
                        <div className={`${classes.inputWrapper}`}>
                            <div className={`${classes.inputWrapperInner}`}>
                                <Button
                                    className="w-48 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    onPress={() => setAdditionalComment(true)}>
                                    Add Comment
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
                {additionalComment && (
                    <div className={`${classes.fieldWrapper}`}>
                        <label className="hidden md:block">
                            Additional Comments
                        </label>
                        <div className={`${classes.inputWrapper}`}>
                            <div className={`${classes.inputWrapperInner}`}>
                                <textarea
                                    id={`comments`}
                                    rows={4}
                                    className={`${classes.textarea} mt-0`}
                                    placeholder="Comments ..."></textarea>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <hr className="my-4" />
            <div className="flex justify-between px-4">
                <button
                    type="button"
                    className="w-48 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Cancel
                </button>
                <button
                    type="button"
                    className="w-48 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Save
                </button>
            </div>
        </>
    )
}
