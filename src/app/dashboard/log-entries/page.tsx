'use client'
import { useState } from 'react'
import {
    Heading,
    Button,
    Dialog,
    DialogTrigger,
    Popover,
    Link,
} from 'react-aria-components'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import LogDate from '@/app/ui/logbook/log-date'
import MasterList from '@/app/ui/logbook/master'
import { LogBookEntrySections } from '@/app/lib/definitions'
import EngineLogs from '@/app/ui/logbook/engine-logs'
import ComprehensiveEngineLogs from '@/app/ui/logbook/comprehensive-engine-logs'
import Crew from '@/app/ui/crew/crew'
import CrewTraining from '@/app/ui/crew/crew-training'
import CrewSupernumerary from '@/app/ui/crew/supernumerary'
import DailyChecks from '@/app/ui/daily-checks/checks'
import DepartTime from '@/app/ui/logbook/depart-time'
import DepartLocation from '@/app/ui/logbook/depart-location'
import EventType from '@/app/ui/logbook/event-type'
import { formatDateTime } from '@/app/helpers/dateHelper'

export default function Page() {
    const [tab, setTab] = useState('tripLog')

    const tabClasses = {
        active: 'inline-block px-4 py-3 text-white bg-blue-600 rounded-lg active',
        inactive:
            'inline-flex items-center px-4 py-3 rounded-lg hover:text-gray-900 bg-gray-50 hover:bg-gray-100 w-full dark:bg-gray-700 dark:hover:bg-gray-900 dark:hover:text-white',
    }

    const changeTab = (tab: string) => () => {
        setTab(tab)
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

    const master = {
        master: {
            FirstName: 'John',
            Surname: 'Doe',
            ID: '1',
        },
    }

    return (
        <>
            <div className="w-full px-5 dark:text-white border border-slblue-50 bg-blue-50 mb-10">
                <div className="flex justify-between px-8 py-3 items-center bg-sldarkblue-900 rounded-t-lg">
                    <Heading className="font-light font-monasans text-2xl text-white">
                        Vessel Name
                    </Heading>
                    <DialogTrigger>
                        <Button className={`outline-none mr-2`}>
                            <EllipsisVerticalIcon className="w-7 text-white font-bold" />
                        </Button>
                        <Popover>
                            {() => (
                                <Dialog
                                    role="alertdialog"
                                    className="relative bg-gray-100 p-4 flex flex-col items-start">
                                    {/* <Link href="/dashboard/log-entries/customise-log-books/1/edit"> */}
                                    <Link href="/dashboard/log-entries">
                                        <Button
                                            className={`p-1 w-full text-left`}>
                                            Engine Log Configuration
                                        </Button>
                                    </Link>
                                </Dialog>
                            )}
                        </Popover>
                    </DialogTrigger>
                </div>
                <div className="">
                    <div className="py-4 flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="px-4 flex flex-col md:flex-row justify-start items-end gap-4">
                            <LogDate
                                edit_logBookEntry={false}
                                log_params={date_params}
                                setStartDate={() => {}}
                                setEndDate={() => {}}
                            />
                            <MasterList
                                edit_logBookEntry={false}
                                master={{}}
                                masterTerm={'Master'}
                                setMaster={() => ({})}
                                crewMembers={{}}
                            />
                            <div className="flex flex-col items-start gap-2 p-2 px-4 mx-4 bg-green-100 text-green-900 rounded w-full lg:w-auto md:w-auto">
                                <div className="flex items-center gap-2">
                                    <span>Completed </span>
                                    <span>
                                        {formatDateTime(
                                            new Date().toLocaleString(),
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 flex justify-end items-center gap-4 w-full md:w-auto">
                            <Button className="w-full md:w-48 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                PDF
                            </Button>
                        </div>
                    </div>

                    <div className="pb-4">
                        <ul className="px-4 flex flex-wrap mt-4 text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                            <li className="w-full sm:w-auto me-2 mb-2 lg:mb-0 md:mb-0">
                                <Button
                                    className={`${tab === 'tripLog' ? tabClasses.active : tabClasses.inactive} w-full sm:w-auto`}
                                    onPress={changeTab('tripLog')}>
                                    Trip Log
                                </Button>
                            </li>
                            <li className="w-full sm:w-auto me-2 mb-2 lg:mb-0 md:mb-0">
                                <Button
                                    className={`${tab === 'engineLog' ? tabClasses.active : tabClasses.inactive} w-full sm:w-auto`}
                                    onPress={changeTab('engineLog')}>
                                    Engine Log
                                </Button>
                            </li>
                            <li className="w-full sm:w-auto me-2 mb-2 lg:mb-0 md:mb-0">
                                <Button
                                    className={`${tab === 'compengineLog' ? tabClasses.active : tabClasses.inactive} w-full sm:w-auto`}
                                    onPress={changeTab('compengineLog')}>
                                    Comprehensive Engine Log
                                </Button>
                            </li>
                            <li className="w-full sm:w-auto me-2 mb-2 lg:mb-0 md:mb-0">
                                <Button
                                    className={`${tab === 'crew' ? tabClasses.active : tabClasses.inactive} w-full sm:w-auto`}
                                    onPress={changeTab('crew')}>
                                    Crew
                                </Button>
                            </li>
                            <li className="w-full sm:w-auto me-2 mb-2 lg:mb-0 md:mb-0">
                                <Button
                                    className={`${tab === 'crewTraining' ? tabClasses.active : tabClasses.inactive} w-full sm:w-auto`}
                                    onPress={changeTab('crewTraining')}>
                                    Training / Drills
                                </Button>
                            </li>
                            <li className="w-full sm:w-auto me-2 mb-2 lg:mb-0 md:mb-0">
                                <Button
                                    className={`${tab === 'supernumerary' ? tabClasses.active : tabClasses.inactive} w-full sm:w-auto`}
                                    onPress={changeTab('supernumerary')}>
                                    Supernumerary
                                </Button>
                            </li>
                            <li className="w-full sm:w-auto me-2 mb-2 lg:mb-0 md:mb-0">
                                <Button
                                    className={`${tab === 'dailyChecks' ? tabClasses.active : tabClasses.inactive} w-full sm:w-auto`}
                                    onPress={changeTab('dailyChecks')}>
                                    Daily Checks
                                </Button>
                            </li>
                        </ul>

                        <hr className="my-4" />
                        {tab === 'tripLog' && (
                            <>
                                <div className="px-4">
                                    <div>{/* <DepartTime /> */}</div>
                                    <hr className="my-4" />
                                    <div>{/* <DepartLocation /> */}</div>
                                    <hr className="my-4" />
                                    <div>{/* <EventType /> */}</div>
                                </div>
                                <hr className="my-4" />
                                <div className="flex-col justify-between px-4 lg:flex md:flex">
                                    <button
                                        type="button"
                                        className="w-full lg:w-48 md:w-48 mb-2 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full lg:w-48 md:w-48 mb-5 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        Save
                                    </button>
                                </div>
                            </>
                        )}
                        {tab === 'engineLog' && (
                            <div>
                                <div className="px-4 grid grid-cols-1 lg:grid-cols-2 gap-4  items-center dark:text-white">
                                    {/* <EngineLogs label="Port Engine" />
                                    <EngineLogs label="Starboard Engine" /> */}
                                </div>
                            </div>
                        )}
                        {tab === 'compengineLog' && (
                            <div>
                                <div className="grid grid-cols-1 px-4 items-center dark:text-white">
                                    {/* <ComprehensiveEngineLogs /> */}
                                </div>
                                <hr className="my-4" />
                                <div className="flex justify-between px-4">
                                    <button
                                        type="button"
                                        className="w-48 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="w-48 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        Save
                                    </button>
                                </div>
                            </div>
                        )}
                        {tab === 'crew' && (
                            <>
                                <div className="px-4">
                                    {/* <Crew /> */}
                                    <hr className="my-4" />
                                </div>
                                <div className="flex justify-between px-4">
                                    <button
                                        type="button"
                                        className="w-48 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="w-48 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        Save
                                    </button>
                                </div>
                            </>
                        )}
                        {tab === 'crewTraining' && (
                            <>
                                <div className="px-4">
                                    <CrewTraining />
                                </div>
                                <hr className="my-4" />
                                <div className="flex justify-between px-4">
                                    <button
                                        type="button"
                                        className="w-48 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="w-48 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        Save
                                    </button>
                                </div>
                            </>
                        )}
                        {tab === 'supernumerary' && (
                            <>
                                <div className="px-4">
                                    {/* <CrewSupernumerary /> */}
                                </div>
                                <hr className="my-4" />
                                <div className="flex justify-between px-4">
                                    <button
                                        type="button"
                                        className="w-48 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="w-48 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        Save
                                    </button>
                                </div>
                            </>
                        )}
                        {tab === 'dailyChecks' && (
                            <div>{/* <DailyChecks /> */}</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
