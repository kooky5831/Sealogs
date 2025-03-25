'use client'
import {
    AlertDialog,
    PopoverWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import Slider from '@mui/material/Slider'
import Creatable from 'react-select/creatable'
import React, { useEffect, useState } from 'react'
import {
    Button,
    DialogTrigger,
    Heading,
    ListBox,
    ListBoxItem,
    Popover,
} from 'react-aria-components'
import {
    UpdateTowingChecklist,
    CreateTowingChecklist,
    UpdateEventType_Tasking,
    CreateMitigationStrategy,
    CreateRiskFactor,
    UpdateRiskFactor,
} from '@/app/lib/graphQL/mutation'
import {
    TowingChecklist,
    GetRiskFactors,
    CrewMembers_LogBookEntrySection,
} from '@/app/lib/graphQL/query'
import Select from 'react-select'
import { useLazyQuery, useMutation } from '@apollo/client'
import toast, { Toaster } from 'react-hot-toast'
import { classes } from '@/app/components/GlobalClasses'
import { TrashIcon } from '@heroicons/react/24/outline'
import Editor from '../../editor'
import { useSearchParams } from 'next/navigation'
import { getLogBookEntryByID } from '@/app/lib/actions'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import LogBookEntryModel from '@/app/offline/models/logBookEntry'
import TowingChecklistModel from '@/app/offline/models/towingChecklist'
import RiskFactorModel from '@/app/offline/models/riskFactor'
import CrewMembers_LogBookEntrySectionModel from '@/app/offline/models/crewMembers_LogBookEntrySection'
import EventType_TaskingModel from '@/app/offline/models/eventType_Tasking'
import MitigationStrategyModel from '@/app/offline/models/mitigationStrategy'
import { generateUniqueId } from '@/app/offline/helpers/functions'

export default function RiskAnalysis({
    selectedEvent = false,
    onSidebarClose,
    logBookConfig,
    currentTrip,
    crewMembers = false,
    towingChecklistID = 0,
    logentryID = 0,
    setTowingChecklistID,
    offline = false,
    // editTaskingRisk = false,
}: {
    selectedEvent: any
    onSidebarClose: any
    logBookConfig: any
    currentTrip: any
    crewMembers: any
    towingChecklistID: number
    logentryID: number
    setTowingChecklistID: any
    offline?: boolean
    // editTaskingRisk?: boolean
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

    const [permissions, setPermissions] = useState<any>(false)
    const [edit_risks, setEdit_risks] = useState<any>(false)
    const [delete_risks, setDelete_risks] = useState<any>(false)
    const [editTaskingRisk, setEditTaskingRisk] = useState<any>(false)

    const logBookEntryModel = new LogBookEntryModel()
    const towingChecklistModel = new TowingChecklistModel()
    const riskFactorModel = new RiskFactorModel()
    const crewMemberModel = new CrewMembers_LogBookEntrySectionModel()
    const taskingModel = new EventType_TaskingModel()
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
                setEditTaskingRisk(true)
            } else {
                setEditTaskingRisk(false)
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
                    // getSectionCrewMembers_LogBookEntrySection
                    let data = await crewMemberModel.getByIds(sectionIDs)
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

    const handleTaskingRiskFieldChange =
        (field: string) => async (check: Boolean) => {
            if (!editTaskingRisk || !edit_risks) {
                toast.error('You do not have permission to edit this section')
                return
            }
            setRiskBuffer({
                ...riskBuffer,
                [field]: check ? 'on' : 'off',
            })
            if (+riskAnalysis?.id > 0) {
                if (offline) {
                    // updateTowingChecklist
                    const data = await towingChecklistModel.save({
                        id: riskAnalysis.id,
                        [field]: check ? true : false,
                    })
                    // getRiskAnalysis
                    const towingChecklistData =
                        await towingChecklistModel.getById(data.id)
                    setRiskAnalysis(towingChecklistData)
                } else {
                    updateTowingChecklist({
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

    const [updateTowingChecklist] = useMutation(UpdateTowingChecklist, {
        onCompleted: (data) => {
            getRiskAnalysis({
                variables: {
                    id: data.updateTowingChecklist.id,
                },
            })
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const fields = [
        {
            name: 'ConductSAP',
            label: 'Conduct SAP',
            value: 'conductSAP',
            checked: riskBuffer?.conductSAP
                ? riskBuffer.conductSAP === 'on'
                : riskAnalysis?.conductSAP,
            handleChange: handleTaskingRiskFieldChange('conductSAP'),
            description: (
                <small>
                    <div>Conduct SAP prior to approaching the vessel.</div>
                    <div>
                        Check for fittings on the vessel that could damage the
                        CRV when coming alongside.
                    </div>
                </small>
            ),
        },
        {
            name: 'InvestigateNatureOfIssue',
            label: 'Investigate nature of the issue',
            value: 'investigateNatureOfIssue',
            checked: riskBuffer?.investigateNatureOfIssue
                ? riskBuffer.investigateNatureOfIssue === 'on'
                : riskAnalysis?.investigateNatureOfIssue,
            handleChange: handleTaskingRiskFieldChange(
                'investigateNatureOfIssue',
            ),
            description: (
                <small>
                    <div>
                        Ascertain the nature of the problem, any damage, or
                        taking on water.
                    </div>
                    <div>
                        Does a crew member need to go on board the other vessel
                        to assist?
                    </div>
                </small>
            ),
        },
        {
            name: 'EveryoneOnBoardOk',
            label: 'Everyone on board ok?',
            value: 'everyoneOnBoardOk',
            checked: riskBuffer?.everyoneOnBoardOk
                ? riskBuffer.everyoneOnBoardOk === 'on'
                : riskAnalysis?.everyoneOnBoardOk,
            handleChange: handleTaskingRiskFieldChange('everyoneOnBoardOk'),
            description: (
                <small>
                    <div>
                        {' '}
                        Check how many people are aboard, ensure everyone is
                        accounted for.
                    </div>
                    <div>
                        Check for injuries or medical assistance required.
                    </div>
                </small>
            ),
        },
        {
            name: 'RudderToMidshipsAndTrimmed',
            label: 'Rudder to midships and trimmed appropriately',
            value: 'rudderToMidshipsAndTrimmed',
            checked: riskBuffer?.rudderToMidshipsAndTrimmed
                ? riskBuffer.rudderToMidshipsAndTrimmed === 'on'
                : riskAnalysis?.rudderToMidshipsAndTrimmed,
            handleChange: handleTaskingRiskFieldChange(
                'rudderToMidshipsAndTrimmed',
            ),
            description: (
                <small>
                    <div>
                        Check steering isn’t impaired in any way and have the
                        rudder secured amidships or have the vessel steer for
                        the stern of CRV.
                    </div>
                    <div>Check the vessel is optimally trimmed for towing.</div>
                </small>
            ),
        },
        {
            name: 'LifejacketsOn',
            label: 'Lifejackets on',
            value: 'lifejacketsOn',
            checked: riskBuffer?.lifejacketsOn
                ? riskBuffer.lifejacketsOn === 'on'
                : riskAnalysis?.lifejacketsOn,
            handleChange: handleTaskingRiskFieldChange('lifejacketsOn'),
            description: (
                <small>
                    <div>Request that everyone wears a lifejacket.</div>
                </small>
            ),
        },
        {
            name: 'CommunicationsEstablished',
            label: 'Communications Established',
            value: 'communicationsEstablished',
            checked: riskBuffer?.communicationsEstablished
                ? riskBuffer.communicationsEstablished === 'on'
                : riskAnalysis?.communicationsEstablished,
            handleChange: handleTaskingRiskFieldChange(
                'communicationsEstablished',
            ),
            description: (
                <small>
                    <div>
                        Ensure that communications have been established and
                        checked prior to beginning the tow, i.e., VHF, hand
                        signals, and/or light signals if the tow is to be
                        conducted at night.
                    </div>
                    <div>
                        Ensure there is agreement on where to tow the vessel to.
                    </div>
                </small>
            ),
        },
        {
            name: 'SecureAndSafeTowing',
            label: 'Secure and safe towing',
            value: 'secureAndSafeTowing',
            checked: riskBuffer?.secureAndSafeTowing
                ? riskBuffer.secureAndSafeTowing === 'on'
                : riskAnalysis?.secureAndSafeTowing,
            handleChange: handleTaskingRiskFieldChange('secureAndSafeTowing'),
            description: (
                <small>
                    <div>Towline securely attached</div>
                    <div>Ensure everything on board is stowed and secure.</div>
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
                    </div>
                </small>
            ),
        },
    ]
    const createOfflineTowingChecklist = async () => {
        // createTowingChecklist
        const data = await towingChecklistModel.save({ id: generateUniqueId() })
        setTowingChecklistID(+data.id)
        // updateEvent
        await taskingModel.save({
            id:
                towingChecklistID > 0
                    ? towingChecklistID
                    : selectedEvent?.eventType_Tasking?.id,
            towingChecklistID: +data.id,
        })
        // getRiskAnalysis
        const towingChecklistData = await towingChecklistModel.getById(data.id)
        setRiskAnalysis(towingChecklistData)
    }
    const offlineGetRiskAnalysis = async () => {
        // getRiskAnalysis
        const data = await towingChecklistModel.getById(
            towingChecklistID > 0
                ? towingChecklistID
                : selectedEvent?.eventType_Tasking?.towingChecklist?.id,
        )
        setRiskAnalysis(data)
    }
    useEffect(() => {
        if (selectedEvent || towingChecklistID > 0) {
            if (
                selectedEvent?.eventType_Tasking?.towingChecklist?.id > 0 ||
                towingChecklistID > 0
            ) {
                if (offline) {
                    offlineGetRiskAnalysis()
                } else {
                    getRiskAnalysis({
                        variables: {
                            id:
                                towingChecklistID > 0
                                    ? towingChecklistID
                                    : selectedEvent?.eventType_Tasking
                                          ?.towingChecklist?.id,
                        },
                    })
                }
            } else {
                if (offline) {
                    createOfflineTowingChecklist()
                } else {
                    createTowingChecklist({
                        variables: {
                            input: {},
                        },
                    })
                }
            }
        }
    }, [selectedEvent, towingChecklistID])

    const offlineMount = async () => {
        // getRiskFactors
        const data = await riskFactorModel.getByFieldID(
            'type',
            'TowingChecklist',
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
                    filter: { type: { eq: 'TowingChecklist' } },
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

    const [getRiskAnalysis] = useLazyQuery(TowingChecklist, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            setRiskAnalysis(data.readOneTowingChecklist)
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const [createTowingChecklist] = useMutation(CreateTowingChecklist, {
        onCompleted: (data) => {
            setTowingChecklistID(+data.createTowingChecklist.id)
            updateEvent({
                variables: {
                    input: {
                        id:
                            towingChecklistID > 0
                                ? towingChecklistID
                                : selectedEvent?.eventType_Tasking?.id,
                        towingChecklistID: +data.createTowingChecklist.id,
                    },
                },
            })
            getRiskAnalysis({
                variables: {
                    id: data.createTowingChecklist.id,
                },
            })
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const [updateEvent] = useMutation(UpdateEventType_Tasking, {
        onCompleted: (data) => {},
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const updateRiskAnalysisMember = async (memberID: number) => {
        if (!editTaskingRisk || !edit_risks) {
            toast.error('You do not have permission to edit this section')
            return
        }
        if (offline) {
            // updateTowingChecklist
            const data = await towingChecklistModel.save({
                id: riskAnalysis.id,
                memberID: memberID,
            })
            // getRiskAnalysis
            const towingChecklistData = await towingChecklistModel.getById(
                data.id,
            )
            setRiskAnalysis(towingChecklistData)
        } else {
            updateTowingChecklist({
                variables: {
                    input: {
                        id: riskAnalysis.id,
                        memberID: memberID,
                    },
                },
            })
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
                // updateRiskFactor
                await riskFactorModel.save({
                    id: currentRisk.id,
                    type: 'TowingChecklist',
                    title: currentRisk.title,
                    impact: currentRisk?.impact ? currentRisk?.impact : 'Low',
                    probability: currentRisk?.probability
                        ? currentRisk?.probability
                        : 5,
                    mitigationStrategy:
                        currentStrategies.length > 0
                            ? currentStrategies.map((s: any) => s.id).join(',')
                            : '',
                    towingChecklistID: riskAnalysis?.id,
                })
                setOpenRiskDialog(false)
                // getRiskFactors
                const data = await riskFactorModel.getByFieldID(
                    'type',
                    'TowingChecklist',
                )
                const risks = Array.from(
                    new Set(data.map((risk: any) => risk.title)),
                )?.map((risk: any) => ({ label: risk, value: risk }))
                setAllRisks(risks)
                setAllRiskFactors(data)
                // getRiskAnalysis
                const towingChecklistData = await towingChecklistModel.getById(
                    towingChecklistID > 0
                        ? towingChecklistID
                        : selectedEvent?.eventType_Tasking?.towingChecklist?.id,
                )
                setRiskAnalysis(towingChecklistData)
            } else {
                updateRiskFactor({
                    variables: {
                        input: {
                            id: currentRisk.id,
                            type: 'TowingChecklist',
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
                            towingChecklistID: riskAnalysis?.id,
                        },
                    },
                })
            }
        } else {
            if (offline) {
                // createRiskFactor
                await riskFactorModel.save({
                    id: generateUniqueId(),
                    type: 'TowingChecklist',
                    title: currentRisk.title,
                    impact: currentRisk?.impact ? currentRisk?.impact : 'Low',
                    probability: currentRisk?.probability
                        ? currentRisk?.probability
                        : 5,
                    mitigationStrategy:
                        currentStrategies.length > 0
                            ? currentStrategies.map((s: any) => s.id).join(',')
                            : '',
                    towingChecklistID: riskAnalysis?.id,
                    vesselID: vesselID,
                })
                toast.dismiss()
                toast.success('Risk created')
                setOpenRiskDialog(false)
                // getRiskFactors
                const data = await riskFactorModel.getByFieldID(
                    'type',
                    'TowingChecklist',
                )
                const risks = Array.from(
                    new Set(data.map((risk: any) => risk.title)),
                )?.map((risk: any) => ({ label: risk, value: risk }))
                setAllRisks(risks)
                setAllRiskFactors(data)
                // getRiskAnalysis
                const towingChecklistData = await towingChecklistModel.getById(
                    towingChecklistID > 0
                        ? towingChecklistID
                        : selectedEvent?.eventType_Tasking?.towingChecklist?.id,
                )
                setRiskAnalysis(towingChecklistData)
            } else {
                createRiskFactor({
                    variables: {
                        input: {
                            type: 'TowingChecklist',
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
                            towingChecklistID: riskAnalysis?.id,
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
                    filter: { type: { eq: 'TowingChecklist' } },
                },
            })
            getRiskAnalysis({
                variables: {
                    id:
                        towingChecklistID > 0
                            ? towingChecklistID
                            : selectedEvent?.eventType_Tasking?.towingChecklist
                                  ?.id,
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
                    filter: { type: { eq: 'TowingChecklist' } },
                },
            })
            getRiskAnalysis({
                variables: {
                    id:
                        towingChecklistID > 0
                            ? towingChecklistID
                            : selectedEvent?.eventType_Tasking?.towingChecklist
                                  ?.id,
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
            // updateRiskFactor
            await riskFactorModel.save({
                id: riskToDelete.id,
                towingChecklistID: 0,
                vesselID: 0,
            })
            setOpenRiskDialog(false)
            // getRiskFactors
            const data = await riskFactorModel.getByFieldID(
                'type',
                'TowingChecklist',
            )
            const risks = Array.from(
                new Set(data.map((risk: any) => risk.title)),
            )?.map((risk: any) => ({ label: risk, value: risk }))
            setAllRisks(risks)
            setAllRiskFactors(data)
            // getRiskAnalysis
            const towingChecklistData = await towingChecklistModel.getById(
                towingChecklistID > 0
                    ? towingChecklistID
                    : selectedEvent?.eventType_Tasking?.towingChecklist?.id,
            )
            setRiskAnalysis(towingChecklistData)
        } else {
            updateRiskFactor({
                variables: {
                    input: {
                        id: riskToDelete.id,
                        towingChecklistID: 0,
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
                // createMitigationStrategy
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
    const offlineGetLogBookEntryByID = async () => {
        // getLogBookEntryByID(+logentryID, handleSetLogbook)
        const logbook = await logBookEntryModel.getById(logentryID)
        handleSetLogbook(logbook)
    }
    useEffect(() => {
        if (offline) {
            offlineGetLogBookEntryByID()
        }
    }, [offline])
    return (
        <div className={`${towingChecklistID > 0 ? 'px-4' : 'px-0 md:pl-4'}`}>
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
                                    <SeaLogsButton
                                        icon="alert"
                                        className="w-6 h-6 sup -mt-2 ml-0.5"
                                    />
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
                    className={`${towingChecklistID > 0 ? 'mt-4' : ''} bg-orange-50 dark:bg-orange-300 border-orange-300 dark:border-orange-800 border rounded-lg p-4`}>
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
                                                        !editTaskingRisk ||
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
                                                    <SeaLogsButton
                                                        icon="alert"
                                                        className="w-6 h-6 sup -mt-2 ml-0.5"
                                                    />
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
                                                            !editTaskingRisk ||
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
                                if (!editTaskingRisk || !edit_risks) {
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
