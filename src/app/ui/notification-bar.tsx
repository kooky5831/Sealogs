'use-client'
import React, { useState, useEffect } from 'react'
import { Button } from 'react-aria-components'
import { TableWrapper } from '@/app/components/Components'
import { getSeaLogsMemberComments } from '@/app/lib/actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { formatDate as formatDateHelper } from '@/app/helpers/dateHelper'

export default function NotificationBar(props: any) {
    const [sealogsMemberComments, setSeaLogsMemberComments] = useState<any>()
    const searchParams = useSearchParams()

    getSeaLogsMemberComments(setSeaLogsMemberComments)

    const formatDate = (unix_timestamp: any) => {
        const datedata = new Date(unix_timestamp * 1000)
        const year = datedata.getFullYear()
        const date = datedata.getDate()
        const hour = datedata.getHours() % 2
        const min = datedata.getMinutes()
        const time =
            (date < 10 ? `0${date}` : date) +
            '/' +
            (datedata.getMonth() + 1 < 10
                ? `0${datedata.getMonth() + 1}`
                : datedata.getMonth()) +
            '/' +
            year +
            ' ' +
            (hour < 10 ? `0${hour}` : hour) +
            ':' +
            min +
            (hour >= 12 ? 'pm' : 'am')
        return time
    }

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

    return (
        <>
            <aside
                className={`fixed top-2 right-0 z-40 w-full md:w-1/2 lg:w-2/5 p-4 transition-transform bg-white dark:bg-gray-800 ${props.sidebarOption.notification ? '-translate-x-0 shadow-2xl' : 'translate-x-full'} h-[calc(100vh_-_1.5rem)] rounded-md`}>
                <div className="h-full sticky top-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-monasans font-light dark:text-white">
                            Notifications
                        </h2>
                        <Button
                            onPress={() =>
                                props.setSidebarOption({
                                    ...props.sidebarOption,
                                    notification: false,
                                })
                            }
                            className="text-2xl font-monasans font-light dark:text-white">
                            &times;
                        </Button>
                    </div>
                    <div
                        className={`mb-4 flex justify-end pt-4 max-h-[calc(100svh_-_100px)] overflow-y-auto`}>
                        {sealogsMemberComments && (
                            <TableWrapper
                                headings={['Date', 'Comment', 'Reporter']}>
                                {sealogsMemberComments.map((comment: any) => (
                                    <tr
                                        key={comment.id}
                                        className={`group border-b text-gray-600 hover:text-green-600 font-light dark:text-white dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                        <td className="px-2 py-3 lg:px-6">
                                            <Link
                                                href={`/log-entries/view?&vesselID=${comment.logBookEntry.vehicleID}&logentryID=${comment.logBookEntry.id}&firstTab=${getFirstTabName(comment.fieldName)}&secondTab=${getSecondTabName(comment.fieldName)}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className=" dark:text-white">
                                                        {formatDateHelper(
                                                            comment.lastEdited,
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-2 py-3">
                                            <Link
                                                href={`/log-entries/view?&vesselID=${comment.logBookEntry.vehicleID}&logentryID=${comment.logBookEntry.id}&firstTab=${getFirstTabName(comment.fieldName)}&secondTab=${getSecondTabName(comment.fieldName)}`}>
                                                <div className="flex items-start justify-between">
                                                    <div className=" dark:text-white">
                                                        {comment.commentType}{' '}
                                                        Comment
                                                    </div>
                                                    {comment.logBookEntry
                                                        .vehicle?.title && (
                                                        <div className="inline-block rounded px-3 py-1 ml-3 bg-sky-100 text-sky-800">
                                                            {
                                                                comment
                                                                    .logBookEntry
                                                                    .vehicle
                                                                    .title
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                                <div>{comment.comment}</div>
                                            </Link>
                                        </td>
                                        <td className="px-2 py-3 dark:text-white flex justify-center">
                                            <Link
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
                                ))}
                            </TableWrapper>
                        )}
                    </div>
                    <div className="my-4"></div>
                </div>
            </aside>
        </>
    )
}
