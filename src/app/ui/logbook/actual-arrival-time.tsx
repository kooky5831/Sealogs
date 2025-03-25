'use client'

import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { UpdateTripReport_LogBookEntrySection } from '@/app/lib/graphQL/mutation'
import { useMutation } from '@apollo/client'
import toast, { Toaster } from 'react-hot-toast'
import TimeField from './components/time'
import { classes } from '@/app/components/GlobalClasses'
import TripReport_LogBookEntrySectionModel from '@/app/offline/models/tripReport_LogBookEntrySection'

export default function ActualArrival({
    currentTrip,
    updateTripReport,
    tripReport,
    offline = false,
}: {
    currentTrip: any
    updateTripReport?: any
    tripReport: any
    offline?: boolean
}) {
    const tripReportModel = new TripReport_LogBookEntrySectionModel()
    const [time, setTime] = useState<any>(false)
    const handleTimeChange = async (date: any) => {
        const arrive = dayjs(date).format('YYYY-MM-DD HH:mm') // Mukul: This is the format that the backend expects
        if (offline) {
            const data = await tripReportModel.save({
                id: currentTrip.id,
                arrive: arrive,
            })
            updateTripReport({
                id: [...tripReport.map((trip: any) => trip.id), data.id],
                currentTripID: currentTrip.id,
                key: 'arrive',
                value: arrive,
            })
        } else {
            updateTripReport_LogBookEntrySection({
                variables: {
                    input: {
                        id: currentTrip.id,
                        arrive: arrive,
                    },
                },
            })
        }
        setTime(dayjs(date).format('HH:mm'))
    }

    const [updateTripReport_LogBookEntrySection] = useMutation(
        UpdateTripReport_LogBookEntrySection,
        {
            onCompleted: (data) => {
                console.log('onCompleted', data)
            },
            onError: (error) => {
                console.log('onError', error)
            },
        },
    )

    useEffect(() => {
        if (tripReport) {
            if (
                time !==
                tripReport?.find((trip: any) => trip.id === currentTrip.id)
                    ?.arrive
                    ? convertTimeFormat(
                          tripReport?.find(
                              (trip: any) => trip.id === currentTrip.id,
                          )?.arrive,
                      )
                    : ''
            ) {
                setTime(
                    tripReport?.find((trip: any) => trip.id === currentTrip.id)
                        ?.arrive
                        ? convertTimeFormat(
                              tripReport?.find(
                                  (trip: any) => trip.id === currentTrip.id,
                              )?.arrive,
                          )
                        : '',
                )
            }
        }
    }, [tripReport])

    const convertTimeFormat = (time: string) => {
        return dayjs(time).format('HH:mm')
    }

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center">
            <label className={classes.label}>Actual arrival time</label>
            <TimeField
                time={
                    time
                        ? time
                        : tripReport?.find(
                                (trip: any) => trip.id === currentTrip.id,
                            )?.arrive
                          ? convertTimeFormat(
                                tripReport?.find(
                                    (trip: any) => trip.id === currentTrip.id,
                                )?.arrive,
                            )
                          : ''
                }
                handleTimeChange={handleTimeChange}
                timeID="arrive-time"
                fieldName="Select arrival time"
                buttonLabel="Arrived Now"
            />
            <Toaster position="top-right" />
        </div>
    )
}
