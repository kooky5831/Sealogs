import { ThemeSwitcher } from '../components/ThemeSwitcher'
import SealogsLogo from './sealogs-logo'
import {
    Bars3Icon,
    XMarkIcon,
    UserIcon,
    ArrowLeftStartOnRectangleIcon,
    BuildingOfficeIcon,
    ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline'
import { SealogsCrewIcon } from '../lib/icons/SealogsCrewIcon'
import { SealogsDashboardIcon } from '../lib/icons/SealogsDashboardIcon'
import { SealogsVesselsIcon } from '../lib/icons/SealogsVesselsIcon'
import { SealogsMaintenanceIcon } from '../lib/icons/SealogsMaintenanceIcon'
import { SealogsInventoryIcon } from '../lib/icons/SealogsInventoryIcon'
import { SealogsHealthSafetyIcon } from '../lib/icons/SealogsHealthSafetyIcon'
import { SealogsUserIcon } from '../lib/icons/SealogsUserIcon'
import { SealogsDocumentLockerIcon } from '../lib/icons/SealogsDocumentLockerIcon'
import { Button } from 'react-aria-components'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GET_LOGBOOKENTRY, GetOpenLogEntries } from '../lib/graphQL/query'
import { CREATE_LOGBOOK_ENTRY } from '../lib/graphQL/mutation'
import { set } from 'lodash'

