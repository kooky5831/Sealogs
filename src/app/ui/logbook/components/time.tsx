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

export default function TimeField({
    time = dayjs().format('HH:mm'),
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
        <div className="flex flex-row gap-2 items-center">
            <DialogTrigger>
                <Button>
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
                        className={classes.input + ' w-auto'}
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
            {!hideButton && (
                <div className="flex flex-wrap flex-row">
                    <SeaLogsButton
                        text={buttonLabel}
                        type="secondary"
                        color="sky"
                        action={() => {
                            handleTimeChange(dayjs())
                        }}
                        className="text-nowrap"
                    />
                </div>
            )}
        </div>
    )
}
