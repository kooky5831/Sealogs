'use client'
import { FooterWrapper, SeaLogsButton } from '@/app/components/Components'
import { classes } from '@/app/components/GlobalClasses'
import {
    CreateFuelTankStartStop,
    CreateFuel_LogBookEntrySection,
    UpdateFuelTankStartStop,
} from '@/app/lib/graphQL/mutation'
import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

export default function EngineChecks({
    engine = false,
    engineer = false,
    fuel = false,
    logBookConfig,
    updateFuel,
    locked,
    logEntrySections,
    logBookEntryID,
}: {
    engine: any
    engineer: any
    fuel: any
    logBookConfig: any
    updateFuel: any
    locked: boolean
    logEntrySections: any
    logBookEntryID: any
}) {
    // console.log(fuel)
    const [loaded, setLoaded] = useState(false)
    const [fuelCheck, setFuelCheck] = useState(false)
    useEffect(() => {
        const hasCrewWelfare = logEntrySections.filter(
            (section: any) =>
                section.className === 'SeaLogs\\Fuel_LogBookEntrySection',
        ).length
        if (
            hasCrewWelfare === 0 &&
            !fuelCheck &&
            !loaded &&
            !createFuelCheckLoading
        ) {
            setLoaded(true)
            console.log('createfuelcheck')
            createFuelCheck({
                variables: {
                    input: {
                        logBookEntryID: +logBookEntryID,
                    },
                },
            })
        }
    }, [logEntrySections])

    useEffect(() => {
        if (fuel) {
            if (fuel[0]?.fuelTankStartStops?.nodes?.length < 1) {
                createfuelTankStartStop({
                    variables: {
                        input: {
                            logBookEntrySectionID: fuel[0].id,
                        },
                    },
                })
            }
            setFuelCheck(fuel[0])
        }
    }, [fuel])

    const [
        createFuelCheck,
        { loading: createFuelCheckLoading, data: createFuelCheckData },
    ] = useMutation(CreateFuel_LogBookEntrySection, {
        onCompleted: (response) => {
            const data = response.createFuel_LogBookEntrySection
            console.log('created fuel check', data)
            setFuelCheck(data)
            // updateFuel(data)
            createfuelTankStartStop({
                variables: {
                    input: {
                        logBookEntrySectionID: data.id,
                    },
                },
            })
        },
    })

    const [createfuelTankStartStop] = useMutation(CreateFuelTankStartStop, {
        onCompleted: (response) => {
            console.log('created fuel tank start stop', response)
            updateFuel(fuelCheck)
        },
    })

    const [updateFuelTankStartStop] = useMutation(UpdateFuelTankStartStop, {
        onCompleted: (response) => {
            console.log('updated fuel tank start stop', response)
            updateFuel(fuelCheck)
        },
    })

    return (
        <>
            <div className="flex justify-between md:flex-nowrap flex-wrap gap-3  items-center px-4">
                <h3 className="dark:text-white">
                    This section covers the engine check details
                </h3>
            </div>
            <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                <div className="my-4 text-xl col-span-3 md:col-span-1">
                    Fuel checks
                    <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Quod eveniet quaerat voluptates voluptatem quam odio
                        magnam, culpa accusantium at dolore, corrupti rem
                        reiciendis repudiandae cumque veritatis? Blanditiis
                        quibusdam nostrum suscipit?
                    </p>
                </div>
                <div className="col-span-3 md:col-span-2">
                    <div className="my-4">
                        <input
                            type="number"
                            defaultValue={
                                fuel[0]?.fuelTankStartStops?.nodes[0]?.start
                            }
                            name="start"
                            placeholder="Fuel Start"
                            className={classes.input}
                            disabled={locked}
                            onBlur={(e) => {
                                updateFuelTankStartStop({
                                    variables: {
                                        input: {
                                            id: fuel[0]?.fuelTankStartStops
                                                ?.nodes[0]?.id,
                                            start: +e.target.value,
                                        },
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className="my-4">
                        <textarea
                            id="field-description"
                            placeholder="Comment IF Fuel start is different to fuel end on previous logbook entry"
                            rows={4}
                            className={`${classes.textarea} mt-4`}
                            onBlur={(e) => {
                                updateFuelTankStartStop({
                                    variables: {
                                        input: {
                                            id: fuel[0]?.fuelTankStartStops
                                                ?.nodes[0]?.id,
                                            comments: e.target.value,
                                        },
                                    },
                                })
                            }}>
                            {fuel[0]?.fuelTankStartStops?.nodes[0]?.comments}
                        </textarea>
                    </div>
                </div>
            </div>
            <FooterWrapper>
                <SeaLogsButton text="Cancel" type="text" action={() => {}} />
                <SeaLogsButton
                    text="Save"
                    type="primary"
                    color="sky"
                    icon="check"
                    // action={handleSave}
                />
            </FooterWrapper>
        </>
    )
}
