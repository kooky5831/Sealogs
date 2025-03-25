'use client'
import { Button } from 'react-aria-components'
import { useEffect, useState } from 'react'
import { Vessel } from '../../../../types/vessel'
import Skeleton from '@/app/components/Skeleton'
import VesselLogStatus from '@/app/ui/vessels/vesselStatus'
import Link from 'next/link'
import { isOverDueTask } from '@/app/lib/actions'
import VesselIcon from '../vessels/vesel-icon'
import { usePathname, useSearchParams } from 'next/navigation'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'

export default function VesselsCard({ vessel }: { vessel: any }) {
    const vesselId = vessel.id
    const pathname = usePathname()
    const searchParams = useSearchParams()
    // const [vessel, setVessel] = useState<any>()
    const [taskCounter, setTaskCounter] = useState(0)
    const [trainingSessionDues, setTrainingSessionDues] = useState([])
    // const [inventories, setInventories] = useState<any>([])

    const [permissions, setPermissions] = useState<any>(false)
    const [edit_task, setEdit_task] = useState<any>(false)

    const init_permissions = () => {
        if (permissions) {
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
        // setTrainingSessionDues(vessel.trainingSessionsDue.nodes)
        // handleSetMaintenanceTasks(vessel.componentMaintenanceChecks.nodes)
    }, [])

    useEffect(() => {
        init_permissions()
    }, [permissions])

    // getVesselByID(vesselId, setVessel)

    // const handleSetTrainingSessionDues = (data: any) => {
    //     const dues = data.filter((item: any) => {
    //         return item.dueDate !== null
    //     })
    //     setTrainingSessionDues(dues)
    // }
    // getTrainingSessionDuesByVesselId(vesselId, handleSetTrainingSessionDues)

    // const [queryInventoriesByVessel] = useLazyQuery(
    //     GET_INVENTORY_BY_VESSEL_ID,
    //     {
    //         fetchPolicy: 'cache-and-network',
    //         onCompleted: (response: any) => {
    //             const data = response.readInventories.nodes
    //             if (data) {
    //                 setInventories(data)
    //             }
    //         },
    //         onError: (error: any) => {
    //             console.error('queryInventories error', error)
    //         },
    //     },
    // )
    // useEffect(() => {
    //     loadInventories()
    // }, [])
    // const loadInventories = async () => {
    //     await queryInventoriesByVessel({
    //         variables: {
    //             vesselId: +vesselId,
    //         },
    //     })
    // }

    // const handleSetMaintenanceTasks = (data: any) => {
    //     const tasks = data
    //         .filter((task: any) => task.archived === false)
    //         .map((task: any) => ({
    //             ...task,
    //             isOverDue: isOverDueTask(task),
    //         }))

    //     const inventoryTasks = inventories
    //         .flatMap((inventory: any) => {
    //             const checks = inventory.componentMaintenanceChecks?.nodes || []
    //             return checks
    //         })
    //         .filter((check: any) => check.archived === false)
    //         .map((check: any) => ({
    //             ...check,
    //             isOverDue: isOverDueTask(check),
    //         }))

    //     const combinedTasks = [...tasks, ...inventoryTasks]
    //     const seenIds = new Set()

    //     const deduplicatedTasks = combinedTasks.filter((task: any) => {
    //         const isDuplicate = seenIds.has(task.id)
    //         seenIds.add(task.id)
    //         return !isDuplicate
    //     })

    //     const taskCounter = deduplicatedTasks.filter(
    //         (task: any) =>
    //             task.status !== 'Completed' &&
    //             task.status !== 'Save_As_Draft' &&
    //             task.isOverDue !== true,
    //     ).length

    //     setTaskCounter(taskCounter)
    // }

    // getComponentMaintenanceCheckByVesselId(vesselId, handleSetMaintenanceTasks)

    return (
        <div className="pb-0 mt-3 max-w-fit">
            <div className="w-full h-100 overflow-hidden bg-white border border-slblue-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 mb-4">
                <div className="lg:flex p-5 flex-col lg:justify-between">
                    <div className="min-w-0 flex-1">
                        <Link
                            href={`/vessel/info?id=${vesselId}`}
                            className={`focus:outline-none`}>
                            <div className="text-xl leading-7 sm:truncate sm:tracking-tight flex items-center text-left focus:outline-none">
                                <div className="mr-4 lg:mr-6">
                                    <VesselIcon vessel={vessel} />
                                </div>

                                <div className="flex flex-col">
                                    <h2
                                        className={`text-xl leading-7 sm:truncate sm:tracking-tight hover:text-sllightblue-1000`}>
                                        {vessel?.title || <Skeleton />}
                                    </h2>
                                    <div className="tracking-[0.3px] items-center text-xs font-light hidden md:block">
                                        <span className="flex">
                                            <svg
                                                className="mr-1 -mb-2 h-6 w-6 flex-shrink-0"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 19.4097 20.25">
                                                <path
                                                    d="M19.0582,14.3616h-7.1609v-1.5481c0-.0405-.0328-.0734-.0734-.0734h-4.2381c-.0405,0-.0734.0328-.0734.0734v1.5481H.3516v-6.9289h18.7066v6.9289Z"
                                                    fill="#f2f4f7"
                                                    stroke="#022450"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth=".25px"
                                                />
                                                <path
                                                    d="M19.2049,17.7918V7.3594c0-.0405-.0328-.0734-.0734-.0734h-4.3398v-3.9475c0-.5258-.4278-.9536-.9536-.9536H5.5717c-.5258,0-.9536.4278-.9536.9536v3.9475H.2782c-.0405,0-.0734.0328-.0734.0734v10.4324c0,.0405.0328.0734.0734.0734h18.8533c.0405,0,.0734-.0328.0734-.0734ZM4.7647,3.3385c0-.445.3621-.8069.8069-.8069h8.2664c.4449,0,.8069.3619.8069.8069v3.9475h-1.6139v-3.0672c0-.0405-.0328-.0734-.0734-.0734h-6.5058c-.0405,0-.0734.0328-.0734.0734v3.0672h-1.6139v-3.9475ZM12.8844,4.2921v2.9939h-6.3591v-2.9939h6.3591ZM19.0582,17.7184H.3516v-3.2101h7.2342c.0405,0,.0734-.0328.0734-.0734v-1.5481h4.0914v1.5481c0,.0405.0328.0734.0734.0734h7.2342v3.2101ZM19.0582,14.3616h-7.1609v-1.5481c0-.0405-.0328-.0734-.0734-.0734h-4.2381c-.0405,0-.0734.0328-.0734.0734v1.5481H.3516v-6.9289h18.7066v6.9289Z"
                                                    fill="#022450"
                                                    stroke="#022450"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth=".25px"
                                                />
                                                <path
                                                    d="M10.0086,14.3616h-.6075c-.0405,0-.0734.0328-.0734.0734s.0328.0734.0734.0734h.6075c.0405,0,.0734-.0328.0734-.0734s-.0328-.0734-.0734-.0734Z"
                                                    fill="#022450"
                                                    stroke="#022450"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth=".25px"
                                                />
                                            </svg>
                                            <span className="hidden md:block mr-1">
                                                Authority:
                                            </span>{' '}
                                            {vessel?.registration}
                                        </span>
                                        {vessel?.callSign && (
                                            <span className="flex">
                                                <svg
                                                    className="ml-3 mr-1 h-6 w-6 flex-shrink-0"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 18.25 15.1936">
                                                    <path
                                                        d="M6.6211,3.075L12.9037.6941c-1.2781,1.0052-2.1272,3.2518-2.1272,5.9943s.8487,4.9878,2.1261,5.9934l-6.281-2.3797c-.8094-.3138-1.397-1.8336-1.397-3.6137s.5876-3.2999,1.3965-3.6134Z"
                                                        fill="#f4f5f7"
                                                        strokeWidth="0px"
                                                    />
                                                    <path
                                                        d="M14.4508,1.7699c.958,0,2.0294,2.1034,2.0294,4.9185s-1.0714,4.9185-2.0294,4.9185c-.7162,0-1.4954-1.176-1.8433-2.9455,1.2836-.1483,2.2435-.9859,2.2435-1.973s-.96-1.8247-2.2435-1.973c.3479-1.7695,1.1271-2.9455,1.8433-2.9455Z"
                                                        fill="#f4f5f7"
                                                        strokeWidth="0px"
                                                    />
                                                    <path
                                                        d="M14.4508,11.7401c1.0209,0,2.1626-2.1604,2.1626-5.0517s-1.1418-5.0517-2.1626-5.0517-2.1626,2.1604-2.1626,5.0517,1.1418,5.0517,2.1626,5.0517ZM14.4508,1.7699c.958,0,2.0294,2.1034,2.0294,4.9185s-1.0714,4.9185-2.0294,4.9185c-.7162,0-1.4954-1.176-1.8433-2.9455,1.2836-.1483,2.2435-.9859,2.2435-1.973s-.96-1.8247-2.2435-1.973c.3479-1.7695,1.1271-2.9455,1.8433-2.9455ZM14.7178,6.6884c0,.9208-.9132,1.7037-2.1334,1.8416-.1024-.5636-.163-1.182-.163-1.8416s.0606-1.2781.163-1.8417c1.22.138,2.1334.921,2.1334,1.8417Z"
                                                        fill="#022450"
                                                        strokeWidth=".25px"
                                                        stroke="#022450"
                                                        strokeMiterlimit="10"
                                                    />
                                                    <path
                                                        d="M2.8608,9.4683l1.8447,4.722c.0986.2523.2999.4536.5523.5522l.6638.2591c.1149.0448.2349.067.3543.067.1682,0,.3356-.0441.4861-.1312l1.1394-.6586c.4398-.2542.6101-.8113.3876-1.2681-.188-.3859-.6152-.6046-1.0381-.5328l-.0533.0091c-.3914.0677-.7687-.1433-.9186-.5103l-1.0221-2.506h.4139c.2452.4784.5541.8205.9031.9558l7.0599,2.6749.0002-.0006c.2612.098.534.151.8166.151,2.0946,0,3.6742-2.8217,3.6742-6.5634S16.5454.125,14.4508.125c-.2825,0-.5553.053-.8165.1509l-.0004-.0011-7.0604,2.6757c-.3487.1352-.6575.4772-.9026.9556h-2.7636C1.3731,3.9061.125,5.1542.125,6.6884c0,1.5185,1.2232,2.7548,2.7358,2.7799ZM6.1558,12.027c.1738.4256.611.6689,1.0643.5914l.0533-.0091c.3656-.0621.7336.1267.896.4597.1919.3944.045.875-.3345,1.0945l-1.1394.6586c-.2222.1283-.4864.1483-.7254.0553l-.6638-.2591c-.2178-.0851-.3915-.2588-.4766-.4765l-1.8249-4.6713h2.1085l1.0426,2.5564ZM13.6701.4037l.0109-.0041v-.0002c.2465-.0918.5036-.1411.7698-.1411,2.0187,0,3.541,2.7644,3.541,6.4302s-1.5222,6.4302-3.541,6.4302c-.2662,0-.5234-.0493-.77-.1412l.0002-.0006-.0376-.0142c-1.6036-.6291-2.7337-3.1163-2.7337-6.2741,0-3.1753,1.1427-5.6729,2.7604-6.2847ZM6.6211,3.075L12.9037.6941c-1.2781,1.0052-2.1272,3.2518-2.1272,5.9943s.8487,4.9878,2.1261,5.9934l-6.281-2.3797c-.8094-.3138-1.397-1.8336-1.397-3.6137s.5876-3.2999,1.3965-3.6134ZM2.9073,4.0394h2.6972c-.3195.6899-.5131,1.6286-.5131,2.649s.1936,1.9591.5131,2.649h-2.6972c-1.4607,0-2.649-1.1883-2.649-2.649s1.1883-2.649,2.649-2.649Z"
                                                        fill="#022450"
                                                        strokeWidth=".25px"
                                                        stroke="#022450"
                                                        strokeMiterlimit="10"
                                                    />
                                                </svg>
                                                {vessel?.callSign}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className="mt-4 md:mt-6 flex justify-start md:justify-between gap-2">
                        <span className="grow hidden md:block">
                            <Link href={`/vessel/info?id=${vesselId}`}>
                                <Button
                                    className={
                                        ' w-full inline-flex justify-center items-center rounded-md bg-white p-4 shadow-sm ring-1 ring-inset ring-slblue-400 hover:bg-sldarkblue-1000 hover:text-white'
                                    }>
                                    View
                                </Button>
                            </Link>
                        </span>

                        <span className=" ">
                            <VesselLogStatus vessel={vessel} icon={true} />
                        </span>
                        {edit_task && (
                            <span className="">
                                <Link
                                    href={`/maintenance/new?vesselId=${vesselId}&redirect_to=${pathname}?${searchParams.toString()}`}>
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center items-center rounded-md bg-slblue-800 hover:bg-slblue-1000 p-4 text-white shadow-sm group-hover:bg-white group-hover:text-sldarkblue-1000 ring-1 ring-sldarkblueblue-950">
                                        <svg
                                            className="-ml-1.5 mr-1 h-5 w-5 border rounded-full bg-slblue-200 group-hover:bg-slblue-800 group-hover:text-white hidden md:inline-block"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        New task
                                    </button>
                                </Link>
                            </span>
                        )}
                    </div>
                    <div className="mt-4 md:mt-6 flex justify-between flex-col md:flex-row gap-3">
                        <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                            <div className="mt-2 flex items-center text-sm dark:text-white tracking-[0.3px] hover:text-sllightblue-1000">
                                {vessel.trainingsDue > 0 ? (
                                    <>
                                        <span className="text-slred-1000 border rounded-full w-8 h-8 flex bg-slred-100 items-center justify-center border-slred-1000 mr-2">
                                            {vessel.trainingsDue}
                                        </span>
                                        <Link
                                            href={`/vessel/info?id=${vesselId}&vesselTab=crew`}>
                                            Trainings due
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-slgreen-1000 border rounded-full w-8 h-8 flex bg-slneon-100 items-center justify-center border-slgreen-1000 mr-2">
                                            0
                                        </span>
                                        Trainings due
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                            <div className="mt-2 flex items-center text-sm dark:text-white tracking-[0.3px] hover:text-sllightblue-1000">
                                {vessel.tasksDue > 0 ? (
                                    <>
                                        <span className="text-slred-1000 border rounded-full w-8 h-8 flex bg-slred-100 items-center justify-center border-slred-1000 mr-2">
                                            {vessel.tasksDue}
                                        </span>
                                        <Link
                                            href={`/vessel/info?id=${vesselId}&vesselTab=maintenance`}>
                                            Warnings and overdue tasks
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-slgreen-1000 border rounded-full w-8 h-8 flex bg-slneon-100 items-center justify-center border-slgreen-1000 mr-2">
                                            0
                                        </span>
                                        Warnings and overdue tasks
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
