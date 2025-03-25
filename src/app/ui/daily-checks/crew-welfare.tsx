'use client'
import React, { useEffect, useState } from 'react'
import { Heading } from 'react-aria-components'
import { useMutation, useLazyQuery } from '@apollo/client'
import {
    CreateCrewWelfare_LogBookEntrySection,
    UpdateCrewWelfare_LogBookEntrySection,
} from '@/app/lib/graphQL/mutation'
import {
    AlertDialog,
    DailyCheckField,
    SeaLogsButton,
} from '@/app/components/Components'
import { GET_SECTION_MEMBER_COMMENTS } from '@/app/lib/graphQL/query'
import {
    UPDATE_SECTION_MEMBER_COMMENT,
    CREATE_SECTION_MEMBER_COMMENT,
} from '@/app/lib/graphQL/mutation'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import SlidingPanel from 'react-sliding-side-panel'
import { XMarkIcon } from '@heroicons/react/24/outline'
import SectionMemberCommentModel from '@/app/offline/models/sectionMemberComment'
import CrewWelfare_LogBookEntrySectionModel from '@/app/offline/models/crewWelfare_LogBookEntrySection'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import { setDefaultAutoSelectFamilyAttemptTimeout } from 'net'

export default function CrewWelfare({
    logBookConfig,
    crewWelfareCheck = false,
    locked = false,
    updateCrewWelfare,
    offline = false,
}: {
    logBookConfig: any
    crewWelfareCheck: any
    locked: boolean
    updateCrewWelfare: any
    offline?: boolean
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loaded, setLoaded] = useState(false)
    const logentryID = searchParams.get('logentryID') ?? 0
    const [openCommentAlert, setOpenCommentAlert] = useState(false)
    const [currentComment, setCurrentComment] = useState<any>('')
    const [currentField, setCurrentField] = useState<any>('')
    const [comments, setComments] = useState<any>(false)
    const [openDescriptionPanel, setOpenDescriptionPanel] = useState(false)
    const [descriptionPanelContent, setDescriptionPanelContent] = useState('')
    const [descriptionPanelHeading, setDescriptionPanelHeading] = useState('')
    const commentModel = new SectionMemberCommentModel()
    const welfareModel = new CrewWelfare_LogBookEntrySectionModel()
    const handleFitness = async (check: Boolean) => {
        if (+crewWelfareCheck?.id > 0) {
            const variables = {
                id: crewWelfareCheck.id,
                fitness: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await welfareModel.save(variables)
                updateCrewWelfare(data)
            } else {
                updateCrewWelfare_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleSafetyActions = async (check: Boolean) => {
        if (+crewWelfareCheck?.id > 0) {
            const variables = {
                id: crewWelfareCheck.id,
                safetyActions: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await welfareModel.save(variables)
                updateCrewWelfare(data)
            } else {
                updateCrewWelfare_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleWaterQuality = async (check: Boolean) => {
        if (+crewWelfareCheck?.id > 0) {
            const variables = {
                id: crewWelfareCheck.id,
                waterQuality: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await welfareModel.save(variables)
                updateCrewWelfare(data)
            } else {
                updateCrewWelfare_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }

    const handleIMSafe = async (check: Boolean) => {
        if (+crewWelfareCheck?.id > 0) {
            const variables = {
                id: crewWelfareCheck.id,
                imSafe: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await welfareModel.save(variables)
                updateCrewWelfare(data)
            } else {
                updateCrewWelfare_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }

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

    const composeField = (fieldName: string) => {
        var composedField: { fleldID: any; fieldName: any }[] = []
        const crewWelfareCheck =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'CrewWelfare_LogBookComponent',
            )
        if (
            crewWelfareCheck?.length > 0 &&
            crewWelfareCheck[0]?.customisedComponentFields?.nodes.map(
                (field: any) =>
                    field.fieldName === fieldName
                        ? composedField.push({
                              fleldID: field.id,
                              fieldName: field.fieldName,
                          })
                        : '',
            )
        ) {
            return composedField
        }
        return false
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
            logBookEntrySectionID: crewWelfareCheck.id,
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
                crewWelfareCheck.id,
            )
            if (data) {
                setComments(data)
            }
        } else {
            await querySectionMemberComments({
                variables: {
                    filter: {
                        logBookEntrySectionID: { eq: crewWelfareCheck.id },
                    },
                },
            })
        }
    }

    useEffect(() => {
        if (crewWelfareCheck.id > 0) {
            loadSectionMemberComments()
        }
    }, [crewWelfareCheck])

    const classes = {
        fieldWrapper:
            'grid grid-cols-1 my-4 md:grid-cols-2 lg:grid-cols-3 items-end dark:text-white',
        inputWrapper: 'flex flex-col grid-cols-1 md:col-span-1 lg:col-span-2',
        inputWrapperInner: 'flex items-center justify-between',
        radio: 'flex items-center me-4',
        radioInput:
            'w-8 h-8 bg-slblue-100 border-slblue-300 dark:ring-offset-slblue-800 dark:bg-slblue-700 dark:border-slblue-600',
        radioLabel: 'text-xs',
        textarea:
            'block p-2.5 w-full mt-4 text-sm text-slblue-900 bg-slblue-50 rounded-lg border border-slblue-300 focus:ring-slblue-500 focus:border-blue-500 dark:bg-slblue-700 dark:border-white dark:placeholder-slblue-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
    }

    const displayField = (fieldName: string) => {
        const crewWelfareCheck =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'CrewWelfare_LogBookComponent',
            )
        if (
            crewWelfareCheck?.length > 0 &&
            crewWelfareCheck[0]?.customisedComponentFields?.nodes.filter(
                (field: any) =>
                    field.fieldName === fieldName && field.status !== 'Off',
            ).length > 0
        ) {
            return true
        }
        false
    }

    const getFieldLabel = (fieldName: string) => {
        const signOff =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'CrewWelfare_LogBookComponent',
            )
        if (signOff?.length > 0) {
            return signOff[0]?.customisedComponentFields?.nodes.find(
                (field: any) => field.fieldName === fieldName,
            )?.customisedFieldTitle
                ? signOff[0]?.customisedComponentFields?.nodes.find(
                      (field: any) => field.fieldName === fieldName,
                  )?.customisedFieldTitle
                : fieldName
        }
        return fieldName
    }

    const displayDescription = (fieldName: string) => {
        const crewWelfareCheck =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'CrewWelfare_LogBookComponent',
            )
        if (
            crewWelfareCheck?.length > 0 &&
            crewWelfareCheck[0]?.customisedComponentFields?.nodes.filter(
                (field: any) =>
                    field.fieldName === fieldName && field.status !== 'Off',
            ).length > 0
        ) {
            const description =
                crewWelfareCheck[0]?.customisedComponentFields?.nodes.filter(
                    (field: any) =>
                        field.fieldName === fieldName && field.status !== 'Off',
                )[0].description
            if (description !== null && description !== '') {
                return description
            }
        }
        return false
    }

    const [updateCrewWelfare_LogBookEntrySection] = useMutation(
        UpdateCrewWelfare_LogBookEntrySection,
        {
            onCompleted: (response) => {
                updateCrewWelfare(
                    response.updateCrewWelfare_LogBookEntrySection,
                )
            },
            onError: (error) => {
                console.error('Error completing safety check', error)
            },
        },
    )

    const handleSave = async () => {
        const comment = (
            document.getElementById('section_comment') as HTMLInputElement
        )?.value
        const variables = {
            id: currentComment?.id ? currentComment?.id : 0,
            fieldName: 'CrewWelfare',
            comment: comment,
            logBookEntryID: +logentryID,
            logBookEntrySectionID: crewWelfareCheck?.id,
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

    const fields = [
        {
            name: 'Fitness',
            label: 'Safe crewing assessment',
            value: 'fitness',
            checked: crewWelfareCheck?.fitness,
            handleChange: handleFitness,
            description: (
                <>
                    Ensure that there are sufficient crew and sufficient
                    qualified crew on board to operate the vessel safely which
                    may exceed the vessels minimum crewing.
                </>
            ),
        },
        {
            name: 'SafetyActions',
            label: 'Risk assessments completed',
            value: 'safetyActions',
            checked: crewWelfareCheck?.safetyActions,
            handleChange: handleSafetyActions,
        },
        {
            name: 'WaterQuality',
            label: 'Health, safety and environment actions',
            value: 'waterQuality',
            checked: crewWelfareCheck?.waterQuality,
            handleChange: handleWaterQuality,
            description: <>This could include drinking water quality check and toolbox agendas.</>,
        },
        {
            name: 'IMSafe',
            label: 'IMSAFE',
            value: 'imSafe',
            checked: crewWelfareCheck?.imSafe,
            handleChange: handleIMSafe,
            description: (
                <>
                    Free of <b>illness</b> and symptoms. Safe <b>medication</b>{' '}
                    only. Managing <b>stress</b> well at home and at work. Free
                    of <b>alcohol</b> and drugs and their effects. Rested, slept
                    and <b>fatigue</b> free. <b>Eaten</b>, watered, and ready to
                    go
                </>
            ),
        },
    ]

    const CreateCrewWelfareCheck = async () => {
        const variables = {
            logBookEntryID: logentryID,
            fitness: 'Not_Ok',
            safetyActions: 'Not_Ok',
            waterQuality: 'Not_Ok',
        }
        if (offline) {
            const offlineID = generateUniqueId()
            await welfareModel.save({ ...variables, id: offlineID })
        } else {
            await createCrewWelfare_LogBookEntrySection({
                variables: { input: variables },
            })
        }
    }

    const [createCrewWelfare_LogBookEntrySection] = useMutation(
        CreateCrewWelfare_LogBookEntrySection,
        {
            onCompleted: (response) => {
                // router.back()
            },
            onError: (error) => {
                console.error('Error creating crew welfare check', error)
            },
        },
    )

    const isDescriptionObject = (fieldLabel: string) => {
        const fieldName =
            fields?.find((field: any) => field.label === fieldLabel)?.name ?? ''
        return displayDescription(fieldName)
    }

    return (
        <>
            {crewWelfareCheck ? (
                <div className="block overflow-x-auto overflow-y-auto bg-slblue-100 px-2 font-normal">
                    {logBookConfig &&
                        crewWelfareCheck &&
                        fields.map((field: any, index: number) => (
                            <DailyCheckField
                                offline={offline}
                                locked={locked}
                                key={index}
                                displayField={displayField(field.name)}
                                displayDescription={
                                    displayDescription(field.name)
                                        ? displayDescription(field.name)
                                        : field.description
                                }
                                descriptionType={
                                    displayDescription(field.name)
                                        ? ''
                                        : 'object'
                                }
                                setDescriptionPanelContent={
                                    setDescriptionPanelContent
                                }
                                setOpenDescriptionPanel={
                                    setOpenDescriptionPanel
                                }
                                setDescriptionPanelHeading={
                                    setDescriptionPanelHeading
                                }
                                displayLabel={getFieldLabel(field.name)}
                                inputId={field.value}
                                handleNoChange={() => field.handleChange(false)}
                                defaultNoChecked={field.checked === 'Not_Ok'}
                                handleYesChange={() => field.handleChange(true)}
                                defaultYesChecked={field.checked === 'Ok'}
                                commentAction={() =>
                                    showCommentPopup(
                                        getComment(field.name),
                                        composeField(field.name),
                                    )
                                }
                                comment={getComment(field.name)?.comment}
                            />
                        ))}
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
                                className={classes.textarea}
                                placeholder="Comment"
                                defaultValue={
                                    currentComment ? currentComment.comment : ''
                                }></textarea>
                        </div>
                    </AlertDialog>
                    <SlidingPanel
                        type={'left'}
                        isOpen={openDescriptionPanel}
                        size={40}>
                        <div className="h-[calc(100vh_-_1rem)] pt-4">
                            {openDescriptionPanel && (
                                <div className="bg-sllightblue-50 h-full flex flex-col justify-between rounded-r-lg">
                                    <div className="items-center flex justify-between font-medium py-4 px-6 rounded-tr-lg bg-slblue-1000">
                                        <Heading
                                            slot="title"
                                            className="text-xl font-semibold leading-6 my-2 text-white dark:text-slblue-200">
                                            Field -{' '}
                                            <span className="font-thin">
                                                {descriptionPanelHeading}
                                            </span>
                                        </Heading>
                                        <XMarkIcon
                                            className="w-6 h-6 text-white dark:text-slblue-200"
                                            onClick={() => {
                                                setOpenDescriptionPanel(false)
                                                setDescriptionPanelContent('')
                                                setDescriptionPanelHeading('')
                                            }}
                                        />
                                    </div>
                                    <div className="p-4 flex-grow overflow-scroll">
                                        {typeof descriptionPanelContent ===
                                        'string' ? (
                                            <div
                                                className="leading-loose font-light"
                                                dangerouslySetInnerHTML={{
                                                    __html: descriptionPanelContent,
                                                }}></div>
                                        ) : (
                                            descriptionPanelContent
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </SlidingPanel>
                </div>
            ) : (
                <div className="flex items-center justify-center">
                    <SeaLogsButton
                        text="Create Crew Welfare Check"
                        action={CreateCrewWelfareCheck}
                    />
                </div>
            )}
        </>
    )
}
