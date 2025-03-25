'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heading } from 'react-aria-components'
import { List } from '@/app/ui/skeletons'
import { TableWrapper, SeaLogsButton } from '@/app/components/Components'
import { getCrewDuties } from '@/app/lib/actions'
import { preventCrewAccess } from '@/app/helpers/userHelper'

const CrewDutyList = () => {
    const [crewDuties, setCrewDuties] = useState([])

    const handleSetDuties = (duties: any) => {
        const activeDuties = duties.filter((duty: any) => !duty.Archived)
        setCrewDuties(activeDuties)
    }
    getCrewDuties(handleSetDuties)

    useEffect(() => {
        preventCrewAccess()
    }, [])
    return (
        <div className="w-full p-0">
            <div className="flex justify-between items-center">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    Crew Duties
                </Heading>
                <SeaLogsButton
                    link={`/settings/crew-duty/create`}
                    text="New Crew Duty"
                    color="sky"
                    type="primary"
                    icon="check"
                />
            </div>
            <div className="pt-4">
                <div className="flex w-full justify-start flex-col md:flex-row items-start">
                    {!crewDuties ? (
                        <List />
                    ) : (
                        <TableWrapper
                            headings={['Title:firstHead', 'Abbreviation']}>
                            {crewDuties.map((crewDuty: any) => (
                                <tr
                                    key={crewDuty.id}
                                    className={`group border-b dark:border-gray-400 hover:bg-white dark:text-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                    <td className="pl-2 py-3 lg:px-6 text-left">
                                        <Link
                                            href={`/settings/crew-duty/edit?id=${crewDuty.id}`}
                                            className="group-hover:text-emerald-600">
                                            {crewDuty.title}
                                        </Link>
                                    </td>
                                    <td className="px-2">
                                        {crewDuty.abbreviation}
                                    </td>
                                </tr>
                            ))}
                        </TableWrapper>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CrewDutyList
