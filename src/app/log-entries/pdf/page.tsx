'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import {
    GET_CREW_BY_IDS,
    GET_CREW_BY_LOGENTRY_ID,
    VESSEL_INFO,
    CREW_LIST,
    CREW_DUTY,
    GET_CREW_TRAINING_CONFIG,
    AssetReporting_LogBookEntrySection,
    CrewMembers_LogBookEntrySection,
    CrewTraining_LogBookEntrySection,
    Engineer_LogBookEntrySection,
    Engine_LogBookEntrySection,
    Fuel_LogBookEntrySection,
    Ports_LogBookEntrySection,
    Supernumerary_LogBookEntrySection,
    VesselDailyCheck_LogBookEntrySection,
    VoyageSummary_LogBookEntrySection,
    CrewWelfare_LogBookEntrySection,
    LogBookSignOff_LogBookEntrySection,
    GET_LOGBOOK_CONFIG,
    GET_SECTION_MEMBER_COMMENTS,
    GET_LOGBOOK_ENTRY_BY_ID,
    GetCrewMembersFromOpenLogBook,
    DetailedTripReport_LogBookEntrySection,
} from '@/app/lib/graphQL/query'
import React from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { LogBookEntrySkeleton } from '@/app/ui/skeletons'
import { init } from 'next/dist/compiled/webpack/webpack'
import { initial } from 'lodash'
import Image from 'next/image'
import {
    getClientByID,
    GetLogBookEntriesMembers,
    getOneClient,
    getVesselByID,
} from '@/app/lib/actions'
import { formatDate, formatDateTime } from '@/app/helpers/dateHelper'
import { SLALL_LogBookFields } from '@/app/lib/vesselDefaultConfig'
import dayjs from 'dayjs'
import { getFieldLabel } from '@/app/ui/daily-checks/actions'
import { sign } from 'crypto'
import Loading from '@/app/loading'

