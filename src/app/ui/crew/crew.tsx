'use client'
import React, { useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
    Button,
    DialogTrigger,
    ModalOverlay,
    Modal,
    Dialog,
    Heading,
    Popover,
} from 'react-aria-components'
import {
    UpdateCrewMembers_LogBookEntrySection,
    CreateCrewMembers_LogBookEntrySection,
    CreateCrewWelfare_LogBookEntrySection,
    DeleteCrewMembers_LogBookEntrySections,
} from '@/app/lib/graphQL/mutation'
import { StaticDateTimePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import {
    CREW_DUTY,
    CREW_LIST,
    CrewMembers_LogBookEntrySection,
    GetCrewMembersFromOpenLogBook,
} from '@/app/lib/graphQL/query'
import Select from 'react-select'
import { LogBookEntryCrewSection } from '../../../../types/logbook-entry-crew-section'
import CrewDutyDropdown from '../crew-duty/dropdown'
import {
    SeaLogsButton,
    TableWrapper,
    AlertDialog,
} from '@/app/components/Components'
import CrewWelfare from '../daily-checks/crew-welfare'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { GetCrewListWithTrainingStatus } from '@/app/lib/actions'
import { classes } from '@/app/components/GlobalClasses'
import toast, { Toaster } from 'react-hot-toast'
import { formatDateTime, formatDBDateTime } from '@/app/helpers/dateHelper'
import SeaLogsMemberModel from '@/app/offline/models/seaLogsMember'
import CrewDutyModel from '@/app/offline/models/crewDuty'
import CrewMembers_LogBookEntrySectionModel from '@/app/offline/models/crewMembers_LogBookEntrySection'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import CrewWelfare_LogBookEntrySectionModel from '@/app/offline/models/crewWelfare_LogBookEntrySection'
import { formatDate } from '@/app/helpers/dateHelper'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'

export default function Crew({
    crewSections = false,
    allCrew,
    logBookEntryID,
    locked,
    logBookConfig = false,
    setCrewMembers,
    crewWelfareCheck,
    updateCrewWelfare,
    vessel = false,
    masterID = 0,
    logEntrySections,
    offline = false,
    crewMembersList,
}: {
    crewSections: any
    allCrew: any
    logBookEntryID: number
    locked: boolean
    logBookConfig: any
    setCrewMembers: any
    crewWelfareCheck: any
    updateCrewWelfare: any
    vessel: any
    masterID: number
    logEntrySections: any
    offline?: boolean
    crewMembersList: any
}) {
    const seaLogsMemberModel = new SeaLogsMemberModel()
    const crewDutyModel = new CrewDutyModel()
    const lbCrewModel = new CrewMembers_LogBookEntrySectionModel()
    const lbWelfareModel = new CrewWelfare_LogBookEntrySectionModel()
    const [allVesselCrews, setAllVesselCrews] = useState([] as any)
    const [allDuties, setAllDuties] = useState([] as any)
    const searchParams = useSearchParams()
    const vesselID = searchParams.get('vesselID') ?? 0
    const [isLoading, setIsLoading] = useState(true)
    const [loaded, setLoaded] = useState(false)
    const [crewMember, setCrewMember] = useState<{
        label: any
        value: any
        data: any
    } | null>(null)
    const [duty, setDuty] = useState<{ label: any; value: any } | null>(null)
    const [loginTime, setLoginTime] = useState(dayjs())
    const [logoutTime, setLogoutTime] = useState<any>(false)
    const [duties, setDuties] = useState<any>([])
    const [crew, setCrew] = useState<any>(crewSections)
    const [crewConfig, setCrewConfig] = useState<any>(true)
    // const [addCrew, setAddCrew] = useState(false);
    // const [editCrew, setEditCrew] = useState(false);
    // const [editCrewMember, setEditCrewMember] = useState(null);
    const [crewManifestEntry, setCrewManifestEntry] = useState<any>({})
    const [openAddCrewMemberDialog, setopenAddCrewMemberDialog] =
        useState(false)
    const [customWidth, setCustomWidth] = useState('!w-full ')
    const handleAddCrewMemberDialog = async () => {}
    const [openEditLogoutTimeDialog, setOpenEditLogoutTimeDialog] =
        useState(false)
    const [crewMemberOptions, setCrewMemberOptions] = useState<any>([])
    const [openCrewTrainingDueDialog, setOpenCrewTrainingDueDialog] =
        useState(false)
    const [openConfirmCrewDeleteDialog, setOpenConfirmCrewDeleteDialog] =
        useState(false)
    const [permissions, setPermissions] = useState<any>(false)
    const [edit_logBookEntry, setEdit_logBookEntry] = useState<any>(false)

    const init_permissions = () => {
        if (
            permissions &&
            hasPermission(
                process.env.EDIT_LOGBOOKENTRY || 'EDIT_LOGBOOKENTRY',
                permissions,
            )
        ) {
            setEdit_logBookEntry(true)
        } else {
            setEdit_logBookEntry(false)
        }
    }

    const createOfflineCrewWelfareCheck = async () => {
        // I need to add a 2-second delay to fix ConstraintError: Key already exists in the object store.
        const delay = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms))
        await delay(2000)
        const id = generateUniqueId()
        const data = await lbWelfareModel.save({
            id: id,
            logBookEntryID: logBookEntryID,
            fitness: null,
            imSafe: null,
            safetyActions: null,
            waterQuality: null,
            __typename: 'CrewWelfare_LogBookEntrySection',
        })
        updateCrewWelfare(data)
    }
    useEffect(() => {
        setPermissions(getPermissions)
        init_permissions()
    }, [])

    useEffect(() => {
        init_permissions()
    }, [permissions])

    useEffect(() => {
        const hasCrewWelfare = logEntrySections.filter(
            (section: any) =>
                section.className ===
                'SeaLogs\\CrewWelfare_LogBookEntrySection',
        ).length
        if (
            hasCrewWelfare === 0 &&
            !crewWelfareCheck &&
            !loaded &&
            !createCrewWelfareCheckLoading
        ) {
            setLoaded(true)
            if (offline) {
                createOfflineCrewWelfareCheck()
            } else {
                createCrewWelfareCheck({
                    variables: {
                        input: {
                            logBookEntryID: +logBookEntryID,
                        },
                    },
                })
            }
        }
    }, [logEntrySections])
    const [queryVesselCrews] = useLazyQuery(CREW_LIST, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const data = response.readSeaLogsMembers
            if (data) {
                const members = data.nodes
                    .filter((item: any) => {
                        return +item.id !== +masterID
                    })
                    .map((member: any) => {
                        return {
                            label: `${member.firstName || ''} ${member.surname || ''}`,
                            value: member.id,
                            data: GetCrewListWithTrainingStatus(
                                [member],
                                [vessel],
                            )[0],
                        }
                    }) // filter out members who are already in the crew list
                    .filter((member: any) => {
                        if (!crewSections) {
                            return true
                        }
                        return !crewSections.some(
                            (section: any) =>
                                section.crewMember.id === member.value,
                        )
                    })
                setCrewMemberOptions(
                    members.filter(
                        (member: any) =>
                            !crewMembersList.includes(+member.value),
                    ),
                )
            }
        },
        onError: (error: any) => {
            console.error('queryVesselCrews error', error)
        },
    })
    const loadVesselCrews = async () => {
        if (offline) {
            const data = await seaLogsMemberModel.getByVesselId(vesselID)
            setAllVesselCrews(data)
            if (data) {
                const members = data
                    .filter((item: any) => {
                        return +item.id !== +masterID
                    })
                    .map((member: any) => {
                        return {
                            label: `${member.firstName || ''} ${member.surname || ''}`,
                            value: member.id,
                            data: GetCrewListWithTrainingStatus(
                                [member],
                                [vessel],
                            )[0],
                        }
                    }) // filter out members who are already in the crew list
                    .filter((member: any) => {
                        if (!crewSections) {
                            return true
                        }
                        return !crewSections.some(
                            (section: any) =>
                                section.crewMember.id === member.value,
                        )
                    })
                setCrewMemberOptions(members)
            }
        } else {
            await queryVesselCrews({
                variables: {
                    filter: { vehicles: { id: { eq: vesselID } } },
                },
            })
        }
    }
    useEffect(() => {
        if (isLoading) {
            loadDuties()
            handleSetCrewConfig()
            loadVesselCrews()
            setIsLoading(false)
        }
    }, [isLoading])

    useEffect(() => {
        if (crewSections) {
            setCrew(crewSections)
        }
    }, [crewSections])
    useEffect(() => {
        if (masterID > 0) {
            loadVesselCrews()
        }
    }, [masterID])
    const loadDuties = async () => {
        if (offline) {
            const data = await crewDutyModel.getAll()
            setAllDuties(data)
            if (data) {
                const activeDuties = data.filter((duty: any) => !duty.archived)
                setDuties(activeDuties)
            }
        } else {
            await queryDuties()
        }
    }

    const handleSetCrewConfig = () => {
        if (logBookConfig) {
            setCrewConfig(
                logBookConfig.customisedLogBookComponents.nodes
                    .filter((config: any) => config.title === 'Crew Members')[0]
                    ?.customisedComponentFields.nodes.map((field: any) => ({
                        title: field.fieldName,
                        status: field.status,
                    })),
            )
        } else {
            setCrewConfig(false)
        }
    }

    const [
        queryDuties,
        {
            loading: queryDutiesLoading,
            error: queryDutiesError,
            data: queryDutiesData,
        },
    ] = useLazyQuery(CREW_DUTY, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readCrewDuties.nodes
            if (data) {
                const activeDuties = data.filter((duty: any) => !duty.archived)
                setDuties(activeDuties)
            }
        },
        onError: (error: any) => {
            console.error('queryDutiesEntry error', error)
        },
    })

    const handleLogin = (date: any) => {
        setLoginTime(dayjs(date))
        setCrewManifestEntry({
            ...crewManifestEntry,
            punchIn: formatDBDateTime(date),
        })
    }

    const handleLogout = (date: any) => {
        setLogoutTime(dayjs(date))
        setCrewManifestEntry({
            ...crewManifestEntry,
            punchOut: formatDBDateTime(date),
        })
    }

    const handleAddManifest = () => {
        if (!edit_logBookEntry) {
            toast.error('You do not have permission to edit this log entry')
            return
        }
        if (vessel?.maxPOB > 0) {
            if (crew.length > vessel.maxPOB - 1) {
                toast.error('Crew is at maximum capacity')
                return
            }
        }
        const filteredCrewOptions = crewMemberOptions.filter((member: any) => {
            if (!crewSections) {
                return true
            }
            return !crewSections.some(
                (section: any) => section.crewMemberID === member.value,
            )
        })
        setCrewMemberOptions(
            filteredCrewOptions.filter(
                (member: any) =>
                    !crewMembersList ||
                    !crewMembersList.includes(+member.value),
            ),
        )
        const crewManifestEntry: any = {
            id: 0,
            logBookEntryID: +logBookEntryID,
            crewMemberID: 0,
            dutyPerformedID: 0,
            punchIn: formatDBDateTime(dayjs()),
            punchOut: false,
        }
        setCrewManifestEntry(crewManifestEntry)
        setLoginTime(dayjs())
        setLogoutTime(false)
        setCrewMember(null)
        setDuty(null)
        setopenAddCrewMemberDialog(true)
    }

    const handleClearSignOut = () => {
        setLogoutTime(false)
    }

    const handleEditManifest = (memberData: any) => {
        if (!edit_logBookEntry) {
            toast.error('You do not have permission to edit this log entry')
            return
        }
        setCrewManifestEntry({
            id: memberData?.id,
            logBookEntryID: memberData?.logBookEntryID,
            crewMemberID: memberData?.crewMemberID,
            dutyPerformedID: memberData?.dutyPerformedID,
            punchIn: memberData?.punchIn,
            punchOut: memberData?.punchOut,
            workDetails: memberData?.workDetails,
        })
        setCrewMember({
            label: `${memberData.crewMember.firstName} ${memberData.crewMember.surname !== null ? memberData.crewMember.surname : ''}`,
            value: memberData.crewMember.id,
            data: memberData,
        })
        setDuty(
            duties
                .filter(
                    (memberDuty: any) =>
                        memberDuty.id === memberData?.dutyPerformedID,
                )
                .map((memberDuty: any) => ({
                    label: `${memberDuty.title}`,
                    value: memberDuty.id,
                })),
        )
        setLoginTime(memberData.punchIn ? dayjs(memberData.punchIn) : dayjs())
        setLogoutTime(memberData.punchOut ? dayjs(memberData.punchOut) : '')
        setopenAddCrewMemberDialog(true)
    }

    const handleSignOutTime = (memberData: any) => {
        if (!edit_logBookEntry) {
            toast.error('You do not have permission to edit this log entry')
            return
        }
        setCrewManifestEntry({
            id: memberData?.id,
            logBookEntryID: memberData?.logBookEntryID,
            crewMemberID: memberData?.crewMemberID,
            dutyPerformedID: memberData?.dutyPerformed.id,
            punchIn: memberData?.punchIn,
            punchOut: memberData?.punchOut,
            workDetails: memberData?.workDetails,
        })
        setCrewMember({
            label: `${memberData.crewMember.firstName} ${memberData.crewMember.surname !== null ? memberData.crewMember.surname : ''}`,
            value: memberData.crewMember.id,
            data: memberData,
        })
        setDuty(
            duties
                .filter(
                    (memberDuty: any) =>
                        memberDuty.id === memberData?.dutyPerformed.id,
                )
                .map((memberDuty: any) => ({
                    label: `${memberDuty.title}`,
                    value: memberDuty.id,
                })),
        )
        setLoginTime(memberData.punchIn ? dayjs(memberData.punchIn) : dayjs())
        setLogoutTime(
            memberData.punchOut ? dayjs(memberData.punchOut) : dayjs(),
        )

        setOpenEditLogoutTimeDialog(true)
    }

    const handleCrewMember = (value: any) => {
        setCrewMember(value)
        // Check if the crew has a training due
        if (value.data.trainingStatus.label !== 'Good') {
            setOpenCrewTrainingDueDialog(true)
        }
        // Set default duty
        const crewMember = allCrew.find(
            (member: any) => member.id === value.value,
        )
        if (crewMember && crewMember.primaryDutyID) {
            const crewDuty = duties.find(
                (d: any) => d.id === crewMember.primaryDutyID,
            )
            if (crewDuty) {
                const newDuty = {
                    label: crewDuty.title,
                    value: crewDuty.id,
                }
                setDuty(newDuty)
                setCrewManifestEntry({
                    ...crewManifestEntry,
                    crewMemberID: crewMember.id,
                    dutyPerformedID: crewDuty.id,
                })
            } else {
                setCrewManifestEntry({
                    ...crewManifestEntry,
                    crewMemberID: crewMember.id,
                })
            }
        }
    }

    const handleDuty = (value: any) => {
        setDuty(value)
        setCrewManifestEntry({
            ...crewManifestEntry,
            dutyPerformedID: value.value,
        })
    }

    const handleCancel = () => {
        setCrewManifestEntry({} as LogBookEntryCrewSection)
        setopenAddCrewMemberDialog(false)
        setOpenEditLogoutTimeDialog(false)
    }

    const handleSave = async (callBy?: string) => {
        const variables = {
            id: crewManifestEntry.id,
            crewMemberID: crewManifestEntry.crewMemberID,
            dutyPerformedID: +crewManifestEntry?.dutyPerformedID,
            logBookEntryID: +logBookEntryID,
            punchIn: loginTime
                ? dayjs(loginTime).format('YYYY-MM-DD HH:mm:ss')
                : null,
            punchOut: logoutTime ? formatDBDateTime(logoutTime) : null,
            workDetails: (
                document.getElementById('work-details') as HTMLInputElement
            )?.value
                ? (document.getElementById('work-details') as HTMLInputElement)
                      ?.value
                : '',
        }
        if (crewManifestEntry.id > 0) {
            if (offline) {
                await lbCrewModel.save(variables)
                const appendData = [...crew.map((c: any) => c.id)]
                setCrewManifestEntry({})
                let crewData = await lbCrewModel.getByIds(appendData)
                if (crewData) {
                    setCrew(crewData)
                    setCrewMembers(crewData)
                }
            } else {
                updateCrewMembers_LogBookEntrySection({
                    variables: { input: variables },
                })
            }

            setopenAddCrewMemberDialog(false)
            if (callBy === 'update') {
                setOpenEditLogoutTimeDialog(false)
            }
        } else if (crewManifestEntry.crewMemberID > 0) {
            if (offline) {
                const uniqueId = generateUniqueId()
                const data = {
                    ...variables,
                    id: uniqueId,
                }
                await lbCrewModel.save(data)
                const appendData = crew
                    ? [...crew?.map((c: any) => c.id), `${data.id}`]
                    : [`${data.id}`]
                setCrewManifestEntry({})
                let crewData = await lbCrewModel.getByIds(appendData)
                if (crewData) {
                    crewData = crewData.map((crew: any) => {
                        const member = allVesselCrews.find((c: any) => {
                            return c.id === crew.crewMemberID
                        })
                        const crewMember = GetCrewListWithTrainingStatus(
                            [member],
                            [vessel],
                        )[0]
                        const dutyPerformed = allDuties.find((d: any) => {
                            return d.id === crew.dutyPerformedID
                        })
                        return {
                            ...crew,
                            crewMember: crewMember,
                            dutyPerformed: dutyPerformed,
                        }
                    })
                    setCrew(crewData)
                    setCrewMembers(crewData)
                }
                /**
                 *
                 * const appendData = crew
                    ? [
                          ...crew?.map((c: any) => c.id),
                          data.createCrewMembers_LogBookEntrySection.id,
                      ]
                    : [data.createCrewMembers_LogBookEntrySection.id]
                setCrewManifestEntry({})
                const searchFilter: SearchFilter = {}
                searchFilter.id = { in: appendData }
                getSectionCrewMembers_LogBookEntrySection({
                    variables: {
                        filter: searchFilter,
                    },
                })
                 */
            } else {
                createCrewMembers_LogBookEntrySection({
                    variables: { input: variables },
                })
            }
            setopenAddCrewMemberDialog(false)
        } else {
            handleCancel()
        }
    }

    const [updateCrewMembers_LogBookEntrySection] = useMutation(
        UpdateCrewMembers_LogBookEntrySection,
        {
            onCompleted: (data) => {
                const appendData = [...crew.map((c: any) => c.id)]
                setCrewManifestEntry({})
                const searchFilter: SearchFilter = {}
                searchFilter.id = { in: appendData }
                getSectionCrewMembers_LogBookEntrySection({
                    variables: {
                        filter: searchFilter,
                    },
                })
            },
            onError: (error) => {
                console.error('updateCrewMembers_LogBookEntrySection', error)
            },
        },
    )

    const [
        createCrewWelfareCheck,
        {
            loading: createCrewWelfareCheckLoading,
            error: createCrewWelfareCheckError,
            data: createCrewWelfareCheckData,
        },
    ] = useMutation(CreateCrewWelfare_LogBookEntrySection, {
        onCompleted: (response) => {
            const data = response.createCrewWelfare_LogBookEntrySection
            updateCrewWelfare(data)
        },
        onError: (error) => {
            console.error('createCrewWelfareCheck', error)
        },
    })

    const [createCrewMembers_LogBookEntrySection] = useMutation(
        CreateCrewMembers_LogBookEntrySection,
        {
            onCompleted: (data) => {
                const appendData = crew
                    ? [
                          ...crew?.map((c: any) => c.id),
                          data.createCrewMembers_LogBookEntrySection.id,
                      ]
                    : [data.createCrewMembers_LogBookEntrySection.id]
                setCrewManifestEntry({})
                const searchFilter: SearchFilter = {}
                searchFilter.id = { in: appendData }
                getSectionCrewMembers_LogBookEntrySection({
                    variables: {
                        filter: searchFilter,
                    },
                })
            },
            onError: (error) => {
                console.error('createCrewMembers_LogBookEntrySection', error)
            },
        },
    )

    const [getSectionCrewMembers_LogBookEntrySection] = useLazyQuery(
        CrewMembers_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readCrewMembers_LogBookEntrySections.nodes
                if (data) {
                    setCrew(data)
                    setCrewMembers(data)
                }
            },
            onError: (error: any) => {
                console.error(
                    'getSectionCrewMembers_LogBookEntrySection',
                    error,
                )
            },
        },
    )

    const handleArchive = async () => {
        const variables = {
            id: crewManifestEntry.id,
            archived: true,
        }
        if (offline) {
            await lbCrewModel.save(variables)
            const appendData = [...crew.map((c: any) => c.id)]
            setCrewManifestEntry({})
            const searchFilter: SearchFilter = {}
            searchFilter.id = { in: appendData }
            const data = await lbCrewModel.getByIds(appendData)
            if (data) {
                setCrew(data)
                setCrewMembers(data)
            }
        } else {
            updateCrewMembers_LogBookEntrySection({
                variables: { input: variables },
            })
        }

        setopenAddCrewMemberDialog(false)
    }

    const confirmDeleteCrew = () => {
        if (crewMember) {
            setOpenConfirmCrewDeleteDialog(true)
        }
    }
    const [deleteCrewMembersLogBookEntrySections] = useMutation(
        DeleteCrewMembers_LogBookEntrySections,
        {
            onCompleted: (data) => {
                const appendData = [...crew.map((c: any) => c.id)]
                const searchFilter: SearchFilter = {}
                searchFilter.id = { in: appendData }
                getSectionCrewMembers_LogBookEntrySection({
                    variables: {
                        filter: searchFilter,
                    },
                })
                setOpenConfirmCrewDeleteDialog(false)
                setopenAddCrewMemberDialog(false)
            },
            onError: (error) => {
                console.error(
                    'deleteCrewMembersLogBookEntrySections error:',
                    error,
                )
            },
        },
    )
    const handleDeleteCrew = async () => {
        if (crewMember) {
            const logEntry = crewSections.find((cs: any) => {
                return cs.crewMemberID === crewMember.value
            })
            const sectionID = +logEntry.id || 0
            if (sectionID > 0) {
                if (offline) {
                    // const result = await lbCrewModel.deleteById(sectionID)
                    const result = await lbCrewModel.delete(logEntry)
                    if (result) {
                        const appendData = [...crew.map((c: any) => c.id)]
                        const data = await lbCrewModel.getByIds(appendData)
                        if (data) {
                            setCrew(data)
                            setCrewMembers(data)
                        }
                        setOpenConfirmCrewDeleteDialog(false)
                        setopenAddCrewMemberDialog(false)
                    }
                } else {
                    await deleteCrewMembersLogBookEntrySections({
                        variables: {
                            ids: [sectionID],
                        },
                    })
                }
            }
        }
    }
    let overdueTextWarning = (
        //<ExclamationTriangleIcon className={`h-7 w-7 text-red-500`} />
        <div className="mr-1 h-6 w-6 flex-shrink-0">
            <svg
                viewBox="0 0 98.75 98.7516"
                stroke="#022450"
                strokeMiterlimit="10"
                strokeWidth=".75px"
                className={`h-6 w-6`}>
                <path
                    d="M49.375,1.1898c26.5687,0,48.1852,21.6165,48.1852,48.186s-21.6165,48.186-48.1852,48.186S1.1898,75.9453,1.1898,49.3758,22.8063,1.1898,49.375,1.1898Z"
                    fill="#ffffff"
                />
                <path
                    d="M49.375,98.3766c27.0191,0,49-21.9817,49-49.0008S76.3941.375,49.375.375.375,22.3567.375,49.3758s21.9809,49.0008,49,49.0008ZM49.375,1.1898c26.5687,0,48.1852,21.6165,48.1852,48.186s-21.6165,48.186-48.1852,48.186S1.1898,75.9453,1.1898,49.3758,22.8063,1.1898,49.375,1.1898Z"
                    fill="#022450"
                />
                <path
                    d="M40.1112,55.766h18.5277c.3237,0,.5877-.2875.5877-.6427V16.0185c0-.3552-.264-.6427-.5877-.6427h-18.5277c-.3237,0-.5877.2875-.5877.6427v39.1048c0,.3552.264.6427.5877.6427Z"
                    fill="#2a99ea"
                    strokeWidth="1.1315px"
                />
                <path
                    d="M49.375,84.3758c5.82,0,10.5564-4.7352,10.5564-10.5564s-4.7364-10.5564-10.5564-10.5564-10.5564,4.7352-10.5564,10.5564,4.7364,10.5564,10.5564,10.5564Z"
                    fill="#2a99ea"
                    strokeWidth="1.1315px"
                />
            </svg>
        </div>
    )

    return (
        <div className="w-full dark:text-white">
            <p className={classes.helpText}>
                This section covers the crew manifest for the voyage
            </p>
            <div className="flex flex-col lg:flex-row my-4 gap-2">
                <div className="w-full lg:w-2/3">
                    {crew ? (
                        <>
                            <div className="w-full ">
                                <TableWrapper
                                    className={'overflow-visible font-normal'}
                                    headings={[]}>
                                    <tr className="hidden md:table-row">
                                        <td></td>
                                        <td className="hidden lg:table-cell"></td>
                                        <td className="text-left border-b border-sllightblue-200 p-2">
                                            <label className={classes.label}>
                                                Sign in
                                            </label>
                                        </td>
                                        <td className="text-left border-b border-sllightblue-200 p-2">
                                            <label className={classes.label}>
                                                Sign out
                                            </label>
                                        </td>
                                    </tr>
                                    {crew
                                        .filter(
                                            (member: any) =>
                                                member.crewMemberID > 0 &&
                                                member.crewMember.archived ===
                                                    false,
                                        )
                                        .map((member: any) => {
                                            return (
                                                <tr
                                                    key={member.id}
                                                    className={`group border-b dark:border-slblue-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                                    <td className="p-2 text-left min-w-1/2 items-end border-y md:border-0 border-slblue-100">
                                                        <div className="flex flex-row gap-1 items-center">
                                                            {member?.crewMember
                                                                ?.trainingStatus
                                                                ?.label !==
                                                            'Good' ? (
                                                                <div>
                                                                    {
                                                                        overdueTextWarning
                                                                    }
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <img
                                                                        src="/sealogs-ok-check.svg"
                                                                        alt="All OK"
                                                                        className="mr-1 h-6 w-6 flex-shrink-0"
                                                                    />
                                                                </div>
                                                            )}
                                                            <p>
                                                                <Button
                                                                    className={`${locked ? 'pointer-events-none' : ''} group-hover:text-sllightblue-1000 text-left`}
                                                                    onPress={() =>
                                                                        handleEditManifest(
                                                                            member,
                                                                        )
                                                                    }>
                                                                    {
                                                                        member
                                                                            .crewMember
                                                                            .firstName
                                                                    }{' '}
                                                                    {
                                                                        member
                                                                            .crewMember
                                                                            .surname
                                                                    }
                                                                </Button>
                                                                {member.workDetails && (
                                                                    <DialogTrigger>
                                                                        <SeaLogsButton
                                                                            icon="alert"
                                                                            className="w-6 h-6 ml-2"
                                                                        />
                                                                        <Popover>
                                                                            <div className="bg-slblue-50 rounded p-2">
                                                                                <div className="text-xs whitespace-nowrap font-medium focus:outline-none inline-block rounded px-3 py-1 bg-slblue-100 text-sblue-800">
                                                                                    {
                                                                                        member.workDetails
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </Popover>
                                                                    </DialogTrigger>
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div
                                                            className={`${locked ? 'pointer-events-none' : ''} block lg:hidden justify-start my-2`}>
                                                            <CrewDutyDropdown
                                                                offline={
                                                                    offline
                                                                }
                                                                crewDutyID={
                                                                    member
                                                                        .dutyPerformed
                                                                        ?.id
                                                                }
                                                                onChange={
                                                                    handleDuty
                                                                }
                                                                menuPlacement={
                                                                    'bottom'
                                                                }
                                                                filterCustomClassName={
                                                                    customWidth
                                                                }
                                                            />
                                                        </div>
                                                        <div className="block md:hidden justify-start my2">
                                                            <div className="flex flex-row">
                                                                <label
                                                                    className={`${classes.label} !w-24`}>
                                                                    Sign
                                                                    in:&nbsp;
                                                                </label>
                                                                <span className="text-nowrap w-full">
                                                                    {member?.punchIn
                                                                        ? formatDateTime(
                                                                              member.punchIn,
                                                                          )
                                                                        : 'Not Available'}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-row">
                                                                <label
                                                                    className={`${classes.label} !w-24`}>
                                                                    Sign
                                                                    out:&nbsp;
                                                                </label>
                                                                <span className="text-nowrap w-full">
                                                                    {!member.punchOut ? (
                                                                        <button
                                                                            type="button"
                                                                            className={`text-2xs font-normal text-sllightblue-50 bg-slblue-800 border px-2 py-1 rounded-md shadow-sm ring-inset ring-slblue-1000 hover:ring-slblue-1000 hover:bg-slblue-1000 hover:text-white ${locked ? 'pointer-events-none' : ''}`}
                                                                            onClick={() =>
                                                                                handleSignOutTime(
                                                                                    member,
                                                                                )
                                                                            }>
                                                                            Sign
                                                                            out
                                                                        </button>
                                                                    ) : (
                                                                        formatDateTime(
                                                                            member.punchOut,
                                                                        )
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td
                                                        className={`${locked ? 'pointer-events-none' : ''} hidden lg:table-cell justify-start text-left p-2`}>
                                                        <CrewDutyDropdown
                                                            offline={offline}
                                                            crewDutyID={
                                                                member
                                                                    .dutyPerformed
                                                                    ?.id
                                                            }
                                                            onChange={
                                                                handleDuty
                                                            }
                                                            menuPlacement={
                                                                'bottom'
                                                            }
                                                            filterCustomClassName={
                                                                customWidth
                                                            }
                                                        />
                                                    </td>
                                                    <td className="hidden md:table-cell p-2 text-left text-xs">
                                                        {member?.punchIn
                                                            ? formatDateTime(
                                                                  member?.punchIn,
                                                              )
                                                            : 'Not Available'}
                                                    </td>
                                                    <td className="hidden md:table-cell p-2 text-left text-xs">
                                                        {!member.punchOut ? (
                                                            <button
                                                                type="button"
                                                                className={`text-sm font-normal text-sllightblue-50 bg-slblue-800 border px-4 py-2 rounded-md shadow-sm ring-inset ring-slblue-1000 hover:ring-slblue-1000 hover:bg-slblue-1000 hover:text-white ${locked ? 'pointer-events-none' : ''}`}
                                                                onClick={() =>
                                                                    handleSignOutTime(
                                                                        member,
                                                                    )
                                                                }>
                                                                Sign out
                                                            </button>
                                                        ) : (
                                                            formatDateTime(
                                                                member?.punchOut,
                                                            )
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                </TableWrapper>
                                <div className="flex justify-between my-4">
                                    <div className="pl-5 text-sm">
                                        {crew.filter(
                                            (member: any) =>
                                                member.crewMemberID > 0 &&
                                                member.crewMember.archived ===
                                                    false,
                                        ).length >= vessel?.minCrew ? (
                                            <img
                                                src="/sealogs-ok-check.svg"
                                                alt="Warning"
                                                className="h-9 w-9 inline-block mr-2"
                                            />
                                        ) : (
                                            <img
                                                src="/sealogs-not-ok-check2.svg"
                                                className="h-9 w-9 inline-block mr-2"
                                            />
                                        )}
                                        Minimum crew: {vessel?.minCrew}{' '}
                                    </div>
                                    <button
                                        type="button"
                                        className={`w-48 text-sm font-semibold text-slorange-1000 bg-slorange-300 border px-4 py-2 border-transparent rounded-md shadow-sm ring-1 ring-inset ring-slorange-1000 hover:ring-sldarkblue-1000 hover:bg-sldarkblue-1000 hover:text-white ${locked ? 'pointer-events-none' : ''}`}
                                        onClick={handleAddManifest}>
                                        Add crew member
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <button
                                type="button"
                                className={`text-sm font-semibold text-slorange-1000 bg-slorange-300 border px-4 py-2 border-transparent rounded-md shadow-sm ring-1 ring-inset ring-slorange-1000 hover:ring-sldarkblue-1000 hover:bg-sldarkblue-1000 hover:text-white ${locked ? 'pointer-events-none' : ''}`}
                                onClick={handleAddManifest}>
                                Add crew members to this trip
                            </button>
                        </div>
                    )}
                </div>
                <div className={`w-full lg:w-1/3 ${crew ? '' : 'hidden'}`}>
                    {logBookConfig &&
                    logBookConfig?.customisedLogBookComponents?.nodes?.find(
                        (config: any) =>
                            config.title === 'Crew Welfare' &&
                            config.active === true,
                    ) ? (
                        <div className="mt-0 mb-4 border border-slblue-200 rounded-lg bg-white w-full  dark:bg-sldarkblue-800">
                            <Heading className="text-bold border-b p-4">
                                Crew Welfare
                            </Heading>
                            <CrewWelfare
                                offline={offline}
                                logBookConfig={logBookConfig}
                                locked={locked || !edit_logBookEntry}
                                crewWelfareCheck={crewWelfareCheck}
                                updateCrewWelfare={updateCrewWelfare}
                            />
                        </div>
                    ) : (
                        ' '
                    )}
                </div>
            </div>
            <AlertDialog
                openDialog={openAddCrewMemberDialog}
                setOpenDialog={setopenAddCrewMemberDialog}
                handleCreate={handleAddCrewMemberDialog}>
                <div className="bg-slblue-1000 -m-6 rounded-t-lg">
                    <Heading className="text-xl text-white font-medium p-6">
                        {crewManifestEntry.id > 0
                            ? 'Update crew member'
                            : 'Add crew member'}
                    </Heading>
                </div>
                <div className=" text-slblue-800 dark:text-white  mt-6 pt-6">
                    <div className="flex gap-4 mb-4">
                        <div className="w-1/2">
                            <label className={`${classes.label} block`}>
                                Crew member
                            </label>
                            <Select
                                id="crew-member"
                                closeMenuOnSelect={true}
                                options={crewMemberOptions}
                                menuPlacement="top"
                                value={crewMember}
                                onChange={handleCrewMember}
                                className={classes.selectMain}
                                classNames={{
                                    control: () => classes.selectControl,
                                    singleValue: () =>
                                        classes.selectSingleValue,
                                    dropdownIndicator: () =>
                                        classes.selectDropdownIndicator,
                                    menu: () => classes.selectMenu,
                                    indicatorSeparator: () =>
                                        classes.selectIndicatorSeparator,
                                    multiValue: () => classes.selectMultiValue,
                                    clearIndicator: () =>
                                        classes.selectClearIndicator,
                                    valueContainer: () =>
                                        classes.selectValueContainer,
                                    option: () => classes.selectOption,
                                    input: () => '!py-1',
                                }}
                            />
                        </div>
                        <div className="w-3/8">
                            <label className={`${classes.label} block`}>
                                Primary duty
                            </label>
                            {/* {queryDutiesData && duties && ( */}
                            <CrewDutyDropdown
                                offline={offline}
                                crewDutyID={crewManifestEntry.dutyPerformedID}
                                // duties={duties}
                                onChange={handleDuty}
                                menuPlacement={'bottom'}
                                filterCustomClassName={customWidth}
                            />
                            {/* )} */}
                        </div>
                    </div>
                    <div className="flex gap-4 mb-4">
                        {/* safeFuelCapacity */}
                        <div className="w-1/2">
                            <label className={`${classes.label} block`}>
                                Sign in
                            </label>
                            <DialogTrigger>
                                <Button className="w-full">
                                    <input
                                        id="signin-date"
                                        name="signin-date"
                                        type="text"
                                        value={formatDateTime(loginTime)}
                                        className={`${classes.input}`}
                                        aria-describedby="signin-date-error"
                                        required
                                        onChange={handleLogin}
                                    />
                                </Button>
                                <ModalOverlay
                                    className={({ isEntering, isExiting }) => `
                                                fixed inset-0 z-[15002] overflow-y-auto bg-black/25 flex min-h-full justify-center p-4 text-center backdrop-blur
                                                ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                                                ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                                                `}>
                                    <Modal>
                                        <Dialog
                                            role="alertdialog"
                                            className="outline-none relative">
                                            {({ close }) => (
                                                <LocalizationProvider
                                                    dateAdapter={AdapterDayjs}>
                                                    <StaticDateTimePicker
                                                        className={`p-0 mr-4`}
                                                        defaultValue={loginTime}
                                                        onAccept={close}
                                                        onClose={close}
                                                        onChange={handleLogin}
                                                    />
                                                </LocalizationProvider>
                                            )}
                                        </Dialog>
                                    </Modal>
                                </ModalOverlay>
                            </DialogTrigger>
                        </div>
                        <div className="w-1/2">
                            <label className={`${classes.label} block`}>
                                Sign out
                            </label>
                            <DialogTrigger>
                                <Button className="w-full">
                                    <input
                                        id="signout-date"
                                        name="signout-date"
                                        type="text"
                                        value={
                                            logoutTime
                                                ? formatDateTime(logoutTime)
                                                : ''
                                        }
                                        placeholder="Sign out time"
                                        className={`${classes.input}`}
                                        aria-describedby="signout-date-error"
                                        required
                                        onChange={handleLogout}
                                    />
                                </Button>
                                <ModalOverlay
                                    className={({ isEntering, isExiting }) => `
                                                    fixed inset-0 z-[15002] overflow-y-auto bg-black/25 flex min-h-full justify-center p-4 text-center backdrop-blur
                                                    ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                                                    ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                                                    `}>
                                    <Modal>
                                        <Dialog
                                            role="alertdialog"
                                            className="outline-none relative">
                                            {({ close }) => (
                                                <LocalizationProvider
                                                    dateAdapter={AdapterDayjs}>
                                                    <StaticDateTimePicker
                                                        className={`p-0 mr-4`}
                                                        defaultValue={
                                                            logoutTime
                                                                ? logoutTime
                                                                : dayjs()
                                                        }
                                                        onAccept={close}
                                                        onClose={close}
                                                        onChange={handleLogout}
                                                    />
                                                </LocalizationProvider>
                                            )}
                                        </Dialog>
                                    </Modal>
                                </ModalOverlay>
                            </DialogTrigger>
                            {logoutTime && (
                                <a
                                    href="javascript:void(0)"
                                    className="text-sm font-light text-danger absolute mt-3 right-11"
                                    onClick={() => handleClearSignOut()}>
                                    <Image
                                        src="/sealogs-close-black.svg"
                                        width={15}
                                        height={15}
                                        alt="close"
                                    />
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label className={`${classes.label} block`}>
                            Work details
                        </label>
                        <textarea
                            id="work-details"
                            name="work-details"
                            rows={4}
                            className={`${classes.textarea} p-2`}
                            placeholder="Enter work details"
                            defaultValue={crewManifestEntry?.workDetails}
                        />
                    </div>
                </div>
                <div
                    className={`mt-8 flex ${
                        crewMember &&
                        Array.isArray(crewSections) &&
                        crewSections?.some(
                            (section: any) =>
                                section?.crewMember?.id === crewMember.value,
                        )
                            ? 'justify-between'
                            : 'justify-end'
                    } items-center`}>
                    {crewMember &&
                        Array.isArray(crewSections) &&
                        crewSections?.some(
                            (section: any) =>
                                section?.crewMember?.id === crewMember.value,
                        ) && (
                            <div>
                                <SeaLogsButton
                                    action={confirmDeleteCrew}
                                    type="delete"
                                    text="Delete"
                                    icon="cross"
                                />
                            </div>
                        )}
                    <div className="flex items-center ">
                        <SeaLogsButton
                            action={handleCancel}
                            type="text"
                            text="Cancel"
                        />
                        <SeaLogsButton
                            color="slblue"
                            action={handleSave}
                            icon="check"
                            type="primary"
                            text={
                                crewManifestEntry.id > 0
                                    ? 'Update crew'
                                    : 'Add crew'
                            }
                        />
                    </div>
                </div>
            </AlertDialog>
            <AlertDialog
                openDialog={openEditLogoutTimeDialog}
                setOpenDialog={setOpenEditLogoutTimeDialog}
                handleCreate={handleSignOutTime}>
                <div className="bg-slblue-1000 -m-6 rounded-t-lg">
                    <Heading className="text-xl text-white font-medium p-6 ">
                        Add sign out time
                    </Heading>
                </div>
                <div className="grid grid-cols-1 gap-4 text-slblue-700 mt-6 pt-6">
                    <div className="flex gap-8">
                        {/* safeFuelCapacity */}

                        <div className="w-full">
                            <label className="block font-light text-xs">
                                Sign Out Time
                            </label>

                            <DialogTrigger>
                                <Button className="w-full">
                                    <input
                                        id="signout-date"
                                        name="signout-date"
                                        type="text"
                                        value={
                                            logoutTime
                                                ? formatDateTime(logoutTime)
                                                : ''
                                        }
                                        placeholder="Sign Out Time"
                                        className={`${classes.input}`}
                                        aria-describedby="signout-date-error"
                                        required
                                        onChange={handleLogout}
                                    />
                                </Button>
                                <ModalOverlay
                                    className={({ isEntering, isExiting }) => `
                                                fixed inset-0 z-[15002] overflow-y-auto bg-black/25 flex min-h-full justify-center p-4 text-center backdrop-blur
                                                ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                                                ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                                                `}>
                                    <Modal>
                                        <Dialog
                                            role="alertdialog"
                                            className="outline-none relative">
                                            {({ close }) => (
                                                <LocalizationProvider
                                                    dateAdapter={AdapterDayjs}>
                                                    <StaticDateTimePicker
                                                        className={`p-0 mr-4`}
                                                        defaultValue={
                                                            logoutTime
                                                                ? logoutTime
                                                                : dayjs()
                                                        }
                                                        onAccept={close}
                                                        onClose={close}
                                                        onChange={handleLogout}
                                                    />
                                                </LocalizationProvider>
                                            )}
                                        </Dialog>
                                    </Modal>
                                </ModalOverlay>
                            </DialogTrigger>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <SeaLogsButton
                        action={handleCancel}
                        type="text"
                        text="Cancel"
                    />

                    <SeaLogsButton
                        color="slblue"
                        action={() => handleSave('update')}
                        icon="check"
                        type="primary"
                        text="Update Time"
                    />
                </div>
            </AlertDialog>
            <AlertDialog
                openDialog={openCrewTrainingDueDialog}
                setOpenDialog={setOpenCrewTrainingDueDialog}>
                <div className="bg-slblue-1000 -m-6 rounded-t-lg">
                    <Heading className="text-xl text-white font-medium p-6">
                        {crewMember?.label}
                    </Heading>
                </div>
                <div className="grid grid-cols-1 gap-4 text-slblue-800  mt-6 pt-6">
                    <p>
                        This crew member has overdue training sessions on this
                        vessel. These sessions are:
                    </p>

                    {crewMember?.data?.trainingStatus?.dues.map(
                        (item: any, dueIndex: number) => (
                            <p key={dueIndex}>
                                {`${item.trainingType.title} - ${item.status.label}`}
                            </p>
                        ),
                    )}

                    <p>
                        Do you still want to add this crew member to this
                        vessel?
                    </p>
                </div>
                <div className="mt-8 flex justify-end">
                    <SeaLogsButton
                        action={() => {
                            setOpenCrewTrainingDueDialog(false)
                        }}
                        type="text"
                        text="Cancel"
                    />
                    <SeaLogsButton
                        color="slblue"
                        action={() => {
                            setOpenCrewTrainingDueDialog(false)
                        }}
                        icon="check"
                        type="primary"
                        text="OK"
                    />
                </div>
            </AlertDialog>
            <AlertDialog
                openDialog={openConfirmCrewDeleteDialog}
                setOpenDialog={setOpenConfirmCrewDeleteDialog}
                handleCreate={handleArchive}
                actionText="Delete Crew">
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2 ">
                    Delete Crew
                </Heading>
                <div className="my-4 flex items-center">
                    Are you sure you want to delete {crewMember?.label}?
                </div>
            </AlertDialog>
            <Toaster position="top-right" />
        </div>
    )
}