export default function TopBar(props: any) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const vesselId = searchParams.get('id') ?? 0
    const vesselID = searchParams.get('vesselID') ?? 0
    const logentryID = searchParams.get('logentryID') ?? 0
    const [loggedUserName, setLoggedUserName] = useState('')
    const [splittedName, setSplittedName] = useState('')
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [vesselLog, setVesselLog] = useState<any>(false)
    const [vesselState, setVesselState] = useState<any>('Locked')
    const [logBookID, setLogBookID] = useState<any>(0)
    const [openLogEntries, setOpenLogEntries] = useState<any>(false)
    const [isNewLogEntryDisabled, setIsNewLogEntryDisabled] =
        useState<boolean>(false)
    const handleSidebarOpen = () => {
        props.setSidebarOption({
            sidebarClass: 'w-full fixed',
            menuIconDisplay: false,
        })
    }

    useEffect(() => {
        if (pathname === '/vessel/info' && +vesselId > 0) {
            loadLogBookEntries(+vesselId)
        }
        if (pathname === '/log-entries/view' && +vesselID > 0) {
            loadLogBookEntries(+vesselID)
        }
        getOpenLogEntries()
    }, [pathname])

    const [getOpenLogEntries] = useLazyQuery(GetOpenLogEntries, {
        // fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readLogBookEntries.nodes.filter(
                (entry: any) => entry.vehicle.title != null,
            )
            setOpenLogEntries(data)
        },
        onError: (error: any) => {
            console.error('queryLogBookEntries error', error)
        },
    })

    const handleSetVesselState = (data: any) => {
        data.map((entry: any) => {
            if (logBookID == 0 && entry.logBookID > 0) {
                setLogBookID(entry.logBookID)
            }
            if (entry.state !== 'Locked') {
                setVesselLog(entry)
                setVesselState('Open')
            }
        })
    }

    const [queryLogBookEntries] = useLazyQuery(GET_LOGBOOKENTRY, {
        // fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const crew = response.readCrewMembers_LogBookEntrySections.nodes
            const entries = response.GetLogBookEntries.nodes
            const data = entries.map((entry: any) => {
                const crewData = crew.filter(
                    (crewMember: any) => crewMember.logBookEntryID === entry.id,
                )
                return {
                    ...entry,
                    crew: crewData,
                }
            })
            if (data) {
                handleSetVesselState(data)
            }
        },
        onError: (error: any) => {
            console.error('queryLogBookEntries error', error)
        },
    })

    const loadLogBookEntries = async (vesselId: number) => {
        await queryLogBookEntries({
            variables: {
                vesselId: +vesselId,
            },
        })
    }

    const classes = {
        icons: 'inline-block border rounded-full bg-slblue-100 border-white dark:border-gray-50 p-1 w-10 h-10 sm:w-12 sm:h-12',
        activeLink:
            'relative inline-block p-2 bg-slblue-1000 dark:bg-gray-600 rounded-full bottom-7',
    }
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setLoggedUserName(
                `${localStorage.getItem('firstName') ?? ''} ${localStorage.getItem('surname') ?? ''}`,
            )
        }
    }, [])
    function NameInitials(name: any) {
        if (!name) {
            return false
        }
        const [firstName, lastName] = name.split(' ')
        const firstInitial =
            firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase()
        setSplittedName(firstInitial)
    }

    useEffect(() => {
        NameInitials(loggedUserName)
    }, [loggedUserName])

    const handleCreateNewLogEntry = async () => {
        if (logBookID > 0) {
            setIsNewLogEntryDisabled(true)
            await createLogEntry({
                variables: {
                    input: {
                        vehicleID: vesselId,
                        logBookID: logBookID,
                    },
                },
            })
        }
    }

    const [createLogEntry] = useMutation(CREATE_LOGBOOK_ENTRY, {
        onCompleted: (response: any) => {
            router.push(
                `/log-entries/view/?vesselID=${vesselId}&logentryID=${response.createLogBookEntry.id}`,
            )
        },
        onError: (error: any) => {
            console.error('createLogEntry error', error)
        },
    })

    return (
        <aside
            id="sidebar-multi-level-sidebar"
            className="lg:hidden fixed bottom-0 left-0 z-50 w-full h-20 sm:h-24 transition-transform mt-24"
            aria-label="MobileNav">
            <div className="flex justify-between py-2 sm:py-4 bg-slblue-1000 dark:bg-gray-600 dark:text-white text-white text-center text-[12px]">
                <div className="grow w-1/5">
                    <Link
                        href={`/dashboard`}
                        className={`${pathname === '/dashboard' ? classes.activeLink : ''}`}>
                        <SealogsDashboardIcon
                            className={`${classes.icons} ${pathname === '/dashboard' ? '' : ' '}`}
                        />
                    </Link>
                    <div
                        className={`pt-1 ${pathname === '/dashboard' ? 'relative bottom-10 pt-3 pb-2' : ''}`}>
                        Port
                    </div>
                </div>
                <div className="grow w-1/5">
                    <>
                        {pathname === '/vessel/info' ||
                        pathname === '/log-entries/view' ||
                        pathname === '/log-entries' ? (
                            <>
                                {vesselState === 'Open' ? (
                                    <Link
                                        href={`/log-entries/view?&vesselID=${+vesselID > 0 ? vesselID : vesselId}&logentryID=${vesselLog?.id}`}
                                        className={`${pathname === '/vessel/info' || pathname === '/log-entries/view' || pathname === '/log-entries' ? classes.activeLink : ''}`}>
                                        <SealogsVesselsIcon
                                            className={classes.icons}
                                        />
                                    </Link>
                                ) : (
                                    <Button
                                        className={`${pathname === '/vessel/info' || pathname === '/log-entries/view' || pathname === '/log-entries' ? classes.activeLink : ''}`}
                                        onPress={handleCreateNewLogEntry}
                                        isDisabled={isNewLogEntryDisabled}>
                                        <SealogsVesselsIcon
                                            className={classes.icons}
                                        />
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                {openLogEntries?.length === 1 ? (
                                    <Link
                                        href={`/log-entries/view?&vesselID=${openLogEntries[0].vehicle.id}&logentryID=${openLogEntries[0].id}`}
                                        className={`${pathname === '/vessel' ? classes.activeLink : ''}`}>
                                        <SealogsVesselsIcon
                                            className={classes.icons}
                                        />
                                    </Link>
                                ) : openLogEntries?.length === 0 ? (
                                    <Button
                                        className={`${pathname === '/vessel/info' || pathname === '/log-entries/view' ? classes.activeLink : ''}`}
                                        onPress={handleCreateNewLogEntry}
                                        isDisabled={isNewLogEntryDisabled}>
                                        <SealogsVesselsIcon
                                            className={classes.icons}
                                        />
                                    </Button>
                                ) : (
                                    <Link
                                        href={`/vessel`}
                                        className={`${pathname === '/vessel' ? classes.activeLink : ''}`}>
                                        <SealogsVesselsIcon
                                            className={classes.icons}
                                        />
                                    </Link>
                                )}
                            </>
                        )}
                    </>
                    <div
                        className={`pt-1 ${pathname === '/vessel/info' || pathname === '/vessel' || pathname === '/log-entries/view' || pathname === '/log-entries' ? 'relative bottom-10 pt-4' : ''}`}>
                        Log
                    </div>
                </div>
                <div className="grow w-1/5 ">
                    <Link
                        href={`/crew-training`}
                        className={`${pathname === '/crew-training' ? classes.activeLink : ''}`}>
                        <SealogsCrewIcon
                            className={`${classes.icons} ${pathname === '/crew-training' ? ' ' : ' '}`}
                        />
                    </Link>
                    <div
                        className={`pt-1 ${pathname === '/crew-training' ? 'relative bottom-10 pt-4' : ''}`}>
                        Training
                    </div>
                </div>
                <div className="grow w-1/5">
                    <Link
                        href={`/maintenance`}
                        className={`${pathname === '/maintenance' ? classes.activeLink : ''}`}>
                        <SealogsMaintenanceIcon
                            className={`${classes.icons} ${pathname === '/crew' ? ' ' : ' '}`}
                        />
                    </Link>
                    <div
                        className={`pt-1 ${pathname === '/maintenance' ? 'relative bottom-10 pt-3 pb-2' : ''}`}>
                        Tasks
                    </div>
                </div>
                <div className="grow w-1/5 hidden sm:block">
                    <Link
                        href={`/document-locker`}
                        className={`${pathname === '/document-locker' ? classes.activeLink : ''}`}>
                        <SealogsDocumentLockerIcon
                            className={`${classes.icons} ${pathname === '/document-locker' ? ' ' : ' '}`}
                        />
                    </Link>
                    <div
                        className={`pt-1 ${pathname === '/document-locker' ? 'relative bottom-10 pt-4' : ''}`}>
                        Docs
                    </div>
                </div>
                <div className="grow w-1/5 relative">
                    <Link
                        href={''}
                        onClick={() => setIsPopupOpen(!isPopupOpen)}>
                        <div className={`py-4 text-large font-light`}>
                            {splittedName}
                        </div>
                    </Link>
                    {isPopupOpen && (
                        <div className="fixed bottom-20 right-2 mb-1">
                            <div className="bg-slblue-1000 rounded-lg py-4 px-6">
                                <ThemeSwitcher />
                                <Link href="/logout">
                                    <button className="py-1 flex font-normal text-base justify-start text-white dark:text-white">
                                        <span>Feedback</span>
                                    </button>
                                </Link>
                                <Link
                                    href="https://sealogsv2.tawk.help/"
                                    target="_blank">
                                    <button className="py-1 flex font-normal text-base justify-start text-white dark:text-white">
                                        <span>Help docs</span>
                                    </button>
                                </Link>
                                <Link href="/logout">
                                    <button className="py-1 flex font-normal text-base justify-start text-white dark:text-white">
                                        <span>Log Out</span>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    )
}
