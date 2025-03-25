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
import {
    LocalizationProvider,
    StaticDateTimePicker,
    StaticTimePicker,
} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { SeaLogsButton } from '@/app/components/Components'
import { formatDateTime } from '@/app/helpers/dateHelper'

export default function DateTimeField({
    time = dayjs(),
    handleTimeChange,
    timeID,
    fieldName = 'Time',
    buttonLabel = 'Set To Now',
    hideButton = false,
}: {
    time: any
    handleTimeChange: any
    timeID: any
    fieldName: any
    buttonLabel?: any
    hideButton?: any
}) {
    interface Option {
        label: any
        value: any
    }

    let currentDate = new Date()
    let nextWeek: Option[] = []

    for (let i = 0; i < 7; i++) {
        let date = new Date()
        date.setDate(currentDate.getDate() + i)
        let setDay = dayjs(date).format('YYYY-MM-DD')
        nextWeek = nextWeek.concat({ label: setDay, value: setDay })
    }

    return (
        <div className="flex">
            <DialogTrigger>
                <Button className={`w-full`}>
                    <input
                        id={timeID}
                        name={timeID}
                        type="text"
                        value={time ? formatDateTime(time) : ''}
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
                                    <StaticDateTimePicker
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
        </div>
    )
}
