'use client'

import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { UpdateTripReport_LogBookEntrySection } from '@/app/lib/graphQL/mutation'
import { useMutation } from '@apollo/client'
import toast, { Toaster } from 'react-hot-toast'
import TimeField from './components/time'
import { classes } from '@/app/components/GlobalClasses'
import TripReport_LogBookEntrySectionModel from '@/app/offline/models/tripReport_LogBookEntrySection'

export default function ExpectedArrival({
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
        const arriveTime = dayjs(date).format('HH:mm')
        setTime(arriveTime)
        if (offline) {
            const data = await tripReportModel.save({
                id: currentTrip.id,
                arriveTime: arriveTime,
            })
            updateTripReport({
                id: [...tripReport.map((trip: any) => trip.id), data.id],
                currentTripID: currentTrip.id,
                key: 'arriveTime',
                value: arriveTime,
            })
        } else {
            updateTripReport_LogBookEntrySection({
                variables: {
                    input: {
                        id: currentTrip.id,
                        arriveTime: arriveTime,
                    },
                },
            })
        }
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
                    ?.arriveTime
                    ? convertTimeFormat(
                          tripReport?.find(
                              (trip: any) => trip.id === currentTrip.id,
                          )?.arriveTime,
                      )
                    : ''
            ) {
                setTime(
                    tripReport?.find((trip: any) => trip.id === currentTrip.id)
                        ?.arriveTime
                        ? convertTimeFormat(
                              tripReport?.find(
                                  (trip: any) => trip.id === currentTrip.id,
                              )?.arriveTime,
                          )
                        : '',
                )
            }
        }
    }, [tripReport])

    const convertTimeFormat = (time: string) => {
        if (time === null || time === undefined) return ''
        const [hours, minutes, seconds] = time.split(':')
        return `${hours}:${minutes}`
    }

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center">
            <label className={classes.label}>Expected arrival time</label>
            <TimeField
                time={
                    time
                        ? time
                        : tripReport?.find(
                                (trip: any) => trip.id === currentTrip.id,
                            )?.arriveTime
                          ? convertTimeFormat(
                                tripReport?.find(
                                    (trip: any) => trip.id === currentTrip.id,
                                )?.arriveTime,
                            )
                          : ''
                }
                handleTimeChange={handleTimeChange}
                timeID="arrival-time"
                fieldName="Select arrival time"
                hideButton={true}
            />
            <Toaster position="top-right" />
        </div>
    )
}
