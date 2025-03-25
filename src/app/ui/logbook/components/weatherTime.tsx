'use client'
import React, { useEffect, useState } from 'react'
import {
    Button,
    DialogTrigger,
    ModalOverlay,
    Modal,
    Dialog,
} from 'react-aria-components'
import { classes } from '@/app/components/GlobalClasses'
import { LocalizationProvider, StaticTimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { SeaLogsButton } from '@/app/components/Components'
import Select, { OptionsOrGroups } from 'react-select'
import { formatDate } from '@/app/helpers/dateHelper'

export default function TimeField({
    time = dayjs().format('HH:mm'),
    day = dayjs().format('YYYY-MM-DD'),
    handleTimeChange,
    handleDayChange,
    timeID,
    fieldName = 'Time',
    dayFieldName = 'Day',
    buttonLabel = 'Set Time To Now',
    hideButton = false,
}: {
    time: any
    day: any
    handleTimeChange: any
    handleDayChange: any
    timeID: any
    fieldName: any
    dayFieldName: any
    buttonLabel?: any
    hideButton?: any
}) {
    const currentDay = {
        label: formatDate(day),
        value: new Date(day),
    }
    let currentDate = new Date()
    let nextWeek: any[] = []

    for (let i = 0; i < 7; i++) {
        let date = new Date()
        date.setDate(currentDate.getDate() + i)
        day = dayjs(date)
        nextWeek = nextWeek.concat({
            label: formatDate(day),
            value: day,
        })
    }

    return (
        <div className="flex">
            <DialogTrigger>
                <Button className={`w-full`}>
                    <input
                        id={timeID}
                        name={timeID}
                        type="text"
                        value={
                            time
                                ? dayjs(
                                      `${dayjs().format('YYYY-MM-DD')} ${time}`,
                                  ).format('HH:mm')
                                : ''
                        }
                        className={classes.input + ' !min-w-24'}
                        aria-describedby="time-error"
                        required
                        placeholder={fieldName}
                        onChange={() => handleTimeChange}
                    />
                </Button>
                <ModalOverlay
                    className={({ isEntering, isExiting }) => `
                    fixed inset-0 z-[15002] overflow-y-auto bg-black/25 flex min-h-full justify-center p-4 text-center backdrop-blur
                    ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                    ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                    `}>
                    <Modal>
                        <Dialog
                            role="alertdialog"
                            className="outline-none relative">
                            {({ close }) => (
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}>
                                    <StaticTimePicker
                                        className={`p-0 mr-4`}
                                        onAccept={handleTimeChange}
                                        defaultValue={dayjs()}
                                        onClose={close}
                                    />
                                </LocalizationProvider>
                            )}
                        </Dialog>
                    </Modal>
                </ModalOverlay>
            </DialogTrigger>
            <Select
                id="day"
                closeMenuOnSelect={true}
                options={nextWeek}
                defaultValue={dayFieldName}
                className={
                    classes.selectMain + 'md:w-auto ml-2 !mr-0 text-nowrap'
                }
                classNames={{
                    control: () => classes.selectControl + ' !min-w-48',
                    singleValue: () => classes.selectSingleValue,
                    menu: () => classes.selectMenu,
                    option: () => classes.selectOption,
                }}
                styles={{
                    container: (provided: any) => ({
                        ...provided,
                        width: '100%',
                    }),
                }}
                value={currentDay}
                onChange={handleDayChange}
            />
            {!hideButton && (
                <SeaLogsButton
                    text={buttonLabel}
                    type="secondary"
                    color="sky"
                    action={() => {
                        handleTimeChange(dayjs())
                    }}
                    className="w-full md:w-auto ml-2 !mr-0 text-nowrap"
                />
            )}
            {!hideButton && (
                <SeaLogsButton
                    text={'Set Day To Today'}
                    type="secondary"
                    color="sky"
                    action={() => {
                        handleDayChange(dayjs())
                    }}
                    className="w-full md:w-auto ml-2 !mr-0 text-nowrap"
                />
            )}
        </div>
    )
}
