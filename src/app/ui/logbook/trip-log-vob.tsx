'use client'
import { classes } from '@/app/components/GlobalClasses'
import { UpdateTripReport_LogBookEntrySection } from '@/app/lib/graphQL/mutation'
import TripReport_LogBookEntrySectionModel from '@/app/offline/models/tripReport_LogBookEntrySection'
import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'

export default function VOB({
    currentTrip,
    updateTripReport,
    tripReport,
    vessel,
    crewMembers,
    logBookConfig,
    offline = false,
}: {
    currentTrip: any
    updateTripReport?: any
    tripReport: any
    vessel: any
    crewMembers: any
    logBookConfig: any
    offline?: boolean
}) {
    const [vehicleJoined, setVehicleJoined] = useState<number>(0)
    const [initialVessel, setInitialVessel] = useState<number>(
        currentTrip.totalVehiclesCarried ?? 0,
    )
    const tripReportModel = new TripReport_LogBookEntrySectionModel()
    useEffect(() => {
        if (currentTrip) {
            const vehicleJoined = currentTrip.tripReport_Stops.nodes.reduce(
                (acc: number, stop: any) => {
                    return acc + stop.vehiclesJoined - stop.vehiclesDeparted
                },
                0,
            )
            setVehicleJoined(vehicleJoined)
            const totalVehiclesCarried = +currentTrip.totalVehiclesCarried
            setInitialVessel(totalVehiclesCarried)
        }
    }, [currentTrip])

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

    const handleVesselChange = async (vessel: any) => {
        if (offline) {
            await tripReportModel.save({
                id: currentTrip.id,
                totalVehiclesCarried: +vessel.target.value,
            })
        } else {
            updateTripReport_LogBookEntrySection({
                variables: {
                    input: {
                        id: currentTrip.id,
                        totalVehiclesCarried: +vessel.target.value,
                    },
                },
            })
        }
        setInitialVessel(parseInt(vessel.target.value) - vehicleJoined)
    }

    const handleVesselValueChange = (vessel: any) => {
        setInitialVessel(parseInt(vessel.target.value) - vehicleJoined)
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

    return (
        <>
            {displayField('PassengerVehiclePickDrop') && (
                <div className="flex flex-row items-center my-4">
                    <label className={classes.label}>Vehicles on board</label>
                    <input
                        id="vob"
                        name="vob"
                        type="number"
                        value={
                            vehicleJoined > 0
                                ? vehicleJoined + initialVessel
                                : initialVessel
                        }
                        className={`${classes.input} !w-auto`}
                        aria-describedby="pob-error"
                        required
                        min={vehicleJoined}
                        onBlur={handleVesselChange}
                        onChange={handleVesselValueChange}
                    />
                </div>
            )}
        </>
    )
}
