'use client'

import React, { useEffect, useState } from 'react'
import { UpdateTripReport_LogBookEntrySection } from '@/app/lib/graphQL/mutation'
import { useMutation } from '@apollo/client'
import Editor from '../../editor'
import { classes } from '@/app/components/GlobalClasses'
import TripReport_LogBookEntrySectionModel from '@/app/offline/models/tripReport_LogBookEntrySection'

export default function TripComments({
    currentTrip,
    updateTripReport,
    tripReport,
    setCommentField,
    offline = false,
}: {
    currentTrip: any
    updateTripReport?: any
    tripReport: any
    setCommentField: any
    offline?: boolean
}) {
    const tripReportModel = new TripReport_LogBookEntrySectionModel()
    const [comment, setComment] = useState<any>(false)

    const handleEditorChange = (value: any) => {
        setComment(value)
        setCommentField(value)
    }

    const handleEditorBlur = async (value: any) => {
        if (
            comment !=
            tripReport?.find((trip: any) => trip.id === currentTrip.id)?.comment
        ) {
            if (offline) {
                const data = await tripReportModel.save({
                    id: currentTrip.id,
                    comment: comment,
                })
                updateTripReport({
                    id: [...tripReport.map((trip: any) => trip.id), data.id],
                    currentTripID: currentTrip.id,
                    key: 'comment',
                    value: comment,
                })
            } else {
                updateTripReport_LogBookEntrySection({
                    variables: {
                        input: {
                            id: currentTrip.id,
                            comment: comment,
                        },
                    },
                })
            }
        }
    }

    const [updateTripReport_LogBookEntrySection] = useMutation(
        UpdateTripReport_LogBookEntrySection,
        {
            onCompleted: (data) => {},
            onError: (error) => {
                console.error('onError', error)
            },
        },
    )

    useEffect(() => {
        if (tripReport) {
            if (
                comment !==
                tripReport?.find((trip: any) => trip.id === currentTrip.id)
                    ?.comment?.length >
                    0
                    ? tripReport?.find(
                          (trip: any) => trip.id === currentTrip.id,
                      )?.comment
                    : '<p><br></p>'
            ) {
                setComment(
                    tripReport?.find((trip: any) => trip.id === currentTrip.id)
                        ?.comment?.length > 0
                        ? tripReport?.find(
                              (trip: any) => trip.id === currentTrip.id,
                          )?.comment
                        : '<p><br></p>',
                )
            }
        }
    }, [tripReport])

    return (
        <div>
            {(comment ||
                tripReport?.find((trip: any) => trip.id === currentTrip.id)
                    ?.comment?.length > 0) && (
                <Editor
                    id={`tripReport-Content`}
                    placeholder={
                        'Add any comments or updates relevant to this trip. Comment if actual arrival time is significantly different to expected arrival time. You can leave overall comments for other masters in the logbook comments fields.'
                    }
                    content={
                        comment
                            ? comment
                            : tripReport?.find(
                                    (trip: any) => trip.id === currentTrip.id,
                                )?.comment?.length > 0
                              ? tripReport?.find(
                                    (trip: any) => trip.id === currentTrip.id,
                                )?.comment
                              : '<p><br></p>'
                    }
                    className={`${classes.editor} w-full`}
                    handleEditorChange={handleEditorChange}
                    handleEditorBlur={handleEditorBlur}
                />
            )}
        </div>
    )
}
