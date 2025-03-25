'use client';
import EngineConfiguration from '@/app/ui/configurations/engine';
import { useState } from 'react';
import { Heading, Button } from 'react-aria-components';

export default function Page() {
    const [tab, setTab] = useState('engineConf');
    const tabClasses = {
        active: 'inline-block px-4 py-3 text-white bg-blue-600 rounded-lg active',
        inactive: 'inline-flex items-center px-4 py-3 rounded-lg hover:text-gray-900 bg-gray-50 hover:bg-gray-100 w-full dark:bg-gray-700 dark:hover:bg-gray-900 dark:hover:text-white',
    }
    const changeTab = (tab: string) => () => {
        setTab(tab);
    }
    return (
        <div className="w-full" >
            <div className='relative bg-white dark:bg-gray-800 overflow-x-auto shadow-md sm:rounded-lg'>
                <div className='bg-blue-900 flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 dark:bg-gray-900'>
                    <Heading className='font-semibold text-white p-4'>Logbook Configuration</Heading>
                </div>
                <ul className="flex mt-4 px-4 flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                    <li className="me-2">
                        <Button className={`${tab === 'tripLog' ? tabClasses.active : tabClasses.inactive}`} onPress={changeTab('tripLog')}>Logbook</Button>
                    </li>
                    {/*<li className="me-2">
                        <Button className={`${tab === 'engineConf' ? tabClasses.active : tabClasses.inactive}`} onPress={changeTab('engineConf')}>Engine</Button>
    </li>*/}
                    <li className="me-2">
                        <Button className={`${tab === 'crew' ? tabClasses.active : tabClasses.inactive}`} onPress={changeTab('crew')}>Crew</Button>
                    </li>
                    <li className="me-2">
                        <Button className={`${tab === 'crewTraining' ? tabClasses.active : tabClasses.inactive}`} onPress={changeTab('crewTraining')}>Training / Drills</Button>
                    </li>
                </ul>
                <hr className='my-4 mx-4' />
                {tab === 'engineConf' && (
                    <EngineConfiguration />
                )}
            </div>
        </div>
    );
}