'use client'
import { useEffect, useState } from 'react'
import {
    GetCrewListWithTrainingStatus,
    getLogBookEntryByID,
} from '@/app/lib/actions'
import { useLazyQuery } from '@apollo/client'
import {
    CrewMembers_LogBookEntrySection,
    GET_LOGBOOKENTRY,
    TripReport_LogBookEntrySection,
} from '@/app/lib/graphQL/query'

export default function VesselPOB({ vessel = false }: { vessel: any }) {
    // const [pob, setPOB] = useState<number>(0)
    // const [crewMembers, setCrewMembers] = useState<any>(false)

    // const handleSetLogbook = (logbook: any) => {
    //     const sectionTypes = Array.from(
    //         new Set(
    //             logbook.logBookEntrySections.nodes.map(
    //                 (sec: any) => sec.className,
    //             ),
    //         ),
    //     ).map((type) => ({
    //         className: type,
    //         ids: logbook.logBookEntrySections.nodes
    //             .filter((sec: any) => sec.className === type)
    //             .map((sec: any) => sec.id),
    //     }))
    //     sectionTypes.forEach((section: any) => {
    //         if (
    //             section.className === 'SeaLogs\\TripReport_LogBookEntrySection'
    //         ) {
    //             getSectionTripReport_LogBookEntrySection({
    //                 variables: {
    //                     id: section.ids,
    //                 },
    //             })
    //         }
    //         if (
    //             section.className === 'SeaLogs\\CrewMembers_LogBookEntrySection'
    //         ) {
    //             const searchFilter: SearchFilter = {}
    //             searchFilter.id = { in: section.ids }
    //             getSectionCrewMembers_LogBookEntrySection({
    //                 variables: {
    //                     filter: searchFilter,
    //                 },
    //             })
    //         }
    //     })
    // }

    // const [getSectionCrewMembers_LogBookEntrySection] = useLazyQuery(
    //     CrewMembers_LogBookEntrySection,
    //     {
    //         fetchPolicy: 'cache-and-network',
    //         onCompleted: (response: any) => {
    //             let data = response.readCrewMembers_LogBookEntrySections.nodes
    //             data = data.map((crew: any) => {
    //                 return {
    //                     ...crew,
    //                     crewMember: GetCrewListWithTrainingStatus(
    //                         [crew.crewMember],
    //                         [vessel],
    //                     )[0],
    //                 }
    //             })
    //             setCrewMembers(data)
    //         },
    //         onError: (error: any) => {
    //             console.error('CrewMembers_LogBookEntrySection error', error)
    //         },
    //     },
    // )

    // const [getSectionTripReport_LogBookEntrySection] = useLazyQuery(
    //     TripReport_LogBookEntrySection,
    //     {
    //         fetchPolicy: 'cache-and-network',
    //         onCompleted: (response: any) => {
    //             const data = response.readTripReport_LogBookEntrySections.nodes
    //             var totalPOB = 0
    //             data.forEach((entry: any) => {
    //                 // if (entry.pob > 0 && entry.pob > totalPOB) {
    //                 totalPOB = entry.pob
    //                 // }
    //             })
    //             setPOB(totalPOB)
    //         },
    //         onError: (error: any) => {
    //             console.error('TripReport_LogBookEntrySection error', error)
    //         },
    //     },
    // )

    // if (vessel && vessel?.logBookEntries?.nodes?.length > 0) {
    //     getLogBookEntryByID(
    //         vessel?.logBookEntries?.nodes[0].id,
    //         handleSetLogbook,
    //     )
    // }

    // const [queryLogBookEntries] = useLazyQuery(GET_LOGBOOKENTRY, {
    //     fetchPolicy: 'cache-and-network',
    //     onCompleted: (response: any) => {
    //         const crew = response.readCrewMembers_LogBookEntrySections.nodes
    //         const entries = response.GetLogBookEntries.nodes
    //         const data = entries.map((entry: any) => {
    //             const crewData = crew.filter(
    //                 (crewMember: any) => crewMember.logBookEntryID === entry.id,
    //             )
    //             return {
    //                 ...entry,
    //                 crew: crewData,
    //             }
    //         })
    //     },
    //     onError: (error: any) => {
    //         console.error('queryLogBookEntries error', error)
    //     },
    // })

    // useEffect(() => {
    //     if (vessel) {
    //         loadLogBookEntries()
    //     }
    // }, [vessel])

    // const loadLogBookEntries = async () => {
    //     await queryLogBookEntries({
    //         variables: {
    //             vesselId: +vessel?.id,
    //         },
    //     })
    // }

    return (
        <span className="text-slblue-1000 border rounded-full flex justify-center items-center w-5 h-5 md:w-9 md:h-9 p-2 bg-slblue-100 border-slblue-1000">
            {vessel.pob}
        </span>
    )
}
