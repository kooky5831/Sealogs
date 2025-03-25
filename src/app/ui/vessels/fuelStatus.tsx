'use client'
import { useEffect, useState } from 'react'
import { getLogBookEntryByID, getVesselByID } from '@/app/lib/actions'
import { useLazyQuery } from '@apollo/client'
import {
    GET_FUELTANKS,
    GET_LOGBOOKENTRY,
    GET_LOGBOOK_ENTRY_BY_ID,
    LogBookSignOff_LogBookEntrySection,
    TripReport_LogBookEntrySection,
    GetVesselLastFuel,
} from '@/app/lib/graphQL/query'
import dynamic from 'next/dynamic'
import dayjs from 'dayjs'
const GaugeComponent = dynamic(() => import('react-gauge-component'), {
    ssr: false,
})

export default function VesselFuelStatus({ vessel = false }: { vessel: any }) {
    const [currentReport, setCurrentReport] = useState<any>(null)
    const [prevReport, setPrevReport] = useState<any>(null)
    const [signOff, setSignOff] = useState<any>(null)
    const [prevSignOff, setPrevSignOff] = useState<any>(null)
    const [fuelTankList, setFuelTankList] = useState<any>(null)
    const [fuelLevel, setFuelLevel] = useState<number>(0)
    const [prevFuelLevel, setPrevFuelLevel] = useState<number>(0)
    const [vesselInfo, setVesselInfo] = useState<any>(null)
    const [entryLastCreated, setEntryLastCreated] = useState<any>(false)
    const [lastTaskingFuel, setLastTaskingFuel] = useState<{
        fuel: number
        entryID: number
    }>({ fuel: 0, entryID: 0 })

    const handleSetLogbook = (logbook: any) => {
        const sectionTypes = Array.from(
            new Set(
                logbook.logBookEntrySections.nodes.map(
                    (sec: any) => sec.className,
                ),
            ),
        ).map((type) => ({
            className: type,
            ids: logbook.logBookEntrySections.nodes
                .filter((sec: any) => sec.className === type)
                .map((sec: any) => sec.id),
        }))
        sectionTypes.forEach((section: any) => {
            if (
                section.className === 'SeaLogs\\TripReport_LogBookEntrySection'
            ) {
                getSectionTripReport_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }
            if (
                section.className ===
                'SeaLogs\\LogBookSignOff_LogBookEntrySection'
            ) {
                getLogBookSignOff_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }
        })
    }

    const handleSetVesselInfo = (vesselInfo: any) => {
        const prevLockedEntry = vesselInfo.logBookEntries.nodes.find(
            (entry: any) => entry.state === 'Locked',
        )

        if (prevLockedEntry) {
            queryLogBookEntry({
                variables: {
                    logbookEntryId: +prevLockedEntry.id,
                },
            })
        }
        setVesselInfo(vesselInfo)
        // queryGetVesselLastFuel({
        //     variables: {
        //         id: +vesselInfo.id,
        //     },
        // })
    }

    const [queryGetVesselLastFuel] = useLazyQuery(GetVesselLastFuel, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneVessel
            outerLoop: for (const entry of data.logBookEntries.nodes) {
                for (const section of entry.tripReportSections.nodes) {
                    for (const event of section.tripEvents.nodes) {
                        if (
                            lastTaskingFuel.fuel === 0 &&
                            event.eventType_Tasking.fuelLevel > 0
                        ) {
                            setLastTaskingFuel({
                                fuel: event.eventType_Tasking.fuelLevel,
                                entryID: entry.id,
                            })
                            break outerLoop
                        }
                    }
                }
            }
        },
    })
    if (vessel.title === 'Big Boat') {
        // console.log(lastTaskingFuel, vessel.title)
    }

    const [queryLogBookEntry] = useLazyQuery(GET_LOGBOOK_ENTRY_BY_ID, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneLogBookEntry
            if (data) {
                handleSetPrevLogbook(data)
            }
        },
        onError: (error: any) => {
            console.error('queryLogBookEntry error', error)
        },
    })

    getVesselByID(vessel.id, handleSetVesselInfo)

    const handleSetPrevLogbook = (logbook: any) => {
        const sectionTypes = Array.from(
            new Set(
                logbook.logBookEntrySections.nodes.map(
                    (sec: any) => sec.className,
                ),
            ),
        ).map((type) => ({
            className: type,
            ids: logbook.logBookEntrySections.nodes
                .filter((sec: any) => sec.className === type)
                .map((sec: any) => sec.id),
        }))
        sectionTypes.forEach((section: any) => {
            if (
                section.className === 'SeaLogs\\TripReport_LogBookEntrySection'
            ) {
                getSectionPrevTripReport_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }
            if (
                section.className ===
                'SeaLogs\\LogBookSignOff_LogBookEntrySection'
            ) {
                getLogBookPrevSignOff_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }
        })
    }

    const [getSectionTripReport_LogBookEntrySection] = useLazyQuery(
        TripReport_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readTripReport_LogBookEntrySections.nodes
                setCurrentReport(data)
            },
            onError: (error: any) => {
                console.error('TripReport_LogBookEntrySection error', error)
            },
        },
    )

    const [getSectionPrevTripReport_LogBookEntrySection] = useLazyQuery(
        TripReport_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readTripReport_LogBookEntrySections.nodes
                setPrevReport(data)
            },
            onError: (error: any) => {
                console.error('TripReport_LogBookEntrySection error', error)
            },
        },
    )

    const [getLogBookSignOff_LogBookEntrySection] = useLazyQuery(
        LogBookSignOff_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readLogBookSignOff_LogBookEntrySections.nodes
                setSignOff(data)
            },
            onError: (error: any) => {
                console.error('LogBookSignOff_LogBookEntrySection error', error)
            },
        },
    )

    const [getLogBookPrevSignOff_LogBookEntrySection] = useLazyQuery(
        LogBookSignOff_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readLogBookSignOff_LogBookEntrySections.nodes
                setPrevSignOff(data)
            },
            onError: (error: any) => {
                console.error('LogBookSignOff_LogBookEntrySection error', error)
            },
        },
    )

    if (vessel && vessel?.logBookEntries?.nodes?.length > 0) {
        getLogBookEntryByID(
            vessel?.logBookEntries?.nodes[0].id,
            handleSetLogbook,
        )
    }

    const [queryLogBookEntries] = useLazyQuery(GET_LOGBOOKENTRY, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const entries = response.GetLogBookEntries.nodes
        },
        onError: (error: any) => {
            console.error('queryLogBookEntries error', error)
        },
    })

    useEffect(() => {
        if (vessel) {
            loadLogBookEntries()
            const fuelTankIds = vessel?.parentComponent_Components?.nodes
                .filter(
                    (item: any) =>
                        item.basicComponent.componentCategory === 'FuelTank',
                )
                .map((item: any) => {
                    return item.basicComponent.id
                })
            fuelTankIds?.length > 0 && getFuelTanks(fuelTankIds)
        }
    }, [vessel])

    const getFuelTanks = async (fuelTankIds: any) => {
        await queryGetFuelTanks({
            variables: {
                id: fuelTankIds,
            },
        })
    }

    const [queryGetFuelTanks] = useLazyQuery(GET_FUELTANKS, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.readFuelTanks.nodes
            setFuelTankList(data)
        },
        onError: (error: any) => {
            console.error('getFuelTanks error', error)
        },
    })

    const loadLogBookEntries = async () => {
        await queryLogBookEntries({
            variables: {
                vesselId: +vessel?.id,
            },
        })
    }

    useEffect(() => {
        if (currentReport) {
            var fuelLevel = 0
            var created = false
            currentReport.forEach((report: any) => {
                report.tripEvents.nodes?.forEach((event: any) => {
                    if (event.eventCategory === 'PassengerDropFacility') {
                        fuelLevel =
                            +event.eventType_PassengerDropFacility.fuelLevel > 0
                                ? event.eventType_PassengerDropFacility
                                      .fuelLevel
                                : fuelLevel
                        created = dayjs(event.created).isAfter(
                            dayjs(entryLastCreated),
                        )
                            ? event.created
                            : created
                    }
                    if (event.eventCategory === 'Tasking') {
                        fuelLevel =
                            +event.eventType_Tasking.fuelLevel > 0
                                ? event.eventType_Tasking.fuelLevel
                                : fuelLevel
                        created = dayjs(event.created).isAfter(
                            dayjs(entryLastCreated),
                        )
                            ? event.created
                            : created
                    }
                    if (event.eventCategory === 'PassengerDropFacility') {
                        fuelLevel =
                            +event.eventType_PassengerDropFacility.fuelLevel > 0
                                ? event.eventType_PassengerDropFacility
                                      .fuelLevel
                                : fuelLevel
                        created = dayjs(event.created).isAfter(
                            dayjs(entryLastCreated),
                        )
                            ? event.created
                            : created
                    }
                })
            })
            setFuelLevel(fuelLevel)
            setEntryLastCreated(created)
        }
        // console.log(currentReport, vessel.title)
    }, [currentReport])

    useEffect(() => {
        if (prevSignOff) {
            var fuelLevel = 0
            {
                prevSignOff[0].fuelStart > 0
                    ? setPrevFuelLevel(prevSignOff[0].fuelStart)
                    : (prevReport?.forEach((report: any) => {
                          report.tripEvents.nodes?.forEach((event: any) => {
                              if (
                                  event.eventCategory ===
                                  'PassengerDropFacility'
                              ) {
                                  fuelLevel =
                                      event.eventType_PassengerDropFacility
                                          .fuelLevel > 0
                                          ? event
                                                .eventType_PassengerDropFacility
                                                .fuelLevel
                                          : fuelLevel
                              }
                              if (event.eventCategory === 'Tasking') {
                                  fuelLevel =
                                      event.eventType_Tasking.fuelLevel > 0
                                          ? event.eventType_Tasking.fuelLevel
                                          : fuelLevel
                              }
                              if (
                                  event.eventCategory ===
                                  'PassengerDropFacility'
                              ) {
                                  fuelLevel =
                                      event.eventType_PassengerDropFacility
                                          .fuelLevel > 0
                                          ? event
                                                .eventType_PassengerDropFacility
                                                .fuelLevel
                                          : fuelLevel
                              }
                          })
                      }),
                      setPrevFuelLevel(fuelLevel))
            }
        }
        // console.log(prevSignOff, vessel.title, prevReport)
    }, [prevSignOff])

    const maxCapacity = fuelTankList?.reduce(
        (total: number, tank: any) => total + tank.capacity,
        0,
    )

    const safeFuelCapacity = fuelTankList?.reduce(
        (total: number, tank: any) => total + tank.safeFuelCapacity,
        0,
    )
        ? fuelTankList?.reduce(
              (total: number, tank: any) => total + tank.safeFuelCapacity,
              0,
          )
        : maxCapacity / 2

    const calculatedFuelLevel = fuelTankList?.find((tank: any) =>
        dayjs(tank.lastEdited).isAfter(dayjs(entryLastCreated)),
    )
        ? fuelTankList.reduce(
              (total: number, tank: any) => total + tank.currentLevel,
              0,
          )
        : fuelLevel
          ? fuelLevel
          : prevFuelLevel

    return (
        <>
            {(fuelLevel > 0 || prevFuelLevel > 0) &&
                maxCapacity > safeFuelCapacity &&
                safeFuelCapacity > 0 && (
                    <GaugeComponent
                        className="mr-4"
                        pointer={{ type: 'arrow', elastic: true }}
                        style={{
                            width: '60%',
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
                                            maxCapacity / 5 < safeFuelCapacity
                                                ? maxCapacity / 5
                                                : safeFuelCapacity / 2,
                                    },
                                    { value: safeFuelCapacity },
                                    { value: maxCapacity },
                                ],
                            },
                        }}
                        arc={{
                            subArcs: [
                                {
                                    limit:
                                        maxCapacity / 5 < safeFuelCapacity
                                            ? maxCapacity / 5
                                            : safeFuelCapacity / 2,
                                },
                                { limit: safeFuelCapacity },
                                { limit: maxCapacity },
                            ],
                            colorArray: ['#EB2E2A', '#EB7C2A', '#4FFC00'],
                            width: 0.3,
                            padding: 0.003,
                            cornerRadius: 1,
                        }}
                        value={calculatedFuelLevel}
                        maxValue={maxCapacity}
                    />
                )}
        </>
    )
}
