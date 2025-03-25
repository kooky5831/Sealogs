'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SeaLogsButton } from '@/app/components/Components'
import { CREATE_LOGBOOK_ENTRY } from '@/app/lib/graphQL/mutation'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { isCrew } from '@/app/helpers/userHelper'
import { formatDate } from '@/app/helpers/dateHelper'

export default function VesselLogStatus({
    vessel = false,
    icon = false,
}: {
    vessel: any
    icon: boolean
}) {
    const [vesselLog, setVesselLog] = useState<any>(null)
    const [vesselState, setVesselState] = useState<string>('Locked')
    const router = useRouter()
    const [isNewLogEntryDisabled, setIsNewLogEntryDisabled] =
        useState<boolean>(false)
    const [imCrew, setImCrew] = useState<boolean>(false)
    const handleSetVesselState = () => {
        vessel.logentryID > 0
            ? (setVesselState('Open'), setVesselLog(vessel.logentryID))
            : setVesselState('Locked')
    }

    // const [queryLogBookEntries] = useLazyQuery(GET_LOGBOOKENTRY, {
    //     fetchPolicy: 'cache-and-network',
    //     onCompleted: (response: any) => {
    //         const crew = response.readCrewMembers_LogBookEntrySections.nodes
    //         const entries = response.GetLogBookEntries.nodes
    //         const data = entries.map((entry: any) => {
    //             const crewData = crew.filter(
    //                 (crewMember: any) => crewMember.logBookEntryID === entry.id,
    //             )
    //             return {
    //                 ...entry,
    //                 crew: crewData,
    //             }
    //         })
    //         if (data) {
    //             handleSetVesselState(data)
    //         }
    //     },
    //     onError: (error: any) => {
    //         console.error('queryLogBookEntries error', error)
    //     },
    // })

    // useEffect(() => {
    //     if (vessel) {
    //         loadLogBookEntries()
    //     }
    // }, [vessel])

    useEffect(() => {
        setImCrew(isCrew())
        handleSetVesselState()
    }, [])
    // const loadLogBookEntries = async () => {
    //     await queryLogBookEntries({
    //         variables: {
    //             vesselId: +vessel?.id,
    //         },
    //     })
    // }

    const handleCreateNewLogEntry = async () => {
        if (vessel?.logBookID > 0) {
            setIsNewLogEntryDisabled(true)
            await createLogEntry({
                variables: {
                    input: {
                        vehicleID: vessel.id,
                        logBookID: vessel.logBookID,
                    },
                },
            })
        }
    }

    const [createLogEntry] = useMutation(CREATE_LOGBOOK_ENTRY, {
        onCompleted: (response: any) => {
            console.log('createLogEntry response', response)
            router.push(
                `/log-entries/view/?vesselID=${vessel.id}&logentryID=${response.createLogBookEntry.id}`,
            )
        },
        onError: (error: any) => {
            console.error('createLogEntry error', error)
        },
    })

    return (
        <>
            {icon ? (
                vesselState === 'Open' ? (
                    <Link
                        href={`/log-entries/view?&vesselID=${vessel.id}&logentryID=${vessel?.logentryID}`}>
                        <button
                            type="button"
                            className="grow-0 group w-full inline-flex justify-center items-center rounded-md bg-slorange-300 p-4 text-slorange-1000 shadow-sm ring-1 ring-inset ring-slorange-1000 hover:ring-sldarkblue-1000 hover:bg-sldarkblue-1000 hover:text-white">
                            <svg
                                className="-ml-1.5 mr-1 h-5 w-5 hidden md:inline-block"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 19 19"
                                fill="currentColor">
                                <path
                                    className="stroke-slorange-1000 group-hover:stroke-white"
                                    id="Path"
                                    d="M9,18a1.994,1.994,0,0,1-1.414-.586l-.828-.828A2,2,0,0,0,5.343,16H1a1,1,0,0,1-1-1V1A1,1,0,0,1,1,0H5A4.992,4.992,0,0,1,9,2Z"
                                    transform="translate(0.5 0.5)"
                                    fill="none"
                                    strokeWidth="1"
                                />
                                <path
                                    className="stroke-slorange-1000 group-hover:stroke-white"
                                    id="secondary"
                                    d="M0,18V2A4.992,4.992,0,0,1,4,0H8A1,1,0,0,1,9,1V15a1,1,0,0,1-1,1H3.657a2,2,0,0,0-1.414.586l-.828.828A1.994,1.994,0,0,1,0,18Z"
                                    transform="translate(9.5 0.5)"
                                    fill="none"
                                    strokeWidth="1"
                                />
                            </svg>
                            Open log entry
                        </button>
                    </Link>
                ) : (
                    <>
                        {!imCrew && (
                            <SeaLogsButton
                                icon="new_logbook"
                                className="group w-full inline-flex justify-center items-center rounded-md bg-white p-4 text-sldarkblue-800 shadow-sm ring-1 ring-inset ring-slblue-400 hover:bg-sldarkblue-1000 hover:text-white"
                                text="New logbook entry"
                                action={handleCreateNewLogEntry}
                                isDisabled={isNewLogEntryDisabled}
                            />
                        )}
                    </>
                )
            ) : vesselState === 'Open' ? (
                <div
                    className={` inline-block rounded p-2 text-2xs font-inter font-light bg-slred-100 text-slred-1000 border-1 border-slred-1000`}>
                    <Link
                        href={`/log-entries/view?&vesselID=${vessel.id}&logentryID=${vessel?.logentryID}`}>
                        Open log{' '}
                        {vessel?.lbeStartDate
                            ? formatDate(vessel.lbeStartDate)
                            : ''}
                    </Link>
                </div>
            ) : (
                <></>
            )}
        </>
    )
}
