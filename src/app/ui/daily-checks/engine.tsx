'use client'
import React, { useEffect, useState } from 'react'
import { useMutation, useLazyQuery } from '@apollo/client'
import {
    UPDATE_ENGINE,
    UpdateFuelTank,
    UpdateVesselDailyCheck_LogBookEntrySection,
} from '@/app/lib/graphQL/mutation'
import {
    AlertDialog,
    CustomDailyCheckField,
    DailyCheckField,
    DailyCheckGroupField,
    FooterWrapper,
    PopoverWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import {
    GET_ENGINES,
    GET_FUELTANKS,
    GET_LOGBOOK_ENTRY_BY_ID,
    GET_SECTION_MEMBER_COMMENTS,
    LogBookSignOff_LogBookEntrySection,
    TripReport_LogBookEntrySection,
    VesselDailyCheck_LogBookEntrySection,
} from '@/app/lib/graphQL/query'
import {
    UPDATE_SECTION_MEMBER_COMMENT,
    CREATE_SECTION_MEMBER_COMMENT,
} from '@/app/lib/graphQL/mutation'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import {
    getDailyCheckNotification,
    displayDescription,
    composeField,
    displayField,
    getFilteredFields,
    getSortOrder,
    getFieldLabel,
} from '@/app/ui/daily-checks/actions'
import { classes } from '@/app/components/GlobalClasses'
import VesselFuelStatus from '../vessels/logbookFuelStatus'
import { getVesselByID } from '@/app/lib/actions'
import dayjs from 'dayjs'
import { Button, Heading } from 'react-aria-components'
import SlidingPanel from 'react-sliding-side-panel'
import { XMarkIcon } from '@heroicons/react/24/outline'
import 'react-quill/dist/quill.snow.css'
import VesselModel from '@/app/offline/models/vessel'
import EngineModel from '@/app/offline/models/engine'
import FuelTankModel from '@/app/offline/models/fuelTank'
import LogBookEntryModel from '@/app/offline/models/logBookEntry'
import SectionMemberCommentModel from '@/app/offline/models/sectionMemberComment'
import LogBookSignOff_LogBookEntrySectionModel from '@/app/offline/models/logBookSignOff_LogBookEntrySection'
import TripReport_LogBookEntrySectionModel from '@/app/offline/models/tripReport_LogBookEntrySection'
import VesselDailyCheck_LogBookEntrySectionModel from '@/app/offline/models/vesselDailyCheck_LogBookEntrySection'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import { tabClasses } from '../daily-checks/checks'

export default function DailyEngineChecks({
    logBookConfig = false,
    vesselDailyCheck = false,
    comments,
    setComments,
    setTab,
    setVesselDailyCheck,
    locked,
    handleCreateTask,
    createMaintenanceCheckLoading,
    offline = false,
    edit_logBookEntry,
}: {
    logBookConfig: any
    vesselDailyCheck: any
    comments: any
    setComments: any
    setTab: any
    setVesselDailyCheck: any
    locked: boolean
    handleCreateTask: any
    createMaintenanceCheckLoading: any
    offline?: boolean
    edit_logBookEntry: boolean
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const vesselID = searchParams.get('vesselID') ?? 0
    const logentryID = searchParams.get('logentryID') ?? 0
    const [saving, setSaving] = useState(false)
    const [loaded, setLoaded] = useState(true)
    const [openCommentAlert, setOpenCommentAlert] = useState(false)
    const [currentComment, setCurrentComment] = useState<any>('')
    const [currentField, setCurrentField] = useState<any>('')
    const [sectionComment, setSectionComment] = useState<any>('')
    const [sectionEngineComment, setSectionEngineComment] = useState<any>('')
    const [sectionFuelComment, setSectionFuelComment] = useState<any>('')
    const [vessel, setVessel] = useState<any>(false)
    const [prevReport, setPrevReport] = useState<any>(null)
    const [prevSignOff, setPrevSignOff] = useState<any>(null)
    const [fuelTankList, setFuelTankList] = useState<any>(null)
    const [fuelLevel, setFuelLevel] = useState<any>(false)
    const [prevFuelLevel, setPrevFuelLevel] = useState<any>(false)
    const [currentReport, setCurrentReport] = useState<any>(null)
    const [engineList, setEngineList] = useState<any>(null)
    const [signOff, setSignOff] = useState<any>(null)
    const [entryLastCreated, setEntryLastCreated] = useState<any>(false)
    const [tab, changeTab] = useState<any>('pre-startup')
    const [openDescriptionPanel, setOpenDescriptionPanel] = useState(false)
    const [descriptionPanelContent, setDescriptionPanelContent] = useState('')
    const [descriptionPanelHeading, setDescriptionPanelHeading] = useState('')
    const [additionalComment, setAdditionalComment] = useState<Boolean>(false)
    const vesselModel = new VesselModel()
    const engineModel = new EngineModel()
    const fuelTankModel = new FuelTankModel()
    const logbookModel = new LogBookEntryModel()
    const commentModel = new SectionMemberCommentModel()
    const signOffModel = new LogBookSignOff_LogBookEntrySectionModel()
    const tripReportModel = new TripReport_LogBookEntrySectionModel()
    const dailyCheckModel = new VesselDailyCheck_LogBookEntrySectionModel()
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
        sectionTypes.forEach(async (section: any) => {
            if (
                section.className === 'SeaLogs\\TripReport_LogBookEntrySection'
            ) {
                if (offline) {
                    const data = await tripReportModel.getByIds(section.ids)
                    setCurrentReport(data)
                } else {
                    getSectionTripReport_LogBookEntrySection({
                        variables: {
                            id: section.ids,
                        },
                    })
                }
            }
            if (
                section.className ===
                'SeaLogs\\LogBookSignOff_LogBookEntrySection'
            ) {
                if (offline) {
                    const data = await signOffModel.getByIds(section.ids)
                    setSignOff(data)
                } else {
                    getLogBookSignOff_LogBookEntrySection({
                        variables: {
                            id: section.ids,
                        },
                    })
                }
            }
        })
    }

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

    const loadLogBookEntry = async (id: any) => {
        if (offline) {
            const data = await logbookModel.getById(id)
            if (data) {
                handleSetLogbook(data)
            }
        } else {
            await queryCurrentLogBookEntry({
                variables: {
                    logbookEntryId: +id,
                },
            })
        }
    }

    const [queryCurrentLogBookEntry] = useLazyQuery(GET_LOGBOOK_ENTRY_BY_ID, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneLogBookEntry
            if (data) {
                handleSetLogbook(data)
            }
        },
        onError: (error: any) => {
            console.error('queryLogBookEntry error', error)
        },
    })

    const handleSetVesselInfo = async (vesselInfo: any) => {
        const prevLockedEntry = vesselInfo.logBookEntries.nodes.find(
            (entry: any) => entry.state === 'Locked',
        )

        if (prevLockedEntry) {
            if (offline) {
                const data = await logbookModel.getById(prevLockedEntry.id)
                if (data) {
                    handleSetPrevLogbook(data)
                }
            } else {
                queryLogBookEntry({
                    variables: {
                        logbookEntryId: +prevLockedEntry.id,
                    },
                })
            }
        }
        loadLogBookEntry(vesselInfo?.logBookEntries?.nodes[0].id)
        const fuelTankIds = vesselInfo?.parentComponent_Components?.nodes
            .filter(
                (item: any) =>
                    item.basicComponent.componentCategory === 'FuelTank',
            )
            .map((item: any) => {
                return item.basicComponent.id
            })
        fuelTankIds?.length > 0 && getFuelTanks(fuelTankIds)
        const engineIds = vesselInfo?.parentComponent_Components?.nodes
            .filter(
                (item: any) =>
                    item.basicComponent.componentCategory === 'Engine',
            )
            .map((item: any) => {
                return item.basicComponent.id
            })
        engineIds.length > 0 && getEngines(engineIds)
        setVessel(vesselInfo)
    }

    const getEngines = async (engineIds: any) => {
        if (offline) {
            let engines = await engineModel.getByIds(engineIds)
            engines = engines.map((engine: any) => {
                const filteredNodes = engine.engineStartStops.nodes.filter(
                    (node: any) =>
                        node.logBookEntrySection.logBookEntryID ===
                        `${logentryID}`,
                )
                return {
                    ...engine,
                    engineStartStops: filteredNodes,
                }
            })
            setEngineList(engines)
        } else {
            await queryGetEngines({
                variables: {
                    id: engineIds,
                    filter: {
                        logBookEntrySection: {
                            logBookEntryID: { eq: +logentryID },
                        },
                    },
                },
            })
        }
    }

    const [queryGetEngines] = useLazyQuery(GET_ENGINES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readEngines.nodes
            setEngineList(data)
        },
        onError: (error: any) => {
            console.error('getEngines error', error)
        },
    })

    const getFuelTanks = async (fuelTankIds: any) => {
        if (offline) {
            const data = await fuelTankModel.getByIds(fuelTankIds)
            setFuelTankList(data)
        } else {
            await queryGetFuelTanks({
                variables: {
                    id: fuelTankIds,
                },
            })
        }
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
        sectionTypes.forEach(async (section: any) => {
            if (
                section.className === 'SeaLogs\\TripReport_LogBookEntrySection'
            ) {
                if (offline) {
                    const data = await tripReportModel.getByIds(section.ids)
                    setPrevReport(data)
                } else {
                    getSectionPrevTripReport_LogBookEntrySection({
                        variables: {
                            id: section.ids,
                        },
                    })
                }
            }
            if (
                section.className ===
                'SeaLogs\\LogBookSignOff_LogBookEntrySection'
            ) {
                if (offline) {
                    const data = await signOffModel.getByIds(section.ids)
                    setPrevSignOff(data)
                } else {
                    getLogBookPrevSignOff_LogBookEntrySection({
                        variables: {
                            id: section.ids,
                        },
                    })
                }
            }
        })
    }

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

    if (!offline) {
        getVesselByID(+vesselID, handleSetVesselInfo)
    }

    const loadVessel = async () => {
        const vessel = await vesselModel.getById(vesselID)
        handleSetVesselInfo(vessel)
    }
    useEffect(() => {
        loadVessel()
    }, [])
    useEffect(() => {
        if (currentReport) {
            var fuelLevel = 0
            var created = 0
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
            setEntryLastCreated(created)
            setFuelLevel(fuelLevel)
        }
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
    }, [prevSignOff])

    const handleEngineChecks = async (check: Boolean, value: any) => {
        if (+vesselDailyCheck?.id > 0) {
            const data = {
                id: vesselDailyCheck.id,
                [value]: check ? 'Ok' : 'Not_Ok',
                logBookEntryID: logentryID,
            }
            if (offline) {
                const response = await dailyCheckModel.save(data)
                setVesselDailyCheck([response])
                setSaving(true)
            } else {
                updateVesselDailyCheck_LogBookEntrySection({
                    variables: {
                        input: data,
                    },
                })
            }
        }
    }

    // Previously propulsion

    const [updateVesselDailyCheck_LogBookEntrySection] = useMutation(
        UpdateVesselDailyCheck_LogBookEntrySection,
        {
            onCompleted: (response) => {
                console.log('Safety check completed')
            },
            onError: (error) => {
                console.error('Error completing safety check', error)
            },
        },
    )

    const [getSectionVesselDailyCheck_LogBookEntrySection] = useLazyQuery(
        VesselDailyCheck_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readVesselDailyCheck_LogBookEntrySections.nodes
                setVesselDailyCheck(data)
                setSaving(true)
                if (vesselDailyCheck === data[0]) {
                    toast.dismiss()
                    toast.custom((t) =>
                        getDailyCheckNotification(
                            [
                                ...preEngineFields,
                                ...preEngineOilFields,
                                ...preEngineMountFields,
                                ...preElectricalFields,
                                ...preElectricalVisualFields,
                                ...preFields,
                                ...postEngineFields,
                                ...postEngineStrainersFields,
                                ...postElectricalFields,
                                ...postSteeringFields,
                            ],
                            logBookConfig,
                            vesselDailyCheck,
                            'Engine Checks',
                            handleSetTab,
                        ),
                    )
                }
            },
            onError: (error: any) => {
                console.error(
                    'VesselDailyCheck_LogBookEntrySection error',
                    error,
                )
            },
        },
    )

    const handleSetTab = (tab: any) => {
        toast.remove()
        setTab(tab)
    }

    useEffect(() => {
        if (saving) {
            toast.dismiss()
            toast.custom((t) =>
                getDailyCheckNotification(
                    [
                        ...preEngineFields,
                        ...preEngineOilFields,
                        ...preEngineMountFields,
                        ...preElectricalFields,
                        ...preElectricalVisualFields,
                        ...preFields,
                        ...postEngineFields,
                        ...postEngineStrainersFields,
                        ...postElectricalFields,
                        ...postSteeringFields,
                    ],
                    logBookConfig,
                    vesselDailyCheck,
                    'Engine Checks',
                    handleSetTab,
                ),
            )
        }
    }, [vesselDailyCheck])

    const getComment = (fieldName: string, commentType = 'FieldComment') => {
        const comment =
            comments?.length > 0
                ? comments.filter(
                      (comment: any) =>
                          comment.fieldName === fieldName &&
                          comment.commentType === commentType,
                  )
                : false
        return comment.length > 0 ? comment[0] : false
    }

    const showCommentPopup = (comment: string, field: any) => {
        setCurrentComment(comment ? comment : '')
        setCurrentField(field)
        setOpenCommentAlert(true)
    }

    const handleSaveComment = async () => {
        setOpenCommentAlert(false)
        const comment = (document.getElementById('comment') as HTMLInputElement)
            ?.value
        const variables = {
            id: currentComment?.id ? currentComment?.id : 0,
            fieldName: currentField[0]?.fieldName,
            comment: comment,
            logBookEntryID: +logentryID,
            logBookEntrySectionID: vesselDailyCheck.id,
            commentType: 'FieldComment',
        }
        const offlineID = currentComment?.id
            ? currentComment?.id
            : generateUniqueId()
        if (currentComment) {
            if (offline) {
                await commentModel.save({ ...variables, id: offlineID })
                loadSectionMemberComments()
            } else {
                updateSectionMemberComment({
                    variables: { input: variables },
                })
            }
        } else {
            if (offline) {
                await commentModel.save({ ...variables, id: offlineID })
                loadSectionMemberComments()
            } else {
                createSectionMemberComment({
                    variables: { input: variables },
                })
            }
        }
    }

    const [updateSectionMemberComment] = useMutation(
        UPDATE_SECTION_MEMBER_COMMENT,
        {
            onCompleted: (response) => {
                loadSectionMemberComments()
            },
            onError: (error) => {
                console.error('Error updating comment', error)
            },
        },
    )

    const [createSectionMemberComment] = useMutation(
        CREATE_SECTION_MEMBER_COMMENT,
        {
            onCompleted: (response) => {
                loadSectionMemberComments()
            },
            onError: (error) => {
                console.error('Error creating comment', error)
            },
        },
    )

    const [querySectionMemberComments] = useLazyQuery(
        GET_SECTION_MEMBER_COMMENTS,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readSectionMemberComments.nodes
                if (data) {
                    setComments(data)
                }
            },
            onError: (error: any) => {
                console.error('querySectionMemberComments error', error)
            },
        },
    )

    const loadSectionMemberComments = async () => {
        if (offline) {
            const data = await commentModel.getByLogBookEntrySectionID(
                vesselDailyCheck.id,
            )
            if (data) {
                setComments(data)
            }
        } else {
            await querySectionMemberComments({
                variables: {
                    filter: {
                        logBookEntrySectionID: { eq: vesselDailyCheck.id },
                    },
                },
            })
        }
    }

    const preEngineFields = [
        {
            name: 'PreEngineAndPropulsion',
            label: 'Engine and propulsion',
            value: 'preEngineAndPropulsion',
            sortOrder: getSortOrder('PreEngineAndPropulsion', logBookConfig),
            checked: vesselDailyCheck?.preEngineAndPropulsion,
        },
        {
            name: 'FuelShutoffs',
            label: 'Fuel shutoffs',
            value: 'fuelShutoffs',
            sortOrder: getSortOrder('FuelShutoffs', logBookConfig),
            checked: vesselDailyCheck?.fuelShutoffs,
        },
        {
            name: 'Separators',
            label: 'Separators',
            value: 'separators',
            sortOrder: getSortOrder('Separators', logBookConfig),
            checked: vesselDailyCheck?.separators,
        },
        {
            name: 'FuelFilters',
            label: 'Fuel Filters',
            value: 'fuelFilters',
            sortOrder: getSortOrder('FuelFilters', logBookConfig),
            checked: vesselDailyCheck?.fuelFilters,
        },
    ]

    const preEngineOilFields = [
        {
            name: 'EngineOilWater',
            label: 'Engine oil and water',
            value: 'engineOilWater',
            sortOrder: getSortOrder('EngineOilWater', logBookConfig),
            checked: vesselDailyCheck?.engineOilWater,
        },
        {
            name: 'EngineOil',
            label: 'Check engine oil levels',
            value: 'engineOil',
            sortOrder: getSortOrder('EngineOil', logBookConfig),
            checked: vesselDailyCheck?.engineOil,
        },
        {
            name: 'OilWater',
            label: 'Oil and water pressure within range',
            value: 'oilWater',
            sortOrder: getSortOrder('OilWater', logBookConfig),
            checked: vesselDailyCheck?.oilWater,
        },
    ]

    const preEngineMountFields = [
        {
            name: 'EngineMountsAndStabilisers',
            label: 'Engine mounts and stabilisers',
            value: 'engineMountsAndStabilisers',
            sortOrder: getSortOrder(
                'EngineMountsAndStabilisers',
                logBookConfig,
            ),
            checked: vesselDailyCheck?.engineMountsAndStabilisers,
        },
        {
            name: 'Stabilizers',
            label: 'Inspect stabilizers',
            value: 'stabilizers',
            sortOrder: getSortOrder('Stabilizers', logBookConfig),
            checked: vesselDailyCheck?.stabilizers,
        },
        {
            name: 'EngineMounts',
            label: 'Engine mounts',
            value: 'engineMounts',
            sortOrder: getSortOrder('EngineMounts', logBookConfig),
            checked: vesselDailyCheck?.engineMounts,
        },
    ]

    const preElectricalFields = [
        {
            name: 'ElectricalChecks',
            label: 'Battery checks',
            value: 'electricalChecks',
            sortOrder: getSortOrder('ElectricalChecks', logBookConfig),
            checked: vesselDailyCheck?.electricalChecks,
        },
        {
            name: 'PropulsionBatteriesStatus',
            label: 'Starter battery, alternator, generator status',
            value: 'batteries',
            sortOrder: getSortOrder('PropulsionBatteriesStatus', logBookConfig),
            checked: vesselDailyCheck?.batteries,
        },
        {
            name: 'HouseBatteriesStatus',
            label: 'House battery status',
            value: 'houseBatteriesStatus',
            sortOrder: getSortOrder('HouseBatteriesStatus', logBookConfig),
            checked: vesselDailyCheck?.houseBatteriesStatus,
        },
    ]

    const preElectricalVisualFields = [
        {
            name: 'ElectricalVisualFields',
            label: 'Electrical Visual Inspection',
            value: 'electricalPanels',
            sortOrder: getSortOrder('ElectricalVisualFields', logBookConfig),
            checked: vesselDailyCheck?.electricalPanels,
        },
        {
            name: 'ElectricalPanels',
            label: 'Visual inspection of electrical panels ',
            value: 'electricalPanels',
            sortOrder: getSortOrder('ElectricalPanels', logBookConfig),
            checked: vesselDailyCheck?.electricalPanels,
        },
        {
            name: 'Wiring',
            label: 'Wiring',
            value: 'wiring',
            sortOrder: getSortOrder('Wiring', logBookConfig),
            checked: vesselDailyCheck?.wiring,
        },
    ]

    const preFields = [
        {
            name: 'SteeringChecks',
            label: 'Steering',
            value: 'steeringChecks',
            sortOrder: getSortOrder('SteeringChecks', logBookConfig),
            checked: vesselDailyCheck?.steeringChecks,
        },
        {
            name: 'SteeringFluid',
            label: 'Steering Fluid',
            value: 'steeringFluid',
            sortOrder: getSortOrder('SteeringFluid', logBookConfig),
            checked: vesselDailyCheck?.steeringFluid,
        },
        {
            name: 'SteeringRams',
            label: 'Rams',
            value: 'steeringRams',
            sortOrder: getSortOrder('SteeringRams', logBookConfig),
            checked: vesselDailyCheck?.steeringRams,
        },
        {
            name: 'SteeringHydraulicSystems',
            label: 'Hydraulic systems',
            value: 'steeringHydraulicSystems',
            sortOrder: getSortOrder('SteeringHydraulicSystems', logBookConfig),
            checked: vesselDailyCheck?.steeringHydraulicSystems,
        },
        {
            name: 'SteeringHoses',
            label: 'Steering hoses',
            value: 'steeringHoses',
            sortOrder: getSortOrder('SteeringHoses', logBookConfig),
            checked: vesselDailyCheck?.steeringHoses,
        },
        {
            name: 'SteeringRudders',
            label: 'Rudders',
            value: 'steeringRudders',
            sortOrder: getSortOrder('SteeringRudders', logBookConfig),
            checked: vesselDailyCheck?.steeringRudders,
        },

        {
            name: 'ThrottleAndCable',
            label: 'Throttle & cables',
            value: 'throttleAndCable',
            sortOrder: getSortOrder('ThrottleAndCable', logBookConfig),
            checked: vesselDailyCheck?.throttleAndCable,
        },
        {
            name: 'SandTraps',
            label: 'Sand traps',
            value: 'sandTraps',
            sortOrder: getSortOrder('SandTraps', logBookConfig),
            checked: vesselDailyCheck?.sandTraps,
        },
    ]

    const postEngineFields = [
        {
            name: 'PostEngineAndPropulsion',
            label: 'Engine and propulsion',
            value: 'postEngineAndPropulsion',
            sortOrder: getSortOrder('PostEngineAndPropulsion', logBookConfig),
            checked: vesselDailyCheck?.postEngineAndPropulsion,
        },
        {
            name: 'CheckOilPressure',
            label: 'Check oil pressure',
            value: 'checkOilPressure',
            sortOrder: getSortOrder('CheckOilPressure', logBookConfig),
            checked: vesselDailyCheck?.checkOilPressure,
        },
        {
            name: 'CoolantLevels',
            label: 'Coolant Levels',
            value: 'coolantLevels',
            sortOrder: getSortOrder('CoolantLevels', logBookConfig),
            checked: vesselDailyCheck?.coolantLevels,
        },
    ]

    const postEngineStrainersFields = [
        {
            name: 'PostElectricalStrainers', // new group.
            label: 'Check Sea Strainers, Sea Valves, Tank levels (Blackwater, Freshwater)',
            value: 'postElectricalStrainers',
            sortOrder: getSortOrder('group', logBookConfig),
            checked: vesselDailyCheck?.postElectricalStrainers,
        },
        {
            name: 'SeaStrainers',
            label: 'Check Sea Strainers, Sea Valves, Tank levels (Blackwater, Freshwater)',
            value: 'seaStrainers',
            sortOrder: getSortOrder('SeaStrainers', logBookConfig),
            checked: vesselDailyCheck?.seaStrainers,
        },
        {
            name: 'Exhaust',
            label: 'Exhaust system',
            value: 'exhaust',
            sortOrder: getSortOrder('Exhaust', logBookConfig),
            checked: vesselDailyCheck?.exhaust,
        },
        {
            name: 'Cooling',
            label: 'Cooling',
            value: 'cooling',
            sortOrder: getSortOrder('Cooling', logBookConfig),
            checked: vesselDailyCheck?.cooling,
        },
        {
            name: 'FuelTanks',
            label: 'Fuel Tanks',
            value: 'fuelTanks',
            sortOrder: getSortOrder('FuelTanks', logBookConfig),
            checked: vesselDailyCheck?.fuelTanks,
        },
    ]

    const postElectricalFields = [
        {
            name: 'PostElectrical',
            label: 'Electrical',
            value: 'postElectrical',
            sortOrder: getSortOrder('PostElectrical', logBookConfig),
            checked: vesselDailyCheck?.postElectrical,
        },
        {
            name: 'BatteryIsCharging',
            label: 'Battery is charging',
            value: 'batteryIsCharging',
            sortOrder: getSortOrder('BatteryIsCharging', logBookConfig),
            checked: vesselDailyCheck?.batteryIsCharging,
        },
        {
            name: 'ShorePowerIsDisconnected',
            label: 'Shore power is disconnected',
            value: 'shorePowerIsDisconnected',
            sortOrder: getSortOrder('ShorePowerIsDisconnected', logBookConfig),
            checked: vesselDailyCheck?.shorePowerIsDisconnected,
        },
    ]

    const postSteeringFields = [
        {
            name: 'Steering',
            label: 'Steering',
            value: 'steering',
            sortOrder: getSortOrder('Steering', logBookConfig),
            checked: vesselDailyCheck?.steering,
        },
        {
            name: 'LockToLockSteering',
            label: 'Lock to lock steering',
            value: 'lockToLockSteering',
            sortOrder: getSortOrder('LockToLockSteering', logBookConfig),
            checked: vesselDailyCheck?.lockToLockSteering,
        },
        {
            name: 'TrimTabs',
            label: 'Trim tabs',
            value: 'trimTabs',
            sortOrder: getSortOrder('TrimTabs', logBookConfig),
            checked: vesselDailyCheck?.trimTabs,
        },
    ]

    const postFields = [
        // Previously propulsion fields
        {
            name: 'MainEngineChecks',
            label: 'Main Engine(s) checks: oil levels/pressure, general performance, overboard discharge',
            value: 'mainEngineChecks',
            checked: vesselDailyCheck?.mainEngineChecks,
        },
        {
            name: 'ElectricalChecks',
            label: 'Electrical checks: battery levels, charging, connections, and alarms',
            value: 'electricalChecks',
            checked: vesselDailyCheck?.electricalChecks,
        },
        {
            name: 'EngineRoomVisualInspection',
            label: 'Engine room visual inspection',
            value: 'engineRoomVisualInspection',
            checked: vesselDailyCheck?.engineRoomVisualInspection,
        },
        {
            name: 'FuelSystems',
            label: 'Fuel systems',
            value: 'fuelSystems',
            checked: vesselDailyCheck?.fuelSystems,
        },
        {
            name: 'SteeringChecks',
            label: 'Steering Checks',
            value: 'steeringChecks',
            checked: vesselDailyCheck?.steeringChecks,
        },
        {
            name: 'ThrottleAndCableChecks',
            label: 'Throttle and cable checks',
            value: 'throttleAndCableChecks',
            checked: vesselDailyCheck?.throttleAndCableChecks,
        },
        {
            name: 'OilAndWater',
            label: 'Machinery Oil and Water',
            value: 'oilAndWater',
            checked: vesselDailyCheck?.oilAndWater,
        },
        {
            name: 'EngineRoomChecks',
            label: 'Engine Room Checks',
            value: 'engineRoomChecks',
            checked: vesselDailyCheck?.engineRoomChecks,
        },
        {
            name: 'EngineRoom',
            label: 'Engine Room ',
            value: 'engineRoom',
            checked: vesselDailyCheck?.engineRoom,
        },
        {
            name: 'EngineMounts',
            label: 'Engine Mounts',
            value: 'engineMounts',
            checked: vesselDailyCheck?.engineMounts,
        },
        {
            name: 'EngineOil',
            label: 'Engine Oil',
            value: 'engineOil',
            checked: vesselDailyCheck?.engineOil,
        },
        {
            name: 'EngineTellTale',
            label: 'Engine Tell Tale Signs',
            value: 'engineTellTale',
            checked: vesselDailyCheck?.engineTellTale,
        },
        {
            name: 'EngineIsFit',
            label: 'Engine Controls Tested',
            value: 'engineIsFit',
            checked: vesselDailyCheck?.engineIsFit,
        },
        {
            name: 'PropulsionEngineChecks',
            label: 'Engine Checks',
            value: 'propulsionEngineChecks',
            checked: vesselDailyCheck?.propulsionEngineChecks,
        },
        {
            name: 'FuelTanks',
            label: 'Fuel Tanks',
            value: 'fuelTanks',
            checked: vesselDailyCheck?.fuelTanks,
        },
        {
            name: 'FuelFilters',
            label: 'Fuel Filters',
            value: 'fuelFilters',
            checked: vesselDailyCheck?.fuelFilters,
        },
        {
            name: 'SteeringFluid',
            label: 'Steering Fluid',
            value: 'steeringFluid',
            checked: vesselDailyCheck?.steeringFluid,
        },
        {
            name: 'SteeringRams',
            label: 'Steering Rams',
            value: 'steeringRams',
            checked: vesselDailyCheck?.steeringRams,
        },
        {
            name: 'SteeringIsFit',
            label: 'Steering Checked',
            value: 'steeringIsFit',
            checked: vesselDailyCheck?.steeringIsFit,
        },
        {
            name: 'Steering',
            label: 'Steering',
            value: 'steering',
            checked: vesselDailyCheck?.steering,
        },
        {
            name: 'CablesFRPullies',
            label: 'Cables & Pullies',
            value: 'cablesFRPullies',
            checked: vesselDailyCheck?.cablesFRPullies,
        },
        {
            name: 'ThrottleAndCable',
            label: 'Throttle & Cable',
            value: 'throttleAndCable',
            checked: vesselDailyCheck?.throttleAndCable,
        },
        {
            name: 'SandTraps',
            label: 'Sand Traps',
            value: 'sandTraps',
            checked: vesselDailyCheck?.sandTraps,
        },
        {
            name: 'Wiring',
            label: 'Wiring',
            value: 'wiring',
            checked: vesselDailyCheck?.wiring,
        },
        {
            name: 'BeltsHosesClamps',
            label: 'Belts, Hoses, Clamps and Fittings',
            value: 'beltsHosesClamps',
            checked: vesselDailyCheck?.beltsHosesClamps,
        },
        {
            name: 'Generator',
            label: 'Generator',
            value: 'generator',
            checked: vesselDailyCheck?.generator,
        },
        {
            name: 'Transmission',
            label: 'Transmission/Gearbox, Propellers, Thrusters, Outboard/s, Sail Drive, Jet Unit, and Impellor checks',
            value: 'transmission',
            checked: vesselDailyCheck?.transmission,
        },
        {
            name: 'PropulsionCheck',
            label: 'Test propulsion (forward/reverse) and trim tabs',
            value: 'propulsionCheck',
            checked: vesselDailyCheck?.propulsionCheck,
        },
        {
            name: 'Exhaust',
            label: 'Exhaust system',
            value: 'exhaust',
            checked: vesselDailyCheck?.exhaust,
        },
        {
            name: 'Stabilizers',
            label: 'Inspect stabilizers',
            value: 'stabilizers',
            checked: vesselDailyCheck?.stabilizers,
        },
        {
            name: 'PropulsionBatteriesStatus',
            label: 'Batteries, alternator, generator status',
            value: 'batteries',
            checked: vesselDailyCheck?.batteries,
        },
        {
            name: 'ShorePower',
            label: 'Shore power connection, solar panels/wind generators, inverter',
            value: 'shorePower',
            checked: vesselDailyCheck?.shorePower,
        },
        {
            name: 'ElectricalPanels',
            label: 'Test electrical panels, circuit breakers, and lighting (interior and exterior)',
            value: 'electricalPanels',
            checked: vesselDailyCheck?.electricalPanels,
        },

        {
            name: 'SeaStrainers',
            label: 'Check Sea Strainers, sea valves, tank levels (blackwater, slbluewater & freshwater)',
            value: 'seaStrainers',
            checked: vesselDailyCheck?.seaStrainers,
        },
        {
            name: 'AirShutoffs',
            label: 'Air shutoffs',
            value: 'airShutoffs',
            checked: vesselDailyCheck?.airShutoffs,
        },
        {
            name: 'FireDampeners',
            label: 'Fire dampeners',
            value: 'fireDampeners',
            checked: vesselDailyCheck?.fireDampeners,
        },
        {
            name: 'CoolantLevels',
            label: 'Coolant levels',
            value: 'CoolantLevels',
            checked: vesselDailyCheck?.coolantLevels,
        },
        {
            name: 'FuelShutoffs',
            label: 'Fuel shutoffs',
            value: 'fuelShutoffs',
            checked: vesselDailyCheck?.fuelShutoffs,
        },
        {
            name: 'Separators',
            label: 'Separators',
            value: 'separators',
            checked: vesselDailyCheck?.separators,
        },
        {
            name: 'SteeringRudders',
            label: 'Steering rudders',
            value: 'steeringRudders',
            checked: vesselDailyCheck?.steeringRudders,
        },
        {
            name: 'SteeringHoses',
            label: 'Steering hoses',
            value: 'steeringHoses',
            checked: vesselDailyCheck?.steeringHoses,
        },
        {
            name: 'SteeringTillers',
            label: 'Tillers',
            value: 'steeringTillers',
            checked: vesselDailyCheck?.steeringTillers,
        },
        {
            name: 'SteeringHydraulicSystems',
            label: 'Steering hydraulic systems',
            value: 'steeringHydraulicSystems',
            checked: vesselDailyCheck?.steeringHydraulicSystems,
        },
        {
            name: 'OperationalTestsOfHelms',
            label: 'Operational test of helm',
            value: 'operationalTestsOfHelms',
            checked: vesselDailyCheck?.operationalTestsOfHelms,
        },
        {
            name: 'DriveShaftsChecks',
            label: 'Drive Shafts Checks',
            value: 'driveShaftsChecks',
            checked: vesselDailyCheck?.driveShaftsChecks,
        },
        {
            name: 'DriveShafts',
            label: 'Drive Shafts ',
            value: 'driveShafts',
            checked: vesselDailyCheck?.driveShafts,
        },
        {
            name: 'GearBox',
            label: 'Gear Box',
            value: 'gearBox',
            checked: vesselDailyCheck?.gearBox,
        },
        {
            name: 'Propellers',
            label: 'Propellers',
            value: 'propellers',
            checked: vesselDailyCheck?.propellers,
        },
        {
            name: 'Skeg',
            label: 'Skeg',
            value: 'skeg',
            checked: vesselDailyCheck?.skeg,
        },
        {
            name: 'Cooling',
            label: 'Cooling',
            value: 'cooling',
            checked: vesselDailyCheck?.cooling,
        },
    ]

    const handleSave = async () => {
        setLoaded(false)
        if (offline) {
            const data = await dailyCheckModel.getByIds([vesselDailyCheck.id])
            setVesselDailyCheck(data)
            setSaving(true)
            if (vesselDailyCheck === data[0]) {
                toast.dismiss()
                toast.custom((t) =>
                    getDailyCheckNotification(
                        [
                            ...preEngineFields,
                            ...preEngineOilFields,
                            ...preEngineMountFields,
                            ...preElectricalFields,
                            ...preElectricalVisualFields,
                            ...preFields,
                            ...postEngineFields,
                            ...postEngineStrainersFields,
                            ...postElectricalFields,
                            ...postSteeringFields,
                        ],
                        logBookConfig,
                        vesselDailyCheck,
                        'Engine Checks',
                        handleSetTab,
                    ),
                )
            }
        } else {
            getSectionVesselDailyCheck_LogBookEntrySection({
                variables: {
                    id: [vesselDailyCheck.id],
                },
            })
        }
        toast.loading('Saving Engine Checks...')
        const variablesEngine = {
            id: getComment('DailyCheckEngine', 'Section')
                ? getComment('DailyCheckEngine', 'Section').id
                : 0,
            fieldName: 'DailyCheckEngine',
            comment: sectionEngineComment
                ? sectionEngineComment
                : getComment('DailyCheckEngine', 'Section').comment,
            logBookEntryID: +logentryID,
            logBookEntrySectionID: vesselDailyCheck.id,
            commentType: 'Section',
        }
        const variablesFuel = {
            id: getComment('DailyCheckFuel', 'Section')
                ? getComment('DailyCheckFuel', 'Section').id
                : 0,
            fieldName: 'DailyCheckFuel',
            comment: sectionFuelComment
                ? sectionFuelComment
                : getComment('DailyCheckFuel', 'Section').comment,
            logBookEntrySectionID: vesselDailyCheck.id,
            commentType: 'Section',
        }

        const fuelStart = (
            document.getElementById('fuel-start') as HTMLInputElement
        )?.value
        if (fuelStart !== fuelLevel ? fuelLevel : prevFuelLevel) {
            fuelTankList.map(async (fuelTank: any, index: number) => {
                const fuelData = {
                    id: fuelTank.id,
                    currentLevel:
                        +fuelStart - fuelTank.capacity * index >
                        fuelTank.capacity
                            ? fuelTank.capacity
                            : +fuelStart - fuelTank.capacity * index > -1
                              ? +fuelStart - fuelTank.capacity * index
                              : 0,
                }
                if (offline) {
                    await fuelTankModel.save(fuelData)
                    setLoaded(true)
                } else {
                    updateFuelTank({
                        variables: {
                            input: fuelData,
                        },
                    })
                }
            })
        }
        if (getComment('DailyCheckEngine', 'Section')?.id) {
            if (offline) {
                await commentModel.save(variablesEngine)
                loadSectionMemberComments()
            } else {
                updateSectionMemberComment({
                    variables: { input: variablesEngine },
                })
            }
        } else {
            if (offline) {
                const id = getComment('DailyCheckEngine', 'Section')
                    ? getComment('DailyCheckEngine', 'Section').id
                    : generateUniqueId()
                await commentModel.save({ ...variablesEngine, id: id })
                loadSectionMemberComments()
            } else {
                createSectionMemberComment({
                    variables: { input: variablesEngine },
                })
            }
        }
        if (getComment('DailyCheckFuel', 'Section')?.id) {
            if (offline) {
                await commentModel.save(variablesFuel)
                loadSectionMemberComments()
            } else {
                updateSectionMemberComment({
                    variables: { input: variablesFuel },
                })
            }
        } else {
            if (offline) {
                const id = getComment('DailyCheckFuel', 'Section')
                    ? getComment('DailyCheckFuel', 'Section').id
                    : generateUniqueId()
                await commentModel.save({
                    ...variablesFuel,
                    id: id,
                })
                loadSectionMemberComments()
            } else {
                createSectionMemberComment({
                    variables: { input: variablesFuel },
                })
            }
        }
    }

    const [updateFuelTank] = useMutation(UpdateFuelTank, {
        onCompleted: (response) => {
            setLoaded(true)
        },
        onError: (error) => {
            console.error('Error updating fuel tank', error)
        },
    })

    const [updateEngineHours] = useMutation(UPDATE_ENGINE, {
        onCompleted: (response) => {},
        onError: (error) => {
            console.error('Error updating engine hours', error)
        },
    })

    const maxCapacity = fuelTankList?.reduce(
        (total: number, tank: any) => total + tank.capacity,
        0,
    )

    const handleGroupYesChange = async (
        groupField: any,
        groupFieldParent: any,
    ) => {
        await handleEngineChecks(
            true,
            [
                ...preEngineFields,
                ...preEngineOilFields,
                ...preEngineMountFields,
                ...preElectricalFields,
                ...preElectricalVisualFields,
                ...preFields,
                ...postEngineFields,
                ...postEngineStrainersFields,
                ...postElectricalFields,
                ...postSteeringFields,
            ].find((field: any) => field.name === groupFieldParent.name)?.value,
        )
        groupField.map((field: any) => handleEngineChecks(true, field.value))
    }

    const handleGroupNoChange = async (
        groupField: any,
        groupFieldParent: any,
    ) => {
        await handleEngineChecks(
            false,
            [
                ...preEngineFields,
                ...preEngineOilFields,
                ...preEngineMountFields,
                ...preElectricalFields,
                ...preElectricalVisualFields,
                ...preFields,
                ...postEngineFields,
                ...postEngineStrainersFields,
                ...postElectricalFields,
                ...postSteeringFields,
            ].find((field: any) => field.name === groupFieldParent.name)?.value,
        )
        groupField.map((field: any) => handleEngineChecks(false, field.value))
    }

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
        <div className="pb-16">
            <ul className="flex-row text-2xs uppercase gap-1 font-inter text-center mb-3 hidden lg:flex">
                <li className={`${classes.label} !w-auto`}>
                    <Button
                        className={`${tab === 'pre-startup' ? tabClasses.active : tabClasses.inactive} uppercase whitespace-nowrap`}
                        onPress={() => {
                            tab === 'pre-startup'
                                ? changeTab('')
                                : changeTab('pre-startup')
                        }}>
                        Pre-startup checks
                    </Button>
                </li>
                <li className={`${classes.label} !w-auto `}>
                    <Button
                        className={`${tab === 'post-startup' ? tabClasses.active : tabClasses.inactive} uppercase whitespace-nowrap`}
                        onPress={() => {
                            tab === 'post-startup'
                                ? changeTab('')
                                : changeTab('post-startup')
                        }}>
                        Post-startup checks
                    </Button>
                </li>
            </ul>
            <Button
                className={`${tab === 'pre-startup' ? tabClasses.active : tabClasses.inactive} uppercase whitespace-nowrap block lg:hidden`}
                onPress={() => {
                    tab === 'pre-startup'
                        ? changeTab('')
                        : changeTab('pre-startup')
                }}>
                Pre-startup checks
            </Button>
            <div className={`${tab === 'pre-startup' ? '' : 'hidden'}`}>
                <div className="flex flex-row">
                    <div className="mt-6 text-sm font-semibold uppercase">
                        Fuel levels
                    </div>
                    <div
                        className={`flex flex-wrap ${locked || !edit_logBookEntry ? 'pointer-events-none opacity-60' : ''}`}>
                        {fuelTankList && loaded && (
                            <VesselFuelStatus
                                fuelTankList={fuelTankList}
                                updateFuelTankList={getFuelTanks}
                            />
                        )}
                    </div>
                </div>
                <p className="text-xs font-inter max-w-[40rem] leading-loose">
                    Click the gauge to change the fuel level.
                </p>
                <div className="my-4">
                    <textarea
                        id={`section_comment`}
                        placeholder="Comment IF Fuel start is different to fuel end on previous logbook entry"
                        readOnly={locked || !edit_logBookEntry}
                        rows={4}
                        className={`${classes.textarea} mt-4`}
                        onChange={(e) => setSectionFuelComment(e.target.value)}
                        defaultValue={
                            getComment('DailyCheckFuel', 'Section')?.comment
                        }></textarea>
                </div>
                {engineList?.length > 0 && (
                    <>
                        <div className="mt-6 text-sm font-semibold uppercase text-left">
                            Engine hours
                        </div>
                        <div className="">
                            {engineList?.map((engine: any) => (
                                <div
                                    className="my-4 flex items-center"
                                    key={engine.id}>
                                    <label className={classes.label}>
                                        {engine.title}
                                    </label>
                                    <input
                                        id={`engine-hours-${engine.id}`}
                                        type="number"
                                        defaultValue={engine.currentHours}
                                        name="start"
                                        placeholder="Engine Hours"
                                        className={classes.input}
                                        disabled={locked || !edit_logBookEntry}
                                        onBlur={(e: any) => {
                                            const engineData = {
                                                id: engine.id,
                                                currentHours: +e.target.value,
                                            }
                                            if (offline) {
                                                engineModel.save(engineData)
                                            } else {
                                                updateEngineHours({
                                                    variables: {
                                                        input: engineData,
                                                    },
                                                })
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                            <div className="my-4">
                                <textarea
                                    placeholder="Comment IF Engine hours are different to engine hours at end of previous logbook entry"
                                    readOnly={locked || !edit_logBookEntry}
                                    rows={4}
                                    className={`${classes.textarea} mt-4`}
                                    onChange={(e) =>
                                        setSectionEngineComment(e.target.value)
                                    }
                                    /*onBlur={(e) =>
                                        getComment(
                                            'DailyCheckEngine',
                                            'Section',
                                        )?.id > 0
                                            ? updateSectionMemberComment({
                                                variables: {
                                                    input: {
                                                        id: getComment(
                                                            'DailyCheckEngine',
                                                            'Section',
                                                        ).id,
                                                        comment:
                                                            e.target.value,
                                                    },
                                                },
                                            })
                                            : createSectionMemberComment({
                                                variables: {
                                                    input: {
                                                        fieldName:
                                                            'DailyCheckEngine',
                                                        comment:
                                                            e.target.value,
                                                        logBookEntrySectionID:
                                                            vesselDailyCheck.id,
                                                        commentType:
                                                            'Section',
                                                    },
                                                },
                                            })
                                    }*/
                                    defaultValue={
                                        getComment(
                                            'DailyCheckEngine',
                                            'Section',
                                        )?.comment
                                    }>
                                    {/* {getComment('Engine', 'Section')?.comment} */}
                                </textarea>
                            </div>
                        </div>
                    </>
                )}
                {logBookConfig && vesselDailyCheck && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start">
                        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                            {getFilteredFields(
                                preEngineFields,
                                true,
                                logBookConfig,
                            )
                                ?.filter((groupField: any) =>
                                    displayField(
                                        groupField.name,
                                        logBookConfig,
                                    ),
                                )
                                ?.map((groupField: any) => (
                                    <div key={groupField.name} className="">
                                        <div className="my-2 flex flex-row gap-2 text-left items-center justify-between">
                                            <div className="flex flex-row items-center flex-wrap">
                                                {groupField?.items
                                                    ?.filter((field: any) =>
                                                        displayField(
                                                            field.name,
                                                            logBookConfig,
                                                        ),
                                                    )
                                                    ?.map(
                                                        (
                                                            field: any,
                                                            index: number,
                                                        ) => (
                                                            <span
                                                                key={`${field.label}-${index}`}
                                                                className="text-sm lg:text-base">
                                                                {index <
                                                                groupField.items
                                                                    .length -
                                                                    1
                                                                    ? field.label +
                                                                      ' -'
                                                                    : field.label}
                                                                {displayDescription(
                                                                    field.name,
                                                                    logBookConfig,
                                                                ) && (
                                                                    <SeaLogsButton
                                                                        icon="alert"
                                                                        className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                        action={() => {
                                                                            setDescriptionPanelContent(
                                                                                displayDescription(
                                                                                    field.name,
                                                                                    logBookConfig,
                                                                                ),
                                                                            )
                                                                            setOpenDescriptionPanel(
                                                                                true,
                                                                            )
                                                                            setDescriptionPanelHeading(
                                                                                field.name,
                                                                            )
                                                                        }}
                                                                    />
                                                                )}{' '}
                                                            </span>
                                                        ),
                                                    )}
                                                {displayDescription(
                                                    groupField.name,
                                                    logBookConfig,
                                                ) && (
                                                    <SeaLogsButton
                                                        icon="alert"
                                                        className="w-6 h-6 sup -mt-2 ml-0.5"
                                                        action={() => {
                                                            setDescriptionPanelContent(
                                                                displayDescription(
                                                                    groupField.name,
                                                                    logBookConfig,
                                                                ),
                                                            )
                                                            setOpenDescriptionPanel(
                                                                true,
                                                            )
                                                            setDescriptionPanelHeading(
                                                                groupField.name,
                                                            )
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-row items-center">
                                                <DailyCheckGroupField
                                                    locked={
                                                        locked ||
                                                        !edit_logBookEntry
                                                    }
                                                    groupField={groupField?.items?.filter(
                                                        (field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                    )}
                                                    handleYesChange={() =>
                                                        handleGroupYesChange(
                                                            groupField?.items?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            ),
                                                            groupField,
                                                        )
                                                    }
                                                    handleNoChange={() =>
                                                        handleGroupNoChange(
                                                            groupField?.items?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            ),
                                                            groupField,
                                                        )
                                                    }
                                                    defaultNoChecked={groupField?.items
                                                        ?.filter((field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                        ?.every(
                                                            (field: any) =>
                                                                field.checked ===
                                                                'Not_Ok',
                                                        )}
                                                    defaultYesChecked={groupField?.items
                                                        ?.filter((field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                        ?.every(
                                                            (field: any) =>
                                                                field.checked ===
                                                                'Ok',
                                                        )}
                                                    commentAction={() =>
                                                        showCommentPopup(
                                                            getComment(
                                                                groupField.name,
                                                            ),
                                                            composeField(
                                                                groupField.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                    }
                                                    comment={
                                                        getComment(
                                                            groupField.name,
                                                        )?.comment
                                                    }
                                                />
                                                {groupField?.items?.map(
                                                    (
                                                        field: any,
                                                        index: number,
                                                    ) => (
                                                        <DailyCheckField
                                                            locked={
                                                                locked ||
                                                                !edit_logBookEntry
                                                            }
                                                            className={`lg:!grid-cols-2 hidden`}
                                                            innerWrapperClassName={`lg:!col-span-1`}
                                                            key={index}
                                                            displayField={displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            )}
                                                            displayDescription={displayDescription(
                                                                field.name,
                                                                logBookConfig,
                                                            )}
                                                            displayLabel={getFieldLabel(
                                                                field.name,
                                                                logBookConfig,
                                                            )}
                                                            inputId={
                                                                field.value
                                                            }
                                                            handleNoChange={() =>
                                                                handleEngineChecks(
                                                                    false,
                                                                    field.value,
                                                                )
                                                            }
                                                            defaultNoChecked={
                                                                field.checked ===
                                                                'Not_Ok'
                                                            }
                                                            handleYesChange={() =>
                                                                handleEngineChecks(
                                                                    true,
                                                                    field.value,
                                                                )
                                                            }
                                                            defaultYesChecked={
                                                                field.checked ===
                                                                'Ok'
                                                            }
                                                            commentAction={() =>
                                                                showCommentPopup(
                                                                    getComment(
                                                                        field.name,
                                                                    ),
                                                                    composeField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                                )
                                                            }
                                                            comment={
                                                                getComment(
                                                                    field.name,
                                                                )?.comment
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            <div className="flex flex-row gap-2">
                                <CustomDailyCheckField
                                    locked={locked || !edit_logBookEntry}
                                    displayField={displayField(
                                        'EngineCheckPropellers',
                                        logBookConfig,
                                    )}
                                    displayDescription={displayDescription(
                                        'EngineCheckPropellers',
                                        logBookConfig,
                                    )}
                                    setDescriptionPanelContent={
                                        setDescriptionPanelContent
                                    }
                                    setOpenDescriptionPanel={
                                        setOpenDescriptionPanel
                                    }
                                    setDescriptionPanelHeading={
                                        setDescriptionPanelHeading
                                    }
                                    displayLabel={
                                        'Check for damage on the props'
                                    }
                                    className={'flex'}
                                    inputId={'engineCheckPropellers'}
                                    handleNoChange={() =>
                                        handleEngineChecks(
                                            false,
                                            'engineCheckPropellers',
                                        )
                                    }
                                    defaultNoChecked={
                                        vesselDailyCheck?.engineCheckPropellers ===
                                        'Not_Ok'
                                    }
                                    handleYesChange={() =>
                                        handleEngineChecks(
                                            true,
                                            'engineCheckPropellers',
                                        )
                                    }
                                    defaultYesChecked={
                                        vesselDailyCheck?.engineCheckPropellers ===
                                        'Ok'
                                    }
                                    commentAction={() =>
                                        showCommentPopup(
                                            getComment('EngineCheckPropellers'),
                                            composeField(
                                                'EngineCheckPropellers',
                                                logBookConfig,
                                            ),
                                        )
                                    }
                                    comment={
                                        getComment('EngineCheckPropellers')
                                            ?.comment
                                    }
                                />
                            </div>
                            {getFilteredFields(
                                preEngineOilFields,
                                true,
                                logBookConfig,
                            )
                                ?.filter((groupField: any) =>
                                    displayField(
                                        groupField.name,
                                        logBookConfig,
                                    ),
                                )
                                ?.map((groupField: any) => (
                                    <div key={groupField.name} className="">
                                        <div className="my-2 flex flex-row gap-2 text-left items-center justify-between">
                                            <div className="flex flex-wrap">
                                                {groupField?.items
                                                    ?.filter((field: any) =>
                                                        displayField(
                                                            field.name,
                                                            logBookConfig,
                                                        ),
                                                    )
                                                    ?.map(
                                                        (
                                                            field: any,
                                                            index: number,
                                                        ) => (
                                                            <span
                                                                key={`${field.label}-${index}`}
                                                                className="text-sm lg:text-base">
                                                                {index <
                                                                groupField.items
                                                                    .length -
                                                                    1
                                                                    ? field.label +
                                                                      ' -'
                                                                    : field.label}
                                                                {displayDescription(
                                                                    field.name,
                                                                    logBookConfig,
                                                                ) && (
                                                                    <SeaLogsButton
                                                                        icon="alert"
                                                                        className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                        action={() => {
                                                                            setDescriptionPanelContent(
                                                                                displayDescription(
                                                                                    field.name,
                                                                                    logBookConfig,
                                                                                ),
                                                                            )
                                                                            setOpenDescriptionPanel(
                                                                                true,
                                                                            )
                                                                            setDescriptionPanelHeading(
                                                                                field.name,
                                                                            )
                                                                        }}
                                                                    />
                                                                )}{' '}
                                                            </span>
                                                        ),
                                                    )}
                                                {displayDescription(
                                                    groupField.name,
                                                    logBookConfig,
                                                ) && (
                                                    <SeaLogsButton
                                                        icon="alert"
                                                        className="w-6 h-6 sup -mt-2 ml-0.5"
                                                        action={() => {
                                                            setDescriptionPanelContent(
                                                                displayDescription(
                                                                    groupField.name,
                                                                    logBookConfig,
                                                                ),
                                                            )
                                                            setOpenDescriptionPanel(
                                                                true,
                                                            )
                                                            setDescriptionPanelHeading(
                                                                groupField.name,
                                                            )
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-row">
                                                <DailyCheckGroupField
                                                    locked={
                                                        locked ||
                                                        !edit_logBookEntry
                                                    }
                                                    groupField={groupField?.items?.filter(
                                                        (field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                    )}
                                                    handleYesChange={() =>
                                                        handleGroupYesChange(
                                                            groupField?.items?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            ),
                                                            groupField,
                                                        )
                                                    }
                                                    handleNoChange={() =>
                                                        handleGroupNoChange(
                                                            groupField?.items?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            ),
                                                            groupField,
                                                        )
                                                    }
                                                    defaultNoChecked={groupField?.items
                                                        ?.filter((field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                        ?.every(
                                                            (field: any) =>
                                                                field.checked ===
                                                                'Not_Ok',
                                                        )}
                                                    defaultYesChecked={groupField?.items
                                                        ?.filter((field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                        ?.every(
                                                            (field: any) =>
                                                                field.checked ===
                                                                'Ok',
                                                        )}
                                                    commentAction={() =>
                                                        showCommentPopup(
                                                            getComment(
                                                                groupField.name,
                                                            ),
                                                            composeField(
                                                                groupField.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                    }
                                                    comment={
                                                        getComment(
                                                            groupField.name,
                                                        )?.comment
                                                    }
                                                />
                                                {groupField?.items?.map(
                                                    (
                                                        field: any,
                                                        index: number,
                                                    ) => (
                                                        <DailyCheckField
                                                            locked={
                                                                locked ||
                                                                !edit_logBookEntry
                                                            }
                                                            className={`lg:!grid-cols-2 hidden`}
                                                            innerWrapperClassName={`lg:!col-span-1`}
                                                            key={index}
                                                            displayField={displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            )}
                                                            displayDescription={displayDescription(
                                                                field.name,
                                                                logBookConfig,
                                                            )}
                                                            displayLabel={getFieldLabel(
                                                                field.name,
                                                                logBookConfig,
                                                            )}
                                                            inputId={
                                                                field.value
                                                            }
                                                            handleNoChange={() =>
                                                                handleEngineChecks(
                                                                    false,
                                                                    field.value,
                                                                )
                                                            }
                                                            defaultNoChecked={
                                                                field.checked ===
                                                                'Not_Ok'
                                                            }
                                                            handleYesChange={() =>
                                                                handleEngineChecks(
                                                                    true,
                                                                    field.value,
                                                                )
                                                            }
                                                            defaultYesChecked={
                                                                field.checked ===
                                                                'Ok'
                                                            }
                                                            commentAction={() =>
                                                                showCommentPopup(
                                                                    getComment(
                                                                        field.name,
                                                                    ),
                                                                    composeField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                                )
                                                            }
                                                            comment={
                                                                getComment(
                                                                    field.name,
                                                                )?.comment
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            {getFilteredFields(
                                preEngineMountFields,
                                true,
                                logBookConfig,
                            )
                                ?.filter((groupField: any) =>
                                    displayField(
                                        groupField.name,
                                        logBookConfig,
                                    ),
                                )
                                ?.map((groupField: any) => (
                                    <div key={groupField.name} className="">
                                        <div className="my-2 flex flex-row gap-2 text-left items-center justify-between">
                                            <div className="flex flex-row flex-wrap">
                                                {groupField?.items
                                                    ?.filter((field: any) =>
                                                        displayField(
                                                            field.name,
                                                            logBookConfig,
                                                        ),
                                                    )
                                                    ?.map(
                                                        (
                                                            field: any,
                                                            index: number,
                                                        ) => (
                                                            <span
                                                                key={`${field.label}-${index}`}
                                                                className="text-sm lg:text-base">
                                                                {index <
                                                                groupField.items
                                                                    .length -
                                                                    1
                                                                    ? field.label +
                                                                      ' -'
                                                                    : field.label}
                                                                {displayDescription(
                                                                    field.name,
                                                                    logBookConfig,
                                                                ) && (
                                                                    <SeaLogsButton
                                                                        icon="alert"
                                                                        className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                        action={() => {
                                                                            setDescriptionPanelContent(
                                                                                displayDescription(
                                                                                    field.name,
                                                                                    logBookConfig,
                                                                                ),
                                                                            )
                                                                            setOpenDescriptionPanel(
                                                                                true,
                                                                            )
                                                                            setDescriptionPanelHeading(
                                                                                field.name,
                                                                            )
                                                                        }}
                                                                    />
                                                                )}{' '}
                                                            </span>
                                                        ),
                                                    )}
                                                {displayDescription(
                                                    groupField.name,
                                                    logBookConfig,
                                                ) && (
                                                    <SeaLogsButton
                                                        icon="alert"
                                                        className="w-6 h-6 sup -mt-2 ml-0.5"
                                                        action={() => {
                                                            setDescriptionPanelContent(
                                                                displayDescription(
                                                                    groupField.name,
                                                                    logBookConfig,
                                                                ),
                                                            )
                                                            setOpenDescriptionPanel(
                                                                true,
                                                            )
                                                            setDescriptionPanelHeading(
                                                                groupField.name,
                                                            )
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-row">
                                                <DailyCheckGroupField
                                                    locked={
                                                        locked ||
                                                        !edit_logBookEntry
                                                    }
                                                    groupField={groupField?.items?.filter(
                                                        (field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                    )}
                                                    handleYesChange={() =>
                                                        handleGroupYesChange(
                                                            groupField?.items?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            ),
                                                            groupField,
                                                        )
                                                    }
                                                    handleNoChange={() =>
                                                        handleGroupNoChange(
                                                            groupField?.items?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            ),
                                                            groupField,
                                                        )
                                                    }
                                                    defaultNoChecked={groupField?.items
                                                        ?.filter((field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                        ?.every(
                                                            (field: any) =>
                                                                field.checked ===
                                                                'Not_Ok',
                                                        )}
                                                    defaultYesChecked={groupField?.items
                                                        ?.filter((field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                        ?.every(
                                                            (field: any) =>
                                                                field.checked ===
                                                                'Ok',
                                                        )}
                                                    commentAction={() =>
                                                        showCommentPopup(
                                                            getComment(
                                                                groupField.name,
                                                            ),
                                                            composeField(
                                                                groupField.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                    }
                                                    comment={
                                                        getComment(
                                                            groupField.name,
                                                        )?.comment
                                                    }
                                                />
                                                {groupField?.items?.map(
                                                    (
                                                        field: any,
                                                        index: number,
                                                    ) => (
                                                        <DailyCheckField
                                                            locked={
                                                                locked ||
                                                                !edit_logBookEntry
                                                            }
                                                            className={`lg:!grid-cols-2 hidden`}
                                                            innerWrapperClassName={`lg:!col-span-1`}
                                                            key={index}
                                                            displayField={displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            )}
                                                            displayDescription={displayDescription(
                                                                field.name,
                                                                logBookConfig,
                                                            )}
                                                            displayLabel={getFieldLabel(
                                                                field.name,
                                                                logBookConfig,
                                                            )}
                                                            inputId={
                                                                field.value
                                                            }
                                                            handleNoChange={() =>
                                                                handleEngineChecks(
                                                                    false,
                                                                    field.value,
                                                                )
                                                            }
                                                            defaultNoChecked={
                                                                field.checked ===
                                                                'Not_Ok'
                                                            }
                                                            handleYesChange={() =>
                                                                handleEngineChecks(
                                                                    true,
                                                                    field.value,
                                                                )
                                                            }
                                                            defaultYesChecked={
                                                                field.checked ===
                                                                'Ok'
                                                            }
                                                            commentAction={() =>
                                                                showCommentPopup(
                                                                    getComment(
                                                                        field.name,
                                                                    ),
                                                                    composeField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                                )
                                                            }
                                                            comment={
                                                                getComment(
                                                                    field.name,
                                                                )?.comment
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
                {getFilteredFields(
                    preElectricalFields,
                    true,
                    logBookConfig,
                )?.filter((groupField: any) =>
                    displayField(groupField.name, logBookConfig),
                ).length > 0 ||
                getFilteredFields(
                    preElectricalVisualFields,
                    true,
                    logBookConfig,
                )?.filter((groupField: any) =>
                    displayField(groupField.name, logBookConfig),
                ).length > 0 ||
                displayField('Generator', logBookConfig) ||
                displayField('ShorePower', logBookConfig) ? (
                    <>
                        <hr className="my-6" />
                        <div className="mt-6 text-sm font-semibold uppercase text-left">
                            Electrical
                        </div>
                        {logBookConfig && vesselDailyCheck && (
                            <div className="flex flex-col text-left">
                                {getFilteredFields(
                                    preElectricalFields,
                                    true,
                                    logBookConfig,
                                )
                                    ?.filter((groupField: any) =>
                                        displayField(
                                            groupField.name,
                                            logBookConfig,
                                        ),
                                    )
                                    ?.map((groupField: any) => (
                                        <div key={groupField.name} className="">
                                            <div className="flex flex-row gap-2 my-2 text-left items-center justify-between">
                                                <div className="flex flex-wrap">
                                                    {groupField?.items
                                                        ?.filter((field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                        ?.map(
                                                            (
                                                                field: any,
                                                                index: number,
                                                            ) => (
                                                                <span
                                                                    key={`${field.label}-${index}`}
                                                                    className="text-sm lg:text-base">
                                                                    {index <
                                                                    groupField
                                                                        .items
                                                                        .length -
                                                                        1
                                                                        ? field.label +
                                                                          ' -'
                                                                        : field.label}
                                                                    {displayDescription(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ) && (
                                                                        <SeaLogsButton
                                                                            icon="alert"
                                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                            action={() => {
                                                                                setDescriptionPanelContent(
                                                                                    displayDescription(
                                                                                        field.name,
                                                                                        logBookConfig,
                                                                                    ),
                                                                                )
                                                                                setOpenDescriptionPanel(
                                                                                    true,
                                                                                )
                                                                                setDescriptionPanelHeading(
                                                                                    field.name,
                                                                                )
                                                                            }}
                                                                        />
                                                                    )}{' '}
                                                                </span>
                                                            ),
                                                        )}
                                                    {displayDescription(
                                                        groupField.name,
                                                        logBookConfig,
                                                    ) && (
                                                        <SeaLogsButton
                                                            icon="alert"
                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                            action={() => {
                                                                setDescriptionPanelContent(
                                                                    displayDescription(
                                                                        groupField.name,
                                                                        logBookConfig,
                                                                    ),
                                                                )
                                                                setOpenDescriptionPanel(
                                                                    true,
                                                                )
                                                                setDescriptionPanelHeading(
                                                                    groupField.name,
                                                                )
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex flex-row">
                                                    <DailyCheckGroupField
                                                        locked={
                                                            locked ||
                                                            !edit_logBookEntry
                                                        }
                                                        groupField={groupField?.items?.filter(
                                                            (field: any) =>
                                                                displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                ),
                                                        )}
                                                        handleYesChange={() =>
                                                            handleGroupYesChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        handleNoChange={() =>
                                                            handleGroupNoChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        defaultNoChecked={groupField?.items
                                                            ?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            )
                                                            ?.every(
                                                                (field: any) =>
                                                                    field.checked ===
                                                                    'Not_Ok',
                                                            )}
                                                        defaultYesChecked={groupField?.items
                                                            ?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            )
                                                            ?.every(
                                                                (field: any) =>
                                                                    field.checked ===
                                                                    'Ok',
                                                            )}
                                                        commentAction={() =>
                                                            showCommentPopup(
                                                                getComment(
                                                                    groupField.name,
                                                                ),
                                                                composeField(
                                                                    groupField.name,
                                                                    logBookConfig,
                                                                ),
                                                            )
                                                        }
                                                        comment={
                                                            getComment(
                                                                groupField.name,
                                                            )?.comment
                                                        }
                                                    />
                                                    {groupField?.items?.map(
                                                        (
                                                            field: any,
                                                            index: number,
                                                        ) => (
                                                            <DailyCheckField
                                                                locked={
                                                                    locked ||
                                                                    !edit_logBookEntry
                                                                }
                                                                className={`lg:!grid-cols-2 hidden`}
                                                                innerWrapperClassName={`lg:!col-span-1`}
                                                                key={index}
                                                                displayField={displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayDescription={displayDescription(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayLabel={getFieldLabel(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                inputId={
                                                                    field.value
                                                                }
                                                                handleNoChange={() =>
                                                                    handleEngineChecks(
                                                                        false,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultNoChecked={
                                                                    field.checked ===
                                                                    'Not_Ok'
                                                                }
                                                                handleYesChange={() =>
                                                                    handleEngineChecks(
                                                                        true,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultYesChecked={
                                                                    field.checked ===
                                                                    'Ok'
                                                                }
                                                                commentAction={() =>
                                                                    showCommentPopup(
                                                                        getComment(
                                                                            field.name,
                                                                        ),
                                                                        composeField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                    )
                                                                }
                                                                comment={
                                                                    getComment(
                                                                        field.name,
                                                                    )?.comment
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {getFilteredFields(
                                    preElectricalVisualFields,
                                    true,
                                    logBookConfig,
                                )
                                    ?.filter((groupField: any) =>
                                        displayField(
                                            groupField.name,
                                            logBookConfig,
                                        ),
                                    )
                                    ?.map((groupField: any) => (
                                        <div key={groupField.name} className="">
                                            <div className="flex flex-row gap-2 my-2 text-left items-center justify-between">
                                                <div className="flex flex-wrap">
                                                    {groupField?.items
                                                        ?.filter((field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                        ?.map(
                                                            (
                                                                field: any,
                                                                index: number,
                                                            ) => (
                                                                <span
                                                                    key={`${field.label}-${index}`}
                                                                    className="text-sm lg:text-base">
                                                                    {index <
                                                                    groupField
                                                                        .items
                                                                        .length -
                                                                        1
                                                                        ? field.label +
                                                                          ' -'
                                                                        : field.label}
                                                                    {displayDescription(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ) && (
                                                                        <SeaLogsButton
                                                                            icon="alert"
                                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                            action={() => {
                                                                                setDescriptionPanelContent(
                                                                                    displayDescription(
                                                                                        field.name,
                                                                                        logBookConfig,
                                                                                    ),
                                                                                )
                                                                                setOpenDescriptionPanel(
                                                                                    true,
                                                                                )
                                                                                setDescriptionPanelHeading(
                                                                                    field.name,
                                                                                )
                                                                            }}
                                                                        />
                                                                    )}{' '}
                                                                </span>
                                                            ),
                                                        )}
                                                    {displayDescription(
                                                        groupField.name,
                                                        logBookConfig,
                                                    ) && (
                                                        <SeaLogsButton
                                                            icon="alert"
                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                            action={() => {
                                                                setDescriptionPanelContent(
                                                                    displayDescription(
                                                                        groupField.name,
                                                                        logBookConfig,
                                                                    ),
                                                                )
                                                                setOpenDescriptionPanel(
                                                                    true,
                                                                )
                                                                setDescriptionPanelHeading(
                                                                    groupField.name,
                                                                )
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="md:col-span-2">
                                                    <DailyCheckGroupField
                                                        locked={
                                                            locked ||
                                                            !edit_logBookEntry
                                                        }
                                                        groupField={groupField?.items?.filter(
                                                            (field: any) =>
                                                                displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                ),
                                                        )}
                                                        handleYesChange={() =>
                                                            handleGroupYesChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        handleNoChange={() =>
                                                            handleGroupNoChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        defaultNoChecked={groupField?.items
                                                            ?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            )
                                                            ?.every(
                                                                (field: any) =>
                                                                    field.checked ===
                                                                    'Not_Ok',
                                                            )}
                                                        defaultYesChecked={groupField?.items
                                                            ?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            )
                                                            ?.every(
                                                                (field: any) =>
                                                                    field.checked ===
                                                                    'Ok',
                                                            )}
                                                        commentAction={() =>
                                                            showCommentPopup(
                                                                getComment(
                                                                    groupField.name,
                                                                ),
                                                                composeField(
                                                                    groupField.name,
                                                                    logBookConfig,
                                                                ),
                                                            )
                                                        }
                                                        comment={
                                                            getComment(
                                                                groupField.name,
                                                            )?.comment
                                                        }
                                                    />
                                                    {groupField?.items?.map(
                                                        (
                                                            field: any,
                                                            index: number,
                                                        ) => (
                                                            <DailyCheckField
                                                                locked={
                                                                    locked ||
                                                                    !edit_logBookEntry
                                                                }
                                                                className={`lg:!grid-cols-2 hidden`}
                                                                innerWrapperClassName={`lg:!col-span-1`}
                                                                key={index}
                                                                displayField={displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayDescription={displayDescription(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayLabel={getFieldLabel(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                inputId={
                                                                    field.value
                                                                }
                                                                handleNoChange={() =>
                                                                    handleEngineChecks(
                                                                        false,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultNoChecked={
                                                                    field.checked ===
                                                                    'Not_Ok'
                                                                }
                                                                handleYesChange={() =>
                                                                    handleEngineChecks(
                                                                        true,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultYesChecked={
                                                                    field.checked ===
                                                                    'Ok'
                                                                }
                                                                commentAction={() =>
                                                                    showCommentPopup(
                                                                        getComment(
                                                                            field.name,
                                                                        ),
                                                                        composeField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                    )
                                                                }
                                                                comment={
                                                                    getComment(
                                                                        field.name,
                                                                    )?.comment
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                <CustomDailyCheckField
                                    locked={locked || !edit_logBookEntry}
                                    displayField={displayField(
                                        'Generator',
                                        logBookConfig,
                                    )}
                                    displayDescription={displayDescription(
                                        'Generator',
                                        logBookConfig,
                                    )}
                                    setDescriptionPanelContent={
                                        setDescriptionPanelContent
                                    }
                                    setOpenDescriptionPanel={
                                        setOpenDescriptionPanel
                                    }
                                    setDescriptionPanelHeading={
                                        setDescriptionPanelHeading
                                    }
                                    displayLabel={
                                        'Generator is working as expected'
                                    }
                                    className="flex"
                                    inputId={'generator'}
                                    handleNoChange={() =>
                                        handleEngineChecks(false, 'generator')
                                    }
                                    defaultNoChecked={
                                        vesselDailyCheck?.generator === 'Not_Ok'
                                    }
                                    handleYesChange={() =>
                                        handleEngineChecks(true, 'generator')
                                    }
                                    defaultYesChecked={
                                        vesselDailyCheck?.generator === 'Ok'
                                    }
                                    commentAction={() =>
                                        showCommentPopup(
                                            getComment('Generator'),
                                            composeField(
                                                'Generator',
                                                logBookConfig,
                                            ),
                                        )
                                    }
                                    comment={getComment('Generator')?.comment}
                                />
                                <CustomDailyCheckField
                                    locked={locked || !edit_logBookEntry}
                                    displayField={displayField(
                                        'ShorePower',
                                        logBookConfig,
                                    )}
                                    displayDescription={displayDescription(
                                        'ShorePower',
                                        logBookConfig,
                                    )}
                                    setDescriptionPanelContent={
                                        setDescriptionPanelContent
                                    }
                                    setOpenDescriptionPanel={
                                        setOpenDescriptionPanel
                                    }
                                    setDescriptionPanelHeading={
                                        setDescriptionPanelHeading
                                    }
                                    displayLabel={'Shore power is disconnected'}
                                    className={'flex'}
                                    inputId={'shorePower'}
                                    handleNoChange={() =>
                                        handleEngineChecks(false, 'shorePower')
                                    }
                                    defaultNoChecked={
                                        vesselDailyCheck?.shorePower ===
                                        'Not_Ok'
                                    }
                                    handleYesChange={() =>
                                        handleEngineChecks(true, 'shorePower')
                                    }
                                    defaultYesChecked={
                                        vesselDailyCheck?.shorePower === 'Ok'
                                    }
                                    commentAction={() =>
                                        showCommentPopup(
                                            getComment('ShorePower'),
                                            composeField(
                                                'ShorePower',
                                                logBookConfig,
                                            ),
                                        )
                                    }
                                    comment={getComment('ShorePower')?.comment}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <></>
                )}
                {getFilteredFields(preFields, true, logBookConfig)?.filter(
                    (groupField: any) =>
                        displayField(groupField.name, logBookConfig),
                ).length > 0 && (
                    <>
                        <hr className="my-6" />
                        <div className="mt-6 text-sm font-semibold uppercase text-left">
                            Steering
                        </div>
                        {logBookConfig && vesselDailyCheck && (
                            <div className="flex flex-col">
                                {getFilteredFields(
                                    preFields,
                                    true,
                                    logBookConfig,
                                )
                                    ?.filter((groupField: any) =>
                                        displayField(
                                            groupField.name,
                                            logBookConfig,
                                        ),
                                    )
                                    ?.map((groupField: any) => (
                                        <div key={groupField.name} className="">
                                            <div className="flex flex-row gap-2 my-2 text-left items-center justify-between">
                                                <div className="flex-wrap">
                                                    {groupField?.items
                                                        ?.filter((field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                        ?.map(
                                                            (
                                                                field: any,
                                                                index: number,
                                                            ) => (
                                                                <span
                                                                    key={`${field.label}-${index}`}
                                                                    className="text-sm lg:text-base">
                                                                    {index <
                                                                    groupField
                                                                        .items
                                                                        .length -
                                                                        1
                                                                        ? field.label +
                                                                          ' -'
                                                                        : field.label}
                                                                    {displayDescription(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ) && (
                                                                        <SeaLogsButton
                                                                            icon="alert"
                                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                            action={() => {
                                                                                setDescriptionPanelContent(
                                                                                    displayDescription(
                                                                                        field.name,
                                                                                        logBookConfig,
                                                                                    ),
                                                                                )
                                                                                setOpenDescriptionPanel(
                                                                                    true,
                                                                                )
                                                                                setDescriptionPanelHeading(
                                                                                    field.name,
                                                                                )
                                                                            }}
                                                                        />
                                                                    )}{' '}
                                                                </span>
                                                            ),
                                                        )}
                                                    {displayDescription(
                                                        groupField.name,
                                                        logBookConfig,
                                                    ) && (
                                                        <SeaLogsButton
                                                            icon="alert"
                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                            action={() => {
                                                                setDescriptionPanelContent(
                                                                    displayDescription(
                                                                        groupField.name,
                                                                        logBookConfig,
                                                                    ),
                                                                )
                                                                setOpenDescriptionPanel(
                                                                    true,
                                                                )
                                                                setDescriptionPanelHeading(
                                                                    groupField.name,
                                                                )
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex flex-row">
                                                    <DailyCheckGroupField
                                                        locked={
                                                            locked ||
                                                            !edit_logBookEntry
                                                        }
                                                        groupField={groupField?.items?.filter(
                                                            (field: any) =>
                                                                displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                ),
                                                        )}
                                                        handleYesChange={() =>
                                                            handleGroupYesChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        handleNoChange={() =>
                                                            handleGroupNoChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        defaultNoChecked={groupField?.items
                                                            ?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            )
                                                            ?.every(
                                                                (field: any) =>
                                                                    field.checked ===
                                                                    'Not_Ok',
                                                            )}
                                                        defaultYesChecked={groupField?.items
                                                            ?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            )
                                                            ?.every(
                                                                (field: any) =>
                                                                    field.checked ===
                                                                    'Ok',
                                                            )}
                                                        commentAction={() =>
                                                            showCommentPopup(
                                                                getComment(
                                                                    groupField.name,
                                                                ),
                                                                composeField(
                                                                    groupField.name,
                                                                    logBookConfig,
                                                                ),
                                                            )
                                                        }
                                                        comment={
                                                            getComment(
                                                                groupField.name,
                                                            )?.comment
                                                        }
                                                    />
                                                    {groupField?.items?.map(
                                                        (
                                                            field: any,
                                                            index: number,
                                                        ) => (
                                                            <DailyCheckField
                                                                locked={
                                                                    locked ||
                                                                    !edit_logBookEntry
                                                                }
                                                                className={`lg:!grid-cols-2 hidden`}
                                                                innerWrapperClassName={`lg:!col-span-1`}
                                                                key={index}
                                                                displayField={displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayDescription={displayDescription(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayLabel={getFieldLabel(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                inputId={
                                                                    field.value
                                                                }
                                                                handleNoChange={() =>
                                                                    handleEngineChecks(
                                                                        false,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultNoChecked={
                                                                    field.checked ===
                                                                    'Not_Ok'
                                                                }
                                                                handleYesChange={() =>
                                                                    handleEngineChecks(
                                                                        true,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultYesChecked={
                                                                    field.checked ===
                                                                    'Ok'
                                                                }
                                                                commentAction={() =>
                                                                    showCommentPopup(
                                                                        getComment(
                                                                            field.name,
                                                                        ),
                                                                        composeField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                    )
                                                                }
                                                                comment={
                                                                    getComment(
                                                                        field.name,
                                                                    )?.comment
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <Button
                className={`${tab === 'post-startup' ? classes.active : classes.inactive} uppercase whitespace-nowrap block lg:hidden`}
                onPress={() => {
                    tab === 'post-startup'
                        ? changeTab('')
                        : changeTab('post-startup')
                }}>
                Post-startup checks
            </Button>
            <div className={`${tab === 'post-startup' ? '' : 'hidden'} `}>
                {getFilteredFields(
                    postEngineFields,
                    true,
                    logBookConfig,
                )?.filter((groupField: any) =>
                    displayField(groupField.name, logBookConfig),
                ).length > 0 ||
                getFilteredFields(
                    postEngineStrainersFields,
                    true,
                    logBookConfig,
                )?.filter((groupField: any) =>
                    displayField(groupField.name, logBookConfig),
                ).length > 0 ||
                displayField('ForwardReverse', logBookConfig) ? (
                    <>
                        <div className="mt-6 text-sm font-semibold uppercase text-left">
                            Engine and propulsion
                        </div>
                        {logBookConfig && vesselDailyCheck && (
                            <div className="flex flex-col">
                                {getFilteredFields(
                                    postEngineFields,
                                    true,
                                    logBookConfig,
                                )
                                    ?.filter((groupField: any) =>
                                        displayField(
                                            groupField.name,
                                            logBookConfig,
                                        ),
                                    )
                                    ?.map((groupField: any) => (
                                        <div key={groupField.name} className="">
                                            <div className="flex flex-row gap-2 my-2 text-left items-center justify-between">
                                                <div className="w-1/2">
                                                    {groupField?.items
                                                        ?.filter((field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                        ?.map(
                                                            (
                                                                field: any,
                                                                index: number,
                                                            ) => (
                                                                <span
                                                                    key={`${field.label}-${index}`}
                                                                    className="text-sm lg:text-base">
                                                                    {index <
                                                                    groupField
                                                                        .items
                                                                        .length -
                                                                        1
                                                                        ? field.label +
                                                                          ' -'
                                                                        : field.label}
                                                                    {displayDescription(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ) && (
                                                                        <SeaLogsButton
                                                                            icon="alert"
                                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                            action={() => {
                                                                                setDescriptionPanelContent(
                                                                                    displayDescription(
                                                                                        field.name,
                                                                                        logBookConfig,
                                                                                    ),
                                                                                )
                                                                                setOpenDescriptionPanel(
                                                                                    true,
                                                                                )
                                                                                setDescriptionPanelHeading(
                                                                                    field.name,
                                                                                )
                                                                            }}
                                                                        />
                                                                    )}{' '}
                                                                </span>
                                                            ),
                                                        )}
                                                    {displayDescription(
                                                        groupField.name,
                                                        logBookConfig,
                                                    ) && (
                                                        <SeaLogsButton
                                                            icon="alert"
                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                            action={() => {
                                                                setDescriptionPanelContent(
                                                                    displayDescription(
                                                                        groupField.name,
                                                                        logBookConfig,
                                                                    ),
                                                                )
                                                                setOpenDescriptionPanel(
                                                                    true,
                                                                )
                                                                setDescriptionPanelHeading(
                                                                    groupField.name,
                                                                )
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex">
                                                    <DailyCheckGroupField
                                                        locked={
                                                            locked ||
                                                            !edit_logBookEntry
                                                        }
                                                        groupField={groupField?.items?.filter(
                                                            (field: any) =>
                                                                displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                ),
                                                        )}
                                                        handleYesChange={() =>
                                                            handleGroupYesChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        handleNoChange={() =>
                                                            handleGroupNoChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        defaultNoChecked={groupField?.items
                                                            ?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            )
                                                            ?.every(
                                                                (field: any) =>
                                                                    field.checked ===
                                                                    'Not_Ok',
                                                            )}
                                                        defaultYesChecked={groupField?.items
                                                            ?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            )
                                                            ?.every(
                                                                (field: any) =>
                                                                    field.checked ===
                                                                    'Ok',
                                                            )}
                                                        commentAction={() =>
                                                            showCommentPopup(
                                                                getComment(
                                                                    groupField.name,
                                                                ),
                                                                composeField(
                                                                    groupField.name,
                                                                    logBookConfig,
                                                                ),
                                                            )
                                                        }
                                                        comment={
                                                            getComment(
                                                                groupField.name,
                                                            )?.comment
                                                        }
                                                    />
                                                    {groupField?.items?.map(
                                                        (
                                                            field: any,
                                                            index: number,
                                                        ) => (
                                                            <DailyCheckField
                                                                locked={
                                                                    locked ||
                                                                    !edit_logBookEntry
                                                                }
                                                                className={`lg:!grid-cols-2 hidden`}
                                                                innerWrapperClassName={`lg:!col-span-1`}
                                                                key={index}
                                                                displayField={displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayDescription={displayDescription(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayLabel={getFieldLabel(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                inputId={
                                                                    field.value
                                                                }
                                                                handleNoChange={() =>
                                                                    handleEngineChecks(
                                                                        false,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultNoChecked={
                                                                    field.checked ===
                                                                    'Not_Ok'
                                                                }
                                                                handleYesChange={() =>
                                                                    handleEngineChecks(
                                                                        true,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultYesChecked={
                                                                    field.checked ===
                                                                    'Ok'
                                                                }
                                                                commentAction={() =>
                                                                    showCommentPopup(
                                                                        getComment(
                                                                            field.name,
                                                                        ),
                                                                        composeField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                    )
                                                                }
                                                                comment={
                                                                    getComment(
                                                                        field.name,
                                                                    )?.comment
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {getFilteredFields(
                                    postEngineStrainersFields,
                                    true,
                                    logBookConfig,
                                )
                                    ?.filter((groupField: any) =>
                                        displayField(
                                            groupField.name,
                                            logBookConfig,
                                        ),
                                    )
                                    ?.map((groupField: any) => (
                                        <div key={groupField.name} className="">
                                            <div className="flex flex-row gap-2 my-2 text-left items-center justify-between">
                                                <div className="w-1/2">
                                                    {groupField?.items
                                                        ?.filter((field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                        ?.map(
                                                            (
                                                                field: any,
                                                                index: number,
                                                            ) => (
                                                                <span
                                                                    key={`${field.label}-${index}`}
                                                                    className="text-sm lg:text-base">
                                                                    {index <
                                                                    groupField
                                                                        .items
                                                                        .length -
                                                                        1
                                                                        ? field.label +
                                                                          ' -'
                                                                        : field.label}
                                                                    {displayDescription(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ) && (
                                                                        <SeaLogsButton
                                                                            icon="alert"
                                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                            action={() => {
                                                                                setDescriptionPanelContent(
                                                                                    displayDescription(
                                                                                        field.name,
                                                                                        logBookConfig,
                                                                                    ),
                                                                                )
                                                                                setOpenDescriptionPanel(
                                                                                    true,
                                                                                )
                                                                                setDescriptionPanelHeading(
                                                                                    field.name,
                                                                                )
                                                                            }}
                                                                        />
                                                                    )}{' '}
                                                                </span>
                                                            ),
                                                        )}
                                                    {displayDescription(
                                                        groupField.name,
                                                        logBookConfig,
                                                    ) && (
                                                        <SeaLogsButton
                                                            icon="alert"
                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                            action={() => {
                                                                setDescriptionPanelContent(
                                                                    displayDescription(
                                                                        groupField.name,
                                                                        logBookConfig,
                                                                    ),
                                                                )
                                                                setOpenDescriptionPanel(
                                                                    true,
                                                                )
                                                                setDescriptionPanelHeading(
                                                                    groupField.name,
                                                                )
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex text-left">
                                                    <DailyCheckGroupField
                                                        locked={
                                                            locked ||
                                                            !edit_logBookEntry
                                                        }
                                                        groupField={groupField?.items?.filter(
                                                            (field: any) =>
                                                                displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                ),
                                                        )}
                                                        handleYesChange={() =>
                                                            handleGroupYesChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        handleNoChange={() =>
                                                            handleGroupNoChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        defaultNoChecked={groupField?.items
                                                            ?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            )
                                                            ?.every(
                                                                (field: any) =>
                                                                    field.checked ===
                                                                    'Not_Ok',
                                                            )}
                                                        defaultYesChecked={groupField?.items
                                                            ?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            )
                                                            ?.every(
                                                                (field: any) =>
                                                                    field.checked ===
                                                                    'Ok',
                                                            )}
                                                        commentAction={() =>
                                                            showCommentPopup(
                                                                getComment(
                                                                    groupField.name,
                                                                ),
                                                                composeField(
                                                                    groupField.name,
                                                                    logBookConfig,
                                                                ),
                                                            )
                                                        }
                                                        comment={
                                                            getComment(
                                                                groupField.name,
                                                            )?.comment
                                                        }
                                                    />
                                                    {groupField?.items?.map(
                                                        (
                                                            field: any,
                                                            index: number,
                                                        ) => (
                                                            <DailyCheckField
                                                                locked={
                                                                    locked ||
                                                                    !edit_logBookEntry
                                                                }
                                                                className={`lg:!grid-cols-2 hidden`}
                                                                innerWrapperClassName={`lg:!col-span-1`}
                                                                key={index}
                                                                displayField={displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayDescription={displayDescription(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayLabel={getFieldLabel(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                inputId={
                                                                    field.value
                                                                }
                                                                handleNoChange={() =>
                                                                    handleEngineChecks(
                                                                        false,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultNoChecked={
                                                                    field.checked ===
                                                                    'Not_Ok'
                                                                }
                                                                handleYesChange={() =>
                                                                    handleEngineChecks(
                                                                        true,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultYesChecked={
                                                                    field.checked ===
                                                                    'Ok'
                                                                }
                                                                commentAction={() =>
                                                                    showCommentPopup(
                                                                        getComment(
                                                                            field.name,
                                                                        ),
                                                                        composeField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                    )
                                                                }
                                                                comment={
                                                                    getComment(
                                                                        field.name,
                                                                    )?.comment
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                <CustomDailyCheckField
                                    locked={locked || !edit_logBookEntry}
                                    displayField={displayField(
                                        'ForwardReverse',
                                        logBookConfig,
                                    )}
                                    displayDescription={displayDescription(
                                        'ForwardReverse',
                                        logBookConfig,
                                    )}
                                    setDescriptionPanelContent={
                                        setDescriptionPanelContent
                                    }
                                    setOpenDescriptionPanel={
                                        setOpenDescriptionPanel
                                    }
                                    setDescriptionPanelHeading={
                                        setDescriptionPanelHeading
                                    }
                                    displayLabel={
                                        'Gear shifting - forward/reverse/neutral'
                                    }
                                    inputId={'forwardReverse'}
                                    handleNoChange={() =>
                                        handleEngineChecks(
                                            false,
                                            'forwardReverse',
                                        )
                                    }
                                    defaultNoChecked={
                                        vesselDailyCheck?.forwardReverse ===
                                        'Not_Ok'
                                    }
                                    handleYesChange={() =>
                                        handleEngineChecks(
                                            true,
                                            'forwardReverse',
                                        )
                                    }
                                    defaultYesChecked={
                                        vesselDailyCheck?.forwardReverse ===
                                        'Ok'
                                    }
                                    commentAction={() =>
                                        showCommentPopup(
                                            getComment('ForwardReverse'),
                                            composeField(
                                                'ForwardReverse',
                                                logBookConfig,
                                            ),
                                        )
                                    }
                                    comment={
                                        getComment('ForwardReverse')?.comment
                                    }
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <></>
                )}
                {getFilteredFields(
                    postElectricalFields,
                    true,
                    logBookConfig,
                )?.filter((groupField: any) =>
                    displayField(groupField.name, logBookConfig),
                ).length > 0 && (
                    <>
                        <hr className="my-6" />
                        <div className="my-4 text-sm font-semibold uppercase text-left">
                            Electrical
                        </div>
                        {logBookConfig && vesselDailyCheck && (
                            <div className="flex flex-col text-left">
                                {getFilteredFields(
                                    postElectricalFields,
                                    true,
                                    logBookConfig,
                                )
                                    ?.filter((groupField: any) =>
                                        displayField(
                                            groupField.name,
                                            logBookConfig,
                                        ),
                                    )

                                    ?.map((groupField: any) => (
                                        <div key={groupField.name} className="">
                                            <div className="flex flex-row gap-2 items-center justify-between">
                                                <div className="w-1/2">
                                                    {groupField?.items
                                                        ?.filter((field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                        ?.map(
                                                            (
                                                                field: any,
                                                                index: number,
                                                            ) => (
                                                                <span
                                                                    key={`${field.label}-${index}`}
                                                                    className="text-sm lg:text-base">
                                                                    {index <
                                                                    groupField
                                                                        .items
                                                                        .length -
                                                                        1
                                                                        ? field.label +
                                                                          ' -'
                                                                        : field.label}
                                                                    {displayDescription(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ) && (
                                                                        <SeaLogsButton
                                                                            icon="alert"
                                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                            action={() => {
                                                                                setDescriptionPanelContent(
                                                                                    displayDescription(
                                                                                        field.name,
                                                                                        logBookConfig,
                                                                                    ),
                                                                                )
                                                                                setOpenDescriptionPanel(
                                                                                    true,
                                                                                )
                                                                                setDescriptionPanelHeading(
                                                                                    field.name,
                                                                                )
                                                                            }}
                                                                        />
                                                                    )}{' '}
                                                                </span>
                                                            ),
                                                        )}
                                                    {displayDescription(
                                                        groupField.name,
                                                        logBookConfig,
                                                    ) && (
                                                        <SeaLogsButton
                                                            icon="alert"
                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                            action={() => {
                                                                setDescriptionPanelContent(
                                                                    displayDescription(
                                                                        groupField.name,
                                                                        logBookConfig,
                                                                    ),
                                                                )
                                                                setOpenDescriptionPanel(
                                                                    true,
                                                                )
                                                                setDescriptionPanelHeading(
                                                                    groupField.name,
                                                                )
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="">
                                                    <DailyCheckGroupField
                                                        locked={
                                                            locked ||
                                                            !edit_logBookEntry
                                                        }
                                                        groupField={groupField?.items?.filter(
                                                            (field: any) =>
                                                                displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                ),
                                                        )}
                                                        handleYesChange={() =>
                                                            handleGroupYesChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        handleNoChange={() =>
                                                            handleGroupNoChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        defaultNoChecked={groupField?.items
                                                            ?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            )
                                                            ?.every(
                                                                (field: any) =>
                                                                    field.checked ===
                                                                    'Not_Ok',
                                                            )}
                                                        defaultYesChecked={groupField?.items
                                                            ?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            )
                                                            ?.every(
                                                                (field: any) =>
                                                                    field.checked ===
                                                                    'Ok',
                                                            )}
                                                        commentAction={() =>
                                                            showCommentPopup(
                                                                getComment(
                                                                    groupField.name,
                                                                ),
                                                                composeField(
                                                                    groupField.name,
                                                                    logBookConfig,
                                                                ),
                                                            )
                                                        }
                                                        comment={
                                                            getComment(
                                                                groupField.name,
                                                            )?.comment
                                                        }
                                                    />
                                                    {groupField?.items?.map(
                                                        (
                                                            field: any,
                                                            index: number,
                                                        ) => (
                                                            <DailyCheckField
                                                                locked={
                                                                    locked ||
                                                                    !edit_logBookEntry
                                                                }
                                                                className={`lg:!grid-cols-2 hidden`}
                                                                innerWrapperClassName={`lg:!col-span-1`}
                                                                key={index}
                                                                displayField={displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayDescription={displayDescription(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayLabel={getFieldLabel(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                inputId={
                                                                    field.value
                                                                }
                                                                handleNoChange={() =>
                                                                    handleEngineChecks(
                                                                        false,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultNoChecked={
                                                                    field.checked ===
                                                                    'Not_Ok'
                                                                }
                                                                handleYesChange={() =>
                                                                    handleEngineChecks(
                                                                        true,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultYesChecked={
                                                                    field.checked ===
                                                                    'Ok'
                                                                }
                                                                commentAction={() =>
                                                                    showCommentPopup(
                                                                        getComment(
                                                                            field.name,
                                                                        ),
                                                                        composeField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                    )
                                                                }
                                                                comment={
                                                                    getComment(
                                                                        field.name,
                                                                    )?.comment
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </>
                )}
                {getFilteredFields(
                    postSteeringFields,
                    true,
                    logBookConfig,
                )?.filter((groupField: any) =>
                    displayField(groupField.name, logBookConfig),
                ).length > 0 && (
                    <>
                        <hr className="my-6" />
                        <div className="my-4 text-sm font-semibold uppercase text-left">
                            Steering
                        </div>
                        {logBookConfig && vesselDailyCheck && (
                            <div className="flex flex-col">
                                {getFilteredFields(
                                    postSteeringFields,
                                    true,
                                    logBookConfig,
                                )
                                    ?.filter((groupField: any) =>
                                        displayField(
                                            groupField.name,
                                            logBookConfig,
                                        ),
                                    )
                                    ?.map((groupField: any) => (
                                        <div key={groupField.name} className="">
                                            <div className="flex flex-row gap-2 my-2 text-left items-center justify-between">
                                                <div className="w-1/2">
                                                    {groupField?.items
                                                        ?.filter((field: any) =>
                                                            displayField(
                                                                field.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                        ?.map(
                                                            (
                                                                field: any,
                                                                index: number,
                                                            ) => (
                                                                <span
                                                                    key={`${field.label}-${index}`}
                                                                    className="text-sm lg:text-base">
                                                                    {index <
                                                                    groupField
                                                                        .items
                                                                        .length -
                                                                        1
                                                                        ? field.label +
                                                                          ' -'
                                                                        : field.label}
                                                                    {displayDescription(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ) && (
                                                                        <SeaLogsButton
                                                                            icon="alert"
                                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                            action={() => {
                                                                                setDescriptionPanelContent(
                                                                                    displayDescription(
                                                                                        field.name,
                                                                                        logBookConfig,
                                                                                    ),
                                                                                )
                                                                                setOpenDescriptionPanel(
                                                                                    true,
                                                                                )
                                                                                setDescriptionPanelHeading(
                                                                                    field.name,
                                                                                )
                                                                            }}
                                                                        />
                                                                    )}{' '}
                                                                </span>
                                                            ),
                                                        )}
                                                    {/* <SeaLogsButton
                                                    icon="alert"
                                                    className="w-6 h-6 sup -mt-2 ml-0.5"
                                                    action={() => {å
                                                        setDescriptionPanelContent(
                                                            displayDescription(
                                                                groupField.name,
                                                                logBookConfig,
                                                            ),
                                                        )
                                                        setOpenDescriptionPanel(
                                                            true,
                                                        )
                                                        setDescriptionPanelHeading(
                                                            groupField.name,
                                                        )
                                                    }}
                                                /> */}
                                                </div>
                                                <div className="flex">
                                                    <DailyCheckGroupField
                                                        locked={
                                                            locked ||
                                                            !edit_logBookEntry
                                                        }
                                                        groupField={groupField?.items?.filter(
                                                            (field: any) =>
                                                                displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                ),
                                                        )}
                                                        handleYesChange={() =>
                                                            handleGroupYesChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        handleNoChange={() =>
                                                            handleGroupNoChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        defaultNoChecked={groupField?.items
                                                            ?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            )
                                                            ?.every(
                                                                (field: any) =>
                                                                    field.checked ===
                                                                    'Not_Ok',
                                                            )}
                                                        defaultYesChecked={groupField?.items
                                                            ?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            )
                                                            ?.every(
                                                                (field: any) =>
                                                                    field.checked ===
                                                                    'Ok',
                                                            )}
                                                        commentAction={() =>
                                                            showCommentPopup(
                                                                getComment(
                                                                    groupField.name,
                                                                ),
                                                                composeField(
                                                                    groupField.name,
                                                                    logBookConfig,
                                                                ),
                                                            )
                                                        }
                                                        comment={
                                                            getComment(
                                                                groupField.name,
                                                            )?.comment
                                                        }
                                                    />
                                                    {groupField?.items?.map(
                                                        (
                                                            field: any,
                                                            index: number,
                                                        ) => (
                                                            <DailyCheckField
                                                                locked={
                                                                    locked ||
                                                                    !edit_logBookEntry
                                                                }
                                                                className={`lg:!grid-cols-2 hidden`}
                                                                innerWrapperClassName={`lg:!col-span-1`}
                                                                key={index}
                                                                displayField={displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayDescription={displayDescription(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayLabel={getFieldLabel(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                inputId={
                                                                    field.value
                                                                }
                                                                handleNoChange={() =>
                                                                    handleEngineChecks(
                                                                        false,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultNoChecked={
                                                                    field.checked ===
                                                                    'Not_Ok'
                                                                }
                                                                handleYesChange={() =>
                                                                    handleEngineChecks(
                                                                        true,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultYesChecked={
                                                                    field.checked ===
                                                                    'Ok'
                                                                }
                                                                commentAction={() =>
                                                                    showCommentPopup(
                                                                        getComment(
                                                                            field.name,
                                                                        ),
                                                                        composeField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                    )
                                                                }
                                                                comment={
                                                                    getComment(
                                                                        field.name,
                                                                    )?.comment
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            {(!locked || edit_logBookEntry) && (
                <FooterWrapper>
                    {' '}
                    <SeaLogsButton
                        text="Cancel"
                        type="text"
                        action={() => router.back()}
                    />{' '}
                    <SeaLogsButton
                        text="Create Task"
                        type="secondary"
                        color="slblue"
                        icon="check"
                        action={handleCreateTask}
                        isDisabled={createMaintenanceCheckLoading}
                    />
                    <SeaLogsButton
                        text="Save"
                        type="primary"
                        color="sky"
                        icon="check"
                        action={handleSave}
                    />{' '}
                </FooterWrapper>
            )}
            <AlertDialog
                openDialog={openCommentAlert}
                setOpenDialog={setOpenCommentAlert}
                handleCreate={handleSaveComment}
                actionText="Save">
                <div
                    className={`flex flex-col ${locked || !edit_logBookEntry ? 'pointer-events-none' : ''}`}>
                    <textarea
                        id="comment"
                        readOnly={locked || !edit_logBookEntry}
                        rows={4}
                        className="block p-2.5 w-full mt-4 text-sm text-slblue-900 bg-slblue-50 rounded-lg border border-slblue-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-slblue-700 dark:border-white dark:placeholder-slblue-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Comment"
                        defaultValue={
                            currentComment ? currentComment.comment : ''
                        }></textarea>
                </div>
            </AlertDialog>
            <SlidingPanel type={'left'} isOpen={openDescriptionPanel} size={40}>
                <div className="h-[calc(100vh_-_1rem)] pt-4">
                    {openDescriptionPanel && (
                        <div className="bg-sllightblue-50 h-full flex flex-col justify-between rounded-r-lg">
                            <div className="text-xl dark:text-white text-white items-center flex justify-between font-medium py-4 px-6 rounded-tr-lg bg-slblue-1000">
                                <Heading
                                    slot="title"
                                    className="text-lg font-semibold leading-6 my-2 text-white dark:text-slblue-200">
                                    Field -{' '}
                                    <span className="font-thin">
                                        {descriptionPanelHeading}
                                    </span>
                                </Heading>
                                <XMarkIcon
                                    className="w-6 h-6"
                                    onClick={() => {
                                        setOpenDescriptionPanel(false)
                                        setDescriptionPanelContent('')
                                        setDescriptionPanelHeading('')
                                    }}
                                />
                            </div>

                            <div className="text-xl p-4 flex-grow overflow-scroll ql-container">
                                <div className="ql-editor">
                                    <div
                                        className="text-xs leading-loose font-light"
                                        dangerouslySetInnerHTML={{
                                            __html: descriptionPanelContent,
                                        }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SlidingPanel>
            <Toaster position="top-right" />
        </div>
    )
}