export default function Page() {
    const searchParams = useSearchParams()
    const vesselID = searchParams.get('vesselID') ?? 0
    const logentryID = searchParams.get('logentryID') ?? 0
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const [master, setMaster] = useState<any>()
    const [client, setClient] = useState<any>()
    const [logbook, setLogbook] = useState<any>()
    const [vessel, setVessel] = useState<any>()
    const [crew, setCrew] = useState<any>()
    const [duties, setDuties] = useState<any>()
    const [allCrew, setAllCrew] = useState<any>()
    const [loaded, setLoaded] = useState(false)
    const [initialized, setInitialized] = useState(false)
    const [locked, setLocked] = useState(false)
    const [logEntrySections, setLogEntrySections] = useState<any>()
    const [engine, setEngine] = useState<any>()
    const [fuel, setFuel] = useState<any>()
    const [ports, setPorts] = useState<any>()
    const [vesselDailyCheck, setVesselDailyCheck] = useState<any>(false)
    const [signOff, setSignOff] = useState<any>()
    const [voyageSummary, setVoyageSummary] = useState<any>()
    const [tripReport, setTripReport] = useState<any>()
    const [crewMembers, setCrewMembers] = useState<any>()
    const [crewTraining, setCrewTraining] = useState<any>()
    const [supernumerary, setSupernumerary] = useState<any>()
    const [engineer, setEngineer] = useState<any>()
    const [assetReporting, setAssetReporting] = useState<any>()
    const [crewWelfare, setCrewWelfare] = useState<any>()
    const [crewMembersList, setCrewMembersList] = useState<any>()
    const [signOffComment, setSignOffComment] = useState<any>()
    const [dailyCheckComments, setDailyCheckComments] = useState<any>()
    const [logBookConfig, setLogBookConfig] = useState<any>(false)
    const [dailyCheckCombined, setDailyCheckCombined] = useState<any>(false)
    const [loadedChecks, setLoadedChecks] = useState<any>({
        checks: false,
        client: false,
        config: false,
        crew_members: false,
        daily_checks: false,
        daily_comments: false,
        sign_off: false,
        sign_off_comments: false,
        trip_report: false,
        vessel: false,
    })
    const [signOffEmbeddedFields, setSignOffEmbeddedFields] =
        useState<any>(false)

    const handleSetVessel = (vessel: any) => {
        setVessel(vessel)
        setLoadedChecks({ ...loadedChecks, vessel: true })
    }

    getVesselByID(+vesselID, handleSetVessel)
    const handleSetClient = (client: any) => {
        setClient(client)
        setLoadedChecks({ ...loadedChecks, client: true })
    }
    getOneClient(handleSetClient)

    const [queryLogBookConfig] = useLazyQuery(GET_LOGBOOK_CONFIG, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneCustomisedLogBookConfig
            if (data) {
                setLogBookConfig(data)
                setLoadedChecks({ ...loadedChecks, config: true })
            }
        },
        onError: (error: any) => {
            console.error('queryLogBookConfig error', error)
        },
    })
    const [getSectionEngine_LogBookEntrySection] = useLazyQuery(
        Engine_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readEngine_LogBookEntrySections.nodes
                setEngine(data)
            },
            onError: (error: any) => {
                console.error('Engine_LogBookEntrySection error', error)
            },
        },
    )
    const [getSectionFuel_LogBookEntrySection] = useLazyQuery(
        Fuel_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readFuel_LogBookEntrySections.nodes
                setFuel(data)
            },
            onError: (error: any) => {
                console.error('Fuel_LogBookEntrySection error', error)
            },
        },
    )
    const [getSectionPorts_LogBookEntrySection] = useLazyQuery(
        Ports_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readPorts_LogBookEntrySections.nodes
                setPorts(data)
            },
            onError: (error: any) => {
                console.error('Ports_LogBookEntrySection error', error)
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
                setVesselDailyCheck(data[0])
                setLoadedChecks({ ...loadedChecks, daily_checks: true })
                queryDailyCheckMemberComments({
                    variables: {
                        filter: {
                            logBookEntrySectionID: { eq: data[0].id },
                        },
                    },
                })
            },
            onError: (error: any) => {
                console.error(
                    'VesselDailyCheck_LogBookEntrySection error',
                    error,
                )
            },
        },
    )
    const [getLogBookSignOff_LogBookEntrySection] = useLazyQuery(
        LogBookSignOff_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readLogBookSignOff_LogBookEntrySections.nodes
                setSignOff(data[0])
                setLoadedChecks({ ...loadedChecks, sign_off: true })
                querySectionMemberComments({
                    variables: {
                        filter: {
                            logBookEntrySectionID: { eq: data[0].id },
                        },
                    },
                })
            },
            onError: (error: any) => {
                console.error('LogBookSignOff_LogBookEntrySection error', error)
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
                    setSignOffComment(data)
                    setLoadedChecks({
                        ...loadedChecks,
                        sign_off_comments: true,
                    })
                }
            },
            onError: (error: any) => {
                console.error('querySectionMemberComments error', error)
            },
        },
    )
    const [queryDailyCheckMemberComments] = useLazyQuery(
        GET_SECTION_MEMBER_COMMENTS,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readSectionMemberComments.nodes
                if (data) {
                    setDailyCheckComments(data)
                    setLoadedChecks({ ...loadedChecks, daily_comments: true })
                }
            },
            onError: (error: any) => {
                console.error('queryDailyCheckMemberComments error', error)
            },
        },
    )
    const [getSectionVoyageSummary_LogBookEntrySection] = useLazyQuery(
        VoyageSummary_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readVoyageSummary_LogBookEntrySections.nodes
                setVoyageSummary(data)
            },
            onError: (error: any) => {
                console.error('VoyageSummary_LogBookEntrySection error', error)
            },
        },
    )
    const [getSectionTripReport_LogBookEntrySection] = useLazyQuery(
        DetailedTripReport_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readTripReport_LogBookEntrySections.nodes
                setTripReport(data)
                setLoadedChecks({ ...loadedChecks, trip_report: true })
            },
            onError: (error: any) => {
                console.error('TripReport_LogBookEntrySection error', error)
            },
        },
    )
    const [getSectionCrewMembers_LogBookEntrySection] = useLazyQuery(
        CrewMembers_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                let data = response.readCrewMembers_LogBookEntrySections.nodes
                setCrewMembers(data)
                setLoadedChecks({ ...loadedChecks, crew_members: true })
            },
            onError: (error: any) => {
                console.error('CrewMembers_LogBookEntrySection error', error)
            },
        },
    )
    const handleSetCrewMembers = (crewMembers: any) => {
        const crewMemberList = crewMembers.filter(
            (item: any) =>
                !logEntrySections
                    ?.filter(
                        (item: any) =>
                            item.className ===
                            'SeaLogs\\CrewMembers_LogBookEntrySection',
                    )
                    ?.flatMap((item: any) => +item.ids)
                    ?.includes(item),
        )
        if (crewMemberList && crewMemberList.length > 0) {
            getCrewMembersFromOpenLogBook({
                variables: {
                    ids: crewMemberList,
                },
            })
        }
    }
    const [getCrewMembersFromOpenLogBook] = useLazyQuery(
        GetCrewMembersFromOpenLogBook,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                let data = response.readCrewMembers_LogBookEntrySections.nodes
                setCrewMembersList(
                    Array.from(
                        new Set(
                            data
                                .flatMap((item: any) => item.crewMember)
                                .flatMap((item: any) => +item.id),
                        ),
                    ),
                )
            },
            onError: (error: any) => {
                console.error('CrewMembers_LogBookEntrySection error', error)
            },
        },
    )

    GetLogBookEntriesMembers(handleSetCrewMembers)

    const [getSectionCrewTraining_LogBookEntrySection] = useLazyQuery(
        CrewTraining_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readCrewTraining_LogBookEntrySections.nodes
                setCrewTraining(data)
            },
            onError: (error: any) => {
                console.error('CrewTraining_LogBookEntrySection error', error)
            },
        },
    )
    const [getSectionSupernumerary_LogBookEntrySection] = useLazyQuery(
        Supernumerary_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readSupernumerary_LogBookEntrySections.nodes
                setSupernumerary(data)
            },
            onError: (error: any) => {
                console.error('Supernumerary_LogBookEntrySection error', error)
            },
        },
    )
    const [getSectionEngineer_LogBookEntrySection] = useLazyQuery(
        Engineer_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readEngineer_LogBookEntrySections.nodes
                setEngineer(data)
            },
            onError: (error: any) => {
                console.error('Engineer_LogBookEntrySection error', error)
            },
        },
    )
    const [getSectionAssetReporting_LogBookEntrySection] = useLazyQuery(
        AssetReporting_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readAssetReporting_LogBookEntrySections.nodes
                setAssetReporting(data)
            },
            onError: (error: any) => {
                console.error('AssetReporting_LogBookEntrySection error', error)
            },
        },
    )
    const [getSectionCrewWelfare_LogBookEntrySection] = useLazyQuery(
        CrewWelfare_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readCrewWelfare_LogBookEntrySections.nodes
                setCrewWelfare(data)
            },
            onError: (error: any) => {
                console.error('CrewWelfare_LogBookEntrySection error', error)
            },
        },
    )
    const handleSetLogbook = (logbook: any) => {
        setLogbook(logbook)
        setMaster(logbook.master)
        setLoadedChecks({ ...loadedChecks, master: true, logbook: true })
        queryLogBookConfig({
            variables: {
                id: logbook.logBook.id,
            },
        })
        logbook.state === 'Locked' ? setLocked(true) : setLocked(false)
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

        setLogEntrySections(sectionTypes)

        if (
            sectionTypes.find(
                (section: any) =>
                    section.className ===
                    'SeaLogs\\TripReport_LogBookEntrySection',
            )
        ) {
            setLoadedChecks({
                ...loadedChecks,
                daily_checks: true,
                daily_comments: true,
            })
        }

        if (
            sectionTypes.find(
                (section: any) =>
                    section.className ===
                    'SeaLogs\\LogBookSignOff_LogBookEntrySection',
            )
        ) {
            setLoadedChecks({
                ...loadedChecks,
                sign_off: true,
                sign_off_comments: true,
            })
        }

        sectionTypes.forEach((section: any) => {
            if (section.className === 'SeaLogs\\Engine_LogBookEntrySection') {
                getSectionEngine_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }
            if (section.className === 'SeaLogs\\Fuel_LogBookEntrySection') {
                getSectionFuel_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }
            if (section.className === 'SeaLogs\\Ports_LogBookEntrySection') {
                getSectionPorts_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }
            if (
                section.className ===
                'SeaLogs\\VesselDailyCheck_LogBookEntrySection'
            ) {
                setLoadedChecks({
                    ...loadedChecks,
                    daily_checks: false,
                    daily_comments: false,
                })
                getSectionVesselDailyCheck_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }
            if (
                section.className ===
                'SeaLogs\\LogBookSignOff_LogBookEntrySection'
            ) {
                setLoadedChecks({
                    ...loadedChecks,
                    sign_off: false,
                    sign_off_comments: false,
                })
                getLogBookSignOff_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }

            if (
                section.className === 'SeaLogs\\CrewWelfare_LogBookEntrySection'
            ) {
                getSectionCrewWelfare_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }
            if (
                section.className ===
                'SeaLogs\\VoyageSummary_LogBookEntrySection'
            ) {
                getSectionVoyageSummary_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }
            if (
                section.className === 'SeaLogs\\TripReport_LogBookEntrySection'
            ) {
                getSectionTripReport_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }
            if (
                section.className === 'SeaLogs\\CrewMembers_LogBookEntrySection'
            ) {
                const searchFilter: SearchFilter = {}
                searchFilter.id = { in: section.ids }
                getSectionCrewMembers_LogBookEntrySection({
                    variables: {
                        filter: searchFilter,
                    },
                })
            }
            if (
                section.className ===
                'SeaLogs\\CrewTraining_LogBookEntrySection'
            ) {
                getSectionCrewTraining_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }
            if (
                section.className ===
                'SeaLogs\\Supernumerary_LogBookEntrySection'
            ) {
                getSectionSupernumerary_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }
            if (section.className === 'SeaLogs\\Engineer_LogBookEntrySection') {
                getSectionEngineer_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }
            if (
                section.className ===
                'SeaLogs\\AssetReporting_LogBookEntrySection'
            ) {
                getSectionAssetReporting_LogBookEntrySection({
                    variables: {
                        id: section.ids,
                    },
                })
            }
        })
        setLoaded(true)
    }
    const [queryLogBookEntry] = useLazyQuery(GET_LOGBOOK_ENTRY_BY_ID, {
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
    const getLogBookEntryByID = async (id: number) => {
        queryLogBookEntry({
            variables: {
                logbookEntryId: +id,
            },
        })
    }

    useEffect(() => {
        getLogBookEntryByID(+logentryID)
    }, [])

    const handleData = () => {
        const logReportElement = document.getElementById('logReport')
        const crew_section = document.getElementById('crew_section')
        const daily_checks = document.getElementById('daily_checks')
        const trip_report = document.getElementById('trip_report')
        if (crew_section && daily_checks) {
            if (
                crew_section?.clientHeight + daily_checks?.clientHeight >
                2240
            ) {
                crew_section?.style.setProperty('min-height', '2240px')
            }
        }
        if (trip_report && trip_report.clientHeight > 1920) {
            trip_report.style.setProperty('min-height', '2240px')
            const reportChildren = Array.from(trip_report.children)
            let currentHeight = 0
            let currentGroup = document.createElement('div')
            currentGroup.className = 'page_break min-h-[2240px]'
            reportChildren.forEach((child) => {
                const childHeight = child.clientHeight
                if (currentHeight + childHeight > 1920) {
                    // Start new group
                    trip_report.appendChild(currentGroup)
                    currentGroup = document.createElement('div')
                    currentGroup.className = 'page_break min-h-[2240px] mt-8'
                    currentHeight = 0
                }
                currentGroup.appendChild(child)
                currentHeight += childHeight
            })
            // Add final group
            if (currentGroup.children.length > 0) {
                trip_report.appendChild(currentGroup)
            }
            trip_report.removeAttribute('id')
        }
        logReportElement?.style.setProperty('width', '1600px')
        if (logReportElement) {
            logReportElement?.style.setProperty('width', '1600px')
            // Generate PDF in text format.
            // var doc = new jsPDF('p', 'mm', [1400, 1979], true)
            // doc.html(logReportElement, {
            //     margin: [20, 0, 20, 0],
            //     callback: function (pdf) {
            //         doc.save('report.pdf')
            //         logReportElement?.style.setProperty('width', '100%')
            //         router.push(
            //             `/log-entries/view?vesselID=${+vesselID}&logentryID=${+logentryID}`,
            //         )
            //     },
            //     autoPaging: 'text',
            // })

            // Generate PDF in image format.
            html2canvas(logReportElement, {
                scale: 1,
                useCORS: true,
                allowTaint: true,
                logging: true,
                windowWidth: logReportElement.scrollWidth,
                windowHeight: logReportElement.scrollHeight,
            }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png')
                const pdf = new jsPDF('p', 'mm', [1400, 1979], true)
                const imgProps = pdf.getImageProperties(imgData)
                const pdfWidth = pdf.internal.pageSize.getWidth()
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
                let position = 0
                while (position < canvas.height - 1979 ) {
                    if (position !== 0) {
                        pdf.addPage()
                    }
                    console.log('position', position, canvas.height, pdfHeight)
                    pdf.addImage(
                        imgData,
                        'PNG',
                        0,
                        -position,
                        pdfWidth,
                        pdfHeight,
                    )
                    position += 1979
                }
                pdf.save('report.pdf')
                router.push(
                    `/log-entries/view?vesselID=${+vesselID}&logentryID=${+logentryID}`,
                )
                logReportElement.style.width = '100%'
            })
        }
    }

    useEffect(() => {
        if (loadedChecks) {
            loadedChecks.checks === false &&
                setLoadedChecks({ ...loadedChecks, checks: true })
            const loadedChecksArray = Object.values(loadedChecks).some(
                (value) => value === false,
            )
            if (!loadedChecksArray) {
                setTimeout(() => {
                    setLoaded(true)
                    const downloadPdf = document.querySelector('#downloadPdf')
                    if (downloadPdf) {
                        handleData()
                        downloadPdf.remove()
                    }
                }, 1000)
            }
        }
    }, [loadedChecks])

    const dailyCheckTypes = [
        { title: 'Safety Checks', value: 'Safety' },
        { title: 'Engine Checks', value: 'Engine' },
        { title: 'Jet Specific Checks', value: 'JetSpecific' },
        { title: 'Cleaning Checks', value: 'Cleaning' },
        { title: 'Navigation', value: 'Navigation' },
        { title: 'Deck operations and exterior checks', value: 'Hull' },
        { title: 'HVAC', value: 'HVAC' },
        { title: 'Plumbing', value: 'Plumbing' },
        { title: 'Sail', value: 'Sail' },
    ]

    useEffect(() => {
        if (logBookConfig && vesselDailyCheck) {
            const dailyCheckFields = Object.entries(vesselDailyCheck)
                .filter(([key, value]) => value === 'Ok' || value === 'Not_Ok')
                .map(([key, value]) => ({ key, value }))

            const allLocalItems: any = SLALL_LogBookFields.filter(
                (item: any) =>
                    item.componentClass === 'VesselDailyCheck_LogBookComponent',
            )[0].items
            const allSignOffLocalItems: any = SLALL_LogBookFields.filter(
                (item: any) =>
                    item.componentClass === 'LogBookSignOff_LogBookComponent',
            )[0].items
            const logBookConfigItems =
                logBookConfig?.customisedLogBookComponents?.nodes
                    ?.filter(
                        (item: any) =>
                            item.componentClass ===
                            'VesselDailyCheck_LogBookComponent',
                    )[0]
                    .customisedComponentFields.nodes.filter((item: any) =>
                        dailyCheckFields.some(
                            (field: any) =>
                                field.key ===
                                item.fieldName.charAt(0).toLowerCase() +
                                    item.fieldName.slice(1),
                        ),
                    )

            const dailyCheckEmbeddedFields = logBookConfigItems.map(
                (item: any) => ({
                    ...item,
                    customisedFieldTitle: item.customisedFieldTitle,
                    fieldName: item.fieldName,
                    value: dailyCheckFields.find(
                        (field: any) =>
                            field.key ===
                            item.fieldName.charAt(0).toLowerCase() +
                                item.fieldName.slice(1),
                    )?.value,
                    fieldSet: allLocalItems.find(
                        (sitem: any) => sitem.value === item.fieldName,
                    )?.fieldSet,
                    groupTo: allLocalItems.filter(
                        (sitem: any) => sitem.value === item.fieldName,
                    )[0]?.groupTo,
                }),
            )
            if (dailyCheckEmbeddedFields.length > 0) {
                setDailyCheckCombined(dailyCheckEmbeddedFields)
            }
            if (signOff) {
                const signOffFields = Object.entries(signOff)
                    .filter(
                        ([key, value]) => value === 'Ok' || value === 'Not_Ok',
                    )
                    .map(([key, value]) => ({ key, value }))
                const logBookSignOffConfigItems =
                    logBookConfig?.customisedLogBookComponents?.nodes
                        ?.filter(
                            (item: any) =>
                                item.componentClass ===
                                'LogBookSignOff_LogBookComponent',
                        )[0]
                        .customisedComponentFields.nodes.filter((item: any) =>
                            signOffFields.some(
                                (field: any) =>
                                    field.key ===
                                    item.fieldName.charAt(0).toLowerCase() +
                                        item.fieldName.slice(1),
                            ),
                        )
                const signOffEmbeddedFields = logBookSignOffConfigItems.map(
                    (item: any) => ({
                        ...item,
                        customisedFieldTitle: item.customisedFieldTitle,
                        fieldName: item.fieldName,
                        value: signOffFields.find(
                            (field: any) =>
                                field.key ===
                                item.fieldName.charAt(0).toLowerCase() +
                                    item.fieldName.slice(1),
                        )?.value,
                        fieldSet: 'Signoff',
                        groupTo: allSignOffLocalItems.filter(
                            (sitem: any) => sitem.value === item.fieldName,
                        )[0]?.groupTo,
                    }),
                )
                setSignOffEmbeddedFields(signOffEmbeddedFields)
            }
        }
    }, [vesselDailyCheck, logBookConfig])

    const getDailyCheckComment = (
        fieldName: string,
        commentType = 'FieldComment',
    ) => {
        const comment =
            dailyCheckComments?.length > 0
                ? dailyCheckComments.filter(
                      (comment: any) =>
                          comment.fieldName === fieldName &&
                          comment.commentType === commentType,
                  )
                : false
        return comment.length > 0 ? comment[0] : false
    }

    const getSignOffComment = (
        fieldName: string,
        commentType = 'FieldComment',
    ) => {
        const comment =
            signOffComment?.length > 0
                ? signOffComment.filter(
                      (comment: any) =>
                          comment.fieldName === fieldName &&
                          comment.commentType === commentType,
                  )
                : false
        return comment.length > 0 ? comment[0] : ''
    }

    const getTripPOB = (trip: any) => {
        let totalGuests = 0
        const supernumeraries = trip.tripEvents.nodes.filter((event: any) => {
            return event.eventCategory === 'Supernumerary'
        })
        if (supernumeraries.length > 0) {
            supernumeraries.forEach((s: any) => {
                totalGuests += s.supernumerary.totalGuest
            })
        }
        const paxJoined = trip.tripReport_Stops.nodes.reduce(
            (acc: number, stop: any) => {
                return acc + stop.paxJoined - stop.paxDeparted
            },
            0,
        )
        return trip?.pob + crewMembers?.length + totalGuests + paxJoined
    }

    const goodsTypes = [
        { label: 'Class 1 Explosives', value: '1' },
        { label: 'Class 2 Gases', value: '2' },
        { label: 'Class 2.1 - Flammable gases', value: '2.1' },
        { label: 'Class 2.2 - Non-Flammable Non-Toxic Gases', value: '2.2' },
        { label: 'Class 2.3 - Toxic Gases', value: '2.3' },
        { label: 'Class 3 Flammable Liquids', value: '3' },
        { label: 'Class 4 Flammable Solids', value: '4' },
        { label: 'Class 4.1 - Flammable Solids', value: '4.1' },
        {
            label: 'Class 4.2 - Spontaneously Combustible Substances',
            value: '4.2',
        },
        { label: 'Class 4.3 - Substances Flammable When Wet', value: '4.3' },
        {
            label: 'Class 5 Oxidizing Substances and Organic Peroxides',
            value: '5',
        },
        { label: 'Class 5.1 - Oxidising Substances', value: '5.1' },
        { label: 'Class 5.2 - Organic Peroxides', value: '5.2' },
        { label: 'Class 6 Toxic and Infectious Substances', value: '6' },
        { label: 'Class 6.1 - Toxic Substances', value: '6.1' },
        { label: 'Class 6.2 - Infectious Substances', value: '6.2' },
        { label: 'Class 7 Radioactive Substances', value: '7' },
        { label: 'Class 8 Corrosive Substances', value: '8' },
        { label: 'Class 9 Miscellaneous Hazardous Substance', value: '9' },
    ]

    const getActivityType = (activity: any, trip: any) => {
        if (activity?.parentTaskingID > 0) {
            return trip?.tripEvents?.nodes
                ?.filter(
                    (event: any) =>
                        event.eventType_Tasking.id === activity.parentTaskingID,
                )[0]
                ?.eventType_Tasking?.operationType?.replace(/_/g, ' ')
        }
        return activity?.operationType?.replace(/_/g, ' ')
    }

    const getTowingChecklist = (towing: any, trip: any) => {
        return trip.tripEvents.nodes.find(
            (event: any) =>
                event.eventType_Tasking.id === towing.parentTaskingID,
        ).eventType_Tasking.towingChecklist
    }

    const displayReportField = (fieldName: string) => {
        const dailyChecks =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'TripReport_LogBookComponent',
            )
        if (
            dailyChecks?.length > 0 &&
            dailyChecks[0]?.customisedComponentFields?.nodes.filter(
                (field: any) =>
                    field.fieldName === fieldName && field.status !== 'Off',
            ).length > 0
        ) {
            return true
        }
        return false
    }

    return (
        <>
            {loaded ? (
                <div>
                    {!Object.values(loadedChecks).some(
                        (value) => value === false,
                    ) && (
                        <p>
                            If the PDF does not download automatically,{' '}
                            <span
                                onClick={handleData}
                                className="inline-block underline cursor-pointer">
                                click here
                            </span>
                        </p>
                    )}
                    <button
                        id="downloadPdf"
                        onClick={handleData}
                        className="hidden">
                        Download PDF
                    </button>
                    <div id="logReport" className="w-full px-4">
                        <div className="page_break min-h-[2240px]">
                            <div id="crew_section">
                                <div className="flex justify-between items-center">
                                    <h5 className="font-light text-xl">
                                        <span className="font-medium">
                                            Log Entry{' '}
                                        </span>
                                        {vessel?.title} -{' '}
                                        {logbook?.startDate
                                            ? formatDate(logbook.startDate)
                                            : ''}
                                    </h5>
                                    <Image
                                        src="/sealogs-horizontal-logo.png"
                                        alt=""
                                        width={220}
                                        height={50}
                                    />
                                </div>
                                <div className="w-full h-full-screen dark:bg-gray-700 items-center justify-center bg-white rounded-lg">
                                    <div className="w-full p-0 overflow-hidden bg-white border-t border-l border-r border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                            <tbody>
                                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                    <td className="px-6 pb-4">
                                                        <span className="w-48 inline-block">
                                                            Company
                                                        </span>{' '}
                                                        {client?.title}
                                                    </td>
                                                    <td className="px-6 pb-4">
                                                        <span className="w-48 inline-block">
                                                            Vessel
                                                        </span>{' '}
                                                        {vessel?.title}
                                                    </td>
                                                </tr>
                                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                    <td className="px-6 pb-4">
                                                        <span className="w-48 inline-block">
                                                            Master
                                                        </span>{' '}
                                                        {master?.firstName}{' '}
                                                        {master?.surname}
                                                    </td>
                                                    <td className="px-6 pb-4">
                                                        <span className="w-48 inline-block">
                                                            Sign off time
                                                        </span>{' '}
                                                        {formatDate(
                                                            signOff?.created,
                                                        )}{' '}
                                                        {signOff?.completedTime}
                                                    </td>
                                                </tr>
                                                {getSignOffComment(
                                                    'LogBookSignOff',
                                                    'Section',
                                                ) && (
                                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                        <td
                                                            className="px-6 pb-4"
                                                            colSpan={2}>
                                                            <div className="flex">
                                                                <span className="min-w-48 inline-block">
                                                                    Sign off
                                                                    comment
                                                                </span>
                                                                <div className="inline-block">
                                                                    {getSignOffComment(
                                                                        'LogBookSignOff',
                                                                        'Section',
                                                                    ) &&
                                                                        getSignOffComment(
                                                                            'LogBookSignOff',
                                                                            'Section',
                                                                        )
                                                                            ?.comment}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {crewMembers &&
                                    crewMembers?.filter(
                                        (member: any) =>
                                            member.crewMemberID > 0,
                                    ).length > 0 && (
                                        <>
                                            <div className="mt-8 mb-4">
                                                <h5 className="font-light text-xl">
                                                    Crew members
                                                </h5>
                                            </div>
                                            <div className="w-full h-full-screen dark:bg-gray-700 items-center justify-center bg-white rounded-lg">
                                                <div className="w-full p-0 overflow-hidden bg-white border-t border-l border-r border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                                                    <div className="relative overflow-x-auto">
                                                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                                <tr>
                                                                    <th className="px-6 pb-4">
                                                                        Name
                                                                    </th>
                                                                    <th className="px-6 pb-4">
                                                                        Duty
                                                                    </th>
                                                                    <th className="px-6 pb-4">
                                                                        Sign In
                                                                    </th>
                                                                    <th className="px-6 pb-4">
                                                                        Sign Out
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {crewMembers
                                                                    .filter(
                                                                        (
                                                                            member: any,
                                                                        ) =>
                                                                            member.crewMemberID >
                                                                            0,
                                                                    )
                                                                    .map(
                                                                        (
                                                                            member: any,
                                                                        ) => (
                                                                            <tr
                                                                                key={
                                                                                    member.crewMemberID
                                                                                }
                                                                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                                                <td className="px-6 pb-4">
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
                                                                                </td>
                                                                                <td className="px-6 pb-4">
                                                                                    {
                                                                                        member
                                                                                            .dutyPerformed
                                                                                            .title
                                                                                    }
                                                                                </td>
                                                                                <td className="px-6 pb-4">
                                                                                    {formatDateTime(
                                                                                        member.punchIn,
                                                                                    )}
                                                                                </td>
                                                                                <td className="px-6 pb-4">
                                                                                    {formatDateTime(
                                                                                        member.punchOut,
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        ),
                                                                    )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                            </div>
                            {vesselDailyCheck && dailyCheckCombined && (
                                <div id="daily_checks">
                                    <div className="mt-8 mb-4">
                                        <h5 className="font-light text-xl">
                                            Daily Check
                                        </h5>
                                    </div>
                                    <div className="w-full h-full-screen dark:bg-gray-700 items-center justify-center bg-white rounded-lg">
                                        <div className="w-full p-0 overflow-hidden bg-white border-t border-l border-r border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                                            <div className="relative overflow-x-auto">
                                                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                        <tr>
                                                            <th className="px-6 pb-4">
                                                                Section
                                                            </th>
                                                            <th className="px-6 pb-4">
                                                                Fields
                                                            </th>
                                                            <th className="px-6 pb-4">
                                                                Status
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {dailyCheckTypes
                                                            .filter(
                                                                (type) =>
                                                                    dailyCheckCombined?.filter(
                                                                        (
                                                                            item: any,
                                                                        ) =>
                                                                            item.fieldSet ===
                                                                            type.title,
                                                                    ).length >
                                                                    0,
                                                            )
                                                            .map((type) => (
                                                                <>
                                                                    <tr
                                                                        key={`${type.title}-1`}
                                                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                                        <td className="px-6 pb-4 border-r-1">
                                                                            <div>
                                                                                {getDailyCheckComment(
                                                                                    type.value,
                                                                                    'Section',
                                                                                ) ? (
                                                                                    <>
                                                                                        {
                                                                                            type.title
                                                                                        }
                                                                                        <br />
                                                                                        <br />
                                                                                        Comment:{' '}
                                                                                        {
                                                                                            getDailyCheckComment(
                                                                                                type.value,
                                                                                                'Section',
                                                                                            )
                                                                                                ?.comment
                                                                                        }
                                                                                    </>
                                                                                ) : (
                                                                                    type.title
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td
                                                                            colSpan={
                                                                                2
                                                                            }>
                                                                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                <tbody>
                                                                                    <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                        <td className="px-6 pb-4">
                                                                                            {dailyCheckCombined
                                                                                                ?.filter(
                                                                                                    (
                                                                                                        item: any,
                                                                                                    ) =>
                                                                                                        item.fieldSet ===
                                                                                                            type.title &&
                                                                                                        item.value ===
                                                                                                            'Ok' &&
                                                                                                        !getDailyCheckComment(
                                                                                                            item.fieldName,
                                                                                                            'FieldComment',
                                                                                                        ),
                                                                                                )
                                                                                                .map(
                                                                                                    (
                                                                                                        item: any,
                                                                                                    ) =>
                                                                                                        getFieldLabel(
                                                                                                            item.fieldName,
                                                                                                            logBookConfig,
                                                                                                        ),
                                                                                                )
                                                                                                .join(
                                                                                                    ', ',
                                                                                                )}
                                                                                        </td>
                                                                                        <td className="px-6 pb-4">
                                                                                            Ok
                                                                                        </td>
                                                                                    </tr>
                                                                                    {dailyCheckCombined
                                                                                        ?.filter(
                                                                                            (
                                                                                                item: any,
                                                                                            ) =>
                                                                                                item.fieldSet ===
                                                                                                    type.title &&
                                                                                                item.value ===
                                                                                                    'Ok' &&
                                                                                                getDailyCheckComment(
                                                                                                    item.fieldName,
                                                                                                ),
                                                                                        )
                                                                                        .map(
                                                                                            (
                                                                                                item: any,
                                                                                            ) => (
                                                                                                <tr
                                                                                                    key={
                                                                                                        item.id
                                                                                                    }
                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                    <td className="px-6 pb-4">
                                                                                                        {`${getFieldLabel(item.fieldName, logBookConfig)}: ${getDailyCheckComment(item.fieldName)?.comment}`}
                                                                                                    </td>
                                                                                                    <td className="px-6 pb-4">
                                                                                                        Ok
                                                                                                    </td>
                                                                                                </tr>
                                                                                            ),
                                                                                        )}
                                                                                    <tr
                                                                                        key={
                                                                                            type.title
                                                                                        }
                                                                                        className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                        <td className="px-6 pb-4">
                                                                                            {dailyCheckCombined
                                                                                                ?.filter(
                                                                                                    (
                                                                                                        item: any,
                                                                                                    ) =>
                                                                                                        item.fieldSet ===
                                                                                                            type.title &&
                                                                                                        item.value ===
                                                                                                            'Not_Ok' &&
                                                                                                        !getDailyCheckComment(
                                                                                                            item.fieldName,
                                                                                                        ),
                                                                                                )
                                                                                                .map(
                                                                                                    (
                                                                                                        item: any,
                                                                                                    ) =>
                                                                                                        getFieldLabel(
                                                                                                            item.fieldName,
                                                                                                            logBookConfig,
                                                                                                        ),
                                                                                                )
                                                                                                .join(
                                                                                                    ', ',
                                                                                                )}
                                                                                        </td>
                                                                                        <td className="px-6 pb-4 w-32">
                                                                                            Not
                                                                                            Ok
                                                                                        </td>
                                                                                    </tr>
                                                                                    {dailyCheckCombined
                                                                                        ?.filter(
                                                                                            (
                                                                                                item: any,
                                                                                            ) =>
                                                                                                item.fieldSet ===
                                                                                                    type.title &&
                                                                                                item.value ===
                                                                                                    'Not_Ok' &&
                                                                                                getDailyCheckComment(
                                                                                                    item.fieldName,
                                                                                                ),
                                                                                        )
                                                                                        .map(
                                                                                            (
                                                                                                item: any,
                                                                                            ) => (
                                                                                                <tr
                                                                                                    key={
                                                                                                        item.id
                                                                                                    }
                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                    <td className="px-6 pb-4">
                                                                                                        {`${getFieldLabel(item.fieldName, logBookConfig)}: ${getDailyCheckComment(item.fieldName)?.comment}`}
                                                                                                    </td>
                                                                                                    <td className="px-6 pb-4 w-32">
                                                                                                        Not
                                                                                                        Ok
                                                                                                    </td>
                                                                                                </tr>
                                                                                            ),
                                                                                        )}
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </>
                                                            ))}
                                                        {signOffEmbeddedFields &&
                                                            signOffEmbeddedFields.length >
                                                                0 && (
                                                                <>
                                                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                                        <td className="px-6 pb-4 border-r-1">
                                                                            <div>
                                                                                Sign
                                                                                off
                                                                            </div>
                                                                        </td>
                                                                        <td
                                                                            colSpan={
                                                                                2
                                                                            }>
                                                                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                <tbody>
                                                                                    {signOffEmbeddedFields.filter(
                                                                                        (
                                                                                            item: any,
                                                                                        ) =>
                                                                                            item.value ===
                                                                                                'Ok' &&
                                                                                            !getDailyCheckComment(
                                                                                                item.fieldName,
                                                                                                'FieldComment',
                                                                                            ),
                                                                                    )
                                                                                        .length >
                                                                                        0 && (
                                                                                        <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                            <td className="px-6 pb-4">
                                                                                                {signOffEmbeddedFields
                                                                                                    .filter(
                                                                                                        (
                                                                                                            item: any,
                                                                                                        ) =>
                                                                                                            item.value ===
                                                                                                                'Ok' &&
                                                                                                            !getDailyCheckComment(
                                                                                                                item.fieldName,
                                                                                                                'FieldComment',
                                                                                                            ),
                                                                                                    )
                                                                                                    .map(
                                                                                                        (
                                                                                                            item: any,
                                                                                                        ) =>
                                                                                                            getFieldLabel(
                                                                                                                item.fieldName,
                                                                                                                logBookConfig,
                                                                                                                'LogBookSignOff_LogBookComponent',
                                                                                                            ),
                                                                                                    )
                                                                                                    .join(
                                                                                                        ', ',
                                                                                                    )}
                                                                                            </td>
                                                                                            <td className="px-6 pb-4 w-32">
                                                                                                Ok
                                                                                            </td>
                                                                                        </tr>
                                                                                    )}
                                                                                    {signOffEmbeddedFields.filter(
                                                                                        (
                                                                                            item: any,
                                                                                        ) =>
                                                                                            item.value ===
                                                                                                'Ok' &&
                                                                                            getDailyCheckComment(
                                                                                                item.fieldName,
                                                                                                'FieldComment',
                                                                                            ),
                                                                                    )
                                                                                        .length >
                                                                                        0 && (
                                                                                        <>
                                                                                            {signOffEmbeddedFields
                                                                                                .filter(
                                                                                                    (
                                                                                                        item: any,
                                                                                                    ) =>
                                                                                                        item.value ===
                                                                                                            'Ok' &&
                                                                                                        getDailyCheckComment(
                                                                                                            item.fieldName,
                                                                                                            'FieldComment',
                                                                                                        ),
                                                                                                )
                                                                                                .map(
                                                                                                    (
                                                                                                        item: any,
                                                                                                    ) => (
                                                                                                        <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                            <td className="px-6 pb-4">
                                                                                                                {`${getFieldLabel(item.fieldName, logBookConfig, 'LogBookSignOff_LogBookComponent')}: ${getDailyCheckComment(item.fieldName)?.comment}`}
                                                                                                            </td>
                                                                                                            <td className="px-6 pb-4 w-32">
                                                                                                                Ok
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    ),
                                                                                                )}
                                                                                        </>
                                                                                    )}
                                                                                    {signOffEmbeddedFields.filter(
                                                                                        (
                                                                                            item: any,
                                                                                        ) =>
                                                                                            item.value ===
                                                                                                'Not_Ok' &&
                                                                                            !getDailyCheckComment(
                                                                                                item.fieldName,
                                                                                                'FieldComment',
                                                                                            ),
                                                                                    )
                                                                                        .length >
                                                                                        0 && (
                                                                                        <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                            <td className="px-6 pb-4">
                                                                                                {signOffEmbeddedFields
                                                                                                    .filter(
                                                                                                        (
                                                                                                            item: any,
                                                                                                        ) =>
                                                                                                            item.value ===
                                                                                                                'Not_Ok' &&
                                                                                                            !getDailyCheckComment(
                                                                                                                item.fieldName,
                                                                                                                'FieldComment',
                                                                                                            ),
                                                                                                    )
                                                                                                    .map(
                                                                                                        (
                                                                                                            item: any,
                                                                                                        ) =>
                                                                                                            getFieldLabel(
                                                                                                                item.fieldName,
                                                                                                                logBookConfig,
                                                                                                                'LogBookSignOff_LogBookComponent',
                                                                                                            ),
                                                                                                    )
                                                                                                    .join(
                                                                                                        ', ',
                                                                                                    )}
                                                                                            </td>
                                                                                            <td className="px-6 pb-4 w-32">
                                                                                                Not
                                                                                                Ok
                                                                                            </td>
                                                                                        </tr>
                                                                                    )}
                                                                                    {signOffEmbeddedFields.filter(
                                                                                        (
                                                                                            item: any,
                                                                                        ) =>
                                                                                            item.value ===
                                                                                                'Not_Ok' &&
                                                                                            getDailyCheckComment(
                                                                                                item.fieldName,
                                                                                                'FieldComment',
                                                                                            ),
                                                                                    )
                                                                                        .length >
                                                                                        0 && (
                                                                                        <>
                                                                                            {signOffEmbeddedFields
                                                                                                .filter(
                                                                                                    (
                                                                                                        item: any,
                                                                                                    ) =>
                                                                                                        item.value ===
                                                                                                            'Not_Ok' &&
                                                                                                        getDailyCheckComment(
                                                                                                            item.fieldName,
                                                                                                            'FieldComment',
                                                                                                        ),
                                                                                                )
                                                                                                .map(
                                                                                                    (
                                                                                                        item: any,
                                                                                                    ) => (
                                                                                                        <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                            <td className="px-6 pb-4">
                                                                                                                {`${getFieldLabel(item.fieldName, logBookConfig, 'LogBookSignOff_LogBookComponent')}: ${getDailyCheckComment(item.fieldName)?.comment}`}
                                                                                                            </td>
                                                                                                            <td className="px-6 pb-4 w-32">
                                                                                                                Not
                                                                                                                Ok
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    ),
                                                                                                )}
                                                                                        </>
                                                                                    )}
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </>
                                                            )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div
                            className="page_break min-h-[2240px]"
                            id="trip_report">
                            {tripReport && (
                                <div className="mt-8 mb-4">
                                    <h5 className="font-light text-xl">
                                        Trip report
                                    </h5>
                                </div>
                            )}
                            {tripReport &&
                                tripReport.map((trip: any) => (
                                    <div
                                        key={trip.id}
                                        className="w-full mb-8 last:mb-0 h-full-screen dark:bg-gray-700 items-center justify-center bg-white rounded-lg">
                                        <div className="w-full p-0 overflow-hidden bg-white border-t border-l border-r border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                <tbody>
                                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                        <td className="px-6 pb-4">
                                                            <span className="w-48 inline-block">
                                                                Departure
                                                            </span>{' '}
                                                            {trip?.departTime}
                                                        </td>
                                                        <td className="px-6 pb-4">
                                                            <span className="w-48 inline-block">
                                                                Depart location
                                                            </span>{' '}
                                                            {trip?.fromLocation
                                                                ?.id > 0
                                                                ? trip
                                                                      ?.fromLocation
                                                                      ?.title
                                                                : trip
                                                                      ?.fromLocation
                                                                      ?.lat +
                                                                  ' ' +
                                                                  trip
                                                                      ?.fromLocation
                                                                      ?.long}
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                        <td className="px-6 pb-4">
                                                            <span className="w-48 inline-block">
                                                                P.O.B
                                                            </span>{' '}
                                                            <div className=" inline-block">
                                                                {/* Crew:{' '}
                                                            {crewMembers.length}
                                                            <br />
                                                            Pax carried:{' '}
                                                            {trip?.pob}
                                                            <br />
                                                            Total People OnBoard{' '} */}
                                                                {getTripPOB(
                                                                    trip,
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 pb-4">
                                                            <span className="w-48 inline-block">
                                                                Vehicles on
                                                                board
                                                            </span>{' '}
                                                            {
                                                                trip?.totalVehiclesCarried
                                                            }
                                                        </td>
                                                    </tr>
                                                    {trip?.designatedDangerousGoodsSailing &&
                                                        displayReportField(
                                                            'DesignatedDangerousGoodsSailing',
                                                        ) && (
                                                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                                <td
                                                                    className="px-6 pb-4"
                                                                    colSpan={2}>
                                                                    {
                                                                        'This is a designated dangerous goods sailing'
                                                                    }
                                                                </td>
                                                            </tr>
                                                        )}
                                                    {trip?.dangerousGoodsRecords
                                                        ?.nodes?.length > 0 && (
                                                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                            <td
                                                                className="px-6 pb-4"
                                                                colSpan={2}>
                                                                <span className="w-48 inline-block">
                                                                    Dangerous
                                                                    goods
                                                                </span>
                                                                <div className="inline-block">
                                                                    {trip?.dangerousGoodsRecords?.nodes?.map(
                                                                        (
                                                                            item: any,
                                                                            index: number,
                                                                        ) => (
                                                                            <>
                                                                                {index >
                                                                                    0 &&
                                                                                    ', '}
                                                                                {
                                                                                    goodsTypes.find(
                                                                                        (
                                                                                            type,
                                                                                        ) =>
                                                                                            type.value ===
                                                                                            item?.type,
                                                                                    )
                                                                                        ?.label
                                                                                }
                                                                                {
                                                                                    ' - '
                                                                                }
                                                                                <div
                                                                                    className="inline-block"
                                                                                    dangerouslySetInnerHTML={{
                                                                                        __html: item?.comment,
                                                                                    }}></div>
                                                                            </>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {trip
                                                        ?.dangerousGoodsChecklist
                                                        ?.id > 0 && (
                                                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                            <td
                                                                className=""
                                                                colSpan={2}>
                                                                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                    <tbody>
                                                                        <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                            <td className="px-6 pb-4 w-48 border-r-1">
                                                                                <span className="w-48 inline-block">
                                                                                    Dangerous
                                                                                    goods
                                                                                    checklist
                                                                                </span>
                                                                            </td>
                                                                            <td className="">
                                                                                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                    <tbody>
                                                                                        {Object.entries(
                                                                                            trip.dangerousGoodsChecklist,
                                                                                        ).filter(
                                                                                            ([
                                                                                                key,
                                                                                                value,
                                                                                            ]) =>
                                                                                                value ===
                                                                                                true,
                                                                                        )
                                                                                            .length >
                                                                                            0 && (
                                                                                            <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                <td className="px-6 pb-4 border-r-1">
                                                                                                    {Object.entries(
                                                                                                        trip.dangerousGoodsChecklist,
                                                                                                    )
                                                                                                        .filter(
                                                                                                            ([
                                                                                                                key,
                                                                                                                value,
                                                                                                            ]) =>
                                                                                                                value ===
                                                                                                                true,
                                                                                                        )
                                                                                                        .map(
                                                                                                            ([
                                                                                                                key,
                                                                                                                value,
                                                                                                            ]) => ({
                                                                                                                key,
                                                                                                                value,
                                                                                                            }),
                                                                                                        )
                                                                                                        .map(
                                                                                                            (
                                                                                                                item,
                                                                                                            ) => {
                                                                                                                return item.key
                                                                                                                    .replace(
                                                                                                                        /([A-Z])/g,
                                                                                                                        ' $1',
                                                                                                                    )
                                                                                                                    .replace(
                                                                                                                        /^./,
                                                                                                                        (
                                                                                                                            str,
                                                                                                                        ) =>
                                                                                                                            str.toUpperCase(),
                                                                                                                    )
                                                                                                            },
                                                                                                        )
                                                                                                        .join(
                                                                                                            ', ',
                                                                                                        )}
                                                                                                </td>
                                                                                                <td className="px-6 pb-4">
                                                                                                    Ok
                                                                                                </td>
                                                                                            </tr>
                                                                                        )}
                                                                                        {Object.entries(
                                                                                            trip.dangerousGoodsChecklist,
                                                                                        ).filter(
                                                                                            ([
                                                                                                key,
                                                                                                value,
                                                                                            ]) =>
                                                                                                value ===
                                                                                                false,
                                                                                        )
                                                                                            .length >
                                                                                            0 && (
                                                                                            <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                <td className="px-6 pb-4 border-r-1">
                                                                                                    {Object.entries(
                                                                                                        trip.dangerousGoodsChecklist,
                                                                                                    )
                                                                                                        .filter(
                                                                                                            ([
                                                                                                                key,
                                                                                                                value,
                                                                                                            ]) =>
                                                                                                                value ===
                                                                                                                false,
                                                                                                        )
                                                                                                        .map(
                                                                                                            ([
                                                                                                                key,
                                                                                                                value,
                                                                                                            ]) => ({
                                                                                                                key,
                                                                                                                value,
                                                                                                            }),
                                                                                                        )
                                                                                                        .map(
                                                                                                            (
                                                                                                                item,
                                                                                                            ) => {
                                                                                                                return item.key
                                                                                                                    .replace(
                                                                                                                        /([A-Z])/g,
                                                                                                                        ' $1',
                                                                                                                    )
                                                                                                                    .replace(
                                                                                                                        /^./,
                                                                                                                        (
                                                                                                                            str,
                                                                                                                        ) =>
                                                                                                                            str.toUpperCase(),
                                                                                                                    )
                                                                                                            },
                                                                                                        )
                                                                                                        .join(
                                                                                                            ', ',
                                                                                                        )}
                                                                                                </td>
                                                                                                <td className="px-6 pb-4 w-32">
                                                                                                    Not
                                                                                                    Ok
                                                                                                </td>
                                                                                            </tr>
                                                                                        )}
                                                                                        {trip
                                                                                            ?.dangerousGoodsChecklist
                                                                                            ?.riskFactors
                                                                                            ?.nodes
                                                                                            ?.length >
                                                                                            0 && (
                                                                                            <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                <td
                                                                                                    className="px-6 pb-4"
                                                                                                    colSpan={
                                                                                                        2
                                                                                                    }>
                                                                                                    {trip?.dangerousGoodsChecklist.riskFactors.nodes.map(
                                                                                                        (
                                                                                                            item: any,
                                                                                                            index: number,
                                                                                                        ) => (
                                                                                                            <div
                                                                                                                className="inline-block"
                                                                                                                key={
                                                                                                                    item.id
                                                                                                                }>
                                                                                                                {index >
                                                                                                                0
                                                                                                                    ? ', '
                                                                                                                    : 'Risk factors: '}
                                                                                                                {`${item.title} - ${item.impact} - ${item.probability}/10`}
                                                                                                            </div>
                                                                                                        ),
                                                                                                    )}
                                                                                                </td>
                                                                                            </tr>
                                                                                        )}
                                                                                        {trip
                                                                                            ?.dangerousGoodsChecklist
                                                                                            ?.member
                                                                                            ?.id >
                                                                                            0 && (
                                                                                            <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                <td
                                                                                                    className="px-6 pb-4"
                                                                                                    colSpan={
                                                                                                        2
                                                                                                    }>
                                                                                                    {`Author: ${trip.dangerousGoodsChecklist.member?.firstName} ${trip.dangerousGoodsChecklist.member?.surname}`}
                                                                                                </td>
                                                                                            </tr>
                                                                                        )}
                                                                                    </tbody>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {trip?.tripReport_Stops
                                                        ?.nodes?.length > 0 && (
                                                        <>
                                                            {trip?.tripReport_Stops?.nodes?.map(
                                                                (stop: any) => (
                                                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                                        <td
                                                                            className=""
                                                                            colSpan={
                                                                                2
                                                                            }>
                                                                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                <tbody>
                                                                                    <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                        <td className="px-6 pb-4 w-48 border-r-1">
                                                                                            <span className="w-48 inline-block">
                                                                                                Trip
                                                                                                stop
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="">
                                                                                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                                <tbody>
                                                                                                    <tr
                                                                                                        key={`${stop.id}-stop-location`}
                                                                                                        className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                        <td className="px-6 pb-4 border-r-1">
                                                                                                            <span className="w-48 inline-block">
                                                                                                                {`Location`}
                                                                                                            </span>
                                                                                                            {`${stop?.stopLocation?.id > 0 ? stop?.stopLocation?.title : ''}`}
                                                                                                        </td>
                                                                                                        <td className="px-6 pb-4">
                                                                                                            {stop?.designatedDangerousGoodsSailing &&
                                                                                                            displayReportField(
                                                                                                                'DesignatedDangerousGoodsSailing',
                                                                                                            )
                                                                                                                ? 'This is a designated dangerous goods sailing'
                                                                                                                : '-'}
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                    <tr
                                                                                                        key={`${stop.id}-arr-time`}
                                                                                                        className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                        <td className="px-6 pb-4 border-r-1">
                                                                                                            <span className="w-48 inline-block">
                                                                                                                {`Arrival`}
                                                                                                            </span>
                                                                                                            {`${stop?.arriveTime}`}
                                                                                                        </td>
                                                                                                        <td className="px-6 pb-4">
                                                                                                            <span className="w-48 inline-block">
                                                                                                                {`Departure`}
                                                                                                            </span>
                                                                                                            {`${stop?.departTime}`}
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                    <tr
                                                                                                        key={`${stop.id}-pax`}
                                                                                                        className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                        <td className="px-6 pb-4 border-r-1">
                                                                                                            <span className="w-48 inline-block">
                                                                                                                {`Pax joined`}
                                                                                                            </span>
                                                                                                            {`${stop?.paxJoined}`}
                                                                                                        </td>
                                                                                                        <td className="px-6 pb-4">
                                                                                                            <span className="w-48 inline-block">
                                                                                                                {`Pax departed`}
                                                                                                            </span>
                                                                                                            {`${stop?.paxDeparted}`}
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                    <tr
                                                                                                        key={`${stop.id}-vehicles`}
                                                                                                        className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                        <td className="px-6 pb-4 border-r-1">
                                                                                                            <span className="w-48 inline-block">
                                                                                                                {`Vehicles joined`}
                                                                                                            </span>
                                                                                                            {`${stop?.vehiclesJoined}`}
                                                                                                        </td>
                                                                                                        <td className="px-6 pb-4">
                                                                                                            <span className="w-48 inline-block">
                                                                                                                {`Vehicles departed`}
                                                                                                            </span>
                                                                                                            {`${stop?.vehiclesDeparted}`}
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                    {stop?.otherCargo && (
                                                                                                        <tr
                                                                                                            key={`${stop.id}-otherCargo`}
                                                                                                            className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                            <td
                                                                                                                className="px-6 pb-4"
                                                                                                                colSpan={
                                                                                                                    2
                                                                                                                }>
                                                                                                                <span className="w-48 inline-block">
                                                                                                                    {`Other cargo: `}
                                                                                                                </span>
                                                                                                                {`${stop?.otherCargo}`}
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    )}
                                                                                                    {stop?.comments && (
                                                                                                        <tr
                                                                                                            key={`${stop.id}-comments`}
                                                                                                            className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                            <td
                                                                                                                className="px-6 pb-4"
                                                                                                                colSpan={
                                                                                                                    2
                                                                                                                }>
                                                                                                                <span className="w-48 inline-block">
                                                                                                                    {`Comments: `}
                                                                                                                </span>
                                                                                                                {`${stop?.comments}`}
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    )}
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )}
                                                        </>
                                                    )}
                                                    {trip?.tripEvents?.nodes
                                                        ?.length > 0 && (
                                                        <>
                                                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                                <td
                                                                    className=""
                                                                    colSpan={2}>
                                                                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                        <tbody>
                                                                            {trip?.tripEvents?.nodes?.map(
                                                                                (
                                                                                    event: any,
                                                                                ) => (
                                                                                    <>
                                                                                        {event.eventCategory ===
                                                                                            'BarCrossing' && (
                                                                                            <>
                                                                                                <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                    <td className="px-6 pb-4 w-48 border-r-1">
                                                                                                        <span className="w-48 inline-block">
                                                                                                            Activity
                                                                                                            -
                                                                                                            Bar
                                                                                                            crossing
                                                                                                        </span>
                                                                                                    </td>
                                                                                                    <td className="">
                                                                                                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                                            <tbody>
                                                                                                                <tr
                                                                                                                    key={`${event.eventType_BarCrossing.id}-bc-type`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Event Type`}
                                                                                                                        </span>
                                                                                                                        {`Bar crossing`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Location`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_BarCrossing?.geoLocation?.id > 0 ? event?.eventType_BarCrossing?.geoLocation?.title : ''}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                <tr
                                                                                                                    key={`${event.id}-crossing-time`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Crossing start`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_BarCrossing.time}`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Crossing end`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_BarCrossing.timeCompleted}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                {event
                                                                                                                    ?.eventType_BarCrossing
                                                                                                                    ?.barCrossingChecklist
                                                                                                                    ?.id >
                                                                                                                    0 && (
                                                                                                                    <tr
                                                                                                                        key={`${event.id}-checklist`}
                                                                                                                        className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                        <td
                                                                                                                            className=""
                                                                                                                            colSpan={
                                                                                                                                2
                                                                                                                            }>
                                                                                                                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                                                                <tbody>
                                                                                                                                    <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                        <td className="px-6 pb-4 w-48 border-r-1">
                                                                                                                                            <span className="w-48 inline-block">
                                                                                                                                                {`Bar crossing checklist`}
                                                                                                                                            </span>
                                                                                                                                        </td>
                                                                                                                                        <td className="p-0">
                                                                                                                                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                                                                                <tbody>
                                                                                                                                                    {Object.entries(
                                                                                                                                                        event
                                                                                                                                                            ?.eventType_BarCrossing
                                                                                                                                                            ?.barCrossingChecklist,
                                                                                                                                                    ).filter(
                                                                                                                                                        ([
                                                                                                                                                            key,
                                                                                                                                                            value,
                                                                                                                                                        ]) =>
                                                                                                                                                            value ===
                                                                                                                                                            true,
                                                                                                                                                    )
                                                                                                                                                        .length >
                                                                                                                                                        0 && (
                                                                                                                                                        <tr
                                                                                                                                                            key={`${event.id}-checklist-y`}
                                                                                                                                                            className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                                            <td className="px-6 pb-4 border-r-1">
                                                                                                                                                                {Object.entries(
                                                                                                                                                                    event
                                                                                                                                                                        ?.eventType_BarCrossing
                                                                                                                                                                        ?.barCrossingChecklist,
                                                                                                                                                                )
                                                                                                                                                                    .filter(
                                                                                                                                                                        ([
                                                                                                                                                                            key,
                                                                                                                                                                            value,
                                                                                                                                                                        ]) =>
                                                                                                                                                                            value ===
                                                                                                                                                                            true,
                                                                                                                                                                    )
                                                                                                                                                                    .map(
                                                                                                                                                                        ([
                                                                                                                                                                            key,
                                                                                                                                                                            value,
                                                                                                                                                                        ]) => {
                                                                                                                                                                            return key
                                                                                                                                                                                .replace(
                                                                                                                                                                                    /([A-Z])/g,
                                                                                                                                                                                    ' $1',
                                                                                                                                                                                )
                                                                                                                                                                                .replace(
                                                                                                                                                                                    /^./,
                                                                                                                                                                                    (
                                                                                                                                                                                        str,
                                                                                                                                                                                    ) =>
                                                                                                                                                                                        str.toUpperCase(),
                                                                                                                                                                                )
                                                                                                                                                                        },
                                                                                                                                                                    )
                                                                                                                                                                    .join(
                                                                                                                                                                        ', ',
                                                                                                                                                                    )}
                                                                                                                                                            </td>
                                                                                                                                                            <td className="px-6 pb-4">
                                                                                                                                                                Ok
                                                                                                                                                            </td>
                                                                                                                                                        </tr>
                                                                                                                                                    )}
                                                                                                                                                    {Object.entries(
                                                                                                                                                        event
                                                                                                                                                            ?.eventType_BarCrossing
                                                                                                                                                            ?.barCrossingChecklist,
                                                                                                                                                    ).filter(
                                                                                                                                                        ([
                                                                                                                                                            key,
                                                                                                                                                            value,
                                                                                                                                                        ]) =>
                                                                                                                                                            value ===
                                                                                                                                                            false,
                                                                                                                                                    )
                                                                                                                                                        .length >
                                                                                                                                                        0 && (
                                                                                                                                                        <tr
                                                                                                                                                            key={`${event.id}-checklist-n`}
                                                                                                                                                            className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                                            <td className="px-6 pb-4 border-r-1">
                                                                                                                                                                {Object.entries(
                                                                                                                                                                    event
                                                                                                                                                                        ?.eventType_BarCrossing
                                                                                                                                                                        ?.barCrossingChecklist,
                                                                                                                                                                )
                                                                                                                                                                    .filter(
                                                                                                                                                                        ([
                                                                                                                                                                            key,
                                                                                                                                                                            value,
                                                                                                                                                                        ]) =>
                                                                                                                                                                            value ===
                                                                                                                                                                            false,
                                                                                                                                                                    )
                                                                                                                                                                    .map(
                                                                                                                                                                        ([
                                                                                                                                                                            key,
                                                                                                                                                                            value,
                                                                                                                                                                        ]) => {
                                                                                                                                                                            return key
                                                                                                                                                                                .replace(
                                                                                                                                                                                    /([A-Z])/g,
                                                                                                                                                                                    ' $1',
                                                                                                                                                                                )
                                                                                                                                                                                .replace(
                                                                                                                                                                                    /^./,
                                                                                                                                                                                    (
                                                                                                                                                                                        str,
                                                                                                                                                                                    ) =>
                                                                                                                                                                                        str.toUpperCase(),
                                                                                                                                                                                )
                                                                                                                                                                        },
                                                                                                                                                                    )
                                                                                                                                                                    .join(
                                                                                                                                                                        ', ',
                                                                                                                                                                    )}
                                                                                                                                                            </td>
                                                                                                                                                            <td className="px-6 pb-4 w-32">
                                                                                                                                                                Not
                                                                                                                                                                Ok
                                                                                                                                                            </td>
                                                                                                                                                        </tr>
                                                                                                                                                    )}
                                                                                                                                                </tbody>
                                                                                                                                            </table>
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                </tbody>
                                                                                                                            </table>
                                                                                                                        </td>
                                                                                                                    </tr>
                                                                                                                )}
                                                                                                                {trip
                                                                                                                    ?.eventType_BarCrossing
                                                                                                                    ?.barCrossingChecklist
                                                                                                                    ?.riskFactors
                                                                                                                    ?.nodes
                                                                                                                    ?.length >
                                                                                                                    0 && (
                                                                                                                    <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                        <td
                                                                                                                            className="px-6 pb-4"
                                                                                                                            colSpan={
                                                                                                                                2
                                                                                                                            }>
                                                                                                                            {trip?.eventType_BarCrossing?.barCrossingChecklist.riskFactors.nodes.map(
                                                                                                                                (
                                                                                                                                    item: any,
                                                                                                                                    index: number,
                                                                                                                                ) => (
                                                                                                                                    <div
                                                                                                                                        className="inline-block"
                                                                                                                                        key={
                                                                                                                                            item.id
                                                                                                                                        }>
                                                                                                                                        {index >
                                                                                                                                        0
                                                                                                                                            ? ', '
                                                                                                                                            : 'Risk factors: '}
                                                                                                                                        {`${item.title} - ${item.impact} - ${item.probability}/10`}
                                                                                                                                    </div>
                                                                                                                                ),
                                                                                                                            )}
                                                                                                                        </td>
                                                                                                                    </tr>
                                                                                                                )}
                                                                                                            </tbody>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </>
                                                                                        )}
                                                                                        {event.eventCategory ===
                                                                                            'RestrictedVisibility' && (
                                                                                            <>
                                                                                                <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                    <td className="px-6 pb-4 w-48 border-r-1">
                                                                                                        <span className="w-48 inline-block">
                                                                                                            Activity
                                                                                                            -
                                                                                                            Restricted
                                                                                                            visibility
                                                                                                        </span>
                                                                                                    </td>
                                                                                                    <td className="">
                                                                                                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                                            <tbody>
                                                                                                                <tr
                                                                                                                    key={`${event.eventType_RestrictedVisibility.id}-rv-type`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td
                                                                                                                        className="px-6 pb-4"
                                                                                                                        colSpan={
                                                                                                                            2
                                                                                                                        }>
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Event Type`}
                                                                                                                        </span>
                                                                                                                        {`Restricted visibility`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                <tr
                                                                                                                    key={`${event.eventType_RestrictedVisibility.id}-locationrv`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Start location`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_RestrictedVisibility?.startLocation?.id > 0 ? event?.eventType_RestrictedVisibility?.startLocation?.title : ''}`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`End location`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_RestrictedVisibility?.endLocation?.id > 0 ? event?.eventType_RestrictedVisibility?.endLocation?.title : ''}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                <tr
                                                                                                                    key={`${event.id}-locationbc`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Crossing Time`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_RestrictedVisibility?.crossingTime}`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Crossed time`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_RestrictedVisibility?.crossedTime}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                <tr
                                                                                                                    key={`${event.id}-speed`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Safe speed`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_RestrictedVisibility?.estSafeSpeed}`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Avg speed`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_RestrictedVisibility?.approxSafeSpeed}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                <tr
                                                                                                                    key={`${event.id}-checklist`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td
                                                                                                                        className=""
                                                                                                                        colSpan={
                                                                                                                            2
                                                                                                                        }>
                                                                                                                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                                                            <tbody>
                                                                                                                                <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                    <td className="px-6 pb-4 w-48 border-r-1">
                                                                                                                                        <span className="w-48 inline-block">
                                                                                                                                            {`Safe operating procedures checklist`}
                                                                                                                                        </span>
                                                                                                                                    </td>
                                                                                                                                    <td className="p-0">
                                                                                                                                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                                                                            <tbody>
                                                                                                                                                {Object.entries(
                                                                                                                                                    event?.eventType_RestrictedVisibility,
                                                                                                                                                ).filter(
                                                                                                                                                    ([
                                                                                                                                                        key,
                                                                                                                                                        value,
                                                                                                                                                    ]) =>
                                                                                                                                                        value ===
                                                                                                                                                        true,
                                                                                                                                                )
                                                                                                                                                    .length >
                                                                                                                                                    0 && (
                                                                                                                                                    <tr
                                                                                                                                                        key={`${event.id}-checklist-y`}
                                                                                                                                                        className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                                        <td className="px-6 pb-4 border-r-1">
                                                                                                                                                            {Object.entries(
                                                                                                                                                                event?.eventType_RestrictedVisibility,
                                                                                                                                                            )
                                                                                                                                                                .filter(
                                                                                                                                                                    ([
                                                                                                                                                                        key,
                                                                                                                                                                        value,
                                                                                                                                                                    ]) =>
                                                                                                                                                                        value ===
                                                                                                                                                                        true,
                                                                                                                                                                )
                                                                                                                                                                .map(
                                                                                                                                                                    ([
                                                                                                                                                                        key,
                                                                                                                                                                        value,
                                                                                                                                                                    ]) => {
                                                                                                                                                                        return key
                                                                                                                                                                            .replace(
                                                                                                                                                                                /([A-Z])/g,
                                                                                                                                                                                ' $1',
                                                                                                                                                                            )
                                                                                                                                                                            .replace(
                                                                                                                                                                                /^./,
                                                                                                                                                                                (
                                                                                                                                                                                    str,
                                                                                                                                                                                ) =>
                                                                                                                                                                                    str.toUpperCase(),
                                                                                                                                                                            )
                                                                                                                                                                    },
                                                                                                                                                                )
                                                                                                                                                                .join(
                                                                                                                                                                    ', ',
                                                                                                                                                                )}
                                                                                                                                                        </td>
                                                                                                                                                        <td className="px-6 pb-4">
                                                                                                                                                            Ok
                                                                                                                                                        </td>
                                                                                                                                                    </tr>
                                                                                                                                                )}
                                                                                                                                                {Object.entries(
                                                                                                                                                    event?.eventType_RestrictedVisibility,
                                                                                                                                                ).filter(
                                                                                                                                                    ([
                                                                                                                                                        key,
                                                                                                                                                        value,
                                                                                                                                                    ]) =>
                                                                                                                                                        value ===
                                                                                                                                                        false,
                                                                                                                                                )
                                                                                                                                                    .length >
                                                                                                                                                    0 && (
                                                                                                                                                    <tr
                                                                                                                                                        key={`${event.id}-checklist-n`}
                                                                                                                                                        className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                                        <td className="px-6 pb-4 border-r-1">
                                                                                                                                                            {Object.entries(
                                                                                                                                                                event?.eventType_RestrictedVisibility,
                                                                                                                                                            )
                                                                                                                                                                .filter(
                                                                                                                                                                    ([
                                                                                                                                                                        key,
                                                                                                                                                                        value,
                                                                                                                                                                    ]) =>
                                                                                                                                                                        value ===
                                                                                                                                                                        false,
                                                                                                                                                                )
                                                                                                                                                                .map(
                                                                                                                                                                    ([
                                                                                                                                                                        key,
                                                                                                                                                                        value,
                                                                                                                                                                    ]) => {
                                                                                                                                                                        return key
                                                                                                                                                                            .replace(
                                                                                                                                                                                /([A-Z])/g,
                                                                                                                                                                                ' $1',
                                                                                                                                                                            )
                                                                                                                                                                            .replace(
                                                                                                                                                                                /^./,
                                                                                                                                                                                (
                                                                                                                                                                                    str,
                                                                                                                                                                                ) =>
                                                                                                                                                                                    str.toUpperCase(),
                                                                                                                                                                            )
                                                                                                                                                                    },
                                                                                                                                                                )
                                                                                                                                                                .join(
                                                                                                                                                                    ', ',
                                                                                                                                                                )}
                                                                                                                                                        </td>
                                                                                                                                                        <td className="px-6 pb-4 w-32">
                                                                                                                                                            Not
                                                                                                                                                            Ok
                                                                                                                                                        </td>
                                                                                                                                                    </tr>
                                                                                                                                                )}
                                                                                                                                            </tbody>
                                                                                                                                        </table>
                                                                                                                                    </td>
                                                                                                                                </tr>
                                                                                                                            </tbody>
                                                                                                                        </table>
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                            </tbody>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </>
                                                                                        )}
                                                                                        {event.eventCategory ===
                                                                                            'CrewTraining' && (
                                                                                            <>
                                                                                                <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                    <td className="px-6 pb-4 w-48 border-r-1">
                                                                                                        <span className="w-48 inline-block">
                                                                                                            Activity
                                                                                                            -
                                                                                                            Training
                                                                                                        </span>
                                                                                                    </td>
                                                                                                    <td className="">
                                                                                                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                                            <tbody>
                                                                                                                <tr
                                                                                                                    key={`${event.crewTraining.id}-ct-type`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Event type`}
                                                                                                                        </span>
                                                                                                                        {`Crew training`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Training date`}
                                                                                                                        </span>
                                                                                                                        {`${formatDate(event.crewTraining.date)}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                <tr
                                                                                                                    key={`${event.crewTraining.id}-locationbc`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Start Time`}
                                                                                                                        </span>
                                                                                                                        {`${event?.crewTraining?.startTime}`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`End time`}
                                                                                                                        </span>
                                                                                                                        {`${event?.crewTraining?.finishTime}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                <tr
                                                                                                                    key={`${event.crewTraining.id}-trainer`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Trainer`}
                                                                                                                        </span>
                                                                                                                        {`${event?.crewTraining?.trainer?.id > 0 ? event?.crewTraining?.trainer?.firstName + ' ' + event?.crewTraining?.trainer?.surname : ''}`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Location`}
                                                                                                                        </span>
                                                                                                                        {`${event?.crewTraining?.geoLocation?.id > 0 ? event?.crewTraining?.geoLocation?.title : ''}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                <tr
                                                                                                                    key={`${event.crewTraining.id}-crew-trained`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Crew trained`}
                                                                                                                        </span>
                                                                                                                        <div className="inline-block max-w-[calc(100%-12rem)]">
                                                                                                                            {event?.crewTraining?.members?.nodes?.map(
                                                                                                                                (
                                                                                                                                    member: any,
                                                                                                                                    index: number,
                                                                                                                                ) => (
                                                                                                                                    <>
                                                                                                                                        {index >
                                                                                                                                            0 &&
                                                                                                                                            ', '}
                                                                                                                                        {`${member.firstName} ${member.surname}`}
                                                                                                                                    </>
                                                                                                                                ),
                                                                                                                            )}
                                                                                                                        </div>
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Training type`}
                                                                                                                        </span>
                                                                                                                        <div className="inline-block max-w-[calc(100%-12rem)]">
                                                                                                                            {event?.crewTraining?.trainingTypes?.nodes?.map(
                                                                                                                                (
                                                                                                                                    type: any,
                                                                                                                                    index: number,
                                                                                                                                ) => (
                                                                                                                                    <>
                                                                                                                                        {index >
                                                                                                                                            0 &&
                                                                                                                                            ', '}
                                                                                                                                        {`${type.title}`}
                                                                                                                                    </>
                                                                                                                                ),
                                                                                                                            )}
                                                                                                                        </div>
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                {event
                                                                                                                    ?.crewTraining
                                                                                                                    ?.trainingSummary && (
                                                                                                                    <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                                                                                        <td
                                                                                                                            className="px-6 pb-4"
                                                                                                                            colSpan={
                                                                                                                                2
                                                                                                                            }>
                                                                                                                            <div className="flex">
                                                                                                                                <span className="min-w-48 inline-block">
                                                                                                                                    Training
                                                                                                                                    summary
                                                                                                                                </span>
                                                                                                                                <div className="inline-block">
                                                                                                                                    <div
                                                                                                                                        dangerouslySetInnerHTML={{
                                                                                                                                            __html: event
                                                                                                                                                ?.crewTraining
                                                                                                                                                ?.trainingSummary,
                                                                                                                                        }}></div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </td>
                                                                                                                    </tr>
                                                                                                                )}
                                                                                                            </tbody>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </>
                                                                                        )}
                                                                                        {event.eventCategory ===
                                                                                            'Tasking' && (
                                                                                            <>
                                                                                                <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                    <td className="px-6 pb-4 w-48 border-r-1">
                                                                                                        <span className="w-48 inline-block">
                                                                                                            Activity
                                                                                                            -
                                                                                                            Tasking
                                                                                                        </span>
                                                                                                    </td>
                                                                                                    <td className="">
                                                                                                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                                            <tbody>
                                                                                                                <tr
                                                                                                                    key={`${event.eventType_Tasking.id}-et-type`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1 w-1/2">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Event type`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_Tasking?.type.replace(/([A-Z])/g, ' $1')}`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4 w-1/2">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Time`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_Tasking?.time}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                <tr
                                                                                                                    key={`${event.eventType_Tasking.id}-et2-type`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1 w-1/2">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Title`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_Tasking?.title}`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4 w-1/2">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Location`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_Tasking?.geoLocation?.id > 0 ? event?.eventType_Tasking?.geoLocation?.title : ''}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                <tr
                                                                                                                    key={`${event.eventType_Tasking.id}-et3-type`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1 w-1/2">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Activity type`}
                                                                                                                        </span>
                                                                                                                        {getActivityType(
                                                                                                                            event.eventType_Tasking,
                                                                                                                            trip,
                                                                                                                        )}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4 w-1/2">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Fuel`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_Tasking?.fuelLog?.nodes?.length ? event?.eventType_Tasking?.fuelLog?.nodes[0]?.fuelAfter : '-'}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                {event
                                                                                                                    ?.eventType_Tasking
                                                                                                                    ?.vesselRescueID >
                                                                                                                    0 &&
                                                                                                                    event
                                                                                                                        ?.eventType_Tasking
                                                                                                                        ?.type ===
                                                                                                                        'TaskingStartUnderway' && (
                                                                                                                        <>
                                                                                                                            <tr
                                                                                                                                key={`${event.eventType_Tasking.id}-et-vr1-type`}
                                                                                                                                className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                <td className="px-6 pb-4 border-r-1 w-1/2">
                                                                                                                                    <span className="w-48 inline-block">
                                                                                                                                        {`Target vessel`}
                                                                                                                                    </span>
                                                                                                                                    {`${event?.eventType_Tasking?.vesselRescue?.vesselName}`}
                                                                                                                                </td>
                                                                                                                                <td className="px-6 pb-4 w-1/2">
                                                                                                                                    <span className="w-48 inline-block">
                                                                                                                                        {`Call sign`}
                                                                                                                                    </span>
                                                                                                                                    {`${event?.eventType_Tasking?.vesselRescue?.callSign}`}
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            <tr
                                                                                                                                key={`${event.eventType_Tasking.id}-et-vr2-type`}
                                                                                                                                className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                <td className="px-6 pb-4 border-r-1 w-1/2">
                                                                                                                                    <span className="w-48 inline-block">
                                                                                                                                        {`P.O.B`}
                                                                                                                                    </span>
                                                                                                                                    {`${event?.eventType_Tasking?.vesselRescue?.pob}`}
                                                                                                                                </td>
                                                                                                                                <td className="px-6 pb-4 w-1/2">
                                                                                                                                    <span className="w-48 inline-block">
                                                                                                                                        {`Location`}
                                                                                                                                    </span>
                                                                                                                                    {`${event?.eventType_Tasking?.vesselRescue?.vesselLocation?.id > 0 ? event?.eventType_Tasking?.vesselRescue?.vesselLocation?.title : ''}`}
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            {event
                                                                                                                                ?.eventType_Tasking
                                                                                                                                ?.vesselRescue
                                                                                                                                ?.locationDescription && (
                                                                                                                                <tr
                                                                                                                                    key={`${event.eventType_Tasking.id}-et-vr3-type`}
                                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                    <td
                                                                                                                                        className="px-6 pb-4"
                                                                                                                                        colSpan={
                                                                                                                                            2
                                                                                                                                        }>
                                                                                                                                        <span className="w-48 inline-block">
                                                                                                                                            {`Location description`}
                                                                                                                                        </span>
                                                                                                                                        <div className="inline-block max-w-[calc(100%-12rem)]">
                                                                                                                                            {`${event?.eventType_Tasking?.vesselRescue?.locationDescription}`}
                                                                                                                                        </div>
                                                                                                                                    </td>
                                                                                                                                </tr>
                                                                                                                            )}
                                                                                                                            <tr
                                                                                                                                key={`${event.eventType_Tasking.id}-et-vr4-type`}
                                                                                                                                className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                <td className="px-6 pb-4 border-r-1 w-1/2">
                                                                                                                                    <span className="w-48 inline-block">
                                                                                                                                        {`Vessel length`}
                                                                                                                                    </span>
                                                                                                                                    {`${event?.eventType_Tasking?.vesselRescue?.vesselLength}`}
                                                                                                                                </td>
                                                                                                                                <td className="px-6 pb-4 w-1/2">
                                                                                                                                    <span className="w-48 inline-block">
                                                                                                                                        {`Vessel type`}
                                                                                                                                    </span>
                                                                                                                                    {`${event?.eventType_Tasking?.vesselRescue?.vesselType}`}
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            {event
                                                                                                                                ?.eventType_Tasking
                                                                                                                                ?.vesselRescue
                                                                                                                                ?.vesselTypeDescription && (
                                                                                                                                <tr
                                                                                                                                    key={`${event.eventType_Tasking.id}-et-vr5-type`}
                                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                    <td
                                                                                                                                        className="px-6 pb-4"
                                                                                                                                        colSpan={
                                                                                                                                            2
                                                                                                                                        }>
                                                                                                                                        <span className="w-48 inline-block">
                                                                                                                                            {`Vessel description`}
                                                                                                                                        </span>
                                                                                                                                        <div className="inline-block max-w-[calc(100%-12rem)]">
                                                                                                                                            {`${event?.eventType_Tasking?.vesselRescue?.vesselTypeDescription}`}
                                                                                                                                        </div>
                                                                                                                                    </td>
                                                                                                                                </tr>
                                                                                                                            )}
                                                                                                                            <tr
                                                                                                                                key={`${event.eventType_Tasking.id}-et-vr6-type`}
                                                                                                                                className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                <td className="px-6 pb-4 border-r-1 w-1/2">
                                                                                                                                    <span className="w-48 inline-block">
                                                                                                                                        {`Make and model`}
                                                                                                                                    </span>
                                                                                                                                    {`${event?.eventType_Tasking?.vesselRescue?.makeAndModel}`}
                                                                                                                                </td>
                                                                                                                                <td className="px-6 pb-4 w-1/2">
                                                                                                                                    <span className="w-48 inline-block">
                                                                                                                                        {`Vessel color`}
                                                                                                                                    </span>
                                                                                                                                    {`${event?.eventType_Tasking?.vesselRescue?.color}`}
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            <tr
                                                                                                                                key={`${event.eventType_Tasking.id}-et-vr7-type`}
                                                                                                                                className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                <td className="px-6 pb-4 border-r-1 w-1/2">
                                                                                                                                    <span className="w-48 inline-block">
                                                                                                                                        {`Owner name`}
                                                                                                                                    </span>
                                                                                                                                    {`${event?.eventType_Tasking?.vesselRescue?.ownerName}`}
                                                                                                                                </td>
                                                                                                                                <td className="px-6 pb-4 w-1/2">
                                                                                                                                    <span className="w-48 inline-block">
                                                                                                                                        {`Owner on board?`}
                                                                                                                                    </span>
                                                                                                                                    {`${event?.eventType_Tasking?.vesselRescue?.ownerOnBoard ? 'Yes' : 'No'}`}
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            <tr
                                                                                                                                key={`${event.eventType_Tasking.id}-et-vr8-type`}
                                                                                                                                className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                <td className="px-6 pb-4 border-r-1 w-1/2">
                                                                                                                                    <span className="w-48 inline-block">
                                                                                                                                        {`Owner phone`}
                                                                                                                                    </span>
                                                                                                                                    {`${event?.eventType_Tasking?.vesselRescue?.phone}`}
                                                                                                                                </td>
                                                                                                                                <td className="px-6 pb-4 w-1/2">
                                                                                                                                    <span className="w-48 inline-block">
                                                                                                                                        {`CG Membership`}
                                                                                                                                    </span>
                                                                                                                                    {`${event?.eventType_Tasking?.vesselRescue?.cgMembership}`}
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            <tr
                                                                                                                                key={`${event.eventType_Tasking.id}-et-vr9-type`}
                                                                                                                                className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                <td className="px-6 pb-4 border-r-1 w-1/2">
                                                                                                                                    <span className="w-48 inline-block">
                                                                                                                                        {`Owner email`}
                                                                                                                                    </span>
                                                                                                                                    {`${event?.eventType_Tasking?.vesselRescue?.email}`}
                                                                                                                                </td>
                                                                                                                                <td className="px-6 pb-4 w-1/2">
                                                                                                                                    <span className="w-48 inline-block">
                                                                                                                                        {`Owner address`}
                                                                                                                                    </span>
                                                                                                                                    {`${event?.eventType_Tasking?.vesselRescue?.address}`}
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            {event
                                                                                                                                ?.eventType_Tasking
                                                                                                                                ?.cgop && (
                                                                                                                                <tr
                                                                                                                                    key={`${event.eventType_Tasking.id}-et-incident-cgop`}
                                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                    <td
                                                                                                                                        className="px-6 pb-4"
                                                                                                                                        colSpan={
                                                                                                                                            2
                                                                                                                                        }>
                                                                                                                                        <span className="w-48 inline-block">
                                                                                                                                            {`Incident details`}
                                                                                                                                        </span>
                                                                                                                                        {`CoastGuard Rescue - ${event?.eventType_Tasking?.cgop}`}
                                                                                                                                    </td>
                                                                                                                                </tr>
                                                                                                                            )}
                                                                                                                            {event
                                                                                                                                ?.eventType_Tasking
                                                                                                                                ?.sarop && (
                                                                                                                                <tr
                                                                                                                                    key={`${event.eventType_Tasking.id}-et-incident-sarop`}
                                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                    <td
                                                                                                                                        className="px-6 pb-4"
                                                                                                                                        colSpan={
                                                                                                                                            2
                                                                                                                                        }>
                                                                                                                                        <span className="w-48 inline-block">
                                                                                                                                            {`Incident details`}
                                                                                                                                        </span>
                                                                                                                                        {`SAROP - ${event?.eventType_Tasking?.sarop}`}
                                                                                                                                    </td>
                                                                                                                                </tr>
                                                                                                                            )}
                                                                                                                        </>
                                                                                                                    )}
                                                                                                                {event
                                                                                                                    ?.eventType_Tasking
                                                                                                                    ?.vesselRescueID >
                                                                                                                    0 &&
                                                                                                                    event
                                                                                                                        ?.eventType_Tasking
                                                                                                                        ?.type ===
                                                                                                                        'TaskingComplete' && (
                                                                                                                        <>
                                                                                                                            {event
                                                                                                                                ?.eventType_Tasking
                                                                                                                                ?.vesselRescue
                                                                                                                                ?.mission
                                                                                                                                ?.id >
                                                                                                                                0 && (
                                                                                                                                <tr
                                                                                                                                    key={`${event.eventType_Tasking.id}-et-mission`}
                                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                    <td
                                                                                                                                        className="px-6 pb-4"
                                                                                                                                        colSpan={
                                                                                                                                            2
                                                                                                                                        }>
                                                                                                                                        <span className="w-48 inline-block">
                                                                                                                                            {`Mission outcome`}
                                                                                                                                        </span>
                                                                                                                                        {`${event?.eventType_Tasking?.vesselRescue?.mission?.operationOutcome?.replace(/_/g, ' ')}`}
                                                                                                                                    </td>
                                                                                                                                </tr>
                                                                                                                            )}
                                                                                                                            {event
                                                                                                                                ?.eventType_Tasking
                                                                                                                                ?.vesselRescue
                                                                                                                                ?.missionTimeline
                                                                                                                                ?.nodes
                                                                                                                                ?.length >
                                                                                                                                0 && (
                                                                                                                                <tr
                                                                                                                                    key={`${event.eventType_Tasking.id}-et-mission-timeline`}
                                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                    <td
                                                                                                                                        className="px-6"
                                                                                                                                        colSpan={
                                                                                                                                            2
                                                                                                                                        }>
                                                                                                                                        <div className="pb-4">
                                                                                                                                            {`Mission notes/comments`}
                                                                                                                                        </div>
                                                                                                                                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                                                                            <tbody>
                                                                                                                                                {event?.eventType_Tasking?.vesselRescue?.missionTimeline?.nodes?.map(
                                                                                                                                                    (
                                                                                                                                                        mission: any,
                                                                                                                                                    ) => (
                                                                                                                                                        <tr
                                                                                                                                                            key={`${mission.id}-et-mission-timeline`}
                                                                                                                                                            className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                                            <td className="pr-6 pb-4">
                                                                                                                                                                {`${formatDateTime(mission?.time)} - ${mission?.commentType}`}
                                                                                                                                                            </td>
                                                                                                                                                            <td className="px-6 pb-4">
                                                                                                                                                                <div
                                                                                                                                                                    dangerouslySetInnerHTML={{
                                                                                                                                                                        __html: mission?.description,
                                                                                                                                                                    }}></div>
                                                                                                                                                            </td>
                                                                                                                                                            <td className="px-6 pb-4">
                                                                                                                                                                {`${mission?.author?.id > 0 ? mission?.author?.firstName + ' ' + mission?.author?.surname : ''}`}
                                                                                                                                                            </td>
                                                                                                                                                        </tr>
                                                                                                                                                    ),
                                                                                                                                                )}
                                                                                                                                            </tbody>
                                                                                                                                        </table>
                                                                                                                                    </td>
                                                                                                                                </tr>
                                                                                                                            )}
                                                                                                                        </>
                                                                                                                    )}
                                                                                                                {event
                                                                                                                    ?.eventType_Tasking
                                                                                                                    ?.vesselRescueID >
                                                                                                                    0 &&
                                                                                                                    event
                                                                                                                        ?.eventType_Tasking
                                                                                                                        ?.type ===
                                                                                                                        'TaskingOnTow' && (
                                                                                                                        <>
                                                                                                                            {event
                                                                                                                                ?.eventType_Tasking
                                                                                                                                ?.vesselRescue
                                                                                                                                ?.mission
                                                                                                                                ?.id >
                                                                                                                                0 && (
                                                                                                                                <tr
                                                                                                                                    key={`${event.eventType_Tasking.id}-et-mission`}
                                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                    <td
                                                                                                                                        className="px-6"
                                                                                                                                        colSpan={
                                                                                                                                            2
                                                                                                                                        }>
                                                                                                                                        <div className="pb-4">
                                                                                                                                            {`Towing checklist - risk analysis`}
                                                                                                                                        </div>
                                                                                                                                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                                                                            <tbody>
                                                                                                                                                {Object.entries(
                                                                                                                                                    getTowingChecklist(
                                                                                                                                                        event.eventType_Tasking,
                                                                                                                                                        trip,
                                                                                                                                                    ),
                                                                                                                                                ).filter(
                                                                                                                                                    ([
                                                                                                                                                        key,
                                                                                                                                                        value,
                                                                                                                                                    ]) =>
                                                                                                                                                        value ===
                                                                                                                                                        true,
                                                                                                                                                )
                                                                                                                                                    .length >
                                                                                                                                                    0 && (
                                                                                                                                                    <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                                        <td className="pr-6 pb-4 border-r-1">
                                                                                                                                                            {Object.entries(
                                                                                                                                                                getTowingChecklist(
                                                                                                                                                                    event.eventType_Tasking,
                                                                                                                                                                    trip,
                                                                                                                                                                ),
                                                                                                                                                            )
                                                                                                                                                                .filter(
                                                                                                                                                                    ([
                                                                                                                                                                        key,
                                                                                                                                                                        value,
                                                                                                                                                                    ]) =>
                                                                                                                                                                        value ===
                                                                                                                                                                        true,
                                                                                                                                                                )
                                                                                                                                                                .map(
                                                                                                                                                                    ([
                                                                                                                                                                        key,
                                                                                                                                                                        value,
                                                                                                                                                                    ]) => ({
                                                                                                                                                                        key,
                                                                                                                                                                        value,
                                                                                                                                                                    }),
                                                                                                                                                                )
                                                                                                                                                                .map(
                                                                                                                                                                    (
                                                                                                                                                                        item,
                                                                                                                                                                    ) => {
                                                                                                                                                                        return item.key
                                                                                                                                                                            .replace(
                                                                                                                                                                                /([A-Z])/g,
                                                                                                                                                                                ' $1',
                                                                                                                                                                            )
                                                                                                                                                                            .replace(
                                                                                                                                                                                /^./,
                                                                                                                                                                                (
                                                                                                                                                                                    str,
                                                                                                                                                                                ) =>
                                                                                                                                                                                    str.toUpperCase(),
                                                                                                                                                                            )
                                                                                                                                                                    },
                                                                                                                                                                )
                                                                                                                                                                .join(
                                                                                                                                                                    ', ',
                                                                                                                                                                )}
                                                                                                                                                        </td>
                                                                                                                                                        <td className="px-6 pb-4">
                                                                                                                                                            Ok
                                                                                                                                                        </td>
                                                                                                                                                    </tr>
                                                                                                                                                )}
                                                                                                                                                {Object.entries(
                                                                                                                                                    getTowingChecklist(
                                                                                                                                                        event.eventType_Tasking,
                                                                                                                                                        trip,
                                                                                                                                                    ),
                                                                                                                                                ).filter(
                                                                                                                                                    ([
                                                                                                                                                        key,
                                                                                                                                                        value,
                                                                                                                                                    ]) =>
                                                                                                                                                        value ===
                                                                                                                                                        false,
                                                                                                                                                )
                                                                                                                                                    .length >
                                                                                                                                                    0 && (
                                                                                                                                                    <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                                        <td className="pr-6 pb-4 border-r-1">
                                                                                                                                                            {Object.entries(
                                                                                                                                                                getTowingChecklist(
                                                                                                                                                                    event.eventType_Tasking,
                                                                                                                                                                    trip,
                                                                                                                                                                ),
                                                                                                                                                            )
                                                                                                                                                                .filter(
                                                                                                                                                                    ([
                                                                                                                                                                        key,
                                                                                                                                                                        value,
                                                                                                                                                                    ]) =>
                                                                                                                                                                        value ===
                                                                                                                                                                        false,
                                                                                                                                                                )
                                                                                                                                                                .map(
                                                                                                                                                                    ([
                                                                                                                                                                        key,
                                                                                                                                                                        value,
                                                                                                                                                                    ]) => ({
                                                                                                                                                                        key,
                                                                                                                                                                        value,
                                                                                                                                                                    }),
                                                                                                                                                                )
                                                                                                                                                                .map(
                                                                                                                                                                    (
                                                                                                                                                                        item,
                                                                                                                                                                    ) => {
                                                                                                                                                                        return item.key
                                                                                                                                                                            .replace(
                                                                                                                                                                                /([A-Z])/g,
                                                                                                                                                                                ' $1',
                                                                                                                                                                            )
                                                                                                                                                                            .replace(
                                                                                                                                                                                /^./,
                                                                                                                                                                                (
                                                                                                                                                                                    str,
                                                                                                                                                                                ) =>
                                                                                                                                                                                    str.toUpperCase(),
                                                                                                                                                                            )
                                                                                                                                                                    },
                                                                                                                                                                )
                                                                                                                                                                .join(
                                                                                                                                                                    ', ',
                                                                                                                                                                )}
                                                                                                                                                        </td>
                                                                                                                                                        <td className="px-6 pb-4 w-32">
                                                                                                                                                            Not
                                                                                                                                                            Ok
                                                                                                                                                        </td>
                                                                                                                                                    </tr>
                                                                                                                                                )}
                                                                                                                                                {getTowingChecklist(
                                                                                                                                                    event.eventType_Tasking,
                                                                                                                                                    trip,
                                                                                                                                                )
                                                                                                                                                    ?.riskFactors
                                                                                                                                                    ?.nodes
                                                                                                                                                    ?.length >
                                                                                                                                                    0 && (
                                                                                                                                                    <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                                        <td
                                                                                                                                                            className="pr-6 pb-4"
                                                                                                                                                            colSpan={
                                                                                                                                                                2
                                                                                                                                                            }>
                                                                                                                                                            {getTowingChecklist(
                                                                                                                                                                event.eventType_Tasking,
                                                                                                                                                                trip,
                                                                                                                                                            )?.riskFactors?.nodes?.map(
                                                                                                                                                                (
                                                                                                                                                                    item: any,
                                                                                                                                                                    index: number,
                                                                                                                                                                ) => (
                                                                                                                                                                    <div
                                                                                                                                                                        className="inline-block"
                                                                                                                                                                        key={
                                                                                                                                                                            item.id
                                                                                                                                                                        }>
                                                                                                                                                                        {index >
                                                                                                                                                                        0
                                                                                                                                                                            ? ', '
                                                                                                                                                                            : 'Risk factors: '}
                                                                                                                                                                        {`${item.title} - ${item.impact} - ${item.probability}/10`}
                                                                                                                                                                    </div>
                                                                                                                                                                ),
                                                                                                                                                            )}
                                                                                                                                                        </td>
                                                                                                                                                    </tr>
                                                                                                                                                )}
                                                                                                                                                {getTowingChecklist(
                                                                                                                                                    event.eventType_Tasking,
                                                                                                                                                    trip,
                                                                                                                                                )
                                                                                                                                                    ?.member
                                                                                                                                                    ?.id >
                                                                                                                                                    0 && (
                                                                                                                                                    <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                                                        <td
                                                                                                                                                            className="pr-6 pb-4"
                                                                                                                                                            colSpan={
                                                                                                                                                                2
                                                                                                                                                            }>
                                                                                                                                                            {`Author: ${getTowingChecklist(event.eventType_Tasking, trip)?.member?.firstName} ${getTowingChecklist(event.eventType_Tasking, trip)?.member?.surname}`}
                                                                                                                                                        </td>
                                                                                                                                                    </tr>
                                                                                                                                                )}
                                                                                                                                            </tbody>
                                                                                                                                        </table>
                                                                                                                                    </td>
                                                                                                                                </tr>
                                                                                                                            )}
                                                                                                                        </>
                                                                                                                    )}
                                                                                                            </tbody>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </>
                                                                                        )}
                                                                                        {event.eventCategory ===
                                                                                            'RefuellingBunkering' && (
                                                                                            <>
                                                                                                <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                    <td className="px-6 pb-4 w-48 border-r-1">
                                                                                                        <span className="w-48 inline-block">
                                                                                                            {`Activity - Refueling and Bunkering`}
                                                                                                        </span>
                                                                                                    </td>
                                                                                                    <td className="">
                                                                                                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                                            <tbody>
                                                                                                                <tr
                                                                                                                    key={`${event.eventType_RefuellingBunkering.id}-rb-type`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Date`}
                                                                                                                        </span>
                                                                                                                        {`${formatDateTime(event?.eventType_RefuellingBunkering?.date)}`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Location`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_RefuellingBunkering?.geoLocation?.id > 0 ? event?.eventType_RefuellingBunkering?.geoLocation?.title : ''}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                <tr
                                                                                                                    key={`${event.id}-fuel-details`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Fuel added`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_RefuellingBunkering?.fuelLog?.nodes?.length ? event?.eventType_RefuellingBunkering?.fuelLog?.nodes[0]?.fuelAdded : '-'}`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Fuel level`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_RefuellingBunkering?.fuelLog?.nodes?.length ? event?.eventType_RefuellingBunkering?.fuelLog?.nodes[0]?.fuelAfter : '-'}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                {event
                                                                                                                    ?.eventType_RefuellingBunkering
                                                                                                                    ?.notes && (
                                                                                                                    <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                        <td
                                                                                                                            className="px-6 pb-4"
                                                                                                                            colSpan={
                                                                                                                                2
                                                                                                                            }>
                                                                                                                            <div className="flex">
                                                                                                                                <span className="min-w-48 inline-block">
                                                                                                                                    Notes
                                                                                                                                </span>
                                                                                                                                <div className="inline-block">
                                                                                                                                    <div
                                                                                                                                        dangerouslySetInnerHTML={{
                                                                                                                                            __html: event
                                                                                                                                                ?.eventType_RefuellingBunkering
                                                                                                                                                ?.notes,
                                                                                                                                        }}></div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </td>
                                                                                                                    </tr>
                                                                                                                )}
                                                                                                            </tbody>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </>
                                                                                        )}
                                                                                        {event.eventCategory ===
                                                                                            'PassengerDropFacility' && (
                                                                                            <>
                                                                                                <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                    <td className="px-6 pb-4 w-48 border-r-1">
                                                                                                        <span className="w-48 inline-block">
                                                                                                            {`Activity - ${event?.eventType_PassengerDropFacility?.type.replace('Passenger', '')}`}
                                                                                                        </span>
                                                                                                    </td>
                                                                                                    <td className="">
                                                                                                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                                            <tbody>
                                                                                                                <tr
                                                                                                                    key={`${event.eventType_PassengerDropFacility.id}-pdf-type`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Title`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_PassengerDropFacility?.title}`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Time`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_PassengerDropFacility?.time}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                <tr
                                                                                                                    key={`${event.id}-location-fuel`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Location`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_PassengerDropFacility?.geoLocation?.id > 0 ? event?.eventType_PassengerDropFacility?.geoLocation?.title : '-'}`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Fuel`}
                                                                                                                        </span>
                                                                                                                        {`${event?.eventType_PassengerDropFacility?.fuelLog?.nodes?.length ? event?.eventType_PassengerDropFacility?.fuelLog?.nodes[0]?.fuelAfter : '-'}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                            </tbody>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </>
                                                                                        )}
                                                                                        {event.eventCategory ===
                                                                                            'EventSupernumerary' && (
                                                                                            <>
                                                                                                <tr className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                    <td className="px-6 pb-4 w-48 border-r-1">
                                                                                                        <span className="w-48 inline-block">
                                                                                                            {`Activity - Supernumerary`}
                                                                                                        </span>
                                                                                                    </td>
                                                                                                    <td className="">
                                                                                                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                                            <tbody>
                                                                                                                <tr
                                                                                                                    key={`${event.supernumerary.id}-sup-type`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Title`}
                                                                                                                        </span>
                                                                                                                        {`${event?.supernumerary?.title}`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Briefing time`}
                                                                                                                        </span>
                                                                                                                        {`${event?.supernumerary?.briefingTime ? event?.supernumerary?.briefingTime : '-'}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                <tr
                                                                                                                    key={`${event.id}-sup-time`}
                                                                                                                    className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                    <td className="px-6 pb-4 border-r-1">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Total guests`}
                                                                                                                        </span>
                                                                                                                        {`${event?.supernumerary?.totalGuest}`}
                                                                                                                    </td>
                                                                                                                    <td className="px-6 pb-4">
                                                                                                                        <span className="w-48 inline-block">
                                                                                                                            {`Is briefed?`}
                                                                                                                        </span>
                                                                                                                        {`${event?.supernumerary?.isBriefed ? 'Yes' : 'No'}`}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                {event
                                                                                                                    ?.supernumerary
                                                                                                                    ?.guestList
                                                                                                                    ?.nodes
                                                                                                                    ?.length >
                                                                                                                    0 && (
                                                                                                                    <tr
                                                                                                                        key={`${event.id}-guest-list`}
                                                                                                                        className="bg-white border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700">
                                                                                                                        <td
                                                                                                                            className="px-6 pb-4"
                                                                                                                            colSpan={
                                                                                                                                2
                                                                                                                            }>
                                                                                                                            <span className="w-48 inline-block">
                                                                                                                                {`Guests list`}
                                                                                                                            </span>
                                                                                                                            {event?.supernumerary?.guestList?.nodes?.map(
                                                                                                                                (
                                                                                                                                    guest: any,
                                                                                                                                ) => (
                                                                                                                                    <div
                                                                                                                                        key={`${guest.id}-sup-gl`}>
                                                                                                                                        {`${guest.firstName} ${guest.surname}`}
                                                                                                                                    </div>
                                                                                                                                ),
                                                                                                                            )}
                                                                                                                        </td>
                                                                                                                    </tr>
                                                                                                                )}
                                                                                                            </tbody>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </>
                                                                                        )}
                                                                                    </>
                                                                                ),
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </>
                                                    )}
                                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                        <td className="px-6 pb-4">
                                                            <span className="w-48 inline-block">
                                                                Arrival
                                                            </span>
                                                            {`Expected time: ${trip?.arriveTime} - Actual time: ${dayjs(trip?.arrive).format('HH:mm:ss')}`}
                                                        </td>
                                                        <td className="px-6 pb-4">
                                                            <span className="w-48 inline-block">
                                                                Arrival location
                                                            </span>{' '}
                                                            {trip?.toLocation
                                                                ?.id > 0
                                                                ? trip
                                                                      ?.toLocation
                                                                      ?.title
                                                                : trip
                                                                      ?.toLocation
                                                                      ?.lat +
                                                                  ' ' +
                                                                  trip
                                                                      ?.toLocation
                                                                      ?.long}
                                                        </td>
                                                    </tr>
                                                    {trip?.comment && (
                                                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                            <td
                                                                className="px-6 pb-4"
                                                                colSpan={2}>
                                                                <div className="flex">
                                                                    <span className="min-w-48 inline-block">
                                                                        Comment
                                                                    </span>
                                                                    <div className="inline-block">
                                                                        <div
                                                                            dangerouslySetInnerHTML={{
                                                                                __html: trip?.comment,
                                                                            }}></div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            ) : (
                <Loading message="Generating the PDF report..." />
            )}
        </>
    )
}
