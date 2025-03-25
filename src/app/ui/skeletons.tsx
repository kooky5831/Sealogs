import { Heading } from 'react-aria-components'
import Skeleton from '../components/Skeleton'
import { TableWrapper } from '../components/Components'

const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent'

export function CrewListTable() {
    return (
        <div className={`${shimmer}mb-2 w-full rounded-md bg-white p-4`}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                <div className="flex items-center">
                    <div className="mr-2 h-8 w-8 rounded-full bg-gray-100"></div>
                    <div className="h-6 w-16 rounded bg-gray-100"></div>
                </div>
                <div className="h-6 w-16 rounded bg-gray-100"></div>
            </div>
            <div className="flex w-full items-center justify-between pt-4">
                <div>
                    <div className="h-6 w-16 rounded bg-gray-100"></div>
                    <div className="mt-2 h-6 w-24 rounded bg-gray-100"></div>
                </div>
                <div className="flex justify-end gap-2">
                    <div className="h-10 w-10 rounded bg-gray-100"></div>
                    <div className="h-10 w-10 rounded bg-gray-100"></div>
                </div>
            </div>
        </div>
    )
}

export function LogBookEntrySkeleton() {
    return (
        <div
            className={`${shimmer} w-full p-0 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700`}>
            <div className="bg-blue-900 dark:bg-gray-900 text-white shadow flex justify-between">
                <div className="text-white font-semibold p-3">
                    <div className="h-8 w-64 rounded bg-gray-100"></div>
                </div>
            </div>
            <div className="p-4">
                <LogDateSkeleton />
                <div className="mt-5 flex justify-start flex-col md:flex-row items-center">
                    <div className={`h-10 w-32 rounded bg-gray-100 mr-2`}></div>
                    <div className={`h-10 w-32 rounded bg-gray-100 mr-2`}></div>
                    <div className={`h-10 w-32 rounded bg-gray-100 mr-2`}></div>
                    <div className={`h-10 w-32 rounded bg-gray-100 mr-2`}></div>
                    <div className={`h-10 w-32 rounded bg-gray-100 mr-2`}></div>
                    <div className={`h-10 w-32 rounded bg-gray-100 mr-2`}></div>
                </div>
                <hr className="my-4" />
                <div className=" mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white">
                    <div className={`h-10 w-48 rounded bg-gray-100 mr-2`}></div>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                        <div className="flex md:items-center flex-col md:flex-row gap-2">
                            <div
                                className={`h-10 w-48 rounded bg-gray-100 mr-2`}></div>
                            <div
                                className={`h-10 w-48 rounded bg-gray-100 mr-2`}></div>
                        </div>
                    </div>
                </div>
                <div className=" mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white">
                    <div className={`h-10 w-48 rounded bg-gray-100 mr-2`}></div>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                        <div className="flex md:items-center flex-col md:flex-row gap-2">
                            <div
                                className={`h-10 w-48 rounded bg-gray-100 mr-2`}></div>
                            <div
                                className={`h-10 w-48 rounded bg-gray-100 mr-2`}></div>
                        </div>
                    </div>
                </div>
                <div className=" mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white">
                    <div className={`h-10 w-48 rounded bg-gray-100 mr-2`}></div>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                        <div className="flex md:items-center flex-col md:flex-row gap-2">
                            <div
                                className={`h-10 w-48 rounded bg-gray-100 mr-2`}></div>
                            <div
                                className={`h-10 w-48 rounded bg-gray-100 mr-2`}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function LogDateSkeleton() {
    return (
        <div className="mt-2 flex justify-start flex-col md:flex-row items-center">
            <div className={`h-8 w-48 rounded bg-gray-100 mr-2`}></div>
            <div className={`mr-2 h-8 w-8 rounded-full bg-gray-100`}></div>
            <div className={`h-8 w-48 rounded bg-gray-100`}></div>
        </div>
    )
}

export function CrewDutyListSkeleton() {
    return (
        <>
            {Array.from({ length: 3 }, (_, i) => (
                <tr key={i}>
                    <td className="pl-6">
                        <Skeleton />
                    </td>
                    <td>
                        <Skeleton />
                    </td>
                    <td>
                        <Skeleton />
                    </td>
                </tr>
            ))}
        </>
    )
}

export function TrainingSessionListSkeleton({
    memberId = 0 as number,
    vesselId = 0 as number,
}) {
    return (
        <div className="w-full p-0 shadow dark:bg-gray-800">
            <div className="relative overflow-x-auto shadow-md">
                {memberId === 0 && vesselId === 0 && (
                    <>
                        <div className="bg-blue-900 flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 dark:bg-gray-900">
                            <Heading className=" font-semibold text-white p-4">
                                Crew Training List
                            </Heading>
                        </div>
                        <div className="p-5 flex justify-between items-center text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                            <p className="mt-1 mx-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                                &nbsp;
                            </p>
                        </div>
                    </>
                )}
                <TableWrapper
                    headings={['Date', 'Type of Training', 'Trainer']}>
                    <tr className="bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4">
                            <Skeleton />
                        </td>
                        <td className="px-6 py-4">
                            <Skeleton />
                        </td>
                        <td className="px-6 py-4">
                            <Skeleton />
                        </td>
                        <td className="px-2 py-2">
                            <div className="flex justify-end flex-col md:flex-row">
                                <Skeleton />
                            </div>
                        </td>
                    </tr>
                    <tr className="bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4">
                            <Skeleton />
                        </td>
                        <td className="px-6 py-4">
                            <Skeleton />
                        </td>
                        <td className="px-6 py-4">
                            <Skeleton />
                        </td>
                        <td className="px-2 py-2">
                            <div className="flex justify-end flex-col md:flex-row">
                                <Skeleton />
                            </div>
                        </td>
                    </tr>
                    <tr className="bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4">
                            <Skeleton />
                        </td>
                        <td className="px-6 py-4">
                            <Skeleton />
                        </td>
                        <td className="px-6 py-4">
                            <Skeleton />
                        </td>
                        <td className="px-2 py-2">
                            <div className="flex justify-end flex-col md:flex-row">
                                <Skeleton />
                            </div>
                        </td>
                    </tr>
                </TableWrapper>
            </div>
        </div>
    )
}

export function TrainingSessionInfoSkeleton() {
    return (
        <div className="w-full p-0">
            <div className="flex justify-between pb-4 pt-3 items-center">
                <Heading className="flex items-center font-light font-monasans text-3xl dark:text-white">
                    <span className="font-medium mr-2">Training Session:</span>
                    <div className="w-48 ">
                        <InputSkeleton />
                    </div>
                </Heading>
                <div className="w-48 ">
                    <InputSkeleton />
                </div>
            </div>
            <div className="px-0 md:px-4 pt-4 border-t border-b">
                <div className="grid grid-cols-3 gap-6 py-4 px-4">
                    <div>Trainer</div>
                    <Skeleton />
                </div>
                <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div>Nature of Training</div>
                    <Skeleton />
                </div>
                <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div>Members</div>
                    <Skeleton />
                </div>
                <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div>Summary</div>
                    <Skeleton />
                </div>
                <hr className="my-4" />
                <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div className="my-4 text-xl">Signatures</div>
                    <Skeleton />
                </div>
            </div>
        </div>
    )
}

export function TrainingSessionFormSkeleton() {
    return (
        <div className="px-0 md:px-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                <div className="my-4 text-xl">Training Details</div>
                <div className="col-span-2">
                    <div className="flex w-full gap-4">
                        <div className="w-full">
                            <div className="w-full my-4 flex flex-col">
                                <label className="mb-1 text-sm">Trainer</label>
                                <InputSkeleton />
                            </div>
                            <div className="w-full mt-4 flex flex-col">
                                <InputSkeleton />
                            </div>
                        </div>
                        <div className="w-full mt-4 flex flex-col">
                            <label className="mb-1 text-sm">Crew</label>
                            <InputSkeleton />
                        </div>
                    </div>
                    <div className="flex w-full gap-4 mt-4">
                        <div className="w-full">
                            <InputSkeleton />
                        </div>
                        <div className="w-full">
                            <InputSkeleton />
                        </div>
                    </div>
                    <div className="w-full my-4 flex flex-col">
                        <InputSkeleton />
                    </div>
                </div>
            </div>
            <hr className="my-2" />
            <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                <div className="my-4 text-xl">Signatures</div>
                <div className="col-span-2 my-4 flex justify-between flex-wrap gap-4">
                    <InputSkeleton />
                </div>
            </div>
            <hr className="mb-4" />
            <div className="flex justify-end px-4 pb-4 pt-4">
                <div className="w-48 mr-4">
                    <InputSkeleton />
                </div>
                <div className="w-48 ">
                    <InputSkeleton />
                </div>
            </div>
        </div>
    )
}

export function TrainingTypeListSkeleton() {
    return (
        <div className="w-full p-0 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <div className="bg-blue-900 flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 dark:bg-gray-900">
                    <Heading className=" font-semibold text-white p-4">
                        Training Types
                    </Heading>
                </div>
                <div className="p-5 flex justify-between items-center text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                    &nbsp;
                </div>
                <div className="relative overflow-x-auto">
                    <TableWrapper
                        headings={[
                            'Nature of Training',
                            'Vessels',
                            'Occurs Every (days)',
                            'Medium Warning Within (days)',
                            'High Warning Within (days)',
                            '',
                        ]}>
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="px-6 py-4">
                                <Skeleton />
                            </td>
                            <td className="px-6 py-4">
                                <Skeleton />
                            </td>
                            <td className="px-6 py-4">
                                <Skeleton />
                            </td>
                            <td className="px-6 py-4">
                                <Skeleton />
                            </td>
                            <td className="px-6 py-4">
                                <Skeleton />
                            </td>
                            <td className="px-2 py-2">
                                <div className="flex justify-end flex-col md:flex-row">
                                    <Skeleton />
                                </div>
                            </td>
                        </tr>
                    </TableWrapper>
                </div>
            </div>
        </div>
    )
}

export function TrainingTypeInfoSkeleton() {
    return (
        <>
            <div className="flex justify-between pb-4 pt-3 items-center">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    Training Types
                </Heading>
                <div className="flex">
                    <div className="w-48 ">
                        <InputSkeleton />
                    </div>
                    <div className="w-48 ">
                        <InputSkeleton />
                    </div>
                </div>
            </div>
            <div className="px-0 md:px-4 py-4 border-t border-b">
                <div className="group hover:bg-white w-full grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div>Nature Of Training</div>
                    <Skeleton />
                </div>
                <div className="group hover:bg-white w-full grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div>Occurs Every</div>
                    <Skeleton />
                </div>
                <div className="group hover:bg-white w-full grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div>Medium Warning Within</div>
                    <Skeleton />
                </div>
                <div className="group hover:bg-white w-full grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div>High Warning Within</div>
                    <Skeleton />
                </div>
                <div className="group hover:bg-white w-full grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div>Procedure</div>
                    <Skeleton />
                </div>
                <div className="group hover:bg-white w-full grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div>Vessels</div>
                    <Skeleton />
                </div>
            </div>
        </>
    )
}

export function InputSkeleton() {
    return (
        <div className="relative overflow-hidden w-full">
            <div
                className={`${shimmer} h-11 bg-gray-100 w-full border border-gray-200 rounded-lg block p-2.5`}></div>
        </div>
    )
}

export function List(props?: any) {
    return (
        <TableWrapper
            headings={
                props.heading
                    ? [props.heading + ':firstHead', '', ':last']
                    : [':firstHead', '', ':last']
            }>
            <TR />
            <TR />
            <TR />
            <TR />
            <TR />
            <TR />
        </TableWrapper>
    )
}

export function TR() {
    return (
        <tr
            className={`border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
            <td scope="col" className="px-2 py-6 relative">
                <Skeleton />
            </td>
            <td scope="col" className="px-2 py-6 relative">
                <Skeleton />
            </td>
            <td scope="col" className="px-2 py-6 relative">
                <Skeleton />
            </td>
        </tr>
    )
}

export function DepartmentInfoSkeleton() {
    return (
        <div className="w-full p-0">
            <div className="flex justify-between pb-4 pt-3 items-center">
                <Heading className="flex items-center font-light font-monasans text-3xl dark:text-white">
                    <span className="font-medium mr-2">Department:</span>{' '}
                    <Skeleton />
                </Heading>
            </div>
            <div className="px-0 md:px-4 pt-4 border-t border-b dark:text-gray-100">
                <div className="grid grid-cols-3 gap-6 py-4 px-4">
                    <div>
                        <Skeleton />
                    </div>
                    <div className="col-span-2">
                        <Skeleton />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function DepartmentFormSkeleton() {
    return (
        <div className="w-full p-0">
            <div className="flex justify-between pb-4 pt-3">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    Department
                </Heading>
            </div>

            <div className="px-0 md:px-4 pt-4 border-t dark:text-white">
                <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div className="my-4 text-xl">
                        Department Details
                        <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Facilis possimus harum eaque itaque est id
                            reprehenderit excepturi eius temporibus, illo
                            officia amet nobis sapiente dolorem ipsa earum
                            adipisci recusandae cumque.
                        </p>
                    </div>
                    <div className="col-span-2">
                        <div className="flex w-full gap-4">
                            <div className="w-full">
                                <div className="w-full my-4 flex flex-col">
                                    <label className="mb-1 text-sm">Name</label>
                                    <InputSkeleton />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="mb-4" />
            </div>
        </div>
    )
}

export function DepartmentListSkeleton() {
    return (
        <TableWrapper headings={['Departments:firstHead']}>
            <tr
                className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-gray-800`}>
                <th scope="row" className="flex items-center px-2 py-3 lg:px-6">
                    <Skeleton />
                </th>
            </tr>
            <tr
                className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-gray-800`}>
                <th scope="row" className="flex items-center px-2 py-3 lg:px-6">
                    <Skeleton />
                </th>
            </tr>
            <tr
                className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-gray-800`}>
                <th scope="row" className="flex items-center px-2 py-3 lg:px-6">
                    <Skeleton />
                </th>
            </tr>
        </TableWrapper>
    )
}

export function GeoLocationListSkeleton() {
    return (
        <TableWrapper
            headings={['Location:firstHead', 'Latitude', 'Longitude']}>
            <tr
                className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                <td className="pl-6">
                    <Skeleton />
                </td>
                <td>
                    <Skeleton />
                </td>
                <td>
                    <Skeleton />
                </td>
            </tr>
            <tr
                className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                <td className="pl-6">
                    <Skeleton />
                </td>
                <td>
                    <Skeleton />
                </td>
                <td>
                    <Skeleton />
                </td>
            </tr>
            <tr
                className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                <td className="pl-6">
                    <Skeleton />
                </td>
                <td>
                    <Skeleton />
                </td>
                <td>
                    <Skeleton />
                </td>
            </tr>
        </TableWrapper>
    )
}
