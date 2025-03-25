'use client'
import React, { useEffect, useState } from 'react'
import { Heading } from 'react-aria-components'
import { useMutation, useLazyQuery } from '@apollo/client'
import { UpdateVesselDailyCheck_LogBookEntrySection } from '@/app/lib/graphQL/mutation'
import {
    AlertDialog,
    DailyCheckField,
    FooterWrapper,
    SeaLogsButton,
    DailyCheckGroupField,
} from '@/app/components/Components'
import {
    GET_SECTION_MEMBER_COMMENTS,
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
    displayDescriptionIcon,
    getFieldLabel,
} from '@/app/ui/daily-checks/actions'
import { classes } from '@/app/components/GlobalClasses'
import SlidingPanel from 'react-sliding-side-panel'
import { XMarkIcon } from '@heroicons/react/24/outline'
import 'react-quill/dist/quill.snow.css'
import SectionMemberCommentModel from '@/app/offline/models/sectionMemberComment'
import VesselDailyCheck_LogBookEntrySectionModel from '@/app/offline/models/vesselDailyCheck_LogBookEntrySection'
import { generateUniqueId } from '@/app/offline/helpers/functions'

export default function PropulsionSteeringElectrical({
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
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const vesselID = searchParams.get('vesselID') ?? 0
    const logentryID = searchParams.get('logentryID') ?? 0
    const [saving, setSaving] = useState(false)
    const [openCommentAlert, setOpenCommentAlert] = useState(false)
    const [currentComment, setCurrentComment] = useState<any>('')
    const [currentField, setCurrentField] = useState<any>('')
    const [sectionComment, setSectionComment] = useState<any>('')
    const [additionalComment, setAdditionalComment] = useState<Boolean>(false)
    const [openDescriptionPanel, setOpenDescriptionPanel] = useState(false)
    const [descriptionPanelContent, setDescriptionPanelContent] = useState('')
    const [descriptionPanelHeading, setDescriptionPanelHeading] = useState('')

    const commentModel = new SectionMemberCommentModel()
    const dailyCheckModel = new VesselDailyCheck_LogBookEntrySectionModel()
    const handlePropulsionChecks = async (check: Boolean, value: any) => {
        if (+vesselDailyCheck?.id > 0) {
            const variables = {
                id: vesselDailyCheck.id,
                [value]: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await dailyCheckModel.save(variables)
                setVesselDailyCheck([data])
                setSaving(true)
            } else {
                updateVesselDailyCheck_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }

    const [updateVesselDailyCheck_LogBookEntrySection] = useMutation(
        UpdateVesselDailyCheck_LogBookEntrySection,
        {
            onCompleted: (response) => {
                console.log('Propulsion check completed')
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
                            fields,
                            logBookConfig,
                            vesselDailyCheck,
                            'Propulsion, Steering & Electrical',
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
                    fields,
                    logBookConfig,
                    vesselDailyCheck,
                    'Propulsion, Steering & Electrical',
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
        if (currentComment) {
            if (offline) {
                await commentModel.save(variables)
                loadSectionMemberComments()
            } else {
                updateSectionMemberComment({
                    variables: { input: variables },
                })
            }
        } else {
            if (offline) {
                const offlineID = generateUniqueId()
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
                console.log('Comment updated')
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
                console.log('Comment created')
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

    const fields = [
        {
            name: 'MainEngineChecks',
            label: 'Main Engine(s) checks: oil levels/pressure, general performance, overboard discharge',
            value: 'mainEngineChecks',
            sortOrder: getSortOrder('MainEngineChecks', logBookConfig),
            checked: vesselDailyCheck?.mainEngineChecks,
        },
        {
            name: 'ElectricalChecks',
            label: 'Electrical checks: battery levels, charging, connections, and alarms',
            value: 'electricalChecks',
            sortOrder: getSortOrder('ElectricalChecks', logBookConfig),
            checked: vesselDailyCheck?.electricalChecks,
        },
        {
            name: 'EngineRoomVisualInspection',
            label: 'Engine room visual inspection',
            value: 'engineRoomVisualInspection',
            sortOrder: getSortOrder(
                'EngineRoomVisualInspection',
                logBookConfig,
            ),
            checked: vesselDailyCheck?.engineRoomVisualInspection,
        },
        {
            name: 'FuelSystems',
            label: 'Fuel systems',
            value: 'fuelSystems',
            sortOrder: getSortOrder('FuelSystems', logBookConfig),
            checked: vesselDailyCheck?.fuelSystems,
        },
        {
            name: 'SteeringChecks',
            label: 'Steering Checks',
            value: 'steeringChecks',
            sortOrder: getSortOrder('SteeringChecks', logBookConfig),
            checked: vesselDailyCheck?.steeringChecks,
        },
        {
            name: 'ThrottleAndCableChecks',
            label: 'Throttle and cable checks',
            value: 'throttleAndCableChecks',
            sortOrder: getSortOrder('ThrottleAndCableChecks', logBookConfig),
            checked: vesselDailyCheck?.throttleAndCableChecks,
        },
        {
            name: 'OilAndWater',
            label: 'Machinery Oil and Water',
            value: 'oilAndWater',
            sortOrder: getSortOrder('OilAndWater', logBookConfig),
            checked: vesselDailyCheck?.oilAndWater,
        },
        {
            name: 'EngineRoomChecks',
            label: 'Engine Room Checks',
            value: 'engineRoomChecks',
            sortOrder: getSortOrder('EngineRoomChecks', logBookConfig),
            checked: vesselDailyCheck?.engineRoomChecks,
        },
        {
            name: 'EngineRoom',
            label: 'Engine Room ',
            value: 'engineRoom',
            sortOrder: getSortOrder('EngineRoom', logBookConfig),
            checked: vesselDailyCheck?.engineRoom,
        },
        {
            name: 'EngineMounts',
            label: 'Engine Mounts',
            value: 'engineMounts',
            sortOrder: getSortOrder('EngineMounts', logBookConfig),
            checked: vesselDailyCheck?.engineMounts,
        },
        {
            name: 'EngineOil',
            label: 'Engine Oil',
            value: 'engineOil',
            sortOrder: getSortOrder('EngineOil', logBookConfig),
            checked: vesselDailyCheck?.engineOil,
        },
        {
            name: 'EngineTellTale',
            label: 'Engine Tell Tale Signs',
            value: 'engineTellTale',
            sortOrder: getSortOrder('EngineTellTale', logBookConfig),
            checked: vesselDailyCheck?.engineTellTale,
        },
        {
            name: 'EngineIsFit',
            label: 'Engine Controls Tested',
            value: 'engineIsFit',
            sortOrder: getSortOrder('EngineIsFit', logBookConfig),
            checked: vesselDailyCheck?.engineIsFit,
        },
        {
            name: 'PropulsionEngineChecks',
            label: 'Engine Checks',
            value: 'propulsionEngineChecks',
            sortOrder: getSortOrder('PropulsionEngineChecks', logBookConfig),
            checked: vesselDailyCheck?.propulsionEngineChecks,
        },
        {
            name: 'FuelTanks',
            label: 'Fuel Tanks',
            value: 'fuelTanks',
            sortOrder: getSortOrder('FuelTanks', logBookConfig),
            checked: vesselDailyCheck?.fuelTanks,
        },
        {
            name: 'FuelFilters',
            label: 'Fuel Filters',
            value: 'fuelFilters',
            sortOrder: getSortOrder('FuelFilters', logBookConfig),
            checked: vesselDailyCheck?.fuelFilters,
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
            label: 'Steering Rams',
            value: 'steeringRams',
            sortOrder: getSortOrder('SteeringRams', logBookConfig),
            checked: vesselDailyCheck?.steeringRams,
        },
        {
            name: 'SteeringIsFit',
            label: 'Steering Checked',
            value: 'steeringIsFit',
            sortOrder: getSortOrder('SteeringIsFit', logBookConfig),
            checked: vesselDailyCheck?.steeringIsFit,
        },
        {
            name: 'Steering',
            label: 'Steering',
            value: 'steering',
            sortOrder: getSortOrder('Steering', logBookConfig),
            checked: vesselDailyCheck?.steering,
        },
        {
            name: 'CablesFRPullies',
            label: 'Cables & Pullies',
            value: 'cablesFRPullies',
            sortOrder: getSortOrder('CablesFRPullies', logBookConfig),
            checked: vesselDailyCheck?.cablesFRPullies,
        },
        {
            name: 'ThrottleAndCable',
            label: 'Throttle & Cable',
            value: 'throttleAndCable',
            sortOrder: getSortOrder('ThrottleAndCable', logBookConfig),
            checked: vesselDailyCheck?.throttleAndCable,
        },
        {
            name: 'SandTraps',
            label: 'Sand Traps',
            value: 'sandTraps',
            sortOrder: getSortOrder('SandTraps', logBookConfig),
            checked: vesselDailyCheck?.sandTraps,
        },
        {
            name: 'Wiring',
            label: 'Wiring',
            value: 'wiring',
            sortOrder: getSortOrder('Wiring', logBookConfig),
            checked: vesselDailyCheck?.wiring,
        },
        {
            name: 'BeltsHosesClamps',
            label: 'Belts, Hoses, Clamps and Fittings',
            value: 'beltsHosesClamps',
            sortOrder: getSortOrder('BeltsHosesClamps', logBookConfig),
            checked: vesselDailyCheck?.beltsHosesClamps,
        },
        {
            name: 'Generator',
            label: 'Generator',
            value: 'generator',
            sortOrder: getSortOrder('Generator', logBookConfig),
            checked: vesselDailyCheck?.generator,
        },
        {
            name: 'Transmission',
            label: 'Transmission/Gearbox, Propellers, Thrusters, Outboard/s, Sail Drive, Jet Unit, and Impellor checks',
            value: 'transmission',
            sortOrder: getSortOrder('Transmission', logBookConfig),
            checked: vesselDailyCheck?.transmission,
        },
        {
            name: 'PropulsionCheck',
            label: 'Test propulsion (forward/reverse) and trim tabs',
            value: 'propulsionCheck',
            sortOrder: getSortOrder('PropulsionCheck', logBookConfig),
            checked: vesselDailyCheck?.propulsionCheck,
        },
        {
            name: 'Exhaust',
            label: 'Exhaust system',
            value: 'exhaust',
            sortOrder: getSortOrder('Exhaust', logBookConfig),
            checked: vesselDailyCheck?.exhaust,
        },
        {
            name: 'Stabilizers',
            label: 'Inspect stabilizers',
            value: 'stabilizers',
            sortOrder: getSortOrder('Stabilizers', logBookConfig),
            checked: vesselDailyCheck?.stabilizers,
        },
        {
            name: 'PropulsionBatteriesStatus',
            label: 'Batteries, alternator, generator status',
            value: 'batteries',
            sortOrder: getSortOrder('PropulsionBatteriesStatus', logBookConfig),
            checked: vesselDailyCheck?.batteries,
        },
        {
            name: 'ShorePower',
            label: 'Shore power connection, solar panels/wind generators, inverter',
            value: 'shorePower',
            sortOrder: getSortOrder('ShorePower', logBookConfig),
            checked: vesselDailyCheck?.shorePower,
        },
        {
            name: 'ElectricalPanels',
            label: 'Test electrical panels, circuit breakers, and lighting (interior and exterior)',
            value: 'electricalPanels',
            sortOrder: getSortOrder('ElectricalPanels', logBookConfig),
            checked: vesselDailyCheck?.electricalPanels,
        },

        {
            name: 'SeaStrainers',
            label: 'Check Sea Strainers, Sea Valves, Tank levels (Blackwater, Freshwater)',
            value: 'seaStrainers',
            sortOrder: getSortOrder('SeaStrainers', logBookConfig),
            checked: vesselDailyCheck?.seaStrainers,
        },
        {
            name: 'AirShutoffs',
            label: 'Air Shutoffs',
            value: 'airShutoffs',
            sortOrder: getSortOrder('AirShutoffs', logBookConfig),
            checked: vesselDailyCheck?.airShutoffs,
        },
        {
            name: 'FireDampeners',
            label: 'Fire Dampeners',
            value: 'fireDampeners',
            sortOrder: getSortOrder('FireDampeners', logBookConfig),
            checked: vesselDailyCheck?.fireDampeners,
        },
        {
            name: 'CoolantLevels',
            label: 'Coolant Levels',
            value: 'CoolantLevels',
            sortOrder: getSortOrder('CoolantLevels', logBookConfig),
            checked: vesselDailyCheck?.coolantLevels,
        },
        {
            name: 'FuelShutoffs',
            label: 'Fuel Shutoffs',
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
            name: 'SteeringRudders',
            label: 'Steering Rudders',
            value: 'steeringRudders',
            sortOrder: getSortOrder('SteeringRudders', logBookConfig),
            checked: vesselDailyCheck?.steeringRudders,
        },
        {
            name: 'SteeringHoses',
            label: 'Steering Hoses',
            value: 'steeringHoses',
            sortOrder: getSortOrder('SteeringHoses', logBookConfig),
            checked: vesselDailyCheck?.steeringHoses,
        },
        {
            name: 'SteeringTillers',
            label: 'Steering Tillers',
            value: 'steeringTillers',
            sortOrder: getSortOrder('SteeringTillers', logBookConfig),
            checked: vesselDailyCheck?.steeringTillers,
        },
        {
            name: 'SteeringHydraulicSystems',
            label: 'Steering Hydraulic Systems',
            value: 'steeringHydraulicSystems',
            sortOrder: getSortOrder('SteeringHydraulicSystems', logBookConfig),
            checked: vesselDailyCheck?.steeringHydraulicSystems,
        },
        {
            name: 'OperationalTestsOfHelms',
            label: 'Operational Tests Of Helms',
            value: 'operationalTestsOfHelms',
            sortOrder: getSortOrder('OperationalTestsOfHelms', logBookConfig),
            checked: vesselDailyCheck?.operationalTestsOfHelms,
        },
        {
            name: 'DriveShaftsChecks',
            label: 'Drive Shafts Checks',
            value: 'driveShaftsChecks',
            sortOrder: getSortOrder('DriveShaftsChecks', logBookConfig),
            checked: vesselDailyCheck?.driveShaftsChecks,
        },
        {
            name: 'DriveShafts',
            label: 'Drive Shafts ',
            value: 'driveShafts',
            sortOrder: getSortOrder('DriveShafts', logBookConfig),
            checked: vesselDailyCheck?.driveShafts,
        },
        {
            name: 'GearBox',
            label: 'Gear Box',
            value: 'gearBox',
            sortOrder: getSortOrder('GearBox', logBookConfig),
            checked: vesselDailyCheck?.gearBox,
        },
        {
            name: 'Propellers',
            label: 'Propellers',
            value: 'propellers',
            sortOrder: getSortOrder('Propellers', logBookConfig),
            checked: vesselDailyCheck?.propellers,
        },
        {
            name: 'Skeg',
            label: 'Skeg',
            value: 'skeg',
            sortOrder: getSortOrder('Skeg', logBookConfig),
            checked: vesselDailyCheck?.skeg,
        },
        {
            name: 'Cooling',
            label: 'Cooling',
            value: 'cooling',
            sortOrder: getSortOrder('Cooling', logBookConfig),
            checked: vesselDailyCheck?.cooling,
        },
    ]

    const handleSave = async () => {
        if (+vesselDailyCheck.id > 0) {
            if (offline) {
                const data = await dailyCheckModel.getByIds([
                    vesselDailyCheck.id,
                ])
                setVesselDailyCheck(data)
                setSaving(true)
                if (vesselDailyCheck === data[0]) {
                    toast.dismiss()
                    toast.custom((t) =>
                        getDailyCheckNotification(
                            fields,
                            logBookConfig,
                            vesselDailyCheck,
                            'Propulsion, Steering & Electrical',
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
        }

        toast.loading('Saving Propulsion, Steering & Electrical...')
        const comment = sectionComment
        const variables = {
            id: currentComment?.id ? currentComment?.id : 0,
            fieldName: 'Propulsion',
            comment: comment,
            logBookEntryID: +logentryID,
            logBookEntrySectionID: vesselDailyCheck.id,
            commentType: 'Section',
        }
        if (currentComment) {
            if (offline) {
                await commentModel.save(variables)
                loadSectionMemberComments()
            } else {
                updateSectionMemberComment({
                    variables: { input: variables },
                })
            }
        } else {
            if (offline) {
                const offlineID = generateUniqueId()
                await commentModel.save({ ...variables, id: offlineID })
                loadSectionMemberComments()
            } else {
                createSectionMemberComment({
                    variables: { input: variables },
                })
            }
        }
    }

    const handleGroupNoChange = (groupField: any, groupFieldParent: any) => {
        handlePropulsionChecks(
            false,
            fields.find((field: any) => field.name === groupFieldParent.name)
                ?.value,
        )
        groupField.map((field: any) =>
            handlePropulsionChecks(false, field.value),
        )
    }

    const handleGroupYesChange = (groupField: any, groupFieldParent: any) => {
        handlePropulsionChecks(
            true,
            fields.find((field: any) => field.name === groupFieldParent.name)
                ?.value,
        )
        groupField.map((field: any) =>
            handlePropulsionChecks(true, field.value),
        )
    }

    return (
        <>
            <div className="bg-white p-6 border border-slblue-100 rounded-lg dark:bg-sldarkblue-800">
                <div className="flex w-full md:flex-nowrap flex-wrap gap-3 justify-between items-center">
                    <h3 className="dark:text-white">
                        More detailed engine, oil and fuel checks are included
                        in the engine log
                    </h3>
                </div>
                <div className="grid grid-cols-1 1 md:grid-cols-2 lg:grid-cols-3 items-start">
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                        {logBookConfig && vesselDailyCheck && (
                            <>
                                {getFilteredFields(
                                    fields,
                                    false,
                                    logBookConfig,
                                ).map((field: any, index: number) => (
                                    <DailyCheckField
                                        locked={locked}
                                        key={index}
                                        displayField={displayField(
                                            field.name,
                                            logBookConfig,
                                        )}
                                        displayDescription={displayDescription(
                                            field.name,
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
                                        displayLabel={getFieldLabel(
                                            field.name,
                                            logBookConfig,
                                        )}
                                        inputId={field.value}
                                        handleNoChange={() =>
                                            handlePropulsionChecks(
                                                false,
                                                field.value,
                                            )
                                        }
                                        defaultNoChecked={
                                            field.checked === 'Not_Ok'
                                        }
                                        handleYesChange={() =>
                                            handlePropulsionChecks(
                                                true,
                                                field.value,
                                            )
                                        }
                                        defaultYesChecked={
                                            field.checked === 'Ok'
                                        }
                                        commentAction={() =>
                                            showCommentPopup(
                                                getComment(field.name),
                                                composeField(
                                                    field.name,
                                                    logBookConfig,
                                                ),
                                            )
                                        }
                                        comment={
                                            getComment(field.name)?.comment
                                        }
                                    />
                                ))}
                                {getFilteredFields(fields, true, logBookConfig)
                                    ?.filter((groupField: any) =>
                                        displayField(
                                            groupField.name,
                                            logBookConfig,
                                        ),
                                    )
                                    ?.map((groupField: any) => (
                                        <div
                                            key={groupField.name}
                                            className="border rounded-lg p-4 col-span-3 my-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-3">
                                                <div className="text-xs font-light my-2 mr-4">
                                                    {groupField.field?.title
                                                        ? groupField.field.title
                                                        : groupField.field
                                                              .label}
                                                    <div className="text-xs my-2">
                                                        {groupField?.items
                                                            ?.filter(
                                                                (field: any) =>
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
                                                                        key={`${field.label}-${index}`}>
                                                                        {
                                                                            field.label
                                                                        }
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
                                                                        )}
                                                                        {' - '}
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
                                                    {displayDescription(
                                                        groupField.name,
                                                        logBookConfig,
                                                    ) &&
                                                        displayDescriptionIcon(
                                                            displayDescription(
                                                                groupField.name,
                                                                logBookConfig,
                                                            ),
                                                        )}
                                                </div>
                                                <div className="md:col-span-2">
                                                    <DailyCheckGroupField
                                                        locked={locked}
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
                                                                    groupField
                                                                        ?.items[0]
                                                                        .name,
                                                                ),
                                                                composeField(
                                                                    groupField
                                                                        ?.items[0]
                                                                        .name,
                                                                    logBookConfig,
                                                                ),
                                                            )
                                                        }
                                                        comment={
                                                            getComment(
                                                                groupField
                                                                    ?.items[0]
                                                                    .name,
                                                            )?.comment
                                                        }
                                                    />
                                                    {groupField?.items?.map(
                                                        (
                                                            field: any,
                                                            index: number,
                                                        ) => (
                                                            <DailyCheckField
                                                                locked={locked}
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
                                                                    handlePropulsionChecks(
                                                                        false,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultNoChecked={
                                                                    field.checked ===
                                                                    'Not_Ok'
                                                                }
                                                                handleYesChange={() =>
                                                                    handlePropulsionChecks(
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
                            </>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 my-2 md:grid-cols-3 lg:grid-cols-4 items-start dark:text-white">
                    <label className="hidden md:block">Comments</label>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                        <div className="flex items-center justify-between">
                            <textarea
                                id={`section_comment`}
                                rows={4}
                                readOnly={locked}
                                className={classes.textarea}
                                placeholder="Comments ..."
                                onChange={(e) => {
                                    setSectionComment(e.target.value)
                                }}
                                /*onBlur={(e) =>
                                    getComment('Propulsion', 'Section')?.id > 0
                                        ? updateSectionMemberComment({
                                              variables: {
                                                  input: {
                                                      id: getComment(
                                                          'Propulsion',
                                                          'Section',
                                                      )?.id,
                                                      comment: e.target.value,
                                                  },
                                              },
                                          })
                                        : createSectionMemberComment({
                                              variables: {
                                                  input: {
                                                      fieldName: 'Propulsion',
                                                      comment: e.target.value,
                                                      logBookEntryID:
                                                          +logentryID,
                                                      logBookEntrySectionID:
                                                          vesselDailyCheck.id,
                                                      commentType: 'Section',
                                                  },
                                              },
                                          })
                                }*/
                                defaultValue={
                                    getComment('Propulsion', 'Section')?.comment
                                }></textarea>
                        </div>
                    </div>
                </div>
            </div>
            <FooterWrapper>
                <SeaLogsButton
                    text="Cancel"
                    type="text"
                    action={() => router.back()}
                />
                <SeaLogsButton
                    text="Save"
                    type="primary"
                    color="sky"
                    icon="check"
                    action={handleSave}
                />
            </FooterWrapper>
            <AlertDialog
                openDialog={openCommentAlert}
                setOpenDialog={setOpenCommentAlert}
                handleCreate={handleSaveComment}
                actionText="Save">
                <div
                    className={`flex flex-col ${locked ? 'pointer-events-none' : ''}`}>
                    <textarea
                        id="comment"
                        readOnly={locked}
                        rows={4}
                        className="block p-2.5 w-full mt-4 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-white dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
        </>
    )
}
