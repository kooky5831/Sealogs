'use client'

import React, { useState } from 'react'
import Sidebar from '../ui/sidebar'
import TopBar from '../ui/topbar'
import RightSidebar from '../ui/right-sidebar'
import NotificationBar from '../ui/notification-bar'
import Link from 'next/link'
import {
    Button,
    Modal,
    ModalOverlay,
    DialogTrigger,
    Dialog,
    Popover,
} from 'react-aria-components'
import {
    ChatBubbleBottomCenterTextIcon,
    ChatBubbleBottomCenterIcon,
} from '@heroicons/react/24/outline'
// import TawkTo from '../TawkTo'
export const PopoverWrapper = (props: any) => {
    return (
        <div
            className={`p-2 w-64 border shadow-[0_0_20px_0] shadow-sky-700/20 border-white max-h-full bg-slblue-100 rounded dark:bg-slblue-800 dark:text-white ${props.className}`}>
            <div className="flex items-center overflow-auto">
                <div className="w-full">
                    <div className="w-full leading-loose text-xs">
                        {props.children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const TableWrapper = (props: any) => {
    return (
        <table
            className={`${props.className} table-auto border  border-slblue-100 border-separate md:border-collapse border-spacing-y-2 md:border-spacing-0  overflow-hidden shadow-md rounded-lg w-full dark:border-0`}>
            <thead
                className={`text-xs dark:text-white text-white font-normal rounded-t-lg  bg-slblue-1000  ${props.headClasses}`}>
                <tr>
                    {props.headings.map((item: any, index: number) => {
                        return (
                            <th
                                key={index}
                                scope="col"
                                className={`pb-3 pt-6 px-2 font-normal ${index === 0 ? 'rounded-tl-lg' : ' '}   ${props.headings.length === index + 1 ? 'rounded-tr-lg' : ' '}
                                ${item.includes(':') ? (item.split(':')[1] === 'last' ? 'rounded-tr-lg' : '') : ''}
                                ${item.includes(':') ? (item.split(':')[1] === 'smhidden' ? 'hidden sm:block' : '') : ''}
                                ${item.includes(':') ? (item.split(':')[1] === 'left' ? 'text-left' : '') : ''}
                                ${item.includes(':') ? (item.split(':')[1] === 'firstHead' ? 'text-left text-nowrap font-thin text-lg md:text-xl lg:text-2xl pl-6 rounded-tl-lg' : '') : ''}  `}>
                                {item.includes(':') ? item.split(':')[0] : item}
                            </th>
                        )
                    })}
                </tr>
            </thead>
            <tbody
                className={`bg-white border-sllightblue-100 ${props?.bodyClass}`}>
                {props.children}
            </tbody>
        </table>
    )
}

export const MainLayout = (props: any) => {
    const [sidebarOption, setSidebarOption] = useState({
        sidebarClass: 'w-64 hidden lg:block',
        menuIconDisplay: true,
        notification: false,
    })
    const [navTab, setNavTab] = useState('dashboard')
    return (
        <div className="flex flex-row min-h-screen h-full p-0 md:p-2 lg:p-3 bg-sllightblue-50 dark:bg-sldarkblue-950 text-sldarkblue-950 dark:text-white text-base overflow-hidden w-screen">
            <Sidebar
                sidebarOption={sidebarOption}
                setSidebarOption={setSidebarOption}
                setNavTab={setNavTab}
            />
            <TopBar
                sidebarOption={sidebarOption}
                setSidebarOption={setSidebarOption}
            />

            <main className="main block w-full transition-all duration-150 ease-in pb-32">
                <div className="p-3 lg:p-6 lg:pr-3">{props.children}</div>
            </main>

            <RightSidebar />
            <NotificationBar
                sidebarOption={sidebarOption}
                setSidebarOption={setSidebarOption}
            />
        </div>
    )
}

export const SeaLogsButton = (props: any) => {
    const text = props?.text ? props.text : ''
    const icons = [
        {
            trash: (
                <svg
                    key={text}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="-ml-0.5 mr-1.5 h-5 w-5 border border-slred-800 group-hover:border-white rounded-full group-hover:bg-slred-800 group-hover:text-white">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                    />
                </svg>
            ),
        },
        {
            back_arrow: (
                <svg
                    key={text}
                    className={`-ml-0.5 mr-1.5 h-5 w-5`}
                    viewBox="0 0 16.04 16.14"
                    fill="currentColor"
                    aria-hidden="true">
                    <path
                        fillRule="evenodd"
                        d="M15,0c.2,0,.5.1.7.3.3.3.4.7.3,1.1l-2.4,6.7,2.4,6.7c.1.4,0,.8-.3,1.1-.3.3-.7.3-1.1.1L.6,9C.3,8.8,0,8.5,0,8.1s.2-.7.6-.9L14.6.2C14.7,0,14.9,0,15,0ZM13.2,13l-1.7-4.6c-.1-.2-.1-.5,0-.7l1.7-4.7L3.2,8l10,5Z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
        },
        {
            check: (
                <svg
                    key={text}
                    className={`-ml-0.5 mr-1.5 h-5 w-5 border rounded-full bg-slblue-200 group-hover:bg-bgslblue-700 group-hover:text-white`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true">
                    <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
        },
        {
            pencil: (
                <svg
                    key={text}
                    className="-ml-0.5 mr-1.5 h-5 w-5 group-hover:border-white"
                    viewBox="0 0 36 36"
                    fill="currentColor"
                    aria-hidden="true">
                    <path d="M33.87,8.32,28,2.42a2.07,2.07,0,0,0-2.92,0L4.27,23.2l-1.9,8.2a2.06,2.06,0,0,0,2,2.5,2.14,2.14,0,0,0,.43,0L13.09,32,33.87,11.24A2.07,2.07,0,0,0,33.87,8.32ZM12.09,30.2,4.32,31.83l1.77-7.62L21.66,8.7l6,6ZM29,13.25l-6-6,3.48-3.46,5.9,6Z"></path>
                </svg>
            ),
        },
        {
            record: (
                <svg
                    key={text}
                    className="-ml-0.5 mr-1.5 h-5 w-5 group-hover:border-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true">
                    <path d="M3,4.5 L3,6.5 C3,6.77614237 3.22385763,7 3.5,7 L20.5,7 C20.7761424,7 21,6.77614237 21,6.5 L21,4.5 C21,4.22385763 20.7761424,4 20.5,4 L3.5,4 C3.22385763,4 3,4.22385763 3,4.5 Z M21,7.91464715 L21,18.5 C21,19.8807119 19.8807119,21 18.5,21 L5.5,21 C4.11928813,21 3,19.8807119 3,18.5 L3,7.91464715 C2.41740381,7.70872894 2,7.15310941 2,6.5 L2,4.5 C2,3.67157288 2.67157288,3 3.5,3 L20.5,3 C21.3284271,3 22,3.67157288 22,4.5 L22,6.5 C22,7.15310941 21.5825962,7.70872894 21,7.91464715 L21,7.91464715 Z M20,8 L4,8 L4,18.5 C4,19.3284271 4.67157288,20 5.5,20 L18.5,20 C19.3284271,20 20,19.3284271 20,18.5 L20,8 Z M8,11.5 C8,10.6715729 8.67157288,10 9.5,10 L14.5,10 C15.3284271,10 16,10.6715729 16,11.5 C16,12.3284271 15.3284271,13 14.5,13 L9.5,13 C8.67157288,13 8,12.3284271 8,11.5 Z M9,11.5 C9,11.7761424 9.22385763,12 9.5,12 L14.5,12 C14.7761424,12 15,11.7761424 15,11.5 C15,11.2238576 14.7761424,11 14.5,11 L9.5,11 C9.22385763,11 9,11.2238576 9,11.5 Z" />
                </svg>
            ),
        },
        {
            category: (
                <svg
                    key={text}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="-ml-0.5 mr-1.5 h-5 w-5">
                    <path
                        opacity="0.34"
                        d="M5 10H7C9 10 10 9 10 7V5C10 3 9 2 7 2H5C3 2 2 3 2 5V7C2 9 3 10 5 10Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M17 10H19C21 10 22 9 22 7V5C22 3 21 2 19 2H17C15 2 14 3 14 5V7C14 9 15 10 17 10Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        opacity="0.34"
                        d="M17 22H19C21 22 22 21 22 19V17C22 15 21 14 19 14H17C15 14 14 15 14 17V19C14 21 15 22 17 22Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M5 22H7C9 22 10 21 10 19V17C10 15 9 14 7 14H5C3 14 2 15 2 17V19C2 21 3 22 5 22Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ),
        },
        {
            qualification: (
                <svg
                    key={text}
                    viewBox="0 0 360.1359 469.8057"
                    className="-ml-0.5 mr-1.5 h-5 w-5">
                    <path d="M3.9895.021C1.6535.4759-.024,2.5347.0022,4.9146v459.8162c-.0799,2.7215,2.0619,4.9927,4.7837,5.0727.0366.0014.0733.0021.1099.0021h350.3444c2.7229-.0191,4.9148-2.2422,4.8956-4.9651-.0003-.0361-.0009-.0729-.002-.1097V4.9146c-.02-2.6942-2.1993-4.8734-4.8936-4.8936H4.8958c-.3014-.028-.6048-.028-.9062,0ZM9.7894,9.8082h340.5601v450.0318H9.7894s0-450.0318,0-450.0318ZM70.6876,76.5062c-2.7528,0-4.9844,2.2316-4.9844,4.9842s2.2316,4.9846,4.9844,4.9846h77.2073c2.7528,0,4.9844-2.2316,4.9844-4.9846s-2.2316-4.9842-4.9844-4.9842h-77.2073ZM69.6001,142.2994c-2.687.4407-4.5079,2.9767-4.0671,5.6635.4088,2.4918,2.6339,4.2716,5.1545,4.1237h218.9435c2.7027.332,5.1627-1.5898,5.4946-4.2925.3319-2.7027-1.5899-5.1626-4.2926-5.4947-.3992-.0489-.8029-.0489-1.2021,0H70.6876c-.3614-.04-.7261-.04-1.0875,0ZM70.6876,207.9072c-2.7528,0-4.9844,2.2316-4.9844,4.9842s2.2316,4.9846,4.9844,4.9846h218.9435c2.7528,0,4.9844-2.2316,4.9844-4.9846s-2.2316-4.9842-4.9844-4.9842c0,0-218.9435,0-218.9435,0ZM105.6675,283.6646c-19.5866,0-35.343,16.0405-35.343,36.068,0,5.4908,1.1395,10.7628,3.2624,15.4054.203.2244.3849.4673.5434.725.6778,1.37,1.3449,2.7257,2.1749,3.9874.029.0581-.029.1391,0,.1798.808,1.2181,1.7791,2.3395,2.7187,3.444.5231.6106,1.0692,1.2393,1.6312,1.8124.4913.5044,1.1121.9749,1.6312,1.45,3.2985,3.0189,6.9882,5.3173,11.2372,6.8873,1.4163.5221,3.0326.9328,4.5311,1.2684,1.3312.3016,2.6033.583,3.9874.725h.9059c.9008.0697,1.7998.1798,2.7187.1798,1.7999,0,3.5274-.0988,5.2561-.3597,1.7961-.2669,3.5609-.5508,5.2561-1.0875,1.2439-.3887,2.4435-.9278,3.6249-1.45.9335-.4117,1.8294-.7749,2.7187-1.2684.4112-.2262.8674-.4814,1.2687-.725.0719-.0581.1096-.1335.181-.1798,2.4918-1.5501,4.8479-3.5042,6.8873-5.6189,1.0491-1.0875,1.9896-2.2284,2.8999-3.4433.9103-1.2156,1.7789-2.4783,2.5374-3.8065s1.3998-2.742,1.9937-4.1683c.1007-.2513.222-.4938.3625-.725.0588-.0616.1191-.1214.181-.1798.029-.0754.1525-.1101.181-.1798,1.4737-3.9654,2.1749-8.362,2.1749-12.8687,0-20.0275-15.9373-36.0673-35.5239-36.0673l.0017-.0046ZM143.3664,345.2878c-.7301,1.1059-1.5364,2.0457-2.3562,3.0815-.1386.1742-.2216.3713-.3625.5451-.668.822-1.4538,1.5852-2.1749,2.3558-1.7218,1.834-3.6202,3.5484-5.6186,5.0748-1.007.7696-2.0114,1.491-3.0812,2.1749-3.1827,2.0348-6.6808,3.7056-10.3307,4.8936l31.7181,50.9297,5.0748-14.3183c.767-2.1884,2.9549-3.5463,5.2561-3.2624l14.8621,1.6312-32.9865-53.1043-.0006-.0018ZM69.5984,347.4627l-32.08,50.9297,15.0436-1.6312c2.3012-.2839,4.4891,1.074,5.2561,3.2624l4.8936,14.1371,31.355-50.0235c-9.876-2.6613-18.4539-8.6604-24.4683-16.6745Z" />
                </svg>
            ),
        },
        {
            link: (
                <svg
                    key={text}
                    className={`-ml-0.5 mr-1.5 h-5 w-5 text-${props.color}-400`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true">
                    <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
                    <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
                </svg>
            ),
        },
        {
            plus: (
                <svg
                    key={text}
                    className={`-ml-1.5 mr-1.5 h-5 w-5 border rounded-full bg-slblue-200 text-white group-hover:bg-bgslblue-700 group-hover:text-white`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true">
                    <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
        },
        {
            archive: (
                <svg
                    key={text}
                    xmlns="http://www.w3.org/2000/svg"
                    className="-ml-0.5 mr-1.5 h-5 w-5 group-hover:border-white"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16">
                    {' '}
                    <path d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5zm13-3H1v2h14zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5" />
                </svg>
            ),
        },
        {
            new_vessel: (
                <svg
                    key={text}
                    className="-ml-1 mr-1.5 w-10 h-10"
                    viewBox="0 0 99 99"
                    stroke="#022450"
                    strokeWidth=".7792px"
                    strokeMiterlimit="10">
                    <circle
                        cx="49.5"
                        cy="49.5"
                        r="49.5"
                        fill="#f4fafe"
                        strokeWidth="0px"
                    />
                    <polygon
                        points="85.417 54.3973 81.2072 82.1557 25.4977 82.1557 21.8835 66.6894 85.417 54.3973"
                        fill="#ffffff"
                    />
                    <polygon
                        points="82.5 72.5 80.5 82.5 25.97 82.1557 24.5 76.5 82.5 72.5"
                        fill="#2a99ea"
                    />
                    <path
                        d="M21.3172,66.1148c-.0401.113-.0469.2506-.0186.3727l3.7961,16.2454c.0372.1608.1301.2671.2328.2671h56.0744c.1144,0,.2142-.1311.2426-.3174l4.3477-28.6694c.0205-.1344,0-.2778-.0538-.3826-.0548-.1055-.1389-.1575-.2171-.1418l-5.7737,1.1171-3.7052-24.6484c-.0313-.2094-.1516-.3413-.2778-.3141l-33.9171,8.0939c-.0792.019-.1487.1006-.1858.2201-.0381.1195-.0391.2614-.0039.3834l1.8036,6.2314c.0469.1641.1516.2531.2602.2325l10.5959-2.5311,2.5641,16.7561-28.9656,5.6038-7.8786-48.3235c-.0362-.2226-.1692-.3562-.3081-.2952-.133.0618-.2113.2943-.1751.5194l.5493,3.3689-9.1919,10.3569c-.0871.0989-.1291.2778-.1047.4502s.1105.3001.2142.3207l11.256,2.204,5.135,31.4959-6.1091,1.1819c-.0773.0148-.1467.0899-.1858.202ZM11.9557,30.3244l8.4877-9.5634,1.8905,11.5951-10.3781-2.0317ZM79.4457,54.7029l-13.6483,2.6404-2.4007-17.0074,13.4396-2.9899,2.6094,17.3568ZM54.9468,41.6971c-.0323-.2086-.1506-.3389-.2778-.3125l-10.638,2.541-1.5728-5.4341,33.3537-7.9595.9005,5.9895-13.6561,3.0385c-.0704.0157-.134.0808-.1741.1797-.0401.0981-.0538.221-.0372.3372l2.4513,17.3632-7.7123,1.4921-2.6373-17.2352ZM85.417,54.3973l-4.2098,27.7584H25.4977l-3.6141-15.4663,63.5335-12.2921Z"
                        fill="#022450"
                    />
                    <polygon
                        points="11.9557 30.3244 20.4433 20.761 22.3338 32.3561 11.9557 30.3244"
                        fill="#2a99ea"
                    />
                    <polygon
                        points="79.4457 54.7029 65.7974 57.3433 63.3967 40.3359 76.8363 37.3461 79.4457 54.7029"
                        fill="#ffffff"
                    />
                    <path
                        d="M54.9468,41.6971c-.0323-.2086-.1506-.3389-.2778-.3125l-10.638,2.541-1.5728-5.4341,33.3537-7.9595.9005,5.9895-13.6561,3.0385c-.0704.0157-.134.0808-.1741.1797-.0401.0981-.0538.221-.0372.3372l2.4513,17.3632-7.7123,1.4921-2.6373-17.2352Z"
                        fill="#ffffff"
                    />
                </svg>
            ),
        },
        {
            alert: (
                <svg
                    key={text}
                    viewBox="0 0 98.75 98.7516"
                    stroke="#022450"
                    strokeMiterlimit="10"
                    strokeWidth=".75px">
                    <path
                        d="M49.375,1.1898c26.5687,0,48.1852,21.6165,48.1852,48.186s-21.6165,48.186-48.1852,48.186S1.1898,75.9453,1.1898,49.3758,22.8063,1.1898,49.375,1.1898Z"
                        fill="#ffffff"
                    />
                    <path
                        d="M49.375,98.3766c27.0191,0,49-21.9817,49-49.0008S76.3941.375,49.375.375.375,22.3567.375,49.3758s21.9809,49.0008,49,49.0008ZM49.375,1.1898c26.5687,0,48.1852,21.6165,48.1852,48.186s-21.6165,48.186-48.1852,48.186S1.1898,75.9453,1.1898,49.3758,22.8063,1.1898,49.375,1.1898Z"
                        fill="#022450"
                    />
                    <path
                        d="M40.1112,55.766h18.5277c.3237,0,.5877-.2875.5877-.6427V16.0185c0-.3552-.264-.6427-.5877-.6427h-18.5277c-.3237,0-.5877.2875-.5877.6427v39.1048c0,.3552.264.6427.5877.6427Z"
                        fill="#2a99ea"
                        strokeWidth="1.1315px"
                    />
                    <path
                        d="M49.375,84.3758c5.82,0,10.5564-4.7352,10.5564-10.5564s-4.7364-10.5564-10.5564-10.5564-10.5564,4.7352-10.5564,10.5564,4.7364,10.5564,10.5564,10.5564Z"
                        fill="#2a99ea"
                        strokeWidth="1.1315px"
                    />
                </svg>
            ),
        },
        {
            location: (
                <svg
                    key={text}
                    className="w-7 h-7 sm:w-9 sm:h-9"
                    viewBox="0 0 78 91.1323"
                    stroke="#022450"
                    fill="#ffffff"
                    strokeMiterlimit="10"
                    strokeWidth=".75px">
                    <path
                        d="M16.3623,67.2474c-.3242-.4395-.9844-.6133-1.438-.6133h-.8486c-7.2979,0-13.2354-5.9375-13.2354-13.2354V13.7357C.8403,6.4373,6.7778.4998,14.0757.4998h49.772c7.2979,0,13.2354,5.9375,13.2354,13.2358v39.6631c0,7.2979-5.9375,13.2354-13.2354,13.2354h-.8496c-.5312,0-1.041.2168-1.4336.6094l-22.5649,23.1729-22.6372-23.1689Z"
                        fill="#f4fafe"
                        strokeWidth="0px"
                    />
                    <path
                        d="M63.8472,1c7.0223,0,12.7354,5.7131,12.7354,12.7354v39.663c0,7.0223-5.7131,12.7354-12.7354,12.7354h-.8488c-.6652,0-1.3.2684-1.7968.7654l-22.2029,22.8009-22.242-22.7644c-.4819-.5897-1.2558-.8019-1.8324-.8019h-.8488c-7.0223,0-12.7354-5.7131-12.7354-12.7354V13.7354C1.3401,6.7131,7.0532,1,14.0756,1h49.7717M63.8472,0H14.0756C6.5134,0,.3401,6.1732.3401,13.7354v39.663c0,7.5622,6.1732,13.7354,13.7354,13.7354h.8488c.3858,0,.8488.1543,1.0803.463l22.9953,23.5354,22.9181-23.5354c.3087-.3087.6945-.463,1.0803-.463h.8488c7.5622,0,13.7354-6.1732,13.7354-13.7354V13.7354c0-7.5622-6.1732-13.7354-13.7354-13.7354h0Z"
                        fill="#022450"
                        strokeWidth="0.5px"
                    />
                    <path d="M30.5667,71.4197c.0454.0732.126.1182.2124.1182h16.8809c.0864,0,.167-.0449.2124-.1182l19.064-30.7402c.0405-.0649.0488-.1445.0229-.2163-.0259-.0723-.0835-.1279-.1558-.1523l-7.9189-2.6618v-15.9271c0-.1382-.1118-.25-.25-.25h-7.0308v-13.0513c0-.1382-.1118-.25-.25-.25h-24.2686c-.1382,0-.25.1118-.25.25v13.0513h-7.0308c-.1382,0-.25.1118-.25.25v15.9271l-7.9189,2.6618c-.0723.0244-.1299.0801-.1558.1523-.0259.0718-.0176.1514.0229.2163l19.064,30.7402ZM66.345,40.6839l-18.8242,30.354h-8.0513V31.6502l26.8755,9.0336ZM27.3352,8.6707h23.7686v12.8013h-23.7686v-12.8013ZM20.0545,21.9719h38.3301v15.509l-19.0854-6.4152c-.0155-.0052-.0317.0021-.0477,0-.012-.0018-.0194-.0132-.0319-.0132s-.0199.0114-.0319.0132c-.016.0021-.0322-.0052-.0477,0l-19.0854,6.4152v-15.509ZM38.9695,31.6502v39.3876h-8.0513l-18.8242-30.354,26.8755-9.0336Z" />
                    <polygon points="66.1255 40.6839 47.3013 71.0379 39.25 71.0379 39.25 31.6502 66.1255 40.6839" />
                    <polygon points="38.75 31.6502 38.75 71.0379 30.6987 71.0379 11.8745 40.6839 38.75 31.6502" />
                    <path d="M19.835,21.9719h38.3301v15.509l-19.0854-6.4152c-.0155-.0052-.0317.0021-.0477,0-.012-.0018-.0194-.0132-.0319-.0132s-.0199.0114-.0319.0132c-.016.0021-.0322-.0052-.0477,0l-19.0854,6.4152v-15.509Z" />
                    <path
                        d="M44.2812,14.8215h-3.0493c-.1382,0-.25.1118-.25.25s.1118.25.25.25h3.0493c.1382,0,.25-.1118.25-.25s-.1118-.25-.25-.25Z"
                        fill="#022450"
                    />
                    <path
                        d="M36.7681,14.8215h-3.0493c-.1382,0-.25.1118-.25.25s.1118.25.25.25h3.0493c.1382,0,.25-.1118.25-.25s-.1118-.25-.25-.25Z"
                        fill="#022450"
                    />
                </svg>
            ),
        },
        {
            new_logbook: (
                <svg
                    key={text}
                    className="-ml-1.5 mr-1 h-5 w-5"
                    viewBox="0 0 19 19"
                    stroke="#022450"
                    fill="#ffffff"
                    strokeMiterlimit="10"
                    strokeWidth=".75px">
                    <path
                        className="stroke-slblue-200"
                        d="M9,18a1.994,1.994,0,0,1-1.414-.586l-.828-.828A2,2,0,0,0,5.343,16H1a1,1,0,0,1-1-1V1A1,1,0,0,1,1,0H5A4.992,4.992,0,0,1,9,2Z"
                        transform="translate(0.5 0.5)"
                        fill="none"
                        strokeWidth="1"
                    />
                    <path
                        className="stroke-slblue-400 group-hover:stroke-white"
                        d="M0,18V2A4.992,4.992,0,0,1,4,0H8A1,1,0,0,1,9,1V15a1,1,0,0,1-1,1H3.657a2,2,0,0,0-1.414.586l-.828.828A1.994,1.994,0,0,1,0,18Z"
                        transform="translate(9.5 0.5)"
                        fill="none"
                        strokeWidth="1"
                    />
                </svg>
            ),
        },
        {
            crew_cap: (
                <svg
                    key={text}
                    xmlns="http://www.w3.org/2000/svg"
                    className="-ml-1 mr-1.5 w-10 h-10"
                    viewBox="-4 -4 26 26.25">
                    <circle cx="9.5" cy="9.125" r="12" fill="white" />
                    <path
                        d="M18.6935,7.7297h-2.3172c-.9285-2.994-3.7221-5.0658-6.8763-5.0658S3.5522,4.7357,2.6237,7.7297H.3065c-.0901,0-.1757.0396-.2341.1087s-.0832.16-.068.249l1.2258,7.2433c.0249.1473.1526.2554.3022.2554h15.9354c.1493,0,.277-.1079.3022-.2554l1.2258-7.2433c.0151-.0891-.0098-.18-.068-.249s-.144-.1087-.2341-.1087ZM.6175,8.3096h17.7656l-.356,1.8273H.9729l-.3554-1.8273ZM9.5,3.2768c2.8218,0,5.329,1.8115,6.233,4.4529H3.267c.904-2.6414,3.4112-4.4529,6.233-4.4529ZM17.2087,14.973H1.7914l-.7146-4.2233h16.8466l-.7146,4.2233Z"
                        fill="#022450"
                        stroke="#022450"
                        strokeMiterlimit="10"
                        strokeWidth="0px"
                    />
                    <circle
                        cx="9.5"
                        cy="9.125"
                        r="12"
                        fill="none"
                        stroke="#022450"
                        strokeWidth="0.7792"
                    />
                    <polygon
                        points=".6175 8.3096 18.3831 8.3096 18.0271 10.1368 .9729 10.1368 .6175 8.3096"
                        fill="#F2F4F7"
                        stroke="#022450"
                        strokeMiterlimit="10"
                        strokeWidth="0px"
                    />
                </svg>
            ),
        },
        {
            document_upload: (
                <svg
                    key={text}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 469.88 500.7">
                    <g id="a" data-name="Layer 1">
                        <g>
                            <path
                                d="M102.05,455.38c-1.48,0-2.59-.37-3.7-1.11-1.85-1.11-2.96-2.59-3.33-4.44L.28,81.26c-1.11-4.07,1.11-8.14,5.18-9.25L283.74.22c1.85-.37,4.07-.37,5.55.74,1.85.74,2.96,2.59,3.33,4.44l19.24,74.38c.74,2.22,0,4.44-1.48,6.29s-3.7,2.96-5.92,2.96h-122.12v340.08c0,3.33-2.22,6.29-5.55,7.03l-72.9,18.87c-.74.37-1.11.37-1.85.37ZM16.2,84.59l91.03,354.51,60.32-15.54V81.63c0-4.07,3.33-7.4,7.4-7.4h119.9l-14.8-58.1L16.2,84.59Z"
                                style={{ fill: '#eb7c2a', strokeWidth: '0px' }}
                            />
                            <path
                                d="M462.48,469.82H174.95c-4.07,0-7.4-3.33-7.4-7.4V81.63c0-4.07,3.33-7.4,7.4-7.4h196.13c1.85,0,3.7.74,5.18,2.22l91.4,91.77c1.48,1.48,2.22,3.33,2.22,5.18v289.01c0,4.07-3.33,7.4-7.4,7.4ZM182.35,455.01h272.73V176.37l-86.96-87.33h-185.77v365.98Z"
                                style={{ fill: '#eb7c2a', strokeWidth: '0px' }}
                            />
                            <path
                                d="M16.2,84.59l91.03,354.51,60.32-15.54V81.63c0-4.07,3.33-7.4,7.4-7.4h119.9l-14.8-58.1L16.2,84.59Z"
                                style={{ fill: '#fff', strokeWidth: '0px' }}
                            />
                            <polygon
                                points="182.35 455.01 455.08 455.01 455.08 176.37 368.11 89.03 182.35 89.03 182.35 455.01"
                                style={{ fill: '#fff', strokeWidth: '0px' }}
                            />
                            <path
                                d="M462.48,177.11h-91.4c-2.22,0-3.7-1.48-3.7-3.7v-91.77c0-1.48.74-2.96,2.22-3.33,1.48-.74,2.96-.37,4.07.74l91.4,91.77c1.11,1.11,1.48,2.59.74,4.07-.37,1.11-1.85,2.22-3.33,2.22ZM374.78,169.7h78.82l-78.82-79.19v79.19Z"
                                style={{ fill: '#eb7c2a', strokeWidth: '0px' }}
                            />
                            <path
                                d="M408.82,224.1h-180.21c-2.22,0-3.7-1.48-3.7-3.7s1.48-3.7,3.7-3.7h180.21c2.22,0,3.7,1.48,3.7,3.7s-1.48,3.7-3.7,3.7Z"
                                style={{ fill: '#2998e9', strokeWidth: '0px' }}
                            />
                            <path
                                d="M408.82,286.64h-180.21c-2.22,0-3.7-1.48-3.7-3.7s1.48-3.7,3.7-3.7h180.21c2.22,0,3.7,1.48,3.7,3.7s-1.48,3.7-3.7,3.7Z"
                                style={{ fill: '#2998e9', strokeWidth: '0px' }}
                            />
                            <path
                                d="M408.82,349.55h-180.21c-2.22,0-3.7-1.48-3.7-3.7s1.48-3.7,3.7-3.7h180.21c2.22,0,3.7,1.48,3.7,3.7,0,1.85-1.48,3.7-3.7,3.7Z"
                                style={{ fill: '#2998e9', strokeWidth: '0px' }}
                            />
                            <path
                                d="M408.82,412.09h-180.21c-2.22,0-3.7-1.48-3.7-3.7s1.48-3.7,3.7-3.7h180.21c2.22,0,3.7,1.48,3.7,3.7s-1.48,3.7-3.7,3.7Z"
                                style={{ fill: '#2998e9', strokeWidth: '0px' }}
                            />
                        </g>
                    </g>
                    <g id="b" data-name="Layer 2">
                        <path
                            d="M297.94,265.37h0c2.41,0,4.41,1.2,6.01,2.81l101.43,117.87c2,2.41,2.41,5.61,1.2,8.42s-4.01,4.81-7.22,4.81h-40.49s0,93.41,0,93.41c0,4.41-3.61,8.02-8.02,8.02h-105.84c-4.41,0-8.02-3.61-8.02-8.02v-93.01s-40.49,0-40.49,0c-3.21,0-6.01-2-7.22-4.81s-.8-6.01,1.2-8.42l101.43-117.87c1.6-2,3.61-3.21,6.01-3.21ZM381.73,383.24l-83.79-97.42-83.79,97.82h30.87c4.41,0,8.02,3.61,8.02,8.02v93.01s89.8,0,89.8,0v-93.01c0-4.41,3.61-8.02,8.02-8.02h30.87s0-.4,0-.4Z"
                            style={{ fill: '#eb7c2a', strokeWidth: '0px' }}
                        />
                        <path
                            d="M381.73,383.24l-83.79-97.42-83.79,97.82h30.87c4.41,0,8.02,3.61,8.02,8.02v93.01s89.8,0,89.8,0v-93.01c0-4.41,3.61-8.02,8.02-8.02h30.87s0-.4,0-.4Z"
                            style={{ fill: '#fff', strokeWidth: '0px' }}
                        />
                    </g>
                </svg>
            ),
        },
        {
            inventory: (
                <svg
                    key={text}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-10"
                    viewBox="-8 -8 35 34.25">
                    <circle cx="9.5" cy="9.125" r="16" fill="white" />
                    <rect
                        x=".2681"
                        y="15.3634"
                        width="7.1756"
                        height="1.7875"
                        fill="#f2f4f7"
                        stroke="#022450"
                        strokeMiterlimit="10"
                        strokeWidth="0.25px"
                    />
                    <rect
                        x="11.9577"
                        y="15.3634"
                        width="7.1756"
                        height="1.7875"
                        fill="#f2f4f7"
                        stroke="#022450"
                        strokeMiterlimit="10"
                        strokeWidth="0.25px"
                    />
                    <path
                        d="M15.4984,9.1277l1.4943-7.5975c.0066-.0338-.0109-.0678-.0426-.0817L13.9446.125c-.0026-.0012-.0054-.0005-.0081-.0014-.0036-.0011-.0065-.0011-.0102-.0017-.016-.0026-.0319-.0009-.0462.007-.0009.0005-.0019-.0001-.0028.0004-.0001,0-.0021.0012-.0024.0014,0,0-.0001,0-.0002,0,0,0,0,0,0,0-.0412.0243-1.711.9955-4.1739.9955C7.24,1.1263,5.5679.155,5.5268.1308c0,0,0,0,0,0,0,0-.0001,0-.0002,0-.0003-.0002-.0023-.0013-.0024-.0014-.0009-.0006-.002,0-.0029-.0004-.0141-.0077-.0299-.0094-.0459-.0069-.0038.0006-.0069.0005-.0106.0017-.0026.0008-.0054.0002-.0079.0013l-3.0056,1.3236c-.0316.014-.0492.0479-.0426.0817l1.4943,7.5975L.1481,12.1682c-.0173.0141-.0273.0351-.0273.0573v7.8217c0,.0406.0331.0737.0737.0737h8.1825c.0196,0,.0383-.0078.0521-.0216l1.2716-1.2716,1.2716,1.2716c.0138.0138.0325.0216.0521.0216h8.1825c.0406,0,.0737-.0331.0737-.0737v-7.8217c0-.0222-.0101-.0432-.0273-.0573l-3.7548-3.0404ZM9.9007,15.1208l-.1263-7.6558c.4834-.1725,4.164-1.6693,4.2137-7.1599l2.8488,1.2545-1.4914,7.5832c-.0055.0268.0046.0544.0259.0715l3.6294,2.9065.1,3M9.7007,1.2736c2.1585,0,3.7208-.7367,4.1378-.9558-.0575,5.5134-3.8279,6.9121-4.1379,7.017-.3103-.1047-4.0803-1.4989-4.1378-7.017.417.2191,1.9793.9558,4.1378.9558ZM.3507,15.1208v-3l3.6794-2.9065c.0213-.0171.0314-.0447.0259-.0715L2.5645,1.5596,5.4134.3051c.0498,5.488,3.7275,6.9862,4.2137,7.16l.0737,7.6557h-2M.2681,15.3634h7.1756v1.7875H.2681v-1.7875ZM9.627,18.6929l-1.2806,1.2806H.2681v-2.6753h7.183c.0363.2613.2589.4638.53.4638h1.6459v.931ZM7.9811,17.6146c-.2152,0-.3901-.1749-.3901-.3901v-1.9348c0-.2152.1749-.3904.3901-.3904h1.7189s.0004.0003.0007.0003.0004-.0003.0007-.0003h1.7189c.2152,0,.3901.1752.3901.3904v1.9348c0,.2152-.1749.3901-.3901.3901h-3.4392ZM19.1333,19.9735h-8.0784l-1.2806-1.2806v-.931h1.6459c.2711,0,.4937-.2025.53-.4638h7.183v2.6753ZM19.1333,17.1509h-7.1756v-1.7875h7.1756v1.7875Z"
                        fill="#022450"
                        stroke="#022450"
                        strokeMiterlimit="10"
                        strokeWidth="0.25px"
                    />
                    <path
                        d="M7.9811,17.6146c-.2152,0-.3901-.1749-.3901-.3901v-1.9348c0-.2152.1749-.3904.3901-.3904h1.7189s.0004.0003.0007.0003.0004-.0003.0007-.0003h1.7189c.2152,0,.3901.1752.3901.3904v1.9348c0,.2152-.1749.3901-.3901.3901h-3.4392Z"
                        fill="#f2f4f7"
                        stroke="#022450"
                        strokeMiterlimit="10"
                        strokeWidth="0.25px"
                    />
                    <circle
                        cx="9.5"
                        cy="9.125"
                        r="16"
                        fill="none"
                        stroke="#022450"
                        strokeWidth="0.7792"
                    />
                </svg>
            ),
        },
        {
            cross_icon: (
                <svg
                    key={text}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    className="-ml-1.5 mr-2 h-7 w-7">
                    <path
                        fill="#f78f8f"
                        d="M7.5 0.5A7 7 0 1 0 7.5 14.5A7 7 0 1 0 7.5 0.5Z"
                    />
                    <path
                        fill="#c74343"
                        d="M7.5,1C11.084,1,14,3.916,14,7.5S11.084,14,7.5,14S1,11.084,1,7.5S3.916,1,7.5,1 M7.5,0 C3.358,0,0,3.358,0,7.5S3.358,15,7.5,15S15,11.642,15,7.5S11.642,0,7.5,0L7.5,0z"
                    />
                    <path
                        fill="#fff"
                        d="M7 3.5H8V11.5H7z"
                        transform="rotate(45.001 7.5 7.5)"
                    />
                    <path
                        fill="#fff"
                        d="M7 3.5H8V11.5H7z"
                        transform="rotate(134.999 7.5 7.5)"
                    />
                </svg>
            ),
        },
    ]

    const theme = [
        {
            primary: ` group shadow-[0_0_12px_0] shadow-slblue-900/40 inline-flex justify-center items-center rounded-md bg-slblue-800 p-3 sm:ml-2 whitespace-nowrap text-sllightblue-50 hover:bg-white hover:text-sldarkblue-1000 border-1 border-sldarkblue-1000`,
        },
        {
            primaryWithColor: ` group shadow-[0_0_12px_0] shadow-${props.color}-900/40 m-[1px] inline-flex justify-center items-center rounded-md bg-${props.color}-200 px-3 py-2 text-sm text-${props.color}-700 hover:bg-${props.color}-100 hover:text-${props.color}-700 border-1 border-${props.color}-700`,
        },
        {
            secondary: ` m-[1px] inline-flex justify-center items-center mr-4 rounded-md bg-${props.color}-100 px-3 py-2 text-sm text-${props.color}-800 hover:bg-white hover:text-${props.color}-800 border-1 border-${props.color}-800`,
        },
        {
            info: ` group shadow-[0_0_12px_0] shadow-slblue-900/40 inline-flex justify-center items-center mr-4 rounded-md bg-white px-3 py-2 text-sm text-slblue-900 hover:bg-white hover:text-sllightblue-600 border-1 border-slblue-300`,
        },
        {
            text: ` group inline-flex justify-center items-center mr-4 text-xs font-inter text-${props.color ? props.color : 'slblue'}-700 dark:text-white`,
        },
        {
            delete: ` group inline-flex justify-center items-center mr-4 text-xs font-inter text-slred-1000 dark:text-white`,
        },
    ]
    return (
        <>
            {props.link === undefined ? (
                <Button
                    isDisabled={
                        props.isDisabled === undefined
                            ? false
                            : props.isDisabled
                    }
                    className={`${props.className !== undefined ? props.className : ''} ${props.type && theme.filter((item: any) => item[props.type]).map((item: any) => item[props.type])}`}
                    onPress={props.action}>
                    {props.icon &&
                        icons
                            .filter((item: any) => item[props.icon])
                            .map((item: any) => item[props.icon])}
                    {props.counter > 0 && (
                        <span
                            className={`mr-2 text-${props.counterColor ? props.counterColor : 'rose'}-800 border text-xs rounded-full w-5 h-5 flex bg-${props.counterColor ? props.counterColor : 'rose'}-50 items-center justify-center border-${props.counterColor ? props.counterColor : 'rose'}-800`}>
                            {props.counter}
                        </span>
                    )}
                    {props.text}
                </Button>
            ) : (
                <Link
                    href={props.link}
                    className={`${props.className !== undefined ? props.className : ''} ${props.type === 'text' ? 'inline-flex justify-center items-center' : 'block'}`}>
                    <Button
                        isDisabled={
                            props.isDisabled === undefined
                                ? false
                                : props.isDisabled
                        }
                        className={`${props.className !== undefined ? props.className : ''} ${props.type && theme.filter((item: any) => item[props.type]).map((item: any) => item[props.type])}`}
                        onPress={props.action}>
                        {props.icon &&
                            icons
                                .filter((item: any) => item[props.icon])
                                .map((item: any) => item[props.icon])}
                        {props.counter > 0 && (
                            <span
                                className={`mr-2 text-${props.counterColor ? props.counterColor : 'rose'}-800 border text-xs rounded-full w-5 h-5 flex bg-${props.counterColor ? props.counterColor : 'rose'}-50 items-center justify-center border-${props.counterColor ? props.counterColor : 'rose'}-800`}>
                                {props.counter}
                            </span>
                        )}
                        {props.text}
                    </Button>
                </Link>
            )}
        </>
    )
}

export const FooterWrapper = (props: any) => {
    return (
        <>
            {props.noBorder ? (
                <div className="py-4 md:mb-0"></div>
            ) : (
                <hr className="mb-24 md:mb-16" />
            )}
            <div
                className={`${props.parentClassName} fixed ${props.bottom ? `bottom-${props.bottom} lg:bottom-0 md:bottom-0` : 'lg:bottom-0 bottom-12 md:bottom-0'} w-full lg:w-4/5 md:w-100 md:right-6 right-[0.2rem] px-2 xl:px-12 lg:pl-7 lg:pr-8 md:pl-[4.7rem] md:pr-5 xl:bg-slblue-50 xl:shadow-2xl xl:rounded-t-lg xl:border-t xl:border-t-slblue-100 xl:border-r xl:border-r-sllightblue-50 xl:border xl:dark:bg-sldarkblue-900 xl:dark:border-slblue-200 mb-8 sm:mb-12 md:mb-0`}>
                <div
                    className={`${props.className} flex justify-end lg:px-8 md:px-8 px-2 pb-4 pt-4 w-full bg-slblue-50 xl:bg-transparent shadow-2xl rounded-t-lg border-t xl:border-0 border-t-slblue-100 border-r border-r-sllightblue-50 border dark:bg-sldarkblue-900 dark:border-slblue-200`}>
                    {props.children}
                </div>
            </div>
        </>
    )
}

export const AlertDialog = (props: any) => {
    return (
        <DialogTrigger
            isOpen={props.openDialog}
            onOpenChange={props.setOpenDialog}>
            {/* z-[15001] - To make this dialog appear on top of the sliding sidebar */}
            <ModalOverlay
                className={`${props.wrapperClassName} fixed inset-0 z-[15001] overflow-y-auto bg-black/25 h-screen flex items-center justify-center p-4 text-center backdrop-blur`}>
                <Modal
                    className={`${props.className} w-full max-w-md md:max-w-5xl rounded-lg max-h-full my-4 bg-white dark:bg-sldarkblue-800 text-left align-middle shadow-xl`}>
                    <Dialog
                        role="alertdialog"
                        className="outline-none relative">
                        {({ close }) => (
                            <div
                                className={`flex justify-center flex-col px-6 py-6 bg-white dark:bg-sldarkblue-800 border rounded-lg border-slblue-800`}>
                                {props.children}
                                {props.actionText !== undefined && (
                                    <>
                                        <hr className="my-6" />
                                        <div className="flex justify-end">
                                            {!props.noCancel && (
                                                <SeaLogsButton
                                                    text="Cancel"
                                                    type="text"
                                                    action={close}
                                                />
                                            )}
                                            {props.deleteText && (
                                                <SeaLogsButton
                                                    text={props.deleteText}
                                                    color="slred"
                                                    type="secondary"
                                                    icon="trash"
                                                    action={props.handleDelete}
                                                />
                                            )}
                                            <SeaLogsButton
                                                text={props.actionText}
                                                color="slblue"
                                                type="primary"
                                                icon="check"
                                                action={props.handleCreate}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    )
}

export const DailyCheckField = (props: any) => {
    const [yes, setYes] = useState(props.defaultYesChecked)
    const [No, setNo] = useState(props.defaultNoChecked)

    function callyes() {
        props.handleYesChange()
        setYes(true)
        setNo(false)
    }
    function callNo() {
        props.handleNoChange()
        setNo(true)
        setYes(false)
    }
    const classes = {
        fieldWrapper:
            'flex flex-row gap-2 my-4 text-left items-center justify-between',
        inputWrapper: 'flex flex-row gap-2 justify-start items-center',
        radio: 'flex flex-row gap-1 items-center text-sm lg:text-base',
        radioInput:
            'w-6 h-6 bg-slblue-100 border-slblue-200 dark:ring-offset-slblue-800 dark:bg-slblue-700 dark:border-slblue-600',
        radioLabel: 'text-2xs',
        textarea:
            'block p-2.5 w-full mt-4 text-sm text-slblue-000 bg-slblue-50 rounded-lg border border-slblue-400 focus:ring-slblue-500 focus:border-slblue-500 dark:bg-slblue-700 dark:border-white dark:placeholder-slblue-400 dark:text-white dark:focus:ring-slblue-500 dark:focus:border-slblue-500',
        label: `font-light text-2xs uppercase font-inter`,
    }
    return (
        <div
            className={`dailyCheckField ${classes.fieldWrapper} ${props.displayField ? '' : 'hidden'} ${props.className}`}>
            <div className={`${classes.inputWrapper} `}>
                <span className="text-sm lg:text-base">
                    {props.displayLabel}
                </span>
                {props.displayDescription && (
                    <SeaLogsButton
                        icon="alert"
                        className="w-6 h-6 sup -mt-2 ml-0.5"
                        action={() => {
                            props.setDescriptionPanelContent(
                                props.displayDescription,
                            )
                            props.setOpenDescriptionPanel(true)
                            props.setDescriptionPanelHeading(props.displayLabel)
                        }}
                    />
                )}
            </div>
            <div className={`${classes.inputWrapper}`}>
                <div
                    className={`${classes.radio} ${props.locked ? 'pointer-events-none opacity-60' : ''}`}>
                    <div className="md:w-8 md:h-8 w-6 h-6">
                        {No ? (
                            <img
                                className="bg-slblue-50 ring-1 ring-slblue-200 p-0.5 rounded-full"
                                src="/sealogs-not-ok-check1.svg"
                                alt=""
                            />
                        ) : (
                            <img
                                className="bg-slblue-50 ring-1 ring-slblue-200 p-0.5 rounded-full"
                                src="/sealogs-empty-check.svg"
                                alt=""
                                onClick={() => callNo()}
                            />
                        )}
                    </div>
                    <input
                        id={`${props.inputId}-no_radio`}
                        type="radio"
                        name={`${props.inputId}-radio`}
                        onChange={() => callNo()}
                        className={classes.radioInput + ' ' + 'hidden'}
                        defaultChecked={props.defaultNoChecked}
                    />
                    <label
                        htmlFor={`${props.inputId}-no_radio`}
                        className={classes.radioLabel + ' ' + 'cursor-pointer'}>
                        No
                    </label>
                </div>
                <div
                    className={`${classes.radio} ${props.locked ? 'pointer-events-none opacity-60' : ''}`}>
                    <div className="md:w-8 md:h-8 w-6 h-6">
                        {yes ? (
                            <img
                                className="bg-slblue-50 ring-1 ring-slblue-200 p-0.5 rounded-full"
                                src="/sealogs-ok-check.svg"
                                alt=""
                            />
                        ) : (
                            <img
                                className="bg-slblue-50 ring-1 ring-slblue-200 p-0.5 rounded-full"
                                src="/sealogs-empty-check.svg"
                                alt=""
                                onClick={() => callyes()}
                            />
                        )}
                    </div>
                    <input
                        id={`${props.inputId}-yes_radio`}
                        type="radio"
                        name={`${props.inputId}-radio`}
                        onChange={() => callyes()}
                        className={classes.radioInput + ' ' + 'hidden'}
                        defaultChecked={props.defaultYesChecked}
                    />
                    <label
                        htmlFor={`${props.inputId}-yes_radio`}
                        className={classes.radioLabel + ' ' + 'cursor-pointer'}>
                        Yes
                    </label>
                </div>
                <Button
                    className="text-slblue-800 -mt-4"
                    onPress={props.commentAction}>
                    {props.comment ? (
                        <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-sllightblue-800 dark:text-white" />
                    ) : (
                        <ChatBubbleBottomCenterIcon className="w-6 h-6 text-slblue-500 dark:text-white" />
                    )}
                </Button>
            </div>
        </div>
    )
}

export const CustomDailyCheckField = (props: any) => {
    const [yes, setYes] = useState(props.defaultYesChecked)
    const [No, setNo] = useState(props.defaultNoChecked)

    function callyes() {
        props.handleYesChange()
        setYes(true)
        setNo(false)
    }
    function callNo() {
        props.handleNoChange()
        setNo(true)
        setYes(false)
    }
    const classes = {
        fieldWrapper: 'flex flex-row items-center my-2',
        inputWrapper: 'flex flex-row gap-2 justify-between',
        inputWrapperInner: 'flex flex-row gap-2 justify-between items-center',
        radio: 'flex flex-row items-center gap-1',
        radioInput:
            'w-6 h-6 text-slblue-600 bg-slblue-100 border-slblue-200 dark:ring-offset-slblue-800 dark:bg-slblue-700 dark:border-slblue-600',
        radioLabel: 'text-2xs',
        textarea:
            'block p-2.5 w-full mt-4 text-sm text-slblue-000 bg-slblue-50 rounded-lg border border-slblue-400 focus:ring-slblue-500 dark:focus:border-slblue-500',
        label: `font-light text-2xs uppercase font-inter`,
    }
    return (
        <div
            className={`customDailyCheck my-4 ${classes.fieldWrapper} ${props.displayField ? '' : 'hidden'} ${props.className} w-full gap-2 justify-between`}>
            <span className="text-sm lg:text-base text-left">
                {props.displayLabel}
            </span>
            {props.displayDescription && (
                <SeaLogsButton
                    icon="alert"
                    action={() => {
                        props.setDescriptionPanelContent(
                            props.displayDescription,
                        )
                        props.setOpenDescriptionPanel(true)
                        props.setDescriptionPanelHeading(props.displayLabel)
                    }}
                />
            )}
            <div className={`${classes.inputWrapper}`}>
                <div
                    className={`${classes.radio} ${props.locked ? 'pointer-events-none opacity-60' : ''}`}>
                    <div className="md:w-8 md:h-8 w-6 h-6">
                        {No ? (
                            <img
                                className="bg-slblue-50 ring-1 ring-slblue-200 p-0.5 rounded-full"
                                src="/sealogs-not-ok-check1.svg"
                                alt=""
                            />
                        ) : (
                            <img
                                className="bg-slblue-50 ring-1 ring-slblue-200 p-0.5 rounded-full"
                                src="/sealogs-empty-check.svg"
                                alt=""
                                onClick={() => callNo()}
                            />
                        )}
                        <input
                            id={`${props.inputId}-no_radio`}
                            type="radio"
                            name={`${props.inputId}-radio`}
                            onChange={() => callNo()}
                            className={classes.radioInput + ' ' + 'hidden'}
                            defaultChecked={props.defaultNoChecked}
                        />
                    </div>
                    <label
                        htmlFor={`${props.inputId}-no_radio`}
                        className={classes.radioLabel + ' ' + 'cursor-pointer'}>
                        No
                    </label>
                </div>
                <div
                    className={`${classes.radio} ${props.locked ? 'pointer-events-none opacity-60' : ''}`}>
                    <div className="md:w-8 md:h-8 w-6 h-6">
                        {yes ? (
                            <img
                                className="bg-slblue-50 ring-1 ring-slblue-200 p-0.5 rounded-full"
                                src="/sealogs-ok-check.svg"
                                alt=""
                            />
                        ) : (
                            <img
                                className="bg-slblue-50 ring-1 ring-slblue-200 p-0.5 rounded-full"
                                src="/sealogs-empty-check.svg"
                                alt=""
                                onClick={() => callyes()}
                            />
                        )}
                    </div>
                    <input
                        id={`${props.inputId}-yes_radio`}
                        type="radio"
                        name={`${props.inputId}-radio`}
                        onChange={() => callyes()}
                        className={classes.radioInput + ' ' + 'hidden'}
                        defaultChecked={props.defaultYesChecked}
                    />
                    <label
                        htmlFor={`${props.inputId}-yes_radio`}
                        className={classes.radioLabel + ' ' + 'cursor-pointer'}>
                        Yes
                    </label>
                </div>
                <Button
                    className="text-slblue-800 -mt-4"
                    onPress={props.commentAction}>
                    {props.comment ? (
                        <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-slightblue-800 dark:text-white" />
                    ) : (
                        <ChatBubbleBottomCenterIcon className="w-6 h-6 text-slblue-500 dark:text-white" />
                    )}
                </Button>
            </div>
        </div>
    )
}

export const DailyCheckGroupField = (props: any) => {
    const [yes, setYes] = useState(props.defaultYesChecked)
    const [No, setNo] = useState(props.defaultNoChecked)

    function callyes() {
        props.handleYesChange()
        setYes(true)
        setNo(false)
    }
    function callNo() {
        props.handleNoChange()
        setNo(true)
        setYes(false)
    }
    const classes = {
        fieldWrapper:
            'flex flex-row gap-2 text-left items-center justify-between',
        inputWrapper: 'flex flex-row gap-2 justify-start items-center',
        radio: 'flex flex-row gap-1 items-center ',
        radioInput:
            'w-6 h-6 bg-slblue-100 border-slblue-300 dark:ring-offset-slblue-800 dark:bg-slblue-700 dark:border-slblue-600',
        radioLabel: 'text-2xs',
        textarea:
            'block p-2.5 w-full mt-4 text-sm text-slblue-800 bg-slblue-50 rounded-lg border border-slblue-300 focus:ring-slblue-500 focus:border-slblue-500 dark:bg-slblue-700 dark:border-white dark:placeholder-slblue-400 dark:text-white dark:focus:ring-slblue-500 dark:focus:border-slblue-500',
        label: `font-light text-2xs uppercase font-inter`,
    }
    return (
        <div
            className={`dailyCheckGroup ${classes.fieldWrapper} ${props.displayField ? '' : ''} ${props.className}`}>
            {/* <div className={`${classes.inputWrapper} `}>
                {props.displayLabel}
                {props.displayDescription && (
                        <SeaLogsButton
                            icon="alert"
                            action={() => {
                                props.setDescriptionPanelContent(
                                    props.displayDescription,
                                )
                                props.setOpenDescriptionPanel(true)
                                props.setDescriptionPanelHeading(
                                    props.displayLabel,
                                )
                            }}
                        />
                )}
            </div> */}
            <div className={`gap-2 flex`}>
                <div
                    className={`${classes.radio} ${props.locked ? 'pointer-events-none opacity-60' : ''}`}>
                    <div className="md:w-8 md:h-8 w-6 h-6">
                        {No ? (
                            <img
                                className="bg-slblue-50 ring-1 ring-slblue-200 p-0.5 rounded-full"
                                src="/sealogs-not-ok-check1.svg"
                                alt=""
                            />
                        ) : (
                            <img
                                className="bg-slblue-50 ring-1 ring-slblue-200 p-0.5 rounded-full"
                                src="/sealogs-empty-check.svg"
                                alt=""
                                onClick={() => callNo()}
                            />
                        )}
                    </div>
                    <input
                        id={`${props.inputId}-no_radio`}
                        type="radio"
                        name={`${props.inputId}-radio`}
                        onChange={() => callNo()}
                        className={classes.radioInput + ' ' + 'hidden'}
                        defaultChecked={props.defaultNoChecked}
                    />
                    <label
                        htmlFor={`${props.inputId}-no_radio`}
                        className={classes.radioLabel + ' ' + 'cursor-pointer'}>
                        No
                    </label>
                </div>
                <div
                    className={`${classes.radio} ${props.locked ? 'pointer-events-none opacity-60' : ''}`}>
                    <div className="md:w-8 md:h-8 w-6 h-6">
                        {yes ? (
                            <img
                                className="bg-slblue-50 ring-1 ring-slblue-200 p-0.5 rounded-full"
                                src="/sealogs-ok-check.svg"
                                alt=""
                            />
                        ) : (
                            <img
                                className="bg-slblue-50 ring-1 ring-slblue-200 p-0.5 rounded-full"
                                src="/sealogs-empty-check.svg"
                                alt=""
                                onClick={() => callyes()}
                            />
                        )}
                    </div>
                    <input
                        id={`${props.inputId}-yes_radio`}
                        type="radio"
                        name={`${props.inputId}-radio`}
                        onChange={() => callyes()}
                        className={classes.radioInput + ' ' + 'hidden'}
                        defaultChecked={props.defaultYesChecked}
                    />
                    <label
                        htmlFor={`${props.inputId}-yes_radio`}
                        className={classes.radioLabel + ' ' + 'cursor-pointer'}>
                        Yes
                    </label>
                </div>
                <Button
                    className="text-slblue-800 -mt-4"
                    onPress={props.commentAction}>
                    {props.comment ? (
                        <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-sllightblue-800 dark:text-white" />
                    ) : (
                        <ChatBubbleBottomCenterIcon className="w-6 h-6 text-slblue-500 dark:text-white" />
                    )}
                </Button>
            </div>
        </div>
    )
}
