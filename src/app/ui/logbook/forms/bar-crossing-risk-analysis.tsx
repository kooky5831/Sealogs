'use client'
import {
    AlertDialog,
    PopoverWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import Slider from '@mui/material/Slider'
import Creatable from 'react-select/creatable'
import React, { use, useEffect, useState } from 'react'
import {
    Button,
    DialogTrigger,
    Heading,
    ListBox,
    ListBoxItem,
    Popover,
} from 'react-aria-components'
import {
    UpdateBarCrossingChecklist,
    CreateBarCrossingChecklist,
    UpdateEventType_BarCrossing,
    CreateMitigationStrategy,
    CreateRiskFactor,
    UpdateRiskFactor,
} from '@/app/lib/graphQL/mutation'
import {
    BarCrossingChecklist,
    GetRiskFactors,
    CrewMembers_LogBookEntrySection,
} from '@/app/lib/graphQL/query'
import Select from 'react-select'
import { useLazyQuery, useMutation } from '@apollo/client'
import toast, { Toaster } from 'react-hot-toast'
import { classes } from '@/app/components/GlobalClasses'
import { InformationCircleIcon, TrashIcon } from '@heroicons/react/24/outline'
import Editor from '../../editor'
import { useSearchParams } from 'next/navigation'
import { getLogBookEntryByID } from '@/app/lib/actions'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import LogBookEntryModel from '@/app/offline/models/logBookEntry'
import BarCrossingChecklistModel from '@/app/offline/models/barCrossingChecklist'
import RiskFactorModel from '@/app/offline/models/riskFactor'
import CrewMembers_LogBookEntrySectionModel from '@/app/offline/models/crewMembers_LogBookEntrySection'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import EventType_BarCrossingModel from '@/app/offline/models/eventType_BarCrossing'
import MitigationStrategyModel from '@/app/offline/models/mitigationStrategy'
import { off } from 'process'

export default function BarCrossingRiskAnalysis({
    selectedEvent = false,
    onSidebarClose,
    logBookConfig,
    currentTrip,
    crewMembers = false,
    barCrossingChecklistID = 0,
    logentryID = 0,
    setBarCrossingChecklistID,
    offline = false,
}: {
    selectedEvent: any
    onSidebarClose: any
    logBookConfig: any
    currentTrip: any
    crewMembers: any
    barCrossingChecklistID: number
    logentryID: number
    setBarCrossingChecklistID: any
    offline?: boolean
}) {
    const searchParams = useSearchParams()
    const vesselID = searchParams.get('vesselID') ?? 0
    const [riskAnalysis, setRiskAnalysis] = useState<any>(false)
    const [riskBuffer, setRiskBuffer] = useState<any>(false)
    const [openRiskDialog, setOpenRiskDialog] = useState(false)
    const [currentRisk, setCurrentRisk] = useState<any>(false)
    const [content, setContent] = useState<any>('')
    const [allRisks, setAllRisks] = useState<any>(false)
    const [allRiskFactors, setAllRiskFactors] = useState<any>([])
    const [riskValue, setRiskValue] = useState<any>(null)
    const [updateStrategy, setUpdateStrategy] = useState(false)
    const [strategyEditor, setstrategyEditor] = useState<any>(false)
    const [openRecommendedstrategy, setOpenRecommendedstrategy] =
        useState(false)
    const [recommendedStratagies, setRecommendedStratagies] =
        useState<any>(false)
    const [currentStrategies, setCurrentStrategies] = useState<any>([])
    const [recommendedstrategy, setRecommendedstrategy] = useState<any>(false)
    const [riskToDelete, setRiskToDelete] = useState<any>(false)
    const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false)
    const [logbook, setLogbook] = useState<any>(false)
    const [members, setMembers] = useState<any>(false)
    const [creatingBarCrossingChecklist, setCreatingBarCrossingChecklist] =
        useState(false)

    const [permissions, setPermissions] = useState<any>(false)
    const [edit_risks, setEdit_risks] = useState<any>(false)
    const [delete_risks, setDelete_risks] = useState<any>(false)
    const [editBarCrossingRisk, setEditBarCrossingRisk] = useState<any>(false)
    const logBookEntryModel = new LogBookEntryModel()
    const barCrossingChecklistModel = new BarCrossingChecklistModel()
    const riskFactorModel = new RiskFactorModel()
    const crewMemberModel = new CrewMembers_LogBookEntrySectionModel()
    const barCrossingModel = new EventType_BarCrossingModel()
    const mitigationStrategyModel = new MitigationStrategyModel()
    const init_permissions = () => {
        if (permissions) {
            if (hasPermission('EDIT_RISK', permissions)) {
                setEdit_risks(true)
            } else {
                setEdit_risks(false)
            }
            if (hasPermission('DELETE_RISK', permissions)) {
                setDelete_risks(true)
            } else {
                setDelete_risks(false)
            }
            if (hasPermission('EDIT_LOGBOOKENTRY_RISK_ANALYSIS', permissions)) {
                setEditBarCrossingRisk(true)
            } else {
                setEditBarCrossingRisk(false)
            }
        }
    }

    useEffect(() => {
        setPermissions(getPermissions)
        init_permissions()
    }, [])

    useEffect(() => {
        init_permissions()
    }, [permissions])

    const [
        getSectionCrewMembers_LogBookEntrySection,
        { loading: crewMembersLoading },
    ] = useLazyQuery(CrewMembers_LogBookEntrySection, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            let data = response.readCrewMembers_LogBookEntrySections.nodes
            const crewMembers = data
                .map((member: any) => {
                    return {
                        label: `${member.crewMember.firstName ?? ''} ${member.crewMember.surname ?? ''}`,
                        value: member.crewMember.id,
                    }
                })
                .filter((member: any) => member.value != logbook.master.id)
            setMembers([...members, ...crewMembers])
        },
        onError: (error: any) => {
            console.error('CrewMembers_LogBookEntrySection error', error)
        },
    })

    const handleSetLogbook = async (logbook: any) => {
        setLogbook(logbook)
        const master = {
            label: `${logbook.master.firstName ?? ''} ${logbook.master.surname ?? ''}`,
            value: logbook.master.id,
        }
        setMembers([master])
        const sections = logbook.logBookEntrySections.nodes.filter(
            (node: any) => {
                return (
                    node.className ===
                    'SeaLogs\\CrewMembers_LogBookEntrySection'
                )
            },
        )
        if (sections) {
            const sectionIDs = sections.map((section: any) => section.id)
            if (sectionIDs?.length > 0) {
                if (offline) {
                    const data = await crewMemberModel.getByIds(sectionIDs)
                    const crewMembers = data
                        .map((member: any) => {
                            return {
                                label: `${member.crewMember.firstName ?? ''} ${member.crewMember.surname ?? ''}`,
                                value: member.crewMember.id,
                            }
                        })
                        .filter(
                            (member: any) => member.value != logbook.master.id,
                        )
                    setMembers([...members, ...crewMembers])
                } else {
                    getSectionCrewMembers_LogBookEntrySection({
                        variables: {
                            filter: { id: { in: sectionIDs } },
                        },
                    })
                }
            }
        }
    }

    if (logentryID > 0 && !offline) {
        getLogBookEntryByID(+logentryID, handleSetLogbook)
    }

    useEffect(() => {
        if (crewMembers) {
            setMembers(crewMembers)
        }
    }, [crewMembers])

    const handleBCRAFieldChange = (field: string) => async (check: Boolean) => {
        if (!editBarCrossingRisk || !edit_risks) {
            toast.error('You do not have permission to edit this section')
            return
        }
        setRiskBuffer({
            ...riskBuffer,
            [field]: check ? 'on' : 'off',
        })
        if (+riskAnalysis?.id > 0) {
            if (offline) {
                await barCrossingChecklistModel.save({
                    id: riskAnalysis.id,
                    [field]: check ? true : false,
                })
            } else {
                updateBarCrossingChecklist({
                    variables: {
                        input: {
                            id: riskAnalysis.id,
                            [field]: check ? true : false,
                        },
                    },
                })
            }
        }
    }

    const [updateBarCrossingChecklist] = useMutation(
        UpdateBarCrossingChecklist,
        {
            onCompleted: (data) => {},
            onError: (error) => {
                console.error('onError', error)
            },
        },
    )

    const fields = [
        {
            name: 'StopAssessPlan',
            label: 'Stopped, Assessed, Planned',
            value: 'stopAssessPlan',
            checked: riskBuffer?.stopAssessPlan
                ? riskBuffer.stopAssessPlan === 'on'
                : riskAnalysis?.stopAssessPlan,
            handleChange: handleBCRAFieldChange('stopAssessPlan'),
            description: (
                <small>
                    <div>
                        Pause before crossing to evaluate conditions and create
                        a detailed crossing plan.
                    </div>
                    {/*<div>
                        Check for fittings on the vessel that could damage the
                        CRV when coming alongside.
                    </div>*/}
                </small>
            ),
        },
        {
            name: 'CrewBriefing',
            label: 'Briefed crew on crossing',
            value: 'crewBriefing',
            checked: riskBuffer?.crewBriefing
                ? riskBuffer.crewBriefing === 'on'
                : riskAnalysis?.crewBriefing,
            handleChange: handleBCRAFieldChange('crewBriefing'),
            description: (
                <small>
                    <div>
                        Inform the crew about the crossing plan and any
                        potential hazards.
                    </div>
                    {/*<div>
                        Does a crew member need to go on board the other vessel
                        to assist?
                    </div>*/}
                </small>
            ),
        },
        {
            name: 'Weather',
            label: 'Weather, tide, bar conditions checked as suitable for crossing',
            value: 'weather',
            checked: riskBuffer?.weather
                ? riskBuffer.weather === 'on'
                : riskAnalysis?.weather,
            handleChange: handleBCRAFieldChange('weather'),
            description: (
                <small>
                    <div>
                        Verify that weather, tide, and bar conditions are
                        favorable and safe for crossing.
                    </div>
                    {/*<div>
                        Check for injuries or medical assistance required.
                    </div>*/}
                </small>
            ),
        },
        {
            name: 'Stability',
            label: 'Adequate stability checked',
            value: 'stability',
            checked: riskBuffer?.stability
                ? riskBuffer.stability === 'on'
                : riskAnalysis?.stability,
            handleChange: handleBCRAFieldChange('stability'),
            description: (
                <small>
                    <div>
                        Ensure the vessel is stable enough to handle the
                        crossing without capsizing.
                    </div>
                    {/*<div>Check the vessel is optimally trimmed for towing.</div>*/}
                </small>
            ),
        },
        {
            name: 'LifeJackets',
            label: 'Lifejackets on',
            value: 'lifeJackets',
            checked: riskBuffer?.lifeJackets
                ? riskBuffer.lifeJackets === 'on'
                : riskAnalysis?.lifeJackets,
            handleChange: handleBCRAFieldChange('lifeJackets'),
            description: (
                <small>
                    <div>
                        Instruct crew to wear lifejackets if conditions are
                        rough or challenging.
                    </div>
                </small>
            ),
        },
        {
            name: 'WaterTightness',
            label: 'Water tightness checked',
            value: 'waterTightness',
            checked: riskBuffer?.waterTightness
                ? riskBuffer.waterTightness === 'on'
                : riskAnalysis?.waterTightness,
            handleChange: handleBCRAFieldChange('waterTightness'),
            description: (
                <small>
                    <div>
                        Confirm that all hatches and doors are secured to
                        prevent water ingress.
                    </div>
                    {/*<div>
                        Ensure there is agreement on where to tow the vessel to.
                    </div>*/}
                </small>
            ),
        },
        {
            name: 'LookoutPosted',
            label: 'Lookout posted',
            value: 'lookoutPosted',
            checked: riskBuffer?.lookoutPosted
                ? riskBuffer.lookoutPosted === 'on'
                : riskAnalysis?.lookoutPosted,
            handleChange: handleBCRAFieldChange('lookoutPosted'),
            description: (
                <small>
                    <div>
                        Assign a crew member to watch for hazards or changes in
                        conditions during the crossing.
                    </div>
                    {/*<div>Ensure everything on board is stowed and secure.</div>
                    <div>
                        Confirm waterline length/cruising speed of the vessel
                        (safe tow speed).
                    </div>
                    <div>Confirm attachment points for the towline.</div>
                    <div>Confirm that the towline is securely attached.</div>
                    <div>
                        Ensure that no one on the other vessel is in close
                        proximity to the towline before commencing the tow.
                    </div>
                    <div>
                        Turn on CRV towing lights and other vessel’s navigation
                        lights.
                    </div>
                    <div>
                        Post towline lookout with responsibility for quick
                        release of the tow / must carry or have a knife handy.
                    </div>*/}
                </small>
            ),
        },
    ]
    const offlineGetRiskAnalysis = async () => {
        const data = await barCrossingChecklistModel.getById(
            +barCrossingChecklistID > 0
                ? barCrossingChecklistID
                : selectedEvent?.eventType_BarCrossing?.barCrossingChecklist
                      ?.id,
        )
        setRiskAnalysis(data)
    }
    useEffect(() => {
        if (selectedEvent || barCrossingChecklistID > 0) {
            if (
                selectedEvent?.eventType_BarCrossing?.barCrossingChecklist?.id >
                    0 ||
                barCrossingChecklistID > 0
            ) {
                if (offline) {
                    offlineGetRiskAnalysis()
                } else {
                    getRiskAnalysis({
                        variables: {
                            id:
                                barCrossingChecklistID > 0
                                    ? barCrossingChecklistID
                                    : selectedEvent?.eventType_BarCrossing
                                          ?.barCrossingChecklist?.id,
                        },
                    })
                }
            }
        } else {
            if (!creatingBarCrossingChecklist) {
                setCreatingBarCrossingChecklist(true)
            }
        }
    }, [selectedEvent, barCrossingChecklistID])

    const createOfflineBarCrossingChecklist = async () => {
        const data = await barCrossingChecklistModel.save({
            id: generateUniqueId(),
        })
        setBarCrossingChecklistID(+data.id)
        if (
            barCrossingChecklistID > 0 ||
            selectedEvent?.eventType_BarCrossing?.id
        ) {
            await barCrossingModel.save({
                id:
                    barCrossingChecklistID > 0
                        ? barCrossingChecklistID
                        : selectedEvent?.eventType_BarCrossing?.id,
                barCrossingChecklistID: +data.id,
            })
        }
        const barCrossingChecklistData =
            await barCrossingChecklistModel.getById(data.id)
        setRiskAnalysis(barCrossingChecklistData)
    }
    useEffect(() => {
        if (creatingBarCrossingChecklist) {
            if (offline) {
                createOfflineBarCrossingChecklist()
            } else {
                createBarCrossingChecklist({
                    variables: {
                        input: {},
                    },
                })
            }
        }
    }, [creatingBarCrossingChecklist])

    const offlineMount = async () => {
        const data = await riskFactorModel.getByFieldID(
            'type',
            'BarCrossingChecklist',
        )
        const risks = Array.from(
            new Set(data.map((risk: any) => risk.title)),
        )?.map((risk: any) => ({ label: risk, value: risk }))
        setAllRisks(risks)
        setAllRiskFactors(data)
    }
    useEffect(() => {
        if (offline) {
            offlineMount()
        } else {
            getRiskFactors({
                variables: {
                    filter: { type: { eq: 'BarCrossingChecklist' } },
                },
            })
        }
    }, [])

    const [getRiskFactors] = useLazyQuery(GetRiskFactors, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            const risks = Array.from(
                new Set(
                    data.readRiskFactors.nodes?.map((risk: any) => risk.title),
                ),
            )?.map((risk: any) => ({ label: risk, value: risk }))
            setAllRisks(risks)
            setAllRiskFactors(data.readRiskFactors.nodes)
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const [getRiskAnalysis] = useLazyQuery(BarCrossingChecklist, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            setRiskAnalysis(data.readOneBarCrossingChecklist)
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const [createBarCrossingChecklist] = useMutation(
        CreateBarCrossingChecklist,
        {
            onCompleted: (data) => {
                setBarCrossingChecklistID(+data.createBarCrossingChecklist.id)
                if (
                    barCrossingChecklistID > 0 ||
                    selectedEvent?.eventType_BarCrossing?.id
                ) {
                    updateEvent({
                        variables: {
                            input: {
                                id:
                                    barCrossingChecklistID > 0
                                        ? barCrossingChecklistID
                                        : selectedEvent?.eventType_BarCrossing
                                              ?.id,
                                barCrossingChecklistID:
                                    +data.createBarCrossingChecklist.id,
                            },
                        },
                    })
                }
                getRiskAnalysis({
                    variables: {
                        id: data.createBarCrossingChecklist.id,
                    },
                })
            },
            onError: (error) => {
                console.error('onError', error)
            },
        },
    )

    const [updateEvent] = useMutation(UpdateEventType_BarCrossing, {
        onCompleted: (data) => {},
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const updateRiskAnalysisMember = async (memberID: number) => {
        if (!editBarCrossingRisk || !edit_risks) {
            toast.error('You do not have permission to edit this section')
            return
        }
        setRiskBuffer({
            ...riskBuffer,
            memberID: memberID,
        })
        if (+riskAnalysis?.id > 0) {
            if (offline) {
                await barCrossingChecklistModel.save({
                    id: riskAnalysis.id,
                    memberID: memberID,
                })
            } else {
                updateBarCrossingChecklist({
                    variables: {
                        input: {
                            id: riskAnalysis.id,
                            memberID: memberID,
                        },
                    },
                })
            }
        }
    }

    const handleEditorChange = (newContent: any) => {
        setContent(newContent)
    }

    const riskImpacts = [
        { value: 'Low', label: 'Low impact' },
        { value: 'Medium', label: 'Medium impact' },
        { value: 'High', label: 'High impact' },
        { value: 'Severe', label: 'Severe impact' },
    ]
    const handleSaveRisk = async () => {
        if (currentRisk.id > 0) {
            if (offline) {
                await riskFactorModel.save({
                    id: currentRisk.id,
                    type: 'BarCrossingChecklist',
                    title: currentRisk.title,
                    impact: currentRisk?.impact ? currentRisk?.impact : 'Low',
                    probability: currentRisk?.probability
                        ? currentRisk?.probability
                        : 5,
                    mitigationStrategy:
                        currentStrategies.length > 0
                            ? currentStrategies.map((s: any) => s.id).join(',')
                            : '',
                    barCrossingChecklistID: riskAnalysis?.id,
                })
                setOpenRiskDialog(false)
                const riskFactorData = await riskFactorModel.getByFieldID(
                    'type',
                    'BarCrossingChecklist',
                )
                const risks = Array.from(
                    new Set(riskFactorData.map((risk: any) => risk.title)),
                )?.map((risk: any) => ({ label: risk, value: risk }))
                setAllRisks(risks)
                setAllRiskFactors(riskFactorData)
                const barCrossingChecklistData =
                    await barCrossingChecklistModel.getById(
                        barCrossingChecklistID > 0
                            ? barCrossingChecklistID
                            : selectedEvent?.eventType_BarCrossing
                                  ?.barCrossingChecklist?.id,
                    )
                setRiskAnalysis(barCrossingChecklistData)
            } else {
                updateRiskFactor({
                    variables: {
                        input: {
                            id: currentRisk.id,
                            type: 'BarCrossingChecklist',
                            title: currentRisk.title,
                            impact: currentRisk?.impact
                                ? currentRisk?.impact
                                : 'Low',
                            probability: currentRisk?.probability
                                ? currentRisk?.probability
                                : 5,
                            mitigationStrategy:
                                currentStrategies.length > 0
                                    ? currentStrategies
                                          .map((s: any) => s.id)
                                          .join(',')
                                    : '',
                            barCrossingChecklistID: riskAnalysis?.id,
                        },
                    },
                })
            }
        } else {
            if (offline) {
                await riskFactorModel.save({
                    id: generateUniqueId(),
                    type: 'BarCrossingChecklist',
                    title: currentRisk.title,
                    impact: currentRisk?.impact ? currentRisk?.impact : 'Low',
                    probability: currentRisk?.probability
                        ? currentRisk?.probability
                        : 5,
                    mitigationStrategy:
                        currentStrategies.length > 0
                            ? currentStrategies.map((s: any) => s.id).join(',')
                            : '',
                    barCrossingChecklistID: riskAnalysis?.id,
                    vesselID: vesselID,
                })
                toast.dismiss()
                toast.success('Risk created')
                setOpenRiskDialog(false)
                const riskFactorData = await riskFactorModel.getByFieldID(
                    'type',
                    'BarCrossingChecklist',
                )
                const risks = Array.from(
                    new Set(riskFactorData.map((risk: any) => risk.title)),
                )?.map((risk: any) => ({ label: risk, value: risk }))
                setAllRisks(risks)
                setAllRiskFactors(riskFactorData)
                const barCrossingChecklistData =
                    await barCrossingChecklistModel.getById(
                        barCrossingChecklistID > 0
                            ? barCrossingChecklistID
                            : selectedEvent?.eventType_BarCrossing
                                  ?.barCrossingChecklist?.id,
                    )
                setRiskAnalysis(barCrossingChecklistData)
            } else {
                createRiskFactor({
                    variables: {
                        input: {
                            type: 'BarCrossingChecklist',
                            title: currentRisk.title,
                            impact: currentRisk?.impact
                                ? currentRisk?.impact
                                : 'Low',
                            probability: currentRisk?.probability
                                ? currentRisk?.probability
                                : 5,
                            mitigationStrategy:
                                currentStrategies.length > 0
                                    ? currentStrategies
                                          .map((s: any) => s.id)
                                          .join(',')
                                    : '',
                            barCrossingChecklistID: riskAnalysis?.id,
                            vesselID: vesselID,
                        },
                    },
                })
            }
        }
    }

    const [createMitigationStrategy] = useMutation(CreateMitigationStrategy, {
        onCompleted: (data) => {
            setCurrentStrategies([
                ...currentStrategies,
                { id: data.createMitigationStrategy.id, strategy: content },
            ])
            setContent('')
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const [createRiskFactor] = useMutation(CreateRiskFactor, {
        onCompleted: (data) => {
            toast.dismiss()
            toast.success('Risk created')
            setOpenRiskDialog(false)
            getRiskFactors({
                variables: {
                    filter: { type: { eq: 'BarCrossingChecklist' } },
                },
            })
            getRiskAnalysis({
                variables: {
                    id:
                        barCrossingChecklistID > 0
                            ? barCrossingChecklistID
                            : selectedEvent?.eventType_BarCrossing
                                  ?.barCrossingChecklist?.id,
                },
            })
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const [updateRiskFactor] = useMutation(UpdateRiskFactor, {
        onCompleted: (data) => {
            setOpenRiskDialog(false)
            getRiskFactors({
                variables: {
                    filter: { type: { eq: 'BarCrossingChecklist' } },
                },
            })
            getRiskAnalysis({
                variables: {
                    id:
                        barCrossingChecklistID > 0
                            ? barCrossingChecklistID
                            : selectedEvent?.eventType_BarCrossing
                                  ?.barCrossingChecklist?.id,
                },
            })
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const handleRiskValue = (v: any) => {
        setCurrentRisk({
            ...currentRisk,
            title: v?.value,
        })
        setRiskValue({ value: v.value, label: v.value })
        if (
            allRiskFactors?.filter(
                (risk: any) =>
                    risk.title === v.value &&
                    risk.mitigationStrategy.nodes.length > 0,
            ).length > 0
        ) {
            setRecommendedStratagies(
                Array.from(
                    new Set(
                        allRiskFactors
                            ?.filter(
                                (r: any) =>
                                    r.title === v.value &&
                                    r.mitigationStrategy.nodes.length > 0,
                            )
                            .map((r: any) => r.mitigationStrategy.nodes)[0]
                            .map((s: any) => ({
                                id: s.id,
                                strategy: s.strategy,
                            })),
                    ),
                ),
            )
        } else {
            setRecommendedStratagies(false)
        }
    }

    const handleCreateRisk = (inputValue: any) => {
        setCurrentRisk({
            ...currentRisk,
            title: inputValue,
        })
        setRiskValue({ value: inputValue, label: inputValue })
        if (allRisks) {
            const risk = [...allRisks, { value: inputValue, label: inputValue }]
            setAllRisks(risk)
        } else {
            setAllRisks([{ value: inputValue, label: inputValue }])
        }
    }

    const handleDeleteRisk = async () => {
        if (offline) {
            await riskFactorModel.save({
                id: riskToDelete.id,
                barCrossingChecklistID: 0,
                vesselID: 0,
            })
            setOpenRiskDialog(false)
            const riskFactorData = await riskFactorModel.getByFieldID(
                'type',
                'BarCrossingChecklist',
            )
            const risks = Array.from(
                new Set(riskFactorData.map((risk: any) => risk.title)),
            )?.map((risk: any) => ({ label: risk, value: risk }))
            setAllRisks(risks)
            setAllRiskFactors(riskFactorData)
            const barCrossingChecklistData =
                await barCrossingChecklistModel.getById(
                    barCrossingChecklistID > 0
                        ? barCrossingChecklistID
                        : selectedEvent?.eventType_BarCrossing
                              ?.barCrossingChecklist?.id,
                )
            setRiskAnalysis(barCrossingChecklistData)
        } else {
            updateRiskFactor({
                variables: {
                    input: {
                        id: riskToDelete.id,
                        barCrossingChecklistID: 0,
                        vesselID: 0,
                    },
                },
            })
        }
        setOpenDeleteConfirmation(false)
    }

    const handleSetCurrentStrategies = (strategy: any) => {
        if (currentStrategies.length > 0) {
            if (currentStrategies.find((s: any) => s.id === strategy.id)) {
                setCurrentStrategies(
                    currentStrategies.filter((s: any) => s.id !== strategy.id),
                )
            } else {
                setCurrentStrategies([...currentStrategies, strategy])
            }
        } else {
            setCurrentStrategies([strategy])
        }
    }

    const handleNewStratagy = async () => {
        if (content) {
            if (offline) {
                const data = await mitigationStrategyModel.save({
                    id: generateUniqueId(),
                    strategy: content,
                })
                setCurrentStrategies([
                    ...currentStrategies,
                    { id: data.id, strategy: content },
                ])
                setContent('')
            } else {
                createMitigationStrategy({
                    variables: {
                        input: {
                            strategy: content,
                        },
                    },
                })
            }
        }
        setOpenRecommendedstrategy(false)
    }

    const handleSetRiskValue = (v: any) => {
        setRiskValue({
            value: v.title,
            label: v.title,
        })
        if (
            allRiskFactors?.filter(
                (risk: any) =>
                    risk.title === v.title &&
                    risk.mitigationStrategy.nodes.length > 0,
            ).length > 0
        ) {
            setRecommendedStratagies(
                Array.from(
                    new Set(
                        allRiskFactors
                            ?.filter(
                                (r: any) =>
                                    r.title === v.title &&
                                    r.mitigationStrategy.nodes.length > 0,
                            )
                            .map((r: any) => r.mitigationStrategy.nodes)[0]
                            .map((s: any) => ({
                                id: s.id,
                                strategy: s.strategy,
                            })),
                    ),
                ),
            )
        } else {
            setRecommendedStratagies(false)
        }
    }
    const offlineUseEffect = async () => {
        // getLogBookEntryByID(+logentryID, handleSetLogbook)
        const logbook = await logBookEntryModel.getById(logentryID)
        handleSetLogbook(logbook)
    }
    useEffect(() => {
        if (offline) {
            offlineUseEffect()
        }
    }, [offline])

    return (
        <div
            className={`${barCrossingChecklistID > 0 ? 'px-4' : 'px-0 md:pl-4'}`}>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="">
                    {fields.map((field: any, index: number) => (
                        <div key={index} className="my-4 flex items-center">
                            <label
                                className="relative flex items-center pr-3 rounded-full cursor-pointer"
                                htmlFor={`${field.value}-onChangeComplete`}
                                data-ripple="true"
                                data-ripple-color="dark"
                                data-ripple-dark="true">
                                <div className="md:w-8 md:h-8 w-6 h-6 flex-shrink-0">
                                    {field.checked ? (
                                        <img
                                            className="bg-orange-50 ring-1 ring-orange-200 p-0.5 rounded-full"
                                            src="/sealogs-ok-check.svg"
                                            alt=""
                                        />
                                    ) : (
                                        <img
                                            className="bg-orange-50 ring-1 ring-orange-200 p-0.5 rounded-full"
                                            src="/sealogs-empty-check.svg"
                                            alt=""
                                        />
                                    )}
                                </div>
                                <input
                                    id={`${field.value}-onChangeComplete`}
                                    type="checkbox"
                                    onChange={(e: any) => {
                                        field.handleChange(e.target.checked)
                                    }}
                                    className={
                                        classes.radioInput + ' ' + 'hidden'
                                    }
                                />
                                <span className="ml-3 text-sm font-semibold">
                                    {field.label}
                                </span>
                                <DialogTrigger>
                                    <Button className="text-base outline-none px-1">
                                        <SeaLogsButton
                                            icon="alert"
                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                        />
                                    </Button>
                                    <Popover>
                                        <PopoverWrapper>
                                            {field.description}
                                        </PopoverWrapper>
                                    </Popover>
                                </DialogTrigger>
                            </label>
                        </div>
                    ))}
                    <div className="flex items-center">
                        {members && riskAnalysis && (
                            <Select
                                id="author"
                                options={members}
                                menuPlacement="top"
                                placeholder="Author"
                                defaultValue={
                                    members?.find(
                                        (member: any) =>
                                            member.value ==
                                            riskAnalysis?.member?.id,
                                    )
                                        ? members?.find(
                                              (member: any) =>
                                                  member.value ==
                                                  riskAnalysis?.member?.id,
                                          )
                                        : null
                                }
                                className={classes.selectMain}
                                onChange={(value: any) =>
                                    updateRiskAnalysisMember(value?.value)
                                }
                                classNames={{
                                    control: () =>
                                        'flex py-0.5 w-full !text-sm !text-orange-900 !bg-orange-50 !rounded-lg !border !border-orange-200 focus:ring-orange-500 focus:border-orange-500 dark:placeholder-orange-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                    singleValue: () => 'dark:!text-white',
                                    menu: () => 'dark:bg-orange-800',
                                    option: () => classes.selectOption,
                                }}
                            />
                        )}
                    </div>
                </div>
                <div
                    className={`${barCrossingChecklistID > 0 ? 'mt-4' : ''} bg-orange-50 dark:bg-orange-300 border-orange-300 dark:border-orange-800 border rounded-lg p-4`}>
                    <Heading className="text-lg font-semibold leading-6 mb-4 text-gray-700 dark:text-white">
                        Risk Analysis
                    </Heading>
                    <div>
                        {riskAnalysis?.riskFactors?.nodes.length > 0 && (
                            <ListBox
                                aria-label="RiskAnalysis"
                                className={`mb-4`}>
                                {riskAnalysis.riskFactors.nodes.map(
                                    (risk: any) => (
                                        <ListBoxItem
                                            key={`${risk.id}-riskAnalysis`}
                                            textValue={risk.title}
                                            className="flex items-center justify-between mb-4 text-sm dark:placeholder-gray-400 dark:text-white">
                                            <label
                                                className="relative inline-flex items-center pr-3 rounded-full cursor-pointer"
                                                htmlFor={risk.id}
                                                data-ripple="true"
                                                data-ripple-color="dark"
                                                data-ripple-dark="true"
                                                onClick={() => {
                                                    if (
                                                        !editBarCrossingRisk ||
                                                        !edit_risks
                                                    ) {
                                                        toast.error(
                                                            'You do not have permission to edit this section',
                                                        )
                                                        return
                                                    }
                                                    handleSetRiskValue(risk)
                                                    setCurrentRisk(risk)
                                                    setOpenRiskDialog(true)
                                                }}>
                                                <span className={`text-sm`}>
                                                    {risk.title}
                                                    {risk?.impact
                                                        ? ' - ' + risk.impact
                                                        : ''}
                                                    {risk?.probability
                                                        ? ' - ' +
                                                          risk.probability +
                                                          '/10'
                                                        : ''}
                                                </span>
                                            </label>
                                            <div className="flex items-center">
                                                <DialogTrigger>
                                                    <Button className="text-base outline-none px-1">
                                                        <SeaLogsButton
                                                            icon="alert"
                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                        />
                                                    </Button>
                                                    <Popover>
                                                        <PopoverWrapper>
                                                            {risk
                                                                ?.mitigationStrategy
                                                                ?.nodes.length >
                                                                0 &&
                                                                risk?.mitigationStrategy?.nodes.map(
                                                                    (
                                                                        s: any,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                s.id
                                                                            }>
                                                                            <div
                                                                                dangerouslySetInnerHTML={{
                                                                                    __html: s.strategy,
                                                                                }}></div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                        </PopoverWrapper>
                                                    </Popover>
                                                </DialogTrigger>
                                                <Button
                                                    className="text-base outline-none px-1"
                                                    onPress={() => {
                                                        if (
                                                            !editBarCrossingRisk ||
                                                            !delete_risks
                                                        ) {
                                                            toast.error(
                                                                'You do not have permission to edit this section',
                                                            )
                                                            return
                                                        }
                                                        setOpenDeleteConfirmation(
                                                            true,
                                                        ),
                                                            setRiskToDelete(
                                                                risk,
                                                            )
                                                    }}>
                                                    <TrashIcon className="w-5 h-5 text-emerald-800 dark:text-white" />
                                                </Button>
                                            </div>
                                        </ListBoxItem>
                                    ),
                                )}
                            </ListBox>
                        )}
                    </div>
                    <div>
                        <SeaLogsButton
                            text="Add Risk"
                            type="text"
                            icon="plus"
                            action={() => {
                                if (!editBarCrossingRisk || !edit_risks) {
                                    toast.error(
                                        'You do not have permission to edit this section',
                                    )
                                    return
                                }
                                setCurrentRisk({}), setContent('')
                                setRiskValue(null), setOpenRiskDialog(true)
                            }}
                        />
                    </div>
                </div>
            </div>
            <AlertDialog
                openDialog={openRiskDialog}
                setOpenDialog={setOpenRiskDialog}
                handleCreate={handleSaveRisk}
                actionText={currentRisk?.id > 0 ? 'Update' : 'Create Risk'}>
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2 mb-4 text-gray-700 dark:text-white">
                    {currentRisk?.id > 0 ? 'Update Risk' : 'Create New Risk'}
                </Heading>
                <div className="my-2 flex items-center">
                    {allRisks && (
                        <Creatable
                            id="impact"
                            options={allRisks}
                            menuPlacement="top"
                            placeholder="Risk"
                            value={riskValue}
                            className={classes.selectMain}
                            onCreateOption={handleCreateRisk}
                            onChange={handleRiskValue}
                            classNames={{
                                control: () =>
                                    'flex py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                singleValue: () => 'dark:!text-white',
                                menu: () => 'dark:bg-gray-800',
                                option: () => classes.selectOption,
                            }}
                        />
                    )}
                </div>
                <div className="my-2 flex items-center">
                    <Select
                        id="impact"
                        options={riskImpacts}
                        menuPlacement="top"
                        placeholder="Risk impact"
                        defaultValue={
                            currentRisk?.impact
                                ? riskImpacts?.find(
                                      (impact: any) =>
                                          impact.value == currentRisk?.impact,
                                  )
                                : null
                        }
                        className={classes.selectMain}
                        onChange={(value: any) =>
                            setCurrentRisk({
                                ...currentRisk,
                                impact: value?.value,
                            })
                        }
                        classNames={{
                            control: () =>
                                'flex py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                            singleValue: () => 'dark:!text-white',
                            menu: () => 'dark:bg-gray-800',
                            option: () => classes.selectOption,
                        }}
                    />
                </div>
                <div className="my-1">
                    <div>Risk probability</div>
                    <Slider
                        defaultValue={
                            currentRisk?.probability
                                ? currentRisk?.probability
                                : 5
                        }
                        valueLabelDisplay="auto"
                        getAriaValueText={(value: number) => `${value}/10`}
                        step={1}
                        min={0}
                        max={10}
                        style={{ color: '#ff9900', height: 8 }}
                        onChange={(event: any, value: any) =>
                            setCurrentRisk({
                                ...currentRisk,
                                probability: value,
                            })
                        }
                    />
                </div>
                <div className="flex items-center">
                    {/* {recommendedstrategy && !updateStrategy ? ( */}
                    <div className="flex gap-4 flex-col">
                        <Heading className="text-lg font-semibold leading-6 text-gray-700 dark:text-white">
                            Mitigation strategy
                        </Heading>
                        {currentRisk?.mitigationStrategy?.nodes?.length > 0 &&
                            currentRisk?.mitigationStrategy?.nodes.map(
                                (s: any) => (
                                    <div key={s.id}>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: s.strategy,
                                            }}></div>
                                    </div>
                                ),
                            )}
                        {currentStrategies.length > 0 &&
                            currentStrategies?.map((s: any) => (
                                <div key={s.id}>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: s.strategy,
                                        }}></div>
                                </div>
                            ))}
                        <div
                            dangerouslySetInnerHTML={{
                                __html: content,
                            }}></div>
                        <SeaLogsButton
                            text="Add strategy"
                            color="orange"
                            type="primaryWithColor"
                            action={() => setOpenRecommendedstrategy(true)}
                            // action={() => setUpdateStrategy(true)}
                        />
                    </div>
                    {/* ) : ( */}
                    {/* strategyEditor */}
                    {/* )} */}
                </div>
            </AlertDialog>
            <AlertDialog
                openDialog={openRecommendedstrategy}
                setOpenDialog={setOpenRecommendedstrategy}
                handleCreate={handleNewStratagy}
                noCancel
                actionText="Save">
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2 mb-4 text-gray-700 dark:text-white">
                    Recommended strategy
                </Heading>
                <div className="my-2 flex items-center gap-4 flex-wrap">
                    {recommendedStratagies ? (
                        <>
                            {recommendedStratagies?.map((risk: any) => (
                                <Button
                                    key={risk.id}
                                    onPress={() => {
                                        setRecommendedstrategy(risk)
                                        handleSetCurrentStrategies(risk)
                                        setCurrentRisk({
                                            ...currentRisk,
                                            mitigationStrategy: risk,
                                        })
                                        setUpdateStrategy(false)
                                    }}
                                    className={`${currentStrategies?.find((s: any) => s.id === risk.id) ? 'border-orange-400 bg-orange-50' : 'border-gray-400 bg-gray-50'} border p-4 rounded-lg cursor-pointer`}>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: risk?.strategy,
                                        }}></div>
                                </Button>
                            ))}
                            <Heading className="text-lg font-normal leading-6 text-gray-700 dark:text-white">
                                or add new Mitigation strategy
                            </Heading>
                        </>
                    ) : (
                        <>
                            <div>No recommendations available!</div>
                            <Heading className="text-lg font-normal leading-6 mb-4 text-gray-700 dark:text-white">
                                Create a new strategy instead
                            </Heading>
                        </>
                    )}
                </div>
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
            <AlertDialog
                openDialog={openDeleteConfirmation}
                setOpenDialog={setOpenDeleteConfirmation}
                handleCreate={handleDeleteRisk}
                actionText="Delete">
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2 mb-4 text-gray-700 dark:text-white">
                    Delete risk analysis!
                </Heading>
            </AlertDialog>
            <Toaster position="top-right" />
        </div>
    )
}
