'use client'
import React, { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Heading } from 'react-aria-components'
import { List } from '@/app/ui/skeletons'
import { TableWrapper } from '@/app/components/Components'
import {
    Get_EventType_TaskingChecklist,
    GetRiskFactors,
} from '@/app/lib/graphQL/query'
import SlidingPanel from 'react-sliding-side-panel'
import { XMarkIcon } from '@heroicons/react/24/outline'
import RiskAnalysis from '../logbook/forms/risk-analysis'
import BarCrossingRiskAnalysis from '../logbook/forms/bar-crossing-risk-analysis'
import PvpdRiskAnalysis from '../logbook/forms/pvpd-risk-analysis'

export default function RiskEvaluations() {
    const [taskingChecklist, setTaskingChecklist] = useState<any>(false)
    const [riskFactors, setRiskFactors] = useState<any>(false)
    // const [currentChecklist, setCurrentChecklist] = useState<number>(0)
    const [selectedRow, setSelectedRow] = useState<number>(0)

    useEffect(() => {
        getTaskingChecklist({
            variables: {
                filter: {
                    type: { eq: 'TaskingStartUnderway' },
                    towingChecklistID: { gt: 0 },
                },
            },
        })
        getRiskFactors({
            variables: {
                filter: { type: { ne: 'RiskFactor' } },
            },
        })
    }, [])

    const [getRiskFactors] = useLazyQuery(GetRiskFactors, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            setRiskFactors(data.readRiskFactors.nodes)
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const [getTaskingChecklist] = useLazyQuery(Get_EventType_TaskingChecklist, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            setTaskingChecklist(data.readEventType_Taskings.nodes)
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    return (
        <div className="w-full py-0 dark:text-white mb-4">
            <div className="flex justify-between pt-0 items-center">
                <div className="flex items-center">
                    {/* <Heading className="font-light font-monasans text-3xl dark:text-white">
                        Risk Evaluations
                    </Heading> */}
                </div>
            </div>
            <div className="p-0">
                {riskFactors && (
                    <div className="flex w-full text-left justify-start flex-col md:flex-row items-start">
                        <TableWrapper
                            headings={[
                                'Risk Evaluations:firstHead',
                                'Vessel:left',
                                'Date',
                                'Member:lastHead',
                            ]}>
                            {riskFactors.map((checklist: any) => {
                                return (
                                    <>
                                        <tr
                                            key={checklist.id}
                                            onClick={() => {
                                                selectedRow === checklist.id
                                                    ? setSelectedRow(0)
                                                    : setSelectedRow(
                                                          checklist.id,
                                                      )
                                            }}
                                            className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                            <td className="px-2 py-3 dark:text-white text-left">
                                                <div className="inline-block ml-3 text-base font-normal group-hover:text-sllightblue-1000 ">
                                                    {checklist.type ===
                                                        'TowingChecklist' &&
                                                        'Towing Checklist'}
                                                    {checklist.type ===
                                                        'DangerousGoods' &&
                                                        'Dangerous Goods'}
                                                    {checklist.type ===
                                                        'BarCrossingChecklist' &&
                                                        'Bar Crossing Checklist'}
                                                    {checklist.type ===
                                                        'TowingChecklist' &&
                                                        checklist.towingChecklistID >
                                                            0 &&
                                                        ': #' +
                                                            checklist.towingChecklistID}
                                                    {checklist.type ===
                                                        'DangerousGoods' &&
                                                        checklist.dangerousGoodsID >
                                                            0 &&
                                                        ': #' +
                                                            checklist.dangerousGoodsID}
                                                    {checklist.type ===
                                                        'BarCrossingChecklist' &&
                                                        checklist.barCrossingChecklistID >
                                                            0 &&
                                                        ': #' +
                                                            checklist.barCrossingChecklistID}
                                                </div>
                                            </td>
                                            <td className="px-2 py-3 dark:text-white text-left">
                                                <div className="text-xs inline-block ">
                                                    {checklist?.vessel?.title}
                                                </div>
                                            </td>
                                            <td className="px-2 py-3 dark:text-white">
                                                <div className="text-xs inline-block ">
                                                    {checklist.created}
                                                </div>
                                            </td>
                                            <td className="px-2 py-3 dark:text-white">
                                                <div className="text-xs inline-block ">
                                                    {checklist.type ===
                                                        'TowingChecklist' &&
                                                        (checklist
                                                            ?.towingChecklist
                                                            ?.member?.firstName
                                                            ? checklist
                                                                  ?.towingChecklist
                                                                  ?.member
                                                                  ?.firstName
                                                            : '') +
                                                            ' ' +
                                                            (checklist
                                                                ?.towingChecklist
                                                                ?.member
                                                                ?.surname
                                                                ? checklist
                                                                      ?.towingChecklist
                                                                      ?.member
                                                                      ?.surname
                                                                : '')}
                                                    {checklist.type ===
                                                        'DangerousGoods' &&
                                                        (checklist
                                                            ?.dangerousGoods
                                                            ?.member?.firstName
                                                            ? checklist
                                                                  ?.dangerousGoods
                                                                  ?.member
                                                                  ?.firstName
                                                            : '') +
                                                            ' ' +
                                                            (checklist
                                                                ?.dangerousGoods
                                                                ?.member
                                                                ?.surname
                                                                ? checklist
                                                                      ?.dangerousGoods
                                                                      ?.member
                                                                      ?.surname
                                                                : '')}
                                                    {checklist.type ===
                                                        'BarCrossingChecklist' &&
                                                        (checklist
                                                            ?.barCrossingChecklist
                                                            ?.member?.firstName
                                                            ? checklist
                                                                  ?.barCrossingChecklist
                                                                  ?.member
                                                                  ?.firstName
                                                            : '') +
                                                            ' ' +
                                                            (checklist
                                                                ?.barCrossingChecklist
                                                                ?.member
                                                                ?.surname
                                                                ? checklist
                                                                      ?.barCrossingChecklist
                                                                      ?.member
                                                                      ?.surname
                                                                : '')}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr
                                            key={checklist.id + 'row'}
                                            className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90 ${selectedRow === checklist.id ? '' : 'hidden'}`}>
                                            <td
                                                colSpan={4}
                                                className="text-left">
                                                {selectedRow ===
                                                    checklist.id && (
                                                    <>
                                                        {checklist.type ===
                                                            'TowingChecklist' && (
                                                            <RiskAnalysis
                                                                selectedEvent={
                                                                    false
                                                                }
                                                                onSidebarClose={
                                                                    false
                                                                }
                                                                logBookConfig={
                                                                    false
                                                                }
                                                                currentTrip={
                                                                    false
                                                                }
                                                                crewMembers={
                                                                    false
                                                                }
                                                                towingChecklistID={
                                                                    checklist.towingChecklistID
                                                                }
                                                                logentryID={0}
                                                                setTowingChecklistID={() => {}}
                                                            />
                                                        )}
                                                        {checklist.type ===
                                                            'BarCrossingChecklist' && (
                                                            <BarCrossingRiskAnalysis
                                                                selectedEvent={
                                                                    false
                                                                }
                                                                onSidebarClose={
                                                                    false
                                                                }
                                                                logBookConfig={
                                                                    false
                                                                }
                                                                currentTrip={
                                                                    false
                                                                }
                                                                crewMembers={
                                                                    false
                                                                }
                                                                barCrossingChecklistID={
                                                                    checklist.barCrossingChecklistID
                                                                }
                                                                logentryID={0}
                                                                setBarCrossingChecklistID={() => {}}
                                                            />
                                                        )}
                                                        {/* {checklist.type ===
                                                            'DangerousGoods' && (
                                                            <PvpdRiskAnalysis
                                                                selectedEvent={
                                                                    false
                                                                }
                                                                onSidebarClose={
                                                                    false
                                                                }
                                                                logBookConfig={
                                                                    false
                                                                }
                                                                currentTrip={
                                                                    false
                                                                }
                                                                crewMembers={
                                                                    false
                                                                }
                                                                PVPDChecklistID={
                                                                    checklist.dangerousGoodsID
                                                                }
                                                                logentryID={0}
                                                                setPVPDChecklistID={() => {}}
                                                            />
                                                        )} */}
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    </>
                                )
                            })}
                        </TableWrapper>
                    </div>
                )}
            </div>
            {/* <SlidingPanel type={'right'} isOpen={openRiskAnalysis} size={60}>
                <div className="h-[calc(100vh_-_1rem)] pt-4">
                    <div className="bg-orange-100 h-full flex flex-col justify-between rounded-l-lg">
                        <div className="text-xl dark:text-white text-white items-center flex justify-between font-medium py-4 px-6 rounded-tl-lg bg-orange-400">
                            <div>
                                Risk analysis{' '}
                                <span className="font-thin">
                                    Towing checklist
                                </span>
                            </div>
                            <XMarkIcon
                                className="w-6 h-6"
                                onClick={() => setOpenRiskAnalysis(false)}
                            />
                        </div>
                        <div className="p-4 flex-grow">
                            <RiskAnalysis
                                selectedEvent={false}
                                onSidebarClose={() =>
                                    setOpenRiskAnalysis(false)
                                }
                                logBookConfig={false}
                                currentTrip={false}
                                members={false}
                                towingChecklistID={currentChecklist}
                            />
                        </div>
                    </div>
                </div>
            </SlidingPanel> */}
        </div>
    )
}
