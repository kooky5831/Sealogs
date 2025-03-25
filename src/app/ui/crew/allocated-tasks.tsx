'use client'
import { Heading, Button, DialogTrigger, Popover } from 'react-aria-components'
import Link from 'next/link'
import { List } from '../skeletons'
import dayjs from 'dayjs'
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline'
import {
    TableWrapper,
    SeaLogsButton,
    PopoverWrapper,
} from '@/app/components/Components'
import { isEmpty } from 'lodash'
import { usePathname, useSearchParams } from 'next/navigation'
import { formatDate } from '@/app/helpers/dateHelper'

const CrewAllocatedTasks = ({ taskList }: { taskList?: any }) => {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    return (
        <div className="w-full p-0">
            {!taskList ? (
                <List />
            ) : (
                <TableWrapper headings={['Name:firstHead', 'Due date:last']}>
                    {taskList.map((task: any) => (
                        <tr
                            key={task.id}
                            className={`group border-b dark:border-slblue-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                            <td className="px-2 py-3 lg:px-6 min-w-1/2">
                                <div className="flex items-center justify-between">
                                    <span className="font-normal text-foreground flex items-center">
                                        <Link
                                            href={`/maintenance?taskID=${task.id}&redirect_to=${pathname}?${searchParams.toString()}`}
                                            className="focus:outline-none group-hover:text-sllightblue-1000">
                                            {task.name}
                                        </Link>
                                        <div
                                            className={`inline-block rounded px-3 py-1 ml-3 text-xs ${task?.isOverDue?.status === 'High' ? 'text-slred-800 bg-slred-100' : ''} ${task?.isOverDue?.status === 'Low' || task?.isOverDue?.status === 'Upcoming' || task?.isOverDue?.status === 'Completed' ? 'text-slgreen-1000 bg-slneon-100' : ''} ${task?.isOverDue?.status === 'Medium' || task?.isOverDue?.days === 'Save As Draft' ? 'text-yellow-600 bg-yellow-100' : ''} `}>
                                            {task?.isOverDue?.status &&
                                                [
                                                    'High',
                                                    'Medium',
                                                    'Low',
                                                ].includes(
                                                    task.isOverDue.status,
                                                ) &&
                                                task?.isOverDue?.days}
                                            {task?.isOverDue?.status ===
                                                'Completed' &&
                                                task?.isOverDue?.days ===
                                                    'Save As Draft' &&
                                                task?.isOverDue?.days}
                                            {task?.isOverDue?.status ===
                                                'Upcoming' &&
                                                task?.isOverDue?.days}
                                            {task?.isOverDue?.status ===
                                                'Completed' &&
                                                isEmpty(
                                                    task?.isOverDue?.days,
                                                ) &&
                                                task?.isOverDue?.status}
                                            {task?.isOverDue?.status ===
                                                'Completed' &&
                                                !isEmpty(
                                                    task?.isOverDue?.days,
                                                ) &&
                                                task?.isOverDue?.days !==
                                                    'Save As Draft' &&
                                                task?.isOverDue?.days}
                                            {/* {task?.isOverDue?.status !==
                                                'Completed' &&
                                            task?.isOverDue?.status !==
                                                'Upcoming'
                                                ? task?.isOverDue?.days
                                                : ''} */}
                                        </div>
                                    </span>
                                    <div className="flex">
                                        {task?.basicComponent?.id > 0 && (
                                            <div className="inline-block rounded px-3 py-1 ml-3 font-semibold bg-slightblue-100 text-sldarkblue-950">
                                                <span>
                                                    {task.basicComponent?.title}
                                                </span>
                                            </div>
                                        )}
                                        <div className="w-14 flex items-center pl-1">
                                            {task.Comments !== null && (
                                                <DialogTrigger>
                                                    <Button className="text-base outline-none px-1">
                                                        <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-sllightblue-800" />
                                                    </Button>
                                                    <Popover>
                                                        <PopoverWrapper>
                                                            {task.comments}
                                                        </PopoverWrapper>
                                                    </Popover>
                                                </DialogTrigger>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div>{task.Description}</div>
                                <div></div>
                            </td>
                            <td className="px-2 py-3 dark:text-white">
                                {formatDate(task.expires)}
                                <div
                                    className={`inline-block rounded px-3 py-1 ml-3 text-xs ${task.status == 'Completed' ? 'bg-slneon-100 text-slgreen-1000' : 'bg-slred-100 text-slred-800'}`}>
                                    <span>{task.status}</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </TableWrapper>
            )}
        </div>
    )
}

export default CrewAllocatedTasks
