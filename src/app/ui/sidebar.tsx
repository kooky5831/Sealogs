import SealogsLogo from './sealogs-logo'
import {
    Bars3Icon,
    XMarkIcon,
    UserIcon,
    ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline'
import Navigation from './navigation'
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components'
import Skeleton from '../components/Skeleton'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { SetStateAction, useEffect, useState } from 'react'
import Link from 'next/link'
import { isEmpty, uniqueId } from 'lodash'
import { usePathname } from 'next/navigation'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import { useUserback } from '@userback/react'

export default function Sidebar(props: any) {
    const [displayBottomMenu, setDisplayBottomMenu] = useState(false)
    const [loggedUserName, setLoggedUserName] = useState('')
    const [superAdmin, setSuperAdmin] = useState(false)
    const [admin, setAdmin] = useState(false)
    const pathname = usePathname()
    const [settingsMenuItems, setSettingsMenuItems] = useState([] as any[])
    const { open, hide, show } = useUserback()
    const [toggleSettings, setToggleSettings] = useState(
        pathname.includes('/settings/crew-duty/list') ||
            pathname.includes('/settings/inventory/category')
            ? true
            : false,
    )
    const [toggleHelp, setToggleHelp] = useState(false)
    const [permissions, setPermissions] = useState<any>(false)

    const [toggleCrew, setToggleCrew] = useState(
        (pathname.includes('/crew') ||
            pathname.includes('/crew-training') ||
            pathname.includes('/training-type')) &&
            !pathname.includes('/settings')
            ? true
            : false,
    )
    const [toggleInventory, setToggleInventory] = useState(
        (pathname.includes('/inventory') ||
            pathname.includes('/inventory/suppliers')) &&
            !pathname.includes('/settings')
            ? true
            : false,
    )

    useEffect(() => {
        setPermissions(getPermissions)
    }, [])

    let settingsMenuItemDefinitions = [
        {
            label: 'Crew Duties',
            url: '/settings/crew-duty/list',
            permission: 'EDIT_CREW_DUTY',
        },
        {
            label: 'Inventory Categories',
            url: '/settings/inventory/category',
            permission: 'EDIT_INVENTORY_CATEGORY',
        },
        {
            label: 'Maintenance Categories',
            url: '/settings/maintenance/category',
            permission: 'EDIT_TASK',
        },
        {
            label: 'User Roles',
            url: '/settings/user-role',
            permission: 'EDIT_GROUP',
        },
        {
            label: 'Departments',
            url: '/department',
            permission: 'EDIT_DEPARTMENT',
        },
        {
            label: 'Locations',
            url: '/location',
            permission: 'EDIT_LOCATION',
        },
    ]

    const openFeedbackModel = () => {
        open('general', 'form')
    }

    useEffect(() => {
        const settingItems: any[] = []

        if (typeof window !== 'undefined') {
            setLoggedUserName(
                `${localStorage.getItem('firstName') ?? ''} ${localStorage.getItem('surname') ?? ''}`,
            )
        }

        const superAdmin = localStorage.getItem('superAdmin') === 'true'
        const admin = localStorage.getItem('admin') === 'true'
        setSuperAdmin(superAdmin)
        setAdmin(admin)

        settingsMenuItemDefinitions.forEach((item) => {
            if (
                (permissions && hasPermission(item.permission, permissions)) ||
                admin ||
                superAdmin
            ) {
                // This is temporary and not the correct way to check permissions and needs to be fixed.
                settingItems.push(
                    <li
                        key={`${item.label}-${uniqueId()}`}
                        className={`${classes.innerItem} ${pathname.includes(item.label) ? 'border-sllightblue-600' : 'border-transparent'}`}>
                        <Link href={item.url}>
                            <span className={classes.navigation}>
                                {item.label}
                            </span>
                        </Link>
                    </li>,
                )
            }
        })
        setSettingsMenuItems(settingItems)
    }, [permissions])
    const handleSidebar = () => {
        if (props.sidebarOption.sidebarClass === 'w-64') {
            props.setSidebarOption({
                sidebarClass: 'w-14 hidden lg:block',
                menuIconDisplay: true,
            })
        } else {
            props.setSidebarOption({
                sidebarClass: 'w-14 hidden md:block xl:w-64 p-2 xl:p-4',
                menuIconDisplay: false,
            })
        }
    }
    const classes = {
        button: 'peer flex  p-1.5 xl:pl-8 focus-visible:outline-none items-center',
        icons: 'inline-block',
        navigation: 'hidden xl:inline-block hover:text-sllightblue-1000',
        tabNavigation: 'hover:text-sllightblue-1000',
        active: 'bg-sllightblue-50 dark:bg-slblue-600 rounded-md m-1',
        link: 'hover:bg-sllightblue-50 dark:hover:bg-sllightblue-500 rounded-md m-1',
        innerMenu:
            'border-l border-sllightblue-200 border-solid ml-6 w-full dark:border-white',
        innerItem:
            'font-light py-1 pl-2 border-l hover:border-sllightblue-600 relative -left-[1px]',
    }

    return (
        <>
            <div className="hidden w-14 xl:w-[calc(100vw_*_0.166667)] lg:flex flex-none">
                <div className="fixed w-14 xl:w-[calc(100vw_*_0.166667)] sidebar z-50 overflow-hidden transform bg-slblue-100 border border-slblue-200 dark:bg-sldarkblue-800 transition-transform duration-150 ease-in md:shadow-md rounded-md h-[calc(100vh_-_1.5rem)]">
                    <div className="h-full sticky top-0 flex flex-col justify-between">
                        <div className="px-2 xl:px-4">
                            <SealogsLogo />
                            <div
                                className={`flex overflow-y-auto ${displayBottomMenu ? 'max-h-[calc(85vh_-_285px)]' : 'max-h-[calc(100vh_-_130px)]'}`}>
                                <Navigation setNavTab={props.setNavTab} />
                            </div>
                        </div>
                        <div className="absolute flex-col bg-transparent xl:bg-slblue-800 text-white font-light text-xs bottom-0 w-full">
                            <div
                                className={`justify-start items-start ${displayBottomMenu ? '' : 'h-0'}`}>
                                <div className="p-2 xl:p-4">
                                    <div className="focus:outline-none py-2 border-b w-full bg-transparent flex justify-start items-start">
                                        <span
                                            className={
                                                classes.navigation +
                                                ' ' +
                                                'hidden lg:inline-block"'
                                            }>
                                            <ThemeSwitcher />
                                        </span>
                                    </div>
                                    <Button
                                        className="focus:outline-none hidden lg:flex pt-1 pb-0.5 w-full rounded bg-transparent justify-start items-start"
                                        onPress={() =>
                                            props.setSidebarOption({
                                                sidebarClass:
                                                    props.sidebarOption
                                                        .sidebarClass,
                                                menuIconDisplay:
                                                    props.sidebarOption
                                                        .menuIconDisplay,
                                                notification:
                                                    !props.sidebarOption
                                                        .notification,
                                            })
                                        }>
                                        <span
                                            className={
                                                classes.navigation +
                                                ' ' +
                                                'hidden lg:inline-block"'
                                            }>
                                            Notifications
                                        </span>
                                    </Button>
                                    {superAdmin && (
                                        <Link href={`/select-client`}>
                                            <div className="focus:outline-none w-full bg-transparent flex justify-start items-start py-1">
                                                <span
                                                    className={
                                                        classes.navigation +
                                                        ' ' +
                                                        'hidden xl:inline-block"'
                                                    }>
                                                    Switch Client
                                                </span>
                                            </div>
                                        </Link>
                                    )}
                                    {(superAdmin || admin) && (
                                        <Link href={`/company-details`}>
                                            <div className="focus:outline-none py-1 w-full flex justify-start items-start">
                                                <span
                                                    className={
                                                        classes.navigation +
                                                        ' ' +
                                                        'hidden xl:inline-block"'
                                                    }>
                                                    Company Details
                                                </span>
                                            </div>
                                        </Link>
                                    )}
                                    {(superAdmin || admin) && (
                                        <Link href={`/select-department`}>
                                            <div className="focus:outline-none py-1 w-full bg-transparent flex justify-start items-start">
                                                <span
                                                    className={
                                                        classes.navigation +
                                                        ' ' +
                                                        'hidden xl:inline-block"'
                                                    }>
                                                    Select Department
                                                </span>
                                            </div>
                                        </Link>
                                    )}
                                    {(!isEmpty(settingsMenuItems) ||
                                        superAdmin ||
                                        admin) && (
                                        <div className="focus:outline-none py-1 w-full bg-transparent justify-start items-start">
                                            <Button
                                                onPress={() =>
                                                    setToggleSettings(
                                                        !toggleSettings,
                                                    )
                                                }>
                                                <span
                                                    className={
                                                        classes.navigation
                                                    }>
                                                    Settings
                                                </span>
                                            </Button>
                                            <div
                                                className={`peer w-full flex dark:bg-sldarkblue-800 justify-between p-1 ${toggleSettings ? 'block' : 'hidden'}`}>
                                                <ul
                                                    className={
                                                        classes.innerMenu
                                                    }>
                                                    {settingsMenuItems}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                    <div className="focus:outline-none w-full bg-transparent justify-start items-start">
                                        <Button
                                            onPress={() =>
                                                setToggleHelp(!toggleHelp)
                                            }>
                                            <span
                                                className={classes.navigation}>
                                                Help
                                            </span>
                                        </Button>
                                        <div
                                            className={`peer w-full flex dark:bg-sldarkblue-800 justify-between p-1 ${toggleHelp ? 'block' : 'hidden'}`}>
                                            <ul className={classes.innerMenu}>
                                                <li
                                                    className={`${classes.innerItem} ${pathname.includes('https://sealogsv2.tawk.help/') ? 'border-slblue-500' : 'border-transparent'}`}>
                                                    <Link
                                                        href="https://sealogsv2.tawk.help/"
                                                        target="_blank">
                                                        <span
                                                            className={
                                                                classes.navigation
                                                            }>
                                                            Help docs
                                                        </span>
                                                    </Link>
                                                </li>
                                                <li
                                                    className={
                                                        classes.innerItem
                                                    }
                                                    onClick={() =>
                                                        openFeedbackModel()
                                                    }>
                                                    <span className="{classes.navigation} cursor-pointer">
                                                        Feedback
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <Link href="/logout">
                                        <Button className="focus:outline-none py-1  w-full bg-transparent flex justify-start items-start">
                                            <span
                                                className={
                                                    classes.navigation +
                                                    ' ' +
                                                    'hidden xl:inline-block"'
                                                }>
                                                Log Out
                                            </span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="xl:bg-sldarkblue-1000 text-white text-center flex items-center justify-center py-2 font-light relative">
                                {isEmpty(loggedUserName) ? (
                                    <div className="px-1">
                                        <Skeleton />
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            className="focus:outline-none rounded bg-transparent flex justify-center items-center dark:text-white"
                                            onPress={() =>
                                                setDisplayBottomMenu(
                                                    !displayBottomMenu,
                                                )
                                            }>
                                            <span className="hidden xl:inline-block w-full">
                                                {loggedUserName}
                                            </span>
                                            <span className="text-slred-1000 border rounded-full w-5 h-5 flex bg-slred-100 items-center justify-center border-slred-1000 text-xs absolute -top-2 right-14">
                                                5
                                            </span>
                                        </Button>
                                        <DialogTrigger>
                                            <Button className={classes.button}>
                                                <UserIcon className="w-6 h-6 rounded-full xl:hidden bg-slblue-1000 dark:bg-slblue-700 flex justify-center items-center p-1  xl:mr-2" />
                                            </Button>
                                            <Popover
                                                placement="right"
                                                className="bg-sldarkblue-900 text-white rounded text-sm">
                                                <Dialog>
                                                    <div
                                                        className={`justify-start items-start`}>
                                                        <div className="p-2 xl:p-4">
                                                            <div className="focus:outline-none py-2 lg:border-b w-full bg-transparent flex justify-start items-start">
                                                                <span
                                                                    className={
                                                                        classes.tabNavigation
                                                                    }>
                                                                    <ThemeSwitcher />
                                                                </span>
                                                            </div>
                                                            <Button
                                                                className="focus:outline-none hidden lg:flex pt-1 pb-0.5 w-full rounded bg-transparent justify-start items-start"
                                                                onPress={() =>
                                                                    props.setSidebarOption(
                                                                        {
                                                                            sidebarClass:
                                                                                props
                                                                                    .sidebarOption
                                                                                    .sidebarClass,
                                                                            menuIconDisplay:
                                                                                props
                                                                                    .sidebarOption
                                                                                    .menuIconDisplay,
                                                                            notification:
                                                                                !props
                                                                                    .sidebarOption
                                                                                    .notification,
                                                                        },
                                                                    )
                                                                }>
                                                                <span
                                                                    className={
                                                                        classes.tabNavigation
                                                                    }>
                                                                    Notifications
                                                                </span>
                                                            </Button>
                                                            {superAdmin && (
                                                                <Link
                                                                    href={`/select-client`}>
                                                                    <div className="focus:outline-none w-full bg-transparent flex justify-start items-start py-1">
                                                                        <span
                                                                            className={
                                                                                classes.tabNavigation
                                                                            }>
                                                                            Switch
                                                                            client
                                                                        </span>
                                                                    </div>
                                                                </Link>
                                                            )}
                                                            {(superAdmin ||
                                                                admin) && (
                                                                <Link
                                                                    href={`/company-details`}>
                                                                    <div className="focus:outline-none py-1 w-full flex justify-start items-start">
                                                                        <span
                                                                            className={
                                                                                classes.tabNavigation
                                                                            }>
                                                                            Company
                                                                            details
                                                                        </span>
                                                                    </div>
                                                                </Link>
                                                            )}
                                                            {(superAdmin ||
                                                                admin) && (
                                                                <Link
                                                                    href={`/select-department`}>
                                                                    <div className="focus:outline-none py-1 w-full bg-transparent flex justify-start items-start">
                                                                        <span
                                                                            className={
                                                                                classes.tabNavigation
                                                                            }>
                                                                            Switch
                                                                            department
                                                                        </span>
                                                                    </div>
                                                                </Link>
                                                            )}
                                                            {!isEmpty(
                                                                settingsMenuItems,
                                                            ) && (
                                                                <div className="focus:outline-none py-1  w-full bg-transparent justify-start items-start">
                                                                    <Button
                                                                        onPress={() =>
                                                                            setToggleSettings(
                                                                                !toggleSettings,
                                                                            )
                                                                        }>
                                                                        <span
                                                                            className={
                                                                                classes.tabNavigation
                                                                            }>
                                                                            Settings
                                                                        </span>
                                                                    </Button>
                                                                    <div
                                                                        className={`peer w-full flex dark:bg-sldarkblue-800 justify-between p-1 ${toggleSettings ? 'block' : 'hidden'}`}>
                                                                        <ul
                                                                            className={
                                                                                classes.innerMenu
                                                                            }>
                                                                            {
                                                                                settingsMenuItems
                                                                            }
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="focus:outline-none w-full bg-transparent justify-start items-start">
                                                                <Button
                                                                    onPress={() =>
                                                                        setToggleHelp(
                                                                            !toggleHelp,
                                                                        )
                                                                    }>
                                                                    <span
                                                                        className={
                                                                            classes.tabNavigation
                                                                        }>
                                                                        Help
                                                                    </span>
                                                                </Button>
                                                                <div
                                                                    className={`peer w-full flex dark:bg-sldarkblue-800 justify-between p-1 ${toggleHelp ? 'block' : 'hidden'}`}>
                                                                    <ul
                                                                        className={
                                                                            classes.innerMenu
                                                                        }>
                                                                        <li
                                                                            className={`${classes.innerItem} ${pathname.includes('https://sealogsv2.tawk.help/') ? 'border-slblue-500' : 'border-transparent'}`}>
                                                                            <Link
                                                                                href="https://sealogsv2.tawk.help/"
                                                                                target="_blank">
                                                                                <span
                                                                                    className={
                                                                                        classes.tabNavigation
                                                                                    }>
                                                                                    Help
                                                                                    docs
                                                                                </span>
                                                                            </Link>
                                                                        </li>
                                                                        <li
                                                                            className={
                                                                                classes.innerItem
                                                                            }
                                                                            onClick={() =>
                                                                                openFeedbackModel()
                                                                            }>
                                                                            <span className="{classes.tabNavigation} cursor-pointer">
                                                                                Feedback
                                                                            </span>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                            <Link href="/logout">
                                                                <Button className="focus:outline-none py-1  w-full bg-transparent flex justify-start items-start">
                                                                    <span
                                                                        className={
                                                                            classes.tabNavigation
                                                                        }>
                                                                        Log Out
                                                                    </span>
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </Dialog>
                                            </Popover>
                                        </DialogTrigger>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
