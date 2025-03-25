'use client'
import LogDate from './log-date'
import MasterList from './master'
import LogTabs from './tabs'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import {
    Button,
    Heading,
    Select as PopupSelect,
    DialogTrigger,
    ModalOverlay,
    Dialog,
    Modal,
    Popover,
    ListBoxItem,
    ListBox,
} from 'react-aria-components'
import Link from 'next/link'

export default function LogBook(props: any) {
    const setNavTab = (tab: string) => () => {
        props.setNavTab(tab)
    }
    const date_params = {
        disable: false,
        startLabel: 'Start Date',
        endLabel: 'End Date',
        startDate: new Date(),
        endDate: new Date(),
        handleStartDateChange: false,
        handleEndDateChange: false,
        showOvernightCheckbox: false,
        showEndDate: false,
        checked: false,
        handleShowEndDat: false,
    }
    return (
        <div className="w-full p-0 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="bg-blue-900 dark:bg-gray-900 text-white shadow flex justify-between">
                <DialogTrigger>
                    <Button className={`outline-none mr-2`}>
                        <EllipsisVerticalIcon className="w-7 text-white font-bold" />
                    </Button>
                    <Popover>
                        {() => (
                            <Dialog
                                role="alertdialog"
                                className="relative bg-gray-100 p-4 flex flex-col items-start">
                                <Link href="/log-entries/customise-log-books/1/edit">
                                    <Button className={`p-1 w-full text-left`}>
                                        Engine log configuration
                                    </Button>
                                </Link>
                            </Dialog>
                        )}
                    </Popover>
                </DialogTrigger>
            </div>
            <div className="p-4">
                <div className="flex justify-start flex-col md:flex-row items-start">
                    <LogDate
                        edit_logBookEntry={false}
                        log_params={date_params}
                        setStartDate={() => {}}
                        setEndDate={() => {}}
                    />
                </div>
            </div>
        </div>
    )
}
