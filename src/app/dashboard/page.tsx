'use client'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
// import { useLazyQuery } from '@apollo/client'
import DashboardStatus from '../ui/dashboard/status'
// import MobileSwipper from '../ui/dashboard/mobileSwiper'
// import VesselsList from '../ui/vessels/list'
// import CrewList from '../ui/crew/list'
// import LogBook from '../ui/logbook/log-book'
// import CrewView from '../ui/crew/view'
// import EngineConfiguration from '../ui/configurations/engine'
// import Loading from '../loading'
// import Link from 'next/link'
// import {
//     InitilizeConfigIndexedDB,
//     UpdateVesselConfigById,
// } from '@/helpers/indexeddb-helper'
// import { GET_VESSEL_CONFIG, VESSEL_LIST } from '../lib/graphQL/query'
import packageJson from '../../../package.json'
import forceLogoutOnce from '../components/ForceLogoutOnce'

const Dashboard = (props: any) => {
    const router = useRouter()
    forceLogoutOnce('2411081630', () => {
        router.push('/logout')
    })
    const [isLoading, setIsLoading] = useState(true)
    // const [sidebarOption, setSidebarOption] = useState({
    //     sidebarClass: 'w-64 hidden md:block',
    //     menuIconDisplay: true,
    // })
    const [navTab, setNavTab] = useState('dashboard')
    // const [vesselId, setVesselId] = useState(0)
    // const [indexedDB, setIndexedDB] = useState({} as any)
    const [clientTitle, setClientTitle] = useState('')

    useEffect(() => {
        if (isLoading) {
            setClientTitle(localStorage.getItem('clientTitle') || '')
            // init()
            setIsLoading(false)
        }
    }, [isLoading])

    // const init = async () => {
    //     if (navTab.includes('vessel-info')) {
    //         const vId = +(navTab.match(/\d+$/)?.[0] || 0)
    //         setVesselId(vId)
    //         setNavTab('vessel')
    //     }

    //     await handleInitVesselConfig()
    // }

    // const handleInitVesselConfig = async () => {
    //     const vesselConfigIDB = await InitilizeConfigIndexedDB()
    //     setIndexedDB(vesselConfigIDB)
    //     await getVesselsQuery()
    // }

    // const handleStoreVesslConfig = async (vesselLists: any) => {
    //     if (vesselLists && vesselLists.length > 0) {
    //         for (let i in vesselLists) {
    //             setVesselId(vesselLists[i].ID)
    //             await getLogBookConfigByID({
    //                 variables: {
    //                     vesselID: vesselLists[i].ID,
    //                 },
    //             })
    //         }
    //     }
    // }

    // const [
    //     getVesselsQuery,
    //     {
    //         data: getVesselsQueryData,
    //         loading: getVesselsQueryLoading,
    //         error: getVesselsQueryError,
    //     },
    // ] = useLazyQuery(VESSEL_LIST, {
    //     onCompleted: async (getVesselsQueryResponse: any) => {
    //         // if (getVesselsQueryResponse.readVessels) {
    //         //     handleStoreVesslConfig(
    //         //         getVesselsQueryResponse.readVessels.nodes,
    //         //     )
    //         // }
    //         return null
    //     },
    // })

    // const [
    //     getLogBookConfigByID,
    //     {
    //         data: getLogBookConfigByIDData,
    //         loading: getLogBookConfigByIDLoading,
    //         error: getLogBookConfigByIDError,
    //     },
    // ] = useLazyQuery(GET_VESSEL_CONFIG, {
    //     onCompleted: async (getLogBookConfigByIDResponse: any) => {
    //         if (
    //             getLogBookConfigByIDResponse.getLogBookConfiguration.isSuccess
    //         ) {
    //             const config =
    //                 getLogBookConfigByIDResponse.getLogBookConfiguration.data
    //                     .LogBookConfig
    //             await UpdateVesselConfigById(vesselId, config, indexedDB)
    //         }
    //     },
    // })

    return (
        <>
            <div className='w-full flex flex-col gap-4 xl:w-[calc(100vw_*_0.80)] lg:w-[calc(100vw_*_0.90)]'>

                <div className="flex-col items-end font-light leading-4 px-2 hidden md:flex dark:text-slblue-200">
                    <h1 className="text-2xl">{clientTitle}</h1>
                    <h6 className="text-[9px]">powered by SeaLogs</h6>
                </div>
                <div className="flex h-full-screen items-center justify-center">
                    {navTab === 'dashboard' && (
                        <div className="block w-full">
                            <DashboardStatus setNavTab={setNavTab} />
                        </div>
                    )}
                </div>
                <div className="fixed bottom-0 right-0 p-2 text-small text-slblue-200">
                    v{packageJson.version}
                </div>
            </div>
        </>
    )
}

export default Dashboard
