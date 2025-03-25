'use client'
import { classes } from '@/app/components/GlobalClasses'
import { formatDate } from '@/app/helpers/dateHelper'
import {
    PlusIcon,
    MinusIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline'
import React, { useState } from 'react'
import {
    Button,
    Calendar,
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    DatePicker,
    DateValue,
    Dialog,
    Group,
    Heading,
    Label,
    Popover,
} from 'react-aria-components'

export default function LogDate({
    log_params,
    setStartDate,
    setEndDate,
    edit_logBookEntry = false,
}: {
    log_params: any
    setStartDate: any
    setEndDate: any
    edit_logBookEntry?: boolean
}) {
    const [startValue, setStartValue] = useState(new Date(log_params.startDate))
    const [endValue, setEndValue] = useState(
        new Date(log_params.endDate || log_params.startDate),
    )
    const [showButton, setShowButton] = useState(true)

    // const [showDateModal, setShowDateModal] = useState(false);
    const handleStartChange = (date: DateValue) => {
        setStartValue(new Date(date.toString()))
        setStartDate(new Date(date.toString()))
    }
    const handleEndChange = (date: DateValue) => {
        setEndValue(new Date(date.toString()))
        setEndDate(new Date(date.toString()))
    }
    const handleShowEndDate = () => {
        setShowButton(false)
    }
    const handleHideEndDate = () => {
        setShowButton(true)
    }

    return (
        <div
            className={`flex flex-row gap-2 items-end w-full lg:mb-0 md:mb-0 ${edit_logBookEntry ? '' : 'pointer-events-none'}`}>
            <DatePicker className="w-1/2 md:w-40" onChange={handleStartChange}>
                <Label className={`${classes.label} block`}>
                    {log_params.startLabel}
                </Label>
                <Group>
                    <Button>
                        <input
                            id="start-date"
                            name="start-date"
                            type="text"
                            value={formatDate(startValue)}
                            className={classes.input}
                            aria-describedby="start-date-error"
                            required
                            onChange={() => handleStartChange}
                        />
                    </Button>
                </Group>
                <Popover>
                    <Dialog>
                        <div className="relative p-4 w-full max-w-2xl max-h-full bg-slblue-50 rounded dark:bg-gray-800">
                            <Calendar>
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
                                            <CalendarHeaderCell className="text-xs font-semibold">
                                                {day}
                                            </CalendarHeaderCell>
                                        )}
                                    </CalendarGridHeader>
                                    <CalendarGridBody>
                                        {(date) => (
                                            <CalendarCell
                                                date={date}
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
            {!log_params.showOvernightCheckbox && showButton && (
                <button
                    onClick={handleShowEndDate}
                    className=" text-white bg-slblue-700 hover:bg-slblue-800 focus:outline-none focus:ring-4 focus:ring-slblue-300 rounded-full text-sm p-2.5 text-center dark:bg-slblue-600 dark:hover:bg-slblue-700 dark:focus:ring-slblue-800">
                    <PlusIcon className="w-2 sm:w-4" />
                </button>
            )}
            {!showButton && (
                <DatePicker
                    className="w-1/2 md:w-40"
                    onChange={handleEndChange}>
                    <Label className={`${classes.label} block`}>
                        {log_params.endLabel}
                    </Label>
                    <Group>
                        <Button>
                            <input
                                id="end-date"
                                name="end-date"
                                type="text"
                                value={formatDate(endValue)}
                                className={classes.input}
                                aria-describedby="end-date-error"
                                required
                                onChange={() => handleEndChange}
                            />
                        </Button>
                    </Group>

                    <Popover>
                        <Dialog>
                            <div className="relative p-4 w-full max-w-2xl max-h-full bg-gray-50 rounded dark:bg-gray-800">
                                <Calendar>
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
                                                    date={date}
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
            )}
            {!showButton && (
                <button
                    onClick={handleHideEndDate}
                    className=" text-white bg-slblue-700 hover:bg-slblue-800 focus:outline-none focus:ring-4 focus:ring-slblue-300 rounded-full text-sm px-2 py-2 text-center dark:bg-slblue-600 dark:hover:bg-slblue-700 dark:focus:ring-slblue-800">
                    <MinusIcon className="w-2 sm:w-4" />
                </button>
            )}
        </div>
    )
}
