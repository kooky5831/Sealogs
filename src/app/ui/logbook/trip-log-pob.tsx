'use client'
import React, { useEffect, useState } from 'react'
import { UpdateTripReport_LogBookEntrySection } from '@/app/lib/graphQL/mutation'
import { useMutation } from '@apollo/client'
import { getOneClient } from '@/app/lib/actions'
import { classes } from '@/app/components/GlobalClasses'
import { Button } from 'react-aria-components'
import ClientModel from '@/app/offline/models/client'
import TripReport_LogBookEntrySectionModel from '@/app/offline/models/tripReport_LogBookEntrySection'

export default function POB({
    currentTrip,
    updateTripReport,
    tripReport,
    vessel,
    crewMembers,
    logBookConfig,
    setTab,
    masterTerm = 'Master',
    offline = false,
}: {
    currentTrip: any
    updateTripReport?: any
    tripReport: any
    vessel: any
    crewMembers: any
    logBookConfig: any
    setTab: any
    masterTerm: string
    offline?: boolean
}) {
    const clientModel = new ClientModel()
    const tripReportModel = new TripReport_LogBookEntrySectionModel()
    const [client, setClient] = useState<any>()
    const [pob, setPOB] = useState<number>(0)
    const [totalGuests, setTotalGuests] = useState<number>(0)
    const [paxJoined, setPaxJoined] = useState<number>(0)
    const [vehicleJoined, setVehicleJoined] = useState<number>(0)

    if (!offline) {
        getOneClient(setClient)
    }
    const offlineMount = async () => {
        // getOneClient(setClient)
        const client = await clientModel.getById(
            +(localStorage.getItem('clientId') ?? 0),
        )
        setClient(client)
    }
    useEffect(() => {
        if (offline) {
            offlineMount()
        }
    }, [offline])
    const handlePOBChange = async (persons: any) => {
        const pob = +persons.target.value - paxJoined
        if (offline) {
            // updateTripReport_LogBookEntrySection
            const data = await tripReportModel.save({
                id: currentTrip.id,
                pob: pob,
            })
            updateTripReport({
                id: [...tripReport.map((trip: any) => trip.id), data.id],
                currentTripID: currentTrip.id,
                key: 'pob',
                value: pob,
            })
        } else {
            updateTripReport_LogBookEntrySection({
                variables: {
                    input: {
                        id: currentTrip.id,
                        pob: pob,
                    },
                },
            })
        }
        setPOB(+persons.target.value - paxJoined)
    }

    const handlePOBValueChange = (persons: any) => {
        setPOB(+persons.target.value - paxJoined)
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

    const setGuests = () => {
        let totalGuests = 0
        const supernumeraries = currentTrip?.tripEvents?.nodes.filter(
            (event: any) => {
                return event.eventCategory === 'Supernumerary'
            },
        )
        if (supernumeraries?.length > 0) {
            supernumeraries.forEach((s: any) => {
                totalGuests += s.supernumerary.totalGuest
            })
        }
        setTotalGuests(totalGuests)
        return totalGuests
    }

    useEffect(() => {
        if (currentTrip) {
            setPOB(Number(currentTrip?.pob ?? 0))
            setGuests()
            const paxJoined =
                currentTrip?.tripReport_Stops?.nodes.reduce(
                    (acc: number, stop: any) => {
                        return acc + stop.paxJoined - stop.paxDeparted
                    },
                    0,
                ) ?? 0
            const vehicleJoined = currentTrip?.tripReport_Stops?.nodes.reduce(
                (acc: number, stop: any) => {
                    return acc + stop.vehiclesJoined - stop.vehiclesDeparted
                },
                0,
            )
            setPaxJoined(paxJoined)
            setVehicleJoined(vehicleJoined)
        }
    }, [currentTrip])

    const crewLength = () => {
        return crewMembers ? crewMembers.length : 0
    }

    const displayField = (fieldName: string) => {
        const dailyChecks =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'EventType_LogBookComponent',
            )
        if (
            dailyChecks?.length > 0 &&
            dailyChecks[0]?.customisedComponentFields?.nodes.filter(
                (field: any) =>
                    field.fieldName === fieldName && field.status !== 'Off',
            ).length > 0
        ) {
            return true
        }
        return false
    }

    return (
        <>
            <div className="flex flex-row items-center my-4 gap-2">
                <label className={classes.label}>
                    Crew{' '}
                    <span className="text-2xs font-inter">
                        (Incl. {masterTerm})
                    </span>
                </label>
                <span className="text-slblue-1000 border rounded-full flex justify-center items-center w-9 h-9 bg-slblue-100 border-slblue-1000 p-3">
                    {crewLength()}
                </span>
                <Button
                    className="p-2 text-nowrap inline-flex justify-center items-center rounded-md bg-sky-100 text-sm  hover:bg-white hover:text-sky-800 border-1 border-sky-800"
                    onPress={() => setTab('crew')}>
                    Add crew
                </Button>
            </div>
            <div className="flex flex-row items-center my-4 gap-2">
                <label className={classes.label}>Passengers on board</label>
                <input
                    id="pob"
                    name="pob"
                    type="number"
                    value={+pob + +paxJoined}
                    className={`${classes.input} !w-auto`}
                    aria-describedby="pob-error"
                    required
                    min={paxJoined}
                    onBlur={handlePOBChange}
                    onChange={handlePOBValueChange}
                />
            </div>
            {displayField('EventSupernumerary') && (
                <div className="flex flex-row items-center my-4 gap-2">
                    <label className={classes.label}>Supernumerary</label>
                    <span className="text-slblue-1000 border rounded-full flex justify-center items-center w-9 h-9 bg-slblue-100 border-slblue-1000 p-3">
                        {totalGuests}
                    </span>{' '}
                    total guests
                </div>
            )}
            <div className="flex flex-col md:flex-row items-start md:items-center my-4 gap-2">
                <div className="flex flex-row gap-2">
                    <label
                        className={`${classes.label} font-semibold text-sm items-center`}>
                        {vessel?.maxPOB < pob + crewLength() + paxJoined - 1 ? (
                            <img
                                src="/sealogs-not-ok-check2.svg"
                                alt="Warning"
                                className="h-8 w-8 inline-block mr-2"
                            />
                        ) : (
                            <img
                                src="/sealogs-ok-check1.svg"
                                className="h-8 w-8 inline-block mr-2"
                            />
                        )}
                        Total P.O.B:
                    </label>
                    <span className="text-slblue-1000 border rounded-full flex justify-center items-center w-9 h-9 bg-slblue-100 border-slblue-1000 p-3">
                        {pob + crewLength() + paxJoined + totalGuests}
                    </span>
                </div>

                {vessel?.maxPOB < pob + crewLength() + paxJoined && (
                    <span className="text-2sx text-slred-800 text-wrap flex flex-wrap w-auto">
                        WARNING: Your total P.O.B exceeds your max P.O.B as
                        setup in your vessel config
                    </span>
                )}
            </div>
        </>
    )
}
