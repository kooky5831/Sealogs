'use client'
import {
    Button,
    Heading,
    Popover,
    DialogTrigger,
    ListBox,
    ListBoxItem,
} from 'react-aria-components'
import LogEntryList from '../logbook/entry-list'
import {
    GET_LOGBOOK_ENTRY_BY_ID,
    GET_CREW_BY_IDS,
    GET_FUELTANKS,
    GET_ENGINES,
    GET_SEWAGESYSTEMS,
    GET_WATERTANKS,
    GET_FILES,
    GET_INVENTORY_BY_VESSEL_ID,
    GET_MAINTENANCE_CHECK_BY_VESSEL_ID,
} from '@/app/lib/graphQL/query'
import {
    UPDATE_VESSEL,
    CREATE_LOGBOOK,
    CREATE_LOGBOOK_ENTRY,
} from '@/app/lib/graphQL/mutation'
import { useLazyQuery, useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import Skeleton from '@/app/components/Skeleton'
import {
    FooterWrapper,
    SeaLogsButton,
    PopoverWrapper,
    AlertDialog,
    TableWrapper,
} from '@/app/components/Components'
import { SealogsMaintenanceIcon } from '../../lib/icons/SealogsMaintenanceIcon'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { Table } from '@/app/ui/maintenance/list'
import { InventortList } from '@/app/ui/inventory/list'
import { TrainingList } from '@/app/ui/crew-training/list'
import { CrewTable } from '@/app/ui/crew/list'
import {
    getVesselByID,
    getTrainingSessionsByVesselId,
    getComponentMaintenanceCheckByVesselId,
    getLogBookEntries,
    isOverDueTask,
    getTrainingSessionDuesByVesselId,
} from '@/app/lib/actions'
import FileUpload from '@/app/ui/file-upload'
import { isEmpty } from 'lodash'
import dayjs from 'dayjs'
import { SealogsFuelIcon } from '../../lib/icons/SealogsFuelIcon'
import { SealogsEngineIcon } from '../../lib/icons/SealogsEngineIcon'
import { SealogsLogbookIcon } from '../../lib/icons/SealogsLogbookIcon'
import { SealogsTrainingIcon } from '../../lib/icons/SealogsTrainingIcon'
import CrewMultiSelectDropdown from '../crew/multiselect-dropdown'
import toast, { Toaster } from 'react-hot-toast'
import { classes } from '@/app/components/GlobalClasses'
import { getPermissions, hasPermission, isCrew } from '@/app/helpers/userHelper'
import FileItem from '@/app/components/FileItem'
import { formatDate } from '@/app/helpers/dateHelper'
import { usePathname, useSearchParams } from 'next/navigation'
import { DocumentsList } from '../document-locker/list'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import LogBookEntryModel from '@/app/offline/models/logBookEntry.js'

export default function VesselsView({
    vesselId,
    tab,
}: {
    vesselId: number
    tab: any
}) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [vessel, setVessel] = useState<any>()
    const [logbooks, setLogbooks] = useState<any>([])
    const [currentLogEntryAction, setCurrentLogEntryAction] = useState<any>()
    const [currentLogEntry, setCurrentLogEntry] = useState<any>()
    const [totalEntries, setTotalEntries] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [maintenanceTasks, setMaintenanceTasks] = useState<any>([])
    const [taskCounter, setTaskCounter] = useState(0)
    const [trainingSessions, setTrainingSessions] = useState<any>()
    const [trainingSessionDues, setTrainingSessionDues] = useState<any>([])
    const [trainingSessionDuesSummary, setTrainingSessionDuesSummary] =
        useState<any>([])
    const [crewInfo, setCrewInfo] = useState<any>()
    const [taskCrewInfo, setTaskCrewInfo] = useState<any>()
    const [inventories, setInventories] = useState<any>([])
    const [engineList, setEngineList] = useState<any>()
    const [fuelTankList, setFuelTankList] = useState<any>()
    const [waterTankList, setWaterTankList] = useState<any>()
    const [sewageSystemList, setSewageSystemList] = useState<any>()
    const [documents, setDocuments] = useState<Array<Record<string, any>>>([])
    const router = useRouter()
    const [vesselTab, setVesselTab] = useState('logEntries')
    const perPage = 10
    const [displayAddCrew, setDisplayAddCrew] = useState(false)
    const [vesselCrewIDs, setVesselCrewIDs] = useState<any>([])
    const [bannerImage, setBannerImage] = useState<any>(false)
    const [isNewLogEntryDisabled, setIsNewLogEntryDisabled] = useState(true)
    const [imCrew, setImCrew] = useState(false)
    const lbeModel = new LogBookEntryModel()

    const [permissions, setPermissions] = useState<any>(false)
    const [edit_logBookEntry, setEdit_logBookEntry] = useState<any>(false)
    const [edit_task, setEdit_task] = useState<any>(false)
    const [edit_docs, setEdit_docs] = useState<any>(false)
    const [delete_docs, setDelete_docs] = useState<any>(false)

    const init_permissions = () => {
        if (permissions) {
            if (hasPermission('ADD_LOGBOOKENTRY', permissions)) {
                setEdit_logBookEntry(true)
            } else {
                setEdit_logBookEntry(false)
            }
            if (hasPermission('EDIT_TASK', permissions)) {
                setEdit_task(true)
            } else {
                setEdit_task(false)
            }
            if (hasPermission('EDIT_VESSEL_DOCUMENT', permissions)) {
                setEdit_docs(true)
            } else {
                setEdit_docs(false)
            }
            if (hasPermission('DELETE_VESSEL_DOCUMENT', permissions)) {
                setDelete_docs(true)
            } else {
                setDelete_docs(false)
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

    const handleSetLogbooks = (data: any) => {
        data.sort((a: any, b: any) =>
            b.state === 'Locked' ? -1 : a.state === 'Locked' ? 1 : 0,
        )
        setLogbooks([
            ...data
                .filter((entry: any) => entry.state !== 'Locked')
                .sort(
                    (a: any, b: any) =>
                        new Date(a.startDate).getTime() -
                        new Date(b.startDate).getTime(),
                ),
            ...data
                .filter((entry: any) => entry.state === 'Locked')
                .sort(
                    (a: any, b: any) =>
                        new Date(b.startDate).getTime() -
                        new Date(a.startDate).getTime(),
                ),
        ])
        setIsNewLogEntryDisabled(false)
        {
            data.filter((entry: any) => entry.state !== 'Locked').length > 0 &&
                setCurrentLogEntryAction(
                    data.filter((entry: any) => entry.state !== 'Locked')[0],
                )
        }
        setTotalEntries(data.length)
        {
            data.filter((entry: any) => entry.state !== 'Locked').length > 0 &&
                loadLogEntry(
                    data.filter((entry: any) => entry.state !== 'Locked')[0].id,
                )
        }
    }

    getLogBookEntries(vesselId, handleSetLogbooks)

    //getInventoryByVesselId(vesselId, setInventories)

    const [queryInventoriesByVessel] = useLazyQuery(
        GET_INVENTORY_BY_VESSEL_ID,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readInventories.nodes
                if (data) {
                    setInventories(data)
                }
            },
            onError: (error: any) => {
                console.error('queryInventories error', error)
            },
        },
    )
    useEffect(() => {
        loadInventories()
    }, [])
    const loadInventories = async () => {
        await queryInventoriesByVessel({
            variables: {
                vesselId: +vesselId,
            },
        })
    }

    const handleSetTrainingSessionDues = (data: any) => {
        const dues = data.slice(0, 5)
        setTrainingSessionDues(data)
        setTrainingSessionDuesSummary(dues)
    }
    getTrainingSessionDuesByVesselId(vesselId, handleSetTrainingSessionDues)

    getTrainingSessionsByVesselId(vesselId, setTrainingSessions)

    const [queryGetEngines] = useLazyQuery(GET_ENGINES, {
        // fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.readEngines.nodes
            setEngineList(data)
        },
        onError: (error: any) => {
            console.error('getEngines error', error)
        },
    })

    const getEngines = async (engineIds: any) => {
        await queryGetEngines({
            variables: {
                id: engineIds,
            },
        })
    }

    const [queryGetFuelTanks] = useLazyQuery(GET_FUELTANKS, {
        // fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.readFuelTanks.nodes
            setFuelTankList(data)
        },
        onError: (error: any) => {
            console.error('getFuelTanks error', error)
        },
    })

    const getFuelTanks = async (fuelTankIds: any) => {
        await queryGetFuelTanks({
            variables: {
                id: fuelTankIds,
            },
        })
    }

    const [queryGetWaterTanks] = useLazyQuery(GET_WATERTANKS, {
        // fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.readWaterTanks.nodes
            setWaterTankList(data)
        },
        onError: (error: any) => {
            console.error('getWaterTanks error', error)
        },
    })

    const getWaterTanks = async (waterTankIds: any) => {
        await queryGetWaterTanks({
            variables: {
                id: waterTankIds,
            },
        })
    }

    const [queryGetSewageSystems] = useLazyQuery(GET_SEWAGESYSTEMS, {
        // fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.readSewageSystems.nodes
            setSewageSystemList(data)
        },
        onError: (error: any) => {
            console.error('getSewageSystems error', error)
        },
    })

    const getSewageSystems = async (sewageSystemIds: any) => {
        await queryGetSewageSystems({
            variables: {
                id: sewageSystemIds,
            },
        })
    }

    const handleSetVessel = (vessel: any) => {
        setVessel(vessel)
        setVesselCrewIDs(
            vessel?.seaLogsMembers?.nodes.map((crew: any) => crew.id),
        )
        vessel?.seaLogsMembers &&
            loadCrewMemberInfo(
                vessel.seaLogsMembers.nodes
                    .filter((crew: any) => !crew.archived)
                    .map((crew: any) => +crew.id),
            )

        const engineIds = vessel?.parentComponent_Components?.nodes
            .filter(
                (item: any) =>
                    item.basicComponent.componentCategory === 'Engine',
            )
            .map((item: any) => {
                return item.basicComponent.id
            })
        const fuelTankIds = vessel?.parentComponent_Components?.nodes
            .filter(
                (item: any) =>
                    item.basicComponent.componentCategory === 'FuelTank',
            )
            .map((item: any) => {
                return item.basicComponent.id
            })
        const waterTankIds = vessel?.parentComponent_Components?.nodes
            .filter(
                (item: any) =>
                    item.basicComponent.componentCategory === 'WaterTank',
            )
            .map((item: any) => {
                return item.basicComponent.id
            })
        const sewageSystemIds = vessel?.parentComponent_Components?.nodes
            .filter(
                (item: any) =>
                    item.basicComponent.componentCategory === 'SewageSystem',
            )
            .map((item: any) => {
                return item.basicComponent.id
            })
        engineIds?.length > 0 && getEngines(engineIds)
        fuelTankIds?.length > 0 && getFuelTanks(fuelTankIds)
        waterTankIds?.length > 0 && getWaterTanks(waterTankIds)
        sewageSystemIds?.length > 0 && getSewageSystems(sewageSystemIds)
        vessel?.documents?.nodes?.length > 0 &&
            setDocuments(vessel.documents.nodes)

        if (vessel?.logBookID == 0) {
            createNewLogBook(vessel)
        }
        if (vessel?.bannerImageID !== '0' && vessel?.bannerImageID) {
            getFileDetails({
                variables: {
                    id: [vessel.bannerImageID],
                },
            })
        }
    }
    const [getFileDetails, { data, loading, error }] = useLazyQuery(GET_FILES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const data = response.readFiles.nodes
            setBannerImage(process.env.FILE_BASE_URL + data[0]?.fileFilename)
        },
        onError: (error) => {
            console.error(error)
        },
    })
    const createNewLogBook = async (vessel: any) => {
        await createLogBook({
            variables: {
                input: {
                    title: vessel.title,
                },
            },
        })
    }

    const [createLogBook] = useMutation(CREATE_LOGBOOK, {
        onCompleted: (response: any) => {
            updateVessel({
                variables: {
                    input: {
                        id: vesselId,
                        logBookID: response.createLogBook.id,
                    },
                },
            })
        },
        onError: (error: any) => {
            console.error('createLogBook error', error)
        },
    })

    getVesselByID(vesselId, handleSetVessel)

    const handleSetMaintenanceTasks = (data: any) => {
        if (data.length === 0) {
            setMaintenanceTasks(false)
        }

        const tasks = data
            .filter((task: any) => task.archived === false)
            .map((task: any) => ({
                ...task,
                isOverDue: isOverDueTask(task),
            }))
            .sort((a: any, b: any) => dayjs(a.expires).diff(dayjs(b.expires)))

        const inventoryTasks = inventories
            .flatMap((inventory: any) => {
                const checks = inventory.componentMaintenanceChecks?.nodes || []
                return checks
            })
            .filter((check: any) => check.archived === false)
            .map((check: any) => ({
                ...check,
                isOverDue: isOverDueTask(check),
            }))
            .sort((a: any, b: any) => dayjs(a.expires).diff(dayjs(b.expires)))

        const combinedTasks = [...tasks, ...inventoryTasks]
        const seenIds = new Set()

        const deduplicatedTasks = combinedTasks.filter((task: any) => {
            const isDuplicate = seenIds.has(task.id)
            seenIds.add(task.id)
            return !isDuplicate
        })

        setMaintenanceTasks(deduplicatedTasks)

        const appendedData: number[] = Array.from(
            new Set(
                deduplicatedTasks
                    .filter((task: any) => task.assignedToID > 0)
                    .map((task: any) => task.assignedToID),
            ),
        )
        loadCrewMemberInfo(appendedData, true)

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        const taskCounter = deduplicatedTasks.filter(
            (task: any) =>
                task.status !== 'Completed' &&
                task.status !== 'Save_As_Draft' &&
                task.isOverDue !== true,
        ).length

        setTaskCounter(taskCounter)
    }

    getComponentMaintenanceCheckByVesselId(vesselId, handleSetMaintenanceTasks)

    //console.log(maintenanceTasks)

    const loadLogEntry = async (logEntryId: number) => {
        await queryLogEntry({
            variables: {
                logbookEntryId: logEntryId,
            },
        })
    }

    const loadCrewMemberInfo = async (crewIds: number[], task = false) => {
        if (crewIds.length > 0) {
            task
                ? await queryTaskMembersInfo({
                      variables: {
                          crewMemberIDs: crewIds,
                      },
                  })
                : await queryCrewMemberInfo({
                      variables: {
                          crewMemberIDs: crewIds,
                      },
                  })
        }
    }

    const [queryLogEntry] = useLazyQuery(GET_LOGBOOK_ENTRY_BY_ID, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneLogBookEntry
            if (data) {
                setCurrentLogEntry(data)
            }
        },
    })

    const [queryCrewMemberInfo] = useLazyQuery(GET_CREW_BY_IDS, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readSeaLogsMembers.nodes
            if (data) {
                setCrewInfo(data)
            }
        },
        onError: (error: any) => {
            console.error('queryCrewMemberInfo error', error)
        },
    })

    const [queryTaskMembersInfo] = useLazyQuery(GET_CREW_BY_IDS, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readSeaLogsMembers.nodes
            if (data) {
                setTaskCrewInfo(data)
            }
        },
        onError: (error: any) => {
            console.error('queryTaskMembersInfo error', error)
        },
    })

    const handlePagination = (page: number) => {
        if (page < 0 || currentPage === page) {
            return
        }
        setCurrentPage(page)
    }

    const deleteFile = (fileId: number) => {
        const newDocuments = documents.filter((doc: any) => doc.id !== fileId)
        setDocuments(newDocuments)
        updateVessel({
            variables: {
                input: {
                    id: vesselId,
                    documents: newDocuments.map((doc: any) => doc.id).join(','),
                },
            },
        })
    }

    const [updateVessel] = useMutation(UPDATE_VESSEL, {
        onCompleted: (response: any) => {},
        onError: (error: any) => {
            console.error('updateVessel error', error)
        },
    })

    const handleUpdateVesselCrew = async (data: any) => {
        await updateVessel({
            variables: {
                input: {
                    id: vesselId,
                    seaLogsMembers: vesselCrewIDs.join(','),
                },
            },
        })
        setDisplayAddCrew(false)
        loadCrewMemberInfo(vesselCrewIDs)
    }
    const handleOnChangeVesselCrew = (data: any) => {
        setVesselCrewIDs(data.map((item: any) => item.value))
    }
    useEffect(() => {
        if (vesselTab === 'documents') {
            updateVessel({
                variables: {
                    input: {
                        id: vesselId,
                        documents: documents
                            .map((doc: any) => doc.id)
                            .join(','),
                    },
                },
            })
        }
        if (!isEmpty(tab)) {
            setVesselTab(tab)
        }
    }, [documents, tab])

    const handleCreateNewLogEntry = async () => {
        if (!edit_logBookEntry) {
            toast.error('You do not have permission to create a new log entry')
            return
        }
        if (
            logbooks.filter((entry: any) => entry.state !== 'Locked').length > 0
        ) {
            toast.error(
                <div>
                    Please complete the open log entry{' '}
                    <Link
                        href={`/log-entries/view/?vesselID=${vesselId}&logentryID=${
                            logbooks.filter(
                                (entry: any) => entry.state !== 'Locked',
                            )[0].id
                        }`}>
                        <span className="text-blue-500 underline">here</span>
                    </Link>{' '}
                    before creating a new one.
                </div>,
            )
        } else if (vessel?.logBookID > 0) {
            /* setIsNewLogEntryDisabled(true)
            await createLogEntry({
                variables: {
                    input: {
                        logBookID: vessel.logBookID,
                        vehicleID: vesselId,
                    },
                },
            }) */

            setIsNewLogEntryDisabled(true)
            const id = generateUniqueId()
            const logbookData = {
                id: `${id}`,
                idbCRUD: 'Create',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                // archived: false,
                // clientID: (localStorage.getItem('clientId') ?? 0),
                // createdByID: (localStorage.getItem('userId') ?? 0),
                // endDate: null,
                // fuelLevel: 0,
                logBookID: vessel.logBookID,
                startDate: dayjs().format('YYYY-MM-DD'),
                state: 'Editing',
                vehicleID: `${vesselId}`,
                masterID: '0',
                logBookEntrySections: {
                    nodes: [],
                },
            }
            await lbeModel.save(logbookData)
            router.push(
                `/log-entries/view/?vesselID=${vesselId}&logentryID=${id}`,
            )
        }
    }

    const [createLogEntry] = useMutation(CREATE_LOGBOOK_ENTRY, {
        onCompleted: (response: any) => {
            router.push(
                `/log-entries/view/?vesselID=${vesselId}&logentryID=${response.createLogBookEntry.id}`,
            )
        },
        onError: (error: any) => {
            console.error('createLogEntry error', error)
            toast.error(error.message)
        },
    })

    useEffect(() => {
        setImCrew(isCrew())
    }, [])

    return (
        <div className="w-vw p-0 ml-[1px] mb-20">
            <div className="block lg:-mt-4">
                {bannerImage ? (
                    <div
                        className={`w-100 lg:!h-[500px] md:!h-[500px] !h-[250px] bg-center bg-cover rounded-lg border-b border-b-slblue-1000`}
                        style={{
                            backgroundImage: `url('${bannerImage}')`,
                        }}></div>
                ) : (
                    <div
                        className="w-full lg:h-[500px] md:h-[500px] h-[250px] bg-center bg-cover rounded-t-lg border-b border-b-slblue-1000"
                        style={{
                            backgroundImage: "url('/sealogs-SeaLogs_hero.png')",
                        }}></div>
                )}
            </div>
            <div className="px-1 md:px-4 -mt-20 md:-mt-24 dark:bg-sldarkblue-800">
                <div className="hidden lg:flex flex-col lg:flex-row justify-items-stretch gap-2 xl:gap-4">
                    <div className="w-full shadow-lg h-100 p-0 overflow-hidden bg-slblue-1000 border-2 border-sllightblue-100 rounded-lg dark:bg-slblue-800 dark:border-slblue-700">
                        <div className="lg:flex p-4 flex-col lg:justify-between font-light">
                            <div className="font-light text-white flex border-b border-sllightblue-1000 pb-3 justify-between">
                                <div>
                                    <SealogsLogbookIcon
                                        className={`${classes.icons} h-6 w-6`}
                                    />
                                    <span className="font-bold ml-2">
                                        Logbook&nbsp;
                                    </span>
                                    entries
                                </div>
                                <Button
                                    className="text-2xs hover:text-sllightblue-800 font-inter"
                                    onPress={() => setVesselTab('logEntries')}>
                                    VIEW ALL
                                </Button>
                            </div>
                            {logbooks.length > 0 ? (
                                logbooks.map((entry: any, index: number) => {
                                    if (index > 4) {
                                        return
                                    }
                                    return (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center py-2 border-b border-sldarkblue-800">
                                            <div className="text-white">
                                                <Link
                                                    href={`/log-entries/view/?vesselID=${vesselId}&logentryID=${entry.id}`}
                                                    className={`${entry.state === 'Locked' ? 'group-hover:text-sllightblue-1000' : ''} `}>
                                                    {entry.state ===
                                                    'Locked' ? (
                                                        'Log entry'
                                                    ) : (
                                                        <strong>
                                                            Open log
                                                        </strong>
                                                    )}{' '}
                                                    {entry?.startDate
                                                        ? formatDate(
                                                              entry.startDate,
                                                          )
                                                        : ''}
                                                </Link>
                                            </div>
                                            <div
                                                className={`text-2xs font-normal ${entry.state === 'Locked' ? 'bg-slblue-100 p-2 border rounded border-slblue-1000' : 'text-slred-1000 bg-slred-100 p-2 border rounded border-slred-1000 '}`}>
                                                {entry.state}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="flex justify-between items-center gap-2 p-2 pt-4">
                                    <div>
                                        <svg
                                            className="!w-[100pxfull] h-auto"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 148.02 147.99"
                                            width="75px">
                                            <path
                                                d="M77.22,1.87c16.33.68,32.06,7.03,44.45,17.92,1.45,1.28,3.52,3.29,4.91,4.75,6.1,6.47,10.96,14.04,14.33,22.28,3.16,7.74,4.9,15.83,5.26,24.41.06,1.49.03,5.46-.05,6.77-.36,5.7-1.19,10.63-2.67,15.83-2.81,9.86-7.83,19.18-14.57,27.04-7.36,8.59-16.57,15.32-26.95,19.7-6.93,2.92-14.32,4.73-21.87,5.37-3.41.29-7.72.31-11.14.07-15.22-1.08-29.46-6.84-41.21-16.66-2.97-2.48-5.95-5.43-8.53-8.43-9.82-11.43-15.82-25.72-17.1-40.74-.33-3.82-.34-8.1-.05-11.85,1-12.65,5.27-24.7,12.46-35.16,4.39-6.39,9.89-12.14,16.08-16.8,6.61-4.99,14.03-8.82,21.79-11.25,8.09-2.54,16.24-3.6,24.85-3.24Z"
                                                fill="#ffffff"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M71.21.51c-6.79.3-12.79,1.32-18.98,3.24-3.79,1.17-7.22,2.55-10.87,4.36-5.55,2.75-10.46,6-15.13,10-2.62,2.25-5.48,5.09-7.79,7.74C8.49,37.29,2.27,51.76.84,66.75c-.28,2.92-.36,4.91-.32,8.13.03,2.95.13,4.62.42,7.3,1.1,10.08,4.4,20.06,9.57,28.9,4.28,7.33,9.89,13.94,16.46,19.42,5.95,4.96,12.56,8.9,19.79,11.79,6.92,2.77,14.11,4.44,21.56,5,2.15.17,3.03.2,5.77.19,3.37,0,5.17-.1,8.16-.43,14.52-1.61,28.33-7.59,39.44-17.09,2.86-2.44,5.89-5.47,8.28-8.27,9.55-11.2,15.51-24.95,17.11-39.47.34-3.04.43-4.79.43-8.23,0-2.89-.04-4.07-.24-6.32-.92-10.78-4.15-21.05-9.6-30.5-4.9-8.51-11.74-16.19-19.73-22.15-10.41-7.77-22.67-12.63-35.54-14.09-2.91-.33-4.48-.41-7.92-.43-1.6,0-3.08,0-3.29,0ZM77.22,1.87c16.33.68,32.06,7.03,44.45,17.92,1.45,1.28,3.52,3.29,4.91,4.75,6.1,6.47,10.96,14.04,14.33,22.28,3.16,7.74,4.9,15.83,5.26,24.41.06,1.49.03,5.46-.05,6.77-.36,5.7-1.19,10.63-2.67,15.83-2.81,9.86-7.83,19.18-14.57,27.04-7.36,8.59-16.57,15.32-26.95,19.7-6.93,2.92-14.32,4.73-21.87,5.37-3.41.29-7.72.31-11.14.07-15.22-1.08-29.46-6.84-41.21-16.66-2.97-2.48-5.95-5.43-8.53-8.43-9.82-11.43-15.82-25.72-17.1-40.74-.33-3.82-.34-8.1-.05-11.85,1-12.65,5.27-24.7,12.46-35.16,4.39-6.39,9.89-12.14,16.08-16.8,6.61-4.99,14.03-8.82,21.79-11.25,8.09-2.54,16.24-3.6,24.85-3.24Z"
                                                fill="#022450"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M77.19,13.29c-.57.16-3.59.93-5.06,1.29-8.38,2.05-13.81,3.07-17.13,3.21-.66.03-1.12.07-1.3.12-.85.23-1.6.84-1.97,1.6-.44.91-.45,1.79,0,2.72l.2.41,5.01,5,5.01,5-.03,1.39c-.02,1.43-.12,3.28-.17,3.33-.01.02-.15,0-.29-.06-.69-.24-1.66.01-2.13.55-.23.26-.47.79-.57,1.24-.16.76-.09,2.38.27,5.91.11,1.05.15,1.73.16,2.58,0,.88.03,1.21.09,1.43.35,1.3,1.33,1.96,2.33,1.57.06-.02.08.04.1.4.26,3.43,1.32,6.21,3.39,8.89.51.66,1.77,1.94,2.43,2.46,2.41,1.93,4.91,3,7.99,3.44.84.12,3.16.12,4,0,3.01-.42,5.62-1.54,7.94-3.4.64-.52,1.83-1.7,2.32-2.31,1.5-1.88,2.49-3.84,3.07-6.1.19-.73.38-1.84.42-2.46.02-.24.04-.52.06-.62l.02-.19h.34c.28,0,.4-.02.61-.13.5-.24.92-.81,1.13-1.52.05-.19.08-.55.09-1.37,0-.79.06-1.57.16-2.6.48-4.91.48-5.73.03-6.69-.43-.91-1.22-1.27-2.43-1.1-.09.01-.1-.03-.16-1.08-.06-1-.06-1.11.01-1.23.07-.11.08-.31.08-1.32v-1.18l4.82-4.79c2.97-2.94,4.89-4.89,5.01-5.07.21-.31.39-.72.47-1.07.08-.34.06-1.04-.03-1.4-.21-.8-.78-1.53-1.49-1.9-.55-.29-.94-.37-1.87-.41-2.85-.12-6.77-.79-13.12-2.25-2.12-.49-6.33-1.54-8.25-2.05-.64-.17-1.21-.31-1.26-.31-.06,0-.2.03-.31.07ZM79.71,15.15c6.77,1.76,12.94,3.1,16.75,3.64,1.49.21,2.28.29,3.39.34.99.04,1.15.07,1.55.28.25.13.57.49.71.79.24.53.19,1.15-.14,1.63-.09.13-2.32,2.38-4.96,5.01l-4.8,4.77-.78.2c-2.01.52-4.9.99-7.7,1.25-3.51.33-7.49.38-11.02.12-3.45-.25-7.19-.82-9.62-1.47-.25-.07-.36-.18-4.67-4.45-5.6-5.56-5.37-5.32-5.53-5.64-.12-.23-.13-.31-.13-.72s.02-.49.13-.72c.34-.72.97-1.03,2.11-1.04,2.3,0,7.31-.86,13.93-2.39,1.67-.39,6.82-1.66,7.94-1.97.33-.09.62-.17.66-.17.03,0,1.02.24,2.19.55ZM64.22,33.32c5.25,1.16,11.98,1.61,17.96,1.19,3.28-.23,6.54-.7,9.17-1.32.21-.05.42-.09.46-.09.06,0,.07.11.07.64v.64l-.5.54c-2.72,2.99-6.53,5.1-10.5,5.83-1.35.25-1.81.29-3.43.29s-1.94-.02-3.2-.24c-3.94-.66-7.67-2.64-10.49-5.56l-.55-.57v-1.58l.13.03c.07.02.46.1.87.2ZM91.89,37.5c.03.59.06,1.18.05,1.33s-.02,2.37-.04,4.94c-.02,4.08-.01,4.72.05,5.04.14.7.08,2.41-.12,3.64-.23,1.42-.67,2.75-1.34,4.08-2.01,4.01-5.77,6.89-10.13,7.75-1.08.21-1.42.24-2.89.24-1.58,0-2.14-.07-3.41-.38-5.41-1.33-9.67-5.74-10.75-11.14-.27-1.36-.26-1.04-.28-7.22l-.02-5.71h-.1c-.06,0-.08-.01-.05-.04.04-.02.1-.62.16-1.75.06-.94.11-1.73.12-1.74s.19.14.4.33l.38.35v4.18c0,2.38.03,4.45.06,4.82.21,2.73,1.2,5.28,2.91,7.48.47.61,1.53,1.69,2.14,2.18.73.59,1.57,1.14,2.55,1.65,1.16.61,1.49.71,2.41.71.56,0,.77-.01,1.11-.1.58-.14,1.31-.43,1.86-.75l.46-.26.47.26c.55.31,1.27.61,1.86.75.58.14,1.65.15,2.12,0,.19-.06.34-.08.36-.05s.18,0,.37-.08c1.2-.45,2.52-1.21,3.6-2.07.53-.42,1.67-1.55,2.08-2.06,1.71-2.12,2.75-4.66,3.02-7.39.03-.3.05-2.28.05-5.07v-4.58l.2-.21c.11-.11.21-.21.23-.21.01,0,.06.48.1,1.06ZM89.95,46.72c-.37,3-1.82,5.78-4.05,7.76-.65.58-.67.59-.48.17.2-.43.47-1.22.6-1.73.11-.45.43-2.14.41-2.16,0,0-.35.24-.75.55-.93.72-1.21.9-1.75,1.17-1.18.59-2.42.66-3.42.2-.19-.09-.41-.22-.51-.31l-.18-.15-.44.08c-.61.1-1.09.24-1.55.44l-.4.17-.32-.14c-.39-.18-.82-.31-1.32-.41-.74-.14-.71-.14-.91.02-.27.21-.79.45-1.23.54-.49.11-1.28.08-1.79-.07-.8-.23-1.39-.57-2.56-1.46-.46-.35-.84-.63-.85-.62-.03.02.35,1.95.46,2.35.06.21.18.59.27.83l.16.45-.37-.36c-1.72-1.69-2.98-4.03-3.45-6.39-.21-1.09-.21-1.07-.23-5.27l-.02-4.04.3.21c2.99,2.13,6.16,3.34,9.89,3.77.81.1,3.32.08,4.15-.02,3.5-.43,6.42-1.52,9.24-3.43.31-.21.69-.48.86-.61l.3-.23v4.04c.02,3.46.01,4.13-.05,4.66ZM61.19,38.68c.07.08.17.29.23.47l.11.32v4.22c.03,4.41.01,4.82-.17,5.25-.1.24-.27.43-.36.43-.1,0-.31-.31-.41-.62-.08-.24-.09-.44-.09-1.28,0-.71-.03-1.33-.12-2.17-.16-1.63-.35-3.87-.39-4.65-.05-.96.07-1.61.33-1.89.14-.15.25-.2.52-.2.19,0,.24.01.34.14ZM94.25,38.62c.23.11.39.47.46,1.01.04.33.04.67,0,1.43-.06,1.01-.3,3.76-.39,4.5-.03.22-.07,1.02-.09,1.76-.03,1.27-.04,1.37-.14,1.61-.06.13-.16.29-.22.35-.14.13-.22.1-.39-.15l-.11-.16v-4.45c0-4.42,0-4.45-.1-4.45-.12,0-.12-.1,0-.13.1-.03.1-.05.07-.41-.03-.42,0-.57.2-.83.1-.14.15-.16.33-.16.12,0,.29.03.38.08ZM76.21,53.83c.38.12.56.23.89.52.17.14.31.26.33.26s.16-.12.33-.26c.34-.3.51-.4.96-.54.6-.2.71-.21.9-.09.49.31,1.3.54,2.06.59.68.04,1.62-.12,2.35-.42.18-.07.32-.11.32-.1,0,.09-.51,1.07-.74,1.43-.34.52-.99,1.17-1.38,1.37-.53.28-.75.33-1.41.32-.72,0-1.16-.12-1.95-.51-.58-.28-.73-.41-1.11-.91-.16-.21-.31-.37-.32-.37-.02,0-.17.17-.33.38-.39.5-.53.62-1.11.9-.8.39-1.24.5-1.97.51h-.62s-.56-.27-.56-.27c-.69-.33-1.08-.68-1.54-1.37-.25-.38-.78-1.38-.79-1.48,0-.02.12.02.28.08.87.35,1.89.51,2.67.41.64-.08,1.11-.21,1.58-.46l.41-.21.26.06c.15.03.37.1.5.14Z"
                                                fill="#022450"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M76.88,16.78c-.99.34-1.59,1.3-1.42,2.28.11.65.57,1.28,1.13,1.54l.22.1v9.11h-.11c-.18,0-.75-.18-1.12-.35-.9-.43-1.59-1.13-2.01-2.04-.17-.37-.34-.88-.34-1.05,0-.05.13-.09.56-.15.31-.05.58-.1.61-.11.03-.02-.39-.71-1.12-1.83-.64-.99-1.18-1.8-1.2-1.8-.02,0-1.19,4.16-1.18,4.18,0,0,.21-.03.45-.07.25-.04.47-.06.51-.05.03.01.08.12.09.24.09.59.54,1.6.98,2.17.3.39.94,1.02,1.32,1.27,1.89,1.28,4.3,1.29,6.25.02.48-.31,1.28-1.14,1.59-1.65.37-.6.77-1.65.77-2.03,0-.11-.05-.11.62,0,.3.05.56.08.57.07.02-.02-1.1-4.08-1.14-4.13-.04-.04-2.39,3.53-2.36,3.59,0,.02.24.07.5.1s.49.08.51.1c.01.02-.02.21-.07.41-.35,1.35-1.34,2.44-2.64,2.91-.21.08-.46.15-.54.17l-.16.03v-9.1l.26-.12c.15-.07.38-.23.53-.38,1.1-1.1.64-2.96-.83-3.41-.38-.12-.9-.12-1.22,0ZM77.89,18.13c.17.1.35.43.35.62s-.19.52-.35.62c-.33.21-.83.09-1.03-.25-.2-.33-.08-.79.25-.99.21-.13.57-.13.78,0Z"
                                                fill="#022450"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M69.36,41.41c-.28.07-.43.16-.64.4-.32.36-.39.82-.19,1.24.13.28.36.52.61.62.22.1.71.1.92,0,.22-.09.5-.35.62-.57.14-.27.14-.79,0-1.05-.26-.49-.82-.76-1.32-.64Z"
                                                fill="#022450"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M84.94,41.39c-.42.1-.72.31-.9.65-.14.27-.14.79,0,1.06.12.22.39.48.62.57.23.1.72.08.95-.02.24-.11.56-.47.63-.71.22-.73-.25-1.45-1.02-1.55-.1-.01-.23-.01-.29,0Z"
                                                fill="#022450"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M49.93,27.12c-.19.03-.51.14-.72.24-.36.17-.47.28-4.25,4.04-3.41,3.4-3.88,3.85-3.85,3.7.02-.09.04-.38.06-.64.02-.39,0-.54-.07-.86-.13-.5-.41-.95-.79-1.3-.84-.77-1.98-.93-3.01-.42-.32.15-.52.35-3.09,2.92-1.51,1.52-2.84,2.88-2.96,3.02-.58.68-1.1,1.63-1.41,2.56-.87,2.61-.37,5.56,1.32,7.83.36.49,2.35,2.49,2.93,2.97,2.55,2.06,6.07,2.42,8.97.93,1.22-.63.84-.28,8.43-7.87,5.02-5.03,6.97-7.01,7.09-7.21.66-1.09.5-2.42-.39-3.31-.35-.35-.92-.67-1.3-.73-.16-.03-.19-.05-.16-.11.29-.67.38-1.32.26-1.88-.13-.64-.61-1.32-1.19-1.7-.66-.42-1.56-.53-2.29-.27-.2.07-.37.13-.4.14-.02,0-.09-.13-.15-.31-.43-1.24-1.73-1.98-3.02-1.74ZM51.05,28.56c.31.16.59.49.67.81.08.26.04.75-.07.97-.04.09-1.94,2.03-4.21,4.3l-4.13,4.14.48.48.48.48,4.7-4.69c4.58-4.57,4.7-4.7,4.96-4.77.5-.15.95-.06,1.31.26.48.42.61,1.05.33,1.65-.05.11-1.71,1.81-4.73,4.83l-4.64,4.65.52.52.52.52,4.12-4.11c2.85-2.85,4.18-4.14,4.33-4.22.3-.16.89-.16,1.17,0,.3.16.46.31.62.6.12.22.14.3.14.63,0,.31-.02.42-.12.6-.08.15-1.96,2.07-5.96,6.09-3.21,3.23-5.85,5.87-5.86,5.86s.07-.76.18-1.67c.11-.91.2-1.79.2-1.96,0-.85-.45-1.69-1.18-2.18-1.11-.75-2.48-.62-3.43.32-.38.38-.6.77-.71,1.27-.08.36-.44,3.47-.41,3.5.03.02,1.25.16,1.28.15,0,0,.1-.74.2-1.63.1-.89.22-1.72.26-1.86.1-.32.35-.61.68-.77.22-.11.33-.13.61-.13.41,0,.61.09.91.36.31.28.45.6.45.99,0,.17-.13,1.4-.29,2.74l-.28,2.43-.25.22c-.95.84-2.11,1.41-3.41,1.66-.58.11-1.79.11-2.4,0-1.11-.21-2.07-.62-3.01-1.31-.41-.3-2.15-1.99-2.6-2.53-.83-1-1.4-2.19-1.63-3.43-.13-.69-.11-2.06.02-2.7.26-1.22.77-2.23,1.55-3.12.6-.67,3.22-3.26,3.22-3.18,0,.04-.11.97-.24,2.05-.18,1.45-.23,2.06-.21,2.3.08,1.04.77,1.94,1.77,2.31.35.13,1.07.18,1.47.1.65-.13,1.32-.61,1.7-1.2.28-.43.36-.74.53-2.15l.15-1.26,4.46-4.46c4.16-4.15,4.48-4.47,4.7-4.54.34-.1.73-.07,1.07.1ZM39.13,33.09c.45.24.72.68.72,1.16,0,.34-.62,5.34-.7,5.61-.09.33-.41.69-.74.83-.83.36-1.81-.21-1.88-1.09-.02-.27.55-5.17.66-5.64.2-.85,1.18-1.29,1.95-.87Z"
                                                fill="#022450"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M67.25,65.78s-.05.44-.1.9c-.1,1.08-.33,2.58-.53,3.58-.15.73-.48,1.99-.52,2.04-.02.03-.04.01-.75-.57-.31-.26-.57-.47-.6-.47-.02,0-.43.58-.92,1.29s-.9,1.3-.92,1.32c-.02,0-.14-.2-.26-.46l-.22-.48-.55.31c-.96.55-2.19,1.14-3.27,1.57-1.25.5-1.35.55-1.63.8-.38.35-.47.63-.51,1.71-.09,1.92-.61,5.02-1.54,9.05-.26,1.12-1.01,4.14-1.04,4.2-.01.02,1.04,1.26,2.36,2.75,1.31,1.49,2.38,2.71,2.37,2.72s-1.5-.44-3.31-.99c-1.82-.55-3.31-.99-3.32-.99-.01.01,37.35,36.06,38.1,36.76.4.38.42.39.34.21-.19-.37-8.12-16.84-8.13-16.89,0-.03,4.62-4.52,10.28-9.98s10.28-9.94,10.27-9.95c-.01-.01-6,1.77-6.49,1.94-.13.04-.13.04-.07-.03.04-.05,1.08-1.24,2.31-2.64,1.24-1.41,2.27-2.6,2.3-2.65.05-.08,0-.32-.3-1.52-1.23-4.86-2.03-9.11-2.21-11.62l-.03-.47.26.08c1.26.37,3.4,1.17,4.75,1.8,2.78,1.28,5.06,2.91,6.38,4.56.84,1.05,1.66,2.42,2.31,3.84,2.79,6.12,4.49,15.85,5.06,28.93.12,2.83.16,4.97.16,9.05v4.39l.59.03c.32.02.62.02.66,0,.06-.02.07-.52.07-4.38,0-5.07-.06-7.61-.26-11.39-.78-14.42-3.09-24.71-6.75-30.19-2.19-3.29-5.84-5.68-11.58-7.59-1.42-.47-1.91-.61-1.94-.52-.02.05-.07.03-.2-.1-.22-.21-.46-.33-1.63-.79-1.04-.41-2.23-.98-3.19-1.52l-.6-.34-.2.38-.19.39-.88-1.27c-.48-.7-.89-1.28-.92-1.3-.02-.01-.32.21-.66.49-.34.28-.64.52-.66.53-.05.01-.3-.87-.49-1.73-.24-1.12-.48-2.71-.63-4.22l-.06-.6h-.14c-.08.01-.37.03-.65.05-.6.04-.55-.08-.44.93.23,2.21.56,4.05,1,5.56.09.32.2.66.24.76.07.17.07.19,0,.26-.12.11-10.15,8.51-10.21,8.55-.03.01-1.39-1.09-3.02-2.46-1.64-1.37-3.95-3.31-5.15-4.32l-2.18-1.83.1-.27c.5-1.43.97-3.86,1.21-6.2.1-1.07.15-.95-.39-.98-.26-.02-.55-.04-.65-.05-.12-.02-.19,0-.2.03ZM70.74,77.96c3.09,2.59,5.65,4.73,5.68,4.76.05.04-.4.44-2.12,1.88-2.08,1.75-2.18,1.82-2.27,1.75-.06-.04-1.26-1.04-2.68-2.23l-2.57-2.16-1.6-3.31c-.87-1.82-1.58-3.35-1.57-3.39.04-.16,1.39-2.06,1.45-2.03.03.01,2.59,2.14,5.68,4.73ZM90.69,74.21c.37.53.67,1,.67,1.03s-.73,1.58-1.64,3.45l-1.64,3.39-2.59,2.17c-1.43,1.2-2.61,2.17-2.63,2.17-.02,0-1-.83-2.19-1.82-1.77-1.48-2.14-1.82-2.09-1.86.31-.3,11.36-9.51,11.39-9.51.02,0,.34.45.71.99ZM61.91,74.89c.02.06.93,1.96,2.02,4.24,2.86,5.93,9.86,20.46,11.48,23.85.76,1.59,1.6,3.33,1.87,3.89,1.48,3.05,8.77,18.21,8.76,18.22-.01.02-29.21-28.14-29.19-28.16,0,0,1.3.37,2.88.85,1.58.47,2.88.85,2.89.84.01,0-1.18-1.39-2.66-3.07s-3.12-3.54-3.65-4.15l-.97-1.1.35-1.43c1.25-5.04,1.97-9.02,2.11-11.62.03-.62.04-.66.14-.73.06-.04.52-.23,1.01-.42.92-.35,2.26-.95,2.64-1.18.26-.16.27-.16.31-.02ZM93.89,75.36c.48.24,1.26.58,1.74.76,1.17.46,1.35.55,1.38.68,0,.06.04.5.07.97.16,2.5.9,6.54,2.09,11.28.18.7.32,1.3.32,1.34s-1.65,1.95-3.66,4.23c-2.01,2.29-3.64,4.16-3.62,4.16.04,0,5.75-1.72,5.81-1.75.03-.01-.13.16-.36.38-.58.59-15.99,15.44-16.01,15.42,0,0-.78-1.62-1.73-3.58l-1.72-3.58,7.01-14.55c8.3-17.24,7.8-16.2,7.81-16.2s.41.2.88.43ZM79.36,85.24l1.84,1.54-.13.15c-.08.08-.59.64-1.13,1.26l-1,1.12v.41c.02.22.13,2.64.26,5.37l.23,4.96-1.01,1.97c-.55,1.08-1.02,1.95-1.03,1.93-.02-.02-.51-1.02-1.08-2.21l-1.04-2.17.41-5.06c.23-2.78.42-5.09.41-5.13,0-.04-.51-.64-1.12-1.33-.62-.69-1.12-1.27-1.11-1.29.02-.05,3.58-3.04,3.63-3.05.02,0,.86.69,1.87,1.54ZM70.2,86.56c1.02.86,1.87,1.56,1.89,1.57.02,0,.2-.1.38-.25.18-.15.34-.27.34-.26.02.03,1.66,1.86,1.8,2.02l.13.14-.31,3.62c-.17,1.99-.31,3.66-.32,3.71,0,.06-5.75-11.76-5.9-12.14-.03-.09.1.02,1.97,1.58ZM86.38,85.62c-.17.35-1.44,2.99-2.82,5.86s-2.6,5.4-2.71,5.63c-.11.22-.2.37-.21.33-.01-.09-.35-7.2-.35-7.47,0-.18.05-.25.96-1.27l.96-1.08.29.24c.16.13.31.25.35.26.03,0,.9-.69,1.93-1.55,1.03-.87,1.88-1.57,1.88-1.58,0,0-.13.29-.29.63Z"
                                                fill="#022450"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M41,71.14c-.31.79-.34.69.31.94,2.61,1.01,10.35,3.95,10.43,3.96.07,0,.13-.1.32-.59.2-.52.21-.6.15-.62-.04-.02-2.53-.97-5.53-2.11s-5.46-2.08-5.47-2.08c0,0-.11.22-.21.5Z"
                                                fill="#022450"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M52.06,119.62v14.5h1.34v-29h-1.34v14.5Z"
                                                fill="#022450"
                                                strokeWidth="0px"
                                            />
                                            <polygon
                                                points="99.85 115.16 99.85 115.95 92.76 115.95 85.68 115.95 85.68 115.16 85.68 114.37 92.76 114.37 99.85 114.37 99.85 115.16"
                                                fill="#022450"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M84.35,115.16v2.12h16.84v-4.24h-16.84v2.12ZM99.85,115.16v.79h-14.16v-1.57h14.16v.79Z"
                                                fill="#2998e9"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M101.75,126.89v7.23h1.34v-14.45h-1.34v7.23Z"
                                                fill="#022450"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M79.36,85.24l1.84,1.54-.13.15c-.08.08-.59.64-1.13,1.26l-1,1.12v.41c.02.22.13,2.64.26,5.37l.23,4.96-1.01,1.97c-.55,1.08-1.02,1.95-1.03,1.93-.02-.02-.51-1.02-1.08-2.21l-1.04-2.17.41-5.06c.23-2.78.42-5.09.41-5.13,0-.04-.51-.64-1.12-1.33-.62-.69-1.12-1.27-1.11-1.29.02-.05,3.58-3.04,3.63-3.05.02,0,.86.69,1.87,1.54Z"
                                                fill="#2998e9"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M91.89,37.5c.03.59.06,1.18.05,1.33s-.02,2.37-.04,4.94c-.02,4.08-.01,4.72.05,5.04.14.7.08,2.41-.12,3.64-.23,1.42-.67,2.75-1.34,4.08-2.01,4.01-5.77,6.89-10.13,7.75-1.08.21-1.42.24-2.89.24-1.58,0-2.14-.07-3.41-.38-5.41-1.33-9.67-5.74-10.75-11.14-.27-1.36-.26-1.04-.28-7.22l-.02-5.71h-.1c-.06,0-.08-.01-.05-.04.04-.02.1-.62.16-1.75.06-.94.11-1.73.12-1.74s.19.14.4.33l.38.35v4.18c0,2.38.03,4.45.06,4.82.21,2.73,1.2,5.28,2.91,7.48.47.61,1.53,1.69,2.14,2.18.73.59,1.57,1.14,2.55,1.65,1.16.61,1.49.71,2.41.71.56,0,.77-.01,1.11-.1.58-.14,1.31-.43,1.86-.75l.46-.26.47.26c.55.31,1.27.61,1.86.75.58.14,1.65.15,2.12,0,.19-.06.34-.08.36-.05s.18,0,.37-.08c1.2-.45,2.52-1.21,3.6-2.07.53-.42,1.67-1.55,2.08-2.06,1.71-2.12,2.75-4.66,3.02-7.39.03-.3.05-2.28.05-5.07v-4.58l.2-.21c.11-.11.21-.21.23-.21.01,0,.06.48.1,1.06Z"
                                                fill="#2998e9"
                                                strokeWidth="0px"
                                            />
                                        </svg>
                                    </div>
                                    <p>
                                        {!imCrew && (
                                            <SeaLogsButton
                                                text="Create a log entry"
                                                type="secondary"
                                                icon="new_logbook"
                                                color="sllightblue"
                                                className="whitespace-nowrap"
                                            />
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="w-full shadow-xl h-100 p-0 overflow-hidden bg-slblue-1000 border-2 border-sllightblue-100 rounded-lg dark:bg-slblue-800 dark:border-slblue-700">
                        <div className="lg:flex p-4 flex-col lg:justify-between font-light">
                            <div className="font-light text-white flex border-b border-sllightblue-1000 pb-3 justify-between">
                                {' '}
                                <div>
                                    <SealogsMaintenanceIcon
                                        className={`${classes.icons} h-6 w-6`}
                                    />
                                    <span className="font-bold ml-2">
                                        Maintenance
                                    </span>
                                    &nbsp;tasks
                                </div>
                                <Button
                                    className="text-2xs hover:text-sllightblue-800 font-inter"
                                    onPress={() => setVesselTab('maintenance')}>
                                    VIEW ALL
                                </Button>
                            </div>

                            {maintenanceTasks &&
                            maintenanceTasks?.filter(
                                (task: any) =>
                                    !(
                                        task.status === 'Completed' ||
                                        task.status === 'Save_As_Draft'
                                    ),
                            )?.length > 0 ? (
                                <div className="flex flex-col justify-between items-start pt-1 w-full">
                                    {maintenanceTasks
                                        .filter(
                                            (task: any) =>
                                                !(
                                                    task.status ===
                                                        'Completed' ||
                                                    task.status ===
                                                        'Save_As_Draft'
                                                ),
                                        )
                                        .slice(0, 5)
                                        .map((task: any, index: number) => (
                                            <div
                                                key={task.id}
                                                className={`group flex text-white border-b border-sldarkblue-800 justify-between w-full py-1.5 ${index < maintenanceTasks.filter((task: any) => task.status !== 'Completed').length - 1 ? '' : ''}`}>
                                                <div className="flex items-center hover:text-sllightblue-800 ">
                                                    <Link
                                                        href={`/maintenance?taskID=${task.id}&redirect_to=${pathname}?${searchParams.toString()}`}
                                                        className={`${task.severity === 'High' ? 'group-hover:text-slred-1000' : ''} `}>
                                                        {task.name}
                                                    </Link>
                                                </div>
                                                <div
                                                    className={`text-2xs ${task?.isOverDue.status === 'High' ? 'text-slred-1000 whitespace-nowrap bg-slred-100 p-2 border rounded text-2xs border-slred-1000 ' : ''} ${task?.isOverDue.status === 'Low' ? 'text-white' : ''} ${task?.isOverDue.status === 'Medium' ? 'text-white' : ''} `}>
                                                    {task?.isOverDue.status !==
                                                    'Completed'
                                                        ? task.isOverDue.days.replace(
                                                              'Upcoming',
                                                              'Due',
                                                          )
                                                        : ''}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="flex justify-between items-center gap-2 p-2 pt-4">
                                    <div>
                                        <svg
                                            className="!w-[75px] h-auto"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 148.02 147.99">
                                            <path
                                                d="M70.84.56c16-.53,30.66,3.59,43.98,12.35,12.12,8.24,21.1,19.09,26.92,32.55,6.14,14.85,7.38,30.11,3.74,45.78-3.92,15.59-11.95,28.57-24.1,38.96-13.11,10.9-28.24,16.66-45.39,17.28-16.75.33-31.88-4.39-45.39-14.17-13.29-9.92-22.34-22.84-27.16-38.76-4.03-14.16-3.9-28.29.39-42.38,5-15.45,14-27.97,27.01-37.6C42.77,5.97,56.1,1.31,70.84.56Z"
                                                fill="#fefefe"
                                                fillRule="evenodd"
                                                stroke="#024450"
                                                strokeMiterlimit="10"
                                                strokeWidth="1.02px"
                                            />
                                            <path
                                                d="M63.03,13.61c1.74.02,3.47.13,5.19.32,2.15.26,4.31.51,6.46.78,1.18.34,2.08,1.04,2.69,2.11.56,1,.85,2.06.87,3.2,1.5,2.89,2.99,5.79,4.47,8.69.09.17.19.32.32.46,1.72,1.08,3.12,2.48,4.2,4.2.42.79.72,1.63.9,2.5-.04.01-.07.04-.1.07.58,1.01.64,2.04.17,3.11-.47.88-1.1,1.62-1.92,2.21-1.17.81-2.44,1.45-3.79,1.92-.07.56-.13,1.13-.17,1.7,0,.86-.03,1.72-.1,2.57-.14.56-.42,1.04-.85,1.43-.38.3-.8.39-1.26.27-.01,1.92-.46,3.73-1.33,5.44-.59,2.66-1.36,5.27-2.33,7.82-.4,1.04-.96,1.99-1.67,2.84-.36-.12-.73-.2-1.12-.27-.28,0-.53.08-.78.22-.23.16-.45.33-.68.49-.83.87-1.67,1.73-2.52,2.57-.78.67-1.68,1.03-2.72,1.09-.09-.26-.18-.52-.27-.78-.26-.26-.58-.43-.95-.51-1.68-.23-3.27.06-4.76.87-.28.24-.56.48-.85.7-.95-1.87-2.36-3.27-4.25-4.2-.37-.14-.74-.25-1.12-.34-.42-.03-.84-.03-1.26,0-.19.06-.38.1-.58.1-.58-.66-1.04-1.39-1.38-2.21-1.11-2.73-1.98-5.53-2.62-8.4-.89-1.7-1.33-3.51-1.33-5.44-.97.14-1.64-.25-2.01-1.17-.12-.3-.2-.6-.24-.92-.01-.76-.03-1.52-.05-2.28-.02-.39-.07-.78-.15-1.17-1.41-.47-2.77-1.07-4.05-1.82-.82-.49-1.54-1.09-2.16-1.82-.66-.81-.93-1.73-.83-2.77.33-1.03.65-2.06.92-3.11.56-1.18,1.32-2.22,2.26-3.13,1.27-1.15,2.67-2.11,4.2-2.89,1.39-2.69,2.79-5.37,4.17-8.06.01-1.77.66-3.26,1.92-4.49.47-.39,1-.67,1.6-.83,3.29-.42,6.57-.79,9.85-1.09Z"
                                                fill="#052350"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M63.17,14.97c2.44.07,4.86.25,7.28.56,1.3.16,2.59.33,3.88.49.85.26,1.5.78,1.92,1.58.43.87.64,1.79.63,2.77,1.18,2.31,2.37,4.62,3.57,6.92-3.88-1.88-7.97-3.04-12.28-3.5-5.82-.65-11.53-.15-17.14,1.5-1.08.33-2.13.73-3.16,1.19l-.05-.05c1.01-2.01,2.04-4.02,3.08-6.02,0-1.18.3-2.26.92-3.25.41-.57.95-.95,1.63-1.14,3.23-.44,6.47-.78,9.71-1.04Z"
                                                fill="#2998e9"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M22.83,121.38c-.05.7-.06,1.42-.05,2.14h-1.31v-1.84c.04-6.98.54-13.92,1.48-20.82.54-4.01,1.44-7.94,2.67-11.8.83-2.63,2.05-5.06,3.64-7.28,1.23-1.49,2.67-2.74,4.32-3.74,0-.15-.03-.29-.12-.41,3.43-.91,6.85-1.76,10.29-2.55,2.46,6.94,4.9,13.88,7.33,20.82h25.63c2.42-6.97,4.87-13.93,7.35-20.87,1.78.46,3.56.91,5.34,1.36,1.34-2.25,3.04-4.21,5.1-5.87.78-4.96,2.07-9.78,3.88-14.47.65-1.62,1.43-3.17,2.33-4.66.76-1.21,1.68-2.27,2.79-3.18-1.36-.17-2.34-.88-2.94-2.11-.04-.09-.06-.19-.07-.29-2.47-.68-3.87-2.31-4.2-4.85-.2-2.64-.39-5.28-.58-7.91-.03-.54,0-1.09.07-1.63-.17-1.88.57-3.25,2.23-4.13,1.68-.73,3.36-1.46,5.05-2.18.39-.11.79-.17,1.19-.17,3.64.42,7.27.88,10.9,1.38,1.72.41,2.66,1.5,2.82,3.25-.02,1.36-.63,2.38-1.8,3.06,1.1,1.14,1.33,2.44.7,3.91-.33.64-.82,1.14-1.43,1.5,1.22,1.38,1.34,2.85.36,4.42-.31.42-.69.75-1.14,1,1.02,1.05,1.29,2.27.8,3.66-.77,1.59-2.04,2.3-3.81,2.11-.7-.09-1.39-.17-2.09-.24,1.17,1.13,2.15,2.4,2.94,3.81,1.95,3.61,3.36,7.43,4.22,11.46,2.2.83,4.31,1.85,6.33,3.03.89.53,1.66,1.2,2.31,2.01.7,1.3,1.09,2.69,1.17,4.17.08,2.03-.09,4.03-.53,6.02-.48,2.16-1.04,4.3-1.7,6.41-.79,2.37-1.56,4.75-2.33,7.14-.74.36-1.49.39-2.26.07-1.22-.53-2.31-1.25-3.28-2.16-1.78,5.28-4.16,10.26-7.14,14.95-.02.04-.03.09-.02.15,3.62.73,6.54,2.56,8.76,5.49,1.2,1.7,1.84,3.59,1.92,5.68,0,.23-.01.45-.02.68-.42.42-.93.64-1.53.66-1.25.03-2.48-.12-3.69-.44-2.04-.52-4.08-1.05-6.12-1.6-.88-.23-1.78-.37-2.69-.41-.84.03-1.68.16-2.5.36-1.96.52-3.91,1.04-5.87,1.55-.95.21-1.9.39-2.86.53-.49.03-.97.03-1.46,0-.49-.08-.9-.3-1.24-.66-.08-2.31.54-4.41,1.84-6.31,1.21-1.71,2.74-3.06,4.59-4.05.75-.38,1.51-.72,2.28-1.04-2.93-4.67-5.04-9.68-6.33-15.05-.58-2.67-.91-5.37-.97-8.11-.39.24-.79.48-1.19.7-.06.04-.1.1-.12.17-1.41,3.89-2.79,7.79-4.15,11.7h1.02c1.11,12.83,2.22,25.66,3.35,38.49h-56.89c1.1-12.83,2.22-25.66,3.35-38.49.39.01.78,0,1.17-.05-1.95-5.48-3.88-10.97-5.8-16.46-.03-.04-.08-.05-.12-.02-1.95,1.22-3.53,2.82-4.73,4.78-1.06,1.86-1.92,3.82-2.57,5.87-.84,2.72-1.51,5.49-1.99,8.3-.9,5.53-1.47,11.1-1.7,16.7-.09,2.12-.15,4.24-.17,6.36Z"
                                                fill="#052350"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M60.99,25.7c4.24-.18,8.43.18,12.57,1.09,2.09.5,4.11,1.17,6.07,2.04,2.05.9,3.86,2.16,5.41,3.76.3.38.58.77.85,1.17-1.92-1.08-3.96-1.91-6.12-2.5-4.32-1.11-8.7-1.74-13.15-1.89-5.41-.23-10.78.09-16.12.97-2.72.53-5.36,1.34-7.91,2.43-.62.33-1.24.65-1.84.97.76-1.17,1.71-2.16,2.86-2.96,2.19-1.5,4.57-2.61,7.14-3.35,3.35-.98,6.76-1.56,10.24-1.72Z"
                                                fill="#fdfdfd"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M103.75,26.28c1.16-.16,2.11.22,2.84,1.12.64,1.04.61,2.06-.1,3.06-.2.24-.44.44-.7.61-1.53.69-3.07,1.37-4.61,2.04-.38.15-.77.28-1.17.39-.11.09-.19.19-.27.32,0,.77.24,1.45.73,2.04.29.28.59.53.9.78-1.35,1.23-1.62,2.67-.8,4.32.28.46.65.84,1.09,1.14-.75.57-1.19,1.32-1.31,2.26-1.73-.68-2.64-1.96-2.74-3.83-.19-2.49-.37-4.98-.53-7.48.06-.89.08-1.78.05-2.67.18-.77.61-1.36,1.29-1.77,1.78-.79,3.56-1.55,5.34-2.31Z"
                                                fill="#fefefe"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M107.73,26.67c2.3.3,4.59.6,6.89.9,1.21.16,1.87.84,1.99,2.04-.12,1.31-.83,2-2.16,2.06-2.2-.25-4.39-.54-6.58-.87.52-1.02.63-2.09.32-3.2-.13-.33-.28-.63-.46-.92Z"
                                                fill="#fefefe"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M51.08,48.56c-.66-.05-1.32-.06-1.99-.05v-6.02c1.29-1.06,2.2-2.39,2.74-3.98.79-2.34,1.25-4.76,1.38-7.23,6.35-.8,12.71-.84,19.08-.12.66.1,1.33.2,1.99.29.15,1.96.45,3.89.9,5.8.37,1.45.98,2.79,1.8,4.03.23.32.49.61.75.9.25.22.52.42.8.61.02,1.91.05,3.82.07,5.73-.65,0-1.3,0-1.94.02-1.31,1.17-2.84,1.72-4.61,1.65-.6,0-1.11-.24-1.5-.68-4.45-.03-8.9-.03-13.35,0-.2.29-.48.47-.83.53-2.01.37-3.77-.12-5.29-1.48Z"
                                                fill="#fefefe"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M51.62,31.57h.19v.29c-.15,2.42-.67,4.75-1.58,6.99-.28.64-.65,1.22-1.09,1.75-.05-2.84-.06-5.69-.05-8.54.83-.19,1.67-.35,2.52-.49Z"
                                                fill="#fefefe"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M75.7,31.77c.93.14,1.85.32,2.77.53,0,2.88,0,5.76-.02,8.64-.59-.73-1.06-1.54-1.41-2.43-.77-2.18-1.21-4.43-1.33-6.75Z"
                                                fill="#fdfdfd"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M106.67,32.06c2.43.31,4.85.63,7.28.95,1.17.17,1.82.84,1.94,2.01-.13,1.26-.82,1.96-2.09,2.09-3.63-.46-7.25-.92-10.87-1.38-.76-.11-1.33-.5-1.7-1.17,1.57-.72,3.16-1.42,4.76-2.09.25-.1.48-.24.68-.41Z"
                                                fill="#fdfdfd"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M47.59,32.45c.06.5.1,1.02.1,1.55s-.01,1.04-.05,1.55c-1.54-.26-2.47.37-2.79,1.89-.05.4-.07.81-.07,1.21.04,1.09.13,2.17.24,3.25-.01.06-.03.13-.05.19-1.51-.5-2.9-1.22-4.17-2.16-1.83-1.54-1.81-3.06.05-4.56,1.6-1.13,3.35-1.97,5.24-2.52.5-.14,1-.28,1.5-.41Z"
                                                fill="#fdfdfd"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M80.02,32.74c1.93.51,3.72,1.32,5.39,2.4.65.47,1.17,1.04,1.58,1.72.26.66.21,1.29-.15,1.89-.26.41-.58.77-.95,1.09-.99.74-2.05,1.35-3.2,1.82-.01-.07-.03-.15-.05-.22.14-1.25.2-2.5.17-3.76-.23-1.67-1.18-2.38-2.84-2.14-.01-.95,0-1.88.05-2.82Z"
                                                fill="#fdfdfd"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M46.76,36.82c.28-.06.5.02.66.24.11.21.19.44.24.68.03,3.02.03,6.05,0,9.08-.02.32-.12.61-.29.87-.2.21-.36.17-.49-.1-.08-.16-.15-.32-.19-.49,0-1.69-.11-3.37-.34-5.05-.07-.92-.14-1.84-.19-2.77-.03-.52-.03-1.03,0-1.55.03-.43.24-.74.61-.92Z"
                                                fill="#fdfdfd"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M80.4,36.82c.54-.08.87.15,1,.68.05.39.08.78.07,1.17-.12,2.11-.29,4.21-.51,6.31-.01.69-.03,1.39-.05,2.09-.31,1.03-.61,1.03-.92,0-.03-3.14-.03-6.28,0-9.42.04-.33.18-.6.41-.83Z"
                                                fill="#fdfdfd"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M103.12,37.2c.55,0,1.1.03,1.65.12,3,.38,5.99.79,8.98,1.21,1.03.45,1.48,1.23,1.33,2.35-.34,1.04-1.06,1.57-2.16,1.6-3.32-.39-6.64-.83-9.95-1.29-1.32-.53-1.76-1.48-1.33-2.84.34-.58.84-.97,1.48-1.17Z"
                                                fill="#fefefe"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M55.6,39.73c.69-.09,1.19.19,1.48.83.11,1.07-.36,1.6-1.43,1.58-.75-.26-1.05-.79-.9-1.58.16-.41.44-.69.85-.83Z"
                                                fill="#052350"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M71.38,39.73c1.1-.05,1.6.46,1.48,1.55-.26.65-.73.93-1.43.85-.72-.26-1.01-.77-.9-1.53.16-.41.45-.7.85-.87Z"
                                                fill="#052350"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M103.36,42.74c.28,0,.55,0,.83.02,2.9.37,5.8.76,8.69,1.17,1.14.43,1.61,1.25,1.43,2.45-.36,1.01-1.08,1.53-2.16,1.55-2.95-.37-5.89-.76-8.83-1.14-1.35-.44-1.86-1.35-1.53-2.74.33-.68.85-1.12,1.58-1.31Z"
                                                fill="#fdfdfd"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M105.6,48.71c.77-.03,1.48.16,2.14.56,1.03.7,1.89,1.57,2.6,2.6,1.44,2.18,2.58,4.51,3.45,6.99.51,1.49.98,3,1.38,4.51-1.76,1.45-3.78,2.26-6.07,2.45-3.98.14-7.17-1.35-9.59-4.49-.36-.52-.68-1.08-.97-1.65.8-2.72,1.93-5.29,3.4-7.72.5-.78,1.07-1.5,1.72-2.16.56-.53,1.21-.89,1.94-1.09Z"
                                                fill="#fefefe"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M48.95,49.87c.55,0,1.1,0,1.65.02,1.75,1.37,3.72,1.87,5.92,1.5.46-.12.88-.31,1.26-.58,4.06-.03,8.12-.03,12.18,0,.52.39,1.1.62,1.75.68,1.66.14,3.21-.2,4.66-1.02.28-.17.53-.36.78-.58.52-.02,1.03-.03,1.55-.02-.09,1.5-.48,2.9-1.19,4.22-.62,2.83-1.46,5.6-2.52,8.3-.2.41-.41.82-.63,1.21-.76-.1-1.48.04-2.16.41-.31.19-.6.4-.87.63-.83.87-1.66,1.73-2.52,2.57-.28.23-.58.42-.92.56-.21-.14-.41-.31-.58-.51-.8-.47-1.66-.69-2.6-.66-1.14.03-2.25.23-3.33.61-.29.12-.56.25-.83.41-1.09-1.47-2.45-2.61-4.08-3.42-.96-.41-1.96-.59-3.01-.53-.3-.48-.56-.97-.8-1.48-1.02-2.64-1.84-5.34-2.48-8.11-.69-1.33-1.11-2.73-1.24-4.22Z"
                                                fill="#2998e9"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M56.08,52.16h15.63c.1,3.78-1.57,6.45-5,7.99-3.43,1.14-6.36.38-8.81-2.26-1.34-1.67-1.95-3.58-1.82-5.73Z"
                                                fill="#052350"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M57.44,53.52h12.82c-.34,2.61-1.73,4.42-4.17,5.41-2.78.86-5.16.23-7.16-1.87-.87-1.02-1.36-2.2-1.48-3.54Z"
                                                fill="#fefefe"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M108.07,57.98c.73-.04,1.2.28,1.43.97.07.73-.25,1.2-.95,1.43-.78.06-1.25-.28-1.43-1.04-.02-.68.3-1.14.95-1.36Z"
                                                fill="#052350"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M97.93,61.43c2.16,3.27,5.21,5.17,9.13,5.7,3.08.26,5.88-.5,8.4-2.26,1.31,5.5,1.83,11.09,1.58,16.75-.43,4.08-1.4,8.03-2.91,11.84-1.9,4.73-4.25,9.21-7.04,13.45-.02.04-.03.09-.02.15,2.96.22,5.6,1.25,7.91,3.08,2.18,1.83,3.39,4.17,3.64,7.01-.91.1-1.82.04-2.72-.17-2.26-.54-4.51-1.13-6.75-1.75-1.06-.25-2.14-.42-3.23-.51-.95.04-1.87.18-2.79.41-2.31.61-4.63,1.2-6.94,1.8-.49.09-.97.17-1.46.24-.48.04-.96.03-1.43-.02.05-1.6.51-3.07,1.36-4.42,1.47-2.19,3.43-3.77,5.9-4.73.72-.26,1.45-.49,2.18-.68.02-.02.04-.04.05-.07-3.76-5.59-6.28-11.71-7.55-18.35-.46-2.83-.61-5.68-.44-8.54.33-6.44,1.37-12.75,3.13-18.93Z"
                                                fill="#fefefe"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M117.1,65.84c1.84.71,3.6,1.58,5.29,2.6.69.4,1.3.91,1.82,1.53.56,1.06.89,2.19.97,3.4.07,1.36,0,2.72-.19,4.08-.41,2.46-1,4.89-1.75,7.28-.77,2.41-1.54,4.82-2.31,7.23-.27.02-.53-.02-.78-.12-1.2-.58-2.27-1.33-3.23-2.26.18-.88.39-1.75.63-2.62.85-3.74,1.13-7.53.83-11.36-.18-3.29-.62-6.54-1.29-9.76Z"
                                                fill="#fefefe"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M74.34,66.33h.24c.19,1.79.56,3.53,1.09,5.24.11.25.22.5.32.75-.36.23-.74.44-1.14.61-.17-.24-.3-.5-.39-.78-.63-1.84-1-3.73-1.14-5.66.34-.05.68-.11,1.02-.17Z"
                                                fill="#052350"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M53.32,66.43c.44.04.87.09,1.31.15-.18,1.61-.48,3.19-.9,4.76-.21.64-.46,1.25-.75,1.84-.4-.18-.79-.4-1.17-.63.42-.98.76-1.98,1-3.01.2-1.03.37-2.07.51-3.11Z"
                                                fill="#052350"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M94.09,72.59s.05.1.05.17c-.44,2.97-.69,5.96-.75,8.96-1.2.85-2.49,1.55-3.86,2.11-.23.09-.48.15-.73.17-.14-1.48.05-2.92.56-4.32.83-2.16,2.02-4.1,3.54-5.83.39-.43.79-.85,1.19-1.26Z"
                                                fill="#fdfdfd"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M47.25,75.84h1.31c-.01.11,0,.2.05.29.07,1.56.51,3,1.33,4.32,1.4,2.09,3.23,3.67,5.51,4.73,4.67,2.1,9.46,2.42,14.37.97,2.59-.78,4.83-2.11,6.72-4,1.37-1.45,2.23-3.16,2.57-5.15.04-.39.07-.78.07-1.17h1.36c-.09,2.63-1,4.93-2.74,6.89-2.24,2.39-4.95,4.01-8.13,4.88-4.65,1.22-9.21.98-13.69-.73-2.73-1.09-4.99-2.79-6.77-5.12-1.26-1.77-1.92-3.74-1.97-5.92Z"
                                                fill="#052350"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M42.78,76.62s.09,0,.12.05c3.03,8.57,6.04,17.15,9.03,25.73.06,1.62-.66,2.74-2.16,3.37-1.72.65-3.31.43-4.76-.68-.38-.33-.66-.72-.85-1.19-2.97-8.44-5.93-16.88-8.91-25.31.02-.04.05-.08.1-.1,2.49-.59,4.97-1.21,7.43-1.87Z"
                                                fill="#2998e9"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M84.92,76.62c1.28.33,2.55.66,3.83.97-.54,1.17-.93,2.38-1.19,3.64-.23,1.22-.22,2.45.02,3.66.28.32.63.48,1.07.46.57-.04,1.12-.17,1.65-.39.01.02.03.05.05.07-2.3,6.42-4.6,12.83-6.92,19.25-.78,1.11-1.85,1.72-3.23,1.82-1.5.11-2.75-.38-3.76-1.48-.56-.74-.74-1.57-.53-2.48,2.99-8.52,5.99-17.03,9-25.53Z"
                                                fill="#2998e9"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M51.57,97.25c8.22-.03,16.42,0,24.61.1-.56,1.55-1.1,3.1-1.63,4.66-.25,1.9.4,3.39,1.97,4.49,1.5.93,3.13,1.19,4.85.78,1.23-.34,2.25-1.01,3.03-2.01.2-.29.36-.59.49-.92.85-2.36,1.68-4.72,2.5-7.09h.34c1.03,11.84,2.05,23.69,3.06,35.53v.24h-53.88v-.24c1-11.84,2.02-23.69,3.06-35.53.16-.01.31,0,.46.05.84,2.39,1.68,4.79,2.52,7.18.53,1.13,1.36,1.95,2.5,2.45,1.63.67,3.26.68,4.9.05,2.14-.96,3.1-2.6,2.89-4.93-.53-1.61-1.09-3.21-1.67-4.81Z"
                                                fill="#2998e9"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M47.59,100.16c1.54-.14,2.53.52,2.99,1.99.13,1.48-.51,2.45-1.92,2.89-1.13.17-2-.21-2.65-1.14-.64-1.3-.41-2.41.7-3.33.28-.18.57-.32.87-.41Z"
                                                fill="#052350"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M79.14,100.16c1.43-.15,2.4.45,2.89,1.8.26,1.42-.27,2.41-1.58,2.99-1.51.37-2.57-.16-3.18-1.58-.31-1.63.31-2.69,1.87-3.2Z"
                                                fill="#052350"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M52.01,106.13h23.69c0,6.7,0,13.4-.02,20.1-.32,2.21-1.54,3.66-3.66,4.34-.28.04-.55.09-.83.15-4.92.03-9.84.03-14.76,0-2.51-.47-3.98-1.97-4.39-4.49-.02-6.7-.03-13.4-.02-20.1Z"
                                                fill="#052350"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M74.34,107.49c0,6.25,0,12.49-.02,18.74-.33,1.73-1.35,2.78-3.08,3.13-4.94.03-9.87.03-14.81,0-1.9-.43-2.92-1.62-3.06-3.57v-18.3h20.97Z"
                                                fill="#2998e9"
                                                fillRule="evenodd"
                                                strokeWidth="0px"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-white text-xs font-light">
                                        Holy mackerel! You are up to date with
                                        all your maintenance. Only thing left to
                                        do is, to go fishing
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="w-full shadow-xl h-100 p-0 overflow-hidden bg-slblue-1000 border-2 border-sllightblue-100 rounded-lg dark:bg-slblue-800 dark:border-slblue-700">
                        <div className="lg:flex p-4 flex-col lg:justify-between font-light">
                            <div className="text-white flex border-b border-sllightblue-1000 pb-3 justify-between">
                                {' '}
                                <div>
                                    <SealogsTrainingIcon
                                        className={`${classes.icons} h-6 w-6`}
                                    />
                                    <span className="font-bold ml-2">
                                        Training/drills
                                    </span>
                                </div>
                                <Button
                                    className="text-2xs hover:text-sllightblue-800 font-inter"
                                    onPress={() =>
                                        setVesselTab('crew_training')
                                    }>
                                    VIEW ALL
                                </Button>
                            </div>
                            {trainingSessionDuesSummary &&
                            trainingSessionDuesSummary.length > 0 ? (
                                <div className="flex flex-col justify-between items-start w-full mt-1">
                                    {trainingSessionDuesSummary?.map(
                                        (due: any, index: number) =>
                                            due.dueDate && (
                                                <div
                                                    key={due.id}
                                                    className={`group flex justify-between items-center w-full py-1.5 border-b border-sldarkblue-800`}>
                                                    <div>
                                                        <span
                                                            key={
                                                                due.trainingType
                                                                    .id
                                                            }
                                                            className="text-white">
                                                            {
                                                                due.trainingType
                                                                    .title
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div className="text-slred-1000 bg-slred-100 p-2 border rounded border-slred-1000 ">
                                                            {due.status.label}
                                                        </div>
                                                        <div>
                                                            <DialogTrigger>
                                                                <SeaLogsButton
                                                                    icon="alert"
                                                                    className="w-5 h-5 ml-2"
                                                                />
                                                                <Popover>
                                                                    <div className="bg-slblue-100 rounded p-2">
                                                                        <div className="text-xs whitespace-nowrap font-medium focus:outline-none inline-block rounded px-3 py-1 bg-slblue-100 text-slblue-800">
                                                                            {due.members
                                                                                .map(
                                                                                    (
                                                                                        member: any,
                                                                                    ) => {
                                                                                        return `${member.firstName || ''} ${member.surname || ''}`
                                                                                    },
                                                                                )
                                                                                .join(
                                                                                    ', ',
                                                                                )}
                                                                        </div>
                                                                    </div>
                                                                </Popover>
                                                            </DialogTrigger>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                    )}
                                </div>
                            ) : (
                                <div className="flex justify-between items-center gap-2 p-2 pt-4">
                                    <div>
                                        <svg
                                            className="!w-[75px] h-auto"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 147 147.01">
                                            <path
                                                d="M72.45,0c17.26-.07,32.68,5.12,46.29,15.56,10.6,8.39,18.38,18.88,23.35,31.47,5.08,13.45,6.21,27.23,3.41,41.34-3.23,15.08-10.38,27.92-21.44,38.52-12.22,11.42-26.69,18.01-43.44,19.78-15.66,1.42-30.31-1.75-43.95-9.52-13.11-7.73-22.98-18.44-29.61-32.13C.9,91.82-1.22,77.98.67,63.51c2.36-16.12,9.17-29.98,20.44-41.58C33.25,9.78,47.91,2.63,65.08.49c2.46-.27,4.91-.43,7.37-.49Z"
                                                fill="#ffffff"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M72.45,0c17.26-.07,32.68,5.12,46.29,15.56,10.6,8.39,18.38,18.88,23.35,31.47,5.08,13.45,6.21,27.23,3.41,41.34-3.23,15.08-10.38,27.92-21.44,38.52-12.22,11.42-26.69,18.01-43.44,19.78-15.66,1.42-30.31-1.75-43.95-9.52-13.11-7.73-22.98-18.44-29.61-32.13C.9,91.82-1.22,77.98.67,63.51c2.36-16.12,9.17-29.98,20.44-41.58C33.25,9.78,47.91,2.63,65.08.49c2.46-.27,4.91-.43,7.37-.49ZM82.49,19.46c-2.01-1.1-4.14-1.85-6.39-2.26-1.42-.15-2.84-.35-4.25-.61-1.46-.26-2.79-.81-4.01-1.63l-.35-.35c-.29-.53-.6-1.04-.93-1.54-.09.7-.16,1.41-.21,2.12.03.4.08.8.16,1.19.13.44.27.88.44,1.31-.5-.61-.86-1.29-1.1-2.05-.08-.4-.17-.78-.28-1.17-1.72.92-2.73,2.36-3.03,4.29-.15,1.3-.07,2.59.26,3.85-.01,0-.03.01-.05.02-1.2-.58-2.25-1.38-3.15-2.38-.35-.41-.7-.83-1.03-1.26-3.65,4.71-4.58,9.92-2.8,15.63.22.67.48,1.32.77,1.96-.88.9-1.32,1.99-1.31,3.27.07,2.46.06,4.91-.05,7.37,0,.73.15,1.41.49,2.05.5.66,1.14.84,1.91.51.04,1.08.14,2.15.28,3.22.32,1.6.91,3.09,1.77,4.48,1.02,1.69,2.3,3.17,3.83,4.43.03,2.55-.21,5.07-.75,7.56-.25,1.08-.6,2.12-1.07,3.13-.06-.82-.08-1.65-.07-2.47-3.51,1.06-7.03,2.13-10.55,3.2-.05.18-.05.35,0,.54-3,1.03-5.75,2.5-8.26,4.41-2.49,1.95-4.29,4.41-5.39,7.4-1.44,3.7-2.48,7.51-3.13,11.43-.85,5.13-1.39,10.29-1.59,15.49-.28,6.88-.27,13.75.05,20.62-11.85-8.19-20.56-18.94-26.13-32.24C1.06,87.19-.22,73.03,2.77,58.47c3.41-15.3,10.86-28.21,22.37-38.71C37.53,8.77,52.05,2.64,68.68,1.38c16.31-.96,31.27,3.03,44.89,11.95,12.77,8.65,21.95,20.17,27.55,34.55,5.1,13.75,6.03,27.78,2.8,42.09-3.66,15.08-11.25,27.73-22.79,37.96-2.17,1.88-4.43,3.63-6.79,5.25.2-5.25.26-10.51.19-15.77-.08-6.3-.58-12.57-1.49-18.8-.61-4.17-1.64-8.23-3.08-12.18-.63-1.7-1.43-3.3-2.43-4.81-1.72-2.2-3.8-3.98-6.23-5.34-1.7-.97-3.47-1.78-5.32-2.43,0-.17,0-.34-.05-.51-3.51-1.07-7.03-2.14-10.55-3.2,0,.67,0,1.34-.02,2.01-.71-1.61-1.18-3.29-1.4-5.04-.28-1.92-.4-3.85-.37-5.79,3.51-3.05,5.38-6.9,5.6-11.57,1.09.43,1.85.11,2.29-.98.14-.36.23-.74.28-1.12.16-2.71.39-5.42.68-8.12.02-1.16-.35-2.16-1.12-3.01.72-2,.98-4.06.77-6.18-.23-3.02-.99-5.9-2.29-8.63-.25-.49-.6-.89-1.05-1.19-.9-.57-1.85-1.05-2.85-1.45-2.32-.93-4.66-1.69-7-2.29l2.94,2.1c.23.19.44.38.65.58ZM67.79,16.43c1.57.82,3.23,1.33,4.99,1.56,3.64.17,7,1.21,10.08,3.13.46.32.91.64,1.35.98.51.5,1.04.98,1.59,1.42-.16-.79-.37-1.58-.63-2.38-.2-.45-.44-.88-.72-1.28,1.17.37,2.29.87,3.36,1.49.51.3.88.73,1.1,1.28,1.49,3.35,2.14,6.85,1.96,10.5-.1,1.56-.58,3-1.45,4.29.18-3.13-.99-5.59-3.52-7.4-.08-.03-.15-.03-.23,0-4.07,1.24-8.23,2.1-12.46,2.57-2.13.23-4.26.21-6.39-.05-1.36-.17-2.6-.64-3.73-1.4-.21-.16-.4-.34-.58-.54-.19-.26-.38-.5-.58-.75-1.64.95-2.79,2.32-3.43,4.11-.3.85-.5,1.72-.61,2.61-1.41-2.86-1.97-5.88-1.68-9.05.29-2.38,1.11-4.56,2.45-6.53,1.01,1.13,2.2,2.04,3.55,2.73.78.31,1.59.5,2.43.58-.41-.98-.7-1.99-.86-3.03-.2-1.18-.11-2.33.28-3.45.21-.49.49-.92.84-1.31.7,1.83,1.95,3.13,3.76,3.9.83.28,1.67.51,2.52.7-.5-.54-1.01-1.07-1.52-1.61-.82-.9-1.43-1.93-1.84-3.08ZM59.06,37.38c.02-1.89.61-3.59,1.75-5.09.27-.27.54-.54.82-.79.95.91,2.07,1.54,3.36,1.89,1.62.42,3.27.61,4.95.58,2.57-.05,5.12-.3,7.65-.77,2.69-.48,5.34-1.11,7.96-1.89,1.99,1.57,2.86,3.62,2.64,6.16-1.77-1.75-3.9-2.51-6.39-2.26-.64.04-1.28.12-1.91.23-4.21.03-8.43.03-12.65,0-1.36-.26-2.73-.32-4.11-.19-1.57.32-2.92,1.02-4.06,2.12ZM70.63,36.68c1.94-.06,3.88-.06,5.83-.02-.65.41-1.14.96-1.47,1.66-.32-.55-.8-.86-1.42-.93-.27,0-.52.07-.75.21-.28.21-.51.45-.7.72-.34-.7-.84-1.24-1.49-1.63ZM90.65,37.75s.08,0,.12.05c.4.71.54,1.47.42,2.29-.28,2.48-.5,4.97-.65,7.47-.04.39-.17.75-.37,1.07-.05.06-.12.1-.19.14-.28-.12-.54-.28-.75-.51-.03-.92-.03-1.83,0-2.75.77-1.63.95-3.33.56-5.09-.1-.38-.23-.76-.4-1.12.48-.47.9-.98,1.26-1.54ZM57.06,37.8c.07.02.13.07.16.14.14.28.29.54.47.79.03.23.03.47,0,.7-.64,1.67-.7,3.37-.19,5.09,0,1.24.03,2.47.07,3.71-.01.07-.03.14-.05.21-.18.14-.38.25-.61.33-.16-.06-.26-.16-.3-.33-.14-.39-.21-.8-.21-1.21.1-2.4.12-4.81.05-7.21-.03-.81.18-1.54.61-2.22ZM73.48,38.59c.14,0,.26.07.35.19.37.52.63,1.1.79,1.73.35,2.87,1.61,5.26,3.76,7.16,2.84,2.21,5.77,2.32,8.77.33.28-.22.56-.47.82-.72.41,6.51-2.13,11.48-7.63,14.91-3.24,1.68-6.66,2.21-10.27,1.61-2.37-.47-4.43-1.5-6.21-3.1-1.87-1.68-3.29-3.69-4.27-6-.48-1.29-.73-2.63-.75-4.01-.08-1.29-.11-2.58-.09-3.87,1.68,1.94,3.8,2.78,6.37,2.54,1.8-.35,3.31-1.2,4.55-2.54,1.55-1.71,2.48-3.72,2.8-6.02.16-.82.49-1.55,1-2.19ZM64.1,51.47h18.76c-.31,3.1-1.75,5.51-4.34,7.21-3.33,1.93-6.68,1.95-10.03.05-2.64-1.7-4.1-4.12-4.39-7.26ZM82.3,62.29s.06.05.07.09c.02,2.8.39,5.56,1.12,8.26.37,1.28.92,2.46,1.66,3.55-.38,3.03-1.34,5.86-2.87,8.49-1.97,3.15-4.79,5.04-8.47,5.67-2.56-.19-4.8-1.12-6.72-2.8-1.84-1.76-3.19-3.85-4.04-6.28-.56-1.56-.95-3.17-1.17-4.81.49-.6.88-1.27,1.17-2.01.74-1.94,1.2-3.95,1.4-6.02.13-1.16.2-2.33.23-3.5.03-.04.07-.05.12-.02,1.95,1.3,4.09,2.05,6.44,2.24,3.31.29,6.45-.3,9.43-1.77.58-.32,1.12-.69,1.63-1.1ZM95.83,75.08c2.89,1.03,5.53,2.49,7.93,4.36,1.73,1.39,3.07,3.07,4.04,5.06,1.47,3.25,2.56,6.62,3.27,10.13.98,4.87,1.62,9.78,1.91,14.74.51,8.23.53,16.46.05,24.68-13.72,8.81-28.73,12.66-45.05,11.55-12.33-.99-23.66-4.84-33.99-11.55-.43-8.31-.4-16.62.09-24.92.3-4.98.95-9.91,1.96-14.79.66-3.2,1.64-6.29,2.94-9.29.87-2.03,2.14-3.76,3.8-5.2,2.48-2.08,5.27-3.66,8.35-4.74.6,6.75.21,13.43-1.14,20.06-.41,2.14-.95,4.24-1.63,6.3-.38,1.08-.89,2.1-1.54,3.03-.28.33-.6.6-.96.82-.16.08-.34.13-.51.16v16.8h56.27v-16.8c-.58-.15-1.05-.46-1.42-.93-.7-.99-1.25-2.06-1.63-3.22-.74-2.26-1.31-4.56-1.73-6.91-1-4.99-1.41-10.03-1.21-15.12.04-1.42.11-2.83.21-4.25Z"
                                                fill="#052350"
                                                fillRule="evenodd"
                                                opacity=".97"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M63.78,35.74c1.14,0,2.28.1,3.41.28v.61c1.76-.37,3.17.15,4.22,1.59.16.27.28.56.35.86-.17.49-.33.98-.47,1.47.18.08.36.13.56.14-.38,2.99-1.8,5.34-4.25,7.07-2.68,1.56-5.23,1.37-7.65-.56-1.64-1.53-2.37-3.42-2.17-5.67.14-1.59.81-2.92,1.98-3.99,1.16-1,2.5-1.6,4.01-1.8Z"
                                                fill="#2998e9"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M82.07,35.74c2.41-.13,4.41.71,6,2.52,1.27,1.71,1.65,3.61,1.12,5.69-.71,2.39-2.25,3.93-4.64,4.64-1.35.35-2.68.26-3.97-.28-1.83-.89-3.23-2.23-4.18-4.04-.65-1.19-1.03-2.47-1.14-3.83.19-.02.37-.06.56-.09-.11-.45-.25-.9-.42-1.33.23-.83.72-1.47,1.45-1.91.3-.18.61-.34.93-.47.71-.02,1.43-.03,2.15-.02v-.61c.72-.11,1.44-.2,2.15-.28Z"
                                                fill="#2998e9"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M65.55,40.6c.97,0,1.45.48,1.42,1.45-.23.75-.73,1.07-1.52.96-.66-.27-.95-.76-.86-1.47.16-.48.48-.79.96-.93Z"
                                                fill="#024450"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M81.18,40.6c.7-.04,1.18.28,1.42.93.06,1.08-.45,1.57-1.52,1.47-.81-.37-1.05-.97-.72-1.8.21-.3.48-.5.82-.61Z"
                                                fill="#052451"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M62.84,50.25h21.23c.1,3.78-1.35,6.8-4.34,9.08-3,2.03-6.23,2.51-9.71,1.45-3.65-1.35-5.96-3.91-6.93-7.68-.18-.94-.27-1.89-.26-2.85ZM64.1,51.47c.29,3.14,1.75,5.56,4.39,7.26,3.35,1.9,6.7,1.89,10.03-.05,2.59-1.7,4.03-4.11,4.34-7.21h-18.76Z"
                                                fill="#052250"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M73.2,89.54c.19.06.37.06.56,0,4.36-.67,7.63-2.91,9.82-6.72,1.49-2.78,2.43-5.73,2.8-8.87l.21-2.24c2.7.85,5.4,1.68,8.12,2.47-.29,3.81-.36,7.62-.21,11.43.33,4.44,1.02,8.83,2.05,13.16.46,1.91,1.12,3.75,2.01,5.51.3.54.67,1.03,1.1,1.47.22.21.48.39.75.54v14.79h-53.85v-14.79c.54-.3.98-.7,1.33-1.21.56-.85,1.03-1.75,1.4-2.71.97-2.75,1.68-5.57,2.15-8.45.95-5.12,1.31-10.28,1.07-15.49-.04-1.36-.13-2.73-.26-4.08.01-.06.03-.11.05-.16,2.69-.83,5.38-1.66,8.07-2.47.16,3.36.91,6.58,2.26,9.66,1.25,2.77,3.15,4.96,5.72,6.56,1.51.86,3.13,1.4,4.85,1.61Z"
                                                fill="#2998e9"
                                                strokeWidth="0px"
                                            />
                                            <path
                                                d="M45.34,125.8h23.84v6.63h-23.84v-6.63Z"
                                                fill="#052350"
                                                strokeWidth="0"
                                            />
                                            <path
                                                d="M70.17,125.8h6.58v6.63h-6.58v-6.63Z"
                                                fill="#052250"
                                                strokeWidth="0"
                                            />
                                            <path
                                                d="M77.77,125.8h23.84v6.63h-23.84v-6.63Z"
                                                fill="#052350"
                                                strokeWidth="0"
                                            />
                                            <path
                                                d="M67.98,127.01v4.2h-21.42v-4.2h21.42Z"
                                                fill="#2a99ea"
                                                strokeWidth="0"
                                            />
                                            <path
                                                d="M75.58,127.01v4.2h-4.2v-4.2h4.2Z"
                                                fill="#2a99ea"
                                                strokeWidth="0"
                                            />
                                            <path
                                                d="M78.99,127.01h21.42v4.2h-21.42v-4.2Z"
                                                fill="#2a99ea"
                                                strokeWidth="0"
                                            />
                                            <path
                                                d="M64.1,51.47h18.76c-.31,3.1-1.75,5.51-4.34,7.21-3.33,1.93-6.68,1.95-10.03.05-2.64-1.7-4.1-4.12-4.39-7.26Z"
                                                fill="#ffffff"
                                                strokeWidth="0"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-white text-xs font-light">
                                        WOW! Look at that! All your crew are
                                        ship-shaped and trained to the gills.
                                        Great job, captain!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation tabs */}
                <div className="sm:flex flex-nowrap md:justify-between flex-column sm:flex-row items-between my-4 w-full">
                    <div className={classes.tabsHolder}>
                        <ul className={classes.tabsUl}>
                            <li id="vesselInfo" className={classes.tabsUlLi}>
                                <div>
                                    <Button
                                        className={`${vesselTab === 'info' ? classes.active : classes.inactive}`}
                                        onPress={() =>
                                            setVesselTab(
                                                vesselTab == 'info'
                                                    ? ''
                                                    : 'info',
                                            )
                                        }>
                                        Info
                                    </Button>
                                </div>
                                {vesselTab === 'info' && (
                                    <div className="lg:hidden block bg-white my-4 rounded-lg">
                                        <div className="rounded-lg">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 px-4 font-light text-sm">
                                                <div className="pt-2">
                                                    <div className="text-2xl font-bold ">
                                                        {vessel?.title || (
                                                            <Skeleton />
                                                        )}
                                                    </div>
                                                    <br />
                                                    <small>
                                                        {
                                                            vessel?.vesselTypeDescription
                                                        }
                                                    </small>
                                                    <div className="pl-2 mt-4 max-w-[25rem]">
                                                        <ul className="leading-loose mb-4 md:mb-0">
                                                            {vessel?.registration && (
                                                                <li className="flex">
                                                                    <strong>
                                                                        Authority
                                                                        No.
                                                                        (MNZ,
                                                                        AMSA):
                                                                    </strong>
                                                                    &nbsp;
                                                                    {
                                                                        vessel?.registration
                                                                    }
                                                                </li>
                                                            )}
                                                            {vessel?.transitID && (
                                                                <li className="flex">
                                                                    <strong>
                                                                        Transit
                                                                        identifier:
                                                                    </strong>
                                                                    &nbsp;
                                                                    {
                                                                        vessel?.transitID
                                                                    }
                                                                </li>
                                                            )}
                                                            {vessel?.mmsi && (
                                                                <li className="flex">
                                                                    <strong>
                                                                        MMSI:
                                                                    </strong>
                                                                    &nbsp;
                                                                    {
                                                                        vessel?.mmsi
                                                                    }
                                                                </li>
                                                            )}
                                                            {vessel?.callSign && (
                                                                <li className="flex">
                                                                    <strong>
                                                                        Call
                                                                        sign:
                                                                    </strong>
                                                                    &nbsp;
                                                                    {
                                                                        vessel?.callSign
                                                                    }
                                                                </li>
                                                            )}
                                                            <li className="flex text-sm leading-loose font-light border-t border-slblue-200 mt-2 pt-2 w-2/3">
                                                                <strong>
                                                                    Primary
                                                                    harbor:
                                                                </strong>
                                                                &nbsp;
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.primaryHarbour
                                                                }
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 block bg-sldarkblue-100 border border-slblue-200 rounded-lg dark:bg-sldarkblue-800">
                                                    <div className="pt-8 pb-5 px-7 lg:flex md:flex gap-3 flex-col lg:flex-row md:flex-row">
                                                        <div className="lg:w-1/3 md:w-1/3 w-full">
                                                            <label htmlFor="vessel-beam">
                                                                <strong>
                                                                    Vessel beam:
                                                                </strong>
                                                                &nbsp;
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.beam
                                                                }
                                                            </label>
                                                        </div>
                                                        <div className="lg:w-1/3 md:w-1/3 w-full">
                                                            <label htmlFor="vessel-overallLength">
                                                                <strong>
                                                                    Length
                                                                    overall:
                                                                </strong>
                                                                &nbsp;
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.overallLength
                                                                }
                                                            </label>
                                                        </div>
                                                        <div className="lg:w-1/3 md:w-1/3 w-full">
                                                            <label htmlFor="vessel-draft">
                                                                <strong>
                                                                    Draft:
                                                                </strong>
                                                                &nbsp;
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.draft
                                                                }
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="pb-5 px-7 flex gap-3">
                                                        <div className="w-full">
                                                            <label htmlFor="vessel-dateOfBuild">
                                                                <strong>
                                                                    Date of
                                                                    build:
                                                                </strong>
                                                                &nbsp;
                                                                {formatDate(
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.dateOfBuild,
                                                                )}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="pb-4 px-7 lg:flex gap-3 md:flex flex-col lg:flex-row md:flex-row">
                                                        <div className="lg:w-1/3 md:w-1/3 w-full">
                                                            <label htmlFor="vessel-hullColor">
                                                                <strong>
                                                                    Hull color:
                                                                </strong>
                                                                &nbsp;
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.hullColor
                                                                }
                                                            </label>
                                                        </div>
                                                        <div className="lg:w-2/3 md:w-2/3 w-full">
                                                            <label htmlFor="vessel-hullConstruction">
                                                                <strong>
                                                                    Hull
                                                                    construction:
                                                                </strong>
                                                                &nbsp;
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.hullConstruction
                                                                }
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="pb-8 pt-4 border-t border-t-slblue-100 mx-7 lg:flex md:flex lg:gap-3 md:gap-3 flex-col lg:flex-row md:flex-row">
                                                        <div className="lg:w-1/3 md:w-1/3 w-full">
                                                            <label htmlFor="vessel-minCrew">
                                                                <strong>
                                                                    Minimum
                                                                    required
                                                                    crew:
                                                                </strong>
                                                                &nbsp;
                                                                {
                                                                    vessel?.minCrew
                                                                }
                                                            </label>
                                                        </div>
                                                        <div className="lg:w-1/3 md:w-1/3 w-full">
                                                            <label htmlFor="vessel-minCrew">
                                                                <strong>
                                                                    Max
                                                                    passengers
                                                                    allowed:
                                                                </strong>
                                                                &nbsp;
                                                                {vessel?.maxPax}
                                                            </label>
                                                        </div>
                                                        <div className="lg:w-1/3 md:w-1/3 w-full">
                                                            <label htmlFor="vessel-minCrew">
                                                                <strong>
                                                                    Max people
                                                                    on board:
                                                                </strong>
                                                                &nbsp;
                                                                {vessel?.maxPOB}
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Engine details */}
                                        <div className="py-8 border-t border-slblue-200 mt-8 font-light text-sm">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 px-4">
                                                <div className="pt-2 text-base font-normal">
                                                    {vessel?.registration && (
                                                        <>
                                                            Details of engine
                                                            {engineList?.length >
                                                                1 && 's'}
                                                        </>
                                                    )}
                                                </div>
                                                <div className="col-span-2 block bg-white pt-8 px-7 pb-5 border border-slblue-200 rounded-lg dark:bg-sldarkblue-800 dark:text-slblue-200">
                                                    {engineList?.length > 0 && (
                                                        <div className="pb-4 pt-4">
                                                            {engineList.map(
                                                                (
                                                                    engine: any,
                                                                    index: number,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            engine.id
                                                                        }
                                                                        className="mb-4 pb-4">
                                                                        <div className="lg:flex md:flex lg:flex-row md:flex-row flex-col lg:gap-4 md:gap-4">
                                                                            <div className="dark:text-slblue-200 w-48 inline-block">
                                                                                <span className="font-semibold">
                                                                                    {
                                                                                        engine.title
                                                                                    }
                                                                                </span>
                                                                                <br />
                                                                                {engine.identifier !=
                                                                                    null && (
                                                                                    <div className="ml-2 font-light text-xs text-slblue-700 dark:text-slblue-200 ">
                                                                                        <>
                                                                                            (
                                                                                            {
                                                                                                engine.identifier
                                                                                            }
                                                                                            ):
                                                                                        </>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="dark:text-slblue-200 flex flex-cols-2 leading-loose gap-12">
                                                                                <ul>
                                                                                    <li className="flex">
                                                                                        <label
                                                                                            htmlFor="vessel-positonOnVessel"
                                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                                            <strong>
                                                                                                Position
                                                                                                on
                                                                                                vessel:
                                                                                            </strong>
                                                                                            &nbsp;
                                                                                        </label>
                                                                                        {
                                                                                            engine.positionOnVessel
                                                                                        }
                                                                                    </li>
                                                                                    <li className="flex">
                                                                                        <label
                                                                                            htmlFor="vessel-type"
                                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                                            <strong>
                                                                                                Engine
                                                                                                type:
                                                                                            </strong>
                                                                                            &nbsp;
                                                                                        </label>
                                                                                        {
                                                                                            engine.type
                                                                                        }
                                                                                    </li>
                                                                                    <li className="flex">
                                                                                        <label
                                                                                            htmlFor="vessel-currentHours"
                                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                                            <strong>
                                                                                                Current
                                                                                                engine
                                                                                                hours:
                                                                                            </strong>
                                                                                            &nbsp;
                                                                                        </label>
                                                                                        {
                                                                                            engine.currentHours
                                                                                        }
                                                                                    </li>
                                                                                    <li className="flex">
                                                                                        <label
                                                                                            htmlFor="vessel-makeModel"
                                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                                            <strong>
                                                                                                Engine
                                                                                                make
                                                                                                &
                                                                                                model:
                                                                                            </strong>
                                                                                            &nbsp;
                                                                                        </label>
                                                                                        {
                                                                                            engine.make
                                                                                        }
                                                                                        &nbsp;
                                                                                        {
                                                                                            engine.model
                                                                                        }
                                                                                    </li>
                                                                                    <li className="flex">
                                                                                        <label
                                                                                            htmlFor="vessel-driveType"
                                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                                            <strong>
                                                                                                Drive
                                                                                                type:
                                                                                            </strong>
                                                                                            &nbsp;
                                                                                        </label>
                                                                                        {
                                                                                            engine.driveType
                                                                                        }
                                                                                    </li>
                                                                                    <li className="flex">
                                                                                        <label
                                                                                            htmlFor="vessel-kVA"
                                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                                            <strong>
                                                                                                Genset
                                                                                                kilovolt-amperes
                                                                                                (kVA):
                                                                                            </strong>
                                                                                            &nbsp;
                                                                                        </label>
                                                                                        {
                                                                                            engine.kVA
                                                                                        }
                                                                                    </li>
                                                                                    <li className="flex">
                                                                                        <label
                                                                                            htmlFor="vessel-kw"
                                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                                            <strong>
                                                                                                Engine
                                                                                                kilowatts
                                                                                                (kW):
                                                                                            </strong>
                                                                                            &nbsp;
                                                                                        </label>
                                                                                        {
                                                                                            engine.kW
                                                                                        }
                                                                                    </li>
                                                                                    <li className="flex">
                                                                                        <label
                                                                                            htmlFor="vessel-maxPower"
                                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                                            <strong>
                                                                                                Max
                                                                                                power:
                                                                                            </strong>
                                                                                            &nbsp;
                                                                                        </label>
                                                                                        {
                                                                                            engine.maxPower
                                                                                        }
                                                                                    </li>
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                        {engineList?.length >
                                                                            1 && (
                                                                            <div className="border-t border-t-slblue-100 mt-5"></div>
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fuel tank details */}
                                        <div className="py-8 border-t border-slblue-200 mt-8 font-light text-sm">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 px-4">
                                                <div className="pt-2 text-base font-normal">
                                                    {fuelTankList?.length >
                                                        0 && (
                                                        <>
                                                            Fuel tank
                                                            {fuelTankList?.length >
                                                                1 && 's'}
                                                            :
                                                        </>
                                                    )}
                                                </div>
                                                <div className="col-span-2 block bg-white pt-8 px-7 pb-5 border border-slblue-200 rounded-lg dark:bg-sldarkblue-800 dark:text-slblue-200">
                                                    {fuelTankList?.length >
                                                        0 && (
                                                        <div className="pb-4 pt-4">
                                                            {fuelTankList.map(
                                                                (
                                                                    tank: any,
                                                                    index: number,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            tank.id
                                                                        }
                                                                        className="mb-4 pb-4">
                                                                        <div className="flex gap-4">
                                                                            <div className="dark:text-slblue-200 w-48 inline-block">
                                                                                <span className="font-semibold">
                                                                                    {
                                                                                        tank.title
                                                                                    }
                                                                                </span>
                                                                                <br />
                                                                                {tank.identifier !=
                                                                                    null && (
                                                                                    <div className="ml-2 font-light text-xs text-slblue-700 dark:text-slblue-200">
                                                                                        <>
                                                                                            (
                                                                                            {
                                                                                                tank.identifier
                                                                                            }
                                                                                            ):
                                                                                        </>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="dark:text-slblue-200 flex flex-cols-2 leading-loose gap-12">
                                                                                <ul>
                                                                                    <li>
                                                                                        <label
                                                                                            htmlFor="vessel-capacity"
                                                                                            className="w-72 inline-block">
                                                                                            <strong>
                                                                                                Fuel
                                                                                                tank
                                                                                                capacity:
                                                                                            </strong>
                                                                                            &nbsp;
                                                                                        </label>
                                                                                        {
                                                                                            tank.capacity
                                                                                        }
                                                                                    </li>
                                                                                    <li>
                                                                                        <label
                                                                                            htmlFor="vessel-safeFuelCapacity"
                                                                                            className="w-72 inline-block">
                                                                                            <strong>
                                                                                                Safe
                                                                                                fuel
                                                                                                level:
                                                                                            </strong>
                                                                                            &nbsp;
                                                                                        </label>
                                                                                        {
                                                                                            tank.safeFuelCapacity
                                                                                        }
                                                                                    </li>
                                                                                    <li>
                                                                                        <label
                                                                                            htmlFor="vessel-currentLevel"
                                                                                            className="w-72 inline-block">
                                                                                            <strong>
                                                                                                Current
                                                                                                fuel
                                                                                                level:
                                                                                            </strong>
                                                                                            &nbsp;
                                                                                        </label>
                                                                                        {
                                                                                            tank.currentLevel
                                                                                        }
                                                                                    </li>
                                                                                    <li>
                                                                                        <label
                                                                                            htmlFor="vessel-fuelType"
                                                                                            className="w-72 inline-block">
                                                                                            <strong>
                                                                                                Fuel
                                                                                                type:
                                                                                            </strong>
                                                                                            &nbsp;
                                                                                        </label>
                                                                                        {
                                                                                            tank.fuelType
                                                                                        }
                                                                                    </li>
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                        {fuelTankList?.length >
                                                                            1 && (
                                                                            <div className="border-t border-t-slblue-100 mt-5"></div>
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Water tank details */}
                                        <div className="py-8 border-t border-slblue-200 mt-8 font-light text-sm">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 px-4">
                                                <div className="pt-2 text-base font-normal">
                                                    {waterTankList?.length >
                                                        0 && (
                                                        <>
                                                            Water tank
                                                            {waterTankList?.length >
                                                                1 && 's'}
                                                            :
                                                        </>
                                                    )}
                                                </div>
                                                <div className="col-span-2 block bg-white pt-8 px-7 pb-5 border border-slblue-200 rounded-lg dark:bg-sldarkblue-800 dark:text-slblue-200">
                                                    {waterTankList?.length >
                                                        0 && (
                                                        <div className="pb-4 pt-4">
                                                            {waterTankList.map(
                                                                (
                                                                    tank: any,
                                                                    index: number,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            tank.id
                                                                        }
                                                                        className="mb-4 pb-4">
                                                                        <div className="flex gap-4">
                                                                            <div className="dark:text-slblue-200 w-48 inline-block">
                                                                                <span className="font-semibold">
                                                                                    {
                                                                                        tank.title
                                                                                    }
                                                                                </span>
                                                                                <br />
                                                                                {tank.identifier !=
                                                                                    null && (
                                                                                    <div className="ml-2 font-light text-xs text-slblue-700 dark:text-slblue-200">
                                                                                        {
                                                                                            tank.identifier
                                                                                        }
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="dark:text-slblue-200 flex flex-cols-2 leading-loose gap-12">
                                                                                <ul>
                                                                                    <li>
                                                                                        <label
                                                                                            htmlFor="vessel-capacity"
                                                                                            className="w-72 inline-block">
                                                                                            <strong>
                                                                                                Water
                                                                                                tank
                                                                                                capacity:
                                                                                            </strong>
                                                                                            &nbsp;
                                                                                        </label>
                                                                                        {
                                                                                            tank.capacity
                                                                                        }
                                                                                    </li>
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                        {waterTankList?.length >
                                                                            1 && (
                                                                            <div className="border-t border-t-slblue-100 mt-5"></div>
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sullage details */}
                                        <div className="py-8 border-t border-slblue-200 mt-8 font-light text-sm">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 px-4">
                                                <div className="pt-2 text-base font-normal">
                                                    {sewageSystemList?.length >
                                                        0 && (
                                                        <>
                                                            Sullage system
                                                            {sewageSystemList?.length >
                                                                1 && 's'}
                                                            :
                                                        </>
                                                    )}
                                                </div>
                                                <div className="col-span-2 block bg-white pt-8 px-7 pb-5 border border-slblue-200 rounded-lg dark:bg-sldarkblue-800 dark:text-slblue-200">
                                                    {sewageSystemList?.length >
                                                        0 && (
                                                        <div className="pb-4 pt-4">
                                                            {sewageSystemList.map(
                                                                (
                                                                    system: any,
                                                                    index: number,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            system.id
                                                                        }
                                                                        className="mb-4 pb-4">
                                                                        <div className="flex gap-4">
                                                                            <div className="dark:text-slblue-200 w-48 inline-block">
                                                                                <span className="font-semibold">
                                                                                    {
                                                                                        system.title
                                                                                    }
                                                                                </span>
                                                                                <br />
                                                                                {system.identifier !=
                                                                                    null && (
                                                                                    <div className="ml-2 font-light text-xs text-slblue-700 dark:text-slblue-200">
                                                                                        <>
                                                                                            (
                                                                                            {
                                                                                                system.identifier
                                                                                            }
                                                                                            ):
                                                                                        </>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="dark:text-slblue-200 flex flex-cols-2 leading-loose gap-12">
                                                                                <ul>
                                                                                    <li>
                                                                                        <label
                                                                                            htmlFor="vessel-systemCapacity"
                                                                                            className="w-72 inline-block">
                                                                                            <strong>
                                                                                                System
                                                                                                capacity:
                                                                                            </strong>
                                                                                            &nbsp;
                                                                                        </label>
                                                                                        {
                                                                                            system.capacity
                                                                                        }
                                                                                    </li>
                                                                                    <li>
                                                                                        <label
                                                                                            htmlFor="vessel-numberOfTanks"
                                                                                            className="w-72 inline-block">
                                                                                            <strong>
                                                                                                Number
                                                                                                of
                                                                                                tanks:
                                                                                            </strong>
                                                                                            &nbsp;
                                                                                        </label>
                                                                                        {
                                                                                            system.numberOfTanks
                                                                                        }
                                                                                    </li>
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                        {sewageSystemList?.length >
                                                                            1 && (
                                                                            <div className="border-t border-t-slblue-100 mt-5"></div>
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Other details */}
                                        <div className="py-8 border-t border-slblue-200 mt-8 font-light text-sm">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 px-4">
                                                <div className="pt-2 text-base font-normal">
                                                    Other vessel details
                                                </div>
                                                <div className="col-span-2 block bg-white pt-8 px-7 pb-5 border border-slblue-200 rounded-lg dark:bg-sldarkblue-800 dark:text-slblue-200">
                                                    <div className="dark:text-slblue-200 flex flex-cols-2 leading-9 gap-12">
                                                        <ul>
                                                            {/* {vessel.vesselSpecifics.portOfRegistry && ( */}
                                                            <li className="flex">
                                                                <label
                                                                    htmlFor="vessel-portOfRegistry"
                                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                    <strong>
                                                                        Port of
                                                                        registry:
                                                                    </strong>
                                                                    &nbsp;
                                                                </label>
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.portOfRegistry
                                                                }
                                                            </li>
                                                            {/* {vessel.vesselSpecifics.registeredLength && ( */}
                                                            <li className="flex">
                                                                <label
                                                                    htmlFor="vessel-registeredLength"
                                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                    <strong>
                                                                        Registered
                                                                        length:
                                                                    </strong>
                                                                    &nbsp;
                                                                </label>
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.registeredLength
                                                                }
                                                            </li>
                                                            {/* {vessel.vesselSpecifics.tonnageLength && ( */}
                                                            <li className="flex">
                                                                <label
                                                                    htmlFor="vessel-tonnageLength"
                                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                    <strong>
                                                                        Tonnage
                                                                        length:
                                                                    </strong>
                                                                    &nbsp;
                                                                </label>
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.tonnageLength
                                                                }
                                                            </li>
                                                            {/* {vessel.vesselSpecifics.maxCargoLoad && ( */}
                                                            <li className="flex">
                                                                <label
                                                                    htmlFor="vessel-grossTonnage"
                                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                    <strong>
                                                                        Gross
                                                                        tonnage:
                                                                    </strong>
                                                                    &nbsp;
                                                                </label>
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.grossTonnage
                                                                }
                                                            </li>
                                                            {/* {vessel.vesselSpecifics.netTonnage && ( */}
                                                            <li className="flex">
                                                                <label
                                                                    htmlFor="vessel-netTonnage"
                                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                    <strong>
                                                                        Net
                                                                        tonnage:
                                                                    </strong>
                                                                    &nbsp;
                                                                </label>
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.netTonnage
                                                                }
                                                            </li>
                                                            {/* {vessel.vesselSpecifics.maxCargoLoad && ( */}
                                                            <li className="flex">
                                                                <label
                                                                    htmlFor="vessel-maxCargoLoad"
                                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                    <strong>
                                                                        Max
                                                                        cargo
                                                                        load:
                                                                    </strong>
                                                                    &nbsp;
                                                                </label>
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.maxCargoLoad
                                                                }
                                                            </li>
                                                            {/* {vessel.vesselSpecifics.capacityOfLifting && ( */}
                                                            <li className="flex">
                                                                <label
                                                                    htmlFor="vessel-capacityOfLifting"
                                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                    <strong>
                                                                        Capacity
                                                                        of
                                                                        lifting:
                                                                    </strong>
                                                                    &nbsp;
                                                                </label>
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.capacityOfLifting
                                                                }
                                                            </li>
                                                            {/* {vessel.vesselSpecifics.loadLineLength && ( */}
                                                            <li className="flex">
                                                                <label
                                                                    htmlFor="vessel-loadLineLength"
                                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                    <strong>
                                                                        Load
                                                                        line
                                                                        length:
                                                                    </strong>
                                                                    &nbsp;
                                                                </label>
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.loadLineLength
                                                                }
                                                            </li>
                                                            {/* {vessel.vesselSpecifics.specialLimitations && ( */}
                                                            <li className="flex">
                                                                <label
                                                                    htmlFor="vessel-specialLimitations"
                                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                    <strong>
                                                                        Special
                                                                        limitations:
                                                                    </strong>
                                                                    &nbsp;
                                                                </label>
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.specialLimitations
                                                                }
                                                            </li>
                                                            {/* {vessel.vesselSpecifics.operatingAreaLimits && ( */}
                                                            <li className="flex">
                                                                <label
                                                                    htmlFor="vessel-operatingAreaLimits"
                                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                    <strong>
                                                                        Operating
                                                                        area
                                                                        limits:
                                                                    </strong>
                                                                    &nbsp;
                                                                </label>
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.operatingAreaLimits
                                                                }
                                                            </li>
                                                            {/* {vessel.vesselSpecifics.fishingNumber && ( */}
                                                            <li className="flex">
                                                                <label
                                                                    htmlFor="vessel-fishingNumber"
                                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block sm:inline-block hidden">
                                                                    <strong>
                                                                        Fishing
                                                                        Number:
                                                                    </strong>
                                                                    &nbsp;
                                                                </label>
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.fishingNumber
                                                                }
                                                            </li>
                                                            {/* {vessel.vesselSpecifics.carriesDangerousGoods && ( */}
                                                            <li className="flex">
                                                                <label
                                                                    htmlFor="vessel-carriesDangerousGoods"
                                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block sm:inline-block hidden">
                                                                    <strong>
                                                                        Carriers
                                                                        dangerous
                                                                        goods:
                                                                    </strong>
                                                                    &nbsp;
                                                                </label>
                                                                {vessel
                                                                    ?.vesselSpecifics
                                                                    ?.carriesDangerousGoods ==
                                                                0
                                                                    ? 'No'
                                                                    : 'Yes'}
                                                            </li>
                                                            {/* {vessel.vesselSpecifics.designApprovalNumber && ( */}
                                                            <li className="flex">
                                                                <label
                                                                    htmlFor="vessel-designApprovalNumber"
                                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block sm:inline-block hidden">
                                                                    <strong>
                                                                        Design
                                                                        approval
                                                                        number:
                                                                    </strong>
                                                                    &nbsp;
                                                                </label>
                                                                {
                                                                    vessel
                                                                        ?.vesselSpecifics
                                                                        ?.designApprovalNumber
                                                                }
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </li>
                            <li id="logEntries" className={classes.tabsUlLi}>
                                <div className="flex flex-row gap-2">
                                    <Button
                                        className={`${vesselTab === 'logEntries' ? classes.active : classes.inactive}`}
                                        onPress={() =>
                                            setVesselTab(
                                                vesselTab == 'logEntries'
                                                    ? ''
                                                    : 'logEntries',
                                            )
                                        }>
                                        Logbook
                                    </Button>
                                    {vesselTab === 'logEntries' && !imCrew && (
                                        <div className="lg:hidden block">
                                            <SeaLogsButton
                                                text="New log entry"
                                                type="primary"
                                                action={handleCreateNewLogEntry}
                                                icon="new_logbook"
                                                color="sldarkblue"
                                                isDisabled={
                                                    isNewLogEntryDisabled
                                                }
                                                className="h-95 w-fit text-nowrap "
                                            />
                                        </div>
                                    )}
                                </div>
                                {vesselTab === 'logEntries' && (
                                    <div className=" lg:hidden block overflow-x-auto my-4">
                                        <LogEntryList
                                            logbooks={logbooks}
                                            vesselID={vesselId}
                                        />
                                        {logbooks.length > 0 &&
                                            totalEntries > perPage && (
                                                <div className="sm:flex hidden items-center justify-end p-4">
                                                    <nav aria-label="Log Entries pagination">
                                                        <ul className="inline-flex -space-x-px text-base h-10">
                                                            <li>
                                                                <Button
                                                                    aria-current="page"
                                                                    className={`${classes.paginationButtons} rounded-s-lg`}
                                                                    onPress={() =>
                                                                        handlePagination(
                                                                            currentPage -
                                                                                1,
                                                                        )
                                                                    }>
                                                                    Previous
                                                                </Button>
                                                            </li>
                                                            {Array.from(
                                                                {
                                                                    length: Math.ceil(
                                                                        totalEntries /
                                                                            perPage,
                                                                    ),
                                                                },
                                                                (_, i) => (
                                                                    <li key={i}>
                                                                        <Button
                                                                            className={`${currentPage === i ? classes.paginationActive : classes.paginationInactive}`}
                                                                            onPress={() =>
                                                                                handlePagination(
                                                                                    i,
                                                                                )
                                                                            }>
                                                                            {i +
                                                                                1}
                                                                        </Button>
                                                                    </li>
                                                                ),
                                                            )}
                                                            <li>
                                                                <Button
                                                                    className={`${classes.paginationButtons} rounded-e-lg`}
                                                                    onPress={() =>
                                                                        handlePagination(
                                                                            currentPage +
                                                                                1,
                                                                        )
                                                                    }>
                                                                    Next
                                                                </Button>
                                                            </li>
                                                        </ul>
                                                    </nav>
                                                </div>
                                            )}
                                    </div>
                                )}
                            </li>
                            <li id="maintenance" className={classes.tabsUlLi}>
                                <div className="flex flex-row gap-2">
                                    <Button
                                        className={`${vesselTab === 'maintenance' ? classes.active : classes.inactive}`}
                                        onPress={() =>
                                            // setVesselTab('maintenance')
                                            setVesselTab(
                                                vesselTab == 'maintenance'
                                                    ? ''
                                                    : 'maintenance',
                                            )
                                        }>
                                        Maintenance
                                        {taskCounter > 0 && (
                                            <span className="text-xs font-normal border border-x-slred-1000 bg-slred-100 text-slred-800 rounded-full w-5 h-5 justify-center items-center ms-2 sm:flex hidden">
                                                {taskCounter}
                                            </span>
                                        )}
                                    </Button>
                                    {vesselTab === 'maintenance' && (
                                        <div className="lg:hidden block">
                                            <SeaLogsButton
                                                text="New task"
                                                type="primary"
                                                icon="check"
                                                color="slblue"
                                                action={() => {
                                                    if (!edit_task) {
                                                        toast.error(
                                                            'You do not have permission to edit this section',
                                                        )
                                                        return
                                                    }
                                                    router.push(
                                                        '/maintenance/new?vesselID=' +
                                                            vesselId +
                                                            '&redirectTo=' +
                                                            pathname +
                                                            '?' +
                                                            searchParams.toString(),
                                                    )
                                                }}
                                                className="w-fit text-nowrap"
                                            />
                                        </div>
                                    )}
                                </div>
                                {vesselTab === 'maintenance' && (
                                    <div className=" lg:hidden block overflow-x-auto my-4">
                                        {maintenanceTasks?.length > 0 ? (
                                            <Table
                                                maintenanceChecks={
                                                    maintenanceTasks
                                                }
                                                vessels={[vessel]}
                                                crewInfo={taskCrewInfo}
                                                showVessel={true}
                                            />
                                        ) : (
                                            <div className="flex justify-center items-center h-96">
                                                <div className="flex flex-col items-center">
                                                    <div className="flex justify-between items-center gap-2 p-2 pt-4">
                                                        <div>
                                                            <svg
                                                                className="!w-[100px] h-auto"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 148.02 147.99">
                                                                <path
                                                                    d="M70.84.56c16-.53,30.66,3.59,43.98,12.35,12.12,8.24,21.1,19.09,26.92,32.55,6.14,14.85,7.38,30.11,3.74,45.78-3.92,15.59-11.95,28.57-24.1,38.96-13.11,10.9-28.24,16.66-45.39,17.28-16.75.33-31.88-4.39-45.39-14.17-13.29-9.92-22.34-22.84-27.16-38.76-4.03-14.16-3.9-28.29.39-42.38,5-15.45,14-27.97,27.01-37.6C42.77,5.97,56.1,1.31,70.84.56Z"
                                                                    fill="#fefefe"
                                                                    fillRule="evenodd"
                                                                    stroke="#024450"
                                                                    strokeMiterlimit="10"
                                                                    strokeWidth="1.02px"
                                                                />
                                                                <path
                                                                    d="M63.03,13.61c1.74.02,3.47.13,5.19.32,2.15.26,4.31.51,6.46.78,1.18.34,2.08,1.04,2.69,2.11.56,1,.85,2.06.87,3.2,1.5,2.89,2.99,5.79,4.47,8.69.09.17.19.32.32.46,1.72,1.08,3.12,2.48,4.2,4.2.42.79.72,1.63.9,2.5-.04.01-.07.04-.1.07.58,1.01.64,2.04.17,3.11-.47.88-1.1,1.62-1.92,2.21-1.17.81-2.44,1.45-3.79,1.92-.07.56-.13,1.13-.17,1.7,0,.86-.03,1.72-.1,2.57-.14.56-.42,1.04-.85,1.43-.38.3-.8.39-1.26.27-.01,1.92-.46,3.73-1.33,5.44-.59,2.66-1.36,5.27-2.33,7.82-.4,1.04-.96,1.99-1.67,2.84-.36-.12-.73-.2-1.12-.27-.28,0-.53.08-.78.22-.23.16-.45.33-.68.49-.83.87-1.67,1.73-2.52,2.57-.78.67-1.68,1.03-2.72,1.09-.09-.26-.18-.52-.27-.78-.26-.26-.58-.43-.95-.51-1.68-.23-3.27.06-4.76.87-.28.24-.56.48-.85.7-.95-1.87-2.36-3.27-4.25-4.2-.37-.14-.74-.25-1.12-.34-.42-.03-.84-.03-1.26,0-.19.06-.38.1-.58.1-.58-.66-1.04-1.39-1.38-2.21-1.11-2.73-1.98-5.53-2.62-8.4-.89-1.7-1.33-3.51-1.33-5.44-.97.14-1.64-.25-2.01-1.17-.12-.3-.2-.6-.24-.92-.01-.76-.03-1.52-.05-2.28-.02-.39-.07-.78-.15-1.17-1.41-.47-2.77-1.07-4.05-1.82-.82-.49-1.54-1.09-2.16-1.82-.66-.81-.93-1.73-.83-2.77.33-1.03.65-2.06.92-3.11.56-1.18,1.32-2.22,2.26-3.13,1.27-1.15,2.67-2.11,4.2-2.89,1.39-2.69,2.79-5.37,4.17-8.06.01-1.77.66-3.26,1.92-4.49.47-.39,1-.67,1.6-.83,3.29-.42,6.57-.79,9.85-1.09Z"
                                                                    fill="#052350"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M63.17,14.97c2.44.07,4.86.25,7.28.56,1.3.16,2.59.33,3.88.49.85.26,1.5.78,1.92,1.58.43.87.64,1.79.63,2.77,1.18,2.31,2.37,4.62,3.57,6.92-3.88-1.88-7.97-3.04-12.28-3.5-5.82-.65-11.53-.15-17.14,1.5-1.08.33-2.13.73-3.16,1.19l-.05-.05c1.01-2.01,2.04-4.02,3.08-6.02,0-1.18.3-2.26.92-3.25.41-.57.95-.95,1.63-1.14,3.23-.44,6.47-.78,9.71-1.04Z"
                                                                    fill="#2998e9"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M22.83,121.38c-.05.7-.06,1.42-.05,2.14h-1.31v-1.84c.04-6.98.54-13.92,1.48-20.82.54-4.01,1.44-7.94,2.67-11.8.83-2.63,2.05-5.06,3.64-7.28,1.23-1.49,2.67-2.74,4.32-3.74,0-.15-.03-.29-.12-.41,3.43-.91,6.85-1.76,10.29-2.55,2.46,6.94,4.9,13.88,7.33,20.82h25.63c2.42-6.97,4.87-13.93,7.35-20.87,1.78.46,3.56.91,5.34,1.36,1.34-2.25,3.04-4.21,5.1-5.87.78-4.96,2.07-9.78,3.88-14.47.65-1.62,1.43-3.17,2.33-4.66.76-1.21,1.68-2.27,2.79-3.18-1.36-.17-2.34-.88-2.94-2.11-.04-.09-.06-.19-.07-.29-2.47-.68-3.87-2.31-4.2-4.85-.2-2.64-.39-5.28-.58-7.91-.03-.54,0-1.09.07-1.63-.17-1.88.57-3.25,2.23-4.13,1.68-.73,3.36-1.46,5.05-2.18.39-.11.79-.17,1.19-.17,3.64.42,7.27.88,10.9,1.38,1.72.41,2.66,1.5,2.82,3.25-.02,1.36-.63,2.38-1.8,3.06,1.1,1.14,1.33,2.44.7,3.91-.33.64-.82,1.14-1.43,1.5,1.22,1.38,1.34,2.85.36,4.42-.31.42-.69.75-1.14,1,1.02,1.05,1.29,2.27.8,3.66-.77,1.59-2.04,2.3-3.81,2.11-.7-.09-1.39-.17-2.09-.24,1.17,1.13,2.15,2.4,2.94,3.81,1.95,3.61,3.36,7.43,4.22,11.46,2.2.83,4.31,1.85,6.33,3.03.89.53,1.66,1.2,2.31,2.01.7,1.3,1.09,2.69,1.17,4.17.08,2.03-.09,4.03-.53,6.02-.48,2.16-1.04,4.3-1.7,6.41-.79,2.37-1.56,4.75-2.33,7.14-.74.36-1.49.39-2.26.07-1.22-.53-2.31-1.25-3.28-2.16-1.78,5.28-4.16,10.26-7.14,14.95-.02.04-.03.09-.02.15,3.62.73,6.54,2.56,8.76,5.49,1.2,1.7,1.84,3.59,1.92,5.68,0,.23-.01.45-.02.68-.42.42-.93.64-1.53.66-1.25.03-2.48-.12-3.69-.44-2.04-.52-4.08-1.05-6.12-1.6-.88-.23-1.78-.37-2.69-.41-.84.03-1.68.16-2.5.36-1.96.52-3.91,1.04-5.87,1.55-.95.21-1.9.39-2.86.53-.49.03-.97.03-1.46,0-.49-.08-.9-.3-1.24-.66-.08-2.31.54-4.41,1.84-6.31,1.21-1.71,2.74-3.06,4.59-4.05.75-.38,1.51-.72,2.28-1.04-2.93-4.67-5.04-9.68-6.33-15.05-.58-2.67-.91-5.37-.97-8.11-.39.24-.79.48-1.19.7-.06.04-.1.1-.12.17-1.41,3.89-2.79,7.79-4.15,11.7h1.02c1.11,12.83,2.22,25.66,3.35,38.49h-56.89c1.1-12.83,2.22-25.66,3.35-38.49.39.01.78,0,1.17-.05-1.95-5.48-3.88-10.97-5.8-16.46-.03-.04-.08-.05-.12-.02-1.95,1.22-3.53,2.82-4.73,4.78-1.06,1.86-1.92,3.82-2.57,5.87-.84,2.72-1.51,5.49-1.99,8.3-.9,5.53-1.47,11.1-1.7,16.7-.09,2.12-.15,4.24-.17,6.36Z"
                                                                    fill="#052350"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M60.99,25.7c4.24-.18,8.43.18,12.57,1.09,2.09.5,4.11,1.17,6.07,2.04,2.05.9,3.86,2.16,5.41,3.76.3.38.58.77.85,1.17-1.92-1.08-3.96-1.91-6.12-2.5-4.32-1.11-8.7-1.74-13.15-1.89-5.41-.23-10.78.09-16.12.97-2.72.53-5.36,1.34-7.91,2.43-.62.33-1.24.65-1.84.97.76-1.17,1.71-2.16,2.86-2.96,2.19-1.5,4.57-2.61,7.14-3.35,3.35-.98,6.76-1.56,10.24-1.72Z"
                                                                    fill="#fdfdfd"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M103.75,26.28c1.16-.16,2.11.22,2.84,1.12.64,1.04.61,2.06-.1,3.06-.2.24-.44.44-.7.61-1.53.69-3.07,1.37-4.61,2.04-.38.15-.77.28-1.17.39-.11.09-.19.19-.27.32,0,.77.24,1.45.73,2.04.29.28.59.53.9.78-1.35,1.23-1.62,2.67-.8,4.32.28.46.65.84,1.09,1.14-.75.57-1.19,1.32-1.31,2.26-1.73-.68-2.64-1.96-2.74-3.83-.19-2.49-.37-4.98-.53-7.48.06-.89.08-1.78.05-2.67.18-.77.61-1.36,1.29-1.77,1.78-.79,3.56-1.55,5.34-2.31Z"
                                                                    fill="#fefefe"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M107.73,26.67c2.3.3,4.59.6,6.89.9,1.21.16,1.87.84,1.99,2.04-.12,1.31-.83,2-2.16,2.06-2.2-.25-4.39-.54-6.58-.87.52-1.02.63-2.09.32-3.2-.13-.33-.28-.63-.46-.92Z"
                                                                    fill="#fefefe"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M51.08,48.56c-.66-.05-1.32-.06-1.99-.05v-6.02c1.29-1.06,2.2-2.39,2.74-3.98.79-2.34,1.25-4.76,1.38-7.23,6.35-.8,12.71-.84,19.08-.12.66.1,1.33.2,1.99.29.15,1.96.45,3.89.9,5.8.37,1.45.98,2.79,1.8,4.03.23.32.49.61.75.9.25.22.52.42.8.61.02,1.91.05,3.82.07,5.73-.65,0-1.3,0-1.94.02-1.31,1.17-2.84,1.72-4.61,1.65-.6,0-1.11-.24-1.5-.68-4.45-.03-8.9-.03-13.35,0-.2.29-.48.47-.83.53-2.01.37-3.77-.12-5.29-1.48Z"
                                                                    fill="#fefefe"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M51.62,31.57h.19v.29c-.15,2.42-.67,4.75-1.58,6.99-.28.64-.65,1.22-1.09,1.75-.05-2.84-.06-5.69-.05-8.54.83-.19,1.67-.35,2.52-.49Z"
                                                                    fill="#fefefe"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M75.7,31.77c.93.14,1.85.32,2.77.53,0,2.88,0,5.76-.02,8.64-.59-.73-1.06-1.54-1.41-2.43-.77-2.18-1.21-4.43-1.33-6.75Z"
                                                                    fill="#fdfdfd"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M106.67,32.06c2.43.31,4.85.63,7.28.95,1.17.17,1.82.84,1.94,2.01-.13,1.26-.82,1.96-2.09,2.09-3.63-.46-7.25-.92-10.87-1.38-.76-.11-1.33-.5-1.7-1.17,1.57-.72,3.16-1.42,4.76-2.09.25-.1.48-.24.68-.41Z"
                                                                    fill="#fdfdfd"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M47.59,32.45c.06.5.1,1.02.1,1.55s-.01,1.04-.05,1.55c-1.54-.26-2.47.37-2.79,1.89-.05.4-.07.81-.07,1.21.04,1.09.13,2.17.24,3.25-.01.06-.03.13-.05.19-1.51-.5-2.9-1.22-4.17-2.16-1.83-1.54-1.81-3.06.05-4.56,1.6-1.13,3.35-1.97,5.24-2.52.5-.14,1-.28,1.5-.41Z"
                                                                    fill="#fdfdfd"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M80.02,32.74c1.93.51,3.72,1.32,5.39,2.4.65.47,1.17,1.04,1.58,1.72.26.66.21,1.29-.15,1.89-.26.41-.58.77-.95,1.09-.99.74-2.05,1.35-3.2,1.82-.01-.07-.03-.15-.05-.22.14-1.25.2-2.5.17-3.76-.23-1.67-1.18-2.38-2.84-2.14-.01-.95,0-1.88.05-2.82Z"
                                                                    fill="#fdfdfd"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M46.76,36.82c.28-.06.5.02.66.24.11.21.19.44.24.68.03,3.02.03,6.05,0,9.08-.02.32-.12.61-.29.87-.2.21-.36.17-.49-.1-.08-.16-.15-.32-.19-.49,0-1.69-.11-3.37-.34-5.05-.07-.92-.14-1.84-.19-2.77-.03-.52-.03-1.03,0-1.55.03-.43.24-.74.61-.92Z"
                                                                    fill="#fdfdfd"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M80.4,36.82c.54-.08.87.15,1,.68.05.39.08.78.07,1.17-.12,2.11-.29,4.21-.51,6.31-.01.69-.03,1.39-.05,2.09-.31,1.03-.61,1.03-.92,0-.03-3.14-.03-6.28,0-9.42.04-.33.18-.6.41-.83Z"
                                                                    fill="#fdfdfd"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M103.12,37.2c.55,0,1.1.03,1.65.12,3,.38,5.99.79,8.98,1.21,1.03.45,1.48,1.23,1.33,2.35-.34,1.04-1.06,1.57-2.16,1.6-3.32-.39-6.64-.83-9.95-1.29-1.32-.53-1.76-1.48-1.33-2.84.34-.58.84-.97,1.48-1.17Z"
                                                                    fill="#fefefe"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M55.6,39.73c.69-.09,1.19.19,1.48.83.11,1.07-.36,1.6-1.43,1.58-.75-.26-1.05-.79-.9-1.58.16-.41.44-.69.85-.83Z"
                                                                    fill="#052350"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M71.38,39.73c1.1-.05,1.6.46,1.48,1.55-.26.65-.73.93-1.43.85-.72-.26-1.01-.77-.9-1.53.16-.41.45-.7.85-.87Z"
                                                                    fill="#052350"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M103.36,42.74c.28,0,.55,0,.83.02,2.9.37,5.8.76,8.69,1.17,1.14.43,1.61,1.25,1.43,2.45-.36,1.01-1.08,1.53-2.16,1.55-2.95-.37-5.89-.76-8.83-1.14-1.35-.44-1.86-1.35-1.53-2.74.33-.68.85-1.12,1.58-1.31Z"
                                                                    fill="#fdfdfd"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M105.6,48.71c.77-.03,1.48.16,2.14.56,1.03.7,1.89,1.57,2.6,2.6,1.44,2.18,2.58,4.51,3.45,6.99.51,1.49.98,3,1.38,4.51-1.76,1.45-3.78,2.26-6.07,2.45-3.98.14-7.17-1.35-9.59-4.49-.36-.52-.68-1.08-.97-1.65.8-2.72,1.93-5.29,3.4-7.72.5-.78,1.07-1.5,1.72-2.16.56-.53,1.21-.89,1.94-1.09Z"
                                                                    fill="#fefefe"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M48.95,49.87c.55,0,1.1,0,1.65.02,1.75,1.37,3.72,1.87,5.92,1.5.46-.12.88-.31,1.26-.58,4.06-.03,8.12-.03,12.18,0,.52.39,1.1.62,1.75.68,1.66.14,3.21-.2,4.66-1.02.28-.17.53-.36.78-.58.52-.02,1.03-.03,1.55-.02-.09,1.5-.48,2.9-1.19,4.22-.62,2.83-1.46,5.6-2.52,8.3-.2.41-.41.82-.63,1.21-.76-.1-1.48.04-2.16.41-.31.19-.6.4-.87.63-.83.87-1.66,1.73-2.52,2.57-.28.23-.58.42-.92.56-.21-.14-.41-.31-.58-.51-.8-.47-1.66-.69-2.6-.66-1.14.03-2.25.23-3.33.61-.29.12-.56.25-.83.41-1.09-1.47-2.45-2.61-4.08-3.42-.96-.41-1.96-.59-3.01-.53-.3-.48-.56-.97-.8-1.48-1.02-2.64-1.84-5.34-2.48-8.11-.69-1.33-1.11-2.73-1.24-4.22Z"
                                                                    fill="#2998e9"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M56.08,52.16h15.63c.1,3.78-1.57,6.45-5,7.99-3.43,1.14-6.36.38-8.81-2.26-1.34-1.67-1.95-3.58-1.82-5.73Z"
                                                                    fill="#052350"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M57.44,53.52h12.82c-.34,2.61-1.73,4.42-4.17,5.41-2.78.86-5.16.23-7.16-1.87-.87-1.02-1.36-2.2-1.48-3.54Z"
                                                                    fill="#fefefe"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M108.07,57.98c.73-.04,1.2.28,1.43.97.07.73-.25,1.2-.95,1.43-.78.06-1.25-.28-1.43-1.04-.02-.68.3-1.14.95-1.36Z"
                                                                    fill="#052350"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M97.93,61.43c2.16,3.27,5.21,5.17,9.13,5.7,3.08.26,5.88-.5,8.4-2.26,1.31,5.5,1.83,11.09,1.58,16.75-.43,4.08-1.4,8.03-2.91,11.84-1.9,4.73-4.25,9.21-7.04,13.45-.02.04-.03.09-.02.15,2.96.22,5.6,1.25,7.91,3.08,2.18,1.83,3.39,4.17,3.64,7.01-.91.1-1.82.04-2.72-.17-2.26-.54-4.51-1.13-6.75-1.75-1.06-.25-2.14-.42-3.23-.51-.95.04-1.87.18-2.79.41-2.31.61-4.63,1.2-6.94,1.8-.49.09-.97.17-1.46.24-.48.04-.96.03-1.43-.02.05-1.6.51-3.07,1.36-4.42,1.47-2.19,3.43-3.77,5.9-4.73.72-.26,1.45-.49,2.18-.68.02-.02.04-.04.05-.07-3.76-5.59-6.28-11.71-7.55-18.35-.46-2.83-.61-5.68-.44-8.54.33-6.44,1.37-12.75,3.13-18.93Z"
                                                                    fill="#fefefe"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M117.1,65.84c1.84.71,3.6,1.58,5.29,2.6.69.4,1.3.91,1.82,1.53.56,1.06.89,2.19.97,3.4.07,1.36,0,2.72-.19,4.08-.41,2.46-1,4.89-1.75,7.28-.77,2.41-1.54,4.82-2.31,7.23-.27.02-.53-.02-.78-.12-1.2-.58-2.27-1.33-3.23-2.26.18-.88.39-1.75.63-2.62.85-3.74,1.13-7.53.83-11.36-.18-3.29-.62-6.54-1.29-9.76Z"
                                                                    fill="#fefefe"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M74.34,66.33h.24c.19,1.79.56,3.53,1.09,5.24.11.25.22.5.32.75-.36.23-.74.44-1.14.61-.17-.24-.3-.5-.39-.78-.63-1.84-1-3.73-1.14-5.66.34-.05.68-.11,1.02-.17Z"
                                                                    fill="#052350"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M53.32,66.43c.44.04.87.09,1.31.15-.18,1.61-.48,3.19-.9,4.76-.21.64-.46,1.25-.75,1.84-.4-.18-.79-.4-1.17-.63.42-.98.76-1.98,1-3.01.2-1.03.37-2.07.51-3.11Z"
                                                                    fill="#052350"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M94.09,72.59s.05.1.05.17c-.44,2.97-.69,5.96-.75,8.96-1.2.85-2.49,1.55-3.86,2.11-.23.09-.48.15-.73.17-.14-1.48.05-2.92.56-4.32.83-2.16,2.02-4.1,3.54-5.83.39-.43.79-.85,1.19-1.26Z"
                                                                    fill="#fdfdfd"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M47.25,75.84h1.31c-.01.11,0,.2.05.29.07,1.56.51,3,1.33,4.32,1.4,2.09,3.23,3.67,5.51,4.73,4.67,2.1,9.46,2.42,14.37.97,2.59-.78,4.83-2.11,6.72-4,1.37-1.45,2.23-3.16,2.57-5.15.04-.39.07-.78.07-1.17h1.36c-.09,2.63-1,4.93-2.74,6.89-2.24,2.39-4.95,4.01-8.13,4.88-4.65,1.22-9.21.98-13.69-.73-2.73-1.09-4.99-2.79-6.77-5.12-1.26-1.77-1.92-3.74-1.97-5.92Z"
                                                                    fill="#052350"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M42.78,76.62s.09,0,.12.05c3.03,8.57,6.04,17.15,9.03,25.73.06,1.62-.66,2.74-2.16,3.37-1.72.65-3.31.43-4.76-.68-.38-.33-.66-.72-.85-1.19-2.97-8.44-5.93-16.88-8.91-25.31.02-.04.05-.08.1-.1,2.49-.59,4.97-1.21,7.43-1.87Z"
                                                                    fill="#2998e9"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M84.92,76.62c1.28.33,2.55.66,3.83.97-.54,1.17-.93,2.38-1.19,3.64-.23,1.22-.22,2.45.02,3.66.28.32.63.48,1.07.46.57-.04,1.12-.17,1.65-.39.01.02.03.05.05.07-2.3,6.42-4.6,12.83-6.92,19.25-.78,1.11-1.85,1.72-3.23,1.82-1.5.11-2.75-.38-3.76-1.48-.56-.74-.74-1.57-.53-2.48,2.99-8.52,5.99-17.03,9-25.53Z"
                                                                    fill="#2998e9"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M51.57,97.25c8.22-.03,16.42,0,24.61.1-.56,1.55-1.1,3.1-1.63,4.66-.25,1.9.4,3.39,1.97,4.49,1.5.93,3.13,1.19,4.85.78,1.23-.34,2.25-1.01,3.03-2.01.2-.29.36-.59.49-.92.85-2.36,1.68-4.72,2.5-7.09h.34c1.03,11.84,2.05,23.69,3.06,35.53v.24h-53.88v-.24c1-11.84,2.02-23.69,3.06-35.53.16-.01.31,0,.46.05.84,2.39,1.68,4.79,2.52,7.18.53,1.13,1.36,1.95,2.5,2.45,1.63.67,3.26.68,4.9.05,2.14-.96,3.1-2.6,2.89-4.93-.53-1.61-1.09-3.21-1.67-4.81Z"
                                                                    fill="#2998e9"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M47.59,100.16c1.54-.14,2.53.52,2.99,1.99.13,1.48-.51,2.45-1.92,2.89-1.13.17-2-.21-2.65-1.14-.64-1.3-.41-2.41.7-3.33.28-.18.57-.32.87-.41Z"
                                                                    fill="#052350"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M79.14,100.16c1.43-.15,2.4.45,2.89,1.8.26,1.42-.27,2.41-1.58,2.99-1.51.37-2.57-.16-3.18-1.58-.31-1.63.31-2.69,1.87-3.2Z"
                                                                    fill="#052350"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M52.01,106.13h23.69c0,6.7,0,13.4-.02,20.1-.32,2.21-1.54,3.66-3.66,4.34-.28.04-.55.09-.83.15-4.92.03-9.84.03-14.76,0-2.51-.47-3.98-1.97-4.39-4.49-.02-6.7-.03-13.4-.02-20.1Z"
                                                                    fill="#052350"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M74.34,107.49c0,6.25,0,12.49-.02,18.74-.33,1.73-1.35,2.78-3.08,3.13-4.94.03-9.87.03-14.81,0-1.9-.43-2.92-1.62-3.06-3.57v-18.3h20.97Z"
                                                                    fill="#2998e9"
                                                                    fillRule="evenodd"
                                                                    strokeWidth="0px"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <p className="text-white text-xs font-light">
                                                            Holy mackerel! You
                                                            are up to date with
                                                            all your
                                                            maintenance. Only
                                                            thing left to do is,
                                                            to go fishing
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                            <li id="crew" className={classes.tabsUlLi}>
                                <div className="flex flex-row gap-2">
                                    <Button
                                        className={`${vesselTab === 'crew' ? classes.active : classes.inactive}`}
                                        onPress={() =>
                                            setVesselTab(
                                                vesselTab == 'crew'
                                                    ? ''
                                                    : 'crew',
                                            )
                                        }>
                                        Crew
                                    </Button>
                                </div>
                                {vesselTab === 'crew' && !imCrew && (
                                    <div className="block lg:hidden my-4">
                                        {crewInfo?.length > 0 && (
                                            <CrewTable
                                                crewList={crewInfo}
                                                vessels={[vessel]}
                                                showSurname={false}
                                            />
                                        )}
                                        {!crewInfo?.length && (
                                            <div className="flex justify-center items-center h-96">
                                                <div className="flex flex-col items-center">
                                                    <div className="text-3xl font-light dark:text-white">
                                                        Crew
                                                    </div>
                                                    <div className="flex justify-between items-center gap-2 p-2 pt-4">
                                                        <div>
                                                            <svg
                                                                className="!w-[100px] h-auto"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 147 147.01">
                                                                <path
                                                                    d="M72.45,0c17.26-.07,32.68,5.12,46.29,15.56,10.6,8.39,18.38,18.88,23.35,31.47,5.08,13.45,6.21,27.23,3.41,41.34-3.23,15.08-10.38,27.92-21.44,38.52-12.22,11.42-26.69,18.01-43.44,19.78-15.66,1.42-30.31-1.75-43.95-9.52-13.11-7.73-22.98-18.44-29.61-32.13C.9,91.82-1.22,77.98.67,63.51c2.36-16.12,9.17-29.98,20.44-41.58C33.25,9.78,47.91,2.63,65.08.49c2.46-.27,4.91-.43,7.37-.49Z"
                                                                    fill="#ffffff"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M72.45,0c17.26-.07,32.68,5.12,46.29,15.56,10.6,8.39,18.38,18.88,23.35,31.47,5.08,13.45,6.21,27.23,3.41,41.34-3.23,15.08-10.38,27.92-21.44,38.52-12.22,11.42-26.69,18.01-43.44,19.78-15.66,1.42-30.31-1.75-43.95-9.52-13.11-7.73-22.98-18.44-29.61-32.13C.9,91.82-1.22,77.98.67,63.51c2.36-16.12,9.17-29.98,20.44-41.58C33.25,9.78,47.91,2.63,65.08.49c2.46-.27,4.91-.43,7.37-.49ZM82.49,19.46c-2.01-1.1-4.14-1.85-6.39-2.26-1.42-.15-2.84-.35-4.25-.61-1.46-.26-2.79-.81-4.01-1.63l-.35-.35c-.29-.53-.6-1.04-.93-1.54-.09.7-.16,1.41-.21,2.12.03.4.08.8.16,1.19.13.44.27.88.44,1.31-.5-.61-.86-1.29-1.1-2.05-.08-.4-.17-.78-.28-1.17-1.72.92-2.73,2.36-3.03,4.29-.15,1.3-.07,2.59.26,3.85-.01,0-.03.01-.05.02-1.2-.58-2.25-1.38-3.15-2.38-.35-.41-.7-.83-1.03-1.26-3.65,4.71-4.58,9.92-2.8,15.63.22.67.48,1.32.77,1.96-.88.9-1.32,1.99-1.31,3.27.07,2.46.06,4.91-.05,7.37,0,.73.15,1.41.49,2.05.5.66,1.14.84,1.91.51.04,1.08.14,2.15.28,3.22.32,1.6.91,3.09,1.77,4.48,1.02,1.69,2.3,3.17,3.83,4.43.03,2.55-.21,5.07-.75,7.56-.25,1.08-.6,2.12-1.07,3.13-.06-.82-.08-1.65-.07-2.47-3.51,1.06-7.03,2.13-10.55,3.2-.05.18-.05.35,0,.54-3,1.03-5.75,2.5-8.26,4.41-2.49,1.95-4.29,4.41-5.39,7.4-1.44,3.7-2.48,7.51-3.13,11.43-.85,5.13-1.39,10.29-1.59,15.49-.28,6.88-.27,13.75.05,20.62-11.85-8.19-20.56-18.94-26.13-32.24C1.06,87.19-.22,73.03,2.77,58.47c3.41-15.3,10.86-28.21,22.37-38.71C37.53,8.77,52.05,2.64,68.68,1.38c16.31-.96,31.27,3.03,44.89,11.95,12.77,8.65,21.95,20.17,27.55,34.55,5.1,13.75,6.03,27.78,2.8,42.09-3.66,15.08-11.25,27.73-22.79,37.96-2.17,1.88-4.43,3.63-6.79,5.25.2-5.25.26-10.51.19-15.77-.08-6.3-.58-12.57-1.49-18.8-.61-4.17-1.64-8.23-3.08-12.18-.63-1.7-1.43-3.3-2.43-4.81-1.72-2.2-3.8-3.98-6.23-5.34-1.7-.97-3.47-1.78-5.32-2.43,0-.17,0-.34-.05-.51-3.51-1.07-7.03-2.14-10.55-3.2,0,.67,0,1.34-.02,2.01-.71-1.61-1.18-3.29-1.4-5.04-.28-1.92-.4-3.85-.37-5.79,3.51-3.05,5.38-6.9,5.6-11.57,1.09.43,1.85.11,2.29-.98.14-.36.23-.74.28-1.12.16-2.71.39-5.42.68-8.12.02-1.16-.35-2.16-1.12-3.01.72-2,.98-4.06.77-6.18-.23-3.02-.99-5.9-2.29-8.63-.25-.49-.6-.89-1.05-1.19-.9-.57-1.85-1.05-2.85-1.45-2.32-.93-4.66-1.69-7-2.29l2.94,2.1c.23.19.44.38.65.58ZM67.79,16.43c1.57.82,3.23,1.33,4.99,1.56,3.64.17,7,1.21,10.08,3.13.46.32.91.64,1.35.98.51.5,1.04.98,1.59,1.42-.16-.79-.37-1.58-.63-2.38-.2-.45-.44-.88-.72-1.28,1.17.37,2.29.87,3.36,1.49.51.3.88.73,1.1,1.28,1.49,3.35,2.14,6.85,1.96,10.5-.1,1.56-.58,3-1.45,4.29.18-3.13-.99-5.59-3.52-7.4-.08-.03-.15-.03-.23,0-4.07,1.24-8.23,2.1-12.46,2.57-2.13.23-4.26.21-6.39-.05-1.36-.17-2.6-.64-3.73-1.4-.21-.16-.4-.34-.58-.54-.19-.26-.38-.5-.58-.75-1.64.95-2.79,2.32-3.43,4.11-.3.85-.5,1.72-.61,2.61-1.41-2.86-1.97-5.88-1.68-9.05.29-2.38,1.11-4.56,2.45-6.53,1.01,1.13,2.2,2.04,3.55,2.73.78.31,1.59.5,2.43.58-.41-.98-.7-1.99-.86-3.03-.2-1.18-.11-2.33.28-3.45.21-.49.49-.92.84-1.31.7,1.83,1.95,3.13,3.76,3.9.83.28,1.67.51,2.52.7-.5-.54-1.01-1.07-1.52-1.61-.82-.9-1.43-1.93-1.84-3.08ZM59.06,37.38c.02-1.89.61-3.59,1.75-5.09.27-.27.54-.54.82-.79.95.91,2.07,1.54,3.36,1.89,1.62.42,3.27.61,4.95.58,2.57-.05,5.12-.3,7.65-.77,2.69-.48,5.34-1.11,7.96-1.89,1.99,1.57,2.86,3.62,2.64,6.16-1.77-1.75-3.9-2.51-6.39-2.26-.64.04-1.28.12-1.91.23-4.21.03-8.43.03-12.65,0-1.36-.26-2.73-.32-4.11-.19-1.57.32-2.92,1.02-4.06,2.12ZM70.63,36.68c1.94-.06,3.88-.06,5.83-.02-.65.41-1.14.96-1.47,1.66-.32-.55-.8-.86-1.42-.93-.27,0-.52.07-.75.21-.28.21-.51.45-.7.72-.34-.7-.84-1.24-1.49-1.63ZM90.65,37.75s.08,0,.12.05c.4.71.54,1.47.42,2.29-.28,2.48-.5,4.97-.65,7.47-.04.39-.17.75-.37,1.07-.05.06-.12.1-.19.14-.28-.12-.54-.28-.75-.51-.03-.92-.03-1.83,0-2.75.77-1.63.95-3.33.56-5.09-.1-.38-.23-.76-.4-1.12.48-.47.9-.98,1.26-1.54ZM57.06,37.8c.07.02.13.07.16.14.14.28.29.54.47.79.03.23.03.47,0,.7-.64,1.67-.7,3.37-.19,5.09,0,1.24.03,2.47.07,3.71-.01.07-.03.14-.05.21-.18.14-.38.25-.61.33-.16-.06-.26-.16-.3-.33-.14-.39-.21-.8-.21-1.21.1-2.4.12-4.81.05-7.21-.03-.81.18-1.54.61-2.22ZM73.48,38.59c.14,0,.26.07.35.19.37.52.63,1.1.79,1.73.35,2.87,1.61,5.26,3.76,7.16,2.84,2.21,5.77,2.32,8.77.33.28-.22.56-.47.82-.72.41,6.51-2.13,11.48-7.63,14.91-3.24,1.68-6.66,2.21-10.27,1.61-2.37-.47-4.43-1.5-6.21-3.1-1.87-1.68-3.29-3.69-4.27-6-.48-1.29-.73-2.63-.75-4.01-.08-1.29-.11-2.58-.09-3.87,1.68,1.94,3.8,2.78,6.37,2.54,1.8-.35,3.31-1.2,4.55-2.54,1.55-1.71,2.48-3.72,2.8-6.02.16-.82.49-1.55,1-2.19ZM64.1,51.47h18.76c-.31,3.1-1.75,5.51-4.34,7.21-3.33,1.93-6.68,1.95-10.03.05-2.64-1.7-4.1-4.12-4.39-7.26ZM82.3,62.29s.06.05.07.09c.02,2.8.39,5.56,1.12,8.26.37,1.28.92,2.46,1.66,3.55-.38,3.03-1.34,5.86-2.87,8.49-1.97,3.15-4.79,5.04-8.47,5.67-2.56-.19-4.8-1.12-6.72-2.8-1.84-1.76-3.19-3.85-4.04-6.28-.56-1.56-.95-3.17-1.17-4.81.49-.6.88-1.27,1.17-2.01.74-1.94,1.2-3.95,1.4-6.02.13-1.16.2-2.33.23-3.5.03-.04.07-.05.12-.02,1.95,1.3,4.09,2.05,6.44,2.24,3.31.29,6.45-.3,9.43-1.77.58-.32,1.12-.69,1.63-1.1ZM95.83,75.08c2.89,1.03,5.53,2.49,7.93,4.36,1.73,1.39,3.07,3.07,4.04,5.06,1.47,3.25,2.56,6.62,3.27,10.13.98,4.87,1.62,9.78,1.91,14.74.51,8.23.53,16.46.05,24.68-13.72,8.81-28.73,12.66-45.05,11.55-12.33-.99-23.66-4.84-33.99-11.55-.43-8.31-.4-16.62.09-24.92.3-4.98.95-9.91,1.96-14.79.66-3.2,1.64-6.29,2.94-9.29.87-2.03,2.14-3.76,3.8-5.2,2.48-2.08,5.27-3.66,8.35-4.74.6,6.75.21,13.43-1.14,20.06-.41,2.14-.95,4.24-1.63,6.3-.38,1.08-.89,2.1-1.54,3.03-.28.33-.6.6-.96.82-.16.08-.34.13-.51.16v16.8h56.27v-16.8c-.58-.15-1.05-.46-1.42-.93-.7-.99-1.25-2.06-1.63-3.22-.74-2.26-1.31-4.56-1.73-6.91-1-4.99-1.41-10.03-1.21-15.12.04-1.42.11-2.83.21-4.25Z"
                                                                    fill="#052350"
                                                                    fillRule="evenodd"
                                                                    opacity=".97"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M63.78,35.74c1.14,0,2.28.1,3.41.28v.61c1.76-.37,3.17.15,4.22,1.59.16.27.28.56.35.86-.17.49-.33.98-.47,1.47.18.08.36.13.56.14-.38,2.99-1.8,5.34-4.25,7.07-2.68,1.56-5.23,1.37-7.65-.56-1.64-1.53-2.37-3.42-2.17-5.67.14-1.59.81-2.92,1.98-3.99,1.16-1,2.5-1.6,4.01-1.8Z"
                                                                    fill="#2998e9"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M82.07,35.74c2.41-.13,4.41.71,6,2.52,1.27,1.71,1.65,3.61,1.12,5.69-.71,2.39-2.25,3.93-4.64,4.64-1.35.35-2.68.26-3.97-.28-1.83-.89-3.23-2.23-4.18-4.04-.65-1.19-1.03-2.47-1.14-3.83.19-.02.37-.06.56-.09-.11-.45-.25-.9-.42-1.33.23-.83.72-1.47,1.45-1.91.3-.18.61-.34.93-.47.71-.02,1.43-.03,2.15-.02v-.61c.72-.11,1.44-.2,2.15-.28Z"
                                                                    fill="#2998e9"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M65.55,40.6c.97,0,1.45.48,1.42,1.45-.23.75-.73,1.07-1.52.96-.66-.27-.95-.76-.86-1.47.16-.48.48-.79.96-.93Z"
                                                                    fill="#024450"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M81.18,40.6c.7-.04,1.18.28,1.42.93.06,1.08-.45,1.57-1.52,1.47-.81-.37-1.05-.97-.72-1.8.21-.3.48-.5.82-.61Z"
                                                                    fill="#052451"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M62.84,50.25h21.23c.1,3.78-1.35,6.8-4.34,9.08-3,2.03-6.23,2.51-9.71,1.45-3.65-1.35-5.96-3.91-6.93-7.68-.18-.94-.27-1.89-.26-2.85ZM64.1,51.47c.29,3.14,1.75,5.56,4.39,7.26,3.35,1.9,6.7,1.89,10.03-.05,2.59-1.7,4.03-4.11,4.34-7.21h-18.76Z"
                                                                    fill="#052250"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M73.2,89.54c.19.06.37.06.56,0,4.36-.67,7.63-2.91,9.82-6.72,1.49-2.78,2.43-5.73,2.8-8.87l.21-2.24c2.7.85,5.4,1.68,8.12,2.47-.29,3.81-.36,7.62-.21,11.43.33,4.44,1.02,8.83,2.05,13.16.46,1.91,1.12,3.75,2.01,5.51.3.54.67,1.03,1.1,1.47.22.21.48.39.75.54v14.79h-53.85v-14.79c.54-.3.98-.7,1.33-1.21.56-.85,1.03-1.75,1.4-2.71.97-2.75,1.68-5.57,2.15-8.45.95-5.12,1.31-10.28,1.07-15.49-.04-1.36-.13-2.73-.26-4.08.01-.06.03-.11.05-.16,2.69-.83,5.38-1.66,8.07-2.47.16,3.36.91,6.58,2.26,9.66,1.25,2.77,3.15,4.96,5.72,6.56,1.51.86,3.13,1.4,4.85,1.61Z"
                                                                    fill="#2998e9"
                                                                    strokeWidth="0px"
                                                                />
                                                                <path
                                                                    d="M45.34,125.8h23.84v6.63h-23.84v-6.63Z"
                                                                    fill="#052350"
                                                                    strokeWidth="0"
                                                                />
                                                                <path
                                                                    d="M70.17,125.8h6.58v6.63h-6.58v-6.63Z"
                                                                    fill="#052250"
                                                                    strokeWidth="0"
                                                                />
                                                                <path
                                                                    d="M77.77,125.8h23.84v6.63h-23.84v-6.63Z"
                                                                    fill="#052350"
                                                                    strokeWidth="0"
                                                                />
                                                                <path
                                                                    d="M67.98,127.01v4.2h-21.42v-4.2h21.42Z"
                                                                    fill="#2a99ea"
                                                                    strokeWidth="0"
                                                                />
                                                                <path
                                                                    d="M75.58,127.01v4.2h-4.2v-4.2h4.2Z"
                                                                    fill="#2a99ea"
                                                                    strokeWidth="0"
                                                                />
                                                                <path
                                                                    d="M78.99,127.01h21.42v4.2h-21.42v-4.2Z"
                                                                    fill="#2a99ea"
                                                                    strokeWidth="0"
                                                                />
                                                                <path
                                                                    d="M64.1,51.47h18.76c-.31,3.1-1.75,5.51-4.34,7.21-3.33,1.93-6.68,1.95-10.03.05-2.64-1.7-4.1-4.12-4.39-7.26Z"
                                                                    fill="#ffffff"
                                                                    strokeWidth="0"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <p className="text-white text-xs font-light">
                                                            WOW! Look at that!
                                                            All your crew are
                                                            ship-shaped and
                                                            trained to the
                                                            gills. Great job,
                                                            captain!
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                            <li id="crewTraining" className={classes.tabsUlLi}>
                                <div className="flex flex-row gap-2">
                                    <Button
                                        className={`${vesselTab === 'crew_training' ? classes.active : classes.inactive}`}
                                        onPress={() =>
                                            // setVesselTab('crew_training')
                                            setVesselTab(
                                                vesselTab == 'crew_training'
                                                    ? ''
                                                    : 'crew_training',
                                            )
                                        }>
                                        Training
                                        {trainingSessionDues.length > 0 && (
                                            <span className="text-xs font-normal border border-x-slred-1000 bg-slred-100 text-slred-800 rounded-full w-5 h-5 justify-center items-center ms-2 sm:flex hidden">
                                                {trainingSessionDues.length}
                                            </span>
                                        )}
                                    </Button>
                                    {vesselTab === 'crew_training' && (
                                        <div className="lg:hidden block">
                                            <SeaLogsButton
                                                text="Add training"
                                                type="primary"
                                                icon="check"
                                                color="slblue"
                                                link={`/crew-training/create?vesselID=${vesselId}`}
                                                className="w-fit text-nowrap"
                                            />
                                        </div>
                                    )}
                                </div>
                                {vesselTab === 'crew_training' &&
                                    trainingSessions?.length > 0 && (
                                        <div className=" lg:hidden block">
                                            <TrainingList
                                                trainingList={trainingSessions}
                                                trainingSessionDues={
                                                    trainingSessionDues
                                                }
                                                isVesselView={true}
                                            />
                                        </div>
                                    )}
                            </li>
                            <li id="inventory" className={classes.tabsUlLi}>
                                <div className="flex flex-row gap-2">
                                    <Button
                                        className={`${vesselTab === 'inventory' ? classes.active : classes.inactive}`}
                                        onPress={() =>
                                            // setVesselTab('inventory')
                                            setVesselTab(
                                                vesselTab == 'inventory'
                                                    ? ''
                                                    : 'inventory',
                                            )
                                        }>
                                        Inventory
                                    </Button>
                                    {vesselTab === 'inventory' && !imCrew && (
                                        <div className="sm:hidden block">
                                            <SeaLogsButton
                                                text="Add Inventory"
                                                type="primary"
                                                icon="check"
                                                color="slblue"
                                                link={`/inventory/new?vesselID=${vesselId}`}
                                            />
                                        </div>
                                    )}
                                </div>
                                {vesselTab === 'inventory' && (
                                    <div className=" lg:hidden block">
                                        {inventories?.length > 0 ? (
                                            <InventortList
                                                inventories={inventories}
                                                currentCategory={0}
                                                isVesselView={true}
                                            />
                                        ) : (
                                            <div className="flex justify-center items-center h-96">
                                                <div className="flex flex-col items-center">
                                                    <div className="text-3xl font-light dark:text-white">
                                                        Inventory
                                                    </div>
                                                    <div className="text-2xl font-light dark:text-white">
                                                        No data available
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                            <li id="documents" className={classes.tabsUlLi}>
                                <Button
                                    className={`${vesselTab === 'documents' ? classes.active : classes.inactive}`}
                                    onPress={() =>
                                        // setVesselTab('documents')
                                        setVesselTab(
                                            vesselTab == 'documents'
                                                ? ''
                                                : 'documents',
                                        )
                                    }>
                                    Documents
                                </Button>
                                {vesselTab === 'documents' && (
                                    <div className="flex flex-row gap-6 sm:hidden">
                                        {!imCrew && edit_docs && (
                                            <FileUpload
                                                setDocuments={setDocuments}
                                                text=""
                                                subText="Drag files here or upload"
                                                documents={documents}
                                            />
                                        )}
                                        <div className="block !min-w-5/8">
                                            {documents.length > 0 ? (
                                                <ListBox
                                                    aria-label="Documents"
                                                    className={``}>
                                                    {documents.map(
                                                        (document: any) => (
                                                            <ListBoxItem
                                                                key={
                                                                    document.id
                                                                }
                                                                textValue={
                                                                    document.name
                                                                }
                                                                className="items-center gap-8 justify-between p-2.5 bg-slblue-50 rounded-lg border border-slblue-300 dark:bg-slblue-800 dark:border-slblue-600 dark:placeholder-slblue-400 dark:text-white mb-4 hover:bg-slblue-1000 sm:flex hidden">
                                                                <FileItem
                                                                    document={
                                                                        document
                                                                    }
                                                                    hideTitle
                                                                />
                                                                <Button
                                                                    className="flex gap-2 items-center"
                                                                    onPress={() => {
                                                                        if (
                                                                            !delete_docs
                                                                        ) {
                                                                            toast.error(
                                                                                'You do not have permission to delete this document',
                                                                            )
                                                                            return
                                                                        }
                                                                        deleteFile(
                                                                            document.id,
                                                                        )
                                                                    }}>
                                                                    <XCircleIcon className="w-5 h-5 text-red-500 cursor-pointer" />
                                                                </Button>
                                                            </ListBoxItem>
                                                        ),
                                                    )}
                                                </ListBox>
                                            ) : (
                                                <div className="flex justify-center items-center h-40">
                                                    <div className="flex flex-col items-center">
                                                        <div className="text-3xl font-light">
                                                            Documents
                                                        </div>
                                                        <div className="text-2xl font-light">
                                                            No documents
                                                            available
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </li>
                        </ul>
                    </div>
                    <ul className="hidden lg:inline-block text-sm font-medium text-center text-slblue-800 dark:text-slblue-100 gap-2 mb-0 ">
                        {vesselTab === 'info' && !imCrew && (
                            <li>
                                <SeaLogsButton
                                    text="Edit"
                                    type="info"
                                    icon="pencil"
                                    color="slblue"
                                    link={`/vessel/edit?id=${vesselId}`}
                                />
                            </li>
                        )}
                        {vesselTab === 'maintenance' && (
                            <li>
                                <SeaLogsButton
                                    text="New Task"
                                    type="primary"
                                    icon="check"
                                    color="slblue"
                                    action={() => {
                                        if (!edit_task) {
                                            toast.error(
                                                'You do not have permission to edit this section',
                                            )
                                            return
                                        }
                                        router.push(
                                            '/maintenance/new?vesselID=' +
                                                vesselId +
                                                '&redirectTo=' +
                                                pathname +
                                                '?' +
                                                searchParams.toString(),
                                        )
                                    }}
                                />
                            </li>
                        )}
                        {vesselTab === 'crew_training' && (
                            <li>
                                <SeaLogsButton
                                    text="Add Training"
                                    type="primary"
                                    icon="check"
                                    color="slblue"
                                    link={`/crew-training/create?vesselID=${vesselId}`}
                                />
                            </li>
                        )}
                        {logbooks.filter(
                            (entry: any) => entry.state !== 'Locked',
                        ).length > 0 ? (
                            <div className="invisible"></div>
                        ) : (
                            <div>
                                {vesselTab === 'logEntries' && !imCrew && (
                                    <li className="hidden sm:inline-block">
                                        <SeaLogsButton
                                            text="New log entry"
                                            type="primary"
                                            action={handleCreateNewLogEntry}
                                            icon="new_logbook"
                                            color="sldarkblue"
                                            isDisabled={isNewLogEntryDisabled}
                                        />
                                    </li>
                                )}
                            </div>
                        )}
                        {vesselTab === 'crew' && !imCrew && (
                            <li>
                                <SeaLogsButton
                                    text="Add crew"
                                    type="primary"
                                    icon="check"
                                    color="slblue"
                                    action={() => {
                                        setVesselCrewIDs(
                                            vessel?.seaLogsMembers?.nodes.map(
                                                (crew: any) => crew.id,
                                            ),
                                        )
                                        setDisplayAddCrew(true)
                                    }}
                                />
                            </li>
                        )}
                        {vesselTab === 'inventory' && !imCrew && (
                            <li>
                                <SeaLogsButton
                                    text="Add Inventory"
                                    type="primary"
                                    icon="check"
                                    color="slblue"
                                    link={`/inventory/new?vesselID=${vesselId}`}
                                />
                            </li>
                        )}
                    </ul>
                </div>

                {vesselTab === 'info' && (
                    <div className="hidden lg:block pt-2 lg:pt-0">
                        <div className="rounded-lg">
                            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 px-4 font-light text-sm">
                                <div className="pt-2">
                                    <div className="text-2xl font-bold ">
                                        {vessel?.title || <Skeleton />}
                                    </div>
                                    <br />
                                    <small>
                                        {vessel?.vesselTypeDescription}
                                    </small>
                                    <div className="pl-2 mt-4 max-w-[25rem]">
                                        <ul className="leading-loose mb-4 md:mb-0">
                                            {vessel?.registration && (
                                                <li className="flex">
                                                    <strong>
                                                        Authority No. (MNZ,
                                                        AMSA):
                                                    </strong>
                                                    &nbsp;
                                                    {vessel?.registration}
                                                </li>
                                            )}
                                            {vessel?.transitID && (
                                                <li className="flex">
                                                    <strong>
                                                        Transit identifier:
                                                    </strong>
                                                    &nbsp;
                                                    {vessel?.transitID}
                                                </li>
                                            )}
                                            {vessel?.mmsi && (
                                                <li className="flex">
                                                    <strong>MMSI:</strong>
                                                    &nbsp;
                                                    {vessel?.mmsi}
                                                </li>
                                            )}
                                            {vessel?.callSign && (
                                                <li className="flex">
                                                    <strong>Call sign:</strong>
                                                    &nbsp;{vessel?.callSign}
                                                </li>
                                            )}
                                            <li className="flex text-sm leading-loose font-light border-t border-slblue-200 mt-2 pt-2 w-2/3">
                                                <strong>Primary harbor:</strong>
                                                &nbsp;
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.primaryHarbour
                                                }
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-span-2 block bg-sldarkblue-100 border border-slblue-200 rounded-lg dark:bg-sldarkblue-800">
                                    <div className="pt-8 pb-5 px-7 lg:flex md:flex gap-3 flex-col lg:flex-row md:flex-row">
                                        <div className="lg:w-1/3 md:w-1/3 w-full">
                                            <label htmlFor="vessel-beam">
                                                <strong>Vessel beam:</strong>
                                                &nbsp;
                                                {vessel?.vesselSpecifics?.beam}
                                            </label>
                                        </div>
                                        <div className="lg:w-1/3 md:w-1/3 w-full">
                                            <label htmlFor="vessel-overallLength">
                                                <strong>Length overall:</strong>
                                                &nbsp;
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.overallLength
                                                }
                                            </label>
                                        </div>
                                        <div className="lg:w-1/3 md:w-1/3 w-full">
                                            <label htmlFor="vessel-draft">
                                                <strong>Draft:</strong>
                                                &nbsp;
                                                {vessel?.vesselSpecifics?.draft}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="pb-5 px-7 flex gap-3">
                                        <div className="w-full">
                                            <label htmlFor="vessel-dateOfBuild">
                                                <strong>Date of build:</strong>
                                                &nbsp;
                                                {formatDate(
                                                    vessel?.vesselSpecifics
                                                        ?.dateOfBuild,
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="pb-4 px-7 lg:flex gap-3 md:flex flex-col lg:flex-row md:flex-row">
                                        <div className="lg:w-1/3 md:w-1/3 w-full">
                                            <label htmlFor="vessel-hullColor">
                                                <strong>Hull color:</strong>
                                                &nbsp;
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.hullColor
                                                }
                                            </label>
                                        </div>
                                        <div className="lg:w-2/3 md:w-2/3 w-full">
                                            <label htmlFor="vessel-hullConstruction">
                                                <strong>
                                                    Hull construction:
                                                </strong>
                                                &nbsp;
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.hullConstruction
                                                }
                                            </label>
                                        </div>
                                    </div>
                                    <div className="pb-8 pt-4 border-t border-t-slblue-100 mx-7 lg:flex md:flex lg:gap-3 md:gap-3 flex-col lg:flex-row md:flex-row">
                                        <div className="lg:w-1/3 md:w-1/3 w-full">
                                            <label htmlFor="vessel-minCrew">
                                                <strong>
                                                    Minimum required crew:
                                                </strong>
                                                &nbsp;{vessel?.minCrew}
                                            </label>
                                        </div>
                                        <div className="lg:w-1/3 md:w-1/3 w-full">
                                            <label htmlFor="vessel-minCrew">
                                                <strong>
                                                    Max passengers allowed:
                                                </strong>
                                                &nbsp;{vessel?.maxPax}
                                            </label>
                                        </div>
                                        <div className="lg:w-1/3 md:w-1/3 w-full">
                                            <label htmlFor="vessel-minCrew">
                                                <strong>
                                                    Max people on board:
                                                </strong>
                                                &nbsp;{vessel?.maxPOB}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Engine details */}
                        <div className="py-8 border-t border-slblue-200 mt-8 font-light text-sm">
                            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 px-4">
                                <div className="pt-2 text-base font-normal">
                                    {vessel?.registration && (
                                        <>
                                            Details of engine
                                            {engineList?.length > 1 && 's'}
                                        </>
                                    )}
                                </div>
                                <div className="col-span-2 block bg-white pt-8 px-7 pb-5 border border-slblue-200 rounded-lg dark:bg-sldarkblue-800 dark:text-slblue-200">
                                    {engineList?.length > 0 && (
                                        <div className="pb-4 pt-4">
                                            {engineList.map(
                                                (
                                                    engine: any,
                                                    index: number,
                                                ) => (
                                                    <div
                                                        key={engine.id}
                                                        className="mb-4 pb-4">
                                                        <div className="lg:flex md:flex lg:flex-row md:flex-row flex-col lg:gap-4 md:gap-4">
                                                            <div className="dark:text-slblue-200 w-48 inline-block">
                                                                <span className="font-semibold">
                                                                    {
                                                                        engine.title
                                                                    }
                                                                </span>
                                                                <br />
                                                                {engine.identifier !=
                                                                    null && (
                                                                    <div className="ml-2 font-light text-xs text-slblue-700 dark:text-slblue-200 ">
                                                                        <>
                                                                            (
                                                                            {
                                                                                engine.identifier
                                                                            }
                                                                            ):
                                                                        </>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="dark:text-slblue-200 flex flex-cols-2 leading-loose gap-12">
                                                                <ul>
                                                                    <li className="flex">
                                                                        <label
                                                                            htmlFor="vessel-positonOnVessel"
                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                            <strong>
                                                                                Position
                                                                                on
                                                                                vessel:
                                                                            </strong>
                                                                            &nbsp;
                                                                        </label>
                                                                        {
                                                                            engine.positionOnVessel
                                                                        }
                                                                    </li>
                                                                    <li className="flex">
                                                                        <label
                                                                            htmlFor="vessel-type"
                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                            <strong>
                                                                                Engine
                                                                                type:
                                                                            </strong>
                                                                            &nbsp;
                                                                        </label>
                                                                        {
                                                                            engine.type
                                                                        }
                                                                    </li>
                                                                    <li className="flex">
                                                                        <label
                                                                            htmlFor="vessel-currentHours"
                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                            <strong>
                                                                                Current
                                                                                engine
                                                                                hours:
                                                                            </strong>
                                                                            &nbsp;
                                                                        </label>
                                                                        {
                                                                            engine.currentHours
                                                                        }
                                                                    </li>
                                                                    <li className="flex">
                                                                        <label
                                                                            htmlFor="vessel-makeModel"
                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                            <strong>
                                                                                Engine
                                                                                make
                                                                                &
                                                                                model:
                                                                            </strong>
                                                                            &nbsp;
                                                                        </label>
                                                                        {
                                                                            engine.make
                                                                        }
                                                                        &nbsp;
                                                                        {
                                                                            engine.model
                                                                        }
                                                                    </li>
                                                                    <li className="flex">
                                                                        <label
                                                                            htmlFor="vessel-driveType"
                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                            <strong>
                                                                                Drive
                                                                                type:
                                                                            </strong>
                                                                            &nbsp;
                                                                        </label>
                                                                        {
                                                                            engine.driveType
                                                                        }
                                                                    </li>
                                                                    <li className="flex">
                                                                        <label
                                                                            htmlFor="vessel-kVA"
                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                            <strong>
                                                                                Genset
                                                                                kilovolt-amperes
                                                                                (kVA):
                                                                            </strong>
                                                                            &nbsp;
                                                                        </label>
                                                                        {
                                                                            engine.kVA
                                                                        }
                                                                    </li>
                                                                    <li className="flex">
                                                                        <label
                                                                            htmlFor="vessel-kw"
                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                            <strong>
                                                                                Engine
                                                                                kilowatts
                                                                                (kW):
                                                                            </strong>
                                                                            &nbsp;
                                                                        </label>
                                                                        {
                                                                            engine.kW
                                                                        }
                                                                    </li>
                                                                    <li className="flex">
                                                                        <label
                                                                            htmlFor="vessel-maxPower"
                                                                            className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                                            <strong>
                                                                                Max
                                                                                power:
                                                                            </strong>
                                                                            &nbsp;
                                                                        </label>
                                                                        {
                                                                            engine.maxPower
                                                                        }
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        {engineList?.length >
                                                            1 && (
                                                            <div className="border-t border-t-slblue-100 mt-5"></div>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fuel tank details */}
                        <div className="py-8 border-t border-slblue-200 mt-8 font-light text-sm">
                            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 px-4">
                                <div className="pt-2 text-base font-normal">
                                    {fuelTankList?.length > 0 && (
                                        <>
                                            Fuel tank
                                            {fuelTankList?.length > 1 && 's'}:
                                        </>
                                    )}
                                </div>
                                <div className="col-span-2 block bg-white pt-8 px-7 pb-5 border border-slblue-200 rounded-lg dark:bg-sldarkblue-800 dark:text-slblue-200">
                                    {fuelTankList?.length > 0 && (
                                        <div className="pb-4 pt-4">
                                            {fuelTankList.map(
                                                (tank: any, index: number) => (
                                                    <div
                                                        key={tank.id}
                                                        className="mb-4 pb-4">
                                                        <div className="flex gap-4">
                                                            <div className="dark:text-slblue-200 w-48 inline-block">
                                                                <span className="font-semibold">
                                                                    {tank.title}
                                                                </span>
                                                                <br />
                                                                {tank.identifier !=
                                                                    null && (
                                                                    <div className="ml-2 font-light text-xs text-slblue-700 dark:text-slblue-200">
                                                                        <>
                                                                            (
                                                                            {
                                                                                tank.identifier
                                                                            }
                                                                            ):
                                                                        </>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="dark:text-slblue-200 flex flex-cols-2 leading-loose gap-12">
                                                                <ul>
                                                                    <li>
                                                                        <label
                                                                            htmlFor="vessel-capacity"
                                                                            className="w-72 inline-block">
                                                                            <strong>
                                                                                Fuel
                                                                                tank
                                                                                capacity:
                                                                            </strong>
                                                                            &nbsp;
                                                                        </label>
                                                                        {
                                                                            tank.capacity
                                                                        }
                                                                    </li>
                                                                    <li>
                                                                        <label
                                                                            htmlFor="vessel-safeFuelCapacity"
                                                                            className="w-72 inline-block">
                                                                            <strong>
                                                                                Safe
                                                                                fuel
                                                                                level:
                                                                            </strong>
                                                                            &nbsp;
                                                                        </label>
                                                                        {
                                                                            tank.safeFuelCapacity
                                                                        }
                                                                    </li>
                                                                    <li>
                                                                        <label
                                                                            htmlFor="vessel-currentLevel"
                                                                            className="w-72 inline-block">
                                                                            <strong>
                                                                                Current
                                                                                fuel
                                                                                level:
                                                                            </strong>
                                                                            &nbsp;
                                                                        </label>
                                                                        {
                                                                            tank.currentLevel
                                                                        }
                                                                    </li>
                                                                    <li>
                                                                        <label
                                                                            htmlFor="vessel-fuelType"
                                                                            className="w-72 inline-block">
                                                                            <strong>
                                                                                Fuel
                                                                                type:
                                                                            </strong>
                                                                            &nbsp;
                                                                        </label>
                                                                        {
                                                                            tank.fuelType
                                                                        }
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        {fuelTankList?.length >
                                                            1 && (
                                                            <div className="border-t border-t-slblue-100 mt-5"></div>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Water tank details */}
                        <div className="py-8 border-t border-slblue-200 mt-8 font-light text-sm">
                            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 px-4">
                                <div className="pt-2 text-base font-normal">
                                    {waterTankList?.length > 0 && (
                                        <>
                                            Water tank
                                            {waterTankList?.length > 1 && 's'}:
                                        </>
                                    )}
                                </div>
                                <div className="col-span-2 block bg-white pt-8 px-7 pb-5 border border-slblue-200 rounded-lg dark:bg-sldarkblue-800 dark:text-slblue-200">
                                    {waterTankList?.length > 0 && (
                                        <div className="pb-4 pt-4">
                                            {waterTankList.map(
                                                (tank: any, index: number) => (
                                                    <div
                                                        key={tank.id}
                                                        className="mb-4 pb-4">
                                                        <div className="flex gap-4">
                                                            <div className="dark:text-slblue-200 w-48 inline-block">
                                                                <span className="font-semibold">
                                                                    {tank.title}
                                                                </span>
                                                                <br />
                                                                {tank.identifier !=
                                                                    null && (
                                                                    <div className="ml-2 font-light text-xs text-slblue-700 dark:text-slblue-200">
                                                                        {
                                                                            tank.identifier
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="dark:text-slblue-200 flex flex-cols-2 leading-loose gap-12">
                                                                <ul>
                                                                    <li>
                                                                        <label
                                                                            htmlFor="vessel-capacity"
                                                                            className="w-72 inline-block">
                                                                            <strong>
                                                                                Water
                                                                                tank
                                                                                capacity:
                                                                            </strong>
                                                                            &nbsp;
                                                                        </label>
                                                                        {
                                                                            tank.capacity
                                                                        }
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        {waterTankList?.length >
                                                            1 && (
                                                            <div className="border-t border-t-slblue-100 mt-5"></div>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sullage details */}
                        <div className="py-8 border-t border-slblue-200 mt-8 font-light text-sm">
                            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 px-4">
                                <div className="pt-2 text-base font-normal">
                                    {sewageSystemList?.length > 0 && (
                                        <>
                                            Sullage system
                                            {sewageSystemList?.length > 1 &&
                                                's'}
                                            :
                                        </>
                                    )}
                                </div>
                                <div className="col-span-2 block bg-white pt-8 px-7 pb-5 border border-slblue-200 rounded-lg dark:bg-sldarkblue-800 dark:text-slblue-200">
                                    {sewageSystemList?.length > 0 && (
                                        <div className="pb-4 pt-4">
                                            {sewageSystemList.map(
                                                (
                                                    system: any,
                                                    index: number,
                                                ) => (
                                                    <div
                                                        key={system.id}
                                                        className="mb-4 pb-4">
                                                        <div className="flex gap-4">
                                                            <div className="dark:text-slblue-200 w-48 inline-block">
                                                                <span className="font-semibold">
                                                                    {
                                                                        system.title
                                                                    }
                                                                </span>
                                                                <br />
                                                                {system.identifier !=
                                                                    null && (
                                                                    <div className="ml-2 font-light text-xs text-slblue-700 dark:text-slblue-200">
                                                                        <>
                                                                            (
                                                                            {
                                                                                system.identifier
                                                                            }
                                                                            ):
                                                                        </>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="dark:text-slblue-200 flex flex-cols-2 leading-loose gap-12">
                                                                <ul>
                                                                    <li>
                                                                        <label
                                                                            htmlFor="vessel-systemCapacity"
                                                                            className="w-72 inline-block">
                                                                            <strong>
                                                                                System
                                                                                capacity:
                                                                            </strong>
                                                                            &nbsp;
                                                                        </label>
                                                                        {
                                                                            system.capacity
                                                                        }
                                                                    </li>
                                                                    <li>
                                                                        <label
                                                                            htmlFor="vessel-numberOfTanks"
                                                                            className="w-72 inline-block">
                                                                            <strong>
                                                                                Number
                                                                                of
                                                                                tanks:
                                                                            </strong>
                                                                            &nbsp;
                                                                        </label>
                                                                        {
                                                                            system.numberOfTanks
                                                                        }
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        {sewageSystemList?.length >
                                                            1 && (
                                                            <div className="border-t border-t-slblue-100 mt-5"></div>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Other details */}
                        <div className="py-8 border-t border-slblue-200 mt-8 font-light text-sm">
                            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 px-4">
                                <div className="pt-2 text-base font-normal">
                                    Other vessel details
                                </div>
                                <div className="col-span-2 block bg-white pt-8 px-7 pb-5 border border-slblue-200 rounded-lg dark:bg-sldarkblue-800 dark:text-slblue-200">
                                    <div className="dark:text-slblue-200 flex flex-cols-2 leading-9 gap-12">
                                        <ul>
                                            {/* {vessel.vesselSpecifics.portOfRegistry && ( */}
                                            <li className="flex">
                                                <label
                                                    htmlFor="vessel-portOfRegistry"
                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                    <strong>
                                                        Port of registry:
                                                    </strong>
                                                    &nbsp;
                                                </label>
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.portOfRegistry
                                                }
                                            </li>
                                            {/* {vessel.vesselSpecifics.registeredLength && ( */}
                                            <li className="flex">
                                                <label
                                                    htmlFor="vessel-registeredLength"
                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                    <strong>
                                                        Registered length:
                                                    </strong>
                                                    &nbsp;
                                                </label>
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.registeredLength
                                                }
                                            </li>
                                            {/* {vessel.vesselSpecifics.tonnageLength && ( */}
                                            <li className="flex">
                                                <label
                                                    htmlFor="vessel-tonnageLength"
                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                    <strong>
                                                        Tonnage length:
                                                    </strong>
                                                    &nbsp;
                                                </label>
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.tonnageLength
                                                }
                                            </li>
                                            {/* {vessel.vesselSpecifics.maxCargoLoad && ( */}
                                            <li className="flex">
                                                <label
                                                    htmlFor="vessel-grossTonnage"
                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                    <strong>
                                                        Gross tonnage:
                                                    </strong>
                                                    &nbsp;
                                                </label>
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.grossTonnage
                                                }
                                            </li>
                                            {/* {vessel.vesselSpecifics.netTonnage && ( */}
                                            <li className="flex">
                                                <label
                                                    htmlFor="vessel-netTonnage"
                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                    <strong>
                                                        Net tonnage:
                                                    </strong>
                                                    &nbsp;
                                                </label>
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.netTonnage
                                                }
                                            </li>
                                            {/* {vessel.vesselSpecifics.maxCargoLoad && ( */}
                                            <li className="flex">
                                                <label
                                                    htmlFor="vessel-maxCargoLoad"
                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                    <strong>
                                                        Max cargo load:
                                                    </strong>
                                                    &nbsp;
                                                </label>
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.maxCargoLoad
                                                }
                                            </li>
                                            {/* {vessel.vesselSpecifics.capacityOfLifting && ( */}
                                            <li className="flex">
                                                <label
                                                    htmlFor="vessel-capacityOfLifting"
                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                    <strong>
                                                        Capacity of lifting:
                                                    </strong>
                                                    &nbsp;
                                                </label>
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.capacityOfLifting
                                                }
                                            </li>
                                            {/* {vessel.vesselSpecifics.loadLineLength && ( */}
                                            <li className="flex">
                                                <label
                                                    htmlFor="vessel-loadLineLength"
                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                    <strong>
                                                        Load line length:
                                                    </strong>
                                                    &nbsp;
                                                </label>
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.loadLineLength
                                                }
                                            </li>
                                            {/* {vessel.vesselSpecifics.specialLimitations && ( */}
                                            <li className="flex">
                                                <label
                                                    htmlFor="vessel-specialLimitations"
                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                    <strong>
                                                        Special limitations:
                                                    </strong>
                                                    &nbsp;
                                                </label>
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.specialLimitations
                                                }
                                            </li>
                                            {/* {vessel.vesselSpecifics.operatingAreaLimits && ( */}
                                            <li className="flex">
                                                <label
                                                    htmlFor="vessel-operatingAreaLimits"
                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block">
                                                    <strong>
                                                        Operating area limits:
                                                    </strong>
                                                    &nbsp;
                                                </label>
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.operatingAreaLimits
                                                }
                                            </li>
                                            {/* {vessel.vesselSpecifics.fishingNumber && ( */}
                                            <li className="flex">
                                                <label
                                                    htmlFor="vessel-fishingNumber"
                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block sm:inline-block hidden">
                                                    <strong>
                                                        Fishing Number:
                                                    </strong>
                                                    &nbsp;
                                                </label>
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.fishingNumber
                                                }
                                            </li>
                                            {/* {vessel.vesselSpecifics.carriesDangerousGoods && ( */}
                                            <li className="flex">
                                                <label
                                                    htmlFor="vessel-carriesDangerousGoods"
                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block sm:inline-block hidden">
                                                    <strong>
                                                        Carriers dangerous
                                                        goods:
                                                    </strong>
                                                    &nbsp;
                                                </label>
                                                {vessel?.vesselSpecifics
                                                    ?.carriesDangerousGoods == 0
                                                    ? 'No'
                                                    : 'Yes'}
                                            </li>
                                            {/* {vessel.vesselSpecifics.designApprovalNumber && ( */}
                                            <li className="flex">
                                                <label
                                                    htmlFor="vessel-designApprovalNumber"
                                                    className="lg:w-72 md:w-72 lg:inline-block md:inline-block sm:inline-block hidden">
                                                    <strong>
                                                        Design approval number:
                                                    </strong>
                                                    &nbsp;
                                                </label>
                                                {
                                                    vessel?.vesselSpecifics
                                                        ?.designApprovalNumber
                                                }
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {vesselTab === 'maintenance' && (
                    <div className="hidden lg:block pt-2 lg:pt-0">
                        {maintenanceTasks?.length > 0 ? (
                            <Table
                                maintenanceChecks={maintenanceTasks}
                                vessels={[vessel]}
                                crewInfo={taskCrewInfo}
                                showVessel={true}
                            />
                        ) : (
                            <div className="flex justify-center items-center h-96">
                                <div className="flex flex-col items-center">
                                    <div className="text-3xl font-light dark:text-white">
                                        Maintenance
                                    </div>
                                    <div className="text-2xl font-light dark:text-white">
                                        No data available
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {vesselTab === 'logEntries' && (
                    <div className="hidden lg:block pt-4 lg:pt-0">
                        <LogEntryList logbooks={logbooks} vesselID={vesselId} />
                        {logbooks.length > 0 && totalEntries > perPage && (
                            <div className="flex items-center justify-end p-4">
                                <nav aria-label="Log Entries pagination">
                                    <ul className="inline-flex -space-x-px text-base h-10">
                                        <li>
                                            <Button
                                                aria-current="page"
                                                className={`${classes.paginationButtons} rounded-s-lg`}
                                                onPress={() =>
                                                    handlePagination(
                                                        currentPage - 1,
                                                    )
                                                }>
                                                Previous
                                            </Button>
                                        </li>
                                        {Array.from(
                                            {
                                                length: Math.ceil(
                                                    totalEntries / perPage,
                                                ),
                                            },
                                            (_, i) => (
                                                <li key={i}>
                                                    <Button
                                                        className={`${currentPage === i ? classes.paginationActive : classes.paginationInactive}`}
                                                        onPress={() =>
                                                            handlePagination(i)
                                                        }>
                                                        {i + 1}
                                                    </Button>
                                                </li>
                                            ),
                                        )}
                                        <li>
                                            <Button
                                                className={`${classes.paginationButtons} rounded-e-lg`}
                                                onPress={() =>
                                                    handlePagination(
                                                        currentPage + 1,
                                                    )
                                                }>
                                                Next
                                            </Button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                )}
                {vesselTab === 'crew' && (
                    <div className="hidden lg:block">
                        {crewInfo?.length > 0 && (
                            <CrewTable
                                crewList={crewInfo}
                                vessels={[vessel]}
                                showSurname={false}
                            />
                        )}
                        {!crewInfo?.length && (
                            <div className="flex justify-center items-center h-96">
                                <div className="flex flex-col items-center">
                                    <div className="text-3xl font-light dark:text-white">
                                        Crew
                                    </div>
                                    <div className="text-2xl font-light dark:text-white">
                                        No data available
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {vesselTab === 'crew_training' &&
                    trainingSessions?.length > 0 && (
                        <div className="lg:block hidden">
                            <TrainingList
                                trainingList={trainingSessions}
                                trainingSessionDues={trainingSessionDues}
                                isVesselView={true}
                            />
                        </div>
                    )}
                {vesselTab === 'inventory' && (
                    <div className="sm:block hidden">
                        {inventories?.length > 0 ? (
                            <div className="lg:block hidden">
                                <InventortList
                                    inventories={inventories}
                                    currentCategory={0}
                                    isVesselView={true}
                                />
                            </div>
                        ) : (
                            <div className="flex justify-center items-center h-96">
                                <div className="flex flex-col items-center">
                                    <div className="text-3xl font-light dark:text-white">
                                        Inventory
                                    </div>
                                    <div className="text-2xl font-light dark:text-white">
                                        No data available
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {vesselTab === 'documents' && (
                    <div>
                        <div className="hidden lg:grid grid-cols-6 gap-4 pb-4">
                            <div className="col-span-3">
                                {!imCrew && edit_docs && (
                                    <FileUpload
                                        setDocuments={setDocuments}
                                        text=""
                                        subText="Drag files here or upload"
                                        documents={documents}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="hidden lg:grid w-full">
                            {documents.length > 0 ? (
                                /**/
                                <TableWrapper headings={[]}>
                                    <tr>
                                        <td className="hidden md:table-cell p-3 border-b border-slblue-200 w-auto text-end">
                                            <label
                                                className={`${classes.label} !w-full`}>
                                                Upload date
                                            </label>
                                            <label
                                                className={`${classes.label} !w-full ml-5`}>
                                                Delete
                                            </label>
                                        </td>
                                    </tr>
                                    {documents.map((document: any) => (
                                        <tr
                                            key={document.id}
                                            className={`border-b border-sldarkblue-50 even:bg-sllightblue-50/50 dark:border-slblue-50 hover:bg-sllightblue-50 dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                            <ListBox
                                                aria-label="Documents"
                                                className={``}>
                                                {documents.map(
                                                    (document: any) => (
                                                        <ListBoxItem
                                                            key={document.id}
                                                            textValue={
                                                                document.name
                                                            }
                                                            className="flex items-center gap-4 justify-between p-3 bg-slblue-50 rounded-lg border border-slblue-200 dark:bg-slblue-800 dark:border-slblue-600 dark:placeholder-slblue-400 m-2 hover:bg-slblue-1000">
                                                            <FileItem
                                                                document={
                                                                    document
                                                                }
                                                            />
                                                            <div
                                                                className="flex gap-2 items-center"
                                                                onClick={() => {
                                                                    if (
                                                                        !delete_docs
                                                                    ) {
                                                                        toast.error(
                                                                            'You do not have permission to delete this document',
                                                                        )
                                                                        return
                                                                    }
                                                                    deleteFile(
                                                                        document.id,
                                                                    )
                                                                }}>
                                                                <span className="">
                                                                    {formatDate(
                                                                        document.created,
                                                                    )}
                                                                </span>
                                                                <SeaLogsButton
                                                                    icon="cross_icon"
                                                                    className="w-6 h-6 sup ml-7 mb-2.5 cursor-pointer"
                                                                    action={() =>
                                                                        deleteFile(
                                                                            document.id,
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </ListBoxItem>
                                                    ),
                                                )}
                                            </ListBox>
                                        </tr>
                                    ))}
                                </TableWrapper>
                            ) : (
                                <div className="flex justify-center items-center">
                                    <div className="flex flex-col items-center">
                                        <div className="text-3xl font-light dark:text-white">
                                            Documents
                                        </div>
                                        <div className="text-2xl font-light dark:text-white">
                                            No documents available
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <AlertDialog
                openDialog={displayAddCrew}
                setOpenDialog={setDisplayAddCrew}
                handleCreate={handleUpdateVesselCrew}
                actionText="Add Crew">
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2 text-slblue-700 dark:text-slblue-200">
                    Add Crew
                </Heading>
                <div className="flex items-center mt-4">
                    {vessel && (
                        <CrewMultiSelectDropdown
                            value={vesselCrewIDs}
                            onChange={handleOnChangeVesselCrew}
                            departments={vessel?.departments?.nodes}
                        />
                    )}
                </div>
            </AlertDialog>
            <div className="">
                <FooterWrapper
                    noBorder={true}
                    className="hidden md:flex flex-row">
                    <SeaLogsButton
                        text="Cancel"
                        type="text"
                        action={() => router.back()}
                    />
                    {!imCrew && (
                        <DialogTrigger>
                            <SeaLogsButton
                                text="Edit"
                                type="info"
                                icon="pencil"
                                color="slblue"
                            />
                            <Popover>
                                <PopoverWrapper>
                                    <div className="flex flex-col items-start">
                                        <SeaLogsButton
                                            link={`/vessel/edit?id=${vesselId}`}
                                            text="Edit Vessel"
                                            type="text"
                                            className={`hover:bg-sllightblue-100 rounded-md hover:text-slblue-800 w-full !justify-start p-1`}
                                        />
                                        {vessel?.logBookID > 0 && (
                                            <SeaLogsButton
                                                link={`/vessel/logbook-configuration?logBookID=${vessel.logBookID}&vesselID=${vesselId}`}
                                                text="Edit Logbook Configuration"
                                                type="text"
                                                className={`hover:bg-sllightblue-100 hover:text-slbdarklue-1000 rounded-md w-full !justify-start p-1`}
                                            />
                                        )}
                                    </div>
                                </PopoverWrapper>
                            </Popover>
                        </DialogTrigger>
                    )}
                    {logbooks.filter((entry: any) => entry.state !== 'Locked')
                        .length > 0 ? (
                        <div className="invisible"></div>
                    ) : (
                        <div>
                            {!imCrew && (
                                <SeaLogsButton
                                    text="New log entry"
                                    type="secondary"
                                    icon="new_logbook"
                                    color="slblue"
                                    action={handleCreateNewLogEntry}
                                />
                            )}
                        </div>
                    )}
                    {vesselTab === 'crew' && !imCrew && (
                        <SeaLogsButton
                            text="Add crew"
                            type="primary"
                            icon="check"
                            color="slblue"
                            action={() => {
                                setVesselCrewIDs(
                                    vessel?.seaLogsMembers?.nodes.map(
                                        (crew: any) => crew.id,
                                    ),
                                )
                                setDisplayAddCrew(true)
                            }}
                        />
                    )}
                    {vesselTab === 'maintenance' && (
                        <SeaLogsButton
                            text="Add task"
                            type="primary"
                            icon="check"
                            color="slblue"
                            link={`/maintenance/new?vesselID=${vesselId}&redirect_to=${pathname}?${searchParams.toString()}`}
                        />
                    )}
                    {vesselTab === 'crew_training' && (
                        <SeaLogsButton
                            text="Add Training"
                            type="primary"
                            icon="check"
                            color="slblue"
                            link={`/crew-training/create?vesselID=${vesselId}`}
                        />
                    )}
                    {vesselTab === 'inventory' && !imCrew && (
                        <SeaLogsButton
                            text="Add Inventory"
                            type="primary"
                            icon="check"
                            color="slblue"
                            link={`/inventory/new?vesselID=${vesselId}`}
                        />
                    )}
                </FooterWrapper>
            </div>

            <Toaster position="top-right" />
        </div>
    )
}
