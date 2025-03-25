'use client'
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { UpdateTripReport_LogBookEntrySection } from '@/app/lib/graphQL/mutation'
import { useMutation } from '@apollo/client'
import toast, { Toaster } from 'react-hot-toast'
import TimeField from './components/time'
import TripReport_LogBookEntrySectionModel from '@/app/offline/models/tripReport_LogBookEntrySection'

export default function DepartTime({
    currentTrip,
    updateTripReport,
    tripReport,
    templateStyle = false,
    offline = false,
}: {
    currentTrip: any
    updateTripReport?: any
    tripReport: any
    templateStyle: boolean | string
    offline?: boolean
}) {
    const [time, setTime] = useState<any>(false)
    const tripReportModel = new TripReport_LogBookEntrySectionModel()
    const handleTimeChange = async (date: any) => {
        const departTime = dayjs(date).format('HH:mm')
        setTime(departTime)
        if (offline) {
            const data = await tripReportModel.save({
                id: currentTrip.id,
                departTime: departTime,
            })
            updateTripReport({
                id: [...tripReport.map((trip: any) => trip.id), data.id],
                currentTripID: currentTrip.id,
                key: 'departTime',
                value: departTime,
            })
            toast.success('Departure time updated')
        } else {
            updateTripReport_LogBookEntrySection({
                variables: {
                    input: {
                        id: currentTrip.id,
                        departTime: departTime,
                    },
                },
            })
        }
    }

    const [updateTripReport_LogBookEntrySection] = useMutation(
        UpdateTripReport_LogBookEntrySection,
        {
            onCompleted: (data) => {
                // updateTripReport({
                //     id: tripReport?.map((trip: any) => trip.id),
                //     currentTripID: currentTrip.id,
                //     key: 'departTime',
                //     value: dayjs(
                //         `${dayjs().format('YYYY-MM-DD')} ${time}`,
                //     ).format('HH:mm'),
                // })
                toast.success('Departure time updated')
            },
            onError: (error) => {
                console.error('onError', error)
            },
        },
    )

    useEffect(() => {
        if (tripReport) {
            if (
                time !==
                tripReport?.find((trip: any) => trip.id === currentTrip.id)
                    ?.departTime
                    ? convertTimeFormat(
                          tripReport.find(
                              (trip: any) => trip.id === currentTrip.id,
                          )?.departTime,
                      )
                    : ''
            ) {
                setTime(
                    tripReport?.find((trip: any) => trip.id === currentTrip.id)
                        ?.departTime
                        ? convertTimeFormat(
                              tripReport.find(
                                  (trip: any) => trip.id === currentTrip.id,
                              ).departTime,
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
        <>
            <TimeField
                time={
                    time
                        ? time
                        : tripReport?.find(
                                (trip: any) => trip.id === currentTrip.id,
                            )?.departTime
                          ? convertTimeFormat(
                                tripReport.find(
                                    (trip: any) => trip.id === currentTrip.id,
                                ).departTime,
                            )
                          : ''
                }
                handleTimeChange={handleTimeChange}
                timeID="depart-time"
                fieldName="Select depart time"
                buttonLabel="Depart Now"
            />
            <Toaster position="top-right" />
        </>
    )
}
