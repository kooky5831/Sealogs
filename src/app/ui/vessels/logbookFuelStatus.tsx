'use client'
import { useEffect, useState } from 'react'
import { getLogBookEntryByID, getVesselByID } from '@/app/lib/actions'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
    GET_FUELTANKS,
    GET_LOGBOOKENTRY,
    GET_LOGBOOK_ENTRY_BY_ID,
    LogBookSignOff_LogBookEntrySection,
    TripReport_LogBookEntrySection,
    GetVesselLastFuel,
} from '@/app/lib/graphQL/query'
import { UPDATE_FUELTANK } from '@/app/lib/graphQL/mutation'
import dynamic from 'next/dynamic'
import dayjs from 'dayjs'
import { curry, set, update } from 'lodash'
import { AlertDialog } from '@/app/components/Components'
import { classes } from '@/app/components/GlobalClasses'
import toast, { Toaster } from 'react-hot-toast'

const GaugeComponent = dynamic(() => import('react-gauge-component'), {
    ssr: false,
})

export default function VesselFuelStatus({
    fuelTankList,
    updateFuelTankList,
}: {
    fuelTankList: any
    updateFuelTankList: any
}) {
    const [openFuelTankDialog, setOpenFuelTankDialog] = useState(false)
    const [currentFuelTank, setCurrentFuelTank] = useState<any>(null)

    const handleUpdateFuelTank = () => {
        updateFuelTank({
            variables: {
                input: {
                    id: currentFuelTank.id,
                    currentLevel: +currentFuelTank.currentLevel,
                },
            },
        })
        setOpenFuelTankDialog(false)
    }

    const [updateFuelTank] = useMutation(UPDATE_FUELTANK, {
        onCompleted: (data) => {
            const fuelTankIds = fuelTankList.map((tank: any) => tank.id)
            updateFuelTankList(fuelTankIds)
        },
        onError: (error) => {
            console.log(error)
        },
    })

    return (
        <>
            {fuelTankList.length > 0 &&
                fuelTankList.map((tank: any) => (
                    <div
                        key={tank.id}
                        className="flex flex-col mb-4 cursor-pointer"
                        onClick={() => {
                            tank.capacity > 0 &&
                            tank.capacity > tank.safeFuelCapacity
                                ? (setOpenFuelTankDialog(true),
                                  setCurrentFuelTank(tank))
                                : toast.error('Fuel tank setup is incomplete')
                        }}>
                        {tank.capacity > 0 &&
                        tank.capacity > tank.safeFuelCapacity ? (
                            <GaugeComponent
                                className="mr-4"
                                pointer={{ type: 'arrow', elastic: true }}
                                style={{
                                    width: '80%',
                                }}
                                type="semicircle"
                                labels={{
                                    valueLabel: {
                                        style: {
                                            fill: '#1A3961',
                                            textShadow: 'none',
                                        },
                                    },
                                    tickLabels: {
                                        ticks: [
                                            {
                                                value:
                                                    tank.capacity / 5 <
                                                    tank.safeFuelCapacity
                                                        ? tank.capacity / 5
                                                        : tank.safeFuelCapacity /
                                                          2,
                                            },
                                            { value: tank.safeFuelCapacity },
                                            { value: tank.capacity },
                                        ],
                                    },
                                }}
                                arc={{
                                    subArcs: [
                                        {
                                            limit:
                                                tank.capacity / 5 <
                                                tank.safeFuelCapacity
                                                    ? tank.capacity / 5
                                                    : tank.safeFuelCapacity / 2,
                                        },
                                        { limit: tank.safeFuelCapacity },
                                        { limit: tank.capacity },
                                    ],
                                    colorArray: [
                                        '#EB2E2A',
                                        '#EB7C2A',
                                        '#4FFC00',
                                    ],
                                    width: 0.3,
                                    padding: 0.003,
                                    cornerRadius: 1,
                                }}
                                value={tank.currentLevel}
                                maxValue={tank.capacity}
                            />
                        ) : (
                            <GaugeComponent
                                className="mr-4"
                                pointer={{ type: 'arrow', elastic: true }}
                                style={{
                                    width: '80%',
                                }}
                                type="semicircle"
                                labels={{
                                    valueLabel: {
                                        style: {
                                            fill: '#1A3961',
                                            textShadow: 'none',
                                        },
                                    },
                                    tickLabels: {
                                        ticks: [
                                            { value: 25 },
                                            { value: 50 },
                                            { value: 75 },
                                        ],
                                    },
                                }}
                                arc={{
                                    subArcs: [
                                        { limit: 25 },
                                        { limit: 50 },
                                        { limit: 75 },
                                    ],
                                    colorArray: [
                                        '#52606D',
                                        '#7B8794',
                                        '#CBD2D9',
                                    ],
                                    width: 0.3,
                                    padding: 0.003,
                                    cornerRadius: 1,
                                }}
                                value={0}
                                maxValue={100}
                            />
                        )}
                        <div className="flex items-center justify-center -ml-6">
                            <div
                                className={`w-2 h-2 ${tank.capacity > 0 && tank.capacity > tank.safeFuelCapacity ? 'bg-green-500' : 'bg-gray-500'}  rounded-full mr-2`}></div>
                            <p className="text-sm font-bold">{tank.title}</p>
                        </div>
                    </div>
                ))}
            <AlertDialog
                openDialog={openFuelTankDialog}
                setOpenDialog={setOpenFuelTankDialog}
                className="!max-w-md"
                handleCreate={handleUpdateFuelTank}
                actionText="Save">
                <div className="flex flex-col">
                    <div className="flex items-center justify-start gap-2">
                        <h3 className="text-lg font-bold">Fuel Tank Details</h3>
                        {' - '}
                        <p className="text-lg font-normal">
                            {currentFuelTank?.title}
                        </p>
                    </div>
                    <div className="flex gap-4 mt-4">
                        <div className="w-full">
                            <label className="text-sm font-medium text-slblue-900 dark:text-slblue-300">
                                Current fuel level
                            </label>
                            <input
                                type="number"
                                min="0"
                                max={currentFuelTank?.capacity}
                                value={currentFuelTank?.currentLevel}
                                onChange={(e) =>
                                    setCurrentFuelTank({
                                        ...currentFuelTank,
                                        currentLevel: e.target.value,
                                    })
                                }
                                className={classes.input}
                            />
                        </div>
                    </div>
                </div>
            </AlertDialog>
            <Toaster position="top-right" />
        </>
    )
}
