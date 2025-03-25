'use client'
import React, { useEffect, useState } from 'react'
import { Heading } from 'react-aria-components'
import { useMutation, useLazyQuery } from '@apollo/client'
import { UpdateVesselDailyCheck_LogBookEntrySection } from '@/app/lib/graphQL/mutation'
import {
    AlertDialog,
    CustomDailyCheckField,
    DailyCheckField,
    DailyCheckGroupField,
    FooterWrapper,
    SeaLogsButton,
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
    getFieldLabel,
} from '@/app/ui/daily-checks/actions'
import { classes } from '@/app/components/GlobalClasses'
import { XMarkIcon } from '@heroicons/react/24/outline'
import SlidingPanel from 'react-sliding-side-panel'
import 'react-quill/dist/quill.snow.css'
import SectionMemberCommentModel from '@/app/offline/models/sectionMemberComment'
import VesselDailyCheck_LogBookEntrySectionModel from '@/app/offline/models/vesselDailyCheck_LogBookEntrySection'
import { generateUniqueId } from '@/app/offline/helpers/functions'

export default function Hull({
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
    const [openCommentAlert, setOpenCommentAlert] = useState(false)
    const [currentComment, setCurrentComment] = useState<any>('')
    const [sectionComment, setSectionComment] = useState<any>('')
    const [currentField, setCurrentField] = useState<any>('')
    const [openDescriptionPanel, setOpenDescriptionPanel] = useState(false)
    const [descriptionPanelContent, setDescriptionPanelContent] = useState('')
    const [descriptionPanelHeading, setDescriptionPanelHeading] = useState('')
    const commentModel = new SectionMemberCommentModel()
    const dailyCheckModel = new VesselDailyCheck_LogBookEntrySectionModel()
    const handleHullChecks = async (check: Boolean, value: any) => {
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
                console.log('Hull check completed')
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
                                ...hullStructureFields,
                                ...hullDeckEquipment,
                                ...hullDayShapes,
                                ...fields,
                            ],
                            logBookConfig,
                            vesselDailyCheck,
                            'Deck operations and exterior checks',
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
                        ...hullStructureFields,
                        ...hullDeckEquipment,
                        ...hullDayShapes,
                        ...fields,
                    ],
                    logBookConfig,
                    vesselDailyCheck,
                    'Deck operations and exterior checks',
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

    const hullStructureFields = [
        {
            name: 'Hull_HullStructure',
            label: 'Hull structure',
            value: 'hull_HullStructure',
            sortOrder: getSortOrder('Hull_HullStructure', logBookConfig),
            checked: vesselDailyCheck?.hull_HullStructure,
        },
        {
            name: 'HullStructure',
            label: 'Hull and superstructure inspections',
            value: 'hullStructure',
            sortOrder: getSortOrder('HullStructure', logBookConfig),
            checked: vesselDailyCheck?.hullStructure,
        },
        {
            name: 'PontoonPressure',
            label: 'Pontoon pressure (for inflatables)',
            value: 'pontoonPressure',
            sortOrder: getSortOrder('PontoonPressure', logBookConfig),
            checked: vesselDailyCheck?.pontoonPressure,
        },
        {
            name: 'BungsInPlace',
            label: 'Bungs in place',
            value: 'bungsInPlace',
            sortOrder: getSortOrder('BungsInPlace', logBookConfig),
            checked: vesselDailyCheck?.bungsInPlace,
        },
        {
            name: 'Hatches',
            label: 'Hatches, doors, windows, and portholes security for watertight integrity',
            value: 'hatches',
            sortOrder: getSortOrder('Hatches', logBookConfig),
            checked: vesselDailyCheck?.hatches,
        },
    ]
    const hullDeckEquipment = [
        {
            name: 'Hull_DeckEquipment',
            label: 'Deck Equipment',
            value: 'hull_DeckEquipment',
            sortOrder: getSortOrder('Hull_DeckEquipment', logBookConfig),
            checked: vesselDailyCheck?.hull_DeckEquipment,
        },
        {
            name: 'DeckEquipment',
            label: 'Check deck equipment (lines, fenders, etc.), cleats, chocks, rails, lifelines, loose equipment',
            value: 'deckEquipment',
            sortOrder: getSortOrder('DeckEquipment', logBookConfig),
            checked: vesselDailyCheck?.deckEquipment,
        },
        {
            name: 'SwimPlatformLadder',
            label: 'Swim platform, ladder',
            value: 'swimPlatformLadder',
            sortOrder: getSortOrder('SwimPlatformLadder', logBookConfig),
            checked: vesselDailyCheck?.swimPlatformLadder,
        },
        {
            name: 'BiminiTopsCanvasCovers',
            label: 'Bimini tops, canvas covers',
            value: 'biminiTopsCanvasCovers',
            sortOrder: getSortOrder('BiminiTopsCanvasCovers', logBookConfig),
            checked: vesselDailyCheck?.biminiTopsCanvasCovers,
        },
    ]
    const hullDayShapes = [
        {
            name: 'Hull_DayShapes',
            label: 'Day shapes',
            value: 'dayShapes',
            sortOrder: getSortOrder('Hull_DayShapes', logBookConfig),
            checked: vesselDailyCheck?.dayShapes,
        },
        {
            name: 'DayShapes',
            label: 'Day shapes',
            value: 'dayShapes',
            sortOrder: getSortOrder('DayShapes', logBookConfig),
            checked: vesselDailyCheck?.dayShapes,
        },
        {
            name: 'HullNavigationLights',
            label: 'Navigation lights',
            value: 'dayShapes',
            sortOrder: getSortOrder('HullNavigationLights', logBookConfig),
            checked: vesselDailyCheck?.dayShapes,
        },
    ]

    const fields = [
        {
            name: 'Anchor',
            label: 'Anchor, warps, chains, windlass/hauling equipment',
            value: 'anchor',
            sortOrder: getSortOrder('Anchor', logBookConfig),
            checked: vesselDailyCheck?.anchor,
        },
        {
            name: 'WindscreenCheck',
            label: 'Windscreen check',
            value: 'windscreenCheck',
            sortOrder: getSortOrder('WindscreenCheck', logBookConfig),
            checked: vesselDailyCheck?.windscreenCheck,
        },
        {
            name: 'NightLineDockLinesRelease',
            label: 'Night line / dock lines release',
            value: 'nightLineDockLinesRelease',
            sortOrder: getSortOrder('NightLineDockLinesRelease', logBookConfig),
            checked: vesselDailyCheck?.nightLineDockLinesRelease,
        },
        {
            name: 'TenderOperationalChecks',
            label: 'Tender operational checks',
            value: 'tenderOperationalChecks',
            sortOrder: getSortOrder('TenderOperationalChecks', logBookConfig),
            checked: vesselDailyCheck?.tenderOperationalChecks,
        },
    ]

    const handleSave = async () => {
        if (offline) {
            const data = await dailyCheckModel.getByIds([vesselDailyCheck.id])
            setVesselDailyCheck(data)
            setSaving(true)
            if (vesselDailyCheck === data[0]) {
                toast.dismiss()
                toast.custom((t) =>
                    getDailyCheckNotification(
                        [
                            ...hullStructureFields,
                            ...hullDeckEquipment,
                            ...hullDayShapes,
                            ...fields,
                        ],
                        logBookConfig,
                        vesselDailyCheck,
                        'Deck operations and exterior checks',
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
        toast.loading('Saving Deck operations & exterior...')
        const comment = sectionComment
        const variables = {
            id: currentComment?.id ? currentComment?.id : 0,
            fieldName: 'Hull',
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
                const offlineID = getComment('Hull', 'Section')
                    ? getComment('Hull', 'Section').id
                    : generateUniqueId()
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
        handleHullChecks(
            false,
            [
                ...hullStructureFields,
                ...hullDeckEquipment,
                ...hullDayShapes,
                ...fields,
            ].find((field: any) => field.name === groupFieldParent.name)?.value,
        )
        groupField.map((field: any) => handleHullChecks(false, field.value))
    }

    const handleGroupYesChange = (groupField: any, groupFieldParent: any) => {
        handleHullChecks(
            true,
            [
                ...hullStructureFields,
                ...hullDeckEquipment,
                ...hullDayShapes,
                ...fields,
            ].find((field: any) => field.name === groupFieldParent.name)?.value,
        )
        groupField.map((field: any) => handleHullChecks(true, field.value))
    }

    return (
        <>
            <div className="pb-16">
                {getFilteredFields(
                    hullStructureFields,
                    true,
                    logBookConfig,
                )?.filter((groupField: any) =>
                    displayField(groupField.name, logBookConfig),
                ).length > 0 && (
                    <div>
                        {logBookConfig && vesselDailyCheck && (
                            <>
                                {getFilteredFields(
                                    hullStructureFields,
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
                                        <div
                                            key={groupField.name}
                                            className="flex flex-row gap-2 my-4 text-left items-center justify-between">
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
                                                                key={`${field.label}-${index}`}>
                                                                {field.label}
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
                                            <div>
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
                                                                handleHullChecks(
                                                                    false,
                                                                    field.value,
                                                                )
                                                            }
                                                            defaultNoChecked={
                                                                field.checked ===
                                                                'Not_Ok'
                                                            }
                                                            handleYesChange={() =>
                                                                handleHullChecks(
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
                                    ))}
                            </>
                        )}
                    </div>
                )}
                {getFilteredFields(
                    hullDeckEquipment,
                    true,
                    logBookConfig,
                )?.filter((groupField: any) =>
                    displayField(groupField.name, logBookConfig),
                ).length > 0 && (
                    <div className="">
                        {logBookConfig && vesselDailyCheck && (
                            <>
                                {getFilteredFields(
                                    hullDeckEquipment,
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
                                        <div
                                            key={groupField.name}
                                            className="flex flex-row gap-2 my-4 text-left items-center justify-between">
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
                                                                key={`${field.label}-${index}`}>
                                                                {field.label}
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
                                            <div>
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
                                                                handleHullChecks(
                                                                    false,
                                                                    field.value,
                                                                )
                                                            }
                                                            defaultNoChecked={
                                                                field.checked ===
                                                                'Not_Ok'
                                                            }
                                                            handleYesChange={() =>
                                                                handleHullChecks(
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
                                    ))}
                            </>
                        )}
                    </div>
                )}
                {getFilteredFields(hullDayShapes, true, logBookConfig)?.filter(
                    (groupField: any) =>
                        displayField(groupField.name, logBookConfig),
                ).length > 0 && (
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                        {logBookConfig && vesselDailyCheck && (
                            <>
                                {getFilteredFields(
                                    hullDayShapes,
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
                                        <div
                                            key={groupField.name}
                                            className="flex flex-row gap-2 my-4 text-left items-center justify-between">
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
                                                                key={`${field.label}-${index}`}>
                                                                {field.label}
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
                                                                handleHullChecks(
                                                                    false,
                                                                    field.value,
                                                                )
                                                            }
                                                            defaultNoChecked={
                                                                field.checked ===
                                                                'Not_Ok'
                                                            }
                                                            handleYesChange={() =>
                                                                handleHullChecks(
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
                                    ))}
                            </>
                        )}
                    </div>
                )}
                {getFilteredFields(fields, false, logBookConfig).map(
                    (field: any, index: number) => (
                        <div
                            key={`${field.label}-${index}`}
                            className="flex flex-row items-center">
                            <CustomDailyCheckField
                                locked={locked || !edit_logBookEntry}
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
                                    handleHullChecks(false, field.value)
                                }
                                defaultNoChecked={field.checked === 'Not_Ok'}
                                handleYesChange={() =>
                                    handleHullChecks(true, field.value)
                                }
                                defaultYesChecked={field.checked === 'Ok'}
                                commentAction={() =>
                                    showCommentPopup(
                                        getComment(field.name),
                                        composeField(field.name, logBookConfig),
                                    )
                                }
                                comment={getComment(field.name)?.comment}
                            />
                        </div>
                    ),
                )}

                <div className="my-4 flex items-center justify-between w-full">
                    <textarea
                        id={`section_comment`}
                        readOnly={locked || !edit_logBookEntry}
                        rows={4}
                        className={classes.textarea}
                        placeholder="Comments ..."
                        onChange={(e) => setSectionComment(e.target.value)}
                        /*onBlur={(e) =>
                                getComment('Hull', 'Section')?.id > 0
                                    ? updateSectionMemberComment({
                                            variables: {
                                                input: {
                                                    id: getComment(
                                                        'Hull',
                                                        'Section',
                                                    )?.id,
                                                    comment: e.target.value,
                                                },
                                            },
                                        })
                                    : createSectionMemberComment({
                                            variables: {
                                                input: {
                                                    fieldName: 'Hull',
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
                            getComment('Hull', 'Section')?.comment
                        }></textarea>
                </div>
            </div>
            {(!locked || edit_logBookEntry) && (
                <FooterWrapper>
                    <SeaLogsButton
                        text="Cancel"
                        type="text"
                        action={() => router.back()}
                    />
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
                    />
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
                                        className="text-sm leading-loose font-light"
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
