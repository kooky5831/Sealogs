'use client'

import React, { useState } from 'react'
import { Button } from 'react-aria-components'
import DepartTime from './depart-time'
import DepartLocation from './depart-location'
import EventType from './event-type'
import EngineLogs from './engine-logs'
import ComprehensiveEngineLogs from './comprehensive-engine-logs'
import Crew from '../crew/crew'
import CrewTraining from '../crew/crew-training'
import CrewSupernumerary from '../crew/supernumerary'
import DailyChecks from '../daily-checks/checks'

export default function LogTabs() {
    const [tab, setTab] = useState('tripLog')

    const tabClasses = {
        active: 'inline-block px-4 py-3 text-white bg-blue-600 rounded-lg active',
        inactive:
            'inline-flex items-center px-4 py-3 rounded-lg hover:text-gray-900 bg-slblue-50 hover:bg-gray-100 w-full dark:bg-gray-700 dark:hover:bg-gray-900 dark:hover:text-white',
    }

    const changeTab = (tab: string) => () => {
        setTab(tab)
    }

    return (
        <div className="">
            <ul className="flex mt-4 flex-wrap text-xs font-normal text-center dark:text-slblue-400">
                <li className="me-2">
                    <Button
                        className={`${tab === 'crew' ? tabClasses.active : tabClasses.inactive}`}
                        onPress={changeTab('crew')}>
                        Crew
                    </Button>
                </li>
                <li className="me-2">
                    <Button
                        className={`${tab === 'supernumerary' ? tabClasses.active : tabClasses.inactive}`}
                        onPress={changeTab('supernumerary')}>
                        Supernumerary
                    </Button>
                </li>
                <li className="me-2">
                    <Button
                        className={`${tab === 'dailyChecks' ? tabClasses.active : tabClasses.inactive}`}
                        onPress={changeTab('dailyChecks')}>
                        Pre-departure Checks
                    </Button>
                </li>
                <li className="me-2">
                    <Button
                        className={`${tab === 'tripLog' ? tabClasses.active : tabClasses.inactive}`}
                        onPress={changeTab('tripLog')}>
                        Trip Log
                    </Button>
                </li>
                {/*<li className="me-2">
                    <Button className={`${tab === 'engineLog' ? tabClasses.active : tabClasses.inactive}`} onPress={changeTab('engineLog')}>Engine Log</Button>
    </li>*/}
                {/*<li className="me-2">
                    <Button className={`${tab === 'compengineLog' ? tabClasses.active : tabClasses.inactive}`} onPress={changeTab('compengineLog')}>Comprehensive Engine Log</Button>
    </li>*/}
                <li className="me-2">
                    <Button
                        className={`${tab === 'crewTraining' ? tabClasses.active : tabClasses.inactive}`}
                        onPress={changeTab('crewTraining')}>
                        Training / Drills
                    </Button>
                </li>
            </ul>
            <hr className="my-4" />
            {tab === 'tripLog' && (
                <div>
                    {/* <div>
                        <DepartTime />
                    </div>
                    <hr className='my-4' />
                    <div>
                        <DepartLocation />
                    </div>
                    <hr className='my-4' />
                    <div>
                        <EventType />
                    </div> */}
                </div>
            )}
            {tab === 'engineLog' && (
                <div>
                    {/* <Heading className='text-lg dark:text-white'>Engine Logs</Heading> */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-4 items-center dark:text-white">
                        {/* <EngineLogs label='Port Engine' />
                        <EngineLogs label='Starboard Engine' /> */}
                    </div>
                </div>
            )}
            {tab === 'compengineLog' && (
                <div>
                    {/* <Heading className='text-lg dark:text-white flex justify-between'>
                        Comprehensive Engine Log
                        <Link href={`/log-entries/settings`}>
                            <EllipsisVerticalIcon className="w-5" />
                        </Link>
                    </Heading> */}
                    <div className="grid grid-cols-1 gap-4 py-4 items-center dark:text-white">
                        {/* <ComprehensiveEngineLogs /> */}
                    </div>
                </div>
            )}
            {tab === 'crew' && (
                <div>
                    {/* <Heading className='text-lg dark:text-white'>Crew</Heading> */}
                    {/* <Crew /> */}
                </div>
            )}
            {tab === 'crewTraining' && (
                <div>
                    {/* <Heading className='text-lg dark:text-white'>Crew Training</Heading> */}
                    <CrewTraining />
                </div>
            )}
            {tab === 'supernumerary' && (
                <div>{/* <CrewSupernumerary /> */}</div>
            )}
            {tab === 'dailyChecks' && <div>{/* <DailyChecks/> */}</div>}
        </div>
    )
}
