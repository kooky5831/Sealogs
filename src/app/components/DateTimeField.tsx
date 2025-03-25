'use client'
import React from 'react'
import {
    Button,
    DialogTrigger,
    ModalOverlay,
    Modal,
    Dialog,
} from 'react-aria-components'
import { classes } from '@/app/components/GlobalClasses'
import { LocalizationProvider, StaticDateTimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { SeaLogsButton } from '@/app/components/Components'
import { formatDateTime } from '../helpers/dateHelper'
import { type } from 'os'

export default function DateTimeField({
    date = false,
    handleDateChange,
    dateID,
    fieldName = 'Select date',
    buttonLabel = 'Set To Now',
    hideButton = false,
}: {
    date: any
    handleDateChange: any
    dateID: any
    fieldName: any
    buttonLabel?: any
    hideButton?: any
}) {
    return (
        <div className="flex">
            <DialogTrigger>
                <Button className={`w-full`}>
                    <input
                        id={dateID}
                        name={dateID}
                        type="text"
                        value={
                            date &&
                            new Date(
                                typeof date === 'string'
                                    ? date
                                    : dayjs(date).toISOString(),
                            ).getTime() > 0
                                ? formatDateTime(date)
                                : ''
                        }
                        className={classes.input + ' !min-w-24'}
                        aria-describedby="time-error"
                        required
                        placeholder={fieldName}
                        onChange={() => handleDateChange}
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
                                        onAccept={handleDateChange}
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
                        handleDateChange(dayjs())
                    }}
                    className="w-full md:w-auto ml-2 !mr-0 text-nowrap"
                />
            )}
        </div>
    )
}
