'use client'
import React, { useEffect, useState } from 'react'
import { Vessel } from '../../../../types/vessel'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import VesselsCard from '@/app/ui/dashboard/vessel-card'
import { getVesselList } from '@/app/lib/actions'
import dynamic from 'next/dynamic'
import { useLazyQuery } from '@apollo/client'
import { READ_ONE_SEALOGS_MEMBER } from '@/app/lib/graphQL/query'

export default function MobileSwipper(props: any) {
    const [vesselList, setVesselList] = useState<Vessel[]>([])
    const [filteredVesselList, setFilteredVesselList] = useState<Vessel[]>([])
    const [inventories, setInventories] = useState<any>([])
    const [currentDepartment, setCurrentDepartment] = useState<any>(false)

    const [querySeaLogsMembers] = useLazyQuery(READ_ONE_SEALOGS_MEMBER, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneSeaLogsMember
            if (data) {
                setCurrentDepartment(
                    data.departments.nodes.flatMap(
                        (department: any) => department.basicComponents.nodes,
                    ),
                )
                if (
                    data.departments.nodes.flatMap(
                        (department: any) => department.basicComponents.nodes,
                    ).length === 0
                ) {
                    setCurrentDepartment(true)
                }
            }
        },
        onError: (error: any) => {
            console.error('querySeaLogsMembers error', error)
        },
    })

    useEffect(() => {
        querySeaLogsMembers({
            variables: {
                filter: { id: { eq: +(localStorage.getItem('userId') ?? 0) } },
            },
        })
    }, [])

    useEffect(() => {
        if (currentDepartment && vesselList) {
            if (currentDepartment === true) {
                setFilteredVesselList(vesselList)
            } else {
                setFilteredVesselList(
                    vesselList.filter((vessel: any) =>
                        currentDepartment.some(
                            (department: any) => department.id === vessel.id,
                        ),
                    ),
                )
            }
        }
    }, [currentDepartment, vesselList])

    const handleSetVessels = (vessels: any) => {
        const activeVessels = vessels.filter((vessel: any) => !vessel.archived)
        setVesselList(activeVessels)
    }

    getVesselList(handleSetVessels)

    return (
        <>
            <div className="w-full p-0 overflow-hidden bg-transparent">
                <div className="relative overflow-hidden">
                    <div>
                        <Swiper
                            spaceBetween={0}
                            modules={[Pagination]}
                            className="Vessels dark:bg-sldarkblue-1000 !pb-16 max-w-fit"
                            pagination={{
                                clickable: true,
                                bulletClass: `swiper-pagination-bullet swiper-pagination-testClass !bg-slblue-1000`,
                            }}>
                            {filteredVesselList
                                .filter((vessel: any) => vessel.showOnDashboard)
                                .map((vessel) => (
                                    <SwiperSlide key={vessel.id}>
                                        <VesselsCard vessel={vessel} />
                                    </SwiperSlide>
                                ))}
                        </Swiper>
                    </div>
                </div>
            </div>
        </>
    )
}
