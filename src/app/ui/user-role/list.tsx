'use client'
import { SeaLogsButton, TableWrapper } from '@/app/components/Components'
import { useEffect, useState } from 'react'
import { Heading } from 'react-aria-components'
import { List } from '../skeletons'
import Link from 'next/link'
import { getSeaLogsGroups } from '@/app/lib/actions'
import { preventCrewAccess } from '@/app/helpers/userHelper'

const UserRoleList = () => {
    const [userRoles, setUserRoles] = useState([])
    getSeaLogsGroups(setUserRoles)

    useEffect(() => {
        preventCrewAccess()
    }, [])
    return (
        <div className="w-full p-0">
            <div className="flex justify-between items-center">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    User Roles
                </Heading>
                <SeaLogsButton
                    link={`/settings/user-role/create`}
                    text="New User Role"
                    color="sky"
                    type="primary"
                    icon="check"
                />
            </div>
            <div className="pt-4">
                <div className="flex w-full justify-start flex-col md:flex-row items-start">
                    {!userRoles ? (
                        <List />
                    ) : (
                        <TableWrapper
                            headings={[
                                'Role:firstHead',
                                'Code',
                                'Description',
                            ]}>
                            {userRoles.map((userRole: any) => (
                                <tr
                                    key={userRole.id}
                                    className={`group border-b dark:border-gray-400 hover:bg-white dark:text-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                    <td className="pl-2 py-3 lg:px-6">
                                        <Link
                                            href={`/settings/user-role/edit?id=${userRole.id}`}
                                            className="group-hover:text-emerald-600">
                                            {userRole.title}
                                        </Link>
                                    </td>
                                    <td className="px-2">{userRole.code}</td>
                                    <td className="px-2">
                                        {userRole.description}
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

export default UserRoleList
