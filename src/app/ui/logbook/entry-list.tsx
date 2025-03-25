'use client'
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline'
import { Button, DialogTrigger, Popover } from 'react-aria-components'
import Link from 'next/link'
import { PopoverWrapper, TableWrapper } from '@/app/components/Components'
import dayjs from 'dayjs'
import {
    convertTimeFormat,
    getOneClient,
    getVesselByID,
} from '@/app/lib/actions'
import { useState } from 'react'
import { classes } from '@/app/components/GlobalClasses'
import { getSeaLogsMemberComments } from '@/app/lib/actions'
import { formatDate } from '@/app/helpers/dateHelper'
import { useLazyQuery } from '@apollo/client'
import { GET_LOGBOOK_CONFIG } from '@/app/lib/graphQL/query'
import { getFieldLabel } from '../daily-checks/actions'
import React from 'react'

export default function LogEntryList({ logbooks, vesselID }: any) {
    const [client, setClient] = useState<any>({})
    const [selectedTab, setSelectedTab] = useState<any>(false)
    const [openCrewMember, setOpenCrewMember] = useState(false)
    const [currentCrewMember, setCurrentCrewMember] = useState(false)
    const [sealogsMemberComments, setSeaLogsMemberComments] = useState<any>()
    const [vessel, setVessel] = useState<any>(false)
    const [logBookConfig, setLogBookConfig] = useState<any>(false)

    getSeaLogsMemberComments(setSeaLogsMemberComments)
    getOneClient(setClient)
    const handleSetVessel = (vessel: any) => {
        setVessel(vessel)
        if (vessel && vessel?.logBookID > 0) {
            queryLogBookConfig({
                variables: {
                    id: +vessel.logBookID,
                },
            })
        }
    }
    getVesselByID(vesselID, handleSetVessel)

    const [queryLogBookConfig] = useLazyQuery(GET_LOGBOOK_CONFIG, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneCustomisedLogBookConfig
            if (data) {
                setLogBookConfig(data)
            }
        },
        onError: (error: any) => {
            console.error('queryLogBookConfig error', error)
        },
    })

    const getFirstTabName = (name: string) => {
        let firstTab = ''

        //crew comments
        if (name == 'Fitness') {
            firstTab = 'crew'
        }
        if (name == 'SafetyActions') {
            firstTab = 'crew'
        }
        if (name == 'WaterQuality') {
            firstTab = 'crew'
        }
        if (name == 'IMSafe') {
            firstTab = 'crew'
        }

        //safety comments
        if (name == 'Safety') {
            firstTab = 'dailyChecks'
        }
        if (name == 'HighWaterAlarm') {
            firstTab = 'dailyChecks'
        }
        if (name == 'FirstAid') {
            firstTab = 'dailyChecks'
        }
        if (name == 'SafetyEquipment') {
            firstTab = 'dailyChecks'
        }
        if (name == 'FireExtinguisher') {
            firstTab = 'dailyChecks'
        }

        //hull comments
        if (name == 'Hull') {
            firstTab = 'dailyChecks'
        }
        if (name == 'Hull_HullStructure') {
            firstTab = 'dailyChecks'
        }
        if (name == 'Hull_DeckEquipment') {
            firstTab = 'dailyChecks'
        }
        if (name == 'Hull_DayShapes') {
            firstTab = 'dailyChecks'
        }
        if (name == 'TenderOperationalChecks') {
            firstTab = 'dailyChecks'
        }
        if (name == 'Anchor') {
            firstTab = 'dailyChecks'
        }
        if (name == 'WindscreenCheck') {
            firstTab = 'dailyChecks'
        }
        if (name == 'NightLineDockLinesRelease') {
            firstTab = 'dailyChecks'
        }

        //propulsion comments
        if (name == 'Propulsion') {
            firstTab = 'dailyChecks'
        }
        if (name == 'PreEngineAndPropulsion') {
            firstTab = 'dailyChecks'
        }
        if (name == 'EngineCheckPropellers') {
            firstTab = 'dailyChecks'
        }
        if (name == 'EngineOilWater') {
            firstTab = 'dailyChecks'
        }
        if (name == 'EngineMountsAndStabilisers') {
            firstTab = 'dailyChecks'
        }
        if (name == 'ElectricalChecks') {
            firstTab = 'dailyChecks'
        }
        if (name == 'ElectricalVisualFields') {
            firstTab = 'dailyChecks'
        }
        if (name == 'Generator') {
            firstTab = 'dailyChecks'
        }
        if (name == 'ShorePower') {
            firstTab = 'dailyChecks'
        }
        if (name == 'SteeringChecks') {
            firstTab = 'dailyChecks'
        }

        //navigation comments
        if (name == 'Navigation') {
            firstTab = 'dailyChecks'
        }
        if (name == 'NavigationCharts') {
            firstTab = 'dailyChecks'
        }
        if (name == 'NavigationChecks') {
            firstTab = 'dailyChecks'
        }
        if (name == 'Radio') {
            firstTab = 'dailyChecks'
        }
        if (name == 'OtherNavigation') {
            firstTab = 'dailyChecks'
        }

        //sign of comments
        if (name == 'LogBookSignOff') {
            firstTab = 'signOff'
        }
        if (name == 'Review') {
            firstTab = 'signOff'
        }
        if (name == 'SafetyEquipmentCheck') {
            firstTab = 'signOff'
        }
        if (name == 'ForecastAccuracy') {
            firstTab = 'signOff'
        }
        if (name == 'Power') {
            firstTab = 'signOff'
        }
        if (name == 'BatteryMaintenance') {
            firstTab = 'signOff'
        }
        if (name == 'CircuitInspections') {
            firstTab = 'signOff'
        }
        if (name == 'MooringAndAnchoring') {
            firstTab = 'signOff'
        }
        if (name == 'CargoAndAccessEquipment') {
            firstTab = 'signOff'
        }
        if (name == 'HatchesAndWatertightDoors') {
            firstTab = 'signOff'
        }
        if (name == 'GalleyAppliances') {
            firstTab = 'signOff'
        }
        if (name == 'WasteManagement') {
            firstTab = 'signOff'
        }
        if (name == 'VentilationAndAirConditioning') {
            firstTab = 'signOff'
        }
        if (name == 'EmergencyReadiness') {
            firstTab = 'signOff'
        }
        if (name == 'EnvironmentalCompliance') {
            firstTab = 'signOff'
        }

        return firstTab
    }

    const getSecondTabName = (name: string) => {
        let secondTab = ''

        //safety comments
        if (name == 'DailyCheckFuel') {
            secondTab = 'Engine Checks'
        }
        if (name == 'DailyCheckEngine') {
            secondTab = 'Engine Checks'
        }
        if (name == 'Safety') {
            secondTab = 'Safety Checks'
        }
        if (name == 'HighWaterAlarm') {
            secondTab = 'Safety Checks'
        }
        if (name == 'FirstAid') {
            secondTab = 'Safety Checks'
        }
        if (name == 'SafetyEquipment') {
            secondTab = 'Safety Checks'
        }
        if (name == 'FireExtinguisher') {
            secondTab = 'Safety Checks'
        }

        //hull comments
        if (name == 'Hull') {
            secondTab = 'Deck operations and exterior checks'
        }
        if (name == 'Hull_HullStructure') {
            secondTab = 'Deck operations and exterior checks'
        }
        if (name == 'Hull_DeckEquipment') {
            secondTab = 'Deck operations and exterior checks'
        }
        if (name == 'Hull_DayShapes') {
            secondTab = 'Deck operations and exterior checks'
        }
        if (name == 'TenderOperationalChecks') {
            secondTab = 'Deck operations and exterior checks'
        }
        if (name == 'Anchor') {
            secondTab = 'Deck operations and exterior checks'
        }
        if (name == 'WindscreenCheck') {
            secondTab = 'Deck operations and exterior checks'
        }
        if (name == 'NightLineDockLinesRelease') {
            secondTab = 'Deck operations and exterior checks'
        }

        //propulsion comments
        if (name == 'Propulsion') {
            secondTab = 'Engine Checks'
        }
        if (name == 'PreEngineAndPropulsion') {
            secondTab = 'Engine Checks'
        }
        if (name == 'EngineCheckPropellers') {
            secondTab = 'Engine Checks'
        }
        if (name == 'EngineOilWater') {
            secondTab = 'Engine Checks'
        }
        if (name == 'EngineMountsAndStabilisers') {
            secondTab = 'Engine Checks'
        }
        if (name == 'ElectricalChecks') {
            secondTab = 'Engine Checks'
        }
        if (name == 'ElectricalVisualFields') {
            secondTab = 'Engine Checks'
        }
        if (name == 'Generator') {
            secondTab = 'Engine Checks'
        }
        if (name == 'ShorePower') {
            secondTab = 'Engine Checks'
        }
        if (name == 'SteeringChecks') {
            secondTab = 'Engine Checks'
        }

        //navigation comments
        if (name == 'Navigation') {
            secondTab = 'Navigation'
        }
        if (name == 'NavigationCharts') {
            secondTab = 'Navigation'
        }
        if (name == 'NavigationChecks') {
            secondTab = 'Navigation'
        }
        if (name == 'Radio') {
            secondTab = 'Navigation'
        }
        if (name == 'OtherNavigation') {
            secondTab = 'Navigation'
        }

        return secondTab
    }

    const composeFieldLabel = (fieldName: string) => {
        if (getFirstTabName(fieldName) === 'dailyChecks') {
            return getFieldLabel(fieldName, logBookConfig)
        }
        if (getFirstTabName(fieldName) === 'crew') {
            return getFieldLabel(
                fieldName,
                logBookConfig,
                'CrewWelfare_LogBookComponent',
            )
        }
        if (getFirstTabName(fieldName) === 'signOff') {
            return getFieldLabel(
                fieldName,
                logBookConfig,
                'LogBookSignOff_LogBookComponent',
            )
        }
        return fieldName?.replace(/([A-Z])/g, ' $1').trim() + ' Comments'
    }

    return (
        <div className="overflow-x-auto w-full block font-normal">
            {logbooks ? (
                <>
                    {logbooks.map((log: any, index: number) => (
                        <div key={'crewlog-' + index}>
                            <div
                                key={log.id}
                                onClick={() => {
                                    if (
                                        selectedTab === log.id &&
                                        openCrewMember
                                    ) {
                                        setSelectedTab(0)
                                    } else {
                                        setSelectedTab(log.id)
                                    }
                                    if (openCrewMember) {
                                        setOpenCrewMember(false)
                                        setCurrentCrewMember(false)
                                        return
                                    }
                                    setOpenCrewMember(true)
                                    setCurrentCrewMember(log)
                                }}
                                className={`flex flex-col md:flex-row p-2 mb-2 text-left rounded-md bg-sllightblue-100 group border border-sllightblue-200 dark:border-slblue-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90 items-baseline`}>
                                    <div className='flex flex-row items-baseline'>
                                        <div className="mr-2">
                                            <Link
                                                href={`/log-entries?vesselID=${vesselID}&logentryID=${log.id}`}
                                                className="group-hover:text-sllightblue-1000 flex flex-row flex-nowrap">
                                                {log.state !== 'Locked' ? (
                                                    <div className=" text-slorange-1000">
                                                        {log?.startDate
                                                            ? formatDate(log.startDate)
                                                            : 'No Date'}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {log?.startDate
                                                            ? formatDate(log.startDate)
                                                            : 'No Date'}
                                                    </div>
                                                )}
                                                {/* <span
                                                        className={`font-light p-2 ml-2 mb-2 border rounded-lg ${log.state === 'Locked' ? 'text-slblue-1000 bg-slblue-100 border-slblue-1000' : 'text-slred-1000 bg-slred-100 border-slred-1000'}`}>
                                                        {log.state}
                                                    </span> */}
                                            </Link>
                                        </div>
                                        <div className="items-center text-left whitespace-nowrap bg-slblue-800 border border-slblue-1000 text-white font-light rounded-lg text-sm mr-1 p-2 mb-2">
                                            {log.master?.firstName}{' '}
                                            {log.master?.surname}
                                        </div>
                                    </div>
                                    <div className="md:p-2 p-0 items-center text-left block md:inline-block">
                                        {log?.crew?.map(
                                            (crewMember: any, index: number) => (
                                                <span key={crewMember.id}>
                                                    {crewMember.crewMember.firstName !== log.master?.firstName && crewMember.crewMember.surname !== log.master?.surname ? (
                                                        <span
                                                            key={`crew-member-${crewMember.id}`}>
                                                            {index < 4 &&
                                                                crewMember.crewMember
                                                                    .firstName && (
                                                                    <div className="inline-block bg-slblue-50 border border-slblue-200 font-light rounded-lg text-sm mr-1 p-2 mb-2 outline-none dark:text-sldarkblue-800">
                                                                        {
                                                                            crewMember
                                                                                .crewMember
                                                                                .firstName
                                                                        }
                                                                    </div>
                                                                )}
                                                            {index === 4 && (
                                                                <DialogTrigger>
                                                                    <Button className="inline-block bg-slblue-50 border text-sllightblue-800 border-slblue-200 font-light rounded-lg text-sm mr-1 p-2 mb-2 outline-none dark:text-sldarkblue-800">
                                                                        +{' '}
                                                                        {log.crew.length -
                                                                            4}{' '}
                                                                        more
                                                                    </Button>
                                                                    <Popover>
                                                                        <div className="p-0 w-64 max-h-full bg-gray-100 rounded dark:bg-gray-700 dark:text-white">
                                                                            {log.crew
                                                                                .filter(
                                                                                    () =>
                                                                                        log.crew.includes(
                                                                                            crewMember,
                                                                                        ),
                                                                                )
                                                                                .slice(4)
                                                                                .map(
                                                                                    (
                                                                                        crew: any,
                                                                                        index: number,
                                                                                    ) => (
                                                                                        <span
                                                                                            key={`mpre-crew-members-${index}`}>
                                                                                            <div className="flex cursor-pointer hover:bg-slblue-800 items-center overflow-auto">
                                                                                                <div className="ps-3 py-2">
                                                                                                    <div className="text-base">
                                                                                                        {
                                                                                                            crew
                                                                                                                .crewMember
                                                                                                                .firstName
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </span>
                                                                                    ),
                                                                                )}
                                                                        </div>
                                                                    </Popover>
                                                                </DialogTrigger>
                                                            )}
                                                        </span>
                                                    ):(<></>)}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                    <div>
                                        {sealogsMemberComments && (
                                            <div className="items-center text-left whitespace-nowrap p-2 cursor-pointer">
                                                {sealogsMemberComments.filter(
                                                    (comment: any) =>
                                                        comment.logBookEntry.id ===
                                                        log.id,
                                                ).length !== 1 ? (
                                                    <div>
                                                        {
                                                            sealogsMemberComments.filter(
                                                                (comment: any) =>
                                                                    comment.logBookEntry
                                                                        .id === log.id,
                                                            ).length
                                                        }{' '}
                                                        Comments
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {
                                                            sealogsMemberComments.filter(
                                                                (comment: any) =>
                                                                    comment.logBookEntry
                                                                        .id === log.id,
                                                            ).length
                                                        }{' '}
                                                        Comment
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="p-2">
                                            {log?.signOffComment?.comment && (
                                                <DialogTrigger>
                                                    <Button className="text-base ml-6 outline-none">
                                                        <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-slblue-500 dark:text-white" />
                                                    </Button>
                                                    <Popover>
                                                        <PopoverWrapper>
                                                            {
                                                                log?.signOffComment
                                                                    ?.comment
                                                            }
                                                        </PopoverWrapper>
                                                    </Popover>
                                                </DialogTrigger>
                                            )}
                                        </div>
                                    </div>
                            </div>
                            <div
                                className={`${selectedTab === log.id && currentCrewMember ? ' dark:bg-sldarkblue-900' : 'hidden'} text-left px-3`}>
                                {currentCrewMember && (
                                    <>
                                        <div className="h-full sticky top-0">
                                            <div
                                                className={`flex justify-end max-h-[calc(100svh_-_100px)] overflow-y-auto`}>
                                                {sealogsMemberComments && (
                                                    <>
                                                        {sealogsMemberComments.filter(
                                                            (comment: any) =>
                                                                comment
                                                                    .logBookEntry
                                                                    .id ===
                                                                log.id,
                                                        ).length > 0 ? (
                                                            <TableWrapper
                                                                headings={[]}>
                                                                <tr>
                                                                    <td className="hidden md:table-cell text-left p-3 w-100">
                                                                        <label
                                                                            className={`${classes.label} text-slgreen-1000 font-semibold hidden md:block !w-auto`}>
                                                                            Date
                                                                        </label>
                                                                    </td>
                                                                    <td className="hidden md:table-cell text-left p-3 border-b border-slblue-200 w-auto">
                                                                        <label
                                                                            className={`${classes.label}`}>
                                                                            Comment
                                                                        </label>
                                                                    </td>
                                                                    <td className="hidden md:table-cell text-center p-3 border-b border-slblue-200 w-auto">
                                                                        <label
                                                                            className={`${classes.label}`}>
                                                                            Reporter
                                                                        </label>
                                                                    </td>
                                                                </tr>
                                                                {sealogsMemberComments.map(
                                                                    (
                                                                        comment: any,
                                                                    ) => (
                                                                        <React.Fragment key={comment.id}>
                                                                            {comment
                                                                                .logBookEntry
                                                                                .id ===
                                                                            log.id ? (
                                                                                <tr
                                                                                    key={
                                                                                        comment.id
                                                                                    }
                                                                                    className={`border-b border-sldarkblue-50 even:bg-sllightblue-50/50 dark:border-slblue-50 hover:bg-sllightblue-50 dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                                                                    <td className="p-3">
                                                                                        <Link
                                                                                            href={`/log-entries/view?&vesselID=${comment.logBookEntry.vehicleID}&logentryID=${comment.logBookEntry.id}&firstTab=${getFirstTabName(comment.fieldName)}&secondTab=${getSecondTabName(comment.fieldName)}`}>
                                                                                            <div className="flex items-center justify-between">
                                                                                                {formatDate(
                                                                                                    comment.lastEdited,
                                                                                                )}
                                                                                            </div>
                                                                                        </Link>
                                                                                    </td>
                                                                                    <td className="p-3">
                                                                                        <Link
                                                                                            href={`/log-entries/view?&vesselID=${comment.logBookEntry.vehicleID}&logentryID=${comment.logBookEntry.id}&firstTab=${getFirstTabName(comment.fieldName)}&secondTab=${getSecondTabName(comment.fieldName)}`}>
                                                                                                <div className="text-xs">
                                                                                                    {composeFieldLabel(
                                                                                                        comment.fieldName,
                                                                                                    )}
                                                                                                </div>
                                                                                                <p>{comment.comment}</p>
                                                                                        </Link>
                                                                                    </td>
                                                                                    <td className="p-3 flex justify-center">
                                                                                        <Link
                                                                                            className='border p-3 rounded-full'
                                                                                            href={`/log-entries/view?&vesselID=${comment.logBookEntry.vehicleID}&logentryID=${comment.logBookEntry.id}&firstTab=${getFirstTabName(comment.fieldName)}&secondTab=${getSecondTabName(comment.fieldName)}`}>
                                                                                            {comment?.seaLogsMember?.firstName?.charAt(
                                                                                                0,
                                                                                            )}
                                                                                            {comment?.seaLogsMember?.surname?.charAt(
                                                                                                0,
                                                                                            )}
                                                                                        </Link>
                                                                                    </td>
                                                                                </tr>
                                                                            ) : (
                                                                                <></>
                                                                            )}
                                                                        </React.Fragment>
                                                                    ),
                                                                )}
                                                            </TableWrapper>
                                                        ) : (
                                                            <div className="">
                                                                No comments on
                                                                this trip log
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <div className="my-4"></div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </>
            ) : (
                <div className="flex justify-center items-center h-32">
                    <p className="">Start by adding a trip log</p>
                </div>
            )}
        </div>
    )
}
