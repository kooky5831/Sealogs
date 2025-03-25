'use client'

import React, { use, useEffect, useState } from 'react'
import { Button } from 'react-aria-components'
import Safety from '../daily-checks/safety'
import Cleaning from '../daily-checks/cleaning'
import JetSpecific from '../daily-checks/jet-specific'
import DailyEngineChecks from '../daily-checks/engine'
import PropulsionSteeringElectrical from '../daily-checks/propulsion-steering-electrical'
import FuelSystem from '../daily-checks/fuel-system'
import NavigationEquipments from '../daily-checks/navigation-eqipments'
import Hull from '../daily-checks/hull'
import Plumbing from '../daily-checks/plumbing'
import Documentation from '../daily-checks/documentation'
import Hvac from '../daily-checks/hvac'
import Sail from '../daily-checks/sail'
import WeatherConditions from '../daily-checks/weather'
import { getSectionMemberComments } from '@/app/lib/actions'
import {
    CREATE_COMPONENT_MAINTENANCE_CHECK,
    CreateVesselDailyCheck_LogBookEntrySection,
} from '@/app/lib/graphQL/mutation'
import { useLazyQuery, useMutation } from '@apollo/client'
import { useSearchParams } from 'next/navigation'
import { GET_SECTION_MEMBER_COMMENTS } from '@/app/lib/graphQL/query'
import SlidingPanel from 'react-sliding-side-panel'
import 'react-sliding-side-panel/lib/index.css'
import dayjs from 'dayjs'
import Task from '../maintenance/task'
import toast, { Toaster } from 'react-hot-toast'
import { classes } from '@/app/components/GlobalClasses'
import SectionMemberCommentModel from '@/app/offline/models/sectionMemberComment'
import VesselDailyCheck_LogBookEntrySectionModel from '@/app/offline/models/vesselDailyCheck_LogBookEntrySection'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import ComponentMaintenanceCheckModel from '@/app/offline/models/componentMaintenanceCheck'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'

