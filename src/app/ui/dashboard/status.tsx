'use client'
import React, { useEffect, useState } from 'react'
import { Vessel } from '../../../../types/vessel'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import 'swiper/css/free-mode'
import VesselsCard from '@/app/ui/dashboard/vessel-card'
import {
    getComponentMaintenanceCheckByMemberId,
    getComponentMaintenanceCheckByVesselId,
    GetCrewListWithTrainingStatus,
    getTrainingSessionDuesByMemberId,
    getTrainingSessionDuesByVesselId,
    getTrainingSessionsByVesselId,
    getDashboardVesselList,
    isOverDueTask,
    getInventoryList,
} from '@/app/lib/actions'
import dynamic from 'next/dynamic'
import Calendar from '../calendar-view/calendar'
import Link from 'next/link'
import { SealogsMaintenanceIcon } from '../../lib/icons/SealogsMaintenanceIcon'
import { classes } from '@/app/components/GlobalClasses'
import { Button, DialogTrigger, Popover } from 'react-aria-components'
import dayjs from 'dayjs'
import { useLazyQuery } from '@apollo/client'
import {
    CREW_LIST,
    GET_INVENTORY_BY_ID,
    GET_INVENTORY_BY_VESSEL_ID,
    READ_ONE_SEALOGS_MEMBER,
} from '@/app/lib/graphQL/query'
import { usePathname, useSearchParams } from 'next/navigation'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import { SeaLogsButton } from '@/app/components/Components'
import { SealogsTrainingIcon } from '@/app/lib/icons/SealogsTrainingIcon'
const FullMap = dynamic(() => import('@/app/components/FullMap'), {
    ssr: false,
})
export default function DashboardStatus(props: any) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [vesselList, setVesselList] = useState<Vessel[]>([])
    const [filteredVesselList, setFilteredVesselList] = useState<Vessel[]>([])
    const [maintenanceTasks, setMaintenanceTasks] = useState<any>([])
    const [inventories, setInventories] = useState<any>(false)
    const [trainingSessionDuesSummary, setTrainingSessionDuesSummary] =
        useState<any>([])
    const [trainingSessions, setTrainingSessions] = useState<any>()
    const [trainingSessionDues, setTrainingSessionDues] = useState<any>([])
    // const [crewList, setCrewList] = useState<any>([])
    const [pageInfo, setPageInfo] = useState({
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    })
    const limit = 100
    let [filter, setFilter] = useState({
        archived: { eq: false },
    } as SearchFilter)

    const [currentDepartment, setCurrentDepartment] = useState<any>(false)

    getInventoryList(setInventories)

    const [querySeaLogsMembers] = useLazyQuery(READ_ONE_SEALOGS_MEMBER, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneSeaLogsMember
            if (data) {
                setCurrentDepartment(
                    data.departments.nodes.flatMap(
                        (department: any) => department.basicComponents.nodes,
                    ),
                )
                if (
                    data.departments.nodes.flatMap(
                        (department: any) => department.basicComponents.nodes,
                    ).length === 0
                ) {
                    setCurrentDepartment(true)
                }
            }
        },
        onError: (error: any) => {
            console.error('querySeaLogsMembers error', error)
        },
    })

    useEffect(() => {
        querySeaLogsMembers({
            variables: {
                filter: { id: { eq: +(localStorage.getItem('userId') ?? 0) } },
            },
        })
    }, [])

    useEffect(() => {
        if (currentDepartment && vesselList) {
            if (
                currentDepartment === true ||
                localStorage.getItem('useDepartment') !== 'true'
            ) {
                setFilteredVesselList(vesselList)
            } else {
                setFilteredVesselList(
                    vesselList.filter((vessel: any) =>
                        currentDepartment.some(
                            (department: any) => department.id === vessel.id,
                        ),
                    ),
                )
                setFilteredVesselList(vesselList)
            }
        }
    }, [currentDepartment, vesselList])

    const handleSetVessels = (vessels: any) => {
        const activeVessels = vessels.filter((vessel: any) => vessel.showOnDashboard)
        setVesselList(activeVessels)
    }

    getDashboardVesselList(handleSetVessels)

    // const [queryCrewMembers, { loading: queryCrewMembersLoading }] =
    //     useLazyQuery(CREW_LIST, {
    //         fetchPolicy: 'cache-and-network',
    //         onCompleted: (queryCrewMembersResponse: any) => {
    //             handleSetCrewMembers(
    //                 queryCrewMembersResponse.readSeaLogsMembers.nodes,
    //             )
    //             setPageInfo(
    //                 queryCrewMembersResponse.readSeaLogsMembers.pageInfo,
    //             )
    //             return queryCrewMembersResponse.readSeaLogsMembers.nodes
    //         },
    //         onError: (error: any) => {
    //             console.error('queryCrewMembers error', error)
    //         },
    //     })

    // const handleSetCrewMembers = (crewMembers: any) => {
    //     const transformedCrewList = GetCrewListWithTrainingStatus(
    //         crewMembers,
    //         vesselList,
    //     )
    //     setCrewList(transformedCrewList)
    // }

    // const loadCrewMembers = async (
    //     startPage: number = 0,
    //     searchFilter: any = { ...filter },
    // ) => {
    //     const updatedFilter: SearchFilter = {
    //         ...searchFilter,
    //         archived: { eq: false },
    //     }

        // await queryCrewMembers({
        //     variables: {
        //         limit: limit,
        //         offset: startPage * limit,
        //         filter: updatedFilter,
        //     },
        // })
    // }

    // useEffect(() => {
    //     loadCrewMembers(0, filter)
    // }, [])

    // const crewMember = crewList.find(
    //     (crew: any) =>
    //         crew.firstName === localStorage.getItem('firstName') &&
    //         crew.surname === localStorage.getItem('surname'),
    // )

    let memberID = 0
    if (
        typeof window !== 'undefined' &&
        typeof window.localStorage !== 'undefined'
    ) {
        memberID = +(localStorage.getItem('userId') ?? 0)
    }

    // if (crewMember != null) {
    //     memberID = crewMember.id
    // }

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

        const seenIds = new Set()

        const deduplicatedTasks = tasks.filter((task: any) => {
            const isDuplicate = seenIds.has(task.id)
            seenIds.add(task.id)
            return !isDuplicate
        })

        setMaintenanceTasks(deduplicatedTasks)
    }

    getComponentMaintenanceCheckByMemberId(memberID, handleSetMaintenanceTasks)

    const handleSetTrainingSessionDues = (data: any) => {
        const dues = data.slice(0, 5)
        setTrainingSessionDues(data)
        setTrainingSessionDuesSummary(dues)
    }
    getTrainingSessionDuesByMemberId(memberID, handleSetTrainingSessionDues)

    return (
        <>
            {filteredVesselList.length > 0 && (
                <div className="w-full overflow-hidden bg-transparent relative">
                    <Swiper
                        spaceBetween={20}
                        slidesPerView={'auto'}
                        freeMode={true}
                        modules={[Pagination, FreeMode]}
                        className="Vessels dark:bg-sldarkblue-1000 !pb-16"
                        pagination={{
                            clickable: true,
                            bulletClass: `swiper-pagination-bullet swiper-pagination-testClass !bg-slblue-1000`,
                        }}>
                        {filteredVesselList
                            // .filter((vessel: any) => vessel.showOnDashboard)
                            .map((vessel) => (
                                <SwiperSlide key={vessel.id}>
                                    <VesselsCard vessel={vessel} />
                                </SwiperSlide>
                            ))}
                    </Swiper>
                    <div className="flex flex-wrap lg:flex-nowrap gap-6 mb-4">
                        <div className="w-full lg:w-1/2 xl:w-1/3">
                            <Calendar
                                initialView="listWeek"
                                isDashboard={true}
                            />
                            <div className="text-center mt-2">
                                <Link href="/calendar">View Full Calendar</Link>
                            </div>
                        </div>
                        <div className="w-full lg:1/2 xl:w-2/3 z-40 flex flex-col md:flex-row">
                            <div className="w-full md:w-1/2 z-40">
                                <div className="shadow-xl h-100 p-0 overflow-hidden bg-slblue-1000 border-2 border-sllightblue-100 rounded-lg dark:bg-slblue-800 dark:border-slblue-700">
                                    <div className="lg:flex p-4 flex-col lg:justify-between font-light">
                                        <div className="font-light text-white flex border-b border-sllightblue-1000 pb-3 justify-between">
                                            {' '}
                                            <div>
                                                <SealogsMaintenanceIcon
                                                    className={`${classes.icons} h-6 w-6`}
                                                />
                                                <span className="font-bold ml-2">
                                                    My
                                                </span>
                                                <span className="hidden md:inline">
                                                    &nbsp;maintenance
                                                </span>{' '}
                                                tasks
                                            </div>
                                            <Link
                                                href={`/maintenance`}
                                                className="text-2xs hover:text-sllightblue-800 font-inter">
                                                VIEW ALL
                                            </Link>
                                        </div>

                                        {maintenanceTasks &&
                                        maintenanceTasks?.filter(
                                            (task: any) =>
                                                !(
                                                    task.status ===
                                                        'Completed' ||
                                                    task.status ===
                                                        'Save_As_Draft'
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
                                                    .map(
                                                        (
                                                            task: any,
                                                            index: number,
                                                        ) => (
                                                            <div
                                                                key={task.id}
                                                                className={`group flex text-white border-b border-sldarkblue-800 justify-between w-full py-1.5 ${index < maintenanceTasks.filter((task: any) => task.status !== 'Completed').length - 1 ? '' : ''}`}>
                                                                <div className="flex items-center hover:text-sllightblue-800 ">
                                                                    <Link
                                                                        href={`/maintenance?taskID=${task.id}&redirect_to=${pathname}?${searchParams.toString()}`}
                                                                        className={`${task.severity === 'High' ? 'group-hover:text-slred-1000' : ''} `}>
                                                                        {
                                                                            task.name
                                                                        }
                                                                    </Link>
                                                                </div>
                                                                <div
                                                                    className={`text-2xs ${task?.isOverDue.status === 'High' ? 'text-slred-1000 whitespace-nowrap bg-slred-100 p-2 border rounded text-2xs border-slred-1000 h-full' : ''} ${task?.isOverDue.status === 'Low' ? 'text-white' : ''} ${task?.isOverDue.status === 'Medium' ? 'text-white' : ''} `}>
                                                                    {task
                                                                        ?.isOverDue
                                                                        .status !==
                                                                    'Completed'
                                                                        ? task.isOverDue.days.replace(
                                                                              'Upcoming',
                                                                              'Due',
                                                                          )
                                                                        : ''}
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
                                                    Holy mackerel! You are up to
                                                    date with all your
                                                    maintenance. Only thing left
                                                    to do is, to go fishing
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-1/2 z-40 md:pl-5 pl-0">
                                <div className="shadow-xl h-100 p-0 overflow-hidden bg-slblue-1000 border-2 border-sllightblue-100 rounded-lg dark:bg-slblue-800 dark:border-slblue-700">
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
                                            <Link
                                                href={`/crew-training`}
                                                className="text-2xs hover:text-sllightblue-800 font-inter">
                                                VIEW ALL
                                            </Link>
                                        </div>
                                        {trainingSessionDuesSummary &&
                                        trainingSessionDuesSummary.length >
                                            0 ? (
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
                                                                            due
                                                                                .trainingType
                                                                                .id
                                                                        }
                                                                        className="text-white">
                                                                        {
                                                                            due
                                                                                .trainingType
                                                                                .title
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <div className="text-slred-1000 bg-slred-100 p-2 border rounded border-slred-1000 ">
                                                                        {
                                                                            due
                                                                                .status
                                                                                .label
                                                                        }
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
                                                    WOW! Look at that! You are
                                                    ship-shaped and trained to
                                                    the gills. Great job!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap gap-6 mb-4">
                        <div className="w-full z-40">
                            {vesselList && vesselList.length && (
                                <FullMap vessels={vesselList} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
