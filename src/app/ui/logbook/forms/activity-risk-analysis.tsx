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
    UpdateDangerousGoodsChecklist,
    CreateMitigationStrategy,
    UpdateMitigationStrategy,
    CreateRiskFactor,
    UpdateRiskFactor,
} from '@/app/lib/graphQL/mutation'
import {
    GetOneDangerousGoodsChecklist,
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
import LogBookEntryModel from '@/app/offline/models/logBookEntry'
import DangerousGoodsChecklistModel from '@/app/offline/models/dangerousGoodsChecklist'
import RiskFactorModel from '@/app/offline/models/riskFactor'
import CrewMembers_LogBookEntrySectionModel from '@/app/offline/models/crewMembers_LogBookEntrySection'
import MitigationStrategyModel from '@/app/offline/models/mitigationStrategy'
import { generateUniqueId } from '@/app/offline/helpers/functions'

export default function ActivityRiskAnalysis({
    onSidebarClose,
    logBookConfig,
    currentTrip,
    crewMembers = false,
    openRiskAnalysis,
    editDGR = false,
    offline = false,
}: {
    onSidebarClose?: any
    logBookConfig?: any
    currentTrip?: any
    crewMembers?: any
    openRiskAnalysis: any
    editDGR?: boolean
    offline?: boolean
}) {
    const searchParams = useSearchParams()
    const vesselID = searchParams.get('vesselID') ?? 0
    const logentryID = searchParams.get('logentryID') ?? 0
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

    const logBookEntryModel = new LogBookEntryModel()
    const dangerousGoodsChecklistModel = new DangerousGoodsChecklistModel()
    const riskFactorModel = new RiskFactorModel()
    const crewMemberModel = new CrewMembers_LogBookEntrySectionModel()
    const mitigationStrategyModel = new MitigationStrategyModel()

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

    if (+logentryID > 0 && !offline) {
        getLogBookEntryByID(+logentryID, handleSetLogbook)
    }
    const offlineUseEffect = async () => {
        // getLogBookEntryByID(+logentryID, handleSetLogbook)
        const logbook = await logBookEntryModel.getById(+logentryID)
        handleSetLogbook(logbook)
    }
    useEffect(() => {
        if (offline) {
            offlineUseEffect()
        }
    }, [offline])
    useEffect(() => {
        if (crewMembers) {
            setMembers(crewMembers)
        }
    }, [crewMembers])

    const [updateDangerousGoodsChecklist] = useMutation(
        UpdateDangerousGoodsChecklist,
        {
            onCompleted: (data) => {},
            onError: (error) => {
                console.error('onError', error)
            },
        },
    )

    const handleDgrFieldChange = (field: string) => async (check: Boolean) => {
        if (!editDGR) {
            toast.error('You do not have permission to edit this section')
            return
        }
        setRiskBuffer({
            ...riskBuffer,
            [field]: check ? 'on' : 'off',
        })
        if (+currentTrip.dangerousGoodsChecklist.id > 0) {
            if (offline) {
                // updateDangerousGoodsChecklist
                await dangerousGoodsChecklistModel.save({
                    id: currentTrip.dangerousGoodsChecklist.id,
                    [field]: check ? true : false,
                })
            } else {
                updateDangerousGoodsChecklist({
                    variables: {
                        input: {
                            id: currentTrip.dangerousGoodsChecklist.id,
                            [field]: check ? true : false,
                        },
                    },
                })
            }
        }
    }

    const checkFieldVal = (field: string) => {
        if (riskBuffer) {
            return riskBuffer[field] === 'on'
        }
        return riskAnalysis?.[field]
    }

    const checkFields = [
        {
            name: 'VesselSecuredToWharf',
            label: 'Vessel secured to wharf',
            value: 'vesselSecuredToWharf',
            checked: checkFieldVal('vesselSecuredToWharf'),
            handleChange: handleDgrFieldChange('vesselSecuredToWharf'),
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
            name: 'BravoFlagRaised',
            label: 'Bravo flag raised',
            value: 'bravoFlagRaised',
            checked: riskBuffer?.bravoFlagRaised
                ? riskBuffer.bravoFlagRaised === 'on'
                : riskAnalysis?.bravoFlagRaised,
            handleChange: handleDgrFieldChange('bravoFlagRaised'),
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
            name: 'TwoCrewLoadingVessel',
            label: 'Two crew loading vessel',
            value: 'twoCrewLoadingVessel',
            checked: riskBuffer?.twoCrewLoadingVessel
                ? riskBuffer.twoCrewLoadingVessel === 'on'
                : riskAnalysis?.twoCrewLoadingVessel,
            handleChange: handleDgrFieldChange('twoCrewLoadingVessel'),
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
            name: 'FireHosesRiggedAndReady',
            label: 'Fire hoses rigged and ready',
            value: 'fireHosesRiggedAndReady',
            checked: riskBuffer?.fireHosesRiggedAndReady
                ? riskBuffer.fireHosesRiggedAndReady === 'on'
                : riskAnalysis?.fireHosesRiggedAndReady,
            handleChange: handleDgrFieldChange('fireHosesRiggedAndReady'),
            /*description: (
                <small>
                    <div>
                        Check steering isn’t impaired in any way and have the
                        rudder secured amidships or have the vessel steer for
                        the stern of CRV.
                    </div>
                    <div>Check the vessel is optimally trimmed for towing.</div>
                </small>
            ),*/
        },
        {
            name: 'NoSmokingSignagePosted',
            label: 'No smoking signage posted',
            value: 'noSmokingSignagePosted',
            checked: riskBuffer?.noSmokingSignagePosted
                ? riskBuffer.noSmokingSignagePosted === 'on'
                : riskAnalysis?.noSmokingSignagePosted,
            handleChange: handleDgrFieldChange('noSmokingSignagePosted'),
            description: (
                <small>
                    <div>Request that everyone wears a lifejacket.</div>
                </small>
            ),
        },
        {
            name: 'SpillKitAvailable',
            label: 'Spill kit available',
            value: 'spillKitAvailable',
            checked: riskBuffer?.spillKitAvailable
                ? riskBuffer.spillKitAvailable === 'on'
                : riskAnalysis?.spillKitAvailable,
            handleChange: handleDgrFieldChange('spillKitAvailable'),
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
            name: 'FireExtinguishersAvailable',
            label: 'Fire extinguishers available',
            value: 'fireExtinguishersAvailable',
            checked: riskBuffer?.fireExtinguishersAvailable
                ? riskBuffer.fireExtinguishersAvailable === 'on'
                : riskAnalysis?.fireExtinguishersAvailable,
            handleChange: handleDgrFieldChange('fireExtinguishersAvailable'),
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
        {
            name: 'DGDeclarationReceived',
            label: 'DG declaration received',
            value: 'dgDeclarationReceived',
            checked: riskBuffer?.dgDeclarationReceived
                ? riskBuffer.dgDeclarationReceived === 'on'
                : riskAnalysis?.dgDeclarationReceived,
            handleChange: handleDgrFieldChange('dgDeclarationReceived'),
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
            name: 'LoadPlanReceived',
            label: 'Load plan received',
            value: 'loadPlanReceived',
            checked: riskBuffer?.loadPlanReceived
                ? riskBuffer.loadPlanReceived === 'on'
                : riskAnalysis?.loadPlanReceived,
            handleChange: handleDgrFieldChange('loadPlanReceived'),
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
            name: 'MSDSAvailable',
            label: 'MSDS available for all dangerous goods carried',
            value: 'msdsAvailable',
            checked: riskBuffer?.msdsAvailable
                ? riskBuffer.msdsAvailable === 'on'
                : riskAnalysis?.msdsAvailable,
            handleChange: handleDgrFieldChange('msdsAvailable'),
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
            name: 'AnyVehiclesSecureToVehicleDeck',
            label: 'Any vehicles secure to vehicle deck',
            value: 'anyVehiclesSecureToVehicleDeck',
            checked: riskBuffer?.anyVehiclesSecureToVehicleDeck
                ? riskBuffer.anyVehiclesSecureToVehicleDeck === 'on'
                : riskAnalysis?.anyVehiclesSecureToVehicleDeck,
            handleChange: handleDgrFieldChange(
                'anyVehiclesSecureToVehicleDeck',
            ),
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
            name: 'SafetyAnnouncement',
            label: 'Safety announcement includes reference to dangerous goods & no smoking',
            value: 'safetyAnnouncement',
            checked: riskBuffer?.safetyAnnouncement
                ? riskBuffer.safetyAnnouncement === 'on'
                : riskAnalysis?.safetyAnnouncement,
            handleChange: handleDgrFieldChange('safetyAnnouncement'),
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
            name: 'VehicleStationaryAndSecure',
            label: 'Vehicle stationary and secure prior to vehicle departing vessel',
            value: 'vehicleStationaryAndSecure',
            checked: riskBuffer?.vehicleStationaryAndSecure
                ? riskBuffer.vehicleStationaryAndSecure === 'on'
                : riskAnalysis?.vehicleStationaryAndSecure,
            handleChange: handleDgrFieldChange('vehicleStationaryAndSecure'),
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
    ]

    const offlineMount = async () => {
        // getRiskFactors
        const data = await riskFactorModel.getByFieldID(
            'type',
            'DangerousGoods',
        )
        const risks = Array.from(
            new Set(data?.map((risk: any) => risk.title)),
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
                    filter: { type: { eq: 'DangerousGoods' } },
                },
            })
        }
    }, [])

    const offlineOpenRiskAnalysis = async () => {
        // getRiskAnalysis
        const data = await dangerousGoodsChecklistModel.getById(
            currentTrip.dangerousGoodsChecklist.id,
        )
        setRiskAnalysis(data)
        if (!riskBuffer) {
            setRiskBuffer({
                vesselSecuredToWharf:
                    data?.vesselSecuredToWharf == true ? 'on' : 'off',
                bravoFlagRaised: data?.bravoFlagRaised == true ? 'on' : 'off',
                twoCrewLoadingVessel:
                    data?.twoCrewLoadingVessel == true ? 'on' : 'off',
                fireHosesRiggedAndReady:
                    data?.fireHosesRiggedAndReady == true ? 'on' : 'off',
                noSmokingSignagePosted:
                    data?.noSmokingSignagePosted == true ? 'on' : 'off',
                spillKitAvailable:
                    data?.spillKitAvailable == true ? 'on' : 'off',
                fireExtinguishersAvailable:
                    data?.fireExtinguishersAvailable == true ? 'on' : 'off',
                dgDeclarationReceived:
                    data?.dgDeclarationReceived == true ? 'on' : 'off',
                loadPlanReceived: data?.loadPlanReceived == true ? 'on' : 'off',
                msdsAvailable: data?.msdsAvailable == true ? 'on' : 'off',
                anyVehiclesSecureToVehicleDeck:
                    data?.anyVehiclesSecureToVehicleDeck == true ? 'on' : 'off',
                safetyAnnouncement:
                    data?.safetyAnnouncement == true ? 'on' : 'off',
                vehicleStationaryAndSecure:
                    data?.vehicleStationaryAndSecure == true ? 'on' : 'off',
                memberID: data.member.id,
            })
        }
    }
    useEffect(() => {
        if (openRiskAnalysis) {
            if (offline) {
                offlineOpenRiskAnalysis()
            } else {
                getRiskAnalysis({
                    variables: {
                        id: currentTrip.dangerousGoodsChecklist.id,
                    },
                })
            }
        }
    }, [openRiskAnalysis])

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

    const [getRiskAnalysis] = useLazyQuery(GetOneDangerousGoodsChecklist, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            setRiskAnalysis(data.readOneDangerousGoodsChecklist)
            if (!riskBuffer) {
                setRiskBuffer({
                    vesselSecuredToWharf:
                        data.readOneDangerousGoodsChecklist
                            ?.vesselSecuredToWharf == true
                            ? 'on'
                            : 'off',
                    bravoFlagRaised:
                        data.readOneDangerousGoodsChecklist?.bravoFlagRaised ==
                        true
                            ? 'on'
                            : 'off',
                    twoCrewLoadingVessel:
                        data.readOneDangerousGoodsChecklist
                            ?.twoCrewLoadingVessel == true
                            ? 'on'
                            : 'off',
                    fireHosesRiggedAndReady:
                        data.readOneDangerousGoodsChecklist
                            ?.fireHosesRiggedAndReady == true
                            ? 'on'
                            : 'off',
                    noSmokingSignagePosted:
                        data.readOneDangerousGoodsChecklist
                            ?.noSmokingSignagePosted == true
                            ? 'on'
                            : 'off',
                    spillKitAvailable:
                        data.readOneDangerousGoodsChecklist
                            ?.spillKitAvailable == true
                            ? 'on'
                            : 'off',
                    fireExtinguishersAvailable:
                        data.readOneDangerousGoodsChecklist
                            ?.fireExtinguishersAvailable == true
                            ? 'on'
                            : 'off',
                    dgDeclarationReceived:
                        data.readOneDangerousGoodsChecklist
                            ?.dgDeclarationReceived == true
                            ? 'on'
                            : 'off',
                    loadPlanReceived:
                        data.readOneDangerousGoodsChecklist?.loadPlanReceived ==
                        true
                            ? 'on'
                            : 'off',
                    msdsAvailable:
                        data.readOneDangerousGoodsChecklist?.msdsAvailable ==
                        true
                            ? 'on'
                            : 'off',
                    anyVehiclesSecureToVehicleDeck:
                        data.readOneDangerousGoodsChecklist
                            ?.anyVehiclesSecureToVehicleDeck == true
                            ? 'on'
                            : 'off',
                    safetyAnnouncement:
                        data.readOneDangerousGoodsChecklist
                            ?.safetyAnnouncement == true
                            ? 'on'
                            : 'off',
                    vehicleStationaryAndSecure:
                        data.readOneDangerousGoodsChecklist
                            ?.vehicleStationaryAndSecure == true
                            ? 'on'
                            : 'off',
                    memberID: data.readOneDangerousGoodsChecklist.member.id,
                })
            }
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const updateRiskAnalysisMember = async (memberID: number) => {
        if (!editDGR) {
            toast.error('You do not have permission to edit this section')
            return
        }
        setRiskBuffer({
            ...riskBuffer,
            memberID: memberID,
        })
        if (+currentTrip.dangerousGoodsChecklist.id > 0) {
            if (offline) {
                // updateDangerousGoodsChecklist
                await dangerousGoodsChecklistModel.save({
                    id: currentTrip.dangerousGoodsChecklist.id,
                    memberID: memberID,
                })
            } else {
                updateDangerousGoodsChecklist({
                    variables: {
                        input: {
                            id: currentTrip.dangerousGoodsChecklist.id,
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
                // updateRiskFactor
                await riskFactorModel.save({
                    id: currentRisk.id,
                    type: 'DangerousGoods',
                    title: currentRisk.title,
                    impact: currentRisk?.impact ? currentRisk?.impact : 'Low',
                    probability: currentRisk?.probability
                        ? currentRisk?.probability
                        : 5,
                    mitigationStrategy:
                        currentStrategies.length > 0
                            ? currentStrategies.map((s: any) => s.id).join(',')
                            : '',
                    dangerousGoodsChecklistID:
                        currentTrip.dangerousGoodsChecklist.id,
                })
                setOpenRiskDialog(false)
            } else {
                updateRiskFactor({
                    variables: {
                        input: {
                            id: currentRisk.id,
                            type: 'DangerousGoods',
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
                            dangerousGoodsChecklistID:
                                currentTrip.dangerousGoodsChecklist.id,
                        },
                    },
                })
            }

            setAllRiskFactors(
                allRiskFactors.map((risk: any) => {
                    if (risk.id === currentRisk.id) {
                        return {
                            ...risk,
                            title: currentRisk.title,
                            impact: currentRisk.impact,
                            probability: currentRisk.probability,
                            mitigationStrategy: {
                                nodes: currentStrategies,
                            },
                        }
                    }
                    return risk
                }),
            )
            if (!allRisks.find((r: any) => r.value === currentRisk.title)) {
                setAllRisks([
                    ...allRisks,
                    { value: currentRisk.title, label: currentRisk.title },
                ])
            }
            setRiskAnalysis({
                ...riskAnalysis,
                riskFactors: {
                    nodes: riskAnalysis.riskFactors.nodes.map((risk: any) => {
                        if (risk.id === currentRisk.id) {
                            return {
                                ...risk,
                                title: currentRisk.title,
                                impact: currentRisk.impact,
                                probability: currentRisk.probability,
                                mitigationStrategy: {
                                    nodes: currentStrategies,
                                },
                            }
                        }
                        return risk
                    }),
                },
            })
            setRecommendedStratagies(
                Array.from(
                    new Set(
                        allRiskFactors
                            ?.filter(
                                (r: any) =>
                                    r.title === currentRisk.title &&
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
            if (offline) {
                // createRiskFactor
                const data = await riskFactorModel.save({
                    id: generateUniqueId(),
                    type: 'DangerousGoods',
                    title: currentRisk.title,
                    impact: currentRisk?.impact ? currentRisk?.impact : 'Low',
                    probability: currentRisk?.probability
                        ? currentRisk?.probability
                        : 5,
                    mitigationStrategy:
                        currentStrategies.length > 0
                            ? currentStrategies.map((s: any) => s.id).join(',')
                            : '',
                    dangerousGoodsChecklistID:
                        currentTrip.dangerousGoodsChecklist.id,
                    vesselID: vesselID,
                })
                toast.dismiss()
                toast.success('Risk created')
                setOpenRiskDialog(false)
                setAllRiskFactors([
                    ...allRiskFactors,
                    {
                        id: data.id,
                        title: currentRisk.title,
                        impact: currentRisk.impact,
                        probability: currentRisk.probability,
                        mitigationStrategy: {
                            nodes: currentStrategies,
                        },
                    },
                ])
                if (!allRisks.find((r: any) => r.value === currentRisk.title)) {
                    setAllRisks([
                        ...allRisks,
                        { value: currentRisk.title, label: currentRisk.title },
                    ])
                }
                setRiskAnalysis({
                    ...riskAnalysis,
                    riskFactors: {
                        nodes: [
                            ...riskAnalysis.riskFactors.nodes,
                            {
                                id: data.id,
                                title: currentRisk.title,
                                impact: currentRisk.impact,
                                probability: currentRisk.probability,
                                mitigationStrategy: {
                                    nodes: currentStrategies,
                                },
                            },
                        ],
                    },
                })
                setRecommendedStratagies(
                    Array.from(
                        new Set(
                            allRiskFactors
                                ?.filter(
                                    (r: any) =>
                                        r.title === currentRisk.title &&
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
                createRiskFactor({
                    variables: {
                        input: {
                            type: 'DangerousGoods',
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
                            dangerousGoodsChecklistID:
                                currentTrip.dangerousGoodsChecklist.id,
                            vesselID: vesselID,
                        },
                    },
                })
            }
        }

        if (currentRisk?.mitigationStrategy?.id > 0) {
            if (offline) {
                // updateMitigationStrategy
                await mitigationStrategyModel.save({
                    id: currentRisk.mitigationStrategy.id,
                    strategy: content,
                })
            } else {
                updateMitigationStrategy({
                    variables: {
                        input: {
                            id: currentRisk.mitigationStrategy.id,
                            strategy: content,
                        },
                    },
                })
            }
        } else {
            if (content) {
                if (offline) {
                    // createMitigationStrategy
                    const data = await mitigationStrategyModel.save({
                        id: generateUniqueId(),
                        strategy: content,
                    })
                    setCurrentStrategies([
                        ...currentStrategies,
                        {
                            id: data.id,
                            strategy: content,
                        },
                    ])
                    setContent('')
                    setCurrentRisk({
                        ...currentRisk,
                        mitigationStrategy: data.id,
                    })
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
        }
    }

    const [createMitigationStrategy] = useMutation(CreateMitigationStrategy, {
        onCompleted: (data) => {
            setCurrentStrategies([
                ...currentStrategies,
                { id: data.createMitigationStrategy.id, strategy: content },
            ])
            setContent('')
            setCurrentRisk({
                ...currentRisk,
                mitigationStrategy: data.createMitigationStrategy.id,
            })
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const [updateMitigationStrategy] = useMutation(UpdateMitigationStrategy, {
        onCompleted: (data) => {},
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const [createRiskFactor] = useMutation(CreateRiskFactor, {
        onCompleted: (data) => {
            toast.dismiss()
            toast.success('Risk created')
            setOpenRiskDialog(false)
            setAllRiskFactors([
                ...allRiskFactors,
                {
                    id: data.createRiskFactor.id,
                    title: currentRisk.title,
                    impact: currentRisk.impact,
                    probability: currentRisk.probability,
                    mitigationStrategy: {
                        nodes: currentStrategies,
                    },
                },
            ])
            if (!allRisks.find((r: any) => r.value === currentRisk.title)) {
                setAllRisks([
                    ...allRisks,
                    { value: currentRisk.title, label: currentRisk.title },
                ])
            }
            setRiskAnalysis({
                ...riskAnalysis,
                riskFactors: {
                    nodes: [
                        ...riskAnalysis.riskFactors.nodes,
                        {
                            id: data.createRiskFactor.id,
                            title: currentRisk.title,
                            impact: currentRisk.impact,
                            probability: currentRisk.probability,
                            mitigationStrategy: {
                                nodes: currentStrategies,
                            },
                        },
                    ],
                },
            })
            setRecommendedStratagies(
                Array.from(
                    new Set(
                        allRiskFactors
                            ?.filter(
                                (r: any) =>
                                    r.title === currentRisk.title &&
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
        },
        onError: (error) => {
            console.error('onError', error)
        },
    })

    const [updateRiskFactor] = useMutation(UpdateRiskFactor, {
        onCompleted: (data) => {
            setOpenRiskDialog(false)
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
                vesselID: 0,
                dangerousGoodsChecklistID: 0,
            })
            setOpenRiskDialog(false)
        } else {
            updateRiskFactor({
                variables: {
                    input: {
                        id: riskToDelete.id,
                        vesselID: 0,
                        dangerousGoodsChecklistID: 0,
                    },
                },
            })
        }

        setRiskAnalysis({
            ...riskAnalysis,
            riskFactors: {
                nodes: riskAnalysis.riskFactors.nodes.filter(
                    (risk: any) => risk.id !== riskToDelete.id,
                ),
            },
        })
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
                setCurrentRisk({
                    ...currentRisk,
                    mitigationStrategy: data.id,
                })
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

    return (
        <div className="px-4">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="">
                    {checkFields.map((field: any, index: number) => (
                        <div
                            key={`${index}-${currentTrip.dangerousGoodsChecklist.id}`}
                            className="my-4 flex items-center">
                            <label
                                className="relative flex items-center pr-3 rounded-full cursor-pointer"
                                htmlFor={`${field.value}-onChangeComplete-${currentTrip.dangerousGoodsChecklist.id}`}
                                data-ripple="true"
                                data-ripple-color="dark"
                                data-ripple-dark="true">
                                <div className="md:w-8 md:h-8 w-6 h-6 flex-shrink-0">
                                    {checkFieldVal(field.value) ? (
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
                                    id={`${field.value}-onChangeComplete-${currentTrip.dangerousGoodsChecklist.id}`}
                                    type="checkbox"
                                    checked={checkFieldVal(field.value)}
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
                            </label>
                        </div>
                    ))}
                    <div className="flex items-center">
                        {members.length && riskAnalysis && (
                            <Select
                                id="author"
                                options={members}
                                menuPlacement="top"
                                placeholder="Author"
                                value={
                                    members?.find(
                                        (member: any) =>
                                            member.value ==
                                            riskBuffer?.memberID,
                                    )
                                        ? members?.find(
                                              (member: any) =>
                                                  member.value ==
                                                  riskBuffer?.memberID,
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
                    className={`mt-4 bg-orange-50 dark:bg-orange-300 border-orange-300 dark:border-orange-800 border rounded-lg p-4`}>
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
                                            key={`${risk.id}-currentTrip-dangerousGoodsChecklist`}
                                            textValue={risk.title}
                                            className="flex items-center justify-between mb-4 text-sm dark:placeholder-gray-400 dark:text-white">
                                            <label
                                                className="relative inline-flex items-center pr-3 rounded-full cursor-pointer"
                                                htmlFor={risk.id}
                                                data-ripple="true"
                                                data-ripple-color="dark"
                                                data-ripple-dark="true"
                                                onClick={() => {
                                                    if (!editDGR) {
                                                        toast.error(
                                                            'You do not have permission to edit this section',
                                                        )
                                                        return
                                                    }
                                                    handleSetRiskValue(risk)
                                                    setCurrentRisk(risk)
                                                    setOpenRiskDialog(true)
                                                    setCurrentStrategies(
                                                        risk?.mitigationStrategy
                                                            ?.nodes,
                                                    )
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
                                                        if (!editDGR) {
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
                                if (!editDGR) {
                                    toast.error(
                                        'You do not have permission to edit this section',
                                    )
                                    return
                                }
                                setCurrentRisk({})
                                setContent('')
                                setRiskValue(null)
                                setOpenRiskDialog(true)
                                setCurrentStrategies([])
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
                    <div className="flex gap-4 flex-col">
                        <Heading className="text-lg font-semibold leading-6 text-gray-700 dark:text-white">
                            Mitigation strategy
                        </Heading>
                        {/* {currentRisk?.mitigationStrategy?.nodes?.length > 0 &&
                            currentRisk?.mitigationStrategy?.nodes.map(
                                (s: any) => (
                                    <div key={s.id}>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: s.strategy,
                                            }}></div>
                                    </div>
                                ),
                            )} */}
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
                        />
                    </div>
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
                    {currentRisk?.mitigationStrategy?.nodes?.length > 0 && (
                        <>
                            {currentRisk.mitigationStrategy.nodes
                                .filter((s: any) => s.strategy != null)
                                .map((s: any) => (
                                    <Button
                                        key={s.id}
                                        onPress={() => {
                                            setRecommendedstrategy(s)
                                            setUpdateStrategy(true)
                                        }}
                                        className={`${currentStrategies?.find((strategy: any) => strategy.id === s.id) ? 'border-orange-400 bg-orange-50' : 'border-gray-400 bg-gray-50'} border p-4 rounded-lg cursor-pointer`}>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: s.strategy,
                                            }}></div>
                                    </Button>
                                ))}
                        </>
                    )}
                    {recommendedStratagies ? (
                        <>
                            {recommendedStratagies
                                ?.filter(
                                    (s: any) =>
                                        s.strategy &&
                                        !currentRisk?.mitigationStrategy?.nodes?.some(
                                            (node: any) => node.id === s.id,
                                        ),
                                )
                                ?.map((risk: any) => (
                                    <Button
                                        key={risk.id}
                                        onPress={() => {
                                            setRecommendedstrategy(risk)
                                            handleSetCurrentStrategies(risk)
                                            // console.log(
                                            //     'risk',
                                            //     risk,
                                            //     currentRisk,
                                            // )
                                            // setCurrentRisk({
                                            //     ...currentRisk,
                                            //     mitigationStrategy: {
                                            //         nodes: [
                                            //             ...currentRisk.mitigationStrategy.nodes,
                                            //             risk,
                                            //         ],
                                            //     },
                                            // })
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
            <SeaLogsButton
                text="Save"
                type="primary"
                color="sky"
                icon="check"
                action={onSidebarClose}
            />
        </div>
    )
}
