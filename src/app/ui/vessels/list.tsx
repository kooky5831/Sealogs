'use client'
import { useEffect, useState } from 'react'
import { DialogTrigger, Popover } from 'react-aria-components'
import { classes } from '@/app/components/GlobalClasses'
import Link from 'next/link'
import VesselLogStatus from './vesselStatus'
import {
    TableWrapper,
    SeaLogsButton,
    PopoverWrapper,
} from '@/app/components/Components'
import { List } from '@/app/ui/skeletons'
import {
    GetVesselListWithTrainingAndMaintenanceStatus,
    getDashboardVesselList,
    getVesselList,
} from '@/app/lib/actions'
import dynamic from 'next/dynamic'
const LocationMap = dynamic(() => import('@/app/components/Map'), {
    ssr: false,
})
import VesselPOB from './vessel-pob'
import VesselIcon from './vesel-icon'
import { isCrew } from '@/app/helpers/userHelper'
import VesselFuelStatus from './fuelStatus'

export default function VesselsList(props: any) {
    const [vessels, setVessels] = useState<any>([])
    const [archiveVessel, setArchiveVessel] = useState<boolean>(false)
    const [activeVessels, setActiveVessels] = useState<boolean>(true)
    const [showActiveVessels, setShowActiveVessels] = useState(true)
    const [loading, setLoading] = useState<boolean>(true)
    const [vesselPhoto, setVesselPhoto] = useState<any>([])
    const [imCrew, setImCrew] = useState(false)
    const handleSetVessels = (vessels: any) => {
        // const vesselListWithTrainingStatus =
        //     GetVesselListWithTrainingAndMaintenanceStatus(vessels)
        // const activeVessels = vesselListWithTrainingStatus.filter(
        //     (vessel: any) => !vessel.archived,
        // )
        // const archivedVessels = vesselListWithTrainingStatus.filter(
        //     (vessel: any) => vessel.archived,
        // )
        setVessels(vessels.filter((vessel: any) => vessel.showOnDashboard))
        // setActiveVessels(activeVessels)
        // setArchiveVessel(archivedVessels)
        setLoading(false)
        // const openLogBooks = vessels
        //     .filter((vessel: any) => vessel.logBookEntries.nodes.length > 0)
        //     .map((vessel: any) => ({
        //         vessel: vessel.id,
        //         entries: vessel.logBookEntries.nodes,
        //     }))
    }

    getDashboardVesselList(handleSetVessels)

    useEffect(() => {
        setImCrew(isCrew())
    }, [])
    return (
        <div className="w-full flex flex-col gap-4">
            <div className="hidden lg:flex lg:flex-row justify-end items-center">
                <SeaLogsButton
                    action={() => {
                        setShowActiveVessels(!showActiveVessels),
                            setVessels(
                                showActiveVessels
                                    ? archiveVessel
                                    : activeVessels,
                            )
                    }}
                    icon="record"
                    color="slblue"
                    type="text"
                    text={`${showActiveVessels ? 'View archived vessels' : 'View active vessels'}`}
                />
                {!imCrew && (
                    <SeaLogsButton
                        link={`/vessel/create`}
                        icon="new_vessel"
                        type="primary"
                        text="Add vessel"
                    />
                )}
            </div>
            <div className="flex w-full justify-start flex-col md:flex-row items-start">
                <div className="relative shadown-0none md:shadow-sm w-full border-none md:border border-slblue-100 rounded-lg">
                    <div className="overflow-scroll">
                        {loading ? (
                            <List heading="All Vessels" />
                        ) : (
                            <>
                                <div className="hidden sm:block">
                                    <TableWrapper
                                        bodyClass="overflow-auto h-[calc(100svh-12rem)]"
                                        headings={[
                                            'All Vessels:firstHead',
                                            'P.O.B',
                                            'Training:center',
                                            'Maintenance:center',
                                            ' ',
                                        ]}>
                                        {vessels.map((vessel: any) => (
                                            <tr
                                                key={vessel.id}
                                                className={`border-b border-sldarkblue-100 even:bg-sllightblue-50/50 dark:border-slblue-50 hover:bg-sllightblue-50 dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90 `}>
                                                <th
                                                    scope="row"
                                                    className="pl-6 p-3 text-left lg:w-1/3">
                                                    <div className="flex flex-col md:flex-row gap-2 whitespace-nowrap">
                                                        <div className="flex flex-col sm:flex-row gap-3">
                                                            <Link
                                                                className="w-12"
                                                                href={`/vessel/info?id=${vessel.id}`}>
                                                                <VesselIcon
                                                                    vessel={
                                                                        vessel
                                                                    }
                                                                />
                                                            </Link>
                                                            <div className="flex flex-col">
                                                                <Link
                                                                    href={`/vessel/info?id=${vessel.id}`}
                                                                    className="text-base font-normal hover:text-sllightblue-1000">
                                                                    {
                                                                        vessel.title
                                                                    }
                                                                </Link>
                                                                <VesselLogStatus
                                                                    vessel={
                                                                        vessel
                                                                    }
                                                                    icon={false}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="block sm:hidden font-light text-sm">
                                                            <table
                                                                cellPadding={5}>
                                                                <thead></thead>
                                                                <tbody>
                                                                    <tr>
                                                                        <td>
                                                                            <div className="flex justify-center text-sm dark:text-white">
                                                                                <VesselPOB
                                                                                    vessel={
                                                                                        vessel
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            P.O.B
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <div className="flex justify-center">
                                                                                {/* <div className="flex">
                                                                                    {vessel
                                                                                        .trainingStatus
                                                                                        .label !==
                                                                                    'Good' ? (
                                                                                        <div>
                                                                                            <DialogTrigger>
                                                                                                <SeaLogsButton
                                                                                                    icon="alert"
                                                                                                    className="w-5 h-5"
                                                                                                />
                                                                                                <Popover>
                                                                                                    <div className="bg-sllightblue-50 rounded p-2">
                                                                                                        <div className="text-xs whitespace-nowrap font-medium focus:outline-none inline-block rounded px-3 py-1 bg-sky-100 text-sky-800">
                                                                                                            {vessel.trainingStatus.dues.map(
                                                                                                                (
                                                                                                                    item: any,
                                                                                                                    dueIndex: number,
                                                                                                                ) => (
                                                                                                                    <div
                                                                                                                        key={
                                                                                                                            dueIndex
                                                                                                                        }>
                                                                                                                        {`${item.trainingType.title} - ${item.status.label}`}
                                                                                                                    </div>
                                                                                                                ),
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </Popover>
                                                                                            </DialogTrigger>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div>
                                                                                            <img
                                                                                                src="/sealogs-ok-check.svg"
                                                                                                alt="Warning"
                                                                                                className="h-5 w-5 flex-shrink-0"
                                                                                            />
                                                                                        </div>
                                                                                    )}
                                                                                </div> */}
                                                                                <div>
                                                                                            <img
                                                                                                src="/sealogs-ok-check.svg"
                                                                                                alt="Warning"
                                                                                                className="h-5 w-5 flex-shrink-0"
                                                                                            />
                                                                                        </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="font-light text-sm">
                                                                            Training
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <div className="flex justify-center">
                                                                                <div className="flex">
                                                                                    {/* {vessel
                                                                                        .taskStatus
                                                                                        .label !==
                                                                                    'Good' ? (
                                                                                        <div>
                                                                                           
                                                                                            <DialogTrigger>
                                                                                                <SeaLogsButton
                                                                                                    icon="alert"
                                                                                                    className="w-5 h-5"
                                                                                                />
                                                                                                <Popover>
                                                                                                    <div className="bg-slblue-1000 rounded p-2">
                                                                                                        <div className="text-xs whitespace-nowrap font-medium focus:outline-none inline-block rounded px-3 py-1 bg-sky-100 text-slblue-800">
                                                                                                            {vessel.taskStatus.tasks.map(
                                                                                                                (
                                                                                                                    item: any,
                                                                                                                    taskIndex: number,
                                                                                                                ) => (
                                                                                                                    <div
                                                                                                                        className="text-slred-1000"
                                                                                                                        key={
                                                                                                                            taskIndex
                                                                                                                        }>
                                                                                                                        {`${item.name} - ${item.isOverdue.days}`}
                                                                                                                    </div>
                                                                                                                ),
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </Popover>
                                                                                            </DialogTrigger>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div>
                                                                                            <img
                                                                                                src="/sealogs-ok-check.svg"
                                                                                                alt="Warning"
                                                                                                className="h-5 w-5 flex-shrink-0"
                                                                                            />
                                                                                        </div>
                                                                                    )} */}
                                                                                    <div>
                                                                                            <img
                                                                                                src="/sealogs-ok-check.svg"
                                                                                                alt="Warning"
                                                                                                className="h-5 w-5 flex-shrink-0"
                                                                                            />
                                                                                        </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="font-light text-sm">
                                                                            Maintenance
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </th>
                                                <td className="px-2 py-3">
                                                    <div className="flex justify-center text-sm dark:text-white">
                                                        <VesselPOB
                                                            vessel={vessel}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-2 p-3">
                                                    <div className="flex justify-center">
                                                        <div className="flex">
                                                            {/* {vessel
                                                                .trainingStatus
                                                                .label !==
                                                            'Good' ? (
                                                                <div>
                                                                  
                                                                    <DialogTrigger>
                                                                        <SeaLogsButton
                                                                            icon="alert"
                                                                            className="w-9 h-9"
                                                                        />
                                                                        <Popover>
                                                                            <div className="bg-sllightblue-50 rounded p-2">
                                                                                <div className="text-xs whitespace-nowrap font-medium focus:outline-none inline-block rounded px-3 py-1 bg-sky-100 text-sky-800">
                                                                                    {vessel.trainingStatus.dues.map(
                                                                                        (
                                                                                            item: any,
                                                                                            dueIndex: number,
                                                                                        ) => (
                                                                                            <div
                                                                                                key={
                                                                                                    dueIndex
                                                                                                }>
                                                                                                {`${item.trainingType.title} - ${item.status.label}`}
                                                                                            </div>
                                                                                        ),
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </Popover>
                                                                    </DialogTrigger>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <img
                                                                        src="/sealogs-ok-check.svg"
                                                                        alt="Warning"
                                                                        className="ml-3 mr-1 h-9 w-9 flex-shrink-0"
                                                                    />
                                                                </div>
                                                            )} */}
                                                            <div>
                                                                    <img
                                                                        src="/sealogs-ok-check.svg"
                                                                        alt="Warning"
                                                                        className="ml-3 mr-1 h-9 w-9 flex-shrink-0"
                                                                    />
                                                                </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-2 p-3">
                                                    <div className="flex justify-center">
                                                        <div className="flex">
                                                            {/* {vessel.taskStatus
                                                                .label !==
                                                            'Good' ? (
                                                                <div>
                                                                    
                                                                    <DialogTrigger>
                                                                        <SeaLogsButton
                                                                            icon="alert"
                                                                            className="w-9 h-9"
                                                                        />
                                                                        <Popover>
                                                                            <div className="bg-slblue-1000 rounded p-2">
                                                                                <div className="text-xs whitespace-nowrap font-medium focus:outline-none inline-block rounded px-3 py-1 bg-sky-100 text-slblue-800">
                                                                                    {vessel.taskStatus.tasks.map(
                                                                                        (
                                                                                            item: any,
                                                                                            taskIndex: number,
                                                                                        ) => (
                                                                                            <div
                                                                                                className="text-slred-1000"
                                                                                                key={
                                                                                                    taskIndex
                                                                                                }>
                                                                                                {`${item.name} - ${item.isOverdue.days}`}
                                                                                            </div>
                                                                                        ),
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </Popover>
                                                                    </DialogTrigger>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <img
                                                                        src="/sealogs-ok-check.svg"
                                                                        alt="Warning"
                                                                        className="ml-3 mr-1 h-9 w-9 flex-shrink-0"
                                                                    />
                                                                </div>
                                                            )} */}
                                                              <div>
                                                                    <img
                                                                        src="/sealogs-ok-check.svg"
                                                                        alt="Warning"
                                                                        className="ml-3 mr-1 h-9 w-9 flex-shrink-0"
                                                                    />
                                                                </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="pe-4">
                                                    {vessel?.vehiclePositions
                                                        ?.nodes?.length > 0 &&
                                                    (vessel.vehiclePositions
                                                        .nodes[0].geoLocation
                                                        .id > 0 ||
                                                        (vessel.vehiclePositions
                                                            .nodes[0].lat &&
                                                            vessel
                                                                .vehiclePositions
                                                                .nodes[0]
                                                                .lat)) ? (
                                                        <DialogTrigger>
                                                            <SeaLogsButton
                                                                icon="location"
                                                                className="m-auto"
                                                            />
                                                            <Popover>
                                                                <PopoverWrapper>
                                                                    <LocationMap
                                                                        position={[
                                                                            vessel
                                                                                .vehiclePositions
                                                                                .nodes[0]
                                                                                .lat ||
                                                                                vessel
                                                                                    .vehiclePositions
                                                                                    .nodes[0]
                                                                                    .geoLocation
                                                                                    .lat,
                                                                            vessel
                                                                                .vehiclePositions
                                                                                .nodes[0]
                                                                                .long ||
                                                                                vessel
                                                                                    .vehiclePositions
                                                                                    .nodes[0]
                                                                                    .geoLocation
                                                                                    .long,
                                                                        ]}
                                                                        zoom={7}
                                                                        vessel={
                                                                            vessel
                                                                        }
                                                                    />
                                                                    {
                                                                        vessel
                                                                            .vehiclePositions
                                                                            .nodes[0]
                                                                            .geoLocation
                                                                            .title
                                                                    }
                                                                </PopoverWrapper>
                                                            </Popover>
                                                        </DialogTrigger>
                                                    ) : (
                                                        <> </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </TableWrapper>
                                </div>
                                <div className="block sm:hidden">
                                    {vessels.map((vessel: any) => (
                                        <div
                                            key={vessel.id}
                                            className="p-3 w-full bg-white border border-slblue-200 rounded-lg dark:bg-slblue-800 dark:border-slblue-1000 mb-4">
                                            <div className="flex flex-row gap-2 pb-2">
                                                <Link
                                                    className="w-12 shrink-0"
                                                    href={`/vessel/info?id=${vessel.id}`}>
                                                    <VesselIcon
                                                        vessel={vessel}
                                                    />
                                                </Link>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex flex-row gap-4">
                                                        <Link
                                                            href={`/vessel/info?id=${vessel.id}`}
                                                            className="text-base font-normal hover:text-sllightblue-1000">
                                                            {vessel.title}
                                                        </Link>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-2 justify-start">
                                                        <div className="text-nowrap col-span-2">
                                                            <VesselLogStatus
                                                                vessel={vessel}
                                                                icon={false}
                                                            />
                                                        </div>
                                                        <div className="flex flex-row justify-start items-center gap-2 col-span-1">
                                                            <VesselPOB
                                                                vessel={vessel}
                                                            />
                                                            <label
                                                                className={
                                                                    classes.label
                                                                }>
                                                                P.O.B
                                                            </label>
                                                        </div>
                                                        <div className="">
                                                            {vessel
                                                                ?.vehiclePositions
                                                                ?.nodes
                                                                ?.length > 0 &&
                                                            (vessel
                                                                .vehiclePositions
                                                                .nodes[0]
                                                                .geoLocation
                                                                .id > 0 ||
                                                                (vessel
                                                                    .vehiclePositions
                                                                    .nodes[0]
                                                                    .lat &&
                                                                    vessel
                                                                        .vehiclePositions
                                                                        .nodes[0]
                                                                        .lat)) ? (
                                                                <DialogTrigger>
                                                                    <SeaLogsButton
                                                                        icon="location"
                                                                        className="m-auto"
                                                                    />
                                                                    <Popover>
                                                                        <PopoverWrapper>
                                                                            <LocationMap
                                                                                position={[
                                                                                    vessel
                                                                                        .vehiclePositions
                                                                                        .nodes[0]
                                                                                        .lat ||
                                                                                        vessel
                                                                                            .vehiclePositions
                                                                                            .nodes[0]
                                                                                            .geoLocation
                                                                                            .lat,
                                                                                    vessel
                                                                                        .vehiclePositions
                                                                                        .nodes[0]
                                                                                        .long ||
                                                                                        vessel
                                                                                            .vehiclePositions
                                                                                            .nodes[0]
                                                                                            .geoLocation
                                                                                            .long,
                                                                                ]}
                                                                                zoom={
                                                                                    7
                                                                                }
                                                                                vessel={
                                                                                    vessel
                                                                                }
                                                                            />
                                                                            {
                                                                                vessel
                                                                                    .vehiclePositions
                                                                                    .nodes[0]
                                                                                    .geoLocation
                                                                                    .title
                                                                            }
                                                                        </PopoverWrapper>
                                                                    </Popover>
                                                                </DialogTrigger>
                                                            ) : (
                                                                <> </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex flex-row justify-start gap-2">
                                                        <div className="flex flex-row w-100 gap-2 items-center">
                                                            {/* {vessel.taskStatus
                                                                .label !==
                                                            'Good' ? (
                                                                <div>
                                                                    
                                                                    <DialogTrigger>
                                                                        <SeaLogsButton
                                                                            icon="alert"
                                                                            className="w-5 h-5"
                                                                        />
                                                                        <Popover>
                                                                            <div className="bg-slblue-1000 rounded p-2">
                                                                                <div className="text-xs whitespace-nowrap font-medium focus:outline-none inline-block rounded px-3 py-1 bg-sky-100 text-slblue-800">
                                                                                    {vessel.taskStatus.tasks.map(
                                                                                        (
                                                                                            item: any,
                                                                                            taskIndex: number,
                                                                                        ) => (
                                                                                            <div
                                                                                                className="text-slred-1000"
                                                                                                key={
                                                                                                    taskIndex
                                                                                                }>
                                                                                                {`${item.name} - ${item.isOverdue.days}`}
                                                                                            </div>
                                                                                        ),
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </Popover>
                                                                    </DialogTrigger>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <img
                                                                        src="/sealogs-ok-check.svg"
                                                                        alt="Warning"
                                                                        className="h-5 w-5 flex-shrink-0"
                                                                    />
                                                                </div>
                                                            )} */}
                                                            <div>
                                                                    <img
                                                                        src="/sealogs-ok-check.svg"
                                                                        alt="Warning"
                                                                        className="h-5 w-5 flex-shrink-0"
                                                                    />
                                                                </div>
                                                            <label
                                                                className={`${classes.label} !w-24`}>
                                                                Training
                                                            </label>
                                                        </div>
                                                        <div className="flex flex-row w-100 gap-2 items-center">
                                                            {/* {vessel
                                                                .trainingStatus
                                                                .label !==
                                                            'Good' ? (
                                                                <div>
                                                                 
                                                                    <DialogTrigger>
                                                                        <SeaLogsButton
                                                                            icon="alert"
                                                                            className="w-5 h-5"
                                                                        />
                                                                        <Popover>
                                                                            <div className="bg-sllightblue-50 rounded p-2">
                                                                                <div className="text-xs whitespace-nowrap font-medium focus:outline-none inline-block rounded px-3 py-1 bg-sky-100 text-sky-800">
                                                                                    {vessel.trainingStatus.dues.map(
                                                                                        (
                                                                                            item: any,
                                                                                            dueIndex: number,
                                                                                        ) => (
                                                                                            <div
                                                                                                key={
                                                                                                    dueIndex
                                                                                                }>
                                                                                                {`${item.trainingType.title} - ${item.status.label}`}
                                                                                            </div>
                                                                                        ),
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </Popover>
                                                                    </DialogTrigger>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <img
                                                                        src="/sealogs-ok-check.svg"
                                                                        alt="Warning"
                                                                        className="h-5 w-5 flex-shrink-0"
                                                                    />
                                                                </div>
                                                            )} */}
                                                            <div>
                                                                    <img
                                                                        src="/sealogs-ok-check.svg"
                                                                        alt="Warning"
                                                                        className="h-5 w-5 flex-shrink-0"
                                                                    />
                                                                </div>
                                                            <label
                                                                className={
                                                                    classes.label
                                                                }>
                                                                Maintenance
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