export const tabClasses = {
    inactive:
        'inline-flex items-center px-4 py-3 my-1 border border-slblue-200 rounded-md hover:text-slblue-900 bg-slblue-100 hover:bg-slblue-1000 hover:text-white w-full dark:bg-slblue-800 dark:hover:bg-slblue-700 dark:hover:text-white ring-1 ring-transparent hover:ring-slblue-1000',
    active: 'inline-flex items-center px-4 py-3 my-1 border border-slblue-500 rounded-md text-sldarkblue-950 bg-slblue-300 !text-sldarkblue-950 w-full dark:bg-slblue-1000',
}
export default function DailyChecks({
    vesselDailyCheck = false,
    logBookConfig = false,
    setVesselDailyCheck = false,
    locked,
    offline = false,
    edit_logBookEntry,
}: {
    vesselDailyCheck: any
    logBookConfig: any
    setVesselDailyCheck: any
    locked: boolean
    offline?: boolean
    edit_logBookEntry: boolean
}) {
    const searchParams = useSearchParams()
    const vesselID = searchParams.get('vesselID') ?? 0
    const logentryID = searchParams.get('logentryID') ?? 0
    const secondTab = searchParams.get('secondTab') ?? 0
    const [tab, setTab] = useState('Safety Checks')
    const [comments, setComments] = useState<any>(false)
    const [openCreateTaskSidebar, setOpenCreateTaskSidebar] = useState(false)
    const [newTaskID, setNewTaskID] = useState(0)
    const sectionMemberCommentModel = new SectionMemberCommentModel()
    const vesselDailyCheckModel =
        new VesselDailyCheck_LogBookEntrySectionModel()
    const componentMaintenanceCheckModel = new ComponentMaintenanceCheckModel()

    const [permissions, setPermissions] = useState<any>(false)
    const [edit_dailyChecks, setEdit_dailyChecks] = useState<any>(false)
    const [edit_task, setEdit_task] = useState<any>(false)

    const init_permissions = () => {
        if (permissions) {
            if (hasPermission('EDIT_LOGBOKENTRY_DAILY_CHECKS', permissions)) {
                setEdit_dailyChecks(true)
            } else {
                setEdit_dailyChecks(false)
            }

            if (hasPermission('EDIT_TASK', permissions)) {
                setEdit_task(true)
            } else {
                setEdit_task(false)
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
            const logBookEntryID = vesselDailyCheck[0].id
            const data =
                await sectionMemberCommentModel.getByLogBookEntrySectionID(
                    vesselDailyCheck[0].id,
                )
            if (data) {
                setComments(data)
            }
        } else {
            await querySectionMemberComments({
                variables: {
                    filter: {
                        logBookEntrySectionID: { eq: vesselDailyCheck[0].id },
                    },
                },
            })
        }
    }

    const createVesselDailyCheck = async () => {
        await createVesselDailyCheck_LogBookEntrySection({
            variables: {
                input: {
                    logBookEntryID: logentryID,
                },
            },
        })
    }

    const [createVesselDailyCheck_LogBookEntrySection] = useMutation(
        CreateVesselDailyCheck_LogBookEntrySection,
        {
            onCompleted: (response: any) => {
                setVesselDailyCheck([
                    response.createVesselDailyCheck_LogBookEntrySection,
                ])
            },
            onError: (error: any) => {
                console.error('createLogEntry error', error)
            },
        },
    )

    const subComponentVisibilityCheck = (category: string) => {
        if (logBookConfig) {
            const components =
                logBookConfig.customisedLogBookComponents.nodes.find(
                    (c: any) =>
                        c.componentClass ===
                        'VesselDailyCheck_LogBookComponent',
                )
            if (components?.subFields === null) return ''
            if (
                components?.subFields == '' ||
                components?.subFields?.split('||').includes(category)
            ) {
                return ''
            }
            return 'hidden'
        }
        return 'hidden'
    }

    const [createMaintenanceCheck, { loading: createMaintenanceCheckLoading }] =
        useMutation(CREATE_COMPONENT_MAINTENANCE_CHECK, {
            onCompleted: (response: any) => {
                const data = response.createComponentMaintenanceCheck
                if (data) {
                    setNewTaskID(data.id)
                    setOpenCreateTaskSidebar(true)
                }
            },
            onError: (error: any) => {
                console.error('createMaintenanceCheck error', error)
            },
        })
    const handleCreateTask = async () => {
        if (!edit_task) {
            toast.error('You do not have permission to edit this section')
            return
        }
        const assignedBy = localStorage.getItem('userId')
        if (offline) {
            const id = generateUniqueId()
            const data = {
                id: id,
                name: `New Task ${new Date().toLocaleDateString()}`,
                startDate: new Date().toLocaleDateString(),
                severity: 'Low',
                status: 'Save As Draft',
                assignedByID: assignedBy,
                inventoryID: null,
                basicComponentID: vesselID,
            }
            setNewTaskID(data.id)
            setOpenCreateTaskSidebar(true)
        } else {
            await createMaintenanceCheck({
                variables: {
                    input: {
                        name: `New Task ${new Date().toLocaleDateString()}`,
                        startDate: new Date().toLocaleDateString(),
                        severity: 'Low',
                        status: 'Save As Draft',
                        assignedByID: assignedBy,
                        inventoryID: null,
                        basicComponentID: vesselID,
                    },
                },
            })
        }
    }
    useEffect(() => {
        vesselDailyCheck[0]?.id > 0 && loadSectionMemberComments()
    }, [vesselDailyCheck])

    useEffect(() => {
        if (!vesselDailyCheck) {
            if (offline) {
                const id = generateUniqueId()
                const data = {
                    id: `${id}`,
                    logBookEntryID: logentryID,
                }
                setVesselDailyCheck([data])
            } else {
                createVesselDailyCheck()
            }
        }
    }, [])

    //const hash = window.location.hash.substring(1)
    //const params = new URLSearchParams(hash)

    useEffect(() => {
        //const secondTab = params.get('secondTab')
        let commentTab = '' + secondTab

        if (
            commentTab != '' &&
            secondTab != 0 &&
            commentTab != 'Safety Checks'
        ) {
            setTab(commentTab)
        }
    }, [])

    return (
        <div className="mx-4">
            <div
                className={`${classes.tabsHolder} hidden lg:block !mb-0 !pb-0`}>
                <ul className={`${classes.tabsUl}`}>
                    <li
                        className={`${subComponentVisibilityCheck('Safety Checks')} ${classes.tabsUlLi} mb-1 md:mb-0`}
                        id="Safety_checks">
                        <Button
                            className={`${tab === 'Safety Checks' ? tabClasses.active : tabClasses.inactive}`}
                            onPress={() => {
                                toast.remove()
                                tab === 'Safety Checks'
                                    ? setTab('')
                                    : setTab('Safety Checks')
                            }}>
                            Safety
                        </Button>
                    </li>
                    <li
                        className={`${subComponentVisibilityCheck('Deck operations and exterior checks')} ${classes.tabsUlLi} mb-1 md:mb-0`}
                        id="Deck_operations_&_exterior">
                        <Button
                            className={`${tab === 'Deck operations and exterior checks' ? tabClasses.active : tabClasses.inactive}`}
                            onPress={() => {
                                toast.remove()
                                tab === 'Deck operations and exterior checks'
                                    ? setTab('')
                                    : setTab(
                                          'Deck operations and exterior checks',
                                      )
                            }}>
                            Deck ops & exterior
                        </Button>
                    </li>
                    <li
                        className={`${subComponentVisibilityCheck('Engine Checks')}  ${classes.tabsUlLi} mb-1 md:mb-0`}
                        id="Engine,_Propulsion,_steering,_electrical_&_alt_power">
                        <Button
                            className={`${tab === 'Engine Checks' ? tabClasses.active : tabClasses.inactive}`}
                            onPress={() => {
                                toast.remove()
                                tab === 'Engine Checks'
                                    ? setTab('')
                                    : setTab('Engine Checks')
                            }}>
                            Engine, steering, electrical & alt power
                        </Button>
                    </li>
                    <li
                        className={`${subComponentVisibilityCheck('Navigation')}  ${classes.tabsUlLi} mb-1 md:mb-0`}
                        id="Navigation_and_computer_equipment">
                        <Button
                            className={`${tab === 'Navigation' ? tabClasses.active : tabClasses.inactive}`}
                            onPress={() => {
                                toast.remove()
                                tab === 'Navigation'
                                    ? setTab('')
                                    : setTab('Navigation')
                            }}>
                            Nav & computer equip
                        </Button>
                    </li>
                </ul>
            </div>
            <Button
                className={`${tab === 'Safety Checks' ? tabClasses.active : tabClasses.inactive} block lg:hidden`}
                onPress={() => {
                    toast.remove()
                    tab === 'Safety Checks'
                        ? setTab('')
                        : setTab('Safety Checks')
                }}>
                Safety
            </Button>
            {tab === 'Safety Checks' && (
                <div className="my-4">
                    <Safety
                        offline={offline}
                        logBookConfig={logBookConfig}
                        vesselDailyCheck={vesselDailyCheck[0]}
                        comments={comments}
                        setComments={setComments}
                        setTab={setTab}
                        setVesselDailyCheck={setVesselDailyCheck}
                        locked={locked}
                        handleCreateTask={handleCreateTask}
                        createMaintenanceCheckLoading={
                            createMaintenanceCheckLoading
                        }
                        edit_logBookEntry={
                            edit_logBookEntry && edit_dailyChecks
                        }
                    />
                </div>
            )}
            {tab === 'Cleaning Checks' && (
                <div className="my-4">
                    <Cleaning
                        offline={offline}
                        logBookConfig={logBookConfig}
                        vesselDailyCheck={vesselDailyCheck[0]}
                        comments={comments}
                        setComments={setComments}
                        setTab={setTab}
                        setVesselDailyCheck={setVesselDailyCheck}
                        locked={locked}
                        handleCreateTask={handleCreateTask}
                        createMaintenanceCheckLoading={
                            createMaintenanceCheckLoading
                        }
                        edit_logBookEntry={
                            edit_logBookEntry && edit_dailyChecks
                        }
                    />
                </div>
            )}
            {tab === 'Jet Specific Checks' && (
                <div className="my-4">
                    <JetSpecific
                        offline={offline}
                        logBookConfig={logBookConfig}
                        vesselDailyCheck={vesselDailyCheck[0]}
                        comments={comments}
                        setComments={setComments}
                        setTab={setTab}
                        setVesselDailyCheck={setVesselDailyCheck}
                        locked={locked}
                        handleCreateTask={handleCreateTask}
                        createMaintenanceCheckLoading={
                            createMaintenanceCheckLoading
                        }
                        edit_logBookEntry={
                            edit_logBookEntry && edit_dailyChecks
                        }
                    />
                </div>
            )}
            <Button
                className={`${tab === 'Engine Checks' ? tabClasses.active : tabClasses.inactive}  block lg:hidden`}
                onPress={() => {
                    toast.remove()
                    tab === 'Engine Checks'
                        ? setTab('')
                        : setTab('Engine Checks')
                }}>
                Engine, steering, electrical & alt power
            </Button>
            {tab === 'Engine Checks' && (
                <div className="my-4">
                    <DailyEngineChecks
                        offline={offline}
                        logBookConfig={logBookConfig}
                        vesselDailyCheck={vesselDailyCheck[0]}
                        comments={comments}
                        setComments={setComments}
                        setTab={setTab}
                        setVesselDailyCheck={setVesselDailyCheck}
                        locked={locked}
                        handleCreateTask={handleCreateTask}
                        createMaintenanceCheckLoading={
                            createMaintenanceCheckLoading
                        }
                        edit_logBookEntry={
                            edit_logBookEntry && edit_dailyChecks
                        }
                    />
                </div>
            )}
            {tab === 'Propulsion' && (
                <div className="my-4">
                    <DailyEngineChecks
                        offline={offline}
                        logBookConfig={logBookConfig}
                        vesselDailyCheck={vesselDailyCheck[0]}
                        comments={comments}
                        setComments={setComments}
                        setTab={setTab}
                        setVesselDailyCheck={setVesselDailyCheck}
                        locked={locked}
                        handleCreateTask={handleCreateTask}
                        createMaintenanceCheckLoading={
                            createMaintenanceCheckLoading
                        }
                        edit_logBookEntry={
                            edit_logBookEntry && edit_dailyChecks
                        }
                    />
                </div>
            )}
            {tab === 'Fuel Checks' && (
                <div className="my-4">
                    <FuelSystem
                        offline={offline}
                        logBookConfig={logBookConfig}
                        vesselDailyCheck={vesselDailyCheck[0]}
                        comments={comments}
                        setComments={setComments}
                        setTab={setTab}
                        setVesselDailyCheck={setVesselDailyCheck}
                        locked={locked}
                        handleCreateTask={handleCreateTask}
                        createMaintenanceCheckLoading={
                            createMaintenanceCheckLoading
                        }
                        edit_logBookEntry={
                            edit_logBookEntry && edit_dailyChecks
                        }
                    />
                </div>
            )}
            <Button
                className={`${tab === 'Navigation' ? tabClasses.active : tabClasses.inactive}  block lg:hidden`}
                onPress={() => {
                    toast.remove()
                    tab === 'Navigation' ? setTab('') : setTab('Navigation')
                }}>
                Nav & computer equip
            </Button>
            {tab === 'Navigation' && (
                <div className="my-4">
                    <NavigationEquipments
                        offline={offline}
                        logBookConfig={logBookConfig}
                        vesselDailyCheck={vesselDailyCheck[0]}
                        comments={comments}
                        setComments={setComments}
                        setTab={setTab}
                        setVesselDailyCheck={setVesselDailyCheck}
                        locked={locked}
                        handleCreateTask={handleCreateTask}
                        createMaintenanceCheckLoading={
                            createMaintenanceCheckLoading
                        }
                        edit_logBookEntry={
                            edit_logBookEntry && edit_dailyChecks
                        }
                    />
                </div>
            )}
            <Button
                className={`${tab === 'Deck operations and exterior checks' ? tabClasses.active : tabClasses.inactive}  block lg:hidden`}
                onPress={() => {
                    toast.remove()
                    tab === 'Deck operations and exterior checks'
                        ? setTab('')
                        : setTab('Deck operations and exterior checks')
                }}>
                Deck ops & exterior
            </Button>
            {tab === 'Deck operations and exterior checks' && (
                <div className="my-4">
                    <Hull
                        offline={offline}
                        logBookConfig={logBookConfig}
                        vesselDailyCheck={vesselDailyCheck[0]}
                        comments={comments}
                        setComments={setComments}
                        setTab={setTab}
                        setVesselDailyCheck={setVesselDailyCheck}
                        locked={locked}
                        handleCreateTask={handleCreateTask}
                        createMaintenanceCheckLoading={
                            createMaintenanceCheckLoading
                        }
                        edit_logBookEntry={
                            edit_logBookEntry && edit_dailyChecks
                        }
                    />
                </div>
            )}
            {tab === 'Plumbing' && (
                <div className="my-4">
                    <Plumbing
                        offline={offline}
                        logBookConfig={logBookConfig}
                        vesselDailyCheck={vesselDailyCheck[0]}
                        comments={comments}
                        setComments={setComments}
                        setTab={setTab}
                        setVesselDailyCheck={setVesselDailyCheck}
                        locked={locked}
                        handleCreateTask={handleCreateTask}
                        createMaintenanceCheckLoading={
                            createMaintenanceCheckLoading
                        }
                        edit_logBookEntry={
                            edit_logBookEntry && edit_dailyChecks
                        }
                    />
                </div>
            )}
            {tab === 'Documentation' && (
                <div className="my-4">
                    <Documentation
                        offline={offline}
                        logBookConfig={logBookConfig}
                        vesselDailyCheck={vesselDailyCheck[0]}
                        comments={comments}
                        setComments={setComments}
                        setTab={setTab}
                        setVesselDailyCheck={setVesselDailyCheck}
                        locked={locked}
                        handleCreateTask={handleCreateTask}
                        createMaintenanceCheckLoading={
                            createMaintenanceCheckLoading
                        }
                        edit_logBookEntry={
                            edit_logBookEntry && edit_dailyChecks
                        }
                    />
                </div>
            )}
            {tab === 'HVAC' && (
                <div className="my-4">
                    <Hvac
                        offline={offline}
                        logBookConfig={logBookConfig}
                        vesselDailyCheck={vesselDailyCheck[0]}
                        comments={comments}
                        setComments={setComments}
                        setTab={setTab}
                        setVesselDailyCheck={setVesselDailyCheck}
                        locked={locked}
                        handleCreateTask={handleCreateTask}
                        createMaintenanceCheckLoading={
                            createMaintenanceCheckLoading
                        }
                        edit_logBookEntry={
                            edit_logBookEntry && edit_dailyChecks
                        }
                    />
                </div>
            )}
            {tab === 'Sail' && (
                <div className="my-4">
                    <Sail
                        offline={offline}
                        logBookConfig={logBookConfig}
                        vesselDailyCheck={vesselDailyCheck[0]}
                        comments={comments}
                        setComments={setComments}
                        setTab={setTab}
                        setVesselDailyCheck={setVesselDailyCheck}
                        locked={locked}
                        handleCreateTask={handleCreateTask}
                        createMaintenanceCheckLoading={
                            createMaintenanceCheckLoading
                        }
                        edit_logBookEntry={
                            edit_logBookEntry && edit_dailyChecks
                        }
                    />
                </div>
            )}
            {tab === 'weather' && (
                <div className="my-4">
                    <WeatherConditions
                        offline={offline}
                        logBookConfig={logBookConfig}
                    />
                </div>
            )}
            <SlidingPanel
                type={'right'}
                isOpen={openCreateTaskSidebar}
                size={60}>
                <div className="bg-slblue-100 rounded-t-lg h-fit flex flex-col justify-between mt-4">
                    <div className=" flex-grow ">
                        <Task
                            taskId={+newTaskID}
                            redirectTo=""
                            inSidebar
                            onSidebarClose={() =>
                                setOpenCreateTaskSidebar(false)
                            }
                        />
                    </div>
                </div>
            </SlidingPanel>
        </div>
    )
}
