'use client'
import React, { useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { Button, Heading } from 'react-aria-components'
import { List } from '@/app/ui/skeletons'
import { AlertDialog, TableWrapper } from '@/app/components/Components'
import {
    GetRiskFactors,
    Get_EventType_TaskingChecklist,
} from '@/app/lib/graphQL/query'
import SlidingPanel from 'react-sliding-side-panel'
import { XMarkIcon } from '@heroicons/react/24/outline'
import RiskAnalysis from '../logbook/forms/risk-analysis'
import Editor from '../editor'
import { UpdateMitigationStrategy } from '@/app/lib/graphQL/mutation'

export default function RiskStrategies() {
    const [taskingChecklist, setTaskingChecklist] = useState<any>(false)
    const [openRiskAnalysis, setOpenRiskAnalysis] = useState<boolean>(false)
    const [currentChecklist, setCurrentChecklist] = useState<number>(0)
    const [riskFactors, setRiskFactors] = useState<any>(false)
    const [risksOptions, setRisksOptions] = useState<any>(false)
    const [currentRiskFactor, setCurrentRiskFactor] = useState<number>(0)
    const [selectedRow, setSelectedRow] = useState<number>(0)
    const [openStrategyDialog, setOpenStrategyDialog] = useState<boolean>(false)
    const [currentStrategy, setCurrentStrategy] = useState<any>(false)
    const [content, setContent] = useState<string>('')

    const handleEditorChange = (newContent: any) => {
        setContent(newContent)
    }

    useEffect(() => {
        getRiskFactors({
            variables: {
                filter: { type: { ne: 'RiskFactor' } },
            },
        })
    }, [])

    const [getRiskFactors] = useLazyQuery(GetRiskFactors, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            const risks = Array.from(
                new Set(
                    data.readRiskFactors.nodes?.map((risk: any) => risk.title),
                ),
            )?.map((risk: any) => ({ label: risk, value: risk }))
            setRisksOptions(risks)
            setRiskFactors(data.readRiskFactors.nodes)
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const handleUpdateStrategy = () => {
        if (content) {
            updateMitigationStrategy({
                variables: {
                    input: {
                        id: currentStrategy.id,
                        strategy: content,
                    },
                },
            })
        }
        setOpenStrategyDialog(false)
    }

    const [updateMitigationStrategy] = useMutation(UpdateMitigationStrategy, {
        onCompleted: (data) => {
            getRiskFactors({
                variables: {
                    filter: { type: { ne: 'RiskFactor' } },
                },
            })
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
                        Risk Strategies
                    </Heading> */}
                </div>
            </div>
            <div className="p-0">
                {riskFactors && (
                    <div className="flex w-full text-left justify-start flex-col md:flex-row items-start">
                        <TableWrapper
                            headings={[
                                'Risk Strategies:firstHead',
                                'Impact',
                                'Probability:lastHead',
                            ]}>
                            {riskFactors.map((riskFactor: any) => {
                                return (
                                    <>
                                        <tr
                                            key={riskFactor.id}
                                            onClick={() => {
                                                selectedRow === riskFactor.id
                                                    ? setSelectedRow(0)
                                                    : setSelectedRow(
                                                          riskFactor.id,
                                                      )
                                            }}
                                            className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                            <td className="px-2 py-3 dark:text-white text-left">
                                                <div className="inline-block ml-3 text-base font-normal group-hover:text-sllightblue-1000 ">
                                                    {riskFactor?.title
                                                        ? riskFactor.title
                                                        : ' - '}{' '}
                                                    (
                                                    {riskFactor.type ===
                                                        'TowingChecklist' &&
                                                        'Towing Checklist'}
                                                    {riskFactor.type ===
                                                        'DangerousGoods' &&
                                                        'Dangerous Goods'}
                                                    {riskFactor.type ===
                                                        'BarCrossingChecklist' &&
                                                        'Bar Crossing Checklist'}
                                                    )
                                                </div>
                                            </td>
                                            <td className="px-2 py-3 dark:text-white">
                                                <div className="text-xs inline-block ">
                                                    {riskFactor?.impact}
                                                </div>
                                            </td>
                                            <td className="px-2 py-3 dark:text-white">
                                                <div className="text-xs inline-block ">
                                                    {riskFactor.probability +
                                                        '/10'}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr
                                            className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90 ${selectedRow === riskFactor.id ? '' : 'hidden'}`}>
                                            <td
                                                colSpan={3}
                                                className="text-left p-4">
                                                {selectedRow ===
                                                    riskFactor.id && (
                                                    <>
                                                        <Heading className="text-lg font-semibold mb-4">
                                                            Mitigation
                                                            strategies
                                                        </Heading>
                                                        {riskFactor
                                                            .mitigationStrategy
                                                            .nodes.length >
                                                        0 ? (
                                                            <div className="flex gap-2">
                                                                {riskFactor.mitigationStrategy.nodes?.map(
                                                                    (
                                                                        s: any,
                                                                    ) => {
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    s.id
                                                                                }
                                                                                className="border border-gray-200 rounded-md p-4 cursor-pointer"
                                                                                onClick={() => {
                                                                                    setContent(
                                                                                        s.strategy,
                                                                                    )
                                                                                    setOpenStrategyDialog(
                                                                                        true,
                                                                                    )
                                                                                    setCurrentStrategy(
                                                                                        s,
                                                                                    )
                                                                                }}>
                                                                                <div
                                                                                    dangerouslySetInnerHTML={{
                                                                                        __html: s.strategy,
                                                                                    }}></div>
                                                                            </div>
                                                                        )
                                                                    },
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                No strategies
                                                                available
                                                            </div>
                                                        )}
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
            <AlertDialog
                openDialog={openStrategyDialog}
                setOpenDialog={setOpenStrategyDialog}
                handleCreate={handleUpdateStrategy}
                actionText="Update">
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2 mb-4 text-gray-700 dark:text-white">
                    Mitigation Strategy
                </Heading>
                <div className="flex items-center">
                    <Editor
                        id="strategy"
                        placeholder="Mitigation strategy"
                        className="w-full"
                        content={content}
                        handleEditorChange={handleEditorChange}
                    />
                </div>
            </AlertDialog>
        </div>
    )
}
